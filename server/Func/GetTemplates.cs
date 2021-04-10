using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.WebJobs;
using Microsoft.Azure.WebJobs.Extensions.Http;
using Microsoft.Extensions.Logging;
using server.Code;
using server.Code.Services;
using server.Models;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace LNE.GetTemplates
{
    public static class GetTemplates
    {
        [FunctionName(nameof(GetTemplates))]
        public static async Task<IActionResult> Run([HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "templates")] HttpRequest req, ILogger log)
        {
            try
            {
                var records = await TableService.GetRecordsAsync<TemplateEntity>(Constants.TemplatesTableName);
                var data = records
                    .Select(x => new TemplateModel
                    {
                        Id = x.RowKey,
                        Name = x.Name,
                        Description = x.Description,
                        BlobName = x.BlobName,
                        Group = x.Group,
                        Fields = x.Fields.Split(';')
                    })
                    .OrderBy(x => x.Name);
                return new OkObjectResult(data);
            }
            catch (Exception ex)
            {
                log.LogError(ex.ToString());
                throw;
            }
        }
    }
}
