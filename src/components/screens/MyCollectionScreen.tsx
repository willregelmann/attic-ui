import React from 'react';
import { Search, Plus, Grid3X3, List, Filter, SortAsc, SortDesc, Heart, Star, Calendar, Package } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import GoogleSignInButton, { GoogleSignInButtonRef } from '../GoogleSignInButton';
import { cn } from '../../lib/utils';
import type { Collection, ViewMode, User } from '../../types';
import { apiService } from '../../services/ApiService';

interface PersonalItem {
  id: number;
  name: string;
  description?: string;
  category: string;
  condition: string;
  value?: number;
  acquiredDate: string;
  lastUpdated: string;
  imageUrl?: string;
  notes?: string;
  collectionId?: number; // Optional - for items that belong to official collections
  collectionName?: string;
  isFavorite: boolean;
  tags: string[];
  location?: string; // Where the item is stored
}

interface MyCollectionScreenProps {
  allCollections: Collection[];
  starredCollections: number[];
  isAuthenticated: boolean;
  user: User | null;
  googleProfile?: { name: string; picture: string; email: string } | null;
  googleReady: boolean;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  setCurrentScreen: (screen: string) => void;
  setAuthToken: (token: string) => void;
  setUser: (user: User) => void;
  setIsAuthenticated: (authenticated: boolean) => void;
  setGoogleProfile: (profile: any) => void;
}

const MyCollectionScreen: React.FC<MyCollectionScreenProps> = ({
  allCollections,
  starredCollections,
  isAuthenticated,
  user,
  googleProfile,
  googleReady,
  isLoading,
  setIsLoading,
  setCurrentScreen,
  setAuthToken,
  setUser,
  setIsAuthenticated,
  setGoogleProfile,
}) => {
  const googleButtonRef = React.useRef<GoogleSignInButtonRef>(null);

  // All hooks must be called at the top level
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedCondition, setSelectedCondition] = React.useState<string>('all');
  const [selectedCollection, setSelectedCollection] = React.useState<number | 'all' | 'none'>('all');
  const [viewMode, setViewMode] = React.useState<ViewMode>('grid');
  const [sortBy, setSortBy] = React.useState<'name' | 'date' | 'condition'>('date');
  const [sortOrder, setSortOrder] = React.useState<'asc' | 'desc'>('desc');
  const [showFavoritesOnly, setShowFavoritesOnly] = React.useState(false);

  // Personal items from API
  const [personalItems, setPersonalItems] = React.useState<PersonalItem[]>([]);
  const [itemsLoading, setItemsLoading] = React.useState(false);
  const [itemsError, setItemsError] = React.useState<string | null>(null);

  // Fetch personal items when authenticated
  React.useEffect(() => {
    if (isAuthenticated && user) {
      fetchPersonalItems();
    }
  }, [isAuthenticated, user]);

  const fetchPersonalItems = async () => {
    setItemsLoading(true);
    setItemsError(null);
    
    try {
      const response = await apiService.getMyItems();
      
      if (response.success && response.data) {
        // Transform API response to match PersonalItem interface
        const items = response.data.map((item: any) => ({
          id: item.id,
          name: item.name || item.collectible?.name || 'Unnamed Item',
          description: item.personal_notes || item.collectible?.description,
          category: item.collectible?.category || 'Uncategorized',
          condition: 'Near Mint', // Default since API doesn't have condition field
          acquiredDate: item.created_at || new Date().toISOString(),
          lastUpdated: item.updated_at || item.created_at || new Date().toISOString(),
          imageUrl: item.user_images?.[0] || item.collectible?.image_urls?.primary,
          notes: item.personal_notes,
          collectionId: item.collectible?.collection_id,
          collectionName: item.collectible?.collection?.name,
          isFavorite: item.is_favorite || false,
          tags: [], // API doesn't have tags yet
          location: item.location,
        }));
        
        setPersonalItems(items);
      }
    } catch (error) {
      console.error('Failed to fetch personal items:', error);
      setItemsError('Failed to load your collection. Please try again.');
    } finally {
      setItemsLoading(false);
    }
  };

  const conditions = ['all', 'Mint', 'Near Mint', 'Lightly Played', 'Moderately Played', 'Heavily Played', 'Damaged'];
  
  // Only show starred collections in the filter
  const starredCollectionsData = allCollections.filter(collection => 
    starredCollections.includes(collection.id)
  );

  // Filter and sort items
  const filteredAndSortedItems = React.useMemo(() => {
    let filtered = personalItems.filter(item => {
      const matchesSearch = 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesCondition = selectedCondition === 'all' || item.condition === selectedCondition;
      const matchesCollection = selectedCollection === 'all' || 
                               (selectedCollection === 'none' && !item.collectionId) ||
                               item.collectionId === selectedCollection;
      const matchesFavorites = !showFavoritesOnly || item.isFavorite;
      
      return matchesSearch && matchesCondition && matchesCollection && matchesFavorites;
    });

    // Sort items
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'date':
          comparison = new Date(a.acquiredDate).getTime() - new Date(b.acquiredDate).getTime();
          break;
        case 'condition':
          const conditionOrder = { 'Mint': 6, 'Near Mint': 5, 'Lightly Played': 4, 'Moderately Played': 3, 'Heavily Played': 2, 'Damaged': 1 };
          comparison = (conditionOrder[a.condition as keyof typeof conditionOrder] || 0) - (conditionOrder[b.condition as keyof typeof conditionOrder] || 0);
          break;
      }
      
      return sortOrder === 'desc' ? -comparison : comparison;
    });

    return filtered;
  }, [personalItems, searchTerm, selectedCondition, selectedCollection, showFavoritesOnly, sortBy, sortOrder]);

  // Statistics
  const stats = React.useMemo(() => {
    const totalItems = personalItems.length;
    const favoriteItems = personalItems.filter(item => item.isFavorite).length;
    const uniqueCategories = new Set(personalItems.map(item => item.category)).size;
    const recentItems = personalItems.filter(item => {
      const itemDate = new Date(item.acquiredDate);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return itemDate >= thirtyDaysAgo;
    }).length;

    return { totalItems, favoriteItems, uniqueCategories, recentItems };
  }, [personalItems]);

  const toggleFavorite = (itemId: number) => {
    setPersonalItems(prev => prev.map(item => 
      item.id === itemId ? { ...item, isFavorite: !item.isFavorite } : item
    ));
  };

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'Mint': return 'bg-green-100 text-green-800';
      case 'Near Mint': return 'bg-blue-100 text-blue-800';
      case 'Lightly Played': return 'bg-yellow-100 text-yellow-800';
      case 'Moderately Played': return 'bg-orange-100 text-orange-800';
      case 'Heavily Played': return 'bg-red-100 text-red-800';
      case 'Damaged': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

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

  // Authenticated user - show My Collection interface

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              My Collection
            </h1>
            <p className="text-lg text-muted-foreground mt-2">
              Manage your personal collectibles and track your collection's growth
            </p>
          </div>
          <Button onClick={() => setCurrentScreen('add-item')} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Item
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-4 pb-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{stats.totalItems}</div>
                <p className="text-xs text-muted-foreground">Total Items</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{stats.favoriteItems}</div>
                <p className="text-xs text-muted-foreground">Favorites</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{stats.uniqueCategories}</div>
                <p className="text-xs text-muted-foreground">Categories</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{stats.recentItems}</div>
                <p className="text-xs text-muted-foreground">Recent (30d)</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Filters and Controls */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            {/* Search */}
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search items, descriptions, or tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            {/* Controls */}
            <div className="flex gap-2">
              <Select value={selectedCollection.toString()} onValueChange={(value) => 
                setSelectedCollection(value === 'all' ? 'all' : value === 'none' ? 'none' : parseInt(value))
              }>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Collection" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Collections</SelectItem>
                  <SelectItem value="none">Standalone Items</SelectItem>
                  {starredCollectionsData.map(collection => (
                    <SelectItem key={collection.id} value={collection.id.toString()}>
                      {collection.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="flex items-center gap-1">
                <span className="text-sm text-muted-foreground">Sort:</span>
                <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="date">Date Added</SelectItem>
                    <SelectItem value="name">Name</SelectItem>
                    <SelectItem value="condition">Condition</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                variant={showFavoritesOnly ? "default" : "outline"}
                size="sm"
                onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                className="flex items-center gap-1"
              >
                <Heart className={cn("h-4 w-4", showFavoritesOnly && "fill-current")} />
                Favorites
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              >
                {sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
              </Button>

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
            Showing {filteredAndSortedItems.length} of {personalItems.length} items
            {searchTerm && ` matching "${searchTerm}"`}
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Items Display */}
      {itemsLoading ? (
        <Card className="py-16">
          <CardContent className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading your collection...</p>
          </CardContent>
        </Card>
      ) : itemsError ? (
        <Card className="py-16">
          <CardContent className="text-center">
            <p className="text-destructive mb-4">{itemsError}</p>
            <Button onClick={fetchPersonalItems} variant="outline">
              Try Again
            </Button>
          </CardContent>
        </Card>
      ) : filteredAndSortedItems.length === 0 ? (
        <Card className="py-16">
          <CardContent className="text-center">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No items found</h3>
            <p className="text-muted-foreground mb-4">
              {personalItems.length === 0 
                ? "Start building your collection by adding your first item!"
                : "Try adjusting your search terms or filters."
              }
            </p>
            <Button onClick={() => setCurrentScreen('add-item')}>
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Item
            </Button>
          </CardContent>
        </Card>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredAndSortedItems.map(item => (
            <Card key={item.id} className="group hover:shadow-lg transition-all duration-200">
              <CardContent className="p-4">
                <div className="relative aspect-square bg-muted rounded-lg mb-3 overflow-hidden">
                  {item.imageUrl ? (
                    <img 
                      src={item.imageUrl} 
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl bg-gradient-to-br from-gray-100 to-gray-200">
                      📦
                    </div>
                  )}
                  
                  {/* Action buttons overlay */}
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      size="sm"
                      variant="secondary"
                      className="h-8 w-8 p-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(item.id);
                      }}
                    >
                      <Heart className={cn("h-4 w-4", item.isFavorite && "fill-current text-red-500")} />
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-start justify-between">
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-sm truncate">{item.name}</h3>
                      <p className="text-xs text-muted-foreground">{item.category}</p>
                    </div>
                  </div>
                  

                  {item.collectionName && (
                    <p className="text-xs text-muted-foreground">
                      <strong>Collection:</strong> {item.collectionName}
                    </p>
                  )}

                  <p className="text-xs text-muted-foreground">
                    <strong>Added:</strong> {new Date(item.acquiredDate).toLocaleDateString()}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        /* List View */
        <div className="space-y-3">
          {filteredAndSortedItems.map(item => (
            <Card key={item.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                    {item.imageUrl ? (
                      <img 
                        src={item.imageUrl} 
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xl bg-gradient-to-br from-gray-100 to-gray-200">
                        📦
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold truncate">{item.name}</h3>
                        <p className="text-sm text-muted-foreground">{item.category}</p>
                        {item.collectionName && (
                          <p className="text-xs text-muted-foreground">
                            Collection: {item.collectionName}
                          </p>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2 ml-4">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0"
                          onClick={() => toggleFavorite(item.id)}
                        >
                          <Heart className={cn("h-4 w-4", item.isFavorite && "fill-current text-red-500")} />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyCollectionScreen;