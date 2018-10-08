using System.Collections.Generic;
using System.Runtime.Serialization;

namespace server.Models
{
    internal class GenerateDocumentModel
    {
        public GenerateDocumentModel()
        {
            Fields = new List<FieldModel>();
        }

        [DataMember(Name = "blobName")]
        public string BlobName { get; set; }

        [DataMember(Name = "fields")]
        public List<FieldModel> Fields { get; set; }
    }
}
