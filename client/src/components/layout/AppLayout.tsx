import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#f8f9fb]">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-40 lg:hidden transition-opacity duration-300 ${sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <div className="fixed inset-0 bg-gray-900/30 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
        <div className={`fixed inset-y-0 left-0 w-72 transform transition-transform duration-300 ease-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <Sidebar onClose={() => setSidebarOpen(false)} />
        </div>
      </div>

      {/* Desktop sidebar — starts below the topbar */}
      <div className="hidden lg:fixed lg:top-16 lg:bottom-0 lg:left-0 lg:block lg:w-64 lg:border-r lg:border-gray-200/60 lg:bg-white">
        <Sidebar />
      </div>

      {/* Topbar spans full width */}
      <Topbar onMenuClick={() => setSidebarOpen(true)} />

      {/* Main content */}
      <div className="lg:pl-64">
        <main className="p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
