import React, { useState } from 'react';

const Shiva: React.FC = () => {
  const [logs, setLogs] = useState('');
  const [metrics, setMetrics] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<any>(null);
  const [selectedSource, setSelectedSource] = useState<'logs' | 'prometheus'>('logs');

  const handleAnalyze = async () => {
    const dataToAnalyze = selectedSource === 'logs' ? logs : metrics;
    if (!dataToAnalyze.trim()) return;

    setAnalyzing(true);
    setAnalysisResults(null);

    try {
      // Simulate AI analysis (integrate with backend API later)
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Mock analysis results
      const mockResults = {
        services_analyzed: 12,
        unused_services: [
          {
            name: 'cache-service-old',
            type: 'Redis Cache',
            last_used: '45 days ago',
            monthly_cost: 45.00,
            reason: 'No activity detected in logs for 45+ days',
            confidence: 95
          },
          {
            name: 'analytics-worker-v1',
            type: 'EC2 Instance',
            last_used: '30 days ago',
            monthly_cost: 125.00,
            reason: 'Replaced by analytics-worker-v2, zero requests',
            confidence: 98
          },
          {
            name: 'backup-storage-temp',
            type: 'S3 Bucket',
            last_used: '60 days ago',
            monthly_cost: 15.00,
            reason: 'Temporary storage no longer accessed',
            confidence: 92
          },
        ],
        underutilized_services: [
          {
            name: 'api-server-3',
            type: 'EC2 Instance',
            utilization: '15%',
            monthly_cost: 180.00,
            recommendation: 'Downsize from t3.large to t3.medium',
            potential_savings: 90.00
          },
          {
            name: 'database-replica-2',
            type: 'RDS Instance',
            utilization: '22%',
            monthly_cost: 250.00,
            recommendation: 'Consider removing or using smaller instance type',
            potential_savings: 125.00
          },
        ],
        total_potential_savings: 580.00,
        recommendations: [
          'Decommission 3 unused services to save $185/month',
          'Optimize 2 underutilized services to save $215/month',
          'Review and update auto-scaling policies',
          'Implement automated resource cleanup policies',
        ],
        analysis_timestamp: new Date().toISOString(),
      };

      setAnalysisResults(mockResults);
    } catch (error) {
      console.error('Analysis failed:', error);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'logs' | 'prometheus') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (type === 'logs') {
        setLogs(content);
      } else {
        setMetrics(content);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="animate-slide-up">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl lg:text-4xl font-bold text-retro-white mb-2 font-heading">
          🔥 Shiva - Resource Destruction Advisor
        </h1>
        <p className="text-retro-cyan opacity-60">
          Analyze logs and Prometheus metrics to identify unused or underutilized services for cost optimization
        </p>
      </div>

      {/* Data Source Selection */}
      <div className="card-retro border border-pixel/30 rounded-2xl p-6 mb-6">
        <h3 className="text-lg font-bold text-retro-white mb-4 font-heading">
          📊 Select Data Source
        </h3>
        <div className="grid grid-cols-2 gap-4 mb-6">
          <button
            onClick={() => setSelectedSource('logs')}
            className={`p-4 rounded-xl border-2 transition-all ${
              selectedSource === 'logs'
                ? 'border-pixel bg-pixel/10 text-retro-white'
                : 'border-pixel/30 text-retro-cyan opacity-60 hover:opacity-100'
            }`}
          >
            <div className="text-2xl mb-2">📝</div>
            <div className="text-sm font-semibold">Application Logs</div>
            <div className="text-xs opacity-60 mt-1">Analyze service usage from logs</div>
          </button>
          <button
            onClick={() => setSelectedSource('prometheus')}
            className={`p-4 rounded-xl border-2 transition-all ${
              selectedSource === 'prometheus'
                ? 'border-pixel bg-pixel/10 text-retro-white'
                : 'border-pixel/30 text-retro-cyan opacity-60 hover:opacity-100'
            }`}
          >
            <div className="text-2xl mb-2">📈</div>
            <div className="text-sm font-semibold">Prometheus Metrics</div>
            <div className="text-xs opacity-60 mt-1">Analyze resource utilization</div>
          </button>
        </div>

        {/* File Upload / Paste Area */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-retro-cyan mb-2">
              {selectedSource === 'logs' ? 'Upload or Paste Logs' : 'Upload or Paste Prometheus Metrics'}
            </label>

            {/* File Upload */}
            <div className="mb-3">
              <label className="block">
                <div className="border-2 border-dashed border-pixel/30 rounded-xl p-4 text-center hover:border-pixel/60 transition-colors cursor-pointer bg-retro-dark/50">
                  <input
                    type="file"
                    accept=".log,.txt,.json"
                    onChange={(e) => handleFileUpload(e, selectedSource)}
                    className="hidden"
                  />
                  <div className="text-2xl mb-2">📤</div>
                  <div className="text-sm text-retro-cyan font-semibold">
                    Click to upload {selectedSource === 'logs' ? 'log' : 'metrics'} file
                  </div>
                  <div className="text-xs text-retro-cyan opacity-50 mt-1">
                    .log, .txt, .json files supported
                  </div>
                </div>
              </label>
            </div>

            {/* Text Area */}
            <textarea
              value={selectedSource === 'logs' ? logs : metrics}
              onChange={(e) => selectedSource === 'logs' ? setLogs(e.target.value) : setMetrics(e.target.value)}
              placeholder={selectedSource === 'logs'
                ? 'Paste your application logs here...\nExample:\n2024-01-01 10:00:00 INFO [api-server-1] Request processed\n2024-01-01 10:00:05 INFO [api-server-2] Request processed\n...'
                : 'Paste your Prometheus metrics here...\nExample:\ncontainer_cpu_usage_seconds_total{service="api"} 0.15\ncontainer_memory_usage_bytes{service="api"} 524288000\n...'
              }
              className="w-full px-4 py-3 bg-retro-dark border border-pixel/30 rounded-xl text-retro-white placeholder-retro-cyan/40 focus:outline-none focus:border-pixel transition-colors resize-none font-mono text-xs"
              rows={12}
              disabled={analyzing}
            />
          </div>

          <button
            onClick={handleAnalyze}
            disabled={analyzing || (selectedSource === 'logs' ? !logs.trim() : !metrics.trim())}
            className={`btn-retro w-full py-3 px-6 font-semibold flex items-center justify-center gap-2 ${
              analyzing || (selectedSource === 'logs' ? !logs.trim() : !metrics.trim())
                ? 'opacity-50 cursor-not-allowed'
                : ''
            }`}
          >
            {analyzing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-retro-white"></div>
                Analyzing...
              </>
            ) : (
              <>
                <span>🔍</span>
                Analyze for Unused Resources
              </>
            )}
          </button>
        </div>
      </div>

      {/* Analysis Results */}
      {analysisResults && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid md:grid-cols-4 gap-4">
            <div className="card-retro border border-pixel/30 p-4 rounded-xl">
              <div className="text-xs text-retro-cyan opacity-60 mb-1 uppercase">Services Analyzed</div>
              <div className="text-2xl font-bold text-retro-cyan font-heading">
                {analysisResults.services_analyzed}
              </div>
            </div>
            <div className="card-retro border border-red-500/30 p-4 rounded-xl">
              <div className="text-xs text-red-400 opacity-60 mb-1 uppercase">Unused Services</div>
              <div className="text-2xl font-bold text-red-400 font-heading">
                {analysisResults.unused_services.length}
              </div>
            </div>
            <div className="card-retro border border-yellow-500/30 p-4 rounded-xl">
              <div className="text-xs text-yellow-400 opacity-60 mb-1 uppercase">Underutilized</div>
              <div className="text-2xl font-bold text-yellow-400 font-heading">
                {analysisResults.underutilized_services.length}
              </div>
            </div>
            <div className="card-retro border border-green-500/30 p-4 rounded-xl">
              <div className="text-xs text-green-400 opacity-60 mb-1 uppercase">Potential Savings</div>
              <div className="text-2xl font-bold text-green-400 font-heading">
                ${analysisResults.total_potential_savings}/mo
              </div>
            </div>
          </div>

          {/* Unused Services */}
          <div className="card-retro border border-red-500/30 rounded-2xl p-6">
            <h3 className="text-xl font-bold text-red-400 mb-4 font-heading flex items-center gap-2">
              🗑️ Unused Services - Recommended for Deletion
            </h3>
            <div className="space-y-3">
              {analysisResults.unused_services.map((service: any, index: number) => (
                <div key={index} className="p-4 bg-retro-dark/50 rounded-xl border border-red-500/20">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-bold text-retro-white">{service.name}</h4>
                      <p className="text-xs text-retro-cyan opacity-60">{service.type}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-red-400">${service.monthly_cost}/mo</div>
                      <div className="text-xs text-retro-cyan opacity-60">Last used: {service.last_used}</div>
                    </div>
                  </div>
                  <p className="text-sm text-retro-cyan mb-2">{service.reason}</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-retro-dark rounded-full h-2">
                      <div
                        className="bg-red-500 h-2 rounded-full"
                        style={{ width: `${service.confidence}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-retro-cyan opacity-60">{service.confidence}% confidence</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Underutilized Services */}
          <div className="card-retro border border-yellow-500/30 rounded-2xl p-6">
            <h3 className="text-xl font-bold text-yellow-400 mb-4 font-heading flex items-center gap-2">
              ⚠️ Underutilized Services - Optimization Needed
            </h3>
            <div className="space-y-3">
              {analysisResults.underutilized_services.map((service: any, index: number) => (
                <div key={index} className="p-4 bg-retro-dark/50 rounded-xl border border-yellow-500/20">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-bold text-retro-white">{service.name}</h4>
                      <p className="text-xs text-retro-cyan opacity-60">{service.type}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-yellow-400">${service.monthly_cost}/mo</div>
                      <div className="text-xs text-retro-cyan opacity-60">Utilization: {service.utilization}</div>
                    </div>
                  </div>
                  <p className="text-sm text-retro-cyan mb-2">💡 {service.recommendation}</p>
                  <div className="text-sm text-green-400">
                    Potential savings: <span className="font-bold">${service.potential_savings}/mo</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recommendations */}
          <div className="card-retro border border-pixel/30 rounded-2xl p-6">
            <h3 className="text-xl font-bold text-retro-white mb-4 font-heading flex items-center gap-2">
              💡 Actionable Recommendations
            </h3>
            <ul className="space-y-2">
              {analysisResults.recommendations.map((rec: string, index: number) => (
                <li key={index} className="flex items-start gap-3 p-3 bg-retro-dark/50 rounded-lg">
                  <span className="text-pixel text-lg">▸</span>
                  <span className="text-retro-cyan">{rec}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Disclaimer */}
          <div className="text-xs text-retro-cyan opacity-40 text-center">
            ⚠️ AI-generated analysis based on provided data. Always verify before deleting or modifying production resources.
            Analysis timestamp: {new Date(analysisResults.analysis_timestamp).toLocaleString()}
          </div>
        </div>
      )}
    </div>
  );
};

export default Shiva;
