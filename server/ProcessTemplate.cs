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
using System.Collections.Generic;
using System.IO;
using System.Threading.Tasks;

namespace LNE.UploadTemplate
{
    public static class ProcessTemplate
    {
        [FunctionName("ProcessTemplate")]
        public static async Task<IActionResult> Run([HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = null)]HttpRequest req, ILogger log)
        {
            log.LogInformation("Procesing template");

            try
            {
                var data = await Helpers.GetModelFromBodyAsync<TemplateModel>(req.Body);
                if (data == null)
                {
                    log.LogWarning("Posted data are not correct");
                    return new BadRequestObjectResult("Posted data are not correct");
                }

                var container = await Helpers.GetContainerAsync(Environment.GetEnvironmentVariable(Constants.TemplatesContainerName));
                var blob = container.GetBlockBlobReference(data.BlobName);

                var fields = new List<string>();
                using (var sourceStream = new MemoryStream())
                {
                    await blob.DownloadToStreamAsync(sourceStream);

                    using (WordprocessingDocument doc = WordprocessingDocument.Open(sourceStream, false))
                    {
                        foreach (var field in doc.GetMergeFields())
                        {
                            string fieldName = OpenXmlWordHelpers.GetFieldNameFromMergeField(field.InnerText).Trim('\"');
                            if (!fields.Contains(fieldName) && fieldName.Trim() != "PAGE")
                                fields.Add(fieldName);
                        }
                    }
                }

                blob.Metadata.Add("name", Uri.EscapeDataString(data.Name));

                if (!string.IsNullOrEmpty(data.Description))
                    blob.Metadata.Add("description", Uri.EscapeDataString(data.Description));

                if (fields.Count > 0)
                    blob.Metadata.Add("fields", Uri.EscapeDataString(string.Join(";", fields)));
                else log.LogWarning("No fields were found");

                await blob.SetMetadataAsync();

                log.LogInformation("Template processed");

                return new OkObjectResult(new TemplateModel()
                {
                    Name = data.Name,
                    BlobName = data.BlobName,
                    Description = data.Description,
                    Fields = fields.ToArray(),
                });
            }
            catch (Exception ex)
            {
                log.LogError(ex.Message);
                throw ex;
            }
        }
    }
}
