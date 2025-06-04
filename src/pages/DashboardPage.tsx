import React from "react";
import { motion } from "framer-motion";
import {
  Camera,
  Shirt,
  Sparkles,
  MessageCircle,
  TrendingUp,
  Heart,
} from "lucide-react";
import { Link } from "react-router-dom";
import Button from "@/components/ui/button";

const DashboardPage: React.FC = () => {
  const quickActions = [
    {
      name: "Classify New Item",
      description: "Upload and classify a new fashion item",
      href: "/classify",
      icon: Camera,
      color: "bg-blue-500",
    },
    {
      name: "Browse Wardrobe",
      description: "View and manage your fashion collection",
      href: "/wardrobe",
      icon: Shirt,
      color: "bg-green-500",
    },
    {
      name: "Get Recommendations",
      description: "AI-powered outfit suggestions",
      href: "/recommendations",
      icon: Sparkles,
      color: "bg-purple-500",
    },
    {
      name: "Style Assistant",
      description: "Chat with our AI style expert",
      href: "/chat",
      icon: MessageCircle,
      color: "bg-pink-500",
    },
  ];

  const stats = [
    { name: "Items in Wardrobe", value: "47", icon: Shirt },
    { name: "Outfits Created", value: "23", icon: Sparkles },
    { name: "Favorite Items", value: "15", icon: Heart },
    { name: "Style Score", value: "94", icon: TrendingUp },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-primary-600 to-fashion-pink rounded-2xl p-8 text-white">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl"
        >
          <h1 className="text-4xl font-bold mb-4">Welcome to ClosetIQ</h1>
          <p className="text-xl text-primary-100 mb-6">
            Your intelligent fashion companion is ready to help you discover
            your perfect style.
          </p>
          <Link to="/classify">
            <Button
              variant="secondary"
              className="bg-white text-primary-600 hover:bg-gray-100"
            >
              <Camera className="w-5 h-5 mr-2" />
              Start Classifying
            </Button>
          </Link>
        </motion.div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-xl shadow-md p-6"
          >
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <stat.icon className="w-8 h-8 text-primary-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {quickActions.map((action, index) => (
            <motion.div
              key={action.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.1 }}
            >
              <Link
                to={action.href}
                className="block p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-200 group"
              >
                <div className="flex items-center">
                  <div
                    className={`flex-shrink-0 w-12 h-12 ${action.color} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200`}
                  >
                    <action.icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary-600 transition-colors duration-200">
                      {action.name}
                    </h3>
                    <p className="text-gray-600">{action.description}</p>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Recent Activity
        </h2>
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="space-y-4">
            {[
              {
                action: "Classified new item",
                item: "Blue Denim Jacket",
                time: "2 hours ago",
              },
              {
                action: "Added to favorites",
                item: "Black Evening Dress",
                time: "5 hours ago",
              },
              {
                action: "Generated outfit",
                item: "Work Professional Look",
                time: "1 day ago",
              },
              {
                action: "Asked style question",
                item: "Color matching advice",
                time: "2 days ago",
              },
            ].map((activity, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0"
              >
                <div>
                  <p className="font-medium text-gray-900">{activity.action}</p>
                  <p className="text-sm text-gray-600">{activity.item}</p>
                </div>
                <span className="text-sm text-gray-500">{activity.time}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
