using System.Collections.Generic;

namespace server.Models
{
    public class TemplateModel
    {
        public string Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public string BlobName { get; set; }
        public string Group { get; set; }
        public IEnumerable<string> Fields { get; set; }
    }
}
