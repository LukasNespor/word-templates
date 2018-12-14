using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.WebJobs;
using Microsoft.Azure.WebJobs.Extensions.Http;
using Microsoft.Extensions.Logging;
using server.Code;
using System.Linq;
using System.Threading.Tasks;

namespace server
{
    public static class GetLists
    {
        [FunctionName("GetLists")]
        public static async Task<IActionResult> Run([HttpTrigger(AuthorizationLevel.Anonymous, "get")] HttpRequest req, ILogger log)
        {
            var items = await Helpers.GetListsAsync();
            return new OkObjectResult(items.Select(x => new
            {
                name = x.PartitionKey,
                value = x.RowKey
            }));
        }
    }
}
