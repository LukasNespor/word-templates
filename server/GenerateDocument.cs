using DocumentFormat.OpenXml.Packaging;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.WebJobs;
using Microsoft.Azure.WebJobs.Extensions.Http;
using Microsoft.Extensions.Logging;
using OpenXmlHelpers.Word;
using server.Code;
using server.Models;
using System;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Linq.Expressions;
using System.Threading.Tasks;

namespace LNE.GenerateDocument
{
    public static class GenerateDocument
    {
        [FunctionName("GenerateDocument")]
        public static async Task<IActionResult> Run([HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = null)] HttpRequest req, ILogger log)
        {
            log.LogInformation("Generating document");

            try
            {
                var data = await Helpers.GetModelFromBodyAsync<GenerateDocumentModel>(req.Body);
                if (data == null)
                    return new BadRequestObjectResult("Posted data are not correct");

                var container = await Helpers.GetContainerAsync(Environment.GetEnvironmentVariable(Constants.TemplatesContainerName));
                var blob = container.GetBlockBlobReference(data.BlobName);

                byte[] bytes = null;
                using (var stream = new MemoryStream())
                {
                    await blob.DownloadToStreamAsync(stream);
                    await blob.FetchAttributesAsync();
                    log.LogInformation("Blob downloaded");

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
                        if (todayField.Count() > 0)
                            todayField.ReplaceWithText(DateTime.Now.ToString("d. MMMM yyyy", new CultureInfo("cs")));

                        doc.MainDocumentPart.Document.Save();
                        doc.Close();

                        bytes = new byte[stream.Length];
                        bytes = stream.ToArray();
                    }
                }

                log.LogInformation($"Document generated with length {bytes.Length}");
                return new FileContentResult(bytes, blob.Properties.ContentType);
            }
            catch (Exception ex)
            {
                log.LogError(ex.Message);
                throw ex;
            }
        }
    }
}
