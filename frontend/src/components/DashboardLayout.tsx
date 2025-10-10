import React from 'react';
import Sidebar from './Sidebar';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1">
        <header className="glass-card border-b border-blue-primary/20">
          <div className="px-8 py-5">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white" style={{ fontFamily: 'Space Grotesk' }}>
                Intelligent IaC Orchestration
              </h2>
              <div className="flex items-center space-x-4">
                <button className="px-4 py-2 text-sm text-gray-300 hover:text-blue-light transition-colors font-medium">
                  Documentation
                </button>
                <div className="w-10 h-10 rounded-full bg-blue-primary flex items-center justify-center text-white font-semibold shadow-lg">
                  U
                </div>
              </div>
            </div>
          </div>
        </header>
        <main className="p-8">{children}</main>
      </div>
    </div>
  );
};

export default DashboardLayout;
