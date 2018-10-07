using DocumentFormat.OpenXml.Packaging;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.WebJobs;
using Microsoft.Azure.WebJobs.Extensions.Http;
using Microsoft.Extensions.Logging;
using Microsoft.WindowsAzure.Storage;
using Microsoft.WindowsAzure.Storage.Blob;
using Newtonsoft.Json;
using OpenXmlHelpers.Word;
using System;
using System.IO;
using System.Threading.Tasks;

namespace LNE.GenerateDocument
{
    public static class GenerateDocument
    {
        [FunctionName("GenerateDocument")]
        public static async Task<IActionResult> Run([HttpTrigger(AuthorizationLevel.Function, "post", Route = null)]HttpRequest req, ILogger log)
        {
            string requestBody = await new StreamReader(req.Body).ReadToEndAsync();
            dynamic data = JsonConvert.DeserializeObject(requestBody);
            string newBlobName = $"{Guid.NewGuid().ToString()}.docx";

            var storageAccount = CloudStorageAccount.Parse(Environment.GetEnvironmentVariable("AzureWebJobsStorage"));
            var blobClient = storageAccount.CreateCloudBlobClient();
            CloudBlobContainer sourceContainer = blobClient.GetContainerReference("templates");
            CloudBlockBlob sourceBlob = sourceContainer.GetBlockBlobReference(data.blobName.ToString());
            await sourceBlob.FetchAttributesAsync();

            byte[] bytes = null;
            using (var stream = new MemoryStream())
            {
                await sourceBlob.DownloadToStreamAsync(stream);

                using (WordprocessingDocument doc = WordprocessingDocument.Open(stream, true))
                {
                    var fields = doc.GetMergeFields();

                    foreach (var field in data.fields)
                    {
                        string fieldName = field.name;
                        string value = field.value;
                        doc.GetMergeFields(fieldName).ReplaceWithText(value);
                    }

                    doc.MainDocumentPart.Document.Save();
                    doc.Close();

                    bytes = new byte[stream.Length];
                    bytes = stream.ToArray();
                }
            }

            return new FileContentResult(bytes, sourceBlob.Properties.ContentType);
        }
    }
}
