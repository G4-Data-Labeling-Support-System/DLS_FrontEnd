import { mainClient } from './apiClients';
import { ENDPOINTS } from './endpoints';


export interface ProjectSummary {
    id: string;
    name: string;
    description?: string;
    progress: number;
    completed: number;
    total: number;
    active: number;
    approved: number;
    rejected: number;
    color?: string;
}

export const managerApi = {

    getActiveProjects: async (): Promise<ProjectSummary[]> => {
        try {
            const response = await mainClient.get(ENDPOINTS.PROJECTS.LIST);
            return response.data;
        } catch (error) {
            console.error("Failed to fetch projects", error);
            throw error;
        }
    },

    getProjectById: async (id: string): Promise<ProjectSummary | null> => {
        try {
            const response = await mainClient.get(ENDPOINTS.PROJECTS.DETAIL(id));
            return response.data;
        } catch (error) {
            console.error(`Failed to fetch project ${id}`, error);
            return null;
        }
    },

    createProject: async (payload: { name: string; description?: string }) => {
        try {
            const response = await mainClient.post(ENDPOINTS.PROJECTS.CREATE, payload);
            return response.data;
        } catch (error) {
            console.error("Failed to create project", error);
            throw error;
        }
    }
};
