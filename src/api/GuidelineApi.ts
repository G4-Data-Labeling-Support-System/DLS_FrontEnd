import { mainClient } from './apiClients';
import { ENDPOINTS } from './Endpoints';

// ─── Types (matching API response schema) ─────────────────────────────────────

export interface GuidelineProject {
    projectId: string;
    projectName: string;
    description: string;
    status: 'ACTIVE' | string;
    createdAt: string;
    updatedAt: string;
}

export interface Guideline {
    guideId: string;
    projectId: string;
    title: string;
    content: string;
    version: number;
    status: 'ACTIVE' | string;
    createdAt: string;
    updatedAt: string;
    project: GuidelineProject;
}

export interface GuidelineListResponse {
    code: number;
    message: string;
    data: Guideline[];
}

// ─── API ───────────────────────────────────────────────────────────────────────

const guidelineApi = {
    async getByProject(projectId: string): Promise<GuidelineListResponse> {
        const url = ENDPOINTS.GUIDELINES.BY_PROJECT(projectId);
        const response = await mainClient.get<GuidelineListResponse>(url);
        return response.data;
    },
};

export default guidelineApi;
