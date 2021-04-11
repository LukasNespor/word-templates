using DocumentFormat.OpenXml.Packaging;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.WebJobs;
using Microsoft.Azure.WebJobs.Extensions.Http;
using Microsoft.Extensions.Logging;
using OpenXmlHelpers.Word;
using server.Code;
using server.Code.Services;
using server.Models;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;

namespace LNE.UploadTemplate
{
    public static class CreateTemplate
    {
        [FunctionName(nameof(CreateTemplate))]
        public static async Task<IActionResult> Run([HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "templates")] TemplateModel data, ILogger log)
        {
            try
            {
                var container = BlobService.GetContainer(Constants.TemplatesContainerName);
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
                            if (!fields.Contains(fieldName) &&
                                fieldName.Trim() != "PAGE" &&
                                fieldName.Trim() != @"PAGE   \* MERGEFORMAT" &&
                                !fieldName.Equals("dnes", StringComparison.OrdinalIgnoreCase))
                            {
                                fields.Add(fieldName);
                            }
                        }
                    }
                }

                string fieldsString = string.Join(";", fields);
                string id = Guid.NewGuid().ToString("N");
                var template = new TemplateEntity(Constants.TemplatesPartitionKey, id)
                {
                    Name = data.Name,
                    BlobName = data.BlobName,
                    Group = data.Group,
                    Description = data.Description,
                    Fields = fieldsString
                };
                await TableService.CreateRecordAsync(Constants.TemplatesTableName, template);

                log.LogInformation("Template processed");

                return new OkObjectResult(new TemplateModel()
                {
                    Id = id,
                    Name = data.Name,
                    BlobName = data.BlobName,
                    Group = data.Group,
                    Description = data.Description,
                    Fields = fields
                });
            }
            catch (Exception ex)
            {
                log.LogError(ex.ToString());
                throw;
            }
        }
    }
}
