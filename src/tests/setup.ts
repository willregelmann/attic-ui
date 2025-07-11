// Test setup and configuration
import '@testing-library/jest-dom';

// Mock environment variables for tests
process.env.VITE_API_BASE_URL = 'http://localhost:8000/api';
process.env.VITE_GOOGLE_CLIENT_ID = 'test-google-client-id';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock fetch for API calls
global.fetch = jest.fn();

// Mock Google Sign-In
Object.defineProperty(window, 'google', {
  value: {
    accounts: {
      id: {
        initialize: jest.fn(),
        renderButton: jest.fn(),
      },
    },
  },
  writable: true,
});

// Clean up after each test
afterEach(() => {
  jest.clearAllMocks();
  localStorageMock.clear();
});

// Global test utilities
export const mockFetch = (response: any, ok = true) => {
  (global.fetch as jest.Mock).mockResolvedValueOnce({
    ok,
    json: () => Promise.resolve(response),
  });
};

export const mockLocalStorage = {
  setAuthData: (token: string, user: any) => {
    localStorageMock.setItem('auth_token', token);
    localStorageMock.setItem('user', JSON.stringify(user));
  },
  clearAuthData: () => {
    localStorageMock.removeItem('auth_token');
    localStorageMock.removeItem('user');
    localStorageMock.removeItem('google_profile');
  },
};