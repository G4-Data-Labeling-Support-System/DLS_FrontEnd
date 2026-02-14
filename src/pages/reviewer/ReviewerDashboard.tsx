import React, { useEffect, useState } from 'react';
import { Typography, Spin, Alert } from 'antd';
import { StatsCard } from '@/features/reviewer/components/StatsCard';
import { ReviewerFilters } from '@/features/reviewer/components/ReviewerFilters';
import { reviewerApi, type ReviewerStats } from '@/api/reviewer';


const { Title, Text } = Typography;

const ReviewerDashboard: React.FC = () => {
    const [stats, setStats] = useState<ReviewerStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const statsData = await reviewerApi.getDashboardStats();
                setStats(statsData);
            } catch (err) {
                setError("Failed to load dashboard data. Please try again.");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (error) {
        return <Alert message="Error" description={error} type="error" showIcon />;
    }

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-full min-h-[500px] gap-4">
                <Spin size="large" />
                <Text className="text-gray-400">Loading Dashboard...</Text>
            </div>
        );
    }

    return (
        <div>
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 items-start relative">
                {/* Main Content - Stats (3 cols) */}
                <div className="xl:col-span-3 space-y-6">
                    <div className="flex justify-between items-start">
                        <div>
                            <Title level={4} className="!text-white !m-0 !font-display">Reviewer Dashboard</Title>
                            <Text className="text-gray-400 text-xs">Overview of current annotation progress and performance.</Text>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* Using a grid for stats cards to mimic ActiveProjects layout if more cards are added */}
                        <StatsCard
                            title="TOTAL SUBMISSIONS"
                            value={stats?.totalSubmissions || 0}
                            trend={stats?.totalSubmissionsTrend}
                            trendLabel="Last 7 days"
                        />
                        {/* Placeholders for other stats to fill the grid if needed */}
                    </div>
                </div>

                {/* Sidebar - Filters (1 col) - Matches QuickActions placement */}
                <div className="xl:col-span-1 xl:sticky xl:top-6 space-y-6">
                    <ReviewerFilters />
                </div>
            </div>
        </div>
    );
};

export default ReviewerDashboard;
