using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.WebJobs;
using Microsoft.Azure.WebJobs.Extensions.Http;
using Microsoft.Extensions.Logging;
using Microsoft.WindowsAzure.Storage;
using Microsoft.WindowsAzure.Storage.Blob;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace LNE.GetTemplates
{
    public static class GetTemplates
    {
        [FunctionName("GetTemplates")]
        public static async Task<IActionResult> Run([HttpTrigger(AuthorizationLevel.Function, "get", Route = null)]HttpRequest req, ILogger log)
        {
            var data = new List<dynamic>();
            var storageAccount = CloudStorageAccount.Parse(Environment.GetEnvironmentVariable("AzureWebJobsStorage"));
            var blobClient = storageAccount.CreateCloudBlobClient();
            CloudBlobContainer container = blobClient.GetContainerReference("templates");

            BlobContinuationToken token = null;
            do
            {
                BlobResultSegment resultSegment = await container.ListBlobsSegmentedAsync(token);
                token = resultSegment.ContinuationToken;

                foreach (IListBlobItem blob in resultSegment.Results)
                {
                    var blockBlob = (CloudBlockBlob)blob;
                    await blockBlob.FetchAttributesAsync();

                    string name = "", description = "", fields = "";
                    foreach (var item in blockBlob.Metadata)
                    {
                        string value = Uri.UnescapeDataString(item.Value);
                        switch (item.Key)
                        {
                            case "name": name = value; break;
                            case "description": description = value; break;
                            case "fields": fields = value; break;
                            default:
                                break;
                        }
                    }

                    data.Add(new
                    {
                        name,
                        description,
                        container = blockBlob.Container.Name,
                        blobName = blockBlob.Name,
                        fields = fields.Split(';')
                    });
                }
            } while (token != null);

            return new OkObjectResult(data);
        }
    }
}
