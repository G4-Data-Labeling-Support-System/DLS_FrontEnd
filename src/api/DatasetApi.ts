import axiosClient from '@/lib/axios';
import { ENDPOINTS } from './Endpoints';

export interface GetDatasetsParams {
  datasetId?: string;
  projectId?: string;
  datasetName?: string;
  description?: string;
  totalItems?: number;
  createdAt?: string;
}

const datasetApi = {
  getDatasets(params?: GetDatasetsParams) {
    try {
      const url = ENDPOINTS.DATASETS.LIST;
      return axiosClient.get(url, { params });
    } catch (error) {
      console.error('Failed to fetch datasets', error);
      throw error;
    }
  },
  getDatasetById(id: string) {
    try {
      // Nếu có ENDPOINTS.DATASETS.DETAIL thì dùng, nếu không thì ghép chuỗi
      const url = ENDPOINTS.DATASETS.DETAIL ? ENDPOINTS.DATASETS.DETAIL(id) : `${ENDPOINTS.DATASETS.LIST}/${id}`;
      return axiosClient.get(url);
    } catch (error) {
      console.error('Failed to fetch dataset by id', error);
      throw error;
    }
  },
  createDataset(datasetData?: GetDatasetsParams) {
    try {
      const url = ENDPOINTS.DATASETS.CREATE;
      return axiosClient.post(url, datasetData);
    } catch (error) {
      console.error('Failed to create dataset', error);
      throw error;
    }
  },
  getDatasetsByProjectId(projectId: string) {
    try {
      const url = ENDPOINTS.DATASETS.BY_PROJECT(projectId);
      return axiosClient.get(url);
    } catch (error) {
      console.error('Failed to fetch datasets by project id', error);
      throw error;
    }
  },
  updateDataset(id: string, datasetData?: GetDatasetsParams) {
    try {
      const url = ENDPOINTS.DATASETS.DETAIL ? ENDPOINTS.DATASETS.DETAIL(id) : `${ENDPOINTS.DATASETS.LIST}/${id}`;
      return axiosClient.patch(url, datasetData);
    } catch (error) {
      console.error('Failed to update dataset', error);
      throw error;
    }
  },
  deleteDataset(id: string) {
    try {
      const url = ENDPOINTS.DATASETS.DETAIL ? ENDPOINTS.DATASETS.DETAIL(id) : `${ENDPOINTS.DATASETS.LIST}/${id}`;
      return axiosClient.delete(url);
    } catch (error) {
      console.error('Failed to delete dataset', error);
      throw error;
    }
  }
};

export default datasetApi;
