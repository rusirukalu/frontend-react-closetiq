import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

// Layouts
import DashboardLayout from "@/components/layout/DashboardLayout";

// Components
import LoadingSpinner from "@/components/ui/LoadingSpinner";

// Pages
import DashboardPage from "@/pages/DashboardPage";
import ClassifyPage from "@/pages/ClassifyPage";
import WardrobePage from "@/pages/WardrobePage";
import RecommendationsPage from "@/pages/RecommendationsPage";
import ChatPage from "@/pages/ChatPage";
import AnalyticsPage from "@/pages/AnalyticsPage";
import ProfilePage from "@/pages/ProfilePage";
import SettingsPage from "@/pages/SettingsPage";

const ProtectedRoutes: React.FC = () => {
  const { isAuthenticated, isLoading, backendConnected } = useAuth();

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // Show loading spinner while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="lg" />
        <div className="ml-4 text-gray-600">Loading...</div>
      </div>
    );
  }
  // DashboardLayout should be a route element that uses <Outlet />
  return (
    <Routes>
      <Route path="/" element={<DashboardLayout />}>
        {/* These are the nested routes that will render in <Outlet /> */}
        <Route index element={<DashboardPage />} />
        <Route path="classify" element={<ClassifyPage />} />
        <Route path="wardrobe" element={<WardrobePage />} />
        <Route path="recommendations" element={<RecommendationsPage />} />
        <Route path="chat" element={<ChatPage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
      {/* Catch-all for unknown dashboard subroutes */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

export default ProtectedRoutes;
