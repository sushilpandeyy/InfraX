import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { brahmaApi } from '../api/brahma';

const CreateWorkflow: React.FC = () => {
  const navigate = useNavigate();

  // Form state
  const [inputMode, setInputMode] = useState<'manual' | 'repo'>('manual');
  const [prompt, setPrompt] = useState('');
  const [location, setLocation] = useState('');
  const [repoUrl, setRepoUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState('');
  const [progress, setProgress] = useState(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation: require either prompt or repo_url
    if (!prompt.trim() && !repoUrl.trim()) {
      setError('[VALIDATION ERROR] Please provide either a project description or a repository URL');
      return;
    }

    setLoading(true);
    setError(null);
    setProgress(0);

    let progressInterval: NodeJS.Timeout | null = null;
    const stepTimeouts: NodeJS.Timeout[] = [];

    try {
      // Step 1: Starting workflow
      setCurrentStep('Initializing workflow...');
      setProgress(10);

      // Step 2: Analysis phase
      if (repoUrl) {
        setCurrentStep('ANALYZING REPOSITORY AND DETECTING TECH STACK...');
      } else {
        setCurrentStep('ANALYZING REQUIREMENTS AND PLANNING INFRASTRUCTURE...');
      }
      setProgress(20);

      // Simulate progress updates for better UX
      progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) return 90;
          return prev + 5;
        });
      }, 1500);

      // Update step descriptions during execution
      stepTimeouts.push(setTimeout(() => setCurrentStep('OPTIMIZING COSTS AND RESOURCE ALLOCATION...'), 3000));
      stepTimeouts.push(setTimeout(() => setCurrentStep('SELECTING OPTIMAL CLOUD SERVICES...'), 6000));
      stepTimeouts.push(setTimeout(() => setCurrentStep('GENERATING PRODUCTION-READY TERRAFORM CODE...'), 9000));
      stepTimeouts.push(setTimeout(() => setCurrentStep('CREATING ARCHITECTURE DIAGRAMS...'), 12000));

      const result = await brahmaApi.executeIntelligentWorkflow({
        prompt: prompt.trim() || undefined,
        location: location.trim() || undefined,
        repo_url: repoUrl.trim() || undefined,
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
      } else if (errorMessage.includes('repository') || errorMessage.includes('repo')) {
        errorMessage = `[REPO ERROR] ${errorMessage}`;
      }

      setError(errorMessage);
      setCurrentStep('');
      setProgress(0);
    } finally {
      setLoading(false);
    }
  };

  const loadQuickStart = (type: string) => {
    const quickStarts: Record<string, any> = {
      'dev-test': {
        mode: 'manual',
        prompt: 'Simple web application with PostgreSQL database for development and testing. Include basic monitoring and cost-optimized instances.',
        location: '',
      },
      'small-prod': {
        mode: 'manual',
        prompt: 'Production web application for a small business with user authentication, database, file storage, and CDN. Need high availability and auto-scaling for up to 1000 users.',
        location: '',
      },
      'enterprise': {
        mode: 'manual',
        prompt: 'Enterprise-grade SaaS application with microservices architecture, multiple databases (SQL and NoSQL), caching layer, message queue, and API gateway. Require SOC2 compliance, multi-region deployment, and support for 100K+ concurrent users.',
        location: 'Global',
      },
    };

    const quickStart = quickStarts[type];
    if (quickStart) {
      setInputMode(quickStart.mode);
      setPrompt(quickStart.prompt);
      setLocation(quickStart.location);
      setRepoUrl('');
    }
  };

  return (
    <div className="max-w-5xl mx-auto animate-slide-up">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-retro-white mb-2 uppercase tracking-wide">
          Create New Workflow
        </h1>
        <p className="text-retro-text-dim">
          Generate intelligent infrastructure from a description or GitHub repository
        </p>
      </div>

      {/* Loading Progress Display */}
      {loading && (
        <div className="card-retro border-2 border-pixel/50 px-6 py-6 rounded-none mb-6 animate-pulse">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="spinner-pixel"></div>
              <div>
                <p className="text-retro-white font-semibold text-lg uppercase tracking-wide">
                  Generating Infrastructure
                </p>
                <p className="text-retro-text-dim text-sm mt-1">{currentStep}</p>
              </div>
            </div>
            <div className="text-retro-primary font-bold text-xl">
              {progress}%
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-retro-dark rounded-none h-3 overflow-hidden border border-pixel/30">
            <div
              className="bg-retro-primary h-full transition-all duration-500 ease-out"
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
        <div className="card-retro bg-retro-dark/90 border-2 border-retro-danger text-retro-danger px-6 py-4 rounded-none mb-6">
          <div className="flex items-start gap-3">
            <div className="text-xl font-bold">[!]</div>
            <div>
              <p className="font-semibold uppercase text-sm tracking-wide">Error Generating Infrastructure</p>
              <p className="mt-1 text-sm">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Input Mode Toggle */}
      <div className="card-retro rounded-none p-6 sm:p-8 mb-6 border border-pixel/30">
        <div className="flex gap-4 mb-6">
          <button
            type="button"
            onClick={() => setInputMode('manual')}
            className={`flex-1 px-4 py-3 rounded-none border-2 transition-all ${
              inputMode === 'manual'
                ? 'bg-retro-primary text-retro-bg border-retro-primary shadow-pixel font-bold'
                : 'bg-retro-dark text-retro-text-dim border-pixel hover:border-retro-primary'
            }`}
          >
            <span className="uppercase text-sm tracking-wide">Describe Project</span>
          </button>
          <button
            type="button"
            onClick={() => setInputMode('repo')}
            className={`flex-1 px-4 py-3 rounded-none border-2 transition-all ${
              inputMode === 'repo'
                ? 'bg-retro-primary text-retro-bg border-retro-primary shadow-pixel font-bold'
                : 'bg-retro-dark text-retro-text-dim border-pixel hover:border-retro-primary'
            }`}
          >
            <span className="uppercase text-sm tracking-wide">Import from Repository</span>
          </button>
        </div>

        {/* Main Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {inputMode === 'manual' ? (
            <>
              {/* Project Description */}
              <div>
                <label className="block text-retro-white text-sm font-bold mb-2 uppercase tracking-wide">
                  Project Description *
                </label>
                <textarea
                  className="input-retro w-full rounded-none"
                  rows={6}
                  placeholder="Describe your application and requirements (e.g., 'E-commerce platform with user authentication, product catalog, payment processing, and analytics dashboard for 10K daily users')"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                />
                <p className="text-xs text-retro-text-dim mt-2">
                  [TIP] Be specific about your application features, expected scale, and any compliance requirements
                </p>
              </div>
            </>
          ) : (
            <>
              {/* Repository URL */}
              <div>
                <label className="block text-retro-white text-sm font-bold mb-2 uppercase tracking-wide">
                  GitHub/GitLab Repository URL *
                </label>
                <input
                  type="url"
                  className="input-retro w-full rounded-none"
                  placeholder="https://github.com/username/repository"
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                />
                <p className="text-xs text-retro-text-dim mt-2">
                  [INFO] Brahma will analyze your repository to detect tech stack and infrastructure requirements
                </p>
              </div>

              {/* Optional description for repo mode */}
              <div>
                <label className="block text-retro-white text-sm font-bold mb-2 uppercase tracking-wide">
                  Additional Context (Optional)
                </label>
                <textarea
                  className="input-retro w-full rounded-none"
                  rows={3}
                  placeholder="Add any specific requirements not evident from the code (e.g., 'Need HIPAA compliance' or 'Expecting 50K concurrent users')"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                />
              </div>
            </>
          )}

          {/* Target Location - Common for both modes */}
          <div>
            <label className="block text-retro-white text-sm font-bold mb-2 uppercase tracking-wide">
              Target Location (Optional)
            </label>
            <input
              type="text"
              className="input-retro w-full rounded-none"
              placeholder="e.g., India, Europe, US, Global"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
            <p className="text-xs text-retro-text-dim mt-2">
              [INFO] Geographic location of your primary users for optimal region selection
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
                  <div className="spinner-pixel mr-3" style={{ width: '20px', height: '20px' }}></div>
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
          Start with a pre-configured template and customize as needed
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <button
            type="button"
            onClick={() => loadQuickStart('dev-test')}
            className="text-left p-5 border-pixel bg-retro-dark rounded-none hover:shadow-pixel hover:border-retro-primary transition-all"
          >
            <h4 className="font-bold text-retro-primary mb-2 uppercase text-sm tracking-wider">Dev/Test</h4>
            <p className="text-xs text-retro-text-dim mb-2">Basic web app with database</p>
            <p className="text-xs text-retro-text">Cost-optimized, single region</p>
          </button>

          <button
            type="button"
            onClick={() => loadQuickStart('small-prod')}
            className="text-left p-5 border-pixel bg-retro-dark rounded-none hover:shadow-pixel hover:border-retro-primary transition-all"
          >
            <h4 className="font-bold text-retro-primary mb-2 uppercase text-sm tracking-wider">Small Production</h4>
            <p className="text-xs text-retro-text-dim mb-2">Full-featured with HA</p>
            <p className="text-xs text-retro-text">Auto-scaling, up to 1K users</p>
          </button>

          <button
            type="button"
            onClick={() => loadQuickStart('enterprise')}
            className="text-left p-5 border-pixel bg-retro-dark rounded-none hover:shadow-pixel hover:border-retro-primary transition-all"
          >
            <h4 className="font-bold text-retro-primary mb-2 uppercase text-sm tracking-wider">Enterprise</h4>
            <p className="text-xs text-retro-text-dim mb-2">Microservices, multi-region</p>
            <p className="text-xs text-retro-text">SOC2 compliant, 100K+ users</p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateWorkflow;
