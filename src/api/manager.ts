import { mainClient } from './apiClients';
import { ENDPOINTS } from './endpoints';

export interface DashboardStats {
    lifecycle: {
        status: string;
        currentStep: number;
    };
    workforce: {
        activeAnnotators: number;
        trend: number;
    };
    serverLoad: {
        region: string;
        percentage: number;
    };
}

export interface ProjectSummary {
    id: string;
    name: string;
    progress: number;
    completed: number;
    total: number;
    active: number;
    approved: number;
    rejected: number;
    color?: string;
}

export const managerApi = {
    getDashboardStats: async (): Promise<DashboardStats> => {
        // Mocking for now as requested to "get from API" but endpoint might not exist yet
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    lifecycle: { status: 'ANNOTATING', currentStep: 1 },
                    workforce: { activeAnnotators: 24, trend: 2 },
                    serverLoad: { region: 'US-East', percentage: 94 }
                });
            }, 500);
        });
    },

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

    createProject: async (payload: { name: string; description?: string; status: string }) => {
        try {
            const response = await mainClient.post(ENDPOINTS.PROJECTS.CREATE, payload);
            return response.data;
        } catch (error) {
            console.error("Failed to create project", error);
            throw error;
        }
    }
};
