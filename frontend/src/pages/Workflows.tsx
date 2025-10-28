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
      <span className="px-3 py-1 text-xs font-bold rounded-none bg-retro-dark border-pixel text-retro-primary uppercase">
        Success
      </span>
    ) : (
      <span className="px-3 py-1 text-xs font-bold rounded-none bg-retro-dark border-2 border-retro-danger text-retro-danger uppercase">
        Failed
      </span>
    );
  };

  const getProviderBadge = (provider: string) => {
    const colors: Record<string, string> = {
      aws: 'bg-retro-dark border-pixel text-retro-primary',
      azure: 'bg-retro-dark border-pixel text-retro-secondary',
      gcp: 'bg-retro-dark border-pixel text-retro-accent',
    };
    return (
      <span className={`px-3 py-1 text-xs font-bold rounded-none border-2 ${colors[provider] || 'bg-retro-dark border-pixel text-retro-primary'} uppercase tracking-wide`}>
        {provider.toUpperCase()}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pixel-magenta mx-auto mb-4"></div>
          <p className="text-retro-cyan opacity-70">Loading workflows...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-slide-up">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-retro-white mb-2" className="font-heading">Workflows</h1>
          <p className="text-retro-cyan opacity-60">Manage and view your infrastructure workflows</p>
        </div>
        <Link
          to="/create"
          className="btn-retro"
        >
          New Workflow
        </Link>
      </div>

      {error && (
        <div className="card-retro bg-retro-dark/90 border-2 border-pixel-magenta text-retro-pink px-6 py-4 rounded-2xl mb-6">
          {error}
        </div>
      )}

      {workflows.length === 0 ? (
        <div className="card-retro rounded-none p-12 text-center border border-pixel/30">
          <h3 className="text-2xl font-bold text-retro-white mb-3 uppercase tracking-wide">No workflows yet</h3>
          <p className="text-retro-text-dim mb-8 text-base">
            Create your first infrastructure workflow to get started
          </p>
          <Link
            to="/create"
            className="btn-retro inline-block"
          >
            Create Workflow
          </Link>
        </div>
      ) : (
        <div className="card-retro rounded-none overflow-hidden border border-pixel/30 overflow-x-auto">
          <table className="min-w-full divide-y divide-pixel/20">
            <thead className="bg-retro-dark">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-retro-text-dim uppercase tracking-wider">
                  Workflow ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-retro-text-dim uppercase tracking-wider">
                  Provider
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-retro-text-dim uppercase tracking-wider">
                  Region
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-retro-text-dim uppercase tracking-wider">
                  Services
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-retro-text-dim uppercase tracking-wider">
                  Savings
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-retro-text-dim uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-retro-text-dim uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-right text-xs font-bold text-retro-text-dim uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-pixel/10">
              {workflows.map((workflow) => (
                <tr key={workflow.workflow_id} className="hover:bg-retro-dark transition-all">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-retro-white">
                    {workflow.workflow_id.split('_').pop()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {getProviderBadge(workflow.summary.cloud_provider)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-retro-white">
                    {workflow.summary.region}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-retro-white">
                    {workflow.summary.services_count}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-retro-primary font-semibold">
                    ${workflow.summary.estimated_savings.toFixed(2)}/mo
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {getStatusBadge(workflow.success)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-retro-text-dim">
                    {new Date(workflow.timestamp).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link
                      to={`/workflows/${workflow.workflow_id}`}
                      className="text-retro-primary hover:text-retro-secondary font-semibold uppercase text-xs tracking-wide"
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
