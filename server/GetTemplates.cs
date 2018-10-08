using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.WebJobs;
using Microsoft.Azure.WebJobs.Extensions.Http;
using Microsoft.Extensions.Logging;
using Microsoft.WindowsAzure.Storage.Blob;
using server.Code;
using server.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace LNE.GetTemplates
{
    public static class GetTemplates
    {
        [FunctionName("GetTemplates")]
        public static async Task<IActionResult> Run([HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = null)]HttpRequest req, ILogger log)
        {
            log.LogInformation("Loading templates");

            try
            {
                var data = new List<TemplateModel>();
                var container = await Helpers.GetContainerAsync(Environment.GetEnvironmentVariable(Constants.TemplatesContainerName));

                BlobContinuationToken token = null;
                do
                {
                    BlobResultSegment segment = await container.ListBlobsSegmentedAsync(token);
                    token = segment.ContinuationToken;

                    foreach (IListBlobItem blob in segment.Results)
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

                        data.Add(new TemplateModel()
                        {
                            Name = string.IsNullOrEmpty(name) ? blockBlob.Name : name,
                            Description = description,
                            BlobName = blockBlob.Name,
                            Fields = fields.Split(';')
                        });
                    }
                } while (token != null);

                log.LogInformation("Templates loaded");

                return new OkObjectResult(data.OrderBy(x => x.Name));
            }
            catch (Exception ex)
            {
                log.LogError(ex.Message);
                throw ex;
            }
        }
    }
}
