import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { brahmaApi } from '../api/brahma';
import type { WorkflowResult } from '../types';

const Workflows: React.FC = () => {
  const [workflows, setWorkflows] = useState<WorkflowResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadWorkflows();
  }, []);

  const loadWorkflows = async () => {
    try {
      const data = await brahmaApi.getWorkflowHistory();
      setWorkflows(data);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { detail?: string } } };
      setError(error.response?.data?.detail || 'Failed to load workflows');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (success: boolean) => {
    return success ? (
      <span className="px-3 py-1 text-xs font-semibold rounded-full bg-vintage-black border-vintage text-vintage-white">
        Success
      </span>
    ) : (
      <span className="px-3 py-1 text-xs font-semibold rounded-full bg-vintage-red border-vintage-red text-vintage-white">
        Failed
      </span>
    );
  };

  const getProviderBadge = (provider: string) => {
    const colors: Record<string, string> = {
      aws: 'bg-vintage-black border-vintage text-vintage-white',
      azure: 'bg-vintage-black border-vintage text-vintage-white',
      gcp: 'bg-vintage-black border-vintage text-vintage-white',
    };
    return (
      <span className={`px-3 py-1 text-xs font-semibold rounded-full border-2 ${colors[provider] || 'bg-vintage-black border-vintage text-vintage-white'}`}>
        {provider.toUpperCase()}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-vintage-red mx-auto mb-4"></div>
          <p className="text-vintage-white opacity-70">Loading workflows...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-slide-up">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2" className="font-heading">Workflows</h1>
          <p className="text-vintage-white opacity-60">Manage and view your infrastructure workflows</p>
        </div>
        <Link
          to="/create"
          className="inline-flex items-center justify-center bg-vintage-red text-white px-6 py-3 rounded-xl font-semibold border border-vintage hover:bg-vintage-red/80 hover:shadow-lg hover:shadow-vintage-red/40 transition-all duration-300"
        >
          ✨ New Workflow
        </Link>
      </div>

      {error && (
        <div className="card-vintage bg-vintage-black/90 border-2 border-vintage-red text-vintage-red px-6 py-4 rounded-2xl mb-6">
          {error}
        </div>
      )}

      {workflows.length === 0 ? (
        <div className="card-vintage rounded-2xl p-12 text-center border border-vintage/30">
          <div className="text-7xl mb-6 animate-float">📋</div>
          <h3 className="text-2xl font-bold text-white mb-3" className="font-heading">No workflows yet</h3>
          <p className="text-vintage-white opacity-60 mb-8 text-lg">
            Create your first infrastructure workflow to get started
          </p>
          <Link
            to="/create"
            className="inline-flex items-center justify-center bg-vintage-red text-white px-8 py-3 rounded-xl font-semibold border border-vintage hover:bg-vintage-red/80 hover:shadow-lg hover:shadow-vintage-red/40 transition-all duration-300"
          >
            ✨ Create Workflow
          </Link>
        </div>
      ) : (
        <div className="card-vintage rounded-2xl overflow-hidden border border-vintage/30 overflow-x-auto">
          <table className="min-w-full divide-y divide-vintage/20">
            <thead className="glass">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-vintage-white opacity-60 uppercase tracking-wider">
                  Workflow ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-vintage-white opacity-60 uppercase tracking-wider">
                  Provider
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-vintage-white opacity-60 uppercase tracking-wider">
                  Region
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-vintage-white opacity-60 uppercase tracking-wider">
                  Services
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-vintage-white opacity-60 uppercase tracking-wider">
                  Savings
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-vintage-white opacity-60 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-vintage-white opacity-60 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-vintage-white opacity-60 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-vintage/10">
              {workflows.map((workflow) => (
                <tr key={workflow.workflow_id} className="hover:border-vintage bg-vintage-black transition-all">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                    {workflow.workflow_id.split('_').pop()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {getProviderBadge(workflow.summary.cloud_provider)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                    {workflow.summary.region}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                    {workflow.summary.services_count}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-vintage-white font-semibold">
                    ${workflow.summary.estimated_savings.toFixed(2)}/mo
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {getStatusBadge(workflow.success)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-vintage-white opacity-60">
                    {new Date(workflow.timestamp).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link
                      to={`/workflows/${workflow.workflow_id}`}
                      className="text-vintage-white hover:text-vintage-white font-semibold"
                    >
                      View →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Workflows;
