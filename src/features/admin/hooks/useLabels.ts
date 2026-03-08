import { useQuery } from '@tanstack/react-query';
import { labelApi } from '@/api/LabelApi';

export const useLabels = () => {
    return useQuery({
        queryKey: ['labels'],
        queryFn: labelApi.getLabels,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
};
