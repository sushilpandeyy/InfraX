import React from 'react';
import Sidebar from './Sidebar';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <header className="glass-card border-b border-blue-primary/20 sticky top-0 z-20">
          <div className="px-4 sm:px-6 lg:px-8 py-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg sm:text-xl font-semibold text-white truncate" style={{ fontFamily: 'Space Grotesk' }}>
                Intelligent IaC Orchestration
              </h2>
              <div className="flex items-center space-x-2 sm:space-x-4 flex-shrink-0">
                <button className="hidden sm:block px-4 py-2 text-sm text-gray-300 hover:text-blue-light transition-colors font-medium">
                  Documentation
                </button>
                <div className="w-10 h-10 rounded-full bg-blue-primary flex items-center justify-center text-white font-semibold shadow-lg flex-shrink-0">
                  U
                </div>
              </div>
            </div>
          </div>
        </header>
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-x-hidden">{children}</main>
      </div>
    </div>
  );
};

export default DashboardLayout;