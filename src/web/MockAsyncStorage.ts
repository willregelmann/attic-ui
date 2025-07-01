// Mock AsyncStorage for web using localStorage
const AsyncStorage = {
  getItem: async (key: string): Promise<string | null> => {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.warn('AsyncStorage getItem error:', error);
      return null;
    }
  },

  setItem: async (key: string, value: string): Promise<void> => {
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      console.warn('AsyncStorage setItem error:', error);
    }
  },

  removeItem: async (key: string): Promise<void> => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.warn('AsyncStorage removeItem error:', error);
    }
  },

  clear: async (): Promise<void> => {
    try {
      localStorage.clear();
    } catch (error) {
      console.warn('AsyncStorage clear error:', error);
    }
  },

  getAllKeys: async (): Promise<string[]> => {
    try {
      return Object.keys(localStorage);
    } catch (error) {
      console.warn('AsyncStorage getAllKeys error:', error);
      return [];
    }
  },

  multiGet: async (keys: string[]): Promise<[string, string | null][]> => {
    try {
      return keys.map(key => [key, localStorage.getItem(key)]);
    } catch (error) {
      console.warn('AsyncStorage multiGet error:', error);
      return keys.map(key => [key, null]);
    }
  },

  multiSet: async (keyValuePairs: [string, string][]): Promise<void> => {
    try {
      keyValuePairs.forEach(([key, value]) => {
        localStorage.setItem(key, value);
      });
    } catch (error) {
      console.warn('AsyncStorage multiSet error:', error);
    }
  },

  multiRemove: async (keys: string[]): Promise<void> => {
    try {
      keys.forEach(key => {
        localStorage.removeItem(key);
      });
    } catch (error) {
      console.warn('AsyncStorage multiRemove error:', error);
    }
  },
};

export default AsyncStorage;