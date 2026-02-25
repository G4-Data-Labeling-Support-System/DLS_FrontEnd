import { mainClient } from './apiClients';
import { ENDPOINTS } from './endpoints';

export interface Dataset {
  id: string;
  name: string;
  version: number;
  storageType: string;
  itemCount: number;
  createdAt: string;
}

export const datasetApi = {
  async getDatasets(): Promise<Dataset[]> {
    const response = await mainClient.get(ENDPOINTS.DATASETS.LIST);
    // Giả định API trả về { data: Dataset[] }
    return response.data?.data || response.data || [];
  },
};
