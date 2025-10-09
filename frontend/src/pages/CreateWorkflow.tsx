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
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Create New Workflow</h1>
        <p className="text-gray-600">
          Describe your infrastructure needs and let Brahma create it for you
        </p>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Main Form */}
      <div className="bg-white rounded-lg shadow p-8 mb-6">
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-semibold mb-2">
              Infrastructure Requirements *
            </label>
            <textarea
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
              rows={6}
              placeholder="Describe your infrastructure needs in detail..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              required
            />
            <p className="text-sm text-gray-500 mt-2">
              Be specific about your application type, expected scale, and any special requirements
            </p>
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-semibold mb-2">
              Target Location (Optional)
            </label>
            <input
              type="text"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
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
              className="flex-1 bg-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
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
      <div className="bg-white rounded-lg shadow p-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Example Templates</h3>
        <p className="text-sm text-gray-600 mb-4">
          Click an example to load it into the form
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {examples.map((example, index) => (
            <button
              key={index}
              type="button"
              onClick={() => loadExample(example)}
              className="text-left p-4 border-2 border-gray-200 rounded-lg hover:border-purple-500 transition"
            >
              <h4 className="font-semibold text-gray-900 mb-2">{example.title}</h4>
              <p className="text-xs text-gray-600 mb-2">{example.prompt}</p>
              <p className="text-xs text-purple-600">📍 {example.location}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CreateWorkflow;
