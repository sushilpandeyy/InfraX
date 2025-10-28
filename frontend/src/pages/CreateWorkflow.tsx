import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { brahmaApi } from '../api/brahma';

const CreateWorkflow: React.FC = () => {
  const navigate = useNavigate();

  // Form state
  const [prompt, setPrompt] = useState('');
  const [environment, setEnvironment] = useState('production');
  const [expectedUsers, setExpectedUsers] = useState('1K-10K');
  const [workloadType, setWorkloadType] = useState('web-application');
  const [location, setLocation] = useState('');
  const [budget, setBudget] = useState('');
  const [highAvailability, setHighAvailability] = useState('yes');
  const [compliance, setCompliance] = useState('none');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState('');
  const [progress, setProgress] = useState(0);

  const environments = [
    { value: 'development', label: 'Development', description: 'Cost-optimized, minimal scaling' },
    { value: 'staging', label: 'Staging', description: 'Production-like, limited scale' },
    { value: 'production', label: 'Production', description: 'Full scale, high availability' },
  ];

  const userRanges = [
    { value: '<100', label: 'Less than 100 users' },
    { value: '100-1K', label: '100 - 1,000 users' },
    { value: '1K-10K', label: '1,000 - 10,000 users' },
    { value: '10K-100K', label: '10,000 - 100,000 users' },
    { value: '100K-1M', label: '100,000 - 1M users' },
    { value: '1M+', label: '1M+ users' },
  ];

  const workloadTypes = [
    { value: 'web-application', label: 'Web Application' },
    { value: 'api-service', label: 'API Service' },
    { value: 'mobile-backend', label: 'Mobile Backend' },
    { value: 'e-commerce', label: 'E-commerce Platform' },
    { value: 'saas', label: 'SaaS Application' },
    { value: 'data-processing', label: 'Data Processing' },
    { value: 'ml-ai', label: 'ML/AI Workload' },
    { value: 'iot', label: 'IoT Platform' },
  ];

  const budgetRanges = [
    { value: '', label: 'Not specified' },
    { value: '<500', label: 'Under $500/month' },
    { value: '500-2K', label: '$500 - $2,000/month' },
    { value: '2K-5K', label: '$2,000 - $5,000/month' },
    { value: '5K-10K', label: '$5,000 - $10,000/month' },
    { value: '10K+', label: '$10,000+/month' },
  ];

  const complianceOptions = [
    { value: 'none', label: 'None' },
    { value: 'gdpr', label: 'GDPR' },
    { value: 'hipaa', label: 'HIPAA' },
    { value: 'pci-dss', label: 'PCI-DSS' },
    { value: 'soc2', label: 'SOC 2' },
    { value: 'iso27001', label: 'ISO 27001' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setProgress(0);

    let progressInterval: NodeJS.Timeout | null = null;
    const stepTimeouts: NodeJS.Timeout[] = [];

    try {
      // Build enhanced prompt with structured data
      const enhancedPrompt = buildEnhancedPrompt();

      // Step 1: Starting workflow
      setCurrentStep('Initializing workflow...');
      setProgress(10);

      // Step 2: Intelligent planning
      setCurrentStep('ANALYZING REQUIREMENTS AND PLANNING INFRASTRUCTURE...');
      setProgress(20);

      // Simulate progress updates for better UX
      progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) return 90; // Stop at 90% until actual completion
          return prev + 5;
        });
      }, 1500);

      // Update step descriptions during execution
      stepTimeouts.push(setTimeout(() => setCurrentStep('OPTIMIZING COSTS AND RESOURCE ALLOCATION...'), 3000));
      stepTimeouts.push(setTimeout(() => setCurrentStep('SELECTING OPTIMAL CLOUD SERVICES...'), 6000));
      stepTimeouts.push(setTimeout(() => setCurrentStep('GENERATING PRODUCTION-READY TERRAFORM CODE...'), 9000));
      stepTimeouts.push(setTimeout(() => setCurrentStep('CREATING ARCHITECTURE DIAGRAMS...'), 12000));

      const result = await brahmaApi.executeIntelligentWorkflow({
        prompt: enhancedPrompt,
        location: location || undefined,
      });

      // Clear all intervals and timeouts
      if (progressInterval) clearInterval(progressInterval);
      stepTimeouts.forEach(timeout => clearTimeout(timeout));

      // Completion
      setCurrentStep('WORKFLOW COMPLETED SUCCESSFULLY!');
      setProgress(100);

      // Navigate after a brief delay
      setTimeout(() => {
        navigate(`/workflows/${result.workflow_id}`);
      }, 500);

    } catch (err: unknown) {
      // Clear all intervals and timeouts on error
      if (progressInterval) clearInterval(progressInterval);
      stepTimeouts.forEach(timeout => clearTimeout(timeout));

      const error = err as { response?: { data?: { detail?: string } } };
      let errorMessage = 'Failed to execute workflow';

      if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      } else if ((err as Error).message) {
        errorMessage = (err as Error).message;
      }

      // Add helpful context based on error type
      if (errorMessage.includes('Network Error') || errorMessage.includes('ECONNREFUSED')) {
        errorMessage = '[ERROR] Cannot connect to backend server. Please ensure the API is running on http://localhost:8000';
      } else if (errorMessage.includes('timeout')) {
        errorMessage = '[TIMEOUT] Request timed out. The infrastructure generation is taking longer than expected. Please try again.';
      } else if (errorMessage.includes('OpenAI') || errorMessage.includes('API key')) {
        errorMessage = '[API ERROR] OpenAI API error. Please check your API key configuration in the backend .env file.';
      }

      setError(errorMessage);
      setCurrentStep('');
      setProgress(0);
    } finally {
      setLoading(false);
    }
  };

  const buildEnhancedPrompt = (): string => {
    let enhancedPrompt = prompt;

    // Add environment context
    if (environment === 'development') {
      enhancedPrompt += `\n\nEnvironment: DEVELOPMENT - Focus on cost optimization, minimal scaling, use smaller instance types. No need for multi-AZ or extensive monitoring.`;
    } else if (environment === 'staging') {
      enhancedPrompt += `\n\nEnvironment: STAGING - Production-like setup but with reduced capacity. Include basic monitoring and logging.`;
    } else {
      enhancedPrompt += `\n\nEnvironment: PRODUCTION - Full production setup with high availability, comprehensive monitoring, and proper scaling.`;
    }

    // Add scale context
    enhancedPrompt += `\n\nExpected Users: ${expectedUsers}. Design infrastructure to handle this scale efficiently.`;

    // Add workload type
    const workload = workloadTypes.find(w => w.value === workloadType);
    if (workload) {
      enhancedPrompt += `\n\nWorkload Type: ${workload.label}`;
    }

    // Add HA requirements
    if (highAvailability === 'yes' && environment === 'production') {
      enhancedPrompt += `\n\nHigh Availability: Required - Use multi-AZ deployment, load balancing, and auto-scaling.`;
    } else if (environment !== 'development') {
      enhancedPrompt += `\n\nHigh Availability: Standard setup with basic redundancy.`;
    }

    // Add budget constraints
    if (budget) {
      enhancedPrompt += `\n\nBudget: ${budgetRanges.find(b => b.value === budget)?.label}. Optimize costs while meeting requirements.`;
    }

    // Add compliance
    if (compliance !== 'none') {
      const complianceLabel = complianceOptions.find(c => c.value === compliance)?.label;
      enhancedPrompt += `\n\nCompliance: ${complianceLabel} compliance required. Ensure all security and data handling requirements are met.`;
    }

    return enhancedPrompt;
  };

  const loadQuickStart = (type: string) => {
    const quickStarts: Record<string, any> = {
      'dev-test': {
        prompt: 'Simple web application for development and testing',
        environment: 'development',
        expectedUsers: '<100',
        workloadType: 'web-application',
        budget: '<500',
        highAvailability: 'no',
      },
      'small-prod': {
        prompt: 'Production web application for a small business',
        environment: 'production',
        expectedUsers: '100-1K',
        workloadType: 'web-application',
        budget: '500-2K',
        highAvailability: 'yes',
      },
      'enterprise': {
        prompt: 'Enterprise-grade application with high traffic',
        environment: 'production',
        expectedUsers: '100K-1M',
        workloadType: 'saas',
        budget: '10K+',
        highAvailability: 'yes',
        compliance: 'soc2',
      },
    };

    const quickStart = quickStarts[type];
    if (quickStart) {
      setPrompt(quickStart.prompt);
      setEnvironment(quickStart.environment);
      setExpectedUsers(quickStart.expectedUsers);
      setWorkloadType(quickStart.workloadType);
      setBudget(quickStart.budget);
      setHighAvailability(quickStart.highAvailability);
      if (quickStart.compliance) setCompliance(quickStart.compliance);
    }
  };

  return (
    <div className="max-w-5xl mx-auto animate-slide-up">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-retro-white mb-2" className="font-heading">
          Create New Workflow
        </h1>
        <p className="text-retro-cyan opacity-60">
          Configure your infrastructure with intelligent recommendations
        </p>
      </div>

      {/* Loading Progress Display */}
      {loading && (
        <div className="card-retro border-2 border-pixel/50 px-6 py-6 rounded-2xl mb-6 animate-pulse">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <svg className="animate-spin h-6 w-6 text-retro-cyan" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <div>
                <p className="text-retro-white font-semibold text-lg" className="font-heading">
                  Generating Infrastructure
                </p>
                <p className="text-retro-cyan opacity-80 text-sm mt-1">{currentStep}</p>
              </div>
            </div>
            <div className="text-retro-cyan font-bold text-xl" className="font-heading">
              {progress}%
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-retro-dark rounded-full h-3 overflow-hidden border border-pixel/30">
            <div
              className="bg-gradient-to-r from-vintage-red to-vintage-white h-full transition-all duration-500 ease-out rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="mt-4 text-xs text-retro-text-dim">
            <p>[INFO] This typically takes 30-60 seconds. Please don't close this page.</p>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="card-retro bg-retro-dark/90 border-2 border-pixel-magenta text-retro-pink px-6 py-4 rounded-2xl mb-6">
          <div className="flex items-start gap-3">
            <svg className="w-6 h-6 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <div>
              <p className="font-semibold">Error Generating Infrastructure</p>
              <p className="mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Main Form */}
      <div className="card-retro rounded-2xl p-6 sm:p-8 mb-6 border border-pixel/30">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Description */}
          <div>
            <label className="block text-retro-white text-sm font-bold mb-2" className="font-heading">
              Project Description *
            </label>
            <textarea
              className="w-full px-4 py-3 bg-retro-dark text-retro-white border border-pixel/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-primary focus:border-pixel transition-all"
              rows={4}
              placeholder="Describe your application (e.g., 'E-commerce platform with user authentication, product catalog, and payment processing')"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              required
            />
            <p className="text-xs text-retro-cyan opacity-60 mt-2">
              Brief description of your application and its core features
            </p>
          </div>

          {/* Environment and Workload Type - 2 columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Environment */}
            <div>
              <label className="block text-retro-white text-sm font-bold mb-2" className="font-heading">
                Environment *
              </label>
              <select
                className="w-full px-4 py-3 bg-retro-dark text-retro-white border border-pixel/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-primary focus:border-pixel transition-all cursor-pointer"
                value={environment}
                onChange={(e) => setEnvironment(e.target.value)}
                required
              >
                {environments.map((env) => (
                  <option key={env.value} value={env.value}>
                    {env.label}
                  </option>
                ))}
              </select>
              <p className="text-xs text-retro-cyan opacity-60 mt-2">
                {environments.find(e => e.value === environment)?.description}
              </p>
            </div>

            {/* Workload Type */}
            <div>
              <label className="block text-retro-white text-sm font-bold mb-2" className="font-heading">
                Workload Type *
              </label>
              <select
                className="w-full px-4 py-3 bg-retro-dark text-retro-white border border-pixel/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-primary focus:border-pixel transition-all cursor-pointer"
                value={workloadType}
                onChange={(e) => setWorkloadType(e.target.value)}
                required
              >
                {workloadTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
              <p className="text-xs text-retro-cyan opacity-60 mt-2">
                Type of application you're deploying
              </p>
            </div>
          </div>

          {/* Expected Users and Location - 2 columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Expected Users */}
            <div>
              <label className="block text-retro-white text-sm font-bold mb-2" className="font-heading">
                Expected Users *
              </label>
              <select
                className="w-full px-4 py-3 bg-retro-dark text-retro-white border border-pixel/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-primary focus:border-pixel transition-all cursor-pointer"
                value={expectedUsers}
                onChange={(e) => setExpectedUsers(e.target.value)}
                required
              >
                {userRanges.map((range) => (
                  <option key={range.value} value={range.value}>
                    {range.label}
                  </option>
                ))}
              </select>
              <p className="text-xs text-retro-cyan opacity-60 mt-2">
                Expected number of concurrent users
              </p>
            </div>

            {/* Target Location */}
            <div>
              <label className="block text-retro-white text-sm font-bold mb-2" className="font-heading">
                Target Location (Optional)
              </label>
              <input
                type="text"
                className="w-full px-4 py-3 bg-retro-dark text-retro-white border border-pixel/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-primary focus:border-pixel transition-all"
                placeholder="e.g., India, Europe, US, Global"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
              <p className="text-xs text-retro-cyan opacity-60 mt-2">
                Geographic location of your users
              </p>
            </div>
          </div>

          {/* Budget and High Availability - 2 columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Budget */}
            <div>
              <label className="block text-retro-white text-sm font-bold mb-2" className="font-heading">
                Monthly Budget (Optional)
              </label>
              <select
                className="w-full px-4 py-3 bg-retro-dark text-retro-white border border-pixel/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-primary focus:border-pixel transition-all cursor-pointer"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
              >
                {budgetRanges.map((range) => (
                  <option key={range.value} value={range.value}>
                    {range.label}
                  </option>
                ))}
              </select>
              <p className="text-xs text-retro-cyan opacity-60 mt-2">
                Expected monthly cloud budget
              </p>
            </div>

            {/* High Availability */}
            <div>
              <label className="block text-retro-white text-sm font-bold mb-2" className="font-heading">
                High Availability
              </label>
              <select
                className="w-full px-4 py-3 bg-retro-dark text-retro-white border border-pixel/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-primary focus:border-pixel transition-all cursor-pointer"
                value={highAvailability}
                onChange={(e) => setHighAvailability(e.target.value)}
              >
                <option value="yes">Yes - Multi-AZ, Load Balanced</option>
                <option value="no">No - Single instance (Dev/Test)</option>
              </select>
              <p className="text-xs text-retro-cyan opacity-60 mt-2">
                {highAvailability === 'yes' ? 'Multi-region failover, auto-scaling' : 'Cost-optimized, single instance'}
              </p>
            </div>
          </div>

          {/* Compliance */}
          <div>
            <label className="block text-retro-white text-sm font-bold mb-2" className="font-heading">
              Compliance Requirements (Optional)
            </label>
            <select
              className="w-full px-4 py-3 bg-retro-dark text-retro-white border border-pixel/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-primary focus:border-pixel transition-all cursor-pointer"
              value={compliance}
              onChange={(e) => setCompliance(e.target.value)}
            >
              {complianceOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <p className="text-xs text-retro-cyan opacity-60 mt-2">
              Select if your application requires specific compliance standards
            </p>
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="btn-retro w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Generating Infrastructure...
                </span>
              ) : (
                'Generate Infrastructure'
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Quick Start Templates */}
      <div className="card-retro rounded-none p-6 sm:p-8 border border-pixel/30">
        <h3 className="text-xl font-bold text-retro-white mb-4 uppercase tracking-wide">
          Quick Start Templates
        </h3>
        <p className="text-sm text-retro-text-dim mb-4">
          Start with a pre-configured template
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <button
            type="button"
            onClick={() => loadQuickStart('dev-test')}
            className="text-left p-5 border-pixel bg-retro-dark rounded-none hover:shadow-pixel hover:border-retro-primary transition-all"
          >
            <h4 className="font-bold text-retro-primary mb-2 uppercase text-sm tracking-wider">Dev/Test</h4>
            <p className="text-xs text-retro-text-dim mb-2">Development environment</p>
            <p className="text-xs text-retro-text">Under $500/month</p>
          </button>

          <button
            type="button"
            onClick={() => loadQuickStart('small-prod')}
            className="text-left p-5 border-pixel bg-retro-dark rounded-none hover:shadow-pixel hover:border-retro-primary transition-all"
          >
            <h4 className="font-bold text-retro-primary mb-2 uppercase text-sm tracking-wider">Small Production</h4>
            <p className="text-xs text-retro-text-dim mb-2">Production-ready for SMB</p>
            <p className="text-xs text-retro-text">$500 - $2K/month</p>
          </button>

          <button
            type="button"
            onClick={() => loadQuickStart('enterprise')}
            className="text-left p-5 border-pixel bg-retro-dark rounded-none hover:shadow-pixel hover:border-retro-primary transition-all"
          >
            <h4 className="font-bold text-retro-primary mb-2 uppercase text-sm tracking-wider">Enterprise</h4>
            <p className="text-xs text-retro-text-dim mb-2">High-scale, compliant</p>
            <p className="text-xs text-retro-text">$10K+/month</p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateWorkflow;
