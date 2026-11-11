import { apiClient } from './client';
import type { MatchResponse } from './types';

export const jobsApi = {
  getMatches: async (): Promise<MatchResponse> => {
    const { data } = await apiClient.get<MatchResponse>('/api/match/me');
    return data;
  },

  triggerIngest: async (jobsPerCompany = 20): Promise<{ message: string; [key: string]: any }> => {
    const { data } = await apiClient.post('/api/ingest/run', { jobsPerCompany });
    return data;
  },
};

