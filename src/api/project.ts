import axiosClient from "@/lib/axios";
import { ENDPOINTS } from "./endpoints";

interface GetProjectsParams {
    projectId?: string;
    projectName?: string;
    description?: string;
    projectStatus?: string;
    createdAt?: string;
    updatedAt?: string;
}

const projectApi = {
    getProjects(params?: GetProjectsParams) {
        try {
            const url = ENDPOINTS.PROJECTS.LIST;
            return axiosClient.get(url, { params });
        } catch (error) {
            console.error("Failed to fetch projects", error);
            throw error;
        }
    },
    getProjectById(id: string) {
        try {
            const url = ENDPOINTS.PROJECTS.DETAIL(id);
            return axiosClient.get(url);
        } catch (error) {
            console.error("Failed to fetch project by id", error);
            throw error;
        }
    },
    createProject(projectData?: GetProjectsParams) {
        try {
            const url = ENDPOINTS.PROJECTS.CREATE;
            return axiosClient.post(url, projectData);
        } catch (error) {
            console.error("Failed to create project", error);
            throw error;
        }
    },
    updateProject(id: string, projectData?: GetProjectsParams) {
        try {
            const url = ENDPOINTS.PROJECTS.DETAIL(id);
            return axiosClient.put(url, projectData);
        } catch (error) {
            console.error("Failed to update project", error);
            throw error;
        }
    },
    deleteProject(id: string) {
        try {
            const url = ENDPOINTS.PROJECTS.DELETE(id);
            return axiosClient.patch(url);
        } catch (error) {
            console.error("Failed to delete project", error);
            throw error;
        }
    }
}

export default projectApi;
export type { GetProjectsParams };
