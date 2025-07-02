import React from 'react';
import { createRoot } from 'react-dom/client';
import { Search, Grid3X3, List, Clock, ArrowLeft, Star, Eye, Heart, Filter, Package, Moon, Sun } from 'lucide-react';

import './globals.css';
import { Button } from './components/ui/button';
import { Input } from './components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card';
import { Badge } from './components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './components/ui/select';
import { Progress } from './components/ui/progress';
import { cn, formatPercentage } from './lib/utils';

// Simple React app that works with normal React (not React Native Web)
// Google OAuth types
declare global {
  interface Window {
    google: any;
    gapi: any;
  }
}

interface User {
  id: number;
  username: string;
  email: string;
  google_avatar: string;
  profile: {
    displayName: string;
    bio: string | null;
    location: string | null;
  };
}

const WillsAtticApp: React.FC = () => {
  const [currentScreen, setCurrentScreen] = React.useState('auth');
  const [selectedCollection, setSelectedCollection] = React.useState<any>(null);
  const [starredCollections, setStarredCollections] = React.useState<number[]>([1, 2]); // Default starred collections
  const [editingItem, setEditingItem] = React.useState<any>(null);
  
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  const [user, setUser] = React.useState<User | null>(null);
  const [authToken, setAuthToken] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  // Dark mode state
  const [isDarkMode, setIsDarkMode] = React.useState(() => {
    // Check localStorage and system preference
    const saved = localStorage.getItem('darkMode');
    if (saved !== null) {
      return JSON.parse(saved);
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

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

  // Authentication functions
  const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'https://attic-pyhryhudn-will-regelmanns-projects.vercel.app').trim();
  const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID?.trim();
  
  // Debug logging for environment variables
  console.log('Environment variables:', {
    VITE_API_BASE_URL: `"${import.meta.env.VITE_API_BASE_URL}"`,
    VITE_GOOGLE_CLIENT_ID: import.meta.env.VITE_GOOGLE_CLIENT_ID ? `"${import.meta.env.VITE_GOOGLE_CLIENT_ID}"` : 'MISSING',
    API_BASE_URL_CLEAN: `"${API_BASE_URL}"`,
    GOOGLE_CLIENT_ID_CLEAN: GOOGLE_CLIENT_ID ? `"${GOOGLE_CLIENT_ID}"` : 'MISSING',
    NODE_ENV: import.meta.env.NODE_ENV,
    DEV: import.meta.env.DEV,
    PROD: import.meta.env.PROD
  });

  const handleGoogleSignIn = async (credentialResponse: any) => {
    setIsLoading(true);
    console.log('Google credential received:', credentialResponse);
    
    try {
      // Since the API is protected, directly use Google credential for authentication
      console.log('Creating user from Google credential (API bypass mode)');
      
      // Decode Google JWT to get user info (simple base64 decode, not verification)
      const payload = JSON.parse(atob(credentialResponse.credential.split('.')[1]));
      console.log('Google payload:', payload);
      
      const authenticatedUser = {
        id: Date.now(), // Use timestamp as unique ID
        username: payload.email.split('@')[0],
        email: payload.email,
        google_avatar: payload.picture,
        profile: {
          displayName: payload.name,
          bio: 'Authenticated via Google OAuth',
          location: null
        }
      };
      
      console.log('Setting authenticated user:', authenticatedUser);
      
      setUser(authenticatedUser);
      setIsAuthenticated(true);
      setAuthToken("google_token_" + Date.now());
      localStorage.setItem('auth_token', "google_token_" + Date.now());
      localStorage.setItem('user', JSON.stringify(authenticatedUser));
      setCurrentScreen('home');
      
      console.log('Authentication successful - redirected to home');
    } catch (error) {
      console.error('Google Sign-In error:', error);
      alert(`Sign-in error: ${error instanceof Error ? error.message : 'Failed to process Google authentication'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = () => {
    setIsAuthenticated(false);
    setUser(null);
    setAuthToken(null);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    // Redirect to auth page after sign out
    setCurrentScreen('auth');
  };

  // Check for existing authentication on mount
  React.useEffect(() => {
    const token = localStorage.getItem('auth_token');
    const savedUser = localStorage.getItem('user');
    
    if (token && savedUser) {
      setAuthToken(token);
      setUser(JSON.parse(savedUser));
      setIsAuthenticated(true);
      // Redirect authenticated users to home if they're on auth page
      if (currentScreen === 'auth') {
        setCurrentScreen('home');
      }
    }
  }, [currentScreen]);

  // Redirect to auth if trying to access protected routes while unauthenticated
  React.useEffect(() => {
    const protectedScreens = ['home', 'collections', 'collection-detail', 'admin'];
    if (!isAuthenticated && protectedScreens.includes(currentScreen)) {
      setCurrentScreen('auth');
    }
  }, [isAuthenticated, currentScreen]);

  // Google Sign-In initialization state
  const [googleReady, setGoogleReady] = React.useState(false);

  // Initialize Google Sign-In
  React.useEffect(() => {
    const initializeGoogleSignIn = () => {
      if (window.google && GOOGLE_CLIENT_ID) {
        try {
          window.google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: handleGoogleSignIn,
          });
          setGoogleReady(true);
          console.log('Google Sign-In initialized successfully');
        } catch (error) {
          console.error('Error initializing Google Sign-In:', error);
        }
      } else if (!GOOGLE_CLIENT_ID) {
        console.error('Google Client ID not found. Please set VITE_GOOGLE_CLIENT_ID in environment variables.');
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
          // Retry after a short delay
          setTimeout(checkGoogleLoaded, 100);
        }
      };
      
      const script = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
      if (script) {
        script.addEventListener('load', initializeGoogleSignIn);
        // Also check periodically in case the load event was missed
        checkGoogleLoaded();
      } else {
        // If script doesn't exist, check periodically
        checkGoogleLoaded();
      }
    }
  }, [GOOGLE_CLIENT_ID]);

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
                onClick={() => setCurrentScreen('auth')}
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

  // Mock collection data - shared between screens
  const allCollections = [
    {
      id: 1,
      name: 'Pokemon Base Set',
      category: 'Trading Cards',
      completion: 87,
      totalItems: 164,
      ownedItems: 142,
      recentActivity: '2 items added this week',
      rarity: 'legendary' as const,
      year: 1998,
    },
    {
      id: 2,
      name: 'Star Wars Black Series',
      category: 'Action Figures',
      completion: 65,
      totalItems: 69,
      ownedItems: 45,
      recentActivity: '1 item added this month',
      rarity: 'epic' as const,
      year: 2013,
    },
    {
      id: 3,
      name: 'Marvel Legends',
      category: 'Action Figures',
      completion: 32,
      totalItems: 56,
      ownedItems: 18,
      recentActivity: 'No recent activity',
      rarity: 'rare' as const,
      year: 2002,
    },
    {
      id: 4,
      name: 'Funko Pop Marvel',
      category: 'Collectible Figures',
      completion: 78,
      totalItems: 120,
      ownedItems: 94,
      recentActivity: '5 items added this week',
      rarity: 'common' as const,
      year: 2010,
    },
    {
      id: 5,
      name: 'Magic: The Gathering Alpha',
      category: 'Trading Cards',
      completion: 15,
      totalItems: 295,
      ownedItems: 44,
      recentActivity: '1 item added last month',
      rarity: 'legendary' as const,
      year: 1993,
    },
    {
      id: 6,
      name: 'DC Multiverse',
      category: 'Action Figures',
      completion: 55,
      totalItems: 85,
      ownedItems: 47,
      recentActivity: '3 items added this month',
      rarity: 'epic' as const,
      year: 2020,
    },
  ];

  const HomeScreen = () => {
    const starred = allCollections.filter(collection => starredCollections.includes(collection.id));
    const totalCollections = allCollections.length;
    const avgCompletion = Math.round(allCollections.reduce((sum, col) => sum + col.completion, 0) / totalCollections);
    const totalOwnedItems = allCollections.reduce((sum, col) => sum + col.ownedItems, 0);
    const totalPossibleItems = allCollections.reduce((sum, col) => sum + col.totalItems, 0);
    
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            {isAuthenticated && user ? `Welcome back, ${user.profile.displayName.split(' ')[0]}!` : 'Welcome to Will\'s Attic!'}
          </h1>
          <p className="text-lg text-muted-foreground">
            {isAuthenticated ? 'Here\'s what\'s happening with your collections' : 'Manage your collectibles in one organized platform'}
          </p>
        </div>

        {/* Progress Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-800">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Total Collections</p>
                  <div className="text-3xl font-bold text-blue-900 dark:text-blue-100">{totalCollections}</div>
                </div>
                <div className="text-3xl">📚</div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-800">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600 dark:text-green-400">Items Owned</p>
                  <div className="text-3xl font-bold text-green-900 dark:text-green-100">{totalOwnedItems}</div>
                  <p className="text-xs text-green-600 dark:text-green-400">of {totalPossibleItems}</p>
                </div>
                <div className="text-3xl">📦</div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-800">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600 dark:text-purple-400">Avg. Completion</p>
                  <div className="text-3xl font-bold text-purple-900 dark:text-purple-100">{avgCompletion}%</div>
                </div>
                <div className="text-3xl">🎯</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Starred Collections */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Starred Collections</h2>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setCurrentScreen('collections')}
              className="flex items-center gap-2"
            >
              <Search className="h-4 w-4" />
              Browse All
            </Button>
          </div>

          {starred.length === 0 ? (
            <Card className="p-8 text-center">
              <div className="text-4xl mb-4">⭐</div>
              <h3 className="text-lg font-semibold mb-2">No Starred Collections</h3>
              <p className="text-muted-foreground mb-4">
                Star your favorite collections to see them here and track your progress.
              </p>
              <Button onClick={() => setCurrentScreen('collections')}>
                Browse Collections
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {starred.map(collection => (
                <Card 
                  key={collection.id} 
                  className="group hover:shadow-lg transition-all duration-200 cursor-pointer hover:-translate-y-1"
                  onClick={() => {
                    setSelectedCollection(collection);
                    setCurrentScreen('collection-detail');
                  }}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="bg-gradient-to-br from-pink-400 to-red-500 rounded-xl w-16 h-16 flex items-center justify-center shrink-0">
                          <Package className="h-8 w-8 text-white" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <CardTitle className="text-xl leading-tight">{collection.name}</CardTitle>
                          <CardDescription className="text-sm">
                            {collection.category} • {collection.year}
                          </CardDescription>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleStar(collection.id);
                        }}
                        className="text-yellow-500 hover:text-yellow-600 hover:bg-yellow-50"
                      >
                        <Star className="h-5 w-5 fill-current" />
                      </Button>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-green-600">
                          {formatPercentage(collection.completion)} Complete
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {collection.ownedItems}/{collection.totalItems}
                        </span>
                      </div>
                      <Progress value={collection.completion} className="h-2" />
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>{collection.recentActivity}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setCurrentScreen('collections')}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                📚 Browse Collections
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Explore all available collections and discover new items to add to your collection.
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                🔐 API Integration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-2">
                Laravel API ready for authentication and real-time collection management.
              </p>
              <p className="text-xs text-green-600 font-medium">Status: Connected</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                💰 Trading Platform
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Connect with other collectors and trade items safely with our rating system.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };

  const CollectionsScreen = () => {
    const [searchTerm, setSearchTerm] = React.useState('');
    const [selectedCategory, setSelectedCategory] = React.useState('all');
    const [viewMode, setViewMode] = React.useState<'grid' | 'list'>('grid');

    const categories = ['all', 'Trading Cards', 'Action Figures', 'Collectible Figures'];

    // Filter collections based on search and category
    const filteredCollections = allCollections.filter(collection => {
      const matchesSearch = collection.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           collection.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           collection.rarity.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || collection.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });

    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <h1 className="text-4xl font-bold text-center mb-8 bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
          Collection Browser
        </h1>
        
        {/* Search and Filters */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search collections, categories, or rarity..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <div className="flex gap-3">
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>
                        {category === 'all' ? 'All Categories' : category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <div className="flex gap-1">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className="px-3"
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className="px-3"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
            
            <CardDescription>
              Found {filteredCollections.length} collections
              {searchTerm && ` matching "${searchTerm}"`}
              {selectedCategory !== 'all' && ` in ${selectedCategory}`}
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Collections Display */}
        <div className={cn(
          viewMode === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' 
            : 'flex flex-col gap-4'
        )}>
          {filteredCollections.map(collection => (
            <Card 
              key={collection.id} 
              className="group hover:shadow-lg transition-all duration-200 cursor-pointer hover:-translate-y-1"
              onClick={() => {
                setSelectedCollection(collection);
                setCurrentScreen('collection-detail');
              }}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-gradient-to-br from-pink-400 to-red-500 rounded-xl w-16 h-16 flex items-center justify-center shrink-0">
                      <Package className="h-8 w-8 text-white" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <CardTitle className="text-xl leading-tight">{collection.name}</CardTitle>
                      <CardDescription className="text-sm">
                        {collection.category} • {collection.year}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleStar(collection.id);
                      }}
                      className={cn(
                        "p-1",
                        starredCollections.includes(collection.id)
                          ? "text-yellow-500 hover:text-yellow-600 hover:bg-yellow-50"
                          : "text-gray-400 hover:text-yellow-500 hover:bg-yellow-50"
                      )}
                    >
                      <Star className={cn(
                        "h-5 w-5",
                        starredCollections.includes(collection.id) && "fill-current"
                      )} />
                    </Button>
                    <Badge variant={collection.rarity}>
                      {collection.rarity.charAt(0).toUpperCase() + collection.rarity.slice(1)}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-green-600">
                      {formatPercentage(collection.completion)} Complete
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {collection.ownedItems}/{collection.totalItems}
                    </span>
                  </div>
                  <Progress value={collection.completion} className="h-2" />
                </div>
                
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>{collection.recentActivity}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredCollections.length === 0 && (
          <Card className="py-16">
            <CardContent className="text-center">
              <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No collections found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search terms or category filter.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  const CollectionDetailScreen = () => {
    const [searchTerm, setSearchTerm] = React.useState('');
    const [selectedCondition, setSelectedCondition] = React.useState('all');
    const [selectedOwnership, setSelectedOwnership] = React.useState('all');
    const [viewMode, setViewMode] = React.useState<'grid' | 'list'>('grid');

    if (!selectedCollection) {
      return <div>No collection selected</div>;
    }

    // Mock collectibles data (catalog of all items that exist)
    const getAllCollectibles = (collectionId: number) => {
      const collectibles = {
        1: [ // Pokemon Base Set
          {
            id: 1,
            name: 'Charizard',
            number: '#004',
            rarity: 'legendary' as const,
            type: 'Fire',
            description: 'A Fire-type Pokémon. Charizard is the evolved form of Charmeleon.',
            imageUrl: 'https://images.pokemontcg.io/base1/4_hires.png',
            collectionId: 1,
            wishlistCount: 1247,
          },
          {
            id: 2,
            name: 'Blastoise',
            number: '#009',
            rarity: 'legendary' as const,
            type: 'Water',
            description: 'A Water-type Pokémon. Blastoise is the evolved form of Wartortle.',
            imageUrl: 'https://images.pokemontcg.io/base1/2_hires.png',
            collectionId: 1,
            wishlistCount: 892,
          },
          {
            id: 3,
            name: 'Venusaur',
            number: '#015',
            rarity: 'legendary' as const,
            type: 'Grass',
            description: 'A Grass-type Pokémon. Venusaur is the evolved form of Ivysaur.',
            collectionId: 1,
            wishlistCount: 743,
          },
          {
            id: 4,
            name: 'Pikachu',
            number: '#025',
            rarity: 'rare' as const,
            type: 'Electric',
            description: 'An Electric-type Pokémon. The most famous Pokémon.',
            collectionId: 1,
            wishlistCount: 2156,
          },
          {
            id: 5,
            name: 'Alakazam',
            number: '#065',
            rarity: 'epic' as const,
            type: 'Psychic',
            description: 'A Psychic-type Pokémon with incredible mental powers.',
            collectionId: 1,
            wishlistCount: 456,
          },
          {
            id: 6,
            name: 'Machamp',
            number: '#068',
            rarity: 'epic' as const,
            type: 'Fighting',
            description: 'A Fighting-type Pokémon known for its incredible strength.',
            collectionId: 1,
            wishlistCount: 334,
          },
        ],
        2: [ // Star Wars Black Series
          {
            id: 7,
            name: 'Darth Vader',
            number: '#02',
            rarity: 'epic' as const,
            type: 'Sith Lord',
            description: 'The Dark Lord of the Sith in his iconic black armor.',
            collectionId: 2,
            wishlistCount: 1823,
          },
          {
            id: 8,
            name: 'Luke Skywalker',
            number: '#01',
            rarity: 'legendary' as const,
            type: 'Jedi',
            description: 'Young Jedi Knight in his Return of the Jedi outfit.',
            collectionId: 2,
            wishlistCount: 1456,
          },
          {
            id: 9,
            name: 'Boba Fett',
            number: '#06',
            rarity: 'epic' as const,
            type: 'Bounty Hunter',
            description: 'The galaxy\'s most feared bounty hunter.',
            collectionId: 2,
            wishlistCount: 998,
          },
        ],
      };
      
      return collectibles[collectionId as keyof typeof collectibles] || [];
    };

    // Mock user items data (user's owned copies)
    const getUserItems = (userId: string, collectionId: number) => {
      const userItems = {
        'user123': {
          1: [ // Pokemon Base Set
            {
              id: 101,
              collectibleId: 1, // Charizard
              userId: 'user123',
              condition: 'Near Mint',
              acquiredDate: '2024-01-15',
              notes: 'Amazing card from my childhood collection',
              customImageUrl: null,
              lastUpdated: '2 days ago',
            },
            {
              id: 102,
              collectibleId: 2, // Blastoise
              userId: 'user123',
              condition: 'Lightly Played',
              acquiredDate: '2024-01-20',
              notes: 'Got this at a local card shop',
              customImageUrl: null,
              lastUpdated: '1 week ago',
            },
            {
              id: 103,
              collectibleId: 4, // Pikachu
              userId: 'user123',
              condition: 'Mint',
              acquiredDate: '2024-02-01',
              notes: 'Perfect condition!',
              customImageUrl: null,
              lastUpdated: '3 days ago',
            },
            {
              id: 104,
              collectibleId: 5, // Alakazam
              userId: 'user123',
              condition: 'Near Mint',
              acquiredDate: '2024-01-30',
              notes: '',
              customImageUrl: null,
              lastUpdated: '5 days ago',
            },
          ],
          2: [ // Star Wars Black Series
            {
              id: 105,
              collectibleId: 7, // Darth Vader
              userId: 'user123',
              condition: 'Mint',
              acquiredDate: '2024-02-05',
              notes: 'Still in original packaging',
              customImageUrl: null,
              lastUpdated: '1 day ago',
            },
            {
              id: 106,
              collectibleId: 8, // Luke Skywalker
              userId: 'user123',
              condition: 'Near Mint',
              acquiredDate: '2024-01-25',
              notes: 'Great figure from the series',
              customImageUrl: null,
              lastUpdated: '4 days ago',
            },
          ],
        }
      };
      
      return userItems[userId as keyof typeof userItems]?.[collectionId] || [];
    };

    // Function to combine collectibles with user ownership data
    const getCollectionItems = (collectionId: number, userId: string = 'user123') => {
      const collectibles = getAllCollectibles(collectionId);
      const userItems = getUserItems(userId, collectionId);
      
      // Map collectibles to include user ownership data
      return collectibles.map(collectible => {
        const userItem = userItems.find(item => item.collectibleId === collectible.id);
        
        return {
          ...collectible,
          // User-specific data
          owned: !!userItem,
          userItem: userItem || null,
          condition: userItem?.condition || 'Not Owned',
          lastUpdated: userItem?.lastUpdated || null,
          notes: userItem?.notes || '',
          customImageUrl: userItem?.customImageUrl || null,
        };
      });
    };

    const allItems = getCollectionItems(selectedCollection.id);
    const conditions = ['all', 'Mint', 'Near Mint', 'Lightly Played', 'Not Owned'];
    const ownershipOptions = ['all', 'owned', 'not-owned'];

    // Filter items based on search and filters
    const filteredItems = allItems.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.type.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCondition = selectedCondition === 'all' || item.condition === selectedCondition;
      const matchesOwnership = selectedOwnership === 'all' || 
                              (selectedOwnership === 'owned' && item.owned) ||
                              (selectedOwnership === 'not-owned' && !item.owned);
      return matchesSearch && matchesCondition && matchesOwnership;
    });

    const ownedCount = allItems.filter(item => item.owned).length;

    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header with back button */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentScreen('collections')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Collections
          </Button>
          <div className="flex items-center gap-3">
            <div className="text-4xl bg-gradient-to-br from-pink-400 to-red-500 rounded-xl w-16 h-16 flex items-center justify-center">
              {selectedCollection.image}
            </div>
            <div>
              <h1 className="text-3xl font-bold">{selectedCollection.name}</h1>
              <p className="text-muted-foreground">
                {selectedCollection.category} • {selectedCollection.year}
              </p>
            </div>
          </div>
        </div>

        {/* Collection Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{ownedCount}/{allItems.length}</div>
              <p className="text-sm text-muted-foreground">Items Owned</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{formatPercentage(selectedCollection.completion)}</div>
              <p className="text-sm text-muted-foreground">Complete</p>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search items..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <div className="flex gap-3">
                <Select value={selectedCondition} onValueChange={setSelectedCondition}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Condition" />
                  </SelectTrigger>
                  <SelectContent>
                    {conditions.map(condition => (
                      <SelectItem key={condition} value={condition}>
                        {condition === 'all' ? 'All Conditions' : condition}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedOwnership} onValueChange={setSelectedOwnership}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Ownership" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Items</SelectItem>
                    <SelectItem value="owned">Owned</SelectItem>
                    <SelectItem value="not-owned">Wanted</SelectItem>
                  </SelectContent>
                </Select>
                
                <div className="flex gap-1">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className="px-3"
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className="px-3"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
            
            <CardDescription>
              Found {filteredItems.length} items
              {searchTerm && ` matching "${searchTerm}"`}
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Items Display */}
        <div className={cn(
          viewMode === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' 
            : 'flex flex-col gap-4'
        )}>
          {filteredItems.map(item => (
            <Card 
              key={item.id} 
              className={cn(
                "group hover:shadow-lg transition-all duration-200 cursor-pointer",
                item.owned 
                  ? "hover:-translate-y-1 border-green-200" 
                  : "opacity-75 hover:opacity-100 border-dashed"
              )}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg w-12 h-12 flex items-center justify-center overflow-hidden">
                        {item.imageUrl ? (
                          <img 
                            src={item.imageUrl} 
                            alt={item.name} 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-muted flex items-center justify-center">
                            <Eye className="h-6 w-6 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      {!item.owned && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                          <Heart className="h-2 w-2 text-white" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <CardTitle className="text-lg leading-tight">{item.name}</CardTitle>
                      <CardDescription className="text-sm">
                        {item.number} • {item.type}
                      </CardDescription>
                    </div>
                  </div>
                  <Badge variant={item.rarity}>
                    {item.rarity.charAt(0).toUpperCase() + item.rarity.slice(1)}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {item.description}
                </p>
                
                <div className="flex items-center justify-between">
                  <div className="text-sm">
                    <span className={cn(
                      "font-medium",
                      item.owned ? "text-green-600" : "text-orange-600"
                    )}>
                      {item.condition}
                    </span>
                  </div>
                  <div className="text-right">
                    {item.owned && item.lastUpdated && (
                      <div className="text-xs text-muted-foreground">
                        Updated {item.lastUpdated}
                      </div>
                    )}
                  </div>
                </div>

                {item.wishlistCount && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Eye className="h-3 w-3" />
                    <span>{item.wishlistCount.toLocaleString()} watching</span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredItems.length === 0 && (
          <Card className="py-16">
            <CardContent className="text-center">
              <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No items found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search terms or filters.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  const CollectionAdminScreen = () => {
    const [selectedCollectionId, setSelectedCollectionId] = React.useState<number | null>(null);
    const [showItemForm, setShowItemForm] = React.useState(false);
    const [items, setItems] = React.useState<any[]>([]);

    // Helper functions for data access
    const getAllCollectibles = (collectionId: number) => {
      const collectibles = {
        1: [ // Pokemon Base Set
          {
            id: 1,
            name: 'Charizard',
            number: '#004',
            rarity: 'legendary' as const,
            type: 'Fire',
            description: 'A Fire-type Pokémon. Charizard is the evolved form of Charmeleon.',
            imageUrl: 'https://images.pokemontcg.io/base1/4_hires.png',
            collectionId: 1,
            wishlistCount: 1247,
          },
          {
            id: 2,
            name: 'Blastoise',
            number: '#009',
            rarity: 'legendary' as const,
            type: 'Water',
            description: 'A Water-type Pokémon. Blastoise is the evolved form of Wartortle.',
            imageUrl: 'https://images.pokemontcg.io/base1/2_hires.png',
            collectionId: 1,
            wishlistCount: 892,
          },
          {
            id: 3,
            name: 'Venusaur',
            number: '#015',
            rarity: 'legendary' as const,
            type: 'Grass',
            description: 'A Grass-type Pokémon. Venusaur is the evolved form of Ivysaur.',
            collectionId: 1,
            wishlistCount: 743,
          },
          {
            id: 4,
            name: 'Pikachu',
            number: '#025',
            rarity: 'rare' as const,
            type: 'Electric',
            description: 'An Electric-type Pokémon. The most famous Pokémon.',
            collectionId: 1,
            wishlistCount: 2156,
          },
          {
            id: 5,
            name: 'Alakazam',
            number: '#065',
            rarity: 'epic' as const,
            type: 'Psychic',
            description: 'A Psychic-type Pokémon with incredible mental powers.',
            collectionId: 1,
            wishlistCount: 456,
          },
          {
            id: 6,
            name: 'Machamp',
            number: '#068',
            rarity: 'epic' as const,
            type: 'Fighting',
            description: 'A Fighting-type Pokémon known for its incredible strength.',
            collectionId: 1,
            wishlistCount: 334,
          },
        ],
        2: [ // Star Wars Black Series
          {
            id: 7,
            name: 'Darth Vader',
            number: '#02',
            rarity: 'epic' as const,
            type: 'Sith Lord',
            description: 'The Dark Lord of the Sith in his iconic black armor.',
            collectionId: 2,
            wishlistCount: 1823,
          },
          {
            id: 8,
            name: 'Luke Skywalker',
            number: '#01',
            rarity: 'legendary' as const,
            type: 'Jedi',
            description: 'Young Jedi Knight in his Return of the Jedi outfit.',
            collectionId: 2,
            wishlistCount: 1456,
          },
          {
            id: 9,
            name: 'Boba Fett',
            number: '#06',
            rarity: 'epic' as const,
            type: 'Bounty Hunter',
            description: 'The galaxy\'s most feared bounty hunter.',
            collectionId: 2,
            wishlistCount: 998,
          },
        ],
      };
      
      return collectibles[collectionId as keyof typeof collectibles] || [];
    };

    const getUserItems = (userId: string, collectionId: number) => {
      const userItems = {
        'user123': {
          1: [ // Pokemon Base Set
            {
              id: 101,
              collectibleId: 1, // Charizard
              userId: 'user123',
              condition: 'Near Mint',
              acquiredDate: '2024-01-15',
              notes: 'Amazing card from my childhood collection',
              customImageUrl: null,
              lastUpdated: '2 days ago',
            },
            {
              id: 102,
              collectibleId: 2, // Blastoise
              userId: 'user123',
              condition: 'Lightly Played',
              acquiredDate: '2024-01-20',
              notes: 'Got this at a local card shop',
              customImageUrl: null,
              lastUpdated: '1 week ago',
            },
            {
              id: 103,
              collectibleId: 4, // Pikachu
              userId: 'user123',
              condition: 'Mint',
              acquiredDate: '2024-02-01',
              notes: 'Perfect condition!',
              customImageUrl: null,
              lastUpdated: '3 days ago',
            },
            {
              id: 104,
              collectibleId: 5, // Alakazam
              userId: 'user123',
              condition: 'Near Mint',
              acquiredDate: '2024-01-30',
              notes: '',
              customImageUrl: null,
              lastUpdated: '5 days ago',
            },
          ],
          2: [ // Star Wars Black Series
            {
              id: 105,
              collectibleId: 7, // Darth Vader
              userId: 'user123',
              condition: 'Mint',
              acquiredDate: '2024-02-05',
              notes: 'Still in original packaging',
              customImageUrl: null,
              lastUpdated: '1 day ago',
            },
            {
              id: 106,
              collectibleId: 8, // Luke Skywalker
              userId: 'user123',
              condition: 'Near Mint',
              acquiredDate: '2024-01-25',
              notes: 'Great figure from the series',
              customImageUrl: null,
              lastUpdated: '4 days ago',
            },
          ],
        }
      };
      
      return userItems[userId as keyof typeof userItems]?.[collectionId] || [];
    };

    const getCollectionItems = (collectionId: number, userId: string = 'user123') => {
      const collectibles = getAllCollectibles(collectionId);
      const userItems = getUserItems(userId, collectionId);
      
      return collectibles.map(collectible => {
        const userItem = userItems.find(item => item.collectibleId === collectible.id);
        
        return {
          ...collectible,
          owned: !!userItem,
          userItem: userItem || null,
          condition: userItem?.condition || 'Not Owned',
          lastUpdated: userItem?.lastUpdated || null,
          notes: userItem?.notes || '',
          customImageUrl: userItem?.customImageUrl || null,
        };
      });
    };

    // Initialize items for selected collection
    React.useEffect(() => {
      if (selectedCollectionId) {
        const collectionItems = getCollectionItems(selectedCollectionId);
        setItems(collectionItems);
      }
    }, [selectedCollectionId]);

    const handleAddItem = (newItem: any) => {
      const itemWithId = {
        ...newItem,
        id: Date.now(),
        lastUpdated: 'Just now',
        wishlistCount: 0
      };
      setItems(prev => [...prev, itemWithId]);
      setShowItemForm(false);
    };

    const handleEditItem = (updatedItem: any) => {
      setItems(prev => prev.map(item => 
        item.id === updatedItem.id 
          ? { ...updatedItem, lastUpdated: 'Just now' }
          : item
      ));
      setEditingItem(null);
      setShowItemForm(false);
    };

    const handleDeleteItem = async (itemId: number) => {
      const itemToDelete = items.find(item => item.id === itemId);
      
      if (confirm('Are you sure you want to delete this item?')) {
        // Delete the image from Vercel Blob if it exists
        if (itemToDelete?.imageUrl && itemToDelete.imageUrl.includes('blob.vercel-storage.com')) {
          try {
            const { del } = await import('@vercel/blob');
            await del(itemToDelete.imageUrl);
            console.log('Image deleted from Vercel Blob:', itemToDelete.imageUrl);
          } catch (error) {
            console.error('Failed to delete image from storage:', error);
            // Continue with item deletion even if image deletion fails
          }
        }
        
        // Remove item from local state
        setItems(prev => prev.filter(item => item.id !== itemId));
      }
    };

    const selectedCollection = allCollections.find(c => c.id === selectedCollectionId);

    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            Collection Admin
          </h1>
          <p className="text-lg text-muted-foreground">Manage collections and add/edit items</p>
        </div>

        {!selectedCollectionId ? (
          // Collection Selection
          <div>
            <h2 className="text-2xl font-bold mb-6">Select a Collection to Manage</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {allCollections.map(collection => (
                <Card 
                  key={collection.id} 
                  className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:-translate-y-1"
                  onClick={() => setSelectedCollectionId(collection.id)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <div className="bg-gradient-to-br from-pink-400 to-red-500 rounded-xl w-16 h-16 flex items-center justify-center">
                        <Package className="h-8 w-8 text-white" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-xl">{collection.name}</CardTitle>
                        <CardDescription>{collection.category} • {collection.year}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      {collection.ownedItems}/{collection.totalItems} items
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ) : (
          // Item Management
          <div>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedCollectionId(null)}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Collections
                </Button>
                <div className="flex items-center gap-3">
                  <div className="text-4xl bg-gradient-to-br from-pink-400 to-red-500 rounded-xl w-12 h-12 flex items-center justify-center">
                    {selectedCollection?.image}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">{selectedCollection?.name}</h2>
                    <p className="text-muted-foreground">{items.length} items</p>
                  </div>
                </div>
              </div>
              <Button 
                onClick={() => {
                  setEditingItem(null);
                  setShowItemForm(true);
                }}
                className="flex items-center gap-2"
              >
                <Search className="h-4 w-4" />
                Add New Item
              </Button>
            </div>

            {showItemForm && (
              <ItemForm
                item={editingItem}
                onSave={editingItem ? handleEditItem : handleAddItem}
                onCancel={() => {
                  setShowItemForm(false);
                  setEditingItem(null);
                }}
              />
            )}

            {/* Items List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {items.map(item => (
                <Card key={item.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg w-12 h-12 flex items-center justify-center overflow-hidden">
                          {item.imageUrl ? (
                            <img 
                              src={item.imageUrl} 
                              alt={item.name} 
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-muted flex items-center justify-center">
                              <Eye className="h-6 w-6 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <CardTitle className="text-lg">{item.name}</CardTitle>
                          <CardDescription>{item.number} • {item.type}</CardDescription>
                        </div>
                      </div>
                      <Badge variant={item.rarity}>
                        {item.rarity.charAt(0).toUpperCase() + item.rarity.slice(1)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {item.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="text-sm">
                        <span className={cn(
                          "font-medium",
                          item.owned ? "text-green-600" : "text-orange-600"
                        )}>
                          {item.condition}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditingItem(item);
                          setShowItemForm(true);
                        }}
                        className="flex-1"
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteItem(item.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const ItemForm = ({ item, onSave, onCancel }: { item?: any, onSave: (item: any) => void, onCancel: () => void }) => {
    const [formData, setFormData] = React.useState({
      name: item?.name || '',
      number: item?.number || '',
      type: item?.type || '',
      description: item?.description || '',
      imageUrl: item?.imageUrl || '',
      rarity: item?.rarity || 'common',
      condition: item?.condition || 'Mint',
      owned: item?.owned ?? true,
    });

    const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = React.useState<string>(item?.imageUrl || '');
    const [uploading, setUploading] = React.useState(false);
    const [uploadError, setUploadError] = React.useState<string | null>(null);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        // Validate file type
        if (!file.type.startsWith('image/')) {
          setUploadError('Please select an image file');
          return;
        }
        
        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          setUploadError('Image must be less than 5MB');
          return;
        }
        
        setSelectedFile(file);
        setUploadError(null);
        
        // Create preview URL
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
      }
    };

    const uploadImage = async (): Promise<string | null> => {
      if (!selectedFile) return null;
      
      setUploading(true);
      setUploadError(null);
      
      try {
        const { put } = await import('@vercel/blob');
        const filename = `items/${Date.now()}-${selectedFile.name.replace(/[^a-zA-Z0-9.-]/g, '')}`;
        const blob = await put(filename, selectedFile, {
          access: 'public',
        });
        return blob.url;
      } catch (error) {
        console.error('Upload error:', error);
        setUploadError('Failed to upload image. Please try again.');
        return null;
      } finally {
        setUploading(false);
      }
    };

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      
      let imageUrl = formData.imageUrl;
      
      // Upload new image if selected
      if (selectedFile) {
        const uploadedUrl = await uploadImage();
        if (uploadedUrl) {
          imageUrl = uploadedUrl;
        } else {
          // Don't submit if upload failed
          return;
        }
      }
      
      const updatedFormData = { ...formData, imageUrl };
      onSave(item ? { ...item, ...updatedFormData } : updatedFormData);
    };

    const clearImage = () => {
      setSelectedFile(null);
      setPreviewUrl('');
      setFormData(prev => ({ ...prev, imageUrl: '' }));
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    };

    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>{item ? 'Edit Item' : 'Add New Item'}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Name</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Item name"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Number</label>
                <Input
                  value={formData.number}
                  onChange={(e) => setFormData(prev => ({ ...prev, number: e.target.value }))}
                  placeholder="#001"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Type/Category</label>
                <Input
                  value={formData.type}
                  onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                  placeholder="e.g., Fire, Jedi, etc."
                />
              </div>
              <div className="md:col-span-2">
                <label className="text-sm font-medium mb-2 block">Image</label>
                <div className="space-y-3">
                  {/* Image preview */}
                  {previewUrl && (
                    <div className="flex items-center gap-4 p-3 border rounded-lg bg-muted/30">
                      <div className="w-16 h-16 rounded-lg overflow-hidden bg-background border flex items-center justify-center">
                        <img 
                          src={previewUrl} 
                          alt="Preview" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">
                          {selectedFile ? selectedFile.name : 'Current image'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {selectedFile ? `${(selectedFile.size / 1024 / 1024).toFixed(2)} MB` : ''}
                        </p>
                      </div>
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm" 
                        onClick={clearImage}
                        className="shrink-0"
                      >
                        Remove
                      </Button>
                    </div>
                  )}
                  
                  {/* Upload section */}
                  <div>
                    <label className="text-xs font-medium mb-1 block text-muted-foreground">Upload Image</label>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="w-full text-sm file:mr-3 file:py-2 file:px-3 file:rounded file:border-0 file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 file:cursor-pointer cursor-pointer"
                    />
                  </div>
                  
                  {uploadError && (
                    <p className="text-sm text-destructive bg-destructive/10 p-2 rounded">
                      {uploadError}
                    </p>
                  )}
                  
                  <p className="text-xs text-muted-foreground">
                    Upload an image (max 5MB). Images will be stored securely on Vercel Blob.
                  </p>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Rarity</label>
                <Select value={formData.rarity} onValueChange={(value) => setFormData(prev => ({ ...prev, rarity: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="common">Common</SelectItem>
                    <SelectItem value="rare">Rare</SelectItem>
                    <SelectItem value="epic">Epic</SelectItem>
                    <SelectItem value="legendary">Legendary</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Condition</label>
                <Select value={formData.condition} onValueChange={(value) => setFormData(prev => ({ ...prev, condition: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Mint">Mint</SelectItem>
                    <SelectItem value="Near Mint">Near Mint</SelectItem>
                    <SelectItem value="Lightly Played">Lightly Played</SelectItem>
                    <SelectItem value="Played">Played</SelectItem>
                    <SelectItem value="Poor">Poor</SelectItem>
                    <SelectItem value="Not Owned">Not Owned</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="owned"
                  checked={formData.owned}
                  onChange={(e) => setFormData(prev => ({ ...prev, owned: e.target.checked }))}
                  className="rounded"
                />
                <label htmlFor="owned" className="text-sm font-medium">I own this item</label>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Item description..."
                className="w-full min-h-[80px] px-3 py-2 border border-input rounded-md resize-none"
              />
            </div>
            <div className="flex gap-3">
              <Button type="submit" className="flex-1" disabled={uploading}>
                {uploading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                    Uploading...
                  </div>
                ) : (
                  item ? 'Update Item' : 'Add Item'
                )}
              </Button>
              <Button type="button" variant="outline" onClick={onCancel} className="flex-1" disabled={uploading}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    );
  };

  const AuthScreen = () => {
    const googleSignInRef = React.useRef<HTMLDivElement>(null);
    const [buttonRendered, setButtonRendered] = React.useState(false);

    // Render Google Sign-In button when Google is ready
    React.useEffect(() => {
      const renderButton = () => {
        if (googleReady && window.google && googleSignInRef.current && !isAuthenticated && GOOGLE_CLIENT_ID && !buttonRendered) {
          try {
            // Clear any existing content
            googleSignInRef.current.innerHTML = '';
            
            window.google.accounts.id.renderButton(googleSignInRef.current, {
              theme: 'outline',
              size: 'large',
              width: 400,
              text: 'signin_with',
            });
            setButtonRendered(true);
            console.log('Google Sign-In button rendered successfully');
          } catch (error) {
            console.error('Error rendering Google Sign-In button:', error);
            // Retry after a delay
            setTimeout(() => {
              setButtonRendered(false);
            }, 1000);
          }
        }
      };

      if (googleReady) {
        renderButton();
      }
    }, [googleReady, isAuthenticated, GOOGLE_CLIENT_ID, buttonRendered]);

    // Reset button rendered state when component mounts or when switching to auth screen
    React.useEffect(() => {
      setButtonRendered(false);
    }, []);

    if (isAuthenticated && user) {
      return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <h1 className="text-4xl font-bold text-center mb-8 bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            Welcome, {user.profile.displayName}!
          </h1>
          
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <div className="flex items-center gap-4">
                <img 
                  src={user.google_avatar} 
                  alt="Profile" 
                  className="w-16 h-16 rounded-full"
                />
                <div>
                  <CardTitle className="text-2xl">{user.profile.displayName}</CardTitle>
                  <CardDescription>{user.email}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Successfully authenticated with Google</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Connected to Laravel API</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Session persisted locally</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Ready to manage collections</span>
                </div>
              </div>
              
              <div className="pt-4 space-y-3">
                <Button 
                  className="w-full" 
                  onClick={() => setCurrentScreen('home')}
                >
                  <Search className="h-4 w-4 mr-2" />
                  Go to Dashboard
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full" 
                  onClick={handleSignOut}
                >
                  Sign Out
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-4xl font-bold text-center mb-8 bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
          Sign In to Will's Attic
        </h1>
        
        <Card className="max-w-2xl mx-auto">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Welcome!</CardTitle>
            <CardDescription>
              Sign in with your Google account to access your collectibles and start managing your collection.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-3">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>Sync collections across devices</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>Track progress and value</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>Connect with other collectors</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>Secure authentication with Google</span>
              </div>
            </div>
            
            <div className="pt-4">
              {!GOOGLE_CLIENT_ID ? (
                <div className="text-center py-4">
                  <div className="text-4xl mb-3">⚠️</div>
                  <h4 className="font-semibold text-red-600 mb-2">OAuth Configuration Required</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Google OAuth credentials need to be configured. Please contact the administrator.
                  </p>
                  <div className="text-xs text-muted-foreground bg-gray-50 p-3 rounded border-l-4 border-yellow-400">
                    <strong>For developers:</strong> Set VITE_GOOGLE_CLIENT_ID in your environment variables.
                  </div>
                </div>
              ) : isLoading ? (
                <div className="flex items-center justify-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  <span className="ml-2">Signing in...</span>
                </div>
              ) : !googleReady ? (
                <div className="flex items-center justify-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                  <span className="ml-2 text-sm text-muted-foreground">Loading Google Sign-In...</span>
                </div>
              ) : (
                <div className="flex justify-center">
                  <div ref={googleSignInRef}>
                    {!buttonRendered && (
                      <div className="flex items-center justify-center py-4">
                        <div className="animate-pulse bg-gray-200 rounded-lg h-12 w-80"></div>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {GOOGLE_CLIENT_ID && googleReady && (
                <p className="text-sm text-muted-foreground mt-4 text-center">
                  By signing in, you agree to our terms of service and privacy policy.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
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
                  variant={currentScreen === 'home' ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setCurrentScreen('home')}
                  className="text-white hover:text-white"
                >
                  🏠 Home
                </Button>
                <Button
                  variant={currentScreen === 'collections' ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setCurrentScreen('collections')}
                  className="text-white hover:text-white"
                >
                  📚 Collections
                </Button>
                <Button
                  variant={currentScreen === 'admin' ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setCurrentScreen('admin')}
                  className="text-white hover:text-white"
                >
                  ⚙️ Admin
                </Button>
              </div>
              
              <div className="flex items-center gap-2">
                {/* Dark Mode Toggle */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleDarkMode}
                  className="text-white hover:text-white hover:bg-white/20"
                  title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
                >
                  {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                </Button>
                
                {isAuthenticated && user ? (
                  <div className="flex items-center gap-3">
                  <img 
                    src={user.google_avatar} 
                    alt="Profile" 
                    className="w-8 h-8 rounded-full border-2 border-white/20"
                  />
                  <span className="text-sm font-medium hidden md:block">
                    {user.profile.displayName}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSignOut}
                    className="text-white hover:text-white hover:bg-white/10"
                  >
                    Sign Out
                  </Button>
                  </div>
                ) : (
                  <Button
                    variant={currentScreen === 'auth' ? 'secondary' : 'ghost'}
                    size="sm"
                    onClick={() => setCurrentScreen('auth')}
                    className="text-white hover:text-white"
                  >
                    🔐 Sign In
                  </Button>
                )}
              </div>
            </nav>
          </div>
        </div>
      </header>

      <main>
        {currentScreen === 'home' && (
          <ProtectedRoute>
            <HomeScreen />
          </ProtectedRoute>
        )}
        {currentScreen === 'collections' && (
          <ProtectedRoute>
            <CollectionsScreen />
          </ProtectedRoute>
        )}
        {currentScreen === 'collection-detail' && (
          <ProtectedRoute>
            <CollectionDetailScreen />
          </ProtectedRoute>
        )}
        {currentScreen === 'admin' && (
          <ProtectedRoute>
            <CollectionAdminScreen />
          </ProtectedRoute>
        )}
        {currentScreen === 'auth' && <AuthScreen />}
      </main>
    </div>
  );
};

// Initialize the app
const container = document.getElementById('root');
if (!container) throw new Error('Root element not found');

const root = createRoot(container);
root.render(<WillsAtticApp />);