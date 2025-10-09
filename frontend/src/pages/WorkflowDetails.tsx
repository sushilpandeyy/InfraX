import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { brahmaApi } from '../api/brahma';
import type { WorkflowResult } from '../types';
import MermaidDiagram from '../components/MermaidDiagram';

const WorkflowDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [workflow, setWorkflow] = useState<WorkflowResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'diagram' | 'code' | 'cost'>('overview');

  useEffect(() => {
    if (id) {
      loadWorkflow(id);
    }
  }, [id]);

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
  ];

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <Link to="/workflows" className="text-purple-600 hover:text-purple-800 mb-4 inline-block">
          ← Back to Workflows
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Workflow Details</h1>
        <p className="text-gray-600">ID: {workflow.workflow_id}</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm text-gray-600 mb-2">Cloud Provider</h3>
          <p className="text-2xl font-bold text-blue-600 uppercase">
            {workflow.summary.cloud_provider}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm text-gray-600 mb-2">Region</h3>
          <p className="text-2xl font-bold text-green-600">
            {workflow.summary.region}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm text-gray-600 mb-2">Services</h3>
          <p className="text-2xl font-bold text-purple-600">
            {workflow.summary.services_count}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm text-gray-600 mb-2">Est. Savings</h3>
          <p className="text-2xl font-bold text-yellow-600">
            ${workflow.summary.estimated_savings.toFixed(2)}/mo
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as 'overview' | 'diagram' | 'code' | 'cost')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Input Prompt</h3>
                <p className="bg-gray-50 p-4 rounded-lg text-gray-700">
                  {workflow.input.prompt}
                </p>
              </div>

              {workflow.input.location && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Target Location</h3>
                  <p className="bg-gray-50 p-4 rounded-lg text-gray-700">
                    📍 {workflow.input.location}
                  </p>
                </div>
              )}

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Location Rationale</h3>
                <p className="bg-blue-50 p-4 rounded-lg text-gray-700">
                  {workflow.summary.location_rationale}
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Architecture Details</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                    {JSON.stringify(workflow.summary.architecture, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          )}

          {/* Diagram Tab */}
          {activeTab === 'diagram' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Architecture Diagram</h3>
              {workflow.summary.mermaid_diagram ? (
                <div className="bg-gray-50 p-6 rounded-lg overflow-x-auto">
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
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Terraform Code</h3>
                <button className="text-sm text-purple-600 hover:text-purple-800">
                  Download Code
                </button>
              </div>
              <div className="bg-gray-900 text-gray-100 p-6 rounded-lg overflow-x-auto">
                <p className="text-sm text-gray-400 mb-2">File: {workflow.summary.code_file}</p>
                <p className="text-sm">
                  Terraform code has been generated and saved to the backend.
                </p>
              </div>
            </div>
          )}

          {/* Cost Tab */}
          {activeTab === 'cost' && (
            <div className="space-y-6">
              <div className="bg-green-50 border border-green-200 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-green-900 mb-2">
                  Estimated Monthly Savings
                </h3>
                <p className="text-4xl font-bold text-green-600 mb-2">
                  ${workflow.summary.estimated_savings.toFixed(2)}
                </p>
                <p className="text-sm text-green-700">
                  Based on AI-powered cost optimization strategies
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Cost Optimization Strategies
                </h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                    {JSON.stringify(workflow.steps['2_cost_optimization'].strategies || {}, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WorkflowDetails;
