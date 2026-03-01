import axiosClient from "@/lib/axios";
import { ENDPOINTS } from "./endpoints";


interface GetAssignmentsParams {
    assignmentId?: string;
    assignmentName?: string;
    descriptionAssignment?: string;
    assignmentStatus?: string;
    projectId?: string;
    datasetId?: string;
    createdAt?: string;
    updatedAt?: string;
    status?: string;
}


const assignmentApi = {
    getAssignments(params?: GetAssignmentsParams) {
        try {
            const url = ENDPOINTS.ASSIGNMENTS.LIST;
            return axiosClient.get(url, { params });
        } catch (error) {
            console.error("Failed to fetch assignments", error);
            throw error;
        }
    },
    getAssignmentById(id: string) {
        try {
            const url = ENDPOINTS.ASSIGNMENTS.DETAIL(id);
            return axiosClient.get(url);
        } catch (error) {
            console.error("Failed to fetch assignment by id", error);
            throw error;
        }
    },
    createAssignment(assignmentData?: GetAssignmentsParams) {
        try {
            const url = ENDPOINTS.ASSIGNMENTS.CREATE;
            return axiosClient.post(url, assignmentData);
        } catch (error) {
            console.error("Failed to create assignment", error);
            throw error;
        }
    },
    updateAssignment(id: string, assignmentData?: GetAssignmentsParams) {
        try {
            const url = ENDPOINTS.ASSIGNMENTS.DETAIL(id);
            return axiosClient.patch(url, assignmentData);
        } catch (error) {
            console.error("Failed to update assignment", error);
            throw error;
        }
    },
    deleteAssignment(id: string) {
        try {
            const url = ENDPOINTS.ASSIGNMENTS.DELETE(id);
            // using .put() here just in case assignment uses soft-deletes like projects
            return axiosClient.put(url);
        } catch (error) {
            console.error("Failed to delete assignment", error);
            throw error;
        }
    }
}

export default assignmentApi;
export type { GetAssignmentsParams };
