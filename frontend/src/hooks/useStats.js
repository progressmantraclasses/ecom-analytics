import { useQuery } from '@tanstack/react-query';
import { fetchStats, fetchEventsChart } from '../lib/api';

export const useStats = () =>
  useQuery({
    queryKey: ['stats'],
    queryFn: fetchStats,
    refetchInterval: 30_000,
  });

export const useEventsChart = () =>
  useQuery({
    queryKey: ['eventsChart'],
    queryFn: fetchEventsChart,
    refetchInterval: 30_000,
  });
