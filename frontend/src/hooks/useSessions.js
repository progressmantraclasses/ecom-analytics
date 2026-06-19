import { useQuery } from '@tanstack/react-query';
import { fetchSessions, fetchSessionEvents } from '../lib/api';

export const useSessions = (params) =>
  useQuery({
    queryKey: ['sessions', params],
    queryFn: () => fetchSessions(params),
    keepPreviousData: true,
    refetchInterval: 30_000,
  });

export const useSessionDetail = (sessionId) =>
  useQuery({
    queryKey: ['sessionDetail', sessionId],
    queryFn: () => fetchSessionEvents(sessionId),
    enabled: Boolean(sessionId),
  });
