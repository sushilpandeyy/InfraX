import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Sidebar: React.FC = () => {
  const location = useLocation();

  const menuItems = [
    { path: '/', icon: '🏠', label: 'Dashboard' },
    { path: '/create', icon: '✨', label: 'Create Workflow' },
    { path: '/workflows', icon: '📋', label: 'Workflows' },
    { path: '/analytics', icon: '📊', label: 'Analytics' },
    { path: '/settings', icon: '⚙️', label: 'Settings' },
  ];

  return (
    <div className="w-64 glass-dark min-h-screen p-6 border-r border-blue-primary/20">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-1" style={{ fontFamily: 'Space Grotesk' }}>
          InfraX
        </h1>
        <p className="text-sm text-gray-400">Brahma Platform</p>
      </div>

      <nav className="space-y-2">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 ${
              location.pathname === item.path
                ? 'bg-blue-primary text-white shadow-lg shadow-blue-primary/30'
                : 'text-gray-400 hover:bg-blue-primary/10 hover:text-white'
            }`}
          >
            <span className="text-xl">{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>

      <div className="mt-auto pt-8 border-t border-blue-primary/20 absolute bottom-6 left-6 right-6">
        <div className="px-4 py-3 glass rounded-xl">
          <p className="text-xs text-gray-500">Version 1.0</p>
          <p className="text-xs text-gray-500">Multi-Agent AI System</p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
