import axios from 'axios';
import type { IntelligentWorkflowRequest, WorkflowResult } from '../types/workflow';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const brahmaApi = {
  executeIntelligentWorkflow: async (
    request: IntelligentWorkflowRequest
  ): Promise<WorkflowResult> => {
    const response = await api.post('/api/v1/workflows/intelligent', request);
    return response.data;
  },

  getWorkflowHistory: async (): Promise<WorkflowResult[]> => {
    const response = await api.get('/api/v1/workflows');
    return response.data;
  },

  getWorkflow: async (workflowId: string): Promise<WorkflowResult> => {
    const response = await api.get(`/api/v1/workflows/${workflowId}`);
    return response.data;
  },
};

export default api;
