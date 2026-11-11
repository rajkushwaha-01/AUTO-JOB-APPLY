import { apiClient } from './client';
import type { UploadResumeResponse } from './types';

export const resumeApi = {
  uploadPdf: async (file: File): Promise<UploadResumeResponse> => {
    const formData = new FormData();
    formData.append('pdfFile', file);

    const { data } = await apiClient.post<UploadResumeResponse>('/api/upload-pdf', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return data;
  },

  downloadPdf: async (): Promise<Blob> => {
    const response = await apiClient.get('/api/resume-pdf', {
      responseType: 'blob',
    });
    return response.data;
  },
};

