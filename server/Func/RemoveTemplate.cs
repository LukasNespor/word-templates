using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.WebJobs;
using Microsoft.Azure.WebJobs.Extensions.Http;
using Microsoft.Extensions.Logging;
using server.Code;
using server.Code.Services;
using server.Models;
using System;
using System.Threading.Tasks;

namespace server
{
    public static class RemoveTemplate
    {
        [FunctionName(nameof(RemoveTemplate))]
        public static async Task<IActionResult> Run([HttpTrigger(AuthorizationLevel.Anonymous, "delete", Route = "templates")] TemplateModel data, ILogger log)
        {
            try
            {
                await TableService.DeleteRecordAsync(Constants.TemplatesTableName, Constants.TemplatesPartitionKey, data.Id);
                var container = BlobService.GetContainer(Constants.TemplatesContainerName);
                var blob = container.GetBlockBlobReference(data.BlobName);
                await blob.DeleteIfExistsAsync();
                return new NoContentResult();
            }
            catch (Exception ex)
            {
                log.LogError(ex.ToString());
                throw;
            }
        }
    }
}
