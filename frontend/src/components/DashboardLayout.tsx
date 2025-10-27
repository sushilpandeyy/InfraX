import React from 'react';
import Sidebar from './Sidebar';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  return (
    <div className="flex min-h-screen bg-vintage-black">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-vintage-black border-b-vintage border-vintage sticky top-0 z-20">
          <div className="px-4 sm:px-6 lg:px-8 py-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg sm:text-xl font-bold text-vintage-white truncate font-heading">
                INFRAX :: INTELLIGENT IAC ORCHESTRATION
              </h2>
              <div className="flex items-center space-x-2 sm:space-x-4 flex-shrink-0">
                <button className="hidden sm:block px-4 py-2 text-sm btn-vintage">
                  DOCS
                </button>
                <div className="w-10 h-10 border-vintage bg-vintage-black flex items-center justify-center text-vintage-white font-bold flex-shrink-0 font-mono">
                  U
                </div>
              </div>
            </div>
          </div>
        </header>
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-x-hidden bg-vintage-black">{children}</main>
      </div>
    </div>
  );
};

export default DashboardLayout;