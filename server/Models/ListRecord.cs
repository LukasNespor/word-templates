using Microsoft.WindowsAzure.Storage.Table;

namespace server.Models
{
    public class ListRecord : TableEntity
    {
        public ListRecord()
        {
        }

        public ListRecord(string partitionKey, string rowKey) : base(partitionKey, rowKey)
        {
        }

        public string Value { get; set; }
    }
}
