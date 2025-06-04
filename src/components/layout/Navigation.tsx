import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  Camera,
  Shirt,
  Sparkles,
  MessageCircle,
  BarChart3,
  User,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  Wifi,
  WifiOff,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import Button from "@/components/ui/button";
import toast from "react-hot-toast";

const Navigation: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, backendConnected } = useAuth();

  const navigationItems = [
    { name: "Dashboard", href: "/dashboard", icon: Home },
    { name: "Classify", href: "/dashboard/classify", icon: Camera },
    { name: "Wardrobe", href: "/dashboard/wardrobe", icon: Shirt },
    {
      name: "Recommendations",
      href: "/dashboard/recommendations",
      icon: Sparkles,
    },
    { name: "Style Assistant", href: "/dashboard/chat", icon: MessageCircle },
    { name: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
  ];

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
      toast.success("Logged out successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to logout");
    }
  };

  const isActiveRoute = (href: string) => {
    return (
      location.pathname === href || location.pathname.startsWith(href + "/")
    );
  };

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 lg:bg-white lg:border-r lg:border-gray-200">
        <div className="flex flex-col flex-1 min-h-0">
          {/* Logo */}
          <div className="flex items-center h-16 flex-shrink-0 px-4 bg-primary-600">
            <Link to="/dashboard" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-primary-600" />
              </div>
              <span className="text-xl font-bold text-white">ClosetIQ</span>
            </Link>
          </div>

          {/* Backend Connection Status */}
          {!backendConnected && (
            <div className="px-3 py-2 bg-yellow-50 border-b border-yellow-200">
              <div className="flex items-center space-x-2 text-yellow-800">
                <WifiOff className="w-4 h-4" />
                <span className="text-xs font-medium">
                  Limited connectivity
                </span>
              </div>
            </div>
          )}

          {/* Navigation Items */}
          <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
            <div className="flex-1 px-3 space-y-1">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = isActiveRoute(item.href);
                const isDisabled =
                  !backendConnected && item.href !== "/dashboard";

                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`
                      group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors duration-200
                      ${
                        isDisabled
                          ? "text-gray-400 cursor-not-allowed"
                          : isActive
                          ? "bg-primary-100 text-primary-700"
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                      }
                    `}
                    onClick={(e) => {
                      if (isDisabled) {
                        e.preventDefault();
                        toast.error(
                          "Feature unavailable - backend connection required"
                        );
                      }
                    }}
                  >
                    <Icon
                      className={`
                        mr-3 flex-shrink-0 h-6 w-6 transition-colors duration-200
                        ${
                          isDisabled
                            ? "text-gray-300"
                            : isActive
                            ? "text-primary-500"
                            : "text-gray-400 group-hover:text-gray-500"
                        }
                      `}
                    />
                    {item.name}
                    {isDisabled && (
                      <WifiOff className="ml-auto w-4 h-4 text-gray-300" />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* User Profile Section */}
          <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
            <div className="flex-shrink-0 w-full group block">
              <div className="flex items-center">
                <div className="relative">
                  <img
                    className="inline-block h-9 w-9 rounded-full"
                    src={
                      user?.photoURL ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(
                        user?.displayName || user?.username || "User"
                      )}&background=6366f1&color=fff`
                    }
                    alt="User avatar"
                  />
                  {/* Connection status indicator */}
                  <div
                    className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${
                      backendConnected ? "bg-green-400" : "bg-yellow-400"
                    }`}
                  />
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                    {user?.displayName || user?.username || "User"}
                  </p>
                  <p className="text-xs font-medium text-gray-500 group-hover:text-gray-700 flex items-center">
                    {user?.subscription?.plan || "Free"} Plan
                    {backendConnected ? (
                      <Wifi className="w-3 h-3 ml-1 text-green-500" />
                    ) : (
                      <WifiOff className="w-3 h-3 ml-1 text-yellow-500" />
                    )}
                  </p>
                </div>
                <div className="ml-3">
                  <div className="relative">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowProfileMenu(!showProfileMenu)}
                    >
                      <Settings className="w-4 h-4" />
                    </Button>

                    <AnimatePresence>
                      {showProfileMenu && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          className="absolute right-0 bottom-full mb-2 w-48 bg-white rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5 z-50"
                        >
                          <Link
                            to="/dashboard/profile"
                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            onClick={() => setShowProfileMenu(false)}
                          >
                            <User className="w-4 h-4 mr-3" />
                            Your Profile
                          </Link>
                          <Link
                            to="/dashboard/settings"
                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            onClick={() => setShowProfileMenu(false)}
                          >
                            <Settings className="w-4 h-4 mr-3" />
                            Settings
                          </Link>
                          <div className="border-t border-gray-100 my-1" />
                          {!backendConnected && (
                            <div className="px-4 py-2 text-xs text-yellow-600 bg-yellow-50">
                              <div className="flex items-center">
                                <WifiOff className="w-3 h-3 mr-2" />
                                Limited functionality
                              </div>
                            </div>
                          )}
                          <button
                            onClick={() => {
                              handleLogout();
                              setShowProfileMenu(false);
                            }}
                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            <LogOut className="w-4 h-4 mr-3" />
                            Sign out
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <div className="lg:hidden">
        {/* Mobile header */}
        <div className="flex items-center justify-between h-16 bg-white border-b border-gray-200 px-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">ClosetIQ</span>
          </div>

          <div className="flex items-center space-x-4">
            {/* Connection status */}
            <div className="flex items-center">
              {backendConnected ? (
                <Wifi className="w-5 h-5 text-green-500" />
              ) : (
                <WifiOff className="w-5 h-5 text-yellow-500" />
              )}
            </div>
            <Button variant="ghost" size="sm">
              <Bell className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </Button>
          </div>
        </div>

        {/* Mobile menu overlay */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-gray-600 bg-opacity-75 z-40"
                onClick={() => setIsMobileMenuOpen(false)}
              />

              <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                className="fixed inset-y-0 left-0 w-64 bg-white z-50 flex flex-col"
              >
                {/* Header */}
                <div className="flex items-center justify-between h-16 px-4 bg-primary-600">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-primary-600" />
                    </div>
                    <span className="text-xl font-bold text-white">
                      ClosetIQ
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-white hover:bg-primary-700"
                  >
                    <X className="w-6 h-6" />
                  </Button>
                </div>

                {/* Connection status banner */}
                {!backendConnected && (
                  <div className="px-4 py-3 bg-yellow-50 border-b border-yellow-200">
                    <div className="flex items-center space-x-2 text-yellow-800">
                      <WifiOff className="w-4 h-4" />
                      <span className="text-sm font-medium">
                        Limited connectivity
                      </span>
                    </div>
                  </div>
                )}

                {/* Navigation */}
                <div className="flex-1 pt-5 pb-4 overflow-y-auto">
                  <div className="px-3 space-y-1">
                    {navigationItems.map((item) => {
                      const Icon = item.icon;
                      const isActive = isActiveRoute(item.href);
                      const isDisabled =
                        !backendConnected && item.href !== "/dashboard";

                      return (
                        <Link
                          key={item.name}
                          to={item.href}
                          onClick={(e) => {
                            if (isDisabled) {
                              e.preventDefault();
                              toast.error(
                                "Feature unavailable - backend connection required"
                              );
                            } else {
                              setIsMobileMenuOpen(false);
                            }
                          }}
                          className={`
                            group flex items-center px-2 py-2 text-base font-medium rounded-md
                            ${
                              isDisabled
                                ? "text-gray-400 cursor-not-allowed"
                                : isActive
                                ? "bg-primary-100 text-primary-700"
                                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                            }
                          `}
                        >
                          <Icon
                            className={`
                              mr-4 flex-shrink-0 h-6 w-6
                              ${
                                isDisabled
                                  ? "text-gray-300"
                                  : isActive
                                  ? "text-primary-500"
                                  : "text-gray-400 group-hover:text-gray-500"
                              }
                            `}
                          />
                          {item.name}
                          {isDisabled && (
                            <WifiOff className="ml-auto w-4 h-4 text-gray-300" />
                          )}
                        </Link>
                      );
                    })}
                  </div>
                </div>

                {/* User section */}
                <div className="flex-shrink-0 border-t border-gray-200 p-4">
                  <div className="flex items-center">
                    <div className="relative">
                      <img
                        className="inline-block h-10 w-10 rounded-full"
                        src={
                          user?.photoURL ||
                          `https://ui-avatars.com/api/?name=${encodeURIComponent(
                            user?.displayName || user?.username || "User"
                          )}&background=6366f1&color=fff`
                        }
                        alt="User avatar"
                      />
                      <div
                        className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${
                          backendConnected ? "bg-green-400" : "bg-yellow-400"
                        }`}
                      />
                    </div>
                    <div className="ml-3 flex-1">
                      <p className="text-base font-medium text-gray-700">
                        {user?.displayName || user?.username || "User"}
                      </p>
                      <p className="text-sm font-medium text-gray-500 flex items-center">
                        {user?.subscription?.plan || "Free"} Plan
                        {backendConnected ? (
                          <Wifi className="w-3 h-3 ml-1 text-green-500" />
                        ) : (
                          <WifiOff className="w-3 h-3 ml-1 text-yellow-500" />
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 space-y-1">
                    <Link
                      to="/dashboard/profile"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center px-2 py-2 text-base font-medium text-gray-600 rounded-md hover:text-gray-900 hover:bg-gray-50"
                    >
                      <User className="mr-4 h-6 w-6 text-gray-400" />
                      Your Profile
                    </Link>
                    <Link
                      to="/dashboard/settings"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center px-2 py-2 text-base font-medium text-gray-600 rounded-md hover:text-gray-900 hover:bg-gray-50"
                    >
                      <Settings className="mr-4 h-6 w-6 text-gray-400" />
                      Settings
                    </Link>
                    {!backendConnected && (
                      <div className="px-2 py-2 text-sm text-yellow-600 bg-yellow-50 rounded-md">
                        <div className="flex items-center">
                          <WifiOff className="w-4 h-4 mr-2" />
                          Limited functionality
                        </div>
                      </div>
                    )}
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-2 py-2 text-base font-medium text-gray-600 rounded-md hover:text-gray-900 hover:bg-gray-50"
                    >
                      <LogOut className="mr-4 h-6 w-6 text-gray-400" />
                      Sign out
                    </button>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

export default Navigation;
