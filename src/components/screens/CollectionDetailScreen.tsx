import React from 'react';
import { Search, Grid3X3, List, ArrowLeft, Eye, Heart, Package } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { cn, formatPercentage } from '../../lib/utils';
import type { Collection, ViewMode } from '../../types';
import { apiService } from '../../services/ApiService';

interface CollectionDetailScreenProps {
  selectedCollection: Collection | null;
  setCurrentScreen: (screen: string) => void;
  getAllCollectibles: (collectionId: number) => any[];
  getUserItems: (userId: string, collectionId: number) => any[];
}

interface CollectionItem {
  id: string;
  name: string;
  number: string;
  imageUrl?: string;
  owned: boolean;
  userItem: any;
  condition: string;
  lastUpdated?: string;
  notes: string;
  customImageUrl?: string;
  wishlistCount?: number;
}

const CollectionDetailScreen: React.FC<CollectionDetailScreenProps> = ({
  selectedCollection,
  setCurrentScreen,
  getAllCollectibles,
  getUserItems,
}) => {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedCondition, setSelectedCondition] = React.useState('all');
  const [selectedOwnership, setSelectedOwnership] = React.useState('all');
  const [viewMode, setViewMode] = React.useState<ViewMode>('grid');
  
  // API state
  const [collectionDetails, setCollectionDetails] = React.useState<any>(null);
  const [collectionItems, setCollectionItems] = React.useState<CollectionItem[]>([]);
  const [userItems, setUserItems] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  if (!selectedCollection) {
    return <div>No collection selected</div>;
  }

  // Fetch collection details and items from API
  React.useEffect(() => {
    if (selectedCollection) {
      fetchCollectionData();
    }
  }, [selectedCollection]);

  const fetchCollectionData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch collection details
      const collectionResponse = await apiService.getCollection(selectedCollection.id.toString());
      
      if (collectionResponse.success) {
        setCollectionDetails(collectionResponse.data);
        
        // Transform collectibles to match expected interface
        const collectibles = collectionResponse.data?.collectibles || [];
        const transformedItems: CollectionItem[] = collectibles.map((collectible: any) => ({
          id: collectible.id,
          name: collectible.name,
          number: collectible.item_number || collectible.id,
          imageUrl: collectible.image_urls?.primary,
          owned: false, // Will be updated based on user items
          userItem: null,
          condition: 'Not Owned',
          lastUpdated: undefined,
          notes: '',
          customImageUrl: undefined,
          wishlistCount: undefined,
        }));
        
        setCollectionItems(transformedItems);
      }
      
      // Fetch user's items for this collection
      try {
        const userItemsResponse = await apiService.getMyItems();
        if (userItemsResponse.success && userItemsResponse.data) {
          const userCollectionItems = userItemsResponse.data.filter(
            (item: any) => item.collectible?.collection_id === selectedCollection.id
          );
          
          setUserItems(userCollectionItems);
          
          // Update collection items with user ownership data
          setCollectionItems(prev => prev.map(item => {
            const userItem = userCollectionItems.find(
              (ui: any) => ui.collectible_id === item.id
            );
            
            if (userItem) {
              return {
                ...item,
                owned: true,
                userItem,
                condition: 'Near Mint', // Default since API doesn't have condition
                lastUpdated: new Date(userItem.updated_at).toLocaleDateString(),
                notes: userItem.personal_notes || '',
                customImageUrl: userItem.user_images?.[0],
              };
            }
            
            return item;
          }));
        }
      } catch (userError) {
        console.log('Could not fetch user items (may not be authenticated)');
      }
      
    } catch (error) {
      console.error('Failed to fetch collection data:', error);
      setError('Failed to load collection details. Please try again.');
      
      // Fallback to mock data
      const mockItems = getCollectionItemsMock(selectedCollection.id);
      setCollectionItems(mockItems);
    } finally {
      setLoading(false);
    }
  };

  // Fallback function for mock data
  const getCollectionItemsMock = (collectionId: number) => {
    const collectibles = getAllCollectibles(collectionId);
    const userItemsData = getUserItems('user123', collectionId);
    
    return collectibles.map(collectible => {
      const userItem = userItemsData.find(item => item.collectibleId === collectible.id);
      
      return {
        id: collectible.id,
        name: collectible.name,
        number: collectible.number,
        imageUrl: collectible.imageUrl,
        owned: !!userItem,
        userItem: userItem || null,
        condition: userItem?.condition || 'Not Owned',
        lastUpdated: userItem?.lastUpdated || undefined,
        notes: userItem?.notes || '',
        customImageUrl: userItem?.customImageUrl || undefined,
        wishlistCount: collectible.wishlistCount,
      };
    });
  };

  const allItems = collectionItems;
  const conditions = ['all', 'Mint', 'Near Mint', 'Lightly Played', 'Not Owned'];
  const ownershipOptions = ['all', 'owned', 'not-owned'];

  // Filter items based on search and filters
  const filteredItems = allItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.number.toLowerCase().includes(searchTerm.toLowerCase());
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
          <div className="rounded-xl w-16 h-16 flex items-center justify-center overflow-hidden bg-gradient-to-br from-pink-400 to-red-500">
            {selectedCollection.image_url ? (
              <img 
                src={selectedCollection.image_url} 
                alt={selectedCollection.name} 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-4xl">📦</div>
            )}
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
      {loading ? (
        <Card className="py-16">
          <CardContent className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading collection items...</p>
          </CardContent>
        </Card>
      ) : error ? (
        <Card className="py-16">
          <CardContent className="text-center">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Error Loading Collection</h3>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={fetchCollectionData} variant="outline">
              Try Again
            </Button>
          </CardContent>
        </Card>
      ) : (
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
                      {item.number}
                    </CardDescription>
                  </div>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-3">
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
      )}

      {!loading && !error && filteredItems.length === 0 && (
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

export default CollectionDetailScreen;