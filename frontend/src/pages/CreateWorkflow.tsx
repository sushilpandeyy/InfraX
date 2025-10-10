import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { brahmaApi } from '../api/brahma';

const CreateWorkflow: React.FC = () => {
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState('');
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const examples = [
    {
      title: 'E-commerce Platform',
      prompt: 'Build an e-commerce platform for Indian users with payment gateway integration',
      location: 'India',
    },
    {
      title: 'Video Streaming Service',
      prompt: 'Create a video streaming platform for 1M users in Southeast Asia',
      location: 'Singapore',
    },
    {
      title: 'SaaS Application',
      prompt: 'Deploy a multi-tenant SaaS application with global reach',
      location: 'Global',
    },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const result = await brahmaApi.executeIntelligentWorkflow({
        prompt,
        location: location || undefined,
      });

      // Navigate to workflow details page
      navigate(`/workflows/${result.workflow_id}`);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { detail?: string } } };
      setError(error.response?.data?.detail || 'Failed to execute workflow');
    } finally {
      setLoading(false);
    }
  };

  const loadExample = (example: typeof examples[0]) => {
    setPrompt(example.prompt);
    setLocation(example.location);
  };

  return (
    <div className="max-w-4xl mx-auto animate-slide-up">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2" style={{ fontFamily: 'Space Grotesk' }}>Create New Workflow</h1>
        <p className="text-gray-400">
          Describe your infrastructure needs and let Brahma create it for you
        </p>
      </div>

      {/* Error Display */}
      {error && (
        <div className="glass-card bg-red-50/90 border-2 border-red-300 text-red-700 px-6 py-4 rounded-2xl mb-6">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Main Form */}
      <div className="glass-card rounded-2xl p-8 mb-6 border border-blue-primary/30">
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="block text-white text-sm font-bold mb-2" style={{ fontFamily: 'Space Grotesk' }}>
              Infrastructure Requirements *
            </label>
            <textarea
              className="w-full px-4 py-3 bg-dark-card text-white border border-blue-primary/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-primary focus:border-blue-primary transition-all"
              rows={6}
              placeholder="Describe your infrastructure needs in detail..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              required
            />
            <p className="text-sm text-gray-400 mt-2">
              Be specific about your application type, expected scale, and any special requirements
            </p>
          </div>

          <div className="mb-6">
            <label className="block text-white text-sm font-bold mb-2" style={{ fontFamily: 'Space Grotesk' }}>
              Target Location (Optional)
            </label>
            <input
              type="text"
              className="w-full px-4 py-3 bg-dark-card text-white border border-blue-primary/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-primary focus:border-blue-primary transition-all"
              placeholder="e.g., India, Europe, Southeast Asia, Global"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
            <p className="text-sm text-gray-500 mt-2">
              Brahma will optimize cloud provider and region selection based on this location
            </p>
          </div>

          <div className="flex items-center space-x-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-primary text-white py-3 px-6 rounded-xl font-semibold hover:bg-blue-dark hover:shadow-lg hover:shadow-blue-primary/40 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
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

      {/* Example Templates */}
      <div className="glass-card rounded-2xl p-8 border border-blue-primary/30">
        <h3 className="text-xl font-bold text-white mb-4" style={{ fontFamily: 'Space Grotesk' }}>Example Templates</h3>
        <p className="text-sm text-gray-400 mb-4">
          Click an example to load it into the form
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {examples.map((example, index) => (
            <button
              key={index}
              type="button"
              onClick={() => loadExample(example)}
              className="text-left p-5 glass rounded-xl glass-hover border border-blue-primary/20"
            >
              <h4 className="font-semibold text-white mb-2">{example.title}</h4>
              <p className="text-xs text-gray-400 mb-2">{example.prompt}</p>
              <p className="text-xs text-blue-light">📍 {example.location}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CreateWorkflow;
