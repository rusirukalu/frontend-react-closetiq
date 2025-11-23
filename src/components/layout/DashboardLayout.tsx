import React from "react";
import { Outlet } from "react-router-dom"; // Add this import
import Navigation from "./Navigation";
import { Toaster } from "react-hot-toast";

interface DashboardLayoutProps {}

const DashboardLayout: React.FC<DashboardLayoutProps> = () => {
  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Navigation />

      {/* Main content */}
      <div className="flex flex-col flex-1 w-0 overflow-hidden lg:ml-64">
        <main className="relative flex-1 overflow-y-auto focus:outline-none">
          <div className="py-6">
            <div className="px-4 mx-auto max-w-7xl sm:px-6 md:px-8">
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
