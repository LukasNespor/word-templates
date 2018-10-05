using System;
using System.IO;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.WebJobs;
using Microsoft.Azure.WebJobs.Extensions.Http;
using Microsoft.AspNetCore.Http;
using Microsoft.Azure.WebJobs.Host;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using Microsoft.WindowsAzure.Storage;
using Microsoft.WindowsAzure.Storage.Blob;
using DocumentFormat.OpenXml.Packaging;
using OpenXmlHelpers.Word;
using System.Collections.Generic;

namespace LNE.UploadTemplate
{
    public static class ProcessTemplate
    {
        [FunctionName("ProcessTemplate")]
        public static async Task<IActionResult> Run([HttpTrigger(AuthorizationLevel.Function, "post", Route = null)]HttpRequest req, ILogger log)
        {
            string requestBody = await new StreamReader(req.Body).ReadToEndAsync();
            dynamic data = JsonConvert.DeserializeObject(requestBody);

            var storageAccount = CloudStorageAccount.Parse(Environment.GetEnvironmentVariable("AzureWebJobsStorage"));
            var blobClient = storageAccount.CreateCloudBlobClient();
            CloudBlobContainer container = blobClient.GetContainerReference("templates");
            CloudBlockBlob blob = container.GetBlockBlobReference(data.blobName.ToString());

            var fields = new List<string>();
            using (var sourceStream = new MemoryStream())
            {
                await blob.DownloadToStreamAsync(sourceStream);

                using (WordprocessingDocument doc = WordprocessingDocument.Open(sourceStream, true))
                {
                    foreach (var field in doc.GetMergeFields())
                    {
                        string fieldName = OpenXmlWordHelpers.GetFieldNameFromMergeField(field.InnerText);
                        fields.Add(fieldName);
                    }
                }
            }

            blob.Metadata.Add("name", Uri.EscapeDataString(data.name.ToString()));
            if (!string.IsNullOrEmpty(data.description.ToString()))
                blob.Metadata.Add("description", Uri.EscapeDataString(data.description.ToString()));

            if (fields.Count > 0)
                blob.Metadata.Add("fields", string.Join(";", fields));
            await blob.SetMetadataAsync();

            dynamic responseData = new
            {
                data.name,
                data.blobName,
                data.description,
                fields = fields.ToArray(),
            };

            return new OkObjectResult(responseData);
        }
    }
}
