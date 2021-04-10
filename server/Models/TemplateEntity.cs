using Microsoft.WindowsAzure.Storage.Table;

namespace server.Models
{
    public class TemplateEntity : TableEntity
    {
        public TemplateEntity()
        {

        }

        public TemplateEntity(string partitionKey, string rowKey) : base(partitionKey, rowKey)
        {
        }

        public string Name { get; set; }
        public string Group { get; set; }
        public string BlobName { get; set; }
        public string Description { get; set; }
        public string Fields { get; set; }
    }
}
