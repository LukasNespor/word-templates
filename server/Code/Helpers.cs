using Microsoft.WindowsAzure.Storage;
using Microsoft.WindowsAzure.Storage.Blob;
using Microsoft.WindowsAzure.Storage.Table;
using Newtonsoft.Json;
using server.Models;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace server.Code
{
    internal static class Helpers
    {
        public static async Task<T> GetModelFromBodyAsync<T>(Stream body)
        {
            try
            {
                string requestBody = await new StreamReader(body).ReadToEndAsync();
                return JsonConvert.DeserializeObject<T>(requestBody);
            }
            catch (JsonException)
            {
                return default(T);
            }
        }

        public static async Task<CloudBlobContainer> GetContainerAsync(string name)
        {
            var storageAccount = CloudStorageAccount.Parse(Environment.GetEnvironmentVariable(Constants.AzureWebJobsStorage));
            var blobClient = storageAccount.CreateCloudBlobClient();
            CloudBlobContainer container = blobClient.GetContainerReference(name);
            await container.CreateIfNotExistsAsync();
            return container;
        }

        public static async Task<IList<ListRecord>> GetListsAsync()
        {
            var storageAccount = CloudStorageAccount.Parse(Environment.GetEnvironmentVariable(Constants.AzureWebJobsStorage));
            var client = storageAccount.CreateCloudTableClient();
            var table = client.GetTableReference(Environment.GetEnvironmentVariable(Constants.ListsTableName));
            await table.CreateIfNotExistsAsync();

            var items = new List<ListRecord>();
            TableContinuationToken continuationToken = null;

            do
            {
                var result = await table.ExecuteQuerySegmentedAsync(new TableQuery<ListRecord>(), continuationToken);
                continuationToken = result.ContinuationToken;

                if (result.Results.Count > 0)
                    items.AddRange(result.Results);

            } while (continuationToken != null);

            return items;
        }

        public static string[] GetFieldsWithoutHiddenArray(string separatedFields)
        {
            var fields = separatedFields.Split(';').ToList();
            var today = fields.Where(x => x.Equals("dnes", StringComparison.OrdinalIgnoreCase));
            today.ToList().ForEach(x => fields.Remove(x));
            return fields.ToArray();
        }
    }
}
