import apiClient from './apiClient';

export interface ClassificationResult {
  predicted_class: string;
  confidence: number;
  all_predictions: Array<{
    class: string;
    confidence: number;
  }>;
}

export interface AttributeAnalysis {
  attributes: Record<string, string[]>;
  confidence_scores: Record<string, number>;
  overall_confidence: number;
  enhanced_analysis?: {
    dominant_colors: string[];
    patterns: Record<string, any>;
    structural_features: Record<string, any>;
    texture_features: Record<string, any>;
  };
  processing_time?: number;
  timestamp?: string;
}

export interface ImageQuality {
  grade: string;
  overall_score: number;
  component_scores: Record<string, number>;
  recommendations: string[];
}

export interface ClassificationResponse {
  success: boolean;
  classification: ClassificationResult;
  attributes?: AttributeAnalysis;
  image_quality?: ImageQuality;
  processing_time_ms?: number;
  model_version?: string;
  timestamp?: string;
  error?: string;
}

class AIService {
  async classifyImage(imageFile: File): Promise<ClassificationResponse> {
    try {
      console.log('🚀 AIService: Starting classification request');
      console.log('📁 File details:', {
        name: imageFile.name,
        size: imageFile.size,
        type: imageFile.type
      });
      
      const formData = new FormData();
      formData.append('image', imageFile);

      console.log('📤 AIService: Sending request to /api/classify');
      
      // apiClient.upload returns ApiResponse<ClassificationResponse>
      const apiResponse = await apiClient.upload<ClassificationResponse>(
        '/api/classify',
        formData
      );

      console.log('📨 AIService: Received API response:', apiResponse);

      // Validate API response wrapper
      if (!apiResponse) {
        throw new Error('No response received from server');
      }

      if (typeof apiResponse !== 'object') {
        throw new Error('Invalid response format');
      }

      if (!apiResponse.success) {
        throw new Error(apiResponse.error || 'API request failed');
      }

      // Extract the actual data from the API response wrapper
      const response = apiResponse.data;

      console.log('📊 AIService: Extracted data:', response);

      // Validate the actual classification response
      if (!response) {
        throw new Error('No data received from server');
      }

      if (typeof response !== 'object') {
        throw new Error('Invalid data format');
      }

      if (!response.success) {
        throw new Error(response.error || 'Classification failed');
      }

      // FIXED: Don't reject if predicted_class is "unknown" - it's still a valid result
      if (!response.classification) {
        throw new Error('No classification data in response');
      }

      // FIXED: Accept "unknown" as a valid classification result
      // Ensure required fields exist with defaults
      const sanitizedResponse: ClassificationResponse = {
        success: response.success,
        classification: {
          predicted_class: response.classification.predicted_class || 'unknown',
          confidence: response.classification.confidence || 0,
          all_predictions: response.classification.all_predictions || []
        },
        attributes: response.attributes,
        image_quality: response.image_quality,
        processing_time_ms: response.processing_time_ms,
        model_version: response.model_version,
        timestamp: response.timestamp
      };

      console.log('✅ AIService: Classification successful');
      
      // FIXED: Log when we get "unknown" predictions for debugging
      if (sanitizedResponse.classification.predicted_class === 'unknown') {
        console.log('⚠️ AIService: Classification returned "unknown" - this may indicate the AI model needs retraining or the image is unclear');
      }
      
      return sanitizedResponse;

    } catch (error: any) {
      console.error('❌ AIService: Classification error:', error);
      
      // Handle different types of errors
      if (error.response) {
        const status = error.response.status;
        const data = error.response.data;
        
        if (status === 401) {
          throw new Error('Authentication failed. Please log in again.');
        } else if (status === 413) {
          throw new Error('Image file is too large. Please use a smaller image.');
        } else if (status === 429) {
          throw new Error('Too many requests. Please wait a moment and try again.');
        } else if (status === 503) {
          throw new Error('AI service is temporarily unavailable. Please try again later.');
        } else if (status >= 500) {
          throw new Error('Server error. Please try again later.');
        } else {
          const message = data?.message || data?.error || `Server error (${status})`;
          throw new Error(message);
        }
      } else if (error.request) {
        throw new Error('Network error. Please check your internet connection.');
      } else {
        throw new Error(error.message || 'Classification failed');
      }
    }
  }

  async generateRecommendations(preferences: {
    style_preferences: string[];
    body_type?: string;
    occasion?: string;
  }) {
    try {
      console.log('🎯 AIService: Generating recommendations');
      
      // apiClient.post also returns ApiResponse<T>
      const apiResponse = await apiClient.post('/api/recommendations', preferences);
      
      // Validate API response wrapper
      if (!apiResponse.success) {
        throw new Error(apiResponse.error || 'API request failed');
      }

      // Extract the actual data
      const response = apiResponse.data;
      
      if (!response) {
        throw new Error('No data received from server');
      }

      if (!response.success) {
        throw new Error(response.error || 'Failed to generate recommendations');
      }
      
      return response;
    } catch (error: any) {
      console.error('❌ AIService: Recommendations error:', error);
      
      if (error.response?.status === 503) {
        throw new Error('Recommendation service is temporarily unavailable');
      }
      
      throw new Error(error.message || 'Failed to generate recommendations');
    }
  }
}

export default new AIService();
