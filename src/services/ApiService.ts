// API Service for Will's Attic
import { config } from '../config';
import { ApiError, logError } from './errors';

export class ApiService {
  private baseUrl: string;
  private authToken: string | null = null;
  private timeout: number;

  constructor(baseUrl: string = config.api.baseUrl, timeout: number = config.api.timeout) {
    this.baseUrl = baseUrl;
    this.timeout = timeout;
  }

  setAuthToken(token: string | null) {
    this.authToken = token;
  }

  private async request<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...(this.authToken && { 'Authorization': `Bearer ${this.authToken}` }),
        ...options.headers,
      };

      const response = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Parse response
      const data = await response.json();

      if (!response.ok) {
        const apiError = new ApiError({
          success: false,
          message: data.message || `Request failed`,
          code: data.code,
          errors: data.errors,
          statusCode: response.status,
          timestamp: data.timestamp,
        });
        
        logError(apiError, `${options.method || 'GET'} ${endpoint}`);
        throw apiError;
      }

      return data;
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof ApiError) {
        throw error;
      }

      if (error.name === 'AbortError') {
        const timeoutError = ApiError.networkError('Request timed out');
        logError(timeoutError, `${options.method || 'GET'} ${endpoint}`);
        throw timeoutError;
      }

      const networkError = ApiError.networkError('Network request failed');
      logError(networkError, `${options.method || 'GET'} ${endpoint}`);
      throw networkError;
    }
  }

  // Auth endpoints
  async getGoogleAuthUrl() {
    return this.request('/auth/google/url');
  }

  async authenticateWithGoogleToken(googleToken: string) {
    return this.request('/auth/google/token', {
      method: 'POST',
      body: JSON.stringify({ google_token: googleToken }),
    });
  }

  async testLogin(testUserId?: string) {
    return this.request('/auth/test/login', {
      method: 'POST',
      body: JSON.stringify({ test_user_id: testUserId }),
    });
  }

  async getCurrentUser() {
    return this.request('/auth/me');
  }

  async logout() {
    return this.request('/auth/logout', { method: 'POST' });
  }

  // Health check
  async healthCheck() {
    return this.request('/health');
  }

  // Collections endpoints
  async getCollections() {
    return this.request('/collections');
  }

  async getCollection(id: string) {
    return this.request(`/collections/${id}`);
  }

  async createCollection(data: any) {
    return this.request('/collections', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateCollection(id: string, data: any) {
    return this.request(`/collections/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteCollection(id: string) {
    return this.request(`/collections/${id}`, {
      method: 'DELETE',
    });
  }

  // Items endpoints
  async getMyItems() {
    return this.request('/items');
  }

  async getItem(id: string) {
    return this.request(`/items/${id}`);
  }

  async createItem(data: any) {
    return this.request('/items', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateItem(id: string, data: any) {
    return this.request(`/items/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteItem(id: string) {
    return this.request(`/items/${id}`, {
      method: 'DELETE',
    });
  }

  // Collectibles endpoints
  async getCollectibles() {
    return this.request('/collectibles');
  }

  async getCollectible(id: string) {
    return this.request(`/collectibles/${id}`);
  }

  async searchCollectibles(query: string) {
    return this.request(`/collectibles/search?q=${encodeURIComponent(query)}`);
  }
}

// Create singleton instance with validated configuration
export const apiService = new ApiService();