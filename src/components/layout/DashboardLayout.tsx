import React from "react";
import { Outlet } from "react-router-dom"; // Add this import
import Navigation from "./Navigation";
import { Toaster } from "react-hot-toast";

interface DashboardLayoutProps {
  children?: React.ReactNode; // Make optional
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  return (
    <div className="h-screen flex overflow-hidden bg-gray-50">
      <Navigation />

      {/* Main content */}
      <div className="flex flex-col w-0 flex-1 overflow-hidden lg:ml-64">
        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              {/* CRITICAL FIX: Use Outlet instead of children */}
              <Outlet />
            </div>
          </div>
        </main>
      </div>

      {/* Toast notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: "#363636",
            color: "#fff",
          },
          success: {
            duration: 3000,
            style: {
              background: "#10B981",
            },
          },
          error: {
            duration: 5000,
            style: {
              background: "#EF4444",
            },
          },
        }}
      />
    </div>
  );
};

export default DashboardLayout;
