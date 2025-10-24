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

export const vishuApi = {
  chat: async (message: string, workflowId?: string): Promise<any> => {
    const response = await api.post('/api/v1/vishu/chat', {
      message,
      workflow_id: workflowId,
    });
    return response.data;
  },

  analyzeWorkflow: async (workflowId: string): Promise<any> => {
    const response = await api.post('/api/v1/vishu/analyze', {
      workflow_id: workflowId,
    });
    return response.data;
  },

  getSuggestions: async (workflowId: string, focusArea: string = 'all'): Promise<any> => {
    const response = await api.post('/api/v1/vishu/suggest', {
      workflow_id: workflowId,
      focus_area: focusArea,
    });
    return response.data;
  },

  getQuickInsights: async (workflowId: string): Promise<any> => {
    const response = await api.get(`/api/v1/vishu/insights/${workflowId}`);
    return response.data;
  },

  // Enhanced Tools
  validateSyntax: async (workflowId: string): Promise<any> => {
    const response = await api.post('/api/v1/vishu/validate', {
      workflow_id: workflowId,
    });
    return response.data;
  },

  formatCode: async (workflowId: string): Promise<any> => {
    const response = await api.post('/api/v1/vishu/format', {
      workflow_id: workflowId,
    });
    return response.data;
  },

  securityScan: async (workflowId: string): Promise<any> => {
    const response = await api.post('/api/v1/vishu/security-scan', {
      workflow_id: workflowId,
    });
    return response.data;
  },

  checkBestPractices: async (workflowId: string): Promise<any> => {
    const response = await api.post('/api/v1/vishu/best-practices', {
      workflow_id: workflowId,
    });
    return response.data;
  },

  generateAutoFix: async (workflowId: string, issueDescription: string): Promise<any> => {
    const response = await api.post('/api/v1/vishu/auto-fix', {
      workflow_id: workflowId,
      issue_description: issueDescription,
    });
    return response.data;
  },

  generateDocs: async (workflowId: string): Promise<any> => {
    const response = await api.post('/api/v1/vishu/generate-docs', {
      workflow_id: workflowId,
    });
    return response.data;
  },

  analyzeDependencies: async (workflowId: string): Promise<any> => {
    const response = await api.post('/api/v1/vishu/dependencies', {
      workflow_id: workflowId,
    });
    return response.data;
  },

  comprehensiveAudit: async (workflowId: string): Promise<any> => {
    const response = await api.post('/api/v1/vishu/comprehensive-audit', {
      workflow_id: workflowId,
    });
    return response.data;
  },

  // Advanced AI Features
  naturalLanguageQuery: async (workflowId: string, query: string): Promise<any> => {
    const response = await api.post('/api/v1/vishu/nl-query', {
      workflow_id: workflowId,
      query: query,
    });
    return response.data;
  },

  predictiveCosts: async (
    workflowId: string,
    months: number = 12,
    growthRate: number = 0.05,
    usagePattern: string = 'steady'
  ): Promise<any> => {
    const response = await api.post('/api/v1/vishu/predictive-costs', {
      workflow_id: workflowId,
      months: months,
      growth_rate: growthRate,
      usage_pattern: usagePattern,
    });
    return response.data;
  },

  costQuery: async (workflowId: string, query: string): Promise<any> => {
    const response = await api.post('/api/v1/vishu/cost-query', {
      workflow_id: workflowId,
      query: query,
    });
    return response.data;
  },

  parseResources: async (workflowId: string): Promise<any> => {
    const response = await api.get(`/api/v1/vishu/parse-resources/${workflowId}`);
    return response.data;
  },
};

export const codeApi = {
  getTerraformCode: async (workflowId: string): Promise<any> => {
    const response = await api.get(`/api/v1/workflows/${workflowId}/code`);
    return response.data;
  },

  updateTerraformCode: async (
    workflowId: string,
    terraformCode: string,
    changeDescription?: string
  ): Promise<any> => {
    const response = await api.post(`/api/v1/workflows/${workflowId}/code`, {
      workflow_id: workflowId,
      terraform_code: terraformCode,
      change_description: changeDescription || 'Manual code edit',
    });
    return response.data;
  },

  getCodeVersions: async (workflowId: string): Promise<any> => {
    const response = await api.get(`/api/v1/workflows/${workflowId}/code/versions`);
    return response.data;
  },

  getCodeVersion: async (workflowId: string, version: number): Promise<any> => {
    const response = await api.get(`/api/v1/workflows/${workflowId}/code/versions/${version}`);
    return response.data;
  },

  applyVishuSuggestion: async (
    workflowId: string,
    terraformCode: string,
    changeDescription: string
  ): Promise<any> => {
    const response = await api.post(`/api/v1/workflows/${workflowId}/code/apply-suggestion`, {
      workflow_id: workflowId,
      terraform_code: terraformCode,
      change_description: changeDescription,
    });
    return response.data;
  },
};

export default api;
