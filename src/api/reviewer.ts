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
};
