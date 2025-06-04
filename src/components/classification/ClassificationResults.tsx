import React from "react";
import { motion } from "framer-motion";
import { Check, Star, TrendingUp, Info } from "lucide-react";
import Button from "@/components/ui/button";

interface ClassificationResult {
  predicted_category: string;
  confidence: number;
  all_predictions: Array<{
    category: string;
    confidence: number;
    percentage: number;
  }>;
  quality_score: {
    score: string;
    value: number;
  };
  processing_time: number;
}

interface ClassificationResultsProps {
  result: ClassificationResult;
  onAddToWardrobe: () => void;
  onClassifyNew: () => void;
  isAddingToWardrobe?: boolean;
}

const ClassificationResults: React.FC<ClassificationResultsProps> = ({
  result,
  onAddToWardrobe,
  onClassifyNew,
  isAddingToWardrobe = false,
}) => {
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return "text-green-600 bg-green-50";
    if (confidence >= 0.6) return "text-yellow-600 bg-yellow-50";
    return "text-red-600 bg-red-50";
  };

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 0.9) return "Excellent";
    if (confidence >= 0.8) return "Very Good";
    if (confidence >= 0.7) return "Good";
    if (confidence >= 0.6) return "Fair";
    return "Needs Review";
  };

  const formatCategory = (category: string) => {
    return category.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-lg p-6 space-y-6"
    >
      {/* Header */}
      <div className="text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Check className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">
          Classification Complete!
        </h2>
        <p className="text-gray-600">Our AI has analyzed your fashion item</p>
      </div>

      {/* Main Result */}
      <div className="bg-gradient-to-r from-primary-50 to-fashion-pink/10 rounded-lg p-6">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Predicted Category
          </h3>
          <div className="text-3xl font-bold text-primary-600 mb-2">
            {formatCategory(result.predicted_category)}
          </div>
          <div
            className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getConfidenceColor(
              result.confidence
            )}`}
          >
            <Star className="w-4 h-4 mr-1" />
            {(result.confidence * 100).toFixed(1)}% Confidence
          </div>
        </div>
      </div>

      {/* Top Predictions */}
      <div>
        <h4 className="text-lg font-semibold text-gray-900 mb-4">
          Top Predictions
        </h4>
        <div className="space-y-3">
          {result.all_predictions.slice(0, 5).map((prediction, index) => (
            <div
              key={prediction.category}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center space-x-3">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    index === 0
                      ? "bg-primary-100 text-primary-600"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {index + 1}
                </div>
                <span className="font-medium text-gray-900">
                  {formatCategory(prediction.category)}
                </span>
              </div>

              <div className="flex items-center space-x-3">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      index === 0 ? "bg-primary-500" : "bg-gray-400"
                    }`}
                    style={{ width: `${prediction.percentage}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-gray-700 w-12 text-right">
                  {prediction.percentage.toFixed(1)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quality Score & Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            <span className="font-semibold text-blue-900">Quality Score</span>
          </div>
          <div className="text-2xl font-bold text-blue-600">
            {result.quality_score.score}
          </div>
          <div className="text-sm text-blue-700">
            {result.quality_score.value}/100
          </div>
        </div>

        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Info className="w-5 h-5 text-green-600" />
            <span className="font-semibold text-green-900">
              Confidence Level
            </span>
          </div>
          <div className="text-2xl font-bold text-green-600">
            {getConfidenceLabel(result.confidence)}
          </div>
          <div className="text-sm text-green-700">
            {(result.confidence * 100).toFixed(1)}% match
          </div>
        </div>
      </div>

      {/* Processing Info */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="text-center text-sm text-gray-600">
          <p>
            Processed in {result.processing_time}ms using our advanced AI model
          </p>
          <p className="mt-1">Model: Fashion AI Classifier v1.0</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-4">
        <Button
          onClick={onAddToWardrobe}
          loading={isAddingToWardrobe}
          className="flex-1"
        >
          <Star className="w-4 h-4 mr-2" />
          Add to Wardrobe
        </Button>

        <Button variant="outline" onClick={onClassifyNew} className="flex-1">
          Classify Another
        </Button>
      </div>

      {/* Recommendation */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <Info className="w-5 h-5 text-yellow-600 mt-0.5" />
          <div>
            <h5 className="font-semibold text-yellow-900">AI Recommendation</h5>
            <p className="text-yellow-800 text-sm mt-1">
              {result.confidence >= 0.8
                ? "Excellent classification! This item is ready to be added to your wardrobe."
                : result.confidence >= 0.6
                ? "Good classification. Consider retaking the photo with better lighting for improved accuracy."
                : "Low confidence detected. For best results, try uploading a clearer image with better lighting and positioning."}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ClassificationResults;
