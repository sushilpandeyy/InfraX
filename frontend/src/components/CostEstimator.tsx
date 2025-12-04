import React, { useState } from 'react';

interface CostEstimatorProps {
  workflow: any;
}

const CostEstimator: React.FC<CostEstimatorProps> = ({ workflow }) => {
  const [selectedProvider, setSelectedProvider] = useState(workflow.summary.cloud_provider || 'aws');
  const [selectedPeriod, setSelectedPeriod] = useState<'daily' | 'monthly' | 'yearly'>('monthly');
  const [instanceHours, setInstanceHours] = useState(24); // Hours per day
  const [scalingFactor, setScalingFactor] = useState(1); // Number of instances/scaling multiplier

  // Base cost estimation (this would come from your backend in production)
  const getBaseCost = () => {
    const providerMultipliers: Record<string, number> = {
      aws: 1.0,
      azure: 1.05,
      gcp: 0.95,
    };

    // Estimate based on services count and provider
    const servicesCount = workflow.summary.services_count || 1;
    const baseMonthlyPerService = 50; // Base estimate per service

    return servicesCount * baseMonthlyPerService * (providerMultipliers[selectedProvider] || 1.0);
  };

  const calculateCost = () => {
    const baseCost = getBaseCost();
    const hourlyRate = baseCost / 730; // Average hours in a month
    const dailyUsage = (instanceHours / 24) * scalingFactor;

    let cost = 0;
    switch (selectedPeriod) {
      case 'daily':
        cost = hourlyRate * instanceHours * scalingFactor;
        break;
      case 'monthly':
        cost = baseCost * scalingFactor * (instanceHours / 24);
        break;
      case 'yearly':
        cost = baseCost * 12 * scalingFactor * (instanceHours / 24);
        break;
    }

    return cost;
  };

  const estimatedCost = calculateCost();
  const estimatedSavings = workflow.summary.estimated_savings || 0;
  const optimizedCost = Math.max(0, estimatedCost - estimatedSavings);

  const providerInfo: Record<string, { name: string; icon: string; color: string }> = {
    aws: { name: 'Amazon Web Services', icon: '☁️', color: 'text-orange-400' },
    azure: { name: 'Microsoft Azure', icon: '⚡', color: 'text-blue-400' },
    gcp: { name: 'Google Cloud Platform', icon: '🔷', color: 'text-blue-500' },
  };

  return (
    <div className="space-y-6">
      {/* Cost Calculator Card */}
      <div className="card-retro border border-pixel/30 rounded-2xl p-6">
        <h3 className="text-xl font-bold text-retro-white mb-4 font-heading flex items-center gap-2">
          💰 Interactive Cost Calculator
        </h3>

        {/* Cloud Provider Selection */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-retro-cyan mb-3">
            Select Cloud Provider
          </label>
          <div className="grid grid-cols-3 gap-3">
            {['aws', 'azure', 'gcp'].map((provider) => (
              <button
                key={provider}
                onClick={() => setSelectedProvider(provider)}
                className={`p-4 rounded-xl border-2 transition-all ${
                  selectedProvider === provider
                    ? 'border-pixel bg-pixel/10 text-retro-white'
                    : 'border-pixel/30 text-retro-cyan opacity-60 hover:opacity-100 hover:border-pixel/60'
                }`}
              >
                <div className="text-2xl mb-1">{providerInfo[provider].icon}</div>
                <div className="text-xs font-semibold uppercase">{provider}</div>
                <div className="text-xs opacity-60 mt-1">{providerInfo[provider].name}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Time Period Selection */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-retro-cyan mb-3">
            Billing Period
          </label>
          <div className="grid grid-cols-3 gap-3">
            {[
              { value: 'daily', label: 'Daily', icon: '📅' },
              { value: 'monthly', label: 'Monthly', icon: '📆' },
              { value: 'yearly', label: 'Yearly', icon: '🗓️' },
            ].map((period) => (
              <button
                key={period.value}
                onClick={() => setSelectedPeriod(period.value as 'daily' | 'monthly' | 'yearly')}
                className={`p-3 rounded-xl border-2 transition-all ${
                  selectedPeriod === period.value
                    ? 'border-pixel bg-pixel/10 text-retro-white'
                    : 'border-pixel/30 text-retro-cyan opacity-60 hover:opacity-100 hover:border-pixel/60'
                }`}
              >
                <div className="text-xl mb-1">{period.icon}</div>
                <div className="text-sm font-semibold">{period.label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Usage Configuration */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Instance Hours */}
          <div>
            <label className="block text-sm font-semibold text-retro-cyan mb-2">
              Hours per Day
            </label>
            <div className="space-y-2">
              <input
                type="range"
                min="1"
                max="24"
                value={instanceHours}
                onChange={(e) => setInstanceHours(Number(e.target.value))}
                className="w-full h-2 bg-retro-dark rounded-lg appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, #00ff00 0%, #00ff00 ${(instanceHours / 24) * 100}%, #1a1a1a ${(instanceHours / 24) * 100}%, #1a1a1a 100%)`
                }}
              />
              <div className="flex justify-between text-xs text-retro-cyan opacity-60">
                <span>1h</span>
                <span className="text-retro-white font-bold text-lg">{instanceHours}h</span>
                <span>24h</span>
              </div>
            </div>
          </div>

          {/* Scaling Factor */}
          <div>
            <label className="block text-sm font-semibold text-retro-cyan mb-2">
              Scaling Factor (Instances)
            </label>
            <div className="space-y-2">
              <input
                type="range"
                min="1"
                max="10"
                value={scalingFactor}
                onChange={(e) => setScalingFactor(Number(e.target.value))}
                className="w-full h-2 bg-retro-dark rounded-lg appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, #00ff00 0%, #00ff00 ${(scalingFactor / 10) * 100}%, #1a1a1a ${(scalingFactor / 10) * 100}%, #1a1a1a 100%)`
                }}
              />
              <div className="flex justify-between text-xs text-retro-cyan opacity-60">
                <span>1x</span>
                <span className="text-retro-white font-bold text-lg">{scalingFactor}x</span>
                <span>10x</span>
              </div>
            </div>
          </div>
        </div>

        {/* Cost Display */}
        <div className="border-t-2 border-pixel/30 pt-6">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="card-retro border border-pixel/30 p-4 rounded-xl">
              <div className="text-xs text-retro-cyan opacity-60 mb-1 uppercase">Estimated Cost</div>
              <div className="text-2xl font-bold text-retro-cyan font-heading">
                ${estimatedCost.toFixed(2)}
              </div>
              <div className="text-xs text-retro-cyan opacity-40 mt-1">
                {selectedPeriod === 'daily' && 'per day'}
                {selectedPeriod === 'monthly' && 'per month'}
                {selectedPeriod === 'yearly' && 'per year'}
              </div>
            </div>

            <div className="card-retro border border-green-500/30 p-4 rounded-xl">
              <div className="text-xs text-green-400 opacity-60 mb-1 uppercase">With Optimization</div>
              <div className="text-2xl font-bold text-green-400 font-heading">
                ${optimizedCost.toFixed(2)}
              </div>
              <div className="text-xs text-green-400 opacity-40 mt-1">
                Saves ${(estimatedCost - optimizedCost).toFixed(2)}
              </div>
            </div>

            <div className="card-retro border border-blue-500/30 p-4 rounded-xl">
              <div className="text-xs text-blue-400 opacity-60 mb-1 uppercase">Savings %</div>
              <div className="text-2xl font-bold text-blue-400 font-heading">
                {estimatedCost > 0 ? ((estimatedSavings / estimatedCost) * 100).toFixed(1) : 0}%
              </div>
              <div className="text-xs text-blue-400 opacity-40 mt-1">
                Cost reduction
              </div>
            </div>
          </div>
        </div>

        {/* Provider-specific notes */}
        <div className="mt-6 p-4 bg-retro-dark/50 rounded-xl border border-pixel/20">
          <div className="flex items-start gap-3">
            <div className="text-2xl">{providerInfo[selectedProvider].icon}</div>
            <div>
              <div className={`font-semibold ${providerInfo[selectedProvider].color} mb-1`}>
                {providerInfo[selectedProvider].name}
              </div>
              <div className="text-xs text-retro-cyan opacity-60">
                {selectedProvider === 'aws' && 'AWS offers pay-as-you-go pricing with potential Reserved Instance savings up to 72%.'}
                {selectedProvider === 'azure' && 'Azure provides flexible pricing with Azure Hybrid Benefit for existing licenses.'}
                {selectedProvider === 'gcp' && 'GCP offers sustained use discounts and committed use contracts for cost optimization.'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cost Breakdown */}
      <div className="card-retro border border-pixel/30 rounded-2xl p-6">
        <h3 className="text-lg font-bold text-retro-white mb-4 font-heading">
          📊 Cost Breakdown
        </h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center p-3 bg-retro-dark/50 rounded-lg">
            <span className="text-sm text-retro-cyan">Services Deployed</span>
            <span className="font-bold text-retro-white">{workflow.summary.services_count || 0}</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-retro-dark/50 rounded-lg">
            <span className="text-sm text-retro-cyan">Usage Hours/Day</span>
            <span className="font-bold text-retro-white">{instanceHours}h</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-retro-dark/50 rounded-lg">
            <span className="text-sm text-retro-cyan">Scaling Factor</span>
            <span className="font-bold text-retro-white">{scalingFactor}x</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-retro-dark/50 rounded-lg">
            <span className="text-sm text-retro-cyan">Selected Provider</span>
            <span className="font-bold text-retro-white uppercase">{selectedProvider}</span>
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="text-xs text-retro-cyan opacity-40 text-center">
        ⚠️ Cost estimates are AI-generated approximations. Actual costs may vary based on usage patterns,
        region, and specific service configurations. Consult your cloud provider's pricing calculator for exact costs.
      </div>
    </div>
  );
};

export default CostEstimator;
