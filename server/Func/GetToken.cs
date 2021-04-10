using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.WebJobs;
using Microsoft.Azure.WebJobs.Extensions.Http;
using Microsoft.WindowsAzure.Storage.Blob;
using server.Code;
using server.Code.Services;
using System;

namespace LNE.GetSAS
{
    public static class GetToken
    {
        [FunctionName(nameof(GetToken))]
        public static IActionResult Run([HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "token")] HttpRequest req)
        {
            var container = BlobService.GetContainer(Constants.TemplatesContainerName);
            var token = GetContainerSASToken(container, SharedAccessBlobPermissions.Create);
            return new OkObjectResult($"BlobEndpoint={container.ServiceClient.StorageUri.PrimaryUri};SharedAccessSignature={token}");
        }

        public static string GetContainerSASToken(CloudBlobContainer container, SharedAccessBlobPermissions permissions)
        {
            var adHocSas = CreateAdHocSasPolicy(permissions);
            return container.GetSharedAccessSignature(adHocSas, null);
        }

        private static SharedAccessBlobPolicy CreateAdHocSasPolicy(SharedAccessBlobPermissions permissions)
        {
            return new SharedAccessBlobPolicy()
            {
                // Set start time to five minutes before now to avoid clock skew.
                SharedAccessStartTime = DateTime.UtcNow.AddMinutes(-5),
                SharedAccessExpiryTime = DateTime.UtcNow.AddHours(1),
                Permissions = permissions
            };
        }
    }
}