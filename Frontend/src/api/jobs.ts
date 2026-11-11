import { apiClient } from './client';
import type { MatchResponse, AllJobsResponse, JobItem } from './types';

export const jobsApi = {
  getAllJobs: async (params?: {
    search?: string;
    company?: string;
    location?: string;
    limit?: number;
    page?: number;
  }): Promise<AllJobsResponse> => {
    const { data } = await apiClient.get<AllJobsResponse>('/api/jobs', { params });
    return data;
  },

  getMatches: async (limit = 10): Promise<MatchResponse> => {
    const { data } = await apiClient.get<MatchResponse>('/api/match/me', {
      params: { limit },
    });
    return data;
  },

  triggerIngest: async (jobsPerCompany = 20): Promise<{ message: string; [key: string]: any }> => {
    const { data } = await apiClient.post('/api/ingest/run', { jobsPerCompany });
    return data;
  },
};
