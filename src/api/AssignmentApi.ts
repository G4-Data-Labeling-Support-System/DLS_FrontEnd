import axiosClient from "@/lib/axios";
import { ENDPOINTS } from "./Endpoints";



interface GetAssignmentsParams {
    assignmentId?: string;
    projectId?: string;
    datasetId?: string;
    assignmentName?: string;
    assignedTo?: string;
    assignedBy?: string;
    totalItems?: number;
    completedItems?: number;
    description?: string;
    status?: string;
    dueDate?: string;
    createdAt?: string;
    updatedAt?: string;
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
    async getAssignmentById(id: string) {
        try {
            // Temporary workaround for 500 error (Method Not Supported) on GET /assignments/{id}
            const url = ENDPOINTS.ASSIGNMENTS.LIST;
            const response = await axiosClient.get(url);
            const data = response.data?.data || response.data || [];
            if (Array.isArray(data)) {
                const found = data.find((a: Record<string, unknown>) => String(a.assignmentId || a.id) === String(id));
                if (found) {
                    return { data: { data: found } };
                }
            }
            throw new Error("Assignment not found in list");
        } catch (error) {
            console.error("Failed to fetch assignment by id", error);
            throw error;
        }
    },
    getAssignmentsByAnnotator(annotatorId: string) {
        try {
            const url = ENDPOINTS.ASSIGNMENTS.BY_ANNOTATOR(annotatorId);
            return axiosClient.get(url);
        } catch (error) {
            console.error("Failed to fetch assignments by annotator", error);
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
    },
    getAssignmentsByProjectId(projectId: string) {
        try {
            const url = ENDPOINTS.ASSIGNMENTS.BY_PROJECT(projectId);
            return axiosClient.get(url);
        } catch (error) {
            console.error("Failed to fetch assignments by project id", error);
            throw error;
        }
    },
    createAssignmentForProject(projectId: string, assignmentData?: GetAssignmentsParams) {
        try {
            const url = ENDPOINTS.ASSIGNMENTS.CREATE_BY_PROJECT(projectId);
            return axiosClient.post(url, assignmentData);
        } catch (error) {
            console.error("Failed to create assignment for project", error);
            throw error;
        }
    }
}

export default assignmentApi;
export type { GetAssignmentsParams };
