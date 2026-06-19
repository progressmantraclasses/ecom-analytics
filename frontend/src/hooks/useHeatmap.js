import { useQuery } from '@tanstack/react-query';
import { fetchHeatmapUrls, fetchHeatmap } from '../lib/api';

export const useHeatmapUrls = () =>
  useQuery({
    queryKey: ['heatmapUrls'],
    queryFn: fetchHeatmapUrls,
  });

export const useHeatmap = (params) =>
  useQuery({
    queryKey: ['heatmap', params],
    queryFn: () => fetchHeatmap(params),
    enabled: Boolean(params?.page_url),
    refetchInterval: 30_000,
  });
