import { mainClient } from './apiClients';
import { ENDPOINTS } from './endpoints';

export interface ReviewerStats {
    totalSubmissions: number;
    totalSubmissionsTrend: number; // percentage
    pendingReviews: number;
    averageAccuracy: number;
    averageAccuracyTrend: number; // percentage
    topPerformer: {
        name: string;
        precision: number;
        avatar?: string;
    };
}

export interface Annotation {
    id: string;
    label: string;
    confidence: number;
    color: string;
    bbox: { x: number; y: number; w: number; h: number };
}

export interface ReviewerItem {
    id: string;
    filename: string;
    status: 'approved' | 'rejected' | 'pending';
    imageUrl: string;
    lastModified: string;
}

export interface ReviewerItemDetail extends ReviewerItem {
    annotations: Annotation[];
    annotator?: {
        name: string;
        role: string;
        level: number;
        accuracy: string;
        speed: string;
        avatar?: string;
    };
}

export const reviewerApi = {
    getDashboardStats: async (): Promise<ReviewerStats> => {
        try {
            const response = await mainClient.get(ENDPOINTS.REVIEWER.STATS);
            return response.data;
        } catch (error) {
            console.error("Failed to fetch reviewer stats", error);
            throw error;
        }
    },

    getProjectItems: async (projectId: string): Promise<ReviewerItem[]> => {
        try {
            const response = await mainClient.get(ENDPOINTS.REVIEWER.PROJECT_ITEMS(projectId));
            return response.data;
        } catch (error) {
            console.error("Failed to fetch project items", error);
            throw error;
        }
    },

    getItemDetail: async (itemId: string): Promise<ReviewerItemDetail> => {
        try {
            const response = await mainClient.get(ENDPOINTS.REVIEWER.ITEM_DETAIL(itemId));
            return response.data;
        } catch (error) {
            console.error("Failed to fetch item details", error);
            throw error;
        }
    },

    submitReviewDecision: async (itemId: string, status: 'approved' | 'rejected', comment?: string): Promise<void> => {
        try {
            await mainClient.post(ENDPOINTS.REVIEWER.REVIEW_DECISION(itemId), { status, comment });
        } catch (error) {
            console.error("Failed to submit review decision", error);
            throw error;
        }
    }
};
