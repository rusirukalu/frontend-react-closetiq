import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Grid, List, Filter, Search, Heart, Eye, Edit3 } from "lucide-react";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";

interface ClothingItem {
  _id: string;
  imageUrl: string;
  category: string;
  attributes: {
    colors: string[];
    patterns: string[];
    materials: string[];
    season: string[];
    occasion: string[];
  };
  aiClassification: {
    confidence: number;
    qualityScore: number;
  };
  userMetadata: {
    name?: string;
    brand?: string;
    isFavorite: boolean;
    timesWorn: number;
    userTags: string[];
  };
  createdAt: string;
}

interface WardrobeGalleryProps {
  items: ClothingItem[];
  isLoading?: boolean;
  onItemClick: (item: ClothingItem) => void;
  onDeleteItem: (itemId: string) => void;
  onToggleFavorite: (itemId: string) => void;
  onEditItem: (item: ClothingItem) => void;
}

const WardrobeGallery: React.FC<WardrobeGalleryProps> = ({
  items,
  isLoading = false,
  onItemClick,

  onToggleFavorite,
  onEditItem,
}) => {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [filteredItems, setFilteredItems] = useState<ClothingItem[]>(items);

  // Get unique categories
  const categories = Array.from(new Set(items.map((item) => item.category)));

  useEffect(() => {
    let filtered = items;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (item) =>
          item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.userMetadata.name
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          item.userMetadata.brand
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          item.userMetadata.userTags.some((tag) =>
            tag.toLowerCase().includes(searchTerm.toLowerCase())
          )
      );
    }

    // Filter by category
    if (selectedCategory) {
      filtered = filtered.filter((item) => item.category === selectedCategory);
    }

    setFilteredItems(filtered);
  }, [items, searchTerm, selectedCategory]);

  const formatCategory = (category: string) => {
    return category.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const getConfidenceBadgeColor = (confidence: number) => {
    if (confidence >= 0.8) return "bg-green-100 text-green-800";
    if (confidence >= 0.6) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-gray-300 rounded-lg aspect-square mb-4"></div>
            <div className="h-4 bg-gray-300 rounded mb-2"></div>
            <div className="h-3 bg-gray-300 rounded w-2/3"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div className="flex items-center space-x-4">
          <Input
            placeholder="Search items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
            className="w-64"
          />

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="">All Categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {formatCategory(category)}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant={viewMode === "grid" ? "primary" : "outline"}
            size="sm"
            onClick={() => setViewMode("grid")}
          >
            <Grid className="w-4 h-4" />
          </Button>
          <Button
            variant={viewMode === "list" ? "primary" : "outline"}
            size="sm"
            onClick={() => setViewMode("list")}
          >
            <List className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Items Count */}
      <div className="text-sm text-gray-600">
        {filteredItems.length} of {items.length} items
        {searchTerm && ` matching "${searchTerm}"`}
        {selectedCategory && ` in ${formatCategory(selectedCategory)}`}
      </div>

      {/* Items Grid/List */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
            <Filter className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No items found
          </h3>
          <p className="text-gray-600">
            {searchTerm || selectedCategory
              ? "Try adjusting your search or filter criteria"
              : "Start by adding some items to your wardrobe"}
          </p>
        </div>
      ) : (
        <div
          className={
            viewMode === "grid"
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              : "space-y-4"
          }
        >
          {filteredItems.map((item, index) => (
            <motion.div
              key={item._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={
                viewMode === "grid"
                  ? "bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200 group"
                  : "bg-white rounded-xl shadow-md p-4 flex items-center space-x-4 hover:shadow-lg transition-shadow duration-200 group"
              }
            >
              {viewMode === "grid" ? (
                // Grid View
                <>
                  <div className="relative aspect-square overflow-hidden">
                    <img
                      src={item.imageUrl}
                      alt={
                        item.userMetadata.name || formatCategory(item.category)
                      }
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    />

                    {/* Overlay */}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          onClick={() => onItemClick(item)}
                          className="bg-white text-gray-900 hover:bg-gray-100"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => onEditItem(item)}
                          className="bg-white text-gray-900 hover:bg-gray-100"
                        >
                          <Edit3 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Favorite Button */}
                    <button
                      onClick={() => onToggleFavorite(item._id)}
                      className="absolute top-2 right-2 p-2 rounded-full bg-white bg-opacity-90 hover:bg-opacity-100 transition-all duration-200"
                    >
                      <Heart
                        className={`w-4 h-4 ${
                          item.userMetadata.isFavorite
                            ? "text-red-500 fill-current"
                            : "text-gray-400"
                        }`}
                      />
                    </button>

                    {/* Confidence Badge */}
                    <div className="absolute top-2 left-2">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getConfidenceBadgeColor(
                          item.aiClassification.confidence
                        )}`}
                      >
                        {(item.aiClassification.confidence * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>

                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-1">
                      {item.userMetadata.name || formatCategory(item.category)}
                    </h3>

                    {item.userMetadata.brand && (
                      <p className="text-sm text-gray-600 mb-2">
                        {item.userMetadata.brand}
                      </p>
                    )}

                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>Worn {item.userMetadata.timesWorn} times</span>
                      <span>
                        {new Date(item.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    {/* Tags */}
                    {item.userMetadata.userTags.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {item.userMetadata.userTags.slice(0, 2).map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded"
                          >
                            {tag}
                          </span>
                        ))}
                        {item.userMetadata.userTags.length > 2 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                            +{item.userMetadata.userTags.length - 2}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </>
              ) : (
                // List View
                <>
                  <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                    <img
                      src={item.imageUrl}
                      alt={
                        item.userMetadata.name || formatCategory(item.category)
                      }
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-gray-900">
                        {item.userMetadata.name ||
                          formatCategory(item.category)}
                      </h3>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => onToggleFavorite(item._id)}
                          className="p-1 rounded hover:bg-gray-100"
                        >
                          <Heart
                            className={`w-4 h-4 ${
                              item.userMetadata.isFavorite
                                ? "text-red-500 fill-current"
                                : "text-gray-400"
                            }`}
                          />
                        </button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onItemClick(item)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onEditItem(item)}
                        >
                          <Edit3 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                      {item.userMetadata.brand && (
                        <span>{item.userMetadata.brand}</span>
                      )}
                      <span>Worn {item.userMetadata.timesWorn} times</span>
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${getConfidenceBadgeColor(
                          item.aiClassification.confidence
                        )}`}
                      >
                        {(item.aiClassification.confidence * 100).toFixed(0)}%
                        confidence
                      </span>
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default WardrobeGallery;
