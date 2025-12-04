import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Sidebar: React.FC = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { path: '/', label: 'Dashboard' },
    { path: '/create', label: 'Create Workflow' },
    { path: '/workflows', label: 'Workflows' },
    { path: '/compare', label: 'Compare' },
    { path: '/shiva', label: 'Shiva' },
    { path: '/settings', label: 'Settings' },
  ];

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-5 left-4 z-50 p-2 card-retro rounded-lg border border-pixel/30 shadow-lg"
        aria-label="Toggle menu"
      >
        <svg
          className="w-6 h-6 text-retro-white"
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
          w-64 glass-dark min-h-screen p-6 border-r border-pixel/20
          transform transition-transform duration-300 ease-in-out
          flex flex-col
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-retro-white mb-1" className="font-heading">
            InfraX
          </h1>
          <p className="text-sm text-retro-cyan opacity-60">Brahma Platform</p>
        </div>

        <nav className="space-y-2 flex-1 overflow-y-auto">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setIsOpen(false)}
              className={`block px-4 py-3 rounded-none transition-all duration-200 ${
                location.pathname === item.path
                  ? 'bg-retro-primary text-retro-bg shadow-pixel font-bold'
                  : 'text-retro-text-dim hover:bg-retro-dark hover:text-retro-text'
              }`}
            >
              <span className="font-medium uppercase tracking-wide text-sm">{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="mt-auto pt-6 border-t border-pixel/20">
          <div className="px-4 py-3 border-pixel bg-retro-dark rounded-xl">
            <p className="text-xs text-retro-cyan opacity-50">Version 1.0</p>
            <p className="text-xs text-retro-cyan opacity-50">Multi-Agent AI System</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;