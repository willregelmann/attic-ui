import React from 'react';
import { Search, Clock, Package, Star } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Progress } from '../ui/progress';
import GoogleSignInButton, { GoogleSignInButtonRef } from '../GoogleSignInButton';
import type { Collection, User } from '../../types';
import { formatPercentage } from '../../utils';
import { apiService } from '../../services/ApiService';

interface HomeScreenProps {
  allCollections: Collection[];
  starredCollections: number[];
  isAuthenticated: boolean;
  user: User | null;
  googleProfile?: { name: string; picture: string; email: string } | null;
  googleReady: boolean;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  setCurrentScreen: (screen: string, collection?: Collection) => void;
  setSelectedCollection: (collection: Collection) => void;
  setAuthToken: (token: string) => void;
  setUser: (user: User) => void;
  setIsAuthenticated: (authenticated: boolean) => void;
  setGoogleProfile: (profile: any) => void;
  toggleStar: (collectionId: number) => void;
}

const HomeScreen: React.FC<HomeScreenProps> = ({
  allCollections,
  starredCollections,
  isAuthenticated,
  user,
  googleProfile,
  googleReady,
  isLoading,
  setIsLoading,
  setCurrentScreen,
  setSelectedCollection,
  setAuthToken,
  setUser,
  setIsAuthenticated,
  setGoogleProfile,
  toggleStar,
}) => {
  const googleButtonRef = React.useRef<GoogleSignInButtonRef>(null);

  const handleGoogleSuccess = async (credentialResponse: any) => {
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
        const googleProfileData = {
          name: payload.name,
          picture: payload.picture,
          email: payload.email,
        };
        setGoogleProfile(googleProfileData);
        
        // Store in localStorage
        localStorage.setItem('auth_token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        localStorage.setItem('google_profile', JSON.stringify(googleProfileData));
        
        console.log('Authentication successful');
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

  const handleGoogleError = (error: any) => {
    console.error('Google Sign-In error:', error);
    alert('Google Sign-In failed. Please try again.');
  };

  // If not authenticated, show sign-in UI
  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center">
          <div className="mb-8">
            <h1 className="text-6xl font-bold bg-gradient-to-r from-primary via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
              Will's Attic
            </h1>
            <p className="text-xl text-muted-foreground mb-2">
              Your Personal Collectibles Manager
            </p>
            <p className="text-lg text-muted-foreground">
              Organize, track, and showcase your collection with ease
            </p>
          </div>

          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle>Sign In to Get Started</CardTitle>
              <CardDescription>
                Access your collections and start managing your collectibles
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {googleReady ? (
                <div className="space-y-4">
                  <GoogleSignInButton
                    ref={googleButtonRef}
                    onSuccess={handleGoogleSuccess}
                    onError={handleGoogleError}
                    disabled={isLoading}
                  />
                  {isLoading && (
                    <p className="text-sm text-muted-foreground">
                      Signing you in...
                    </p>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="animate-pulse">
                    <div className="h-10 bg-gray-200 rounded-md"></div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Loading Google Sign-In...
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-4xl mb-4">📚</div>
              <h3 className="text-lg font-semibold mb-2">Track Collections</h3>
              <p className="text-muted-foreground">
                Organize your items by collection and see completion progress
              </p>
            </div>
            <div>
              <div className="text-4xl mb-4">💎</div>
              <h3 className="text-lg font-semibold mb-2">Manage Items</h3>
              <p className="text-muted-foreground">
                Add photos, notes, and track condition for each collectible
              </p>
            </div>
            <div>
              <div className="text-4xl mb-4">⭐</div>
              <h3 className="text-lg font-semibold mb-2">Share & Discover</h3>
              <p className="text-muted-foreground">
                Star favorite collections and explore new ones to collect
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Authenticated user dashboard
  const starred = allCollections.filter(collection => starredCollections.includes(collection.id));
  // Calculate stats only for starred collections (the ones user is actively collecting)
  const avgCompletion = starred.length > 0 ? Math.round(starred.reduce((sum, col) => sum + col.completion, 0) / starred.length) : 0;
  const totalOwnedItems = starred.reduce((sum, col) => sum + col.ownedItems, 0);
  const totalPossibleItems = starred.reduce((sum, col) => sum + col.totalItems, 0);
  
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
          {isAuthenticated && googleProfile ? `Welcome back, ${googleProfile.name.split(' ')[0]}!` : 'Welcome to Will\'s Attic!'}
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
                <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Starred Collections</p>
                <div className="text-3xl font-bold text-blue-900 dark:text-blue-100">{starred.length}</div>
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
                  setCurrentScreen('collection-detail', collection);
                }}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="rounded-xl w-16 h-16 flex items-center justify-center shrink-0 overflow-hidden bg-gradient-to-br from-pink-400 to-red-500">
                        {collection.image_url ? (
                          <img 
                            src={collection.image_url} 
                            alt={collection.name} 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Package className="h-8 w-8 text-white" />
                        )}
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

export default HomeScreen;