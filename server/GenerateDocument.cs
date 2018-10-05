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
using OpenXmlHelpers.Word;
using DocumentFormat.OpenXml.Packaging;
using DocumentFormat.OpenXml;
using System.Net.Http;
using System.Net;
using System.Net.Http.Headers;

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
                    doc.SaveAs(newBlobName).Close();
                }
            }

            byte[] bytes = File.ReadAllBytes(newBlobName);
            File.Delete(newBlobName);

            return new FileContentResult(bytes, sourceBlob.Properties.ContentType);
        }
    }
}
