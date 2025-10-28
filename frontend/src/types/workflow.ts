export interface IntelligentWorkflowRequest {
  prompt?: string;
  location?: string;
  repo_url?: string;
}

export interface WorkflowResult {
  workflow_id: string;
  success: boolean;
  workflow_type: string;
  timestamp: string;
  input: {
    prompt: string;
    location?: string;
    iac_tool: string;
  };
  steps: {
    '1_intelligent_planning': Record<string, unknown>;
    '2_cost_optimization': Record<string, unknown>;
    '3_service_refinement': Record<string, unknown>;
    '4_iac_generation': Record<string, unknown>;
    '5_diagram_generation': Record<string, unknown>;
  };
  summary: {
    cloud_provider: string;
    region: string;
    location_rationale: string;
    iac_tool: string;
    services_count: number;
    estimated_savings: number;
    code_file: string;
    code_path: string;
    architecture: Record<string, unknown>;
    mermaid_diagram: string;
    service_descriptions?: Record<string, string>;
    diagram_file: string;
    html_preview: string;
  };
}
