import React, { useState } from 'react';
import { vishuApi } from '../api/brahma';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface AdvancedVishuFeaturesProps {
  workflowId: string;
  className?: string;
}

const AdvancedVishuFeatures: React.FC<AdvancedVishuFeaturesProps> = ({
  workflowId,
  className = '',
}) => {
  const [activeFeature, setActiveFeature] = useState<'query' | 'cost'>('query');

  // Natural Language Query State
  const [nlQuery, setNlQuery] = useState('');
  const [queryLoading, setQueryLoading] = useState(false);
  const [queryResult, setQueryResult] = useState<any>(null);

  // Predictive Cost State
  const [costLoading, setCostLoading] = useState(false);
  const [costResult, setCostResult] = useState<any>(null);
  const [costMonths, setCostMonths] = useState(12);
  const [growthRate, setGrowthRate] = useState(5);
  const [usagePattern, setUsagePattern] = useState('steady');

  // Cost Query State
  const [costQuery, setCostQuery] = useState('');
  const [costQueryLoading, setCostQueryLoading] = useState(false);
  const [costQueryResult, setCostQueryResult] = useState<any>(null);

  const quickQueries = [
    "Show me all S3 buckets",
    "List EC2 instances",
    "Find resources without encryption",
    "What databases are we using?",
    "Show me all security groups",
    "List all load balancers",
  ];

  const costQueries = [
    "What will this cost in 6 months?",
    "Which resources are most expensive?",
    "How can I reduce database costs?",
    "What's my yearly estimate?",
    "Show me cost breakdown by category",
    "What are the optimization opportunities?",
  ];

  const handleNLQuery = async () => {
    if (!nlQuery.trim()) return;

    setQueryLoading(true);
    try {
      const result = await vishuApi.naturalLanguageQuery(workflowId, nlQuery);
      setQueryResult(result);
    } catch (error) {
      console.error('Natural language query failed:', error);
      alert('Failed to execute query: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setQueryLoading(false);
    }
  };

  const handlePredictiveCost = async () => {
    setCostLoading(true);
    try {
      const result = await vishuApi.predictiveCosts(
        workflowId,
        costMonths,
        growthRate / 100,
        usagePattern
      );
      setCostResult(result);
    } catch (error) {
      console.error('Predictive cost analysis failed:', error);
      alert('Failed to predict costs: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setCostLoading(false);
    }
  };

  const handleCostQuery = async () => {
    if (!costQuery.trim()) return;

    setCostQueryLoading(true);
    try {
      const result = await vishuApi.costQuery(workflowId, costQuery);
      setCostQueryResult(result);
    } catch (error) {
      console.error('Cost query failed:', error);
      alert('Failed to execute cost query: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setCostQueryLoading(false);
    }
  };

  const getCostChartData = () => {
    if (!costResult?.monthly_projections) return null;

    return {
      labels: costResult.monthly_projections.map((m: any) => `Month ${m.month}`),
      datasets: [
        {
          label: 'Monthly Cost',
          data: costResult.monthly_projections.map((m: any) => m.cost),
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.5)',
          tension: 0.3,
        },
        {
          label: 'Cumulative Cost',
          data: costResult.monthly_projections.map((m: any) => m.cumulative),
          borderColor: 'rgb(168, 85, 247)',
          backgroundColor: 'rgba(168, 85, 247, 0.5)',
          tension: 0.3,
        },
      ],
    };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: '#e5e7eb',
        },
      },
      title: {
        display: true,
        text: 'Cost Projection Over Time',
        color: '#e5e7eb',
      },
    },
    scales: {
      y: {
        ticks: {
          color: '#9ca3af',
          callback: function(value: any) {
            return '$' + value.toFixed(2);
          }
        },
        grid: {
          color: 'rgba(75, 85, 99, 0.2)',
        },
      },
      x: {
        ticks: {
          color: '#9ca3af',
        },
        grid: {
          color: 'rgba(75, 85, 99, 0.2)',
        },
      },
    },
  };

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Feature Toggle */}
      <div className="card-retro border-b border-pixel/30 px-6 py-4 rounded-t-2xl">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setActiveFeature('query')}
            className={`px-4 py-2 rounded-lg font-semibold transition-all ${
              activeFeature === 'query'
                ? 'bg-retro-cyan text-retro-white'
                : 'border-pixel bg-retro-dark border border-pixel/30 text-retro-cyan opacity-80 hover:bg-retro-cyan/20'
            }`}
          >
            🔍 Natural Language Queries
          </button>
          <button
            onClick={() => setActiveFeature('cost')}
            className={`px-4 py-2 rounded-lg font-semibold transition-all ${
              activeFeature === 'cost'
                ? 'bg-retro-cyan text-retro-white'
                : 'border-pixel bg-retro-dark border border-pixel/30 text-retro-cyan opacity-80 hover:bg-retro-cyan/20'
            }`}
          >
            📊 Predictive Cost Analysis
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {/* Natural Language Query Feature */}
        {activeFeature === 'query' && (
          <div className="space-y-6">
            <div className="card-retro p-6 rounded-xl border border-pixel/30">
              <h3 className="text-lg font-bold text-retro-white mb-4" className="font-heading">
                Ask Vishu About Your Infrastructure
              </h3>
              <p className="text-sm text-retro-cyan opacity-60 mb-4">
                Query your Terraform code using natural language. Vishu will find and explain resources for you.
              </p>

              {/* Quick Questions */}
              <div className="mb-4">
                <p className="text-xs text-retro-cyan opacity-60 mb-2 font-semibold uppercase tracking-wide">
                  Quick Queries:
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {quickQueries.map((query, index) => (
                    <button
                      key={index}
                      onClick={() => setNlQuery(query)}
                      className="text-xs px-3 py-2 rounded-lg border-pixel bg-retro-dark border border-pixel/30 text-retro-cyan opacity-80 hover:bg-retro-cyan/20 transition-all text-left"
                    >
                      {query}
                    </button>
                  ))}
                </div>
              </div>

              {/* Query Input */}
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={nlQuery}
                  onChange={(e) => setNlQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleNLQuery()}
                  placeholder="e.g., Show me all S3 buckets"
                  className="flex-1 bg-transparent border border-pixel/30 rounded-xl px-4 py-3 text-retro-cyan placeholder-vintage-white/50 focus:outline-none focus:ring-2 focus:ring-blue-primary/50"
                />
                <button
                  onClick={handleNLQuery}
                  disabled={queryLoading || !nlQuery.trim()}
                  className="bg-retro-cyan hover:bg-retro-cyan/80 disabled:bg-retro-dark/50 text-retro-white px-6 py-3 rounded-xl font-semibold transition-all disabled:cursor-not-allowed"
                >
                  {queryLoading ? '🔄 Searching...' : '🔍 Query'}
                </button>
              </div>
            </div>

            {/* Query Results */}
            {queryResult && queryResult.success && (
              <div className="card-retro p-6 rounded-xl border border-pixel/30">
                <h4 className="text-md font-bold text-retro-cyan mb-3">
                  Query Interpretation: {queryResult.query_interpretation}
                </h4>
                <p className="text-sm text-retro-cyan opacity-60 mb-4">
                  Found {queryResult.total_matches} match(es) out of {queryResult.total_resources_scanned} total resources
                </p>

                {queryResult.matched_resources && queryResult.matched_resources.length > 0 ? (
                  <div className="space-y-3">
                    {queryResult.matched_resources.map((match: any, index: number) => (
                      <div key={index} className="border-pixel bg-retro-dark p-4 rounded-lg border border-pixel/20">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="text-sm font-bold text-retro-cyan">
                              {match.resource.full_name || match.resource.name}
                            </p>
                            <p className="text-xs text-retro-cyan opacity-60">Type: {match.resource.type}</p>
                          </div>
                          <span className="text-xs px-2 py-1 rounded bg-retro-dark border-pixel/20 text-retro-cyan">
                            {(match.relevance_score * 100).toFixed(0)}% match
                          </span>
                        </div>
                        <p className="text-sm text-retro-cyan opacity-80 mb-2">{match.match_reason}</p>
                        {match.resource.properties && (
                          <div className="mt-2 p-3 bg-retro-dark900/50 rounded text-xs font-mono text-retro-cyan opacity-60">
                            {JSON.stringify(match.resource.properties, null, 2)}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-retro-cyan opacity-60">No matching resources found.</p>
                )}

                {queryResult.suggestions && queryResult.suggestions.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-pixel/20">
                    <p className="text-xs text-retro-cyan opacity-60 mb-2">Try these queries:</p>
                    <div className="flex flex-wrap gap-2">
                      {queryResult.suggestions.map((suggestion: string, index: number) => (
                        <button
                          key={index}
                          onClick={() => setNlQuery(suggestion)}
                          className="text-xs px-3 py-1 rounded-lg border-pixel bg-retro-dark border border-pixel/30 text-retro-cyan opacity-80 hover:bg-retro-cyan/20"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Predictive Cost Analysis Feature */}
        {activeFeature === 'cost' && (
          <div className="space-y-6">
            <div className="card-retro p-6 rounded-xl border border-pixel/30">
              <h3 className="text-lg font-bold text-retro-white mb-4" className="font-heading">
                Predict Future Infrastructure Costs
              </h3>
              <p className="text-sm text-retro-cyan opacity-60 mb-4">
                Forecast your infrastructure costs with AI-powered projections and growth modeling.
              </p>

              {/* Cost Parameters */}
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-xs text-retro-cyan opacity-60 mb-2">Forecast Months</label>
                  <input
                    type="number"
                    value={costMonths}
                    onChange={(e) => setCostMonths(Number(e.target.value))}
                    min="1"
                    max="36"
                    className="w-full bg-transparent border border-pixel/30 rounded-lg px-3 py-2 text-retro-cyan focus:outline-none focus:ring-2 focus:ring-blue-primary/50"
                  />
                </div>
                <div>
                  <label className="block text-xs text-retro-cyan opacity-60 mb-2">Growth Rate (%/month)</label>
                  <input
                    type="number"
                    value={growthRate}
                    onChange={(e) => setGrowthRate(Number(e.target.value))}
                    min="0"
                    max="50"
                    step="0.5"
                    className="w-full bg-transparent border border-pixel/30 rounded-lg px-3 py-2 text-retro-cyan focus:outline-none focus:ring-2 focus:ring-blue-primary/50"
                  />
                </div>
                <div>
                  <label className="block text-xs text-retro-cyan opacity-60 mb-2">Usage Pattern</label>
                  <select
                    value={usagePattern}
                    onChange={(e) => setUsagePattern(e.target.value)}
                    className="w-full bg-retro-dark900 border border-pixel/30 rounded-lg px-3 py-2 text-retro-cyan focus:outline-none focus:ring-2 focus:ring-blue-primary/50"
                  >
                    <option value="steady">Steady</option>
                    <option value="growing">Growing</option>
                    <option value="seasonal">Seasonal</option>
                    <option value="declining">Declining</option>
                  </select>
                </div>
              </div>

              <button
                onClick={handlePredictiveCost}
                disabled={costLoading}
                className="w-full bg-retro-cyan hover:bg-retro-cyan/80 disabled:bg-retro-dark/50 text-retro-white px-6 py-3 rounded-xl font-semibold transition-all disabled:cursor-not-allowed"
              >
                {costLoading ? '🔄 Analyzing...' : '📊 Generate Cost Forecast'}
              </button>
            </div>

            {/* Cost Results */}
            {costResult && costResult.success && (
              <>
                {/* Summary Cards */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="card-retro p-6 rounded-xl border border-pixel/30">
                    <h4 className="text-xs text-retro-cyan opacity-60 mb-2">Base Monthly Cost</h4>
                    <p className="text-3xl font-bold text-retro-cyan" className="font-heading">
                      ${costResult.base_monthly_cost?.toFixed(2)}
                    </p>
                  </div>
                  <div className="card-retro p-6 rounded-xl border border-pixel/30">
                    <h4 className="text-xs text-retro-cyan opacity-60 mb-2">Yearly Total</h4>
                    <p className="text-3xl font-bold text-retro-cyan" className="font-heading">
                      ${costResult.yearly_total?.toFixed(2)}
                    </p>
                  </div>
                </div>

                {/* Cost Chart */}
                {getCostChartData() && (
                  <div className="card-retro p-6 rounded-xl border border-pixel/30">
                    <div className="h-80">
                      <Line data={getCostChartData()!} options={chartOptions} />
                    </div>
                  </div>
                )}

                {/* Cost Breakdown */}
                {costResult.cost_breakdown && (
                  <div className="card-retro p-6 rounded-xl border border-pixel/30">
                    <h4 className="text-md font-bold text-retro-white mb-4">Cost Breakdown by Category</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {Object.entries(costResult.cost_breakdown).map(([category, cost]: [string, any]) => (
                        <div key={category} className="border-pixel bg-retro-dark p-3 rounded-lg">
                          <p className="text-xs text-retro-cyan opacity-60 capitalize">{category}</p>
                          <p className="text-lg font-bold text-retro-cyan">${cost.toFixed(2)}/mo</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Optimization Opportunities */}
                {costResult.optimization_opportunities && costResult.optimization_opportunities.length > 0 && (
                  <div className="card-retro p-6 rounded-xl border border-pixel500/30">
                    <h4 className="text-md font-bold text-retro-cyan mb-3">💡 Optimization Opportunities</h4>
                    <ul className="space-y-2">
                      {costResult.optimization_opportunities.map((opp: string, index: number) => (
                        <li key={index} className="text-sm text-retro-cyan opacity-80">
                          • {opp}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Cost Drivers */}
                {costResult.cost_drivers && costResult.cost_drivers.length > 0 && (
                  <div className="card-retro p-6 rounded-xl border border-pixel/30">
                    <h4 className="text-md font-bold text-retro-white mb-3">🎯 Key Cost Drivers</h4>
                    <ul className="space-y-2">
                      {costResult.cost_drivers.map((driver: string, index: number) => (
                        <li key={index} className="text-sm text-retro-cyan opacity-80">
                          • {driver}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            )}

            {/* Natural Language Cost Queries */}
            <div className="card-retro p-6 rounded-xl border border-pixel/30">
              <h3 className="text-lg font-bold text-retro-white mb-4" className="font-heading">
                💬 Ask Cost Questions
              </h3>

              {/* Quick Cost Questions */}
              <div className="mb-4">
                <p className="text-xs text-retro-cyan opacity-60 mb-2">Quick Questions:</p>
                <div className="grid grid-cols-2 gap-2">
                  {costQueries.map((query, index) => (
                    <button
                      key={index}
                      onClick={() => setCostQuery(query)}
                      className="text-xs px-3 py-2 rounded-lg border-pixel bg-retro-dark border border-pixel/30 text-retro-cyan opacity-80 hover:bg-retro-dark/20 transition-all text-left"
                    >
                      {query}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={costQuery}
                  onChange={(e) => setCostQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleCostQuery()}
                  placeholder="e.g., What will this cost in 6 months?"
                  className="flex-1 bg-transparent border border-pixel/30 rounded-xl px-4 py-3 text-retro-cyan placeholder-vintage-white/50 focus:outline-none focus:ring-2 focus:ring-vintage/50"
                />
                <button
                  onClick={handleCostQuery}
                  disabled={costQueryLoading || !costQuery.trim()}
                  className="bg-retro-cyan hover:bg-retro-cyan/80 disabled:bg-retro-dark/50 text-retro-white px-6 py-3 rounded-xl font-semibold transition-all disabled:cursor-not-allowed"
                >
                  {costQueryLoading ? '🔄 Thinking...' : '💡 Ask'}
                </button>
              </div>

              {/* Cost Query Answer */}
              {costQueryResult && costQueryResult.success && (
                <div className="mt-4 p-4 border-pixel bg-retro-dark border border-pixel/30 rounded-xl">
                  <h5 className="text-sm font-bold text-retro-cyan mb-2">Answer:</h5>
                  <div className="text-sm text-retro-cyan opacity-80 leading-relaxed whitespace-pre-wrap">
                    {costQueryResult.answer}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdvancedVishuFeatures;
