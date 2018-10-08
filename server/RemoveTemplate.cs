using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.WebJobs;
using Microsoft.Azure.WebJobs.Extensions.Http;
using Microsoft.Extensions.Logging;
using server.Code;
using server.Models;
using System;
using System.Threading.Tasks;

namespace server
{
    public static class RemoveTemplate
    {
        [FunctionName("RemoveTemplate")]
        public static async Task<IActionResult> Run([HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = null)]HttpRequest req, ILogger log)
        {
            try
            {
                log.LogInformation("Removing template");
                var data = await Helpers.GetModelFromBodyAsync<TemplateModel>(req.Body);
                var container = await Helpers.GetContainerAsync(Environment.GetEnvironmentVariable(Constants.TemplatesContainerName));
                var blob = container.GetBlockBlobReference(data.BlobName);
                await blob.DeleteIfExistsAsync();

                log.LogInformation("Template removed");
                return new OkResult();
            }
            catch (Exception ex)
            {
                log.LogError(ex.Message);
                throw ex;
            }
        }
    }
}
