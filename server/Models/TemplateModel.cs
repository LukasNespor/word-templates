using System.Runtime.Serialization;

namespace server.Models
{
    internal class TemplateModel
    {
        [DataMember(Name = "name")]
        public string Name { get; set; }

        [DataMember(Name = "description")]
        public string Description { get; set; }

        [DataMember(Name = "blobName")]
        public string BlobName { get; set; }

        [DataMember(Name = "fields")]
        public string[] Fields { get; set; }
    }
}
