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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading workflow details...</p>
        </div>
      </div>
    );
  }

  if (error || !workflow) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
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
        <Link to="/workflows" className="text-blue-light hover:text-blue-primary mb-4 inline-block font-semibold transition-colors text-sm sm:text-base">
          ← Back to Workflows
        </Link>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2" style={{ fontFamily: 'Space Grotesk' }}>Workflow Details</h1>
        <p className="text-gray-400 font-mono text-sm">ID: {workflow.workflow_id}</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <div className="glass-card rounded-2xl p-6 glass-hover border border-blue-primary/30">
          <h3 className="text-sm text-gray-400 mb-2 font-semibold uppercase tracking-wide">Cloud Provider</h3>
          <p className="text-2xl font-bold text-blue-light uppercase" style={{ fontFamily: 'Space Grotesk' }}>
            {workflow.summary.cloud_provider}
          </p>
        </div>
        <div className="glass-card rounded-2xl p-6 glass-hover border border-blue-primary/30">
          <h3 className="text-sm text-gray-400 mb-2 font-semibold uppercase tracking-wide">Region</h3>
          <p className="text-2xl font-bold text-green-400" style={{ fontFamily: 'Space Grotesk' }}>
            {workflow.summary.region}
          </p>
        </div>
        <div className="glass-card rounded-2xl p-6 glass-hover border border-blue-primary/30">
          <h3 className="text-sm text-gray-400 mb-2 font-semibold uppercase tracking-wide">Services</h3>
          <p className="text-2xl font-bold text-blue-primary" style={{ fontFamily: 'Space Grotesk' }}>
            {workflow.summary.services_count}
          </p>
        </div>
        <div className="glass-card rounded-2xl p-6 glass-hover border border-blue-primary/30">
          <h3 className="text-sm text-gray-400 mb-2 font-semibold uppercase tracking-wide">Est. Savings</h3>
          <p className="text-2xl font-bold text-yellow-400" style={{ fontFamily: 'Space Grotesk' }}>
            ${workflow.summary.estimated_savings.toFixed(2)}/mo
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="glass-card rounded-2xl border border-blue-primary/30">
        <div className="border-b border-blue-primary/20 overflow-x-auto">
          <nav className="flex space-x-4 sm:space-x-8 px-4 sm:px-6" aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as 'overview' | 'diagram' | 'code' | 'cost' | 'vishu' | 'advanced')}
                className={`py-4 px-1 border-b-2 font-semibold text-xs sm:text-sm transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-blue-primary text-blue-light'
                    : 'border-transparent text-gray-400 hover:text-white hover:border-blue-primary/50'
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
                <h3 className="text-lg font-bold text-white mb-3" style={{ fontFamily: 'Space Grotesk' }}>Input Prompt</h3>
                <p className="glass p-5 rounded-xl text-gray-300 border border-blue-primary/20">
                  {workflow.input.prompt}
                </p>
              </div>

              {workflow.input.location && (
                <div>
                  <h3 className="text-lg font-bold text-white mb-3" style={{ fontFamily: 'Space Grotesk' }}>Target Location</h3>
                  <p className="glass p-5 rounded-xl text-gray-300 border border-blue-primary/20">
                    📍 {workflow.input.location}
                  </p>
                </div>
              )}

              <div>
                <h3 className="text-lg font-bold text-white mb-3" style={{ fontFamily: 'Space Grotesk' }}>Location Rationale</h3>
                <p className="glass p-5 rounded-xl text-gray-300 border border-blue-primary/30">
                  {workflow.summary.location_rationale}
                </p>
              </div>

              <div>
                <h3 className="text-lg font-bold text-white mb-3" style={{ fontFamily: 'Space Grotesk' }}>Architecture Details</h3>
                <div className="glass p-5 rounded-xl border border-blue-primary/20">
                  <pre className="text-sm text-gray-300 whitespace-pre-wrap">
                    {JSON.stringify(workflow.summary.architecture, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          )}

          {/* Diagram Tab */}
          {activeTab === 'diagram' && (
            <div>
              <h3 className="text-lg font-bold text-white mb-4" style={{ fontFamily: 'Space Grotesk' }}>Architecture Diagram</h3>
              {workflow.summary.mermaid_diagram ? (
                <div className="glass p-6 rounded-xl overflow-x-auto border border-blue-primary/20">
                  <MermaidDiagram
                    diagram={workflow.summary.mermaid_diagram}
                    serviceDescriptions={workflow.summary.service_descriptions}
                  />
                </div>
              ) : (
                <p className="text-gray-500">No diagram available</p>
              )}
            </div>
          )}

          {/* Code Tab */}
          {activeTab === 'code' && (
            <div className="h-[800px]">
              {loadingCode ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-primary mx-auto mb-4"></div>
                    <p className="text-gray-400">Loading Terraform code...</p>
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
                  <p className="text-gray-500">No Terraform code available</p>
                </div>
              )}
            </div>
          )}

          {/* Cost Tab */}
          {activeTab === 'cost' && (
            <div className="space-y-6">
              <div className="glass border border-green-400/30 p-6 rounded-xl">
                <h3 className="text-lg font-bold text-green-400 mb-2" style={{ fontFamily: 'Space Grotesk' }}>
                  Estimated Monthly Savings
                </h3>
                <p className="text-4xl font-bold text-green-400 mb-2">
                  ${workflow.summary.estimated_savings.toFixed(2)}
                </p>
                <p className="text-sm text-green-300">
                  Based on AI-powered cost optimization strategies
                </p>
              </div>

              <div>
                <h3 className="text-lg font-bold text-white mb-3" style={{ fontFamily: 'Space Grotesk' }}>
                  Cost Optimization Strategies
                </h3>
                <div className="glass p-5 rounded-xl border border-blue-primary/20">
                  <pre className="text-sm text-gray-300 whitespace-pre-wrap">
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
                <div className="glass p-6 rounded-xl mb-6 border border-blue-primary/20">
                  <div className="flex items-center gap-3 text-gray-400">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-primary"></div>
                    <span>Vishu is analyzing your infrastructure...</span>
                  </div>
                </div>
              ) : vishuInsights && vishuInsights.success && (
                <div className="glass p-6 rounded-xl mb-6 border border-blue-primary/20">
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2" style={{ fontFamily: 'Space Grotesk' }}>
                    <span>💡</span>
                    Quick Insights
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-gray-300 leading-relaxed">{vishuInsights.summary}</p>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-blue-primary/20">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-primary" style={{ fontFamily: 'Space Grotesk' }}>
                          {vishuInsights.metrics.total_lines}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">Total Lines</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-400" style={{ fontFamily: 'Space Grotesk' }}>
                          {vishuInsights.metrics.resources}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">Resources</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-400" style={{ fontFamily: 'Space Grotesk' }}>
                          {vishuInsights.metrics.variables}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">Variables</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-yellow-400" style={{ fontFamily: 'Space Grotesk' }}>
                          {vishuInsights.metrics.outputs}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">Outputs</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Chat Interface */}
              <div className="h-[600px] rounded-2xl overflow-hidden border border-blue-primary/30">
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
