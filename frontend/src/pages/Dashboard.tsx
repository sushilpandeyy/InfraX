import React from 'react';
import { Link } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const stats = [
    {
      label: 'Total Workflows',
      value: '0',
      icon: '📋',
      color: 'bg-blue-500',
    },
    {
      label: 'Active Deployments',
      value: '0',
      icon: '🚀',
      color: 'bg-green-500',
    },
    {
      label: 'Cost Saved',
      value: '$0',
      icon: '💰',
      color: 'bg-yellow-500',
    },
    {
      label: 'Cloud Providers',
      value: '3',
      icon: '☁️',
      color: 'bg-purple-500',
    },
  ];

  const recentActivities = [
    {
      type: 'info',
      message: 'Welcome to InfraX Brahma Platform',
      time: 'Just now',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">Welcome to InfraX Dashboard</h1>
        <p className="text-purple-100 mb-6">
          Create intelligent infrastructure with AI-powered orchestration
        </p>
        <Link
          to="/create"
          className="inline-block bg-white text-purple-600 px-6 py-3 rounded-lg font-semibold hover:bg-purple-50 transition"
        >
          Create New Workflow
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <div className={`${stat.color} w-12 h-12 rounded-lg flex items-center justify-center text-2xl`}>
                {stat.icon}
              </div>
            </div>
            <h3 className="text-gray-600 text-sm font-medium">{stat.label}</h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <Link
              to="/create"
              className="flex items-center space-x-3 p-4 border-2 border-gray-200 rounded-lg hover:border-purple-500 transition"
            >
              <span className="text-2xl">✨</span>
              <div>
                <h4 className="font-semibold text-gray-900">Create Infrastructure</h4>
                <p className="text-sm text-gray-600">Start new AI-powered workflow</p>
              </div>
            </Link>
            <Link
              to="/workflows"
              className="flex items-center space-x-3 p-4 border-2 border-gray-200 rounded-lg hover:border-purple-500 transition"
            >
              <span className="text-2xl">📋</span>
              <div>
                <h4 className="font-semibold text-gray-900">View Workflows</h4>
                <p className="text-sm text-gray-600">Manage existing workflows</p>
              </div>
            </Link>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {recentActivities.map((activity, index) => (
              <div key={index} className="flex items-start space-x-3 pb-4 border-b border-gray-200 last:border-0">
                <div className="w-2 h-2 mt-2 rounded-full bg-blue-500"></div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900">{activity.message}</p>
                  <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features Overview */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Platform Features</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4">
            <div className="text-4xl mb-3">🧠</div>
            <h4 className="font-semibold text-gray-900 mb-2">Intelligent Planning</h4>
            <p className="text-sm text-gray-600">
              AI analyzes requirements and auto-selects cloud provider & region
            </p>
          </div>
          <div className="text-center p-4">
            <div className="text-4xl mb-3">💰</div>
            <h4 className="font-semibold text-gray-900 mb-2">Cost Optimization</h4>
            <p className="text-sm text-gray-600">
              40-60% cost reduction through intelligent resource optimization
            </p>
          </div>
          <div className="text-center p-4">
            <div className="text-4xl mb-3">🏗️</div>
            <h4 className="font-semibold text-gray-900 mb-2">IaC Generation</h4>
            <p className="text-sm text-gray-600">
              Production-ready Terraform code with security best practices
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
