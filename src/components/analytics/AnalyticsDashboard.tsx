import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from "chart.js";
import { Bar, Doughnut, Line } from "react-chartjs-2";
import { TrendingUp, Shirt, Heart, Target, Zap } from "lucide-react";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

interface AnalyticsData {
  totalItems: number;
  categoryDistribution: { [key: string]: number };
  confidenceDistribution: { [key: string]: number };
  weeklyActivity: { date: string; classifications: number; outfits: number }[];
  favoriteItems: number;
  averageConfidence: number;
  stylePersonality: string;
}

const AnalyticsDashboard: React.FC = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setAnalyticsData({
        totalItems: 47,
        categoryDistribution: {
          "Shirts & Blouses": 12,
          "T-shirts & Tops": 8,
          Dresses: 6,
          "Pants & Jeans": 10,
          Shoes: 8,
          Accessories: 3,
        },
        confidenceDistribution: {
          "High (80%+)": 32,
          "Medium (60-80%)": 12,
          "Low (<60%)": 3,
        },
        weeklyActivity: [
          { date: "2025-05-23", classifications: 3, outfits: 5 },
          { date: "2025-05-24", classifications: 2, outfits: 3 },
          { date: "2025-05-25", classifications: 5, outfits: 7 },
          { date: "2025-05-26", classifications: 1, outfits: 4 },
          { date: "2025-05-27", classifications: 4, outfits: 6 },
          { date: "2025-05-28", classifications: 3, outfits: 8 },
          { date: "2025-05-29", classifications: 6, outfits: 9 },
        ],
        favoriteItems: 15,
        averageConfidence: 0.84,
        stylePersonality: "Classic Minimalist",
      });
      setIsLoading(false);
    }, 1000);
  }, []);

  const statCards = [
    {
      name: "Total Items",
      value: analyticsData?.totalItems || 0,
      icon: Shirt,
      color: "bg-blue-500",
      change: "+12%",
      changeType: "increase",
    },
    {
      name: "Favorite Items",
      value: analyticsData?.favoriteItems || 0,
      icon: Heart,
      color: "bg-red-500",
      change: "+8%",
      changeType: "increase",
    },
    {
      name: "Avg Confidence",
      value: `${((analyticsData?.averageConfidence || 0) * 100).toFixed(0)}%`,
      icon: Target,
      color: "bg-green-500",
      change: "+5%",
      changeType: "increase",
    },
    {
      name: "Style Score",
      value: "94",
      icon: Zap,
      color: "bg-purple-500",
      change: "+15%",
      changeType: "increase",
    },
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl p-6 animate-pulse">
              <div className="h-4 bg-gray-300 rounded mb-4"></div>
              <div className="h-8 bg-gray-300 rounded mb-2"></div>
              <div className="h-3 bg-gray-300 rounded w-1/2"></div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl p-6 animate-pulse">
              <div className="h-6 bg-gray-300 rounded mb-4"></div>
              <div className="h-64 bg-gray-300 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Chart configurations
  const categoryChartData = {
    labels: Object.keys(analyticsData?.categoryDistribution || {}),
    datasets: [
      {
        data: Object.values(analyticsData?.categoryDistribution || {}),
        backgroundColor: [
          "#3B82F6",
          "#EF4444",
          "#10B981",
          "#F59E0B",
          "#8B5CF6",
          "#06B6D4",
        ],
        borderWidth: 0,
      },
    ],
  };

  const confidenceChartData = {
    labels: Object.keys(analyticsData?.confidenceDistribution || {}),
    datasets: [
      {
        label: "Items",
        data: Object.values(analyticsData?.confidenceDistribution || {}),
        backgroundColor: "#3B82F6",
        borderRadius: 8,
      },
    ],
  };

  const activityChartData = {
    labels:
      analyticsData?.weeklyActivity.map((item) =>
        new Date(item.date).toLocaleDateString("en-US", { weekday: "short" })
      ) || [],
    datasets: [
      {
        label: "Classifications",
        data:
          analyticsData?.weeklyActivity.map((item) => item.classifications) ||
          [],
        borderColor: "#3B82F6",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        tension: 0.4,
      },
      {
        label: "Outfit Generations",
        data: analyticsData?.weeklyActivity.map((item) => item.outfits) || [],
        borderColor: "#EF4444",
        backgroundColor: "rgba(239, 68, 68, 0.1)",
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Analytics Dashboard
        </h1>
        <p className="text-gray-600 mt-2">
          Insights into your fashion journey and AI system usage
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-xl shadow-md p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {stat.value}
                </p>
                <div className="flex items-center mt-2">
                  <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-600">{stat.change}</span>
                  <span className="text-sm text-gray-500 ml-1">
                    vs last month
                  </span>
                </div>
              </div>
              <div
                className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}
              >
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-md p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Category Distribution
          </h3>
          <div className="h-64">
            <Doughnut
              data={categoryChartData}
              options={{ responsive: true, maintainAspectRatio: false }}
            />
          </div>
        </motion.div>

        {/* Confidence Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl shadow-md p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Classification Confidence
          </h3>
          <div className="h-64">
            <Bar data={confidenceChartData} options={chartOptions} />
          </div>
        </motion.div>

        {/* Activity Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl shadow-md p-6 lg:col-span-2"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Weekly Activity
          </h3>
          <div className="h-64">
            <Line data={activityChartData} options={chartOptions} />
          </div>
        </motion.div>
      </div>

      {/* Style Insights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-gradient-to-r from-primary-50 to-fashion-pink/10 rounded-xl p-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Style Insights
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary-600 mb-2">
              {analyticsData?.stylePersonality}
            </div>
            <p className="text-gray-600">Your Style Personality</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary-600 mb-2">
              {(
                ((analyticsData?.favoriteItems || 0) /
                  (analyticsData?.totalItems || 1)) *
                100
              ).toFixed(0)}
              %
            </div>
            <p className="text-gray-600">Items Favorited</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary-600 mb-2">
              {analyticsData?.weeklyActivity.reduce(
                (sum, day) => sum + day.classifications,
                0
              ) || 0}
            </div>
            <p className="text-gray-600">Items Classified This Week</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AnalyticsDashboard;
