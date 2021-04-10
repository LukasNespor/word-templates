import axios, { AxiosResponse } from "axios";
import IField from "../interfaces/IField";
import IListItem from "../interfaces/IListItem";
import ITemplate from "../interfaces/ITemplate";

const funcAppUrl: string = process.env.REACT_APP_API_ENDPOINT + "/api";
const tokenEndpoint: string = `${funcAppUrl}/token`;
const listEndpoint: string = `${funcAppUrl}/lists`;
const generateEndpoint: string = `${funcAppUrl}/generate`;
const templatesEndpoint: string = `${funcAppUrl}/templates`;

export const getToken = async (): Promise<string> => {
    const resp: AxiosResponse = await axios.get(tokenEndpoint);
    return resp.data;
};

export const getLists = async (): Promise<IListItem[]> => {
    const resp: AxiosResponse = await axios.get(listEndpoint);
    return resp.data;
};

export const getTemplates = async (): Promise<ITemplate[]> => {
    const resp: AxiosResponse = await axios.get(templatesEndpoint);
    return resp.data;
};

export const createTemplate = async (data: ITemplate): Promise<ITemplate> => {
    const resp: AxiosResponse = await axios.post(templatesEndpoint, data);
    return resp.data;
};

export const deleteTemplate = async (id: string): Promise<void> => {
    return await axios.delete(`${templatesEndpoint}/${id}`);
};

export const generateDocument = async (fields: IField[], blobName: string): Promise<Blob> => {
    const resp: AxiosResponse = await axios.post(generateEndpoint, { fields, blobName }, { responseType: "blob" });
    return resp.data;
};
