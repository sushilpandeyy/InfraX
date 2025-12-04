import React, { useState, useEffect } from 'react';
import { brahmaApi } from '../api/brahma';
import type { WorkflowResult } from '../types';

interface UploadedTerraform {
  name: string;
  content: string;
  provider: string;
  services_count: number;
  region: string;
}

const Compare: React.FC = () => {
  const [workflows, setWorkflows] = useState<WorkflowResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedWorkflow1, setSelectedWorkflow1] = useState<string>('');
  const [selectedWorkflow2, setSelectedWorkflow2] = useState<string>('');
  const [sourceType1, setSourceType1] = useState<'workflow' | 'upload'>('workflow');
  const [sourceType2, setSourceType2] = useState<'workflow' | 'upload'>('workflow');
  const [uploadedTf1, setUploadedTf1] = useState<UploadedTerraform | null>(null);
  const [uploadedTf2, setUploadedTf2] = useState<UploadedTerraform | null>(null);
  const [comparing, setComparing] = useState(false);
  const [comparisonResults, setComparisonResults] = useState<any>(null);

  useEffect(() => {
    loadWorkflows();
  }, []);

  const loadWorkflows = async () => {
    try {
      const data = await brahmaApi.getWorkflows();
      setWorkflows(data);
    } catch (error) {
      console.error('Failed to load workflows:', error);
    } finally {
      setLoading(false);
    }
  };

  const workflow1 = workflows.find(w => w.workflow_id === selectedWorkflow1);
  const workflow2 = workflows.find(w => w.workflow_id === selectedWorkflow2);

  const parseTerraformFile = (content: string, filename: string): UploadedTerraform => {
    // Simple Terraform parsing - detect provider and count resources
    let provider = 'aws'; // default
    let region = 'unknown';

    // Detect provider
    if (content.includes('azurerm') || content.includes('provider "azurerm"')) {
      provider = 'azure';
    } else if (content.includes('google') || content.includes('provider "google"')) {
      provider = 'gcp';
    }

    // Detect region
    const regionMatch = content.match(/region\s*=\s*"([^"]+)"/);
    if (regionMatch) {
      region = regionMatch[1];
    }

    // Count resources - look for 'resource "' patterns
    const resourceMatches = content.match(/resource\s+"[^"]+"\s+"[^"]+"/g);
    const services_count = resourceMatches ? resourceMatches.length : 1;

    return {
      name: filename,
      content,
      provider,
      services_count,
      region,
    };
  };

  const handleFileUpload = (file: File, slot: 1 | 2) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      const parsed = parseTerraformFile(content, file.name);

      if (slot === 1) {
        setUploadedTf1(parsed);
        setSelectedWorkflow1('');
      } else {
        setUploadedTf2(parsed);
        setSelectedWorkflow2('');
      }
    };
    reader.readAsText(file);
  };

  const calculateProviderCost = (workflow: WorkflowResult | UploadedTerraform, provider: string) => {
    const providerMultipliers: Record<string, number> = {
      aws: 1.0,
      azure: 1.05,
      gcp: 0.95,
    };

    const servicesCount = 'summary' in workflow ? workflow.summary.services_count : workflow.services_count || 1;
    const baseMonthlyPerService = 50;

    return servicesCount * baseMonthlyPerService * (providerMultipliers[provider] || 1.0);
  };

  const handleCompare = () => {
    const source1 = sourceType1 === 'workflow' ? workflow1 : uploadedTf1;
    const source2 = sourceType2 === 'workflow' ? workflow2 : uploadedTf2;

    if (!source1 || !source2) return;

    setComparing(true);

    const getWorkflowData = (source: WorkflowResult | UploadedTerraform, index: number) => {
      if ('summary' in source) {
        // It's a WorkflowResult
        return {
          name: `Workflow ${index} (${source.workflow_id.substring(0, 20)}...)`,
          original_provider: source.summary.cloud_provider,
          costs: {
            aws: calculateProviderCost(source, 'aws'),
            azure: calculateProviderCost(source, 'azure'),
            gcp: calculateProviderCost(source, 'gcp'),
          },
          services_count: source.summary.services_count,
          region: source.summary.region,
          source_type: 'workflow',
        };
      } else {
        // It's an UploadedTerraform
        return {
          name: `Uploaded: ${source.name}`,
          original_provider: source.provider,
          costs: {
            aws: calculateProviderCost(source, 'aws'),
            azure: calculateProviderCost(source, 'azure'),
            gcp: calculateProviderCost(source, 'gcp'),
          },
          services_count: source.services_count,
          region: source.region,
          source_type: 'upload',
        };
      }
    };

    // Calculate costs for both sources across all providers
    const results = {
      workflow1: getWorkflowData(source1, 1),
      workflow2: getWorkflowData(source2, 2),
    };

    setComparisonResults(results);
    setComparing(false);
  };

  const getCostDifference = (cost1: number, cost2: number) => {
    const diff = cost1 - cost2;
    const percentage = cost2 > 0 ? ((diff / cost2) * 100).toFixed(1) : '0';
    return { diff: Math.abs(diff), percentage: Math.abs(Number(percentage)), isHigher: diff > 0 };
  };

  const providerInfo = {
    aws: { name: 'Amazon Web Services', icon: '☁️', color: 'text-orange-400' },
    azure: { name: 'Microsoft Azure', icon: '⚡', color: 'text-blue-400' },
    gcp: { name: 'Google Cloud Platform', icon: '🔷', color: 'text-blue-500' },
  };

  return (
    <div className="animate-slide-up">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl lg:text-4xl font-bold text-retro-white mb-2 font-heading">
          Compare Workflows
        </h1>
        <p className="text-retro-cyan opacity-60">
          Compare Terraform configurations and analyze cost differences across AWS, Azure, and GCP
        </p>
      </div>

      {/* Workflow Selection */}
      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        {/* Workflow 1 Selection */}
        <div className="card-retro border border-pixel/30 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-retro-white mb-4 font-heading">
            📄 First Configuration
          </h3>

          {/* Source Type Toggle */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => {
                setSourceType1('workflow');
                setUploadedTf1(null);
              }}
              className={`flex-1 py-2 px-4 rounded-lg border-2 transition-all text-sm font-semibold ${
                sourceType1 === 'workflow'
                  ? 'border-pixel bg-pixel/10 text-retro-white'
                  : 'border-pixel/30 text-retro-cyan opacity-60 hover:opacity-100'
              }`}
            >
              Select Workflow
            </button>
            <button
              onClick={() => {
                setSourceType1('upload');
                setSelectedWorkflow1('');
              }}
              className={`flex-1 py-2 px-4 rounded-lg border-2 transition-all text-sm font-semibold ${
                sourceType1 === 'upload'
                  ? 'border-pixel bg-pixel/10 text-retro-white'
                  : 'border-pixel/30 text-retro-cyan opacity-60 hover:opacity-100'
              }`}
            >
              Upload .tf File
            </button>
          </div>

          {sourceType1 === 'workflow' ? (
            loading ? (
              <div className="text-retro-cyan opacity-60">Loading workflows...</div>
            ) : (
              <select
                value={selectedWorkflow1}
                onChange={(e) => setSelectedWorkflow1(e.target.value)}
                className="w-full px-4 py-3 bg-retro-dark border border-pixel/30 rounded-xl text-retro-white focus:outline-none focus:border-pixel transition-colors"
              >
                <option value="">-- Select Workflow --</option>
                {workflows.map((workflow) => (
                  <option
                    key={workflow.workflow_id}
                    value={workflow.workflow_id}
                    disabled={workflow.workflow_id === selectedWorkflow2}
                  >
                    {workflow.workflow_id} ({workflow.summary.cloud_provider.toUpperCase()})
                  </option>
                ))}
              </select>
            )
          ) : (
            <div className="space-y-3">
              <label className="block">
                <div className="border-2 border-dashed border-pixel/30 rounded-xl p-6 text-center hover:border-pixel/60 transition-colors cursor-pointer bg-retro-dark/50">
                  <input
                    type="file"
                    accept=".tf,.txt"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload(file, 1);
                    }}
                    className="hidden"
                  />
                  <div className="text-3xl mb-2">📤</div>
                  <div className="text-sm text-retro-cyan font-semibold">
                    {uploadedTf1 ? uploadedTf1.name : 'Click to upload Terraform file'}
                  </div>
                  <div className="text-xs text-retro-cyan opacity-50 mt-1">
                    .tf or .txt files only
                  </div>
                </div>
              </label>
            </div>
          )}

          {(workflow1 || uploadedTf1) && (
            <div className="mt-4 p-4 bg-retro-dark/50 rounded-xl border border-pixel/20">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-retro-cyan opacity-60">Provider:</span>
                  <span className="text-retro-white font-semibold uppercase">
                    {workflow1 ? workflow1.summary.cloud_provider : uploadedTf1?.provider}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-retro-cyan opacity-60">Region:</span>
                  <span className="text-retro-white font-semibold">
                    {workflow1 ? workflow1.summary.region : uploadedTf1?.region}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-retro-cyan opacity-60">Services:</span>
                  <span className="text-retro-white font-semibold">
                    {workflow1 ? workflow1.summary.services_count : uploadedTf1?.services_count}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Workflow 2 Selection */}
        <div className="card-retro border border-pixel/30 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-retro-white mb-4 font-heading">
            📄 Second Configuration
          </h3>

          {/* Source Type Toggle */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => {
                setSourceType2('workflow');
                setUploadedTf2(null);
              }}
              className={`flex-1 py-2 px-4 rounded-lg border-2 transition-all text-sm font-semibold ${
                sourceType2 === 'workflow'
                  ? 'border-pixel bg-pixel/10 text-retro-white'
                  : 'border-pixel/30 text-retro-cyan opacity-60 hover:opacity-100'
              }`}
            >
              Select Workflow
            </button>
            <button
              onClick={() => {
                setSourceType2('upload');
                setSelectedWorkflow2('');
              }}
              className={`flex-1 py-2 px-4 rounded-lg border-2 transition-all text-sm font-semibold ${
                sourceType2 === 'upload'
                  ? 'border-pixel bg-pixel/10 text-retro-white'
                  : 'border-pixel/30 text-retro-cyan opacity-60 hover:opacity-100'
              }`}
            >
              Upload .tf File
            </button>
          </div>

          {sourceType2 === 'workflow' ? (
            loading ? (
              <div className="text-retro-cyan opacity-60">Loading workflows...</div>
            ) : (
              <select
                value={selectedWorkflow2}
                onChange={(e) => setSelectedWorkflow2(e.target.value)}
                className="w-full px-4 py-3 bg-retro-dark border border-pixel/30 rounded-xl text-retro-white focus:outline-none focus:border-pixel transition-colors"
              >
                <option value="">-- Select Workflow --</option>
                {workflows.map((workflow) => (
                  <option
                    key={workflow.workflow_id}
                    value={workflow.workflow_id}
                    disabled={workflow.workflow_id === selectedWorkflow1}
                  >
                    {workflow.workflow_id} ({workflow.summary.cloud_provider.toUpperCase()})
                  </option>
                ))}
              </select>
            )
          ) : (
            <div className="space-y-3">
              <label className="block">
                <div className="border-2 border-dashed border-pixel/30 rounded-xl p-6 text-center hover:border-pixel/60 transition-colors cursor-pointer bg-retro-dark/50">
                  <input
                    type="file"
                    accept=".tf,.txt"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload(file, 2);
                    }}
                    className="hidden"
                  />
                  <div className="text-3xl mb-2">📤</div>
                  <div className="text-sm text-retro-cyan font-semibold">
                    {uploadedTf2 ? uploadedTf2.name : 'Click to upload Terraform file'}
                  </div>
                  <div className="text-xs text-retro-cyan opacity-50 mt-1">
                    .tf or .txt files only
                  </div>
                </div>
              </label>
            </div>
          )}

          {(workflow2 || uploadedTf2) && (
            <div className="mt-4 p-4 bg-retro-dark/50 rounded-xl border border-pixel/20">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-retro-cyan opacity-60">Provider:</span>
                  <span className="text-retro-white font-semibold uppercase">
                    {workflow2 ? workflow2.summary.cloud_provider : uploadedTf2?.provider}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-retro-cyan opacity-60">Region:</span>
                  <span className="text-retro-white font-semibold">
                    {workflow2 ? workflow2.summary.region : uploadedTf2?.region}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-retro-cyan opacity-60">Services:</span>
                  <span className="text-retro-white font-semibold">
                    {workflow2 ? workflow2.summary.services_count : uploadedTf2?.services_count}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Compare Button */}
      <div className="mb-8">
        <button
          onClick={handleCompare}
          disabled={
            comparing ||
            (sourceType1 === 'workflow' && !selectedWorkflow1) ||
            (sourceType1 === 'upload' && !uploadedTf1) ||
            (sourceType2 === 'workflow' && !selectedWorkflow2) ||
            (sourceType2 === 'upload' && !uploadedTf2)
          }
          className={`btn-retro w-full py-4 px-6 font-semibold text-lg flex items-center justify-center gap-3 ${
            comparing ||
            (sourceType1 === 'workflow' && !selectedWorkflow1) ||
            (sourceType1 === 'upload' && !uploadedTf1) ||
            (sourceType2 === 'workflow' && !selectedWorkflow2) ||
            (sourceType2 === 'upload' && !uploadedTf2)
              ? 'opacity-50 cursor-not-allowed'
              : ''
          }`}
        >
          {comparing ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-retro-white"></div>
              Comparing...
            </>
          ) : (
            <>
              <span>⚖️</span>
              Compare Configurations
            </>
          )}
        </button>
      </div>

      {/* Comparison Results */}
      {comparisonResults && (
        <div className="space-y-6">
          {/* Cost Comparison by Provider */}
          <div className="card-retro border border-pixel/30 rounded-2xl p-6">
            <h3 className="text-xl font-bold text-retro-white mb-6 font-heading flex items-center gap-2">
              💰 Cost Comparison Across Cloud Providers
            </h3>

            <div className="space-y-6">
              {Object.entries(providerInfo).map(([provider, info]) => {
                const cost1 = comparisonResults.workflow1.costs[provider];
                const cost2 = comparisonResults.workflow2.costs[provider];
                const { diff, percentage, isHigher } = getCostDifference(cost1, cost2);

                return (
                  <div key={provider} className="border border-pixel/20 rounded-xl p-5 bg-retro-dark/30">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-3xl">{info.icon}</span>
                      <div>
                        <h4 className={`font-bold text-lg ${info.color}`}>{info.name}</h4>
                        <p className="text-xs text-retro-cyan opacity-60 uppercase">{provider}</p>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-4">
                      {/* Workflow 1 Cost */}
                      <div className="p-4 bg-retro-dark rounded-lg border border-pixel/20">
                        <div className="text-xs text-retro-cyan opacity-60 mb-1">Workflow 1</div>
                        <div className="text-xl font-bold text-retro-cyan font-heading">
                          ${cost1.toFixed(2)}
                        </div>
                        <div className="text-xs text-retro-cyan opacity-40 mt-1">per month</div>
                      </div>

                      {/* Workflow 2 Cost */}
                      <div className="p-4 bg-retro-dark rounded-lg border border-pixel/20">
                        <div className="text-xs text-retro-cyan opacity-60 mb-1">Workflow 2</div>
                        <div className="text-xl font-bold text-retro-cyan font-heading">
                          ${cost2.toFixed(2)}
                        </div>
                        <div className="text-xs text-retro-cyan opacity-40 mt-1">per month</div>
                      </div>

                      {/* Difference */}
                      <div className={`p-4 rounded-lg border ${
                        isHigher ? 'bg-red-500/10 border-red-500/30' : 'bg-green-500/10 border-green-500/30'
                      }`}>
                        <div className="text-xs opacity-60 mb-1">
                          {isHigher ? '🔴 Workflow 1 Higher' : '🟢 Workflow 1 Lower'}
                        </div>
                        <div className={`text-xl font-bold font-heading ${
                          isHigher ? 'text-red-400' : 'text-green-400'
                        }`}>
                          ${diff.toFixed(2)}
                        </div>
                        <div className={`text-xs opacity-60 mt-1 ${
                          isHigher ? 'text-red-400' : 'text-green-400'
                        }`}>
                          {percentage}% difference
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Best Value Analysis */}
          <div className="card-retro border border-pixel/30 rounded-2xl p-6">
            <h3 className="text-xl font-bold text-retro-white mb-6 font-heading flex items-center gap-2">
              🎯 Best Value Analysis
            </h3>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Workflow 1 Best Provider */}
              <div className="border border-green-500/30 rounded-xl p-5 bg-green-500/5">
                <h4 className="font-semibold text-retro-white mb-3">
                  {comparisonResults.workflow1.name}
                </h4>
                <div className="space-y-2">
                  {Object.entries(comparisonResults.workflow1.costs)
                    .sort(([, a], [, b]) => (a as number) - (b as number))
                    .map(([provider, cost], index) => (
                      <div
                        key={provider}
                        className={`flex justify-between items-center p-3 rounded-lg ${
                          index === 0
                            ? 'bg-green-500/20 border border-green-500/40'
                            : 'bg-retro-dark/50'
                        }`}
                      >
                        <span className="text-sm text-retro-cyan flex items-center gap-2">
                          {index === 0 && '⭐'} {provider.toUpperCase()}
                        </span>
                        <span className="font-bold text-retro-white">
                          ${(cost as number).toFixed(2)}/mo
                        </span>
                      </div>
                    ))}
                </div>
              </div>

              {/* Workflow 2 Best Provider */}
              <div className="border border-blue-500/30 rounded-xl p-5 bg-blue-500/5">
                <h4 className="font-semibold text-retro-white mb-3">
                  {comparisonResults.workflow2.name}
                </h4>
                <div className="space-y-2">
                  {Object.entries(comparisonResults.workflow2.costs)
                    .sort(([, a], [, b]) => (a as number) - (b as number))
                    .map(([provider, cost], index) => (
                      <div
                        key={provider}
                        className={`flex justify-between items-center p-3 rounded-lg ${
                          index === 0
                            ? 'bg-blue-500/20 border border-blue-500/40'
                            : 'bg-retro-dark/50'
                        }`}
                      >
                        <span className="text-sm text-retro-cyan flex items-center gap-2">
                          {index === 0 && '⭐'} {provider.toUpperCase()}
                        </span>
                        <span className="font-bold text-retro-white">
                          ${(cost as number).toFixed(2)}/mo
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>

          {/* Workflow Specifications Comparison */}
          <div className="card-retro border border-pixel/30 rounded-2xl p-6">
            <h3 className="text-xl font-bold text-retro-white mb-6 font-heading flex items-center gap-2">
              📊 Specifications Comparison
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-pixel/30">
                    <th className="text-left py-3 px-4 text-retro-cyan opacity-60 text-sm font-semibold">
                      Specification
                    </th>
                    <th className="text-left py-3 px-4 text-retro-cyan opacity-60 text-sm font-semibold">
                      Workflow 1
                    </th>
                    <th className="text-left py-3 px-4 text-retro-cyan opacity-60 text-sm font-semibold">
                      Workflow 2
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-pixel/10">
                    <td className="py-3 px-4 text-retro-cyan">Original Provider</td>
                    <td className="py-3 px-4 text-retro-white font-semibold uppercase">
                      {comparisonResults.workflow1.original_provider}
                    </td>
                    <td className="py-3 px-4 text-retro-white font-semibold uppercase">
                      {comparisonResults.workflow2.original_provider}
                    </td>
                  </tr>
                  <tr className="border-b border-pixel/10">
                    <td className="py-3 px-4 text-retro-cyan">Region</td>
                    <td className="py-3 px-4 text-retro-white font-semibold">
                      {comparisonResults.workflow1.region}
                    </td>
                    <td className="py-3 px-4 text-retro-white font-semibold">
                      {comparisonResults.workflow2.region}
                    </td>
                  </tr>
                  <tr className="border-b border-pixel/10">
                    <td className="py-3 px-4 text-retro-cyan">Services Count</td>
                    <td className="py-3 px-4 text-retro-white font-semibold">
                      {comparisonResults.workflow1.services_count}
                    </td>
                    <td className="py-3 px-4 text-retro-white font-semibold">
                      {comparisonResults.workflow2.services_count}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="text-xs text-retro-cyan opacity-40 text-center">
            ⚠️ Cost estimates are AI-generated approximations based on service counts and provider multipliers.
            Actual costs may vary significantly based on usage patterns, region, instance types, and specific service
            configurations. Consult your cloud provider's pricing calculator for exact costs.
          </div>
        </div>
      )}
    </div>
  );
};

export default Compare;
