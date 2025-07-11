import React from 'react';
import { createRoot } from 'react-dom/client';
import { Moon, Sun, ChevronDown, LogOut, Settings } from 'lucide-react';

import './globals.css';
import './utils/domPatch'; // Apply DOM patch for Google Sign-In compatibility
import { Button } from './components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card';
import { config } from './config';
import { apiService } from './services/ApiService';
import { DataService } from './services/DataService';
import { apolloClient, GET_COLLECTIONS, GET_MY_ITEMS } from './services/graphql';
import type { User, Collection, ScreenType } from './types';

// Import screen components
import CollectionsScreen from './components/screens/CollectionsScreen';
import CollectionDetailScreen from './components/screens/CollectionDetailScreen';
import MyCollectionScreen from './components/screens/MyCollectionScreen';
import AddItemScreen from './components/screens/AddItemScreen';
import AdminScreen from './components/screens/AdminScreen';
import ErrorBoundary from './components/ErrorBoundary';

// Google OAuth types
declare global {
  interface Window {
    google: any;
    gapi: any;
  }
}

const WillsAtticApp: React.FC = () => {
  console.log('WillsAtticApp rendering...');
  
  // Collections data from API
  const [allCollections, setAllCollections] = React.useState<Collection[]>([]);
  
  // Initialize screen from URL
  const getScreenFromPath = (pathname: string): ScreenType => {
    if (pathname.startsWith('/collections/') && pathname !== '/collections') {
      return 'collection-detail';
    }
    switch (pathname) {
      case '/': return 'my-collection'; // Default to My Collection
      case '/collections': return 'collections';
      case '/my-collection': return 'my-collection';
      case '/collection-detail': return 'collection-detail';
      case '/add-item': return 'add-item';
      case '/admin': return 'admin';
      default: return 'my-collection'; // Default to My Collection
    }
  };

  const [currentScreen, setCurrentScreen] = React.useState<ScreenType>(() => 
    getScreenFromPath(window.location.pathname)
  );
  
  // Initialize selected collection from URL if on collection detail page
  const [selectedCollection, setSelectedCollection] = React.useState<Collection | null>(() => {
    const pathname = window.location.pathname;
    if (pathname.startsWith('/collections/')) {
      const match = pathname.match(/\/collections\/(\d+)/);
      if (match) {
        const collectionId = parseInt(match[1]);
        return allCollections.find(c => c.id === collectionId) || null;
      }
    }
    return null;
  });
  const [starredCollections, setStarredCollections] = React.useState<number[]>([1, 2]); // Default starred collections
  const [editingItem, setEditingItem] = React.useState<any>(null);
  
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  const [user, setUser] = React.useState<User | null>(null);
  const [googleProfile, setGoogleProfile] = React.useState<any>(null); // Store Google profile data
  const [authToken, setAuthToken] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  
  console.log('Current state:', { currentScreen, isAuthenticated, user: !!user, googleProfile: !!googleProfile });

  // Navigation function that updates both state and URL
  const navigateToScreen = React.useCallback((screen: ScreenType, collection?: Collection) => {
    const pathMap: Record<ScreenType, string> = {
      'my-collection': '/', // My Collection is now the home page
      'collections': '/collections',
      'collection-detail': '/collection-detail',
      'add-item': '/add-item',
      'admin': '/admin'
    };
    
    let path = pathMap[screen] || '/';
    const state: any = { screen };
    
    // Handle collection detail with collection ID in URL
    if (screen === 'collection-detail' && collection) {
      path = `/collections/${collection.id}`;
      state.collection = collection;
      setSelectedCollection(collection);
    }
    
    window.history.pushState(state, '', path);
    setCurrentScreen(screen);
  }, []);

  // Handle browser back/forward buttons
  React.useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      const screen = event.state?.screen || getScreenFromPath(window.location.pathname);
      setCurrentScreen(screen);
      
      // Restore collection state if navigating to collection detail
      if (screen === 'collection-detail' && event.state?.collection) {
        setSelectedCollection(event.state.collection);
      } else if (screen === 'collection-detail' && !event.state?.collection) {
        // Try to find collection from URL path
        const match = window.location.pathname.match(/\/collections\/(\d+)/);
        if (match) {
          const collectionId = parseInt(match[1]);
          const collection = allCollections.find(c => c.id === collectionId);
          if (collection) {
            setSelectedCollection(collection);
          }
        }
      }
    };

    window.addEventListener('popstate', handlePopState);
    
    // Set initial state if not already set
    if (!window.history.state) {
      window.history.replaceState({ screen: currentScreen }, '', window.location.pathname);
    }

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [currentScreen, allCollections]);

  // Dark mode state
  const [isDarkMode, setIsDarkMode] = React.useState(() => {
    // Check localStorage and system preference
    const saved = localStorage.getItem('darkMode');
    if (saved !== null) {
      return JSON.parse(saved);
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // User dropdown state
  const [userDropdownOpen, setUserDropdownOpen] = React.useState(false);
  const userDropdownRef = React.useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Dark mode toggle function
  const toggleDarkMode = () => {
    setIsDarkMode(prev => {
      const newMode = !prev;
      localStorage.setItem('darkMode', JSON.stringify(newMode));
      return newMode;
    });
  };

  // Apply dark mode class to document
  React.useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Function to toggle starring a collection
  const toggleStar = (collectionId: number) => {
    setStarredCollections(prev => 
      prev.includes(collectionId) 
        ? prev.filter(id => id !== collectionId)
        : [...prev, collectionId]
    );
  };

  // Function to fetch Google profile photo via our backend
  const fetchGoogleProfilePhoto = async (authToken: string, googleId: string) => {
    try {
      // Make request to our backend to get the Google profile photo
      const response = await fetch(`${config.api.baseUrl}/user/google-profile-photo`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.photo_url) {
          // Update the profile with the real Google photo
          setGoogleProfile(prev => prev ? {
            ...prev,
            picture: data.photo_url,
            googlePicture: data.photo_url // Store the Google photo separately
          } : prev);
          
          // Update localStorage too
          const savedProfile = localStorage.getItem('google_profile');
          if (savedProfile) {
            const profileData = JSON.parse(savedProfile);
            profileData.picture = data.photo_url;
            profileData.googlePicture = data.photo_url;
            localStorage.setItem('google_profile', JSON.stringify(profileData));
          }
        }
      }
    } catch (error) {
      console.log('Could not fetch Google profile photo, using fallback');
    }
  };

  // Authentication functions
  const handleGoogleSignIn = async (credentialResponse: any) => {
    setIsLoading(true);
    console.log('Google credential received:', credentialResponse);
    
    try {
      // Send Google credential to our API for authentication
      console.log('Authenticating with API...');
      
      const response = await apiService.authenticateWithGoogleToken(credentialResponse.credential);
      console.log('API authentication response:', response);
      
      if (response.success) {
        // Set the API token
        apiService.setAuthToken(response.token);
        setAuthToken(response.token);
        
        // Store user data
        setUser(response.user);
        setIsAuthenticated(true);
        
        // Decode Google JWT to get profile info for display
        const payload = JSON.parse(atob(credentialResponse.credential.split('.')[1]));
        
        // The JWT picture URL is temporary and gets rate limited
        // We need to use the Google People API to get a proper profile photo
        // For now, we'll create a fallback and then fetch the real photo
        const fallbackAvatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(payload.name)}&size=96&background=6366f1&color=fff&bold=true`;
        
        // We'll initially use the fallback, then try to get the real Google photo
        const avatarUrl = fallbackAvatarUrl;
        
        const googleProfileData = {
          name: payload.name,
          picture: avatarUrl,
          fallbackPicture: fallbackAvatarUrl, // Store fallback URL
          email: payload.email,
          googleId: payload.sub, // Store Google ID for future use
        };
        console.log('Setting Google profile with fallback:', googleProfileData);
        setGoogleProfile(googleProfileData);
        
        // Try to fetch the real Google profile photo using Google's token
        // We need to make this request through our backend to avoid CORS
        fetchGoogleProfilePhoto(response.token, payload.sub);
        
        // Store in localStorage
        localStorage.setItem('auth_token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        localStorage.setItem('google_profile', JSON.stringify(googleProfileData));
        
        navigateToScreen('my-collection');
        console.log('Authentication successful - redirected to home');
      } else {
        throw new Error(response.message || 'Authentication failed');
      }
    } catch (error) {
      console.error('Authentication error:', error);
      alert(`Sign-in error: ${error instanceof Error ? error.message : 'Failed to authenticate with API'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      // Call API logout endpoint
      await apiService.logout();
    } catch (error) {
      console.error('Logout API error:', error);
      // Continue with local logout even if API call fails
    }
    
    // Clear local state and storage
    setIsAuthenticated(false);
    setUser(null);
    setGoogleProfile(null);
    setAuthToken(null);
    apiService.setAuthToken(null); // Clear API token
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    localStorage.removeItem('google_profile');
    // Redirect to my collection page after sign out  
    navigateToScreen('my-collection');
  };

  // Load collections when authenticated
  const loadCollections = React.useCallback(async () => {
    if (!isAuthenticated || !authToken) return;
    
    try {
      console.log('Loading collections with token:', authToken ? 'present' : 'missing');
      
      // Use REST API instead of GraphQL for now
      const response = await apiService.getCollections();
      
      if (response.success && response.data) {
        // Transform API response to match Collection interface
        const collections = response.data.map((collection: any) => ({
          id: collection.id,
          name: collection.name,
          slug: collection.slug,
          category: collection.category,
          type: collection.type || 'official',
          description: collection.description,
          image_url: collection.image_url,
          status: collection.status || 'active',
          year: new Date(collection.metadata?.releaseDate || collection.created_at).getFullYear(),
          completion: collection.metadata?.totalItems ? 
            Math.round((collection.items_count || 0) / collection.metadata.totalItems * 100) : 0,
          itemsCount: collection.items_count || 0,
          totalItems: collection.metadata?.totalItems || 0,
        }));
        
        setAllCollections(collections);
        console.log('Collections loaded successfully:', collections.length);
      } else {
        setAllCollections([]);
      }
    } catch (error) {
      console.error('Failed to load collections:', error);
      // For now, use mock data as fallback
      const mockCollections = [
        {
          id: '1',
          name: 'Pokemon Base Set',
          slug: 'pokemon-base-set',
          category: 'Trading Cards',
          type: 'official',
          description: 'The original Pokemon TCG set',
          image_url: 'https://images.pokemontcg.io/base1/logo.png',
          status: 'active',
          year: 1996,
          completion: 65,
          itemsCount: 65,
          totalItems: 102,
        },
        {
          id: '2',
          name: 'Star Wars Black Series',
          slug: 'star-wars-black-series',
          category: 'Action Figures',
          type: 'official',
          description: 'Premium 6-inch Star Wars figures',
          image_url: null,
          status: 'active',
          year: 2013,
          completion: 42,
          itemsCount: 21,
          totalItems: 50,
        },
        {
          id: '3',
          name: 'Marvel Legends',
          slug: 'marvel-legends',
          category: 'Action Figures', 
          type: 'official',
          description: 'Marvel superhero action figures',
          image_url: null,
          status: 'active',
          year: 2002,
          completion: 38,
          itemsCount: 15,
          totalItems: 40,
        }
      ];
      setAllCollections(mockCollections);
    }
  }, [isAuthenticated, authToken]);

  // Check for existing authentication on mount
  React.useEffect(() => {
    console.log('Checking for existing authentication...');
    const token = localStorage.getItem('auth_token');
    const savedUser = localStorage.getItem('user');
    const savedGoogleProfile = localStorage.getItem('google_profile');
    
    console.log('Auth check:', { hasToken: !!token, hasUser: !!savedUser, hasProfile: !!savedGoogleProfile });
    
    // Check for old mock tokens and clear them
    if (token && token.startsWith('mock_token_')) {
      console.log('Found old mock token, clearing authentication data');
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      localStorage.removeItem('google_profile');
      return;
    }
    
    // Also clear old tokens that don't start with the new format
    if (token && token.startsWith('3|')) {
      console.log('Found old token format, clearing authentication data');
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      localStorage.removeItem('google_profile');
      return;
    }
    
    if (token && savedUser) {
      try {
        setAuthToken(token);
        apiService.setAuthToken(token); // Set API token for service calls
        setUser(JSON.parse(savedUser));
        if (savedGoogleProfile) {
          const profileData = JSON.parse(savedGoogleProfile);
          
          // Generate fallback URL if not present
          if (!profileData.fallbackPicture && profileData.name) {
            profileData.fallbackPicture = `https://ui-avatars.com/api/?name=${encodeURIComponent(profileData.name)}&size=96&background=6366f1&color=fff&bold=true`;
          }
          
          setGoogleProfile(profileData);
        }
        setIsAuthenticated(true);
        console.log('Authentication restored from localStorage');
      } catch (error) {
        console.error('Error restoring authentication:', error);
        // Clear corrupted data
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
        localStorage.removeItem('google_profile');
      }
    } else {
      console.log('No existing authentication found');
    }
  }, []); // Remove currentScreen dependency to prevent loops

  // Load data when authentication changes
  React.useEffect(() => {
    if (isAuthenticated && authToken) {
      // Add a small delay to ensure token is available in localStorage
      setTimeout(() => {
        loadCollections();
      }, 100);
    } else {
      setAllCollections([]);
    }
  }, [isAuthenticated, authToken, loadCollections]);

  // Redirect to my collection if trying to access protected routes while unauthenticated
  React.useEffect(() => {
    const protectedScreens: ScreenType[] = ['collections', 'collection-detail', 'add-item', 'admin'];
    if (!isAuthenticated && protectedScreens.includes(currentScreen)) {
      navigateToScreen('my-collection');
    }
  }, [isAuthenticated, currentScreen, navigateToScreen]);

  // Google Sign-In initialization state
  const [googleReady, setGoogleReady] = React.useState(false);

  // Initialize Google Sign-In
  React.useEffect(() => {
    const initializeGoogleSignIn = () => {
      if (window.google && config.auth.googleClientId) {
        try {
          window.google.accounts.id.initialize({
            client_id: config.auth.googleClientId,
            callback: handleGoogleSignIn,
          });
          setGoogleReady(true);
          console.log('Google Sign-In initialized successfully');
        } catch (error) {
          console.error('Error initializing Google Sign-In:', error);
        }
      }
    };

    // Check if Google is already loaded
    if (window.google) {
      initializeGoogleSignIn();
    } else {
      // Wait for the script to load
      const checkGoogleLoaded = () => {
        if (window.google) {
          initializeGoogleSignIn();
        } else {
          setTimeout(checkGoogleLoaded, 100);
        }
      };
      checkGoogleLoaded();
    }
  }, []);

  // Authentication guard component
  const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    if (!isAuthenticated) {
      return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <Card className="max-w-2xl mx-auto text-center">
            <CardHeader>
              <CardTitle className="text-2xl">Authentication Required</CardTitle>
              <CardDescription>
                Please sign in to access your collections and manage your collectibles.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-6xl mb-4">🔒</div>
              <p className="text-muted-foreground">
                You need to be signed in to view this page. Click the button below to sign in with your Google account.
              </p>
              <Button 
                onClick={() => navigateToScreen('my-collection')}
                className="w-full"
              >
                Sign In to Continue
              </Button>
            </CardContent>
          </Card>
        </div>
      );
    }
    return <>{children}</>;
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-gradient-to-r from-primary via-purple-600 to-pink-600 text-white shadow-lg sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold">Will's Attic</h1>
            <nav className="flex items-center gap-2">
              <div className="hidden md:flex gap-2">
                <Button
                  variant={currentScreen === 'my-collection' ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => navigateToScreen('my-collection')}
                  className="text-white hover:text-white"
                >
                  My Collection
                </Button>
                <Button
                  variant={currentScreen === 'collections' ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => navigateToScreen('collections')}
                  className="text-white hover:text-white"
                >
                  Browse Collections
                </Button>
              </div>
              
              <div className="flex items-center gap-2">
                {isAuthenticated && user ? (
                  <div className="relative" ref={userDropdownRef}>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                      className="flex items-center gap-2 text-white hover:text-white hover:bg-white/10"
                    >
                      <img 
                        src={googleProfile?.picture || googleProfile?.fallbackPicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(googleProfile?.name || 'U')}&size=96&background=6366f1&color=fff&bold=true`} 
                        alt={googleProfile?.name || 'Profile'} 
                        className="w-6 h-6 rounded-full border border-white/20"
                        onError={(e) => {
                          // On error, fall back to UI Avatars
                          const fallback = `https://ui-avatars.com/api/?name=${encodeURIComponent(googleProfile?.name || 'U')}&size=96&background=6366f1&color=fff&bold=true`;
                          if (e.currentTarget.src !== fallback) {
                            e.currentTarget.src = fallback;
                          }
                        }}
                      />
                      <span className="text-sm font-medium hidden md:block">
                        {googleProfile?.name}
                      </span>
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                    
                    {userDropdownOpen && (
                      <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50">
                        <div className="px-3 py-2 border-b border-gray-200 dark:border-gray-700">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {googleProfile?.name}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {user?.email}
                          </p>
                        </div>
                        <button
                          onClick={() => {
                            setUserDropdownOpen(false);
                            navigateToScreen('admin');
                          }}
                          className="w-full px-3 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                        >
                          <Settings className="h-4 w-4" />
                          Admin
                        </button>
                        <button
                          onClick={() => {
                            toggleDarkMode();
                          }}
                          className="w-full px-3 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                        >
                          {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                          {isDarkMode ? 'Light Mode' : 'Dark Mode'}
                        </button>
                        <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
                        <button
                          onClick={() => {
                            setUserDropdownOpen(false);
                            handleSignOut();
                          }}
                          className="w-full px-3 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                        >
                          <LogOut className="h-4 w-4" />
                          Sign Out
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={toggleDarkMode}
                      className="text-white hover:text-white hover:bg-white/20"
                      title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
                    >
                      {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigateToScreen('my-collection')}
                      className="text-white hover:text-white"
                    >
                      Sign In
                    </Button>
                  </>
                )}
              </div>
            </nav>
          </div>
        </div>
      </header>

      <main>
        
        {currentScreen === 'collections' && (
          <ProtectedRoute>
            <CollectionsScreen
              allCollections={allCollections}
              starredCollections={starredCollections}
              toggleStar={toggleStar}
              setSelectedCollection={setSelectedCollection}
              setCurrentScreen={navigateToScreen}
            />
          </ProtectedRoute>
        )}
        {currentScreen === 'my-collection' && (
          <MyCollectionScreen
            isAuthenticated={isAuthenticated}
            user={user}
            googleProfile={googleProfile}
            googleReady={googleReady}
            isLoading={isLoading}
            setIsLoading={setIsLoading}
            allCollections={allCollections}
            starredCollections={starredCollections}
            setCurrentScreen={navigateToScreen}
            setAuthToken={setAuthToken}
            setUser={setUser}
            setIsAuthenticated={setIsAuthenticated}
            setGoogleProfile={setGoogleProfile}
          />
        )}
        {currentScreen === 'collection-detail' && (
          <ProtectedRoute>
            <CollectionDetailScreen
              selectedCollection={selectedCollection}
              setCurrentScreen={navigateToScreen}
              getAllCollectibles={DataService.getAllCollectibles}
              getUserItems={DataService.getUserItems}
            />
          </ProtectedRoute>
        )}
        {currentScreen === 'add-item' && (
          <ProtectedRoute>
            <AddItemScreen
              allCollections={allCollections}
              setCurrentScreen={navigateToScreen}
            />
          </ProtectedRoute>
        )}
        {currentScreen === 'admin' && (
          <ProtectedRoute>
            <AdminScreen
              allCollections={allCollections}
              setAllCollections={setAllCollections}
              editingItem={editingItem}
              setEditingItem={setEditingItem}
              getCollectionItems={DataService.getCollectionItems}
            />
          </ProtectedRoute>
        )}
      </main>
    </div>
  );
};

// Initialize the app
const container = document.getElementById('root');
if (!container) throw new Error('Root element not found');

const root = createRoot(container);
root.render(<WillsAtticApp />);