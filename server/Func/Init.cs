using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.WebJobs;
using Microsoft.Azure.WebJobs.Extensions.Http;
using server.Code;
using server.Code.Services;
using System.Threading.Tasks;

namespace LNE.GenerateDocument
{
    public static class Init
    {
        [FunctionName(nameof(Init))]
        public static async Task<IActionResult> Run([HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "init")] HttpRequest req)
        {
            await TableService.CreateTableAsync(Constants.ListsTableName);
            await TableService.CreateTableAsync(Constants.TemplatesContainerName);
            await BlobService.CreateContainerAsync(Constants.TemplatesContainerName);
            return new NoContentResult();
        }
    }
}
