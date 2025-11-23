// src/pages/RecommendationsPage.tsx - Real data implementation
import React, { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Button from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  RefreshCw,
  Heart,
  Share2,
  Calendar,
  MapPin,
  Thermometer,
  Brain,
  Wand2,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Plus,
  Shirt,
  ShoppingBag,
  Info,
  Loader2,
  CloudOff,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store";
import {
  generateOutfitRecommendations,
  saveOutfit,
} from "@/store/slices/recommendationSlice";
import { fetchClothingItems } from "@/store/slices/clothingSlice";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

// ✅ Real Weather Service
interface WeatherData {
  temperature: number;
  condition: string;
  location: string;
  weathercode: number;
}

const useWeatherData = () => {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWeatherData = async () => {
      try {
        setIsLoading(true);

        // Get IP-based location
        const ipResponse = await fetch("https://ipinfo.io/json");
        const ipData = await ipResponse.json();

        if (!ipData.loc) {
          throw new Error("Could not determine location");
        }

        const [lat, lon] = ipData.loc.split(",");

        // Get weather data
        const weatherResponse = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`
        );
        const weatherApiData = await weatherResponse.json();

        const currentWeather = weatherApiData.current_weather;

        // Weather code mapping
        const conditionMap: Record<number, string> = {
          0: "clear",
          1: "mainly_clear",
          2: "partly_cloudy",
          3: "overcast",
          45: "fog",
          48: "fog",
          51: "drizzle",
          53: "drizzle",
          55: "drizzle",
          61: "rain",
          63: "rain",
          65: "heavy_rain",
          71: "drizzle",
          72: "drizzle",
          73: "drizzle",
          74: "drizzle",
          75: "heavy_rain",
          80: "rain_showers",
          81: "rain_showers",
          82: "heavy_rain_showers",
          95: "thunderstorm",
          96: "thunderstorm",
          99: "thunderstorm",
        };

        const condition = conditionMap[currentWeather.weathercode] || "unknown";

        setWeatherData({
          temperature: Math.round(currentWeather.temperature),
          condition: condition.replace("_", " "),
          location: `${ipData.city}, ${ipData.region}, ${ipData.country}`,
          weathercode: currentWeather.weathercode,
        });
      } catch (err: any) {
        console.error("Weather fetch error:", err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWeatherData();
  }, []);

  return { weatherData, isLoading, error };
};

// ✅ Auto-detect current season
const getCurrentSeason = () => {
  const month = new Date().getMonth();
  if (month >= 2 && month <= 4) return "spring";
  if (month >= 5 && month <= 7) return "summer";
  if (month >= 8 && month <= 10) return "fall";
  return "winter";
};

const RecommendationsPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { outfits, isGenerating, error, lastGeneratedFor } = useAppSelector(
    (state) => state.recommendations
  );
  const { items: clothingItems } = useAppSelector((state) => state.clothing);
  const { user } = useAppSelector((state) => state.auth);
  const { currentWardrobe } = useAppSelector((state) => state.wardrobe);

  // ✅ Real data states
  const [selectedOccasion, setSelectedOccasion] = useState("casual");
  const [selectedSeason, setSelectedSeason] = useState(getCurrentSeason());
  const {
    weatherData,
    isLoading: weatherLoading,
    error: weatherError,
  } = useWeatherData();

  const occasions = [
    {
      id: "work",
      label: "Work",
      icon: "💼",
      description: "Professional and polished",
      required: ["tops", "bottoms", "shoes"],
    },
    {
      id: "casual",
      label: "Casual",
      icon: "👕",
      description: "Relaxed and comfortable",
      required: ["tops", "bottoms", "shoes"],
    },
    {
      id: "formal",
      label: "Formal",
      icon: "🤵",
      description: "Elegant and sophisticated",
      required: ["dress_or_suit", "shoes"],
    },
    {
      id: "party",
      label: "Party",
      icon: "🎉",
      description: "Fun and festive",
      required: ["statement_piece", "shoes"],
    },
    {
      id: "date",
      label: "Date",
      icon: "💕",
      description: "Romantic and stylish",
      required: ["attractive_top", "bottoms", "shoes"],
    },
    {
      id: "sport",
      label: "Sport",
      icon: "⚽",
      description: "Active and functional",
      required: ["tops", "bottoms", "shoes"],
    },
  ];

  const seasons = [
    { id: "spring", label: "Spring", icon: "🌸" },
    { id: "summer", label: "Summer", icon: "☀️" },
    { id: "fall", label: "Fall", icon: "🍂" },
    { id: "winter", label: "Winter", icon: "❄️" },
  ];

  // ✅ Smart wardrobe analysis
  const wardrobeAnalysis = useMemo(() => {
    const categoryMapping: Record<string, string> = {
      shirts_blouses: "tops",
      tshirts_tops: "tops",
      sweaters: "tops",
      dresses: "dresses",
      pants_jeans: "bottoms",
      shorts: "bottoms",
      skirts: "bottoms",
      shoes_sneakers: "shoes",
      shoes_formal: "shoes",
      jackets_coats: "outerwear",
      bags_accessories: "accessories",
    };

    const categoryCounts: Record<string, number> = {};
    const availableCategories = new Set<string>();

    clothingItems.forEach((item) => {
      const category = item.category;
      const mappedCategory = categoryMapping[category] || "accessories";
      categoryCounts[category] = (categoryCounts[category] || 0) + 1;
      availableCategories.add(mappedCategory);
    });

    const selectedOccasionData = occasions.find(
      (occ) => occ.id === selectedOccasion
    );
    const requiredCategories = selectedOccasionData?.required || [
      "tops",
      "bottoms",
      "shoes",
    ];

    const missingCategories = requiredCategories.filter((req) => {
      if (req === "dress_or_suit") return !availableCategories.has("dresses");
      if (req === "attractive_top" || req === "statement_piece")
        return !availableCategories.has("tops");
      return !availableCategories.has(req);
    });

    const categoryLabels: Record<string, string> = {
      tops: "Tops (shirts, t-shirts, blouses)",
      bottoms: "Bottoms (pants, jeans, skirts)",
      shoes: "Shoes (sneakers, formal)",
      dresses: "Dresses",
      dress_or_suit: "Dresses or Suits",
      attractive_top: "Attractive Tops",
      statement_piece: "Statement Pieces",
      outerwear: "Outerwear (jackets, coats)",
      accessories: "Accessories",
    };

    return {
      totalItems: clothingItems.length,
      categoryCounts,
      availableCategories: Array.from(availableCategories),
      requiredCategories,
      missingCategories,
      canGenerateOutfits: missingCategories.length === 0,
      categoryLabels,
    };
  }, [clothingItems, selectedOccasion]);

  // Force refresh clothing items when page loads
  useEffect(() => {
    if (currentWardrobe && user?.id) {
      dispatch(fetchClothingItems({ wardrobeId: currentWardrobe._id }));
    }
  }, [dispatch, currentWardrobe?._id, user?.id]);

  const handleGenerateRecommendations = async () => {
    if (!user || !currentWardrobe) {
      toast.error("Please select a wardrobe first!");
      return;
    }

    if (!wardrobeAnalysis.canGenerateOutfits) {
      toast.error(
        `Missing required items: ${wardrobeAnalysis.missingCategories
          .map((cat) => wardrobeAnalysis.categoryLabels[cat])
          .join(", ")}`
      );
      return;
    }

    try {
      const wardrobeItemIds = clothingItems
        .map((item) => item.id)
        .filter((id, index, array) => array.indexOf(id) === index)
        .filter((id) => id && typeof id === "string");

      if (wardrobeItemIds.length === 0) {
        toast.error("No clothing items found in your wardrobe!");
        return;
      }

      // ✅ Use real weather data if available
      const weatherContext = weatherData || undefined;

      const result = await dispatch(
        generateOutfitRecommendations({
          occasion: selectedOccasion,
          season: selectedSeason,
          weatherContext,
          wardrobeItems: wardrobeItemIds,
          count: 5,
        })
      ).unwrap();

      // ✅ Enhanced response handling
      console.log("🎯 Generation result:", result);

      if (result.outfits && result.outfits.length > 0) {
        toast.success(
          `Generated ${result.outfits.length} AI outfit recommendations!`
        );
      } else {
        toast.error(
          "AI couldn't generate outfits with your current items. Try adding more variety!"
        );
      }
    } catch (error: any) {
      console.error("AI recommendation generation failed:", error);
      toast.error(
        error.message || "Failed to generate recommendations. Please try again."
      );
    }
  };

  const handleSaveOutfit = async (outfit: any) => {
    try {
      await dispatch(saveOutfit(outfit)).unwrap();
      toast.success("Outfit saved!");
    } catch (error) {
      console.error("Failed to save outfit:", error);
      toast.error("Failed to save outfit.");
    }
  };

  const handleShareOutfit = (outfitId: string) => {
    navigator.clipboard
      .writeText(`${window.location.origin}/outfits/${outfitId}`)
      .then(() => toast.success("Outfit link copied to clipboard!"))
      .catch(() => toast.error("Failed to copy link"));
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 90) return "bg-green-500";
    if (score >= 75) return "bg-blue-500";
    if (score >= 60) return "bg-yellow-500";
    return "bg-gray-500";
  };

  // ✅ Wardrobe Analysis Card Component
  const WardrobeAnalysisCard = () => (
    <Card
      className={`mb-6 ${
        wardrobeAnalysis.canGenerateOutfits
          ? "bg-green-50 border-green-200"
          : "bg-yellow-50 border-yellow-200"
      }`}
    >
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          {wardrobeAnalysis.canGenerateOutfits ? (
            <CheckCircle className="h-5 w-5 text-green-600" />
          ) : (
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
          )}
          Wardrobe Analysis
          <Badge variant="outline" className="ml-auto">
            {wardrobeAnalysis.totalItems} items
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {wardrobeAnalysis.canGenerateOutfits ? (
          <div className="text-green-700">
            <p className="font-medium mb-2">
              ✅ Ready to generate {selectedOccasion} outfits!
            </p>
            <p className="text-sm">
              You have all required clothing categories for this occasion.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-yellow-700">
              <p className="font-medium mb-2">
                ⚠️ Missing required items for {selectedOccasion} outfits
              </p>
              <div className="space-y-2">
                {wardrobeAnalysis.missingCategories.map((category) => (
                  <div
                    key={category}
                    className="flex items-center gap-2 text-sm"
                  >
                    <span>•</span>
                    <span>{wardrobeAnalysis.categoryLabels[category]}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => navigate("/dashboard/classify")}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Items via AI
              </Button>
              <Button
                onClick={() => navigate("/dashboard/wardrobe")}
                variant="outline"
                size="sm"
              >
                <ShoppingBag className="h-4 w-4 mr-1" />
                View Wardrobe
              </Button>
            </div>
          </div>
        )}

        {/* ✅ Only show if we have categories */}
        {wardrobeAnalysis.availableCategories.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-sm font-medium mb-2">
              Available in your wardrobe:
            </p>
            <div className="flex flex-wrap gap-2">
              {wardrobeAnalysis.availableCategories.map((category) => (
                <Badge key={category} variant="secondary" className="text-xs">
                  {wardrobeAnalysis.categoryLabels[category] || category}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );

  // ✅ Empty State Component
  const EmptyState = () => (
    <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
      <CardContent className="p-8 text-center">
        <div className="mb-6">
          <Brain className="mx-auto h-16 w-16 text-purple-400 mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Ready to Create Amazing Outfits?
          </h3>
          <p className="text-gray-600 max-w-md mx-auto">
            Our AI will analyze your wardrobe and create personalized outfit
            recommendations based on the occasion, season, and weather.
          </p>
        </div>

        {wardrobeAnalysis.totalItems === 0 ? (
          <div className="space-y-4">
            <div className="p-4 bg-yellow-100 rounded-lg">
              <p className="text-yellow-800 font-medium">
                No items in your wardrobe yet!
              </p>
              <p className="text-yellow-700 text-sm mt-1">
                Start by adding some clothing items to get recommendations.
              </p>
            </div>
            <Button
              onClick={() => navigate("/dashboard/classify")}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Shirt className="mr-2 h-4 w-4" />
              Add Your First Item
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4 max-w-sm mx-auto">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {wardrobeAnalysis.totalItems}
                </div>
                <div className="text-xs text-gray-600">Items</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {wardrobeAnalysis.availableCategories.length}
                </div>
                <div className="text-xs text-gray-600">Categories</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">AI</div>
                <div className="text-xs text-gray-600">Powered</div>
              </div>
            </div>
            <p className="text-sm text-gray-500">
              Configure your preferences above and generate your first AI outfit
              recommendation!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="container mx-auto px-4 py-8 bg-gradient-to-br from-purple-50/30 to-blue-50/30 min-h-screen">
      <div className="max-w-6xl mx-auto">
        {/* Enhanced Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-3 flex items-center justify-center gap-3">
            <Brain className="h-10 w-10 text-purple-600" />
            AI Outfit Recommendations
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Get personalized outfit suggestions powered by our advanced AI that
            considers your wardrobe, style preferences, occasion, and weather
          </p>
          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg max-w-2xl mx-auto">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}
        </div>

        {/* Wardrobe Analysis */}
        <WardrobeAnalysisCard />

        {/* Occasion & Season Selector */}
        <Card className="mb-8 shadow-lg border-purple-100">
          <CardHeader className="bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-t-lg">
            <CardTitle className="flex items-center gap-2 text-xl">
              <Calendar className="h-6 w-6" />
              Configure Your Preferences
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            {/* Occasions */}
            <div>
              <h3 className="font-semibold mb-4 text-gray-900">
                Choose Occasion
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {occasions.map((occasion) => (
                  <Button
                    key={occasion.id}
                    variant={
                      selectedOccasion === occasion.id ? "secondary" : "outline"
                    }
                    className={`h-auto p-4 flex flex-col gap-2 transition-all duration-200 ${
                      selectedOccasion === occasion.id
                        ? "bg-purple-600 hover:bg-purple-700 shadow-lg transform scale-105"
                        : "hover:border-purple-300 hover:shadow-md"
                    }`}
                    onClick={() => setSelectedOccasion(occasion.id)}
                  >
                    <span className="text-2xl">{occasion.icon}</span>
                    <span className="text-sm font-medium">
                      {occasion.label}
                    </span>
                    <span className="text-xs text-gray-500 text-center">
                      {occasion.description}
                    </span>
                  </Button>
                ))}
              </div>
            </div>

            {/* Seasons */}
            <div>
              <h3 className="font-semibold mb-4 text-gray-900">
                Select Season
              </h3>
              <div className="grid grid-cols-4 gap-3">
                {seasons.map((season) => (
                  <Button
                    key={season.id}
                    variant={
                      selectedSeason === season.id ? "secondary" : "outline"
                    }
                    className={`flex items-center gap-2 transition-all duration-200 ${
                      selectedSeason === season.id
                        ? "bg-blue-600 hover:bg-blue-700 shadow-lg"
                        : "hover:border-blue-300 hover:shadow-md"
                    }`}
                    onClick={() => setSelectedSeason(season.id)}
                  >
                    <span className="text-lg">{season.icon}</span>
                    <span className="text-sm font-medium">{season.label}</span>
                    {season.id === getCurrentSeason() && (
                      <Badge variant="secondary" className="text-xs ml-auto">
                        Current
                      </Badge>
                    )}
                  </Button>
                ))}
              </div>
            </div>

            {/* Generate Button */}
            <div className="flex justify-center pt-6">
              <Button
                onClick={handleGenerateRecommendations}
                disabled={
                  isGenerating || !user || !wardrobeAnalysis.canGenerateOutfits
                }
                size="lg"
                className={`min-w-64 h-14 text-lg transition-all duration-200 ${
                  wardrobeAnalysis.canGenerateOutfits
                    ? "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-xl hover:shadow-2xl transform hover:scale-105"
                    : "bg-gray-400 cursor-not-allowed"
                }`}
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="mr-2 h-6 w-6 animate-spin" />
                    AI is generating outfits...
                  </>
                ) : (
                  <>
                    <Wand2 className="mr-2 h-6 w-6" />
                    Generate AI Recommendations
                  </>
                )}
              </Button>
            </div>

            {/* Info Box */}
            {!wardrobeAnalysis.canGenerateOutfits && (
              <div className="text-center p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <Info className="inline h-4 w-4 text-blue-600 mr-2" />
                <span className="text-blue-700 text-sm">
                  Add the missing clothing categories above to enable AI
                  recommendations
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* ✅ Real Weather Context - Only show if we have weather data */}
        {weatherData && (
          <Card className="mb-8 shadow-md">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-gray-500" />
                    <span className="text-sm text-gray-600 font-medium">
                      {weatherData.location}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Thermometer className="h-5 w-5 text-gray-500" />
                    <span className="text-sm text-gray-600 font-medium">
                      {weatherData.temperature}°C, {weatherData.condition}
                    </span>
                  </div>
                </div>
                <Badge
                  variant="secondary"
                  className="flex items-center gap-1 bg-purple-100 text-purple-700"
                >
                  <Brain className="h-3 w-3" />
                  Live Weather Data
                </Badge>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Weather Loading State */}
        {weatherLoading && (
          <Card className="mb-8 shadow-md">
            <CardContent className="p-4">
              <div className="flex items-center justify-center gap-2 text-gray-500">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Loading weather data...</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Weather Error State */}
        {weatherError && (
          <Card className="mb-8 shadow-md border-orange-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-orange-600">
                <CloudOff className="h-4 w-4" />
                <span className="text-sm">
                  Weather data unavailable - using seasonal recommendations
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ✅ Only show Last Generated Info if it exists */}
        {lastGeneratedFor?.timestamp && (
          <Card className="mb-6 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-sm text-blue-700">
                <TrendingUp className="h-4 w-4" />
                <span>
                  Last generated for{" "}
                  <strong>{lastGeneratedFor.occasion}</strong> in{" "}
                  <strong>{lastGeneratedFor.season}</strong> •{" "}
                  {new Date(lastGeneratedFor.timestamp).toLocaleTimeString()}
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* AI Recommendations */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold flex items-center gap-3">
            <Sparkles className="h-6 w-6 text-purple-600" />
            AI-Generated Outfits
            {outfits.length > 0 && (
              <Badge variant="outline" className="ml-auto">
                {outfits.length} recommendations
              </Badge>
            )}
          </h2>

          {outfits.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {outfits.map((outfit, index) => (
                <Card
                  key={outfit.id}
                  className="hover:shadow-xl transition-all duration-300 border-l-4 border-l-purple-500 bg-gradient-to-br from-white to-purple-50/30 transform hover:scale-105"
                >
                  <CardHeader className="pb-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg flex items-center gap-2">
                          {outfit.name}
                          <Brain className="h-4 w-4 text-purple-600" />
                        </CardTitle>
                        <div className="flex items-center gap-2 mt-2">
                          <div className="flex items-center gap-1">
                            <div
                              className={`w-3 h-3 rounded-full ${getConfidenceColor(
                                outfit.score
                              )}`}
                            />
                            <Badge
                              variant="default"
                              className="text-xs bg-purple-600"
                            >
                              {outfit.score}% AI match
                            </Badge>
                          </div>
                          <Badge
                            variant="outline"
                            className="text-xs capitalize border-purple-300"
                          >
                            {outfit.occasion}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSaveOutfit(outfit)}
                          className="hover:bg-purple-100"
                        >
                          <Heart className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleShareOutfit(outfit.id)}
                          className="hover:bg-purple-100"
                        >
                          <Share2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* ✅ Only show AI Explanation if it exists */}
                      {outfit.explanation && outfit.explanation.length > 0 && (
                        <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                          <h5 className="text-sm font-medium text-purple-900 mb-1">
                            Why AI recommends this:
                          </h5>
                          <ul className="text-xs text-purple-700 space-y-1">
                            {outfit.explanation
                              .slice(0, 2)
                              .map((reason: string, idx: number) => (
                                <li
                                  key={idx}
                                  className="flex items-start gap-1"
                                >
                                  <span>•</span>
                                  <span>{reason}</span>
                                </li>
                              ))}
                          </ul>
                        </div>
                      )}

                      {/* Outfit Items */}
                      <div className="grid grid-cols-2 gap-3">
                        {outfit.items?.slice(0, 4).map((itemId: string) => {
                          const item = clothingItems.find(
                            (ci) => ci.id === itemId
                          );
                          return (
                            <div
                              key={index}
                              className="flex items-center gap-3 p-3 border rounded-lg bg-gradient-to-br from-white to-gray-50 hover:shadow-md transition-shadow"
                            >
                              <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-blue-100 rounded-lg flex items-center justify-center">
                                <span className="text-xs font-bold text-purple-700">
                                  {item?.category?.charAt(0).toUpperCase() ||
                                    "I"}
                                </span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">
                                  {item?.name || `Item ${index + 1}`}
                                </p>
                                <p className="text-xs text-gray-500 capitalize">
                                  {item?.category?.replace("_", " ") ||
                                    "Fashion item"}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* ✅ Only show Style Tags if they exist */}
                      {outfit.tags && outfit.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {outfit.tags.map((tag: string) => (
                            <Badge
                              key={tag}
                              variant="secondary"
                              className="text-xs bg-blue-100 text-blue-700"
                            >
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}

                      {/* ✅ Only show Weather Context if it exists */}
                      {outfit.weatherContext && (
                        <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50 p-2 rounded">
                          <Thermometer className="h-3 w-3" />
                          <span>
                            Suitable for {outfit.weatherContext.temperature}°C,{" "}
                            {outfit.weatherContext.condition}
                          </span>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex gap-2 pt-2">
                        <Button
                          className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                          size="sm"
                          onClick={() =>
                            toast("Try outfit feature coming soon!")
                          }
                        >
                          <Sparkles className="mr-1 h-3 w-3" />
                          Try This Outfit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-purple-300 hover:bg-purple-50"
                          onClick={() =>
                            toast("Customize feature coming soon!")
                          }
                        >
                          Customize
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Enhanced AI Model Info */}
        <Card className="mt-8 bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Brain className="h-8 w-8 text-purple-600" />
              <h3 className="text-xl font-semibold">
                Powered by ClosetIQ Recommendations
              </h3>
            </div>
            <p className="text-gray-600 mb-6">
              Our AI analyzes your wardrobe, style preferences, occasion,
              weather, and fashion trends to create personalized outfit
              recommendations.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              {[
                {
                  label: "Style Analysis",
                  value: "Smart",
                  color: "text-purple-600",
                },
                {
                  label: "Weather Aware",
                  value: weatherData ? "Live" : "Seasonal",
                  color: "text-blue-600",
                },
                {
                  label: "Personal Preferences",
                  value: "Adaptive",
                  color: "text-green-600",
                },
                {
                  label: "Trend Conscious",
                  value: "Current",
                  color: "text-orange-600",
                },
              ].map(({ label, value, color }) => (
                <div key={label} className="p-4 bg-white rounded-lg shadow-sm">
                  <div className={`text-2xl font-bold ${color}`}>{value}</div>
                  <div className="text-xs text-gray-600 mt-1">{label}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RecommendationsPage;
