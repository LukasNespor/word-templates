using System.Collections.Generic;

namespace server.Models
{
    public class GenerateDocumentModel
    {
        public string BlobName { get; set; }
        public List<FieldModel> Fields { get; set; } = new List<FieldModel>();
    }
}
