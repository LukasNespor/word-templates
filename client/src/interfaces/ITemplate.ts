export default interface ITemplate {
    id: string;
    name: string;
    blobName: string;
    description?: string;
    group?: string;
    fields?: string[];
}
