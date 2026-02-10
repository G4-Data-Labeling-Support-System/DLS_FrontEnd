import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ConfigProvider, Layout, Typography, message, Spin } from 'antd';
import { managerTheme } from '@/styles/themeConfig';
import { Header } from '@/components/layout/Header';
import { DatasetItemList, type DatasetItem } from '@/features/reviewer/components/workspace/DatasetItemList';
import { AnnotationCanvas } from '@/features/reviewer/components/workspace/AnnotationCanvas';
import { ReviewDetailPanel } from '@/features/reviewer/components/workspace/ReviewDetailPanel';
import { reviewerApi, type ReviewerItem, type ReviewerItemDetail } from '@/api/reviewer';

const { Text } = Typography;

const ReviewerWorkspacePage: React.FC = () => {
    const { projectId } = useParams();

    // State
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [items, setItems] = useState<ReviewerItem[]>([]);
    const [itemDetail, setItemDetail] = useState<ReviewerItemDetail | null>(null);
    const [loadingItems, setLoadingItems] = useState(false);
    const [loadingDetail, setLoadingDetail] = useState(false);

    // Fetch Items
    useEffect(() => {
        if (!projectId) return;

        const fetchItems = async () => {
            setLoadingItems(true);
            try {
                const data = await reviewerApi.getProjectItems(projectId);
                if (Array.isArray(data)) {
                    setItems(data);
                    if (data.length > 0) {
                        setSelectedId(data[0].id);
                    }
                } else {
                    setItems([]);
                    console.error("API returned non-array for project items:", data);
                }
            } catch {
                message.error('Failed to load dataset items');
            } finally {
                setLoadingItems(false);
            }
        };

        fetchItems();
    }, [projectId]);

    // Fetch Detail
    useEffect(() => {
        if (!selectedId) return;

        const fetchDetail = async () => {
            setLoadingDetail(true);
            try {
                const data = await reviewerApi.getItemDetail(selectedId);
                setItemDetail(data);
            } catch {
                message.error('Failed to load item details');
            } finally {
                setLoadingDetail(false);
            }
        };

        fetchDetail();
    }, [selectedId]);

    const handleReviewDecision = async (status: 'approved' | 'rejected') => {
        if (!selectedId) return;
        try {
            await reviewerApi.submitReviewDecision(selectedId, status);
            message.success(`Item ${status} successfully`);

            // Update local state
            setItems(prev => prev.map(item =>
                item.id === selectedId ? { ...item, status } : item
            ));

            // Auto-select next item (optional)
            const currentIndex = items.findIndex(i => i.id === selectedId);
            if (currentIndex < items.length - 1) {
                setSelectedId(items[currentIndex + 1].id);
            }

        } catch {
            message.error('Failed to submit review');
        }
    };

    // Transform API data to Component props
    const datasetListItems: DatasetItem[] = items.map(i => ({
        id: i.id,
        filename: i.filename,
        status: i.status,
        imageUrl: i.imageUrl,
        lastModified: i.lastModified
    }));

    return (
        <ConfigProvider theme={managerTheme}>
            <Layout className="h-screen w-screen overflow-hidden bg-[#0f0e17] flex flex-col">
                <Header />
                <Layout className="flex-1 overflow-hidden flex flex-row">
                    <div className="h-full relative">
                        {loadingItems && (
                            <div className="absolute inset-0 bg-black/50 z-50 flex items-center justify-center">
                                <Spin size="large" />
                            </div>
                        )}
                        <DatasetItemList
                            items={datasetListItems}
                            selectedId={selectedId || ''}
                            onSelect={setSelectedId}
                        />
                    </div>

                    <div className="flex-1 relative bg-[#0a0a0f] flex items-center justify-center">
                        {loadingDetail ? (
                            <Spin size="large" />
                        ) : itemDetail ? (
                            <AnnotationCanvas
                                imageUrl={itemDetail.imageUrl}
                                annotations={itemDetail.annotations}
                            />
                        ) : (
                            <Text className="text-gray-500">Select an item to review</Text>
                        )}
                    </div>

                    <div className="h-full relative">
                        {loadingDetail && (
                            <div className="absolute inset-0 bg-black/50 z-50 flex items-center justify-center">
                                <Spin />
                            </div>
                        )}
                        <ReviewDetailPanel
                            annotations={itemDetail?.annotations || []}
                            history={itemDetail?.history || []}
                            annotator={itemDetail?.annotator}
                            onApprove={() => handleReviewDecision('approved')}
                            onReject={() => handleReviewDecision('rejected')}
                        />
                    </div>
                </Layout>

            </Layout>
        </ConfigProvider>
    );
};

export default ReviewerWorkspacePage;
