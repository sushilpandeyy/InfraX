import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Sidebar: React.FC = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { path: '/', icon: '🏠', label: 'Dashboard' },
    { path: '/create', icon: '✨', label: 'Create Workflow' },
    { path: '/workflows', icon: '📋', label: 'Workflows' },
    { path: '/analytics', icon: '📊', label: 'Analytics' },
    { path: '/settings', icon: '⚙️', label: 'Settings' },
  ];

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-5 left-4 z-50 p-2 card-vintage rounded-lg border border-vintage/30 shadow-lg"
        aria-label="Toggle menu"
      >
        <svg
          className="w-6 h-6 text-white"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          {isOpen ? (
            <path d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed lg:static inset-y-0 left-0 z-40
          w-64 glass-dark min-h-screen p-6 border-r border-vintage/20
          transform transition-transform duration-300 ease-in-out
          flex flex-col
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white mb-1" className="font-heading">
            InfraX
          </h1>
          <p className="text-sm text-vintage-white opacity-60">Brahma Platform</p>
        </div>

        <nav className="space-y-2 flex-1 overflow-y-auto">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setIsOpen(false)}
              className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                location.pathname === item.path
                  ? 'bg-vintage-red text-white shadow-lg shadow-blue-primary/30'
                  : 'text-vintage-white opacity-60 hover:bg-vintage-red/10 hover:text-white'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="mt-auto pt-6 border-t border-vintage/20">
          <div className="px-4 py-3 border-vintage bg-vintage-black rounded-xl">
            <p className="text-xs text-vintage-white opacity-50">Version 1.0</p>
            <p className="text-xs text-vintage-white opacity-50">Multi-Agent AI System</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;