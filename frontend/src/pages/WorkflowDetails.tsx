import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { brahmaApi, codeApi } from '../api/brahma';
import type { WorkflowResult } from '../types';
import MermaidDiagram from '../components/MermaidDiagram';
import ReactMarkdown from 'react-markdown';
import CostEstimator from '../components/CostEstimator';

const WorkflowDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [workflow, setWorkflow] = useState<WorkflowResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'diagram' | 'code' | 'cost' | 'vishnu'>('overview');
  const [terraformCode, setTerraformCode] = useState<string>('');
  const [loadingCode, setLoadingCode] = useState(false);
  const [customRequest, setCustomRequest] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [customResponse, setCustomResponse] = useState('');

  const loadWorkflow = async (workflowId: string) => {
    try {
      const data = await brahmaApi.getWorkflow(workflowId);
      setWorkflow(data);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { detail?: string } } };
      setError(error.response?.data?.detail || 'Failed to load workflow details');
    } finally {
      setLoading(false);
    }
  };

  const loadTerraformCode = async () => {
    if (!id) return;

    setLoadingCode(true);
    try {
      const result = await codeApi.getTerraformCode(id);
      if (result.success) {
        setTerraformCode(result.terraform_code);
      }
    } catch (err) {
      console.error('Failed to load Terraform code:', err);
    } finally {
      setLoadingCode(false);
    }
  };

  // Load workflow on mount
  useEffect(() => {
    if (id) {
      loadWorkflow(id);
    }
  }, [id]);

  // Load tab-specific data when tab changes
  useEffect(() => {
    if (activeTab === 'code' && !terraformCode) {
      loadTerraformCode();
    }
  }, [activeTab, terraformCode, id]);

  const handleCustomRequest = async () => {
    if (!customRequest.trim()) return;

    setIsProcessing(true);
    setCustomResponse('');

    try {
      // Simulate AI processing (you would call your backend API here)
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Mock response based on request
      const mockResponse = `✅ Analyzing your request: "${customRequest}"\n\nBased on your current workflow configuration:\n- Cloud Provider: ${workflow?.summary.cloud_provider.toUpperCase()}\n- Services: ${workflow?.summary.services_count}\n- Region: ${workflow?.summary.region}\n\nRecommendations:\n• Your request has been noted and would require architectural adjustments\n• Estimated impact on cost: Minimal to moderate\n• Implementation complexity: Medium\n\nNext Steps:\n1. Review the suggested changes\n2. Update your Terraform configuration\n3. Re-run cost analysis\n\nNote: This is a preview. Connect to OpenAI API for detailed AI-powered analysis.`;

      setCustomResponse(mockResponse);
    } catch (error) {
      setCustomResponse('❌ Error processing request. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pixel-magenta mx-auto mb-4"></div>
          <p className="text-retro-cyan opacity-70">Loading workflow details...</p>
        </div>
      </div>
    );
  }

  if (error || !workflow) {
    return (
      <div className="bg-retro-dark border border-pixel-magenta text-retro-pink px-4 py-3 rounded-lg">
        {error || 'Workflow not found'}
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'diagram', label: 'Architecture', icon: '🏗️' },
    { id: 'code', label: 'Terraform Code', icon: '💻' },
    { id: 'cost', label: 'Cost Estimation', icon: '💰' },
    { id: 'vishnu', label: 'Vishnu', icon: '🤖' },
  ];

  return (
    <div className="animate-slide-up">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <Link to="/workflows" className="text-retro-cyan hover:text-retro-cyan mb-4 inline-block font-semibold transition-colors text-sm sm:text-base">
          ← Back to Workflows
        </Link>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-retro-white mb-2" className="font-heading">Workflow Details</h1>
        <p className="text-retro-cyan opacity-60 font-mono text-sm">ID: {workflow.workflow_id}</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <div className="card-retro rounded-2xl p-6 glass-hover border border-pixel/30">
          <h3 className="text-sm text-retro-cyan opacity-60 mb-2 font-semibold uppercase tracking-wide">Cloud Provider</h3>
          <p className="text-2xl font-bold text-retro-cyan uppercase" className="font-heading">
            {workflow.summary.cloud_provider}
          </p>
        </div>
        <div className="card-retro rounded-2xl p-6 glass-hover border border-pixel/30">
          <h3 className="text-sm text-retro-cyan opacity-60 mb-2 font-semibold uppercase tracking-wide">Region</h3>
          <p className="text-2xl font-bold text-retro-cyan" className="font-heading">
            {workflow.summary.region}
          </p>
        </div>
        <div className="card-retro rounded-2xl p-6 glass-hover border border-pixel/30">
          <h3 className="text-sm text-retro-cyan opacity-60 mb-2 font-semibold uppercase tracking-wide">Services</h3>
          <p className="text-2xl font-bold text-retro-cyan" className="font-heading">
            {workflow.summary.services_count}
          </p>
        </div>
        <div className="card-retro rounded-2xl p-6 glass-hover border border-pixel/30">
          <h3 className="text-sm text-retro-cyan opacity-60 mb-2 font-semibold uppercase tracking-wide">Est. Savings</h3>
          <p className="text-2xl font-bold text-retro-cyan" className="font-heading">
            ${workflow.summary.estimated_savings.toFixed(2)}/mo
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="card-retro rounded-2xl border border-pixel/30">
        <div className="border-b border-pixel/20 overflow-x-auto">
          <nav className="flex space-x-4 sm:space-x-8 px-4 sm:px-6" aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as 'overview' | 'diagram' | 'code' | 'cost' | 'vishnu')}
                className={`py-4 px-1 border-b-2 font-semibold text-xs sm:text-sm transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-pixel text-retro-cyan'
                    : 'border-transparent text-retro-cyan opacity-60 hover:text-retro-white hover:border-pixel/50'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-4 sm:p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-retro-white mb-3 font-heading">Input Prompt</h3>
                <div className="border-pixel bg-retro-dark p-5 rounded-xl text-retro-cyan opacity-80 border border-pixel/20 prose prose-invert max-w-none">
                  <ReactMarkdown>
                    {String(workflow.input.prompt || '')}
                  </ReactMarkdown>
                </div>
              </div>

              {workflow.input.location && (
                <div>
                  <h3 className="text-lg font-bold text-retro-white mb-3 font-heading">Target Location</h3>
                  <div className="border-pixel bg-retro-dark p-5 rounded-xl text-retro-cyan opacity-80 border border-pixel/20">
                    <p>📍 {workflow.input.location}</p>
                  </div>
                </div>
              )}

              <div>
                <h3 className="text-lg font-bold text-retro-white mb-3 font-heading">Location Rationale</h3>
                <div className="border-pixel bg-retro-dark p-5 rounded-xl text-retro-cyan opacity-80 border border-pixel/30 prose prose-invert max-w-none">
                  <ReactMarkdown>
                    {String(workflow.summary.location_rationale || '')}
                  </ReactMarkdown>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold text-retro-white mb-3 font-heading">Architecture Details</h3>
                <div className="border-pixel bg-retro-dark p-5 rounded-xl border border-pixel/20">
                  <pre className="text-sm text-retro-cyan opacity-80 whitespace-pre-wrap font-mono">
                    {typeof workflow.summary.architecture === 'string'
                      ? workflow.summary.architecture
                      : JSON.stringify(workflow.summary.architecture, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          )}

          {/* Diagram Tab */}
          {activeTab === 'diagram' && (
            <div>
              <h3 className="text-lg font-bold text-retro-white mb-4" className="font-heading">Architecture Diagram</h3>
              {workflow.summary.mermaid_diagram ? (
                <div className="border-pixel bg-retro-dark p-6 rounded-xl overflow-x-auto border border-pixel/20">
                  <MermaidDiagram
                    diagram={workflow.summary.mermaid_diagram}
                    serviceDescriptions={workflow.summary.service_descriptions}
                  />
                </div>
              ) : (
                <p className="text-retro-cyan opacity-50">No diagram available</p>
              )}
            </div>
          )}

          {/* Code Tab */}
          {activeTab === 'code' && (
            <div>
              {loadingCode ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pixel mx-auto mb-4"></div>
                    <p className="text-retro-cyan opacity-60">Loading Terraform code...</p>
                  </div>
                </div>
              ) : terraformCode ? (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-retro-white font-heading">Terraform Code</h3>
                    <button
                      onClick={() => {
                        const blob = new Blob([terraformCode], { type: 'text/plain' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `terraform_${workflow.workflow_id}.tf`;
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                        URL.revokeObjectURL(url);
                      }}
                      className="btn-retro px-4 py-2 text-sm font-semibold flex items-center gap-2"
                    >
                      <span>⬇</span>
                      Download .tf File
                    </button>
                  </div>
                  <div className="border-pixel bg-retro-dark p-5 rounded-xl border border-pixel/20 overflow-x-auto">
                    <pre className="text-sm text-retro-cyan font-mono">
                      <code>{terraformCode}</code>
                    </pre>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-64">
                  <p className="text-retro-cyan opacity-50">No Terraform code available</p>
                </div>
              )}
            </div>
          )}

          {/* Cost Tab */}
          {activeTab === 'cost' && (
            <div>
              <CostEstimator workflow={workflow} />
            </div>
          )}

          {/* Vishnu Tab - Custom Workflow Modifications */}
          {activeTab === 'vishnu' && (
            <div className="space-y-6">
              {/* Header */}
              <div className="card-retro border border-pixel/30 rounded-2xl p-6">
                <h3 className="text-xl font-bold text-retro-white mb-4 font-heading flex items-center gap-2">
                  🤖 Vishnu AI - Custom Workflow Modifications
                </h3>
                <p className="text-sm text-retro-cyan opacity-70 mb-4">
                  Request custom changes to your workflow architecture, add new services, or optimize specific components using AI-powered analysis.
                </p>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-retro-cyan mb-2">
                      What would you like to change?
                    </label>
                    <textarea
                      value={customRequest}
                      onChange={(e) => setCustomRequest(e.target.value)}
                      placeholder="Example: Add Redis cache layer, enable auto-scaling for peak hours, implement CDN for static assets..."
                      className="w-full px-4 py-3 bg-retro-dark border border-pixel/30 rounded-xl text-retro-white placeholder-retro-cyan/40 focus:outline-none focus:border-pixel transition-colors resize-none font-mono text-sm"
                      rows={5}
                      disabled={isProcessing}
                    />
                  </div>

                  <button
                    onClick={handleCustomRequest}
                    disabled={isProcessing || !customRequest.trim()}
                    className={`btn-retro w-full py-3 px-6 font-semibold flex items-center justify-center gap-2 ${
                      isProcessing || !customRequest.trim() ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {isProcessing ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-retro-white"></div>
                        Processing Request...
                      </>
                    ) : (
                      <>
                        <span>🤖</span>
                        Analyze & Suggest Changes
                      </>
                    )}
                  </button>

                  {customResponse && (
                    <div className="mt-4 p-5 bg-retro-dark/50 rounded-xl border border-pixel/20">
                      <div className="text-sm text-retro-cyan whitespace-pre-wrap font-mono">
                        {customResponse}
                      </div>
                    </div>
                  )}

                  {/* Quick Action Buttons */}
                  <div className="mt-6">
                    <label className="block text-sm font-semibold text-retro-cyan mb-3">
                      Quick Actions
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {[
                        { label: 'Add CDN', icon: '🚀' },
                        { label: 'Enable Auto-Scaling', icon: '📈' },
                        { label: 'Add Redis Cache', icon: '⚡' },
                        { label: 'Setup Load Balancer', icon: '⚖️' },
                        { label: 'Add Monitoring', icon: '📊' },
                        { label: 'Implement Backup', icon: '💾' },
                      ].map((action) => (
                        <button
                          key={action.label}
                          onClick={() => setCustomRequest(action.label)}
                          className="p-3 rounded-xl border border-pixel/30 text-retro-cyan opacity-60 hover:opacity-100 hover:border-pixel/60 hover:bg-pixel/5 transition-all text-xs font-semibold"
                        >
                          <span className="mr-1">{action.icon}</span>
                          {action.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Current Workflow Info */}
              <div className="card-retro border border-pixel/30 rounded-2xl p-6">
                <h3 className="text-lg font-bold text-retro-white mb-4 font-heading">
                  📋 Current Workflow Configuration
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-4 bg-retro-dark/50 rounded-xl border border-pixel/20">
                    <div className="text-xs text-retro-cyan opacity-60 mb-1 uppercase">Cloud Provider</div>
                    <div className="text-lg font-bold text-retro-white uppercase">
                      {workflow.summary.cloud_provider}
                    </div>
                  </div>
                  <div className="p-4 bg-retro-dark/50 rounded-xl border border-pixel/20">
                    <div className="text-xs text-retro-cyan opacity-60 mb-1 uppercase">Region</div>
                    <div className="text-lg font-bold text-retro-white">
                      {workflow.summary.region}
                    </div>
                  </div>
                  <div className="p-4 bg-retro-dark/50 rounded-xl border border-pixel/20">
                    <div className="text-xs text-retro-cyan opacity-60 mb-1 uppercase">Services Count</div>
                    <div className="text-lg font-bold text-retro-white">
                      {workflow.summary.services_count}
                    </div>
                  </div>
                  <div className="p-4 bg-retro-dark/50 rounded-xl border border-pixel/20">
                    <div className="text-xs text-retro-cyan opacity-60 mb-1 uppercase">Estimated Savings</div>
                    <div className="text-lg font-bold text-retro-white">
                      ${workflow.summary.estimated_savings.toFixed(2)}/mo
                    </div>
                  </div>
                </div>
              </div>

              {/* Disclaimer */}
              <div className="text-xs text-retro-cyan opacity-40 text-center">
                ⚠️ AI-generated suggestions are approximations. Always review changes carefully before implementing them in your infrastructure.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WorkflowDetails;
