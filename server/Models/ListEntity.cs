using Microsoft.WindowsAzure.Storage.Table;

namespace server.Models
{
    public class ListEntity : TableEntity
    {
        public ListEntity()
        {
        }

        public ListEntity(string partitionKey, string rowKey) : base(partitionKey, rowKey)
        {
        }

        public string Value { get; set; }
    }
}
