import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { brahmaApi, vishuApi, codeApi } from '../api/brahma';
import type { WorkflowResult } from '../types';
import MermaidDiagram from '../components/MermaidDiagram';
import VishuChat from '../components/VishuChat';
import TerraformEditor from '../components/TerraformEditor';
import AdvancedVishuFeatures from '../components/AdvancedVishuFeatures';

const WorkflowDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [workflow, setWorkflow] = useState<WorkflowResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'diagram' | 'code' | 'cost' | 'vishu' | 'advanced'>('overview');
  const [vishuInsights, setVishuInsights] = useState<any>(null);
  const [loadingInsights, setLoadingInsights] = useState(false);
  const [terraformCode, setTerraformCode] = useState<string>('');
  const [loadingCode, setLoadingCode] = useState(false);

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

  const loadVishuInsights = async () => {
    if (!id) return;

    setLoadingInsights(true);
    try {
      const insights = await vishuApi.getQuickInsights(id);
      setVishuInsights(insights);
    } catch (err) {
      console.error('Failed to load Vishu insights:', err);
    } finally {
      setLoadingInsights(false);
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
    if (activeTab === 'vishu' && !vishuInsights) {
      loadVishuInsights();
    }
    if (activeTab === 'code' && !terraformCode) {
      loadTerraformCode();
    }
  }, [activeTab, vishuInsights, terraformCode, id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-vintage-red mx-auto mb-4"></div>
          <p className="text-vintage-white opacity-70">Loading workflow details...</p>
        </div>
      </div>
    );
  }

  if (error || !workflow) {
    return (
      <div className="bg-vintage-black border border-vintage-red text-vintage-red px-4 py-3 rounded-lg">
        {error || 'Workflow not found'}
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'diagram', label: 'Architecture', icon: '🏗️' },
    { id: 'code', label: 'Terraform Code', icon: '💻' },
    { id: 'cost', label: 'Cost Analysis', icon: '💰' },
    { id: 'vishu', label: 'Ask Vishu', icon: '🤖' },
    { id: 'advanced', label: 'Advanced AI', icon: '🚀' },
  ];

  return (
    <div className="animate-slide-up">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <Link to="/workflows" className="text-vintage-white hover:text-vintage-white mb-4 inline-block font-semibold transition-colors text-sm sm:text-base">
          ← Back to Workflows
        </Link>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2" className="font-heading">Workflow Details</h1>
        <p className="text-vintage-white opacity-60 font-mono text-sm">ID: {workflow.workflow_id}</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <div className="card-vintage rounded-2xl p-6 glass-hover border border-vintage/30">
          <h3 className="text-sm text-vintage-white opacity-60 mb-2 font-semibold uppercase tracking-wide">Cloud Provider</h3>
          <p className="text-2xl font-bold text-vintage-white uppercase" className="font-heading">
            {workflow.summary.cloud_provider}
          </p>
        </div>
        <div className="card-vintage rounded-2xl p-6 glass-hover border border-vintage/30">
          <h3 className="text-sm text-vintage-white opacity-60 mb-2 font-semibold uppercase tracking-wide">Region</h3>
          <p className="text-2xl font-bold text-vintage-white" className="font-heading">
            {workflow.summary.region}
          </p>
        </div>
        <div className="card-vintage rounded-2xl p-6 glass-hover border border-vintage/30">
          <h3 className="text-sm text-vintage-white opacity-60 mb-2 font-semibold uppercase tracking-wide">Services</h3>
          <p className="text-2xl font-bold text-vintage-white" className="font-heading">
            {workflow.summary.services_count}
          </p>
        </div>
        <div className="card-vintage rounded-2xl p-6 glass-hover border border-vintage/30">
          <h3 className="text-sm text-vintage-white opacity-60 mb-2 font-semibold uppercase tracking-wide">Est. Savings</h3>
          <p className="text-2xl font-bold text-vintage-white" className="font-heading">
            ${workflow.summary.estimated_savings.toFixed(2)}/mo
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="card-vintage rounded-2xl border border-vintage/30">
        <div className="border-b border-vintage/20 overflow-x-auto">
          <nav className="flex space-x-4 sm:space-x-8 px-4 sm:px-6" aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as 'overview' | 'diagram' | 'code' | 'cost' | 'vishu' | 'advanced')}
                className={`py-4 px-1 border-b-2 font-semibold text-xs sm:text-sm transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-vintage text-vintage-white'
                    : 'border-transparent text-vintage-white opacity-60 hover:text-white hover:border-vintage/50'
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
                <h3 className="text-lg font-bold text-white mb-3" className="font-heading">Input Prompt</h3>
                <p className="border-vintage bg-vintage-black p-5 rounded-xl text-vintage-white opacity-80 border border-vintage/20">
                  {workflow.input.prompt}
                </p>
              </div>

              {workflow.input.location && (
                <div>
                  <h3 className="text-lg font-bold text-white mb-3" className="font-heading">Target Location</h3>
                  <p className="border-vintage bg-vintage-black p-5 rounded-xl text-vintage-white opacity-80 border border-vintage/20">
                    📍 {workflow.input.location}
                  </p>
                </div>
              )}

              <div>
                <h3 className="text-lg font-bold text-white mb-3" className="font-heading">Location Rationale</h3>
                <p className="border-vintage bg-vintage-black p-5 rounded-xl text-vintage-white opacity-80 border border-vintage/30">
                  {workflow.summary.location_rationale}
                </p>
              </div>

              <div>
                <h3 className="text-lg font-bold text-white mb-3" className="font-heading">Architecture Details</h3>
                <div className="border-vintage bg-vintage-black p-5 rounded-xl border border-vintage/20">
                  <pre className="text-sm text-vintage-white opacity-80 whitespace-pre-wrap">
                    {JSON.stringify(workflow.summary.architecture, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          )}

          {/* Diagram Tab */}
          {activeTab === 'diagram' && (
            <div>
              <h3 className="text-lg font-bold text-white mb-4" className="font-heading">Architecture Diagram</h3>
              {workflow.summary.mermaid_diagram ? (
                <div className="border-vintage bg-vintage-black p-6 rounded-xl overflow-x-auto border border-vintage/20">
                  <MermaidDiagram
                    diagram={workflow.summary.mermaid_diagram}
                    serviceDescriptions={workflow.summary.service_descriptions}
                  />
                </div>
              ) : (
                <p className="text-vintage-white opacity-50">No diagram available</p>
              )}
            </div>
          )}

          {/* Code Tab */}
          {activeTab === 'code' && (
            <div className="h-[800px]">
              {loadingCode ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-vintage mx-auto mb-4"></div>
                    <p className="text-vintage-white opacity-60">Loading Terraform code...</p>
                  </div>
                </div>
              ) : terraformCode ? (
                <TerraformEditor
                  workflowId={workflow.workflow_id}
                  initialCode={terraformCode}
                  onSave={(updatedCode) => {
                    setTerraformCode(updatedCode);
                    console.log('Code saved successfully');
                  }}
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-vintage-white opacity-50">No Terraform code available</p>
                </div>
              )}
            </div>
          )}

          {/* Cost Tab */}
          {activeTab === 'cost' && (
            <div className="space-y-6">
              <div className="border-vintage bg-vintage-black border border-vintage/30 p-6 rounded-xl">
                <h3 className="text-lg font-bold text-vintage-white mb-2" className="font-heading">
                  Estimated Monthly Savings
                </h3>
                <p className="text-4xl font-bold text-vintage-white mb-2">
                  ${workflow.summary.estimated_savings.toFixed(2)}
                </p>
                <p className="text-sm text-vintage-white">
                  Based on AI-powered cost optimization strategies
                </p>
              </div>

              <div>
                <h3 className="text-lg font-bold text-white mb-3" className="font-heading">
                  Cost Optimization Strategies
                </h3>
                <div className="border-vintage bg-vintage-black p-5 rounded-xl border border-vintage/20">
                  <pre className="text-sm text-vintage-white opacity-80 whitespace-pre-wrap">
                    {JSON.stringify(workflow.steps['2_cost_optimization'].strategies || {}, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          )}

          {/* Vishu Agent Tab */}
          {activeTab === 'vishu' && (
            <div>
              {/* Quick Insights Panel */}
              {loadingInsights ? (
                <div className="border-vintage bg-vintage-black p-6 rounded-xl mb-6 border border-vintage/20">
                  <div className="flex items-center gap-3 text-vintage-white opacity-60">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-vintage"></div>
                    <span>Vishu is analyzing your infrastructure...</span>
                  </div>
                </div>
              ) : vishuInsights && vishuInsights.success && (
                <div className="border-vintage bg-vintage-black p-6 rounded-xl mb-6 border border-vintage/20">
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2" className="font-heading">
                    <span>💡</span>
                    Quick Insights
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-vintage-white opacity-80 leading-relaxed">{vishuInsights.summary}</p>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-vintage/20">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-vintage-white" className="font-heading">
                          {vishuInsights.metrics.total_lines}
                        </div>
                        <div className="text-xs text-vintage-white opacity-60 mt-1">Total Lines</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-vintage-white" className="font-heading">
                          {vishuInsights.metrics.resources}
                        </div>
                        <div className="text-xs text-vintage-white opacity-60 mt-1">Resources</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-vintage-white" className="font-heading">
                          {vishuInsights.metrics.variables}
                        </div>
                        <div className="text-xs text-vintage-white opacity-60 mt-1">Variables</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-vintage-white" className="font-heading">
                          {vishuInsights.metrics.outputs}
                        </div>
                        <div className="text-xs text-vintage-white opacity-60 mt-1">Outputs</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Chat Interface */}
              <div className="h-[600px] rounded-2xl overflow-hidden border border-vintage/30">
                <VishuChat workflowId={workflow.workflow_id} />
              </div>
            </div>
          )}

          {/* Advanced AI Features Tab */}
          {activeTab === 'advanced' && (
            <div className="h-[800px]">
              <AdvancedVishuFeatures workflowId={workflow.workflow_id} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WorkflowDetails;
