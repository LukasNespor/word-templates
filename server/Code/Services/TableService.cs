using Microsoft.WindowsAzure.Storage;
using Microsoft.WindowsAzure.Storage.Table;
using server.Models;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace server.Code.Services
{
    public static class TableService
    {
        public static async Task CreateTableAsync(string tableName)
        {
            var client = GetClient();
            var table = client.GetTableReference(tableName);
            await table.CreateIfNotExistsAsync();
        }

        public static async Task<IEnumerable<T>> GetRecordsAsync<T>(string tableName) where T : ITableEntity, new()
        {
            var client = GetClient();
            var table = client.GetTableReference(tableName);

            var items = new List<T>();
            TableContinuationToken continuationToken = null;

            do
            {
                var result = await table.ExecuteQuerySegmentedAsync(new TableQuery<T>(), continuationToken);
                continuationToken = result.ContinuationToken;

                if (result.Results.Count > 0)
                    items.AddRange(result.Results);

            } while (continuationToken != null);

            return items;
        }

        public static async Task CreateRecordAsync<T>(string tableName, T data) where T : ITableEntity, new()
        {
            var table = GetTable(tableName);
            var operation = TableOperation.Insert(data);
            await table.ExecuteAsync(operation);
        }

        public static async Task<T> GetRecordAsync<T>(string tableName, string partitionKey, string rowKey) where T : class, ITableEntity
        {
            var table = GetTable(tableName);
            var response = await table.ExecuteAsync(TableOperation.Retrieve<T>(partitionKey, rowKey));
            return response.Result as T;
        }

        public static async Task DeleteRecordAsync(string tableName, ITableEntity record)
        {
            var table = GetTable(tableName);
            await table.ExecuteAsync(TableOperation.Delete(record));
        }

        public static CloudTable GetTable(string tableName)
        {
            var client = GetClient();
            return client.GetTableReference(tableName);
        }

        static CloudTableClient GetClient()
        {
            var storageAccount = CloudStorageAccount.Parse(Environment.GetEnvironmentVariable(Constants.AzureWebJobsStorage));
            return storageAccount.CreateCloudTableClient();
        }
    }
}
