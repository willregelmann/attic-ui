import React from 'react';
import { Search, Grid3X3, List, ArrowLeft, Eye, Heart } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { cn, formatPercentage } from '../../lib/utils';
import type { Collection, ViewMode } from '../../types';

interface CollectionDetailScreenProps {
  selectedCollection: Collection | null;
  setCurrentScreen: (screen: string) => void;
  getAllCollectibles: (collectionId: number) => any[];
  getUserItems: (userId: string, collectionId: number) => any[];
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

  if (!selectedCollection) {
    return <div>No collection selected</div>;
  }

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

export default CollectionDetailScreen;