import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { auth } from '@/config/firebase';
import toast from 'react-hot-toast';

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

interface QueuedRequest {
  resolve: (value: any) => void;
  reject: (error: any) => void;
  config: AxiosRequestConfig;
  retryCount: number;
}

class ApiClient {
  private client: AxiosInstance;
  private requestQueue: Map<string, Promise<any>> = new Map();
  private rateLimitQueue: QueuedRequest[] = [];
  private isProcessingQueue = false;
  private lastRequestTime = 0;
  private requestCount = 0;
  private resetTime = Date.now();
  private cachedToken: string | null = null;
  private tokenExpiry = 0;
  
  // Rate limiting configuration
  private readonly MAX_REQUESTS_PER_MINUTE = 30; // Conservative limit
  private readonly MIN_REQUEST_INTERVAL = 100; // Minimum 100ms between requests
  private readonly RATE_LIMIT_WINDOW = 60000; // 1 minute window

  constructor() {
    this.client = axios.create({
      baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
    this.startQueueProcessor();
  }

  private setupInterceptors(): void {
    // Request interceptor with token caching
    this.client.interceptors.request.use(
      async (config) => {
        // Add auth token if available (with caching)
        const user = auth.currentUser;
        if (user) {
          try {
            const token = await this.getCachedToken();
            if (token) {
              config.headers.Authorization = `Bearer ${token}`;
            }
          } catch (error) {
            console.error('Failed to get auth token:', error);
          }
        }

        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Simplified response interceptor (no retry logic here)
    this.client.interceptors.response.use(
      (response: AxiosResponse<ApiResponse>) => {
        return response;
      },
      async (error) => {
        // Handle errors but don't retry here (handled in queue processor)
        if (error.response) {
          const { status, data } = error.response;

          switch (status) {
            case 401:
              // Clear cached token on 401
              this.cachedToken = null;
              this.tokenExpiry = 0;
              console.error('Authentication failed:', data?.message || 'Unauthorized');
              break;
            case 403:
              toast.error('Access denied');
              break;
            case 404:
              console.error('Resource not found:', error.config?.url);
              break;
            case 429:
              console.warn('Rate limited:', data?.message || 'Too many requests');
              break;
            case 500:
              console.error('Server error:', data?.message);
              break;
            default:
              console.error('API Error:', data?.message || 'An unexpected error occurred');
          }
        } else if (error.request) {
          console.error('Network error. Please check your connection.');
        }

        return Promise.reject(error);
      }
    );
  }

  // Cached token management
  private async getCachedToken(): Promise<string | null> {
    const user = auth.currentUser;
    if (!user) return null;

    // Check if cached token is still valid (refresh 5 minutes before expiry)
    const now = Date.now();
    if (this.cachedToken && this.tokenExpiry > now + 300000) {
      return this.cachedToken;
    }

    try {
      // Get fresh token
      const token = await user.getIdToken(false);
      this.cachedToken = token;
      
      // Estimate expiry (Firebase tokens are usually valid for 1 hour)
      this.tokenExpiry = now + 3600000; // 1 hour from now
      
      return token;
    } catch (error) {
      console.error('Failed to refresh token:', error);
      this.cachedToken = null;
      this.tokenExpiry = 0;
      return null;
    }
  }

  // Rate limiting logic
  private shouldRateLimit(): boolean {
    const now = Date.now();
    
    // Reset counter if window has passed
    if (now - this.resetTime > this.RATE_LIMIT_WINDOW) {
      this.requestCount = 0;
      this.resetTime = now;
    }

    // Check if we've exceeded the rate limit
    if (this.requestCount >= this.MAX_REQUESTS_PER_MINUTE) {
      return true;
    }

    // Check minimum interval between requests
    if (now - this.lastRequestTime < this.MIN_REQUEST_INTERVAL) {
      return true;
    }

    return false;
  }

  // Queue processor with intelligent retry and rate limiting
  private startQueueProcessor(): void {
    setInterval(async () => {
      if (this.isProcessingQueue || this.rateLimitQueue.length === 0) {
        return;
      }

      if (this.shouldRateLimit()) {
        return; // Wait for next cycle
      }

      this.isProcessingQueue = true;
      const queuedRequest = this.rateLimitQueue.shift();

      if (queuedRequest) {
        try {
          this.requestCount++;
          this.lastRequestTime = Date.now();

          const response = await this.client.request(queuedRequest.config);
          queuedRequest.resolve(response.data);
        } catch (error: any) {
          // Handle retries for specific errors
          if (this.shouldRetry(error, queuedRequest.retryCount)) {
            queuedRequest.retryCount++;
            
            // Calculate delay based on error type and retry count
            const delay = this.calculateRetryDelay(error, queuedRequest.retryCount);
            
            setTimeout(() => {
              this.rateLimitQueue.unshift(queuedRequest); // Add back to front of queue
            }, delay);
          } else {
            queuedRequest.reject(error);
          }
        }
      }

      this.isProcessingQueue = false;
    }, 50); // Process queue every 50ms
  }

  private shouldRetry(error: any, retryCount: number): boolean {
    const maxRetries = 3;
    
    if (retryCount >= maxRetries) {
      return false;
    }

    // Retry on rate limiting, server errors, and network errors
    const status = error.response?.status;
    return (
      status === 429 || // Too Many Requests
      status >= 500 || // Server errors
      !status // Network errors
    );
  }

  private calculateRetryDelay(error: any, retryCount: number): number {
    const status = error.response?.status;
    
    if (status === 429) {
      // Use server's retry-after header if available
      const retryAfter = error.response.headers['retry-after'];
      if (retryAfter) {
        return parseInt(retryAfter) * 1000;
      }
      // Longer delay for rate limiting
      return Math.min(Math.pow(2, retryCount) * 2000, 30000); // Max 30 seconds
    }
    
    // Standard exponential backoff for other errors
    return Math.min(Math.pow(2, retryCount) * 1000, 10000); // Max 10 seconds
  }

  // Helper method for delays
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Enhanced deduplication for all methods
  private async dedupeRequest<T>(key: string, requestFn: () => Promise<T>): Promise<T> {
    if (this.requestQueue.has(key)) {
      return this.requestQueue.get(key);
    }

    const promise = requestFn().finally(() => {
      this.requestQueue.delete(key);
    });

    this.requestQueue.set(key, promise);
    return promise;
  }

  // Generic request method using queue
  private async queueRequest<T = any>(config: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return new Promise((resolve, reject) => {
      const queuedRequest: QueuedRequest = {
        resolve,
        reject,
        config,
        retryCount: 0
      };

      this.rateLimitQueue.push(queuedRequest);
    });
  }

  // Check backend connectivity (with deduplication)
  async checkHealth(): Promise<boolean> {
    const key = 'health-check';
    return this.dedupeRequest(key, async () => {
      try {
        const response = await this.client.get('/health', { 
          timeout: 5000,
          // Skip queue for health checks (direct request)
        });
        return response.status === 200;
      } catch (error) {
        console.error('Backend health check failed:', error);
        return false;
      }
    });
  }

  // GET method with deduplication
  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const key = `GET:${url}:${JSON.stringify(config || {})}`;
    return this.dedupeRequest(key, () => 
      this.queueRequest<T>({ ...config, method: 'GET', url })
    );
  }

  // POST method with smart deduplication for identical data
  async post<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    // Only deduplicate POST requests with identical data for specific endpoints
    const shouldDedupe = this.shouldDeduplicatePost(url, data);
    
    if (shouldDedupe) {
      const key = `POST:${url}:${JSON.stringify(data)}:${JSON.stringify(config || {})}`;
      return this.dedupeRequest(key, () => 
        this.queueRequest<T>({ ...config, method: 'POST', url, data })
      );
    }

    return this.queueRequest<T>({ ...config, method: 'POST', url, data });
  }

  // Helper to determine if POST should be deduplicated
  private shouldDeduplicatePost(url: string, data: any): boolean {
    // Deduplicate specific endpoints that are safe to deduplicate
    const dedupeEndpoints = [
      '/api/auth/register',
      '/api/auth/me',
      '/api/users/profile'
    ];
    
    return dedupeEndpoints.some(endpoint => url.includes(endpoint));
  }

  // PUT method
  async put<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    return this.queueRequest<T>({ ...config, method: 'PUT', url, data });
  }

  // PATCH method
  async patch<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    return this.queueRequest<T>({ ...config, method: 'PATCH', url, data });
  }

  // DELETE method
  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.queueRequest<T>({ ...config, method: 'DELETE', url });
  }

  // Upload file
  async upload<T = any>(
    url: string,
    formData: FormData,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    return this.queueRequest<T>({
      ...config,
      method: 'POST',
      url,
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  // Utility methods for debugging
  getQueueStatus() {
    return {
      pendingRequests: this.rateLimitQueue.length,
      cachedRequests: this.requestQueue.size,
      requestCount: this.requestCount,
      timeToReset: Math.max(0, this.RATE_LIMIT_WINDOW - (Date.now() - this.resetTime))
    };
  }

  // Clear all queues (useful for testing)
  clearQueues() {
    this.rateLimitQueue = [];
    this.requestQueue.clear();
    this.requestCount = 0;
    this.resetTime = Date.now();
  }
}

export default new ApiClient();
