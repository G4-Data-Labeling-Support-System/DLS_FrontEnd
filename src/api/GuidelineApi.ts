import axiosClient from "@/lib/axios";
import { ENDPOINTS } from "./Endpoints";


interface GetGuidelinesParams {
    guide_id?: string;
    content?: string;
    createdAt?: string;
    status?: string;
    title?: string;
    version?: string;
    projectId?: string;
    user_id?: string;
}

const guidelineApi = {
    getGuidelines(projectId: string) {
        try {
            const url = ENDPOINTS.GUIDELINES.LIST(projectId);
            return axiosClient.get(url);
        } catch (error) {
            console.error("Failed to fetch guidelines", error);
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
    createGuideline(projectId: string, guidelineData?: GetGuidelinesParams) {
        try {
            const url = ENDPOINTS.GUIDELINES.CREATE(projectId);
            return axiosClient.post(url, guidelineData, {
                headers: {
                    'user_id': guidelineData?.user_id
                }
            });
        } catch (error) {
            console.error("Failed to create project", error);
            throw error;
        }
    },
    updateGuideline(id: string, guidelineData?: GetGuidelinesParams) {
        try {
            const url = ENDPOINTS.GUIDELINES.UPDATE(id);
            return axiosClient.put(url, guidelineData);
        } catch (error) {
            console.error("Failed to update project", error);
            throw error;
        }
    },
}

export default guidelineApi;
export type { GetGuidelinesParams };
