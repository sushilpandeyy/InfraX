import React from 'react';
import { Link } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const stats = [
    {
      label: 'Total Workflows',
      value: '0',
      color: 'bg-retro-dark border-pixel',
    },
    {
      label: 'Active Deployments',
      value: '0',
      color: 'bg-retro-dark border-pixel',
    },
    {
      label: 'Cost Saved',
      value: '$0',
      color: 'bg-retro-primary',
    },
    {
      label: 'Cloud Providers',
      value: '3',
      color: 'bg-retro-dark border-pixel',
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
      <div className="card-retro rounded-none p-6 sm:p-8 border border-pixel/30 shadow-pixel relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-retro-cyan/10 rounded-full blur-3xl"></div>
        <div className="relative z-10">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 text-retro-white" className="font-heading">
            Welcome to InfraX Dashboard
          </h1>
          <p className="text-retro-cyan opacity-60 mb-6 text-base sm:text-lg">
            Create intelligent infrastructure with AI-powered orchestration
          </p>
          <Link
            to="/create"
            className="btn-retro"
          >
            Create New Workflow
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="card-retro rounded-none p-6 hover:shadow-pixel transition-all">
            <h3 className="text-retro-text-dim text-xs font-bold uppercase tracking-wider mb-3">{stat.label}</h3>
            <p className="text-4xl font-bold text-retro-text">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Quick Actions */}
        <div className="card-retro rounded-none p-6">
          <h3 className="text-lg font-semibold text-retro-white mb-4 uppercase tracking-wide">Quick Actions</h3>
          <div className="space-y-3">
            <Link
              to="/create"
              className="block p-4 border-pixel bg-retro-dark rounded-none hover:shadow-pixel hover:border-retro-primary transition-all"
            >
              <h4 className="font-bold text-retro-text uppercase text-sm mb-1">Create Infrastructure</h4>
              <p className="text-xs text-retro-text-dim">Start new AI-powered workflow</p>
            </Link>
            <Link
              to="/workflows"
              className="block p-4 border-pixel bg-retro-dark rounded-none hover:shadow-pixel hover:border-retro-primary transition-all"
            >
              <h4 className="font-bold text-retro-text uppercase text-sm mb-1">View Workflows</h4>
              <p className="text-xs text-retro-text-dim">Manage existing workflows</p>
            </Link>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="card-retro rounded-none p-6">
          <h3 className="text-lg font-semibold text-retro-white mb-4 uppercase tracking-wide">Recent Activity</h3>
          <div className="space-y-4">
            {recentActivities.map((activity, index) => (
              <div key={index} className="flex items-start space-x-3 pb-4 border-b border-pixel/20 last:border-0">
                <div className="w-2 h-2 mt-2 bg-retro-primary"></div>
                <div className="flex-1">
                  <p className="text-sm text-retro-white">{activity.message}</p>
                  <p className="text-xs text-retro-text-dim mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features Overview */}
      <div className="card-retro rounded-none p-6 sm:p-8">
        <h3 className="text-xl sm:text-2xl font-bold text-retro-white mb-6 text-center uppercase tracking-wide">Platform Features</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          <div className="text-center p-6 border-pixel bg-retro-dark rounded-none hover:shadow-pixel hover:border-retro-primary transition-all">
            <h4 className="font-bold text-retro-primary mb-3 uppercase text-sm tracking-wider">Intelligent Planning</h4>
            <p className="text-sm text-retro-text-dim">
              AI analyzes requirements and auto-selects cloud provider & region
            </p>
          </div>
          <div className="text-center p-6 border-pixel bg-retro-dark rounded-none hover:shadow-pixel hover:border-retro-primary transition-all">
            <h4 className="font-bold text-retro-primary mb-3 uppercase text-sm tracking-wider">Cost Optimization</h4>
            <p className="text-sm text-retro-text-dim">
              40-60% cost reduction through intelligent resource optimization
            </p>
          </div>
          <div className="text-center p-6 border-pixel bg-retro-dark rounded-none hover:shadow-pixel hover:border-retro-primary transition-all">
            <h4 className="font-bold text-retro-primary mb-3 uppercase text-sm tracking-wider">IaC Generation</h4>
            <p className="text-sm text-retro-text-dim">
              Production-ready Terraform code with security best practices
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
