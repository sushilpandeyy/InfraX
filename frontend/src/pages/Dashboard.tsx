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
    <div className="space-y-6 sm:space-y-8 animate-slide-up">
      {/* Welcome Section */}
      <div className="glass-card rounded-2xl p-6 sm:p-8 border border-blue-primary/30 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-primary/10 rounded-full blur-3xl"></div>
        <div className="relative z-10">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 text-white" style={{ fontFamily: 'Space Grotesk' }}>
            Welcome to InfraX Dashboard
          </h1>
          <p className="text-gray-400 mb-6 text-base sm:text-lg">
            Create intelligent infrastructure with AI-powered orchestration
          </p>
          <Link
            to="/create"
            className="inline-flex items-center justify-center bg-blue-primary text-white px-8 py-3 rounded-xl font-semibold hover:bg-blue-dark hover:shadow-lg hover:shadow-blue-primary/40 transition-all duration-300"
          >
            ✨ Create New Workflow
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="glass-card rounded-2xl p-6 glass-hover">
            <div className="flex items-center justify-between mb-4">
              <div className={`${stat.color} w-14 h-14 rounded-xl flex items-center justify-center text-2xl shadow-lg`}>
                {stat.icon}
              </div>
            </div>
            <h3 className="text-gray-400 text-sm font-semibold uppercase tracking-wide">{stat.label}</h3>
            <p className="text-3xl font-bold text-white mt-2" style={{ fontFamily: 'Space Grotesk' }}>{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Quick Actions */}
        <div className="glass-card rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4" style={{ fontFamily: 'Space Grotesk' }}>Quick Actions</h3>
          <div className="space-y-3">
            <Link
              to="/create"
              className="flex items-center space-x-3 p-4 glass rounded-xl glass-hover"
            >
              <span className="text-2xl">✨</span>
              <div>
                <h4 className="font-semibold text-white">Create Infrastructure</h4>
                <p className="text-sm text-gray-400">Start new AI-powered workflow</p>
              </div>
            </Link>
            <Link
              to="/workflows"
              className="flex items-center space-x-3 p-4 glass rounded-xl glass-hover"
            >
              <span className="text-2xl">📋</span>
              <div>
                <h4 className="font-semibold text-white">View Workflows</h4>
                <p className="text-sm text-gray-400">Manage existing workflows</p>
              </div>
            </Link>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="glass-card rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4" style={{ fontFamily: 'Space Grotesk' }}>Recent Activity</h3>
          <div className="space-y-4">
            {recentActivities.map((activity, index) => (
              <div key={index} className="flex items-start space-x-3 pb-4 border-b border-gray-200 last:border-0">
                <div className="w-2 h-2 mt-2 rounded-full bg-blue-500"></div>
                <div className="flex-1">
                  <p className="text-sm text-white">{activity.message}</p>
                  <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features Overview */}
      <div className="glass-card rounded-2xl p-6 sm:p-8">
        <h3 className="text-xl sm:text-2xl font-bold text-white mb-6 text-center" style={{ fontFamily: 'Space Grotesk' }}>Platform Features</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          <div className="text-center p-6 glass rounded-2xl glass-hover">
            <div className="text-5xl mb-4">🧠</div>
            <h4 className="font-bold text-white mb-2" style={{ fontFamily: 'Space Grotesk' }}>Intelligent Planning</h4>
            <p className="text-sm text-gray-400">
              AI analyzes requirements and auto-selects cloud provider & region
            </p>
          </div>
          <div className="text-center p-6 glass rounded-2xl glass-hover">
            <div className="text-5xl mb-4">💰</div>
            <h4 className="font-bold text-white mb-2" style={{ fontFamily: 'Space Grotesk' }}>Cost Optimization</h4>
            <p className="text-sm text-gray-400">
              40-60% cost reduction through intelligent resource optimization
            </p>
          </div>
          <div className="text-center p-6 glass rounded-2xl glass-hover">
            <div className="text-5xl mb-4">🏗️</div>
            <h4 className="font-bold text-white mb-2" style={{ fontFamily: 'Space Grotesk' }}>IaC Generation</h4>
            <p className="text-sm text-gray-400">
              Production-ready Terraform code with security best practices
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
