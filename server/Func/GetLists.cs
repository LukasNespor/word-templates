using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.WebJobs;
using Microsoft.Azure.WebJobs.Extensions.Http;
using server.Code;
using server.Code.Services;
using server.Models;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace server
{
    public static class GetLists
    {
        [FunctionName(nameof(GetLists))]
        public static async Task<IActionResult> Run([HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "lists")] HttpRequest req)
        {
            var items = await TableService.GetRecordsAsync<ListEntity>(Constants.ListsTableName);
            return new OkObjectResult(items.Select(x => new
            {
                Id = x.RowKey,
                Uid = Guid.NewGuid().ToString(),
                Type = x.PartitionKey,
                Value = x.Value
            }));
        }
    }
}
