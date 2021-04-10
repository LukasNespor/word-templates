using Microsoft.WindowsAzure.Storage;
using Microsoft.WindowsAzure.Storage.Blob;
using System;
using System.Threading.Tasks;

namespace server.Code.Services
{
    public static class BlobService
    {
        public static async Task CreateContainerAsync(string containerName)
        {
            var blobClient = GetClient();
            CloudBlobContainer container = blobClient.GetContainerReference(containerName);
            await container.CreateIfNotExistsAsync();
        }

        public static CloudBlobContainer GetContainer(string containerName)
        {
            var blobClient = GetClient();
            return blobClient.GetContainerReference(containerName);
        }

        static CloudBlobClient GetClient()
        {
            var storageAccount = CloudStorageAccount.Parse(Environment.GetEnvironmentVariable(Constants.AzureWebJobsStorage));
            return storageAccount.CreateCloudBlobClient();
        }
    }
}
