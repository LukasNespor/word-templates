using DocumentFormat.OpenXml.Packaging;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.WebJobs;
using Microsoft.Azure.WebJobs.Extensions.Http;
using Microsoft.Extensions.Logging;
using OpenXmlHelpers.Word;
using server.Code;
using server.Code.Services;
using server.Models;
using System;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Threading.Tasks;

namespace LNE.GenerateDocument
{
    public static class GenerateDocument
    {
        [FunctionName(nameof(GenerateDocument))]
        public static async Task<IActionResult> Run([HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "generate")] GenerateDocumentModel data, ILogger log)
        {
            try
            {
                var container = BlobService.GetContainer(Constants.TemplatesContainerName);
                var blob = container.GetBlockBlobReference(data.BlobName);

                byte[] bytes = null;
                using (var stream = new MemoryStream())
                {
                    await blob.DownloadToStreamAsync(stream);
                    await blob.FetchAttributesAsync();

                    using (WordprocessingDocument doc = WordprocessingDocument.Open(stream, true))
                    {
                        foreach (var field in data.Fields)
                        {
                            if (!string.IsNullOrEmpty(field.Value))
                            {
                                string name = field.Name;
                                if (name.Contains(" "))
                                    name = "\"" + name + "\"";

                                doc.GetMergeFields(name).ReplaceWithText(field.Value);
                            }
                        }

                        var todayField = doc.GetMergeFields("dnes");
                        if (todayField.Any())
                            todayField.ReplaceWithText(DateTime.UtcNow.ToString("d. MMMM yyyy", new CultureInfo("cs")));

                        doc.MainDocumentPart.Document.Save();
                        doc.Close();

                        bytes = new byte[stream.Length];
                        bytes = stream.ToArray();
                    }
                }

                return new FileContentResult(bytes, blob.Properties.ContentType);
            }
            catch (Exception ex)
            {
                log.LogError(ex.ToString());
                throw;
            }
        }
    }
}
