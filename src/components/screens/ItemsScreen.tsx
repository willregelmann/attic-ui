import React from 'react';
import { Search } from 'lucide-react';
import { Input } from '../ui/input';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import type { Collection, EnhancedUserItem } from '../../types';
import { getRecentItemsCount, getUniqueCollectionIds } from '../../utils';

interface ItemsScreenProps {
  allCollections: Collection[];
  starredCollections: number[];
}

const ItemsScreen: React.FC<ItemsScreenProps> = ({ allCollections, starredCollections }) => {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedCollection, setSelectedCollection] = React.useState<number | 'all'>('all');
  const [selectedCondition, setSelectedCondition] = React.useState<string>('all');

  // Get all user's owned items across all collections
  const getAllUserItems = (): EnhancedUserItem[] => {
    const allItems: EnhancedUserItem[] = [];
    const userId = 'user123'; // Current user ID
    
    // Get user items from all starred collections
    starredCollections.forEach(collectionId => {
      const userItems = getUserItems(userId, collectionId);
      const collectibles = getAllCollectibles(collectionId);
      const collection = allCollections.find(c => c.id === collectionId);
      
      userItems.forEach((item) => {
        const collectible = collectibles.find((c) => c.id === item.collectibleId);
        if (collectible && collection) {
          allItems.push({
            ...item,
            collectibleName: collectible.name,
            collectibleNumber: collectible.number,
            collectibleImageUrl: collectible.imageUrl,
            collectionName: collection.name,
            collectionId: collection.id,
          });
        }
      });
    });
    
    return allItems;
  };

  const allUserItems = getAllUserItems();

  // Filter items based on search and filters
  const filteredItems = allUserItems.filter(item => {
    const matchesSearch = 
      item.collectibleName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.collectionName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.collectibleNumber.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCollection = selectedCollection === 'all' || item.collectionId === selectedCollection;
    const matchesCondition = selectedCondition === 'all' || item.condition === selectedCondition;
    
    return matchesSearch && matchesCollection && matchesCondition;
  });

  const conditions = ['all', 'Mint', 'Near Mint', 'Lightly Played', 'Moderately Played', 'Heavily Played', 'Damaged'];

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
          My Items
        </h1>
        <p className="text-lg text-muted-foreground">
          Browse all your owned collectibles across your starred collections
        </p>
      </div>

      {/* Filters */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Collection Filter */}
        <Select value={selectedCollection.toString()} onValueChange={(value) => setSelectedCollection(value === 'all' ? 'all' : parseInt(value))}>
          <SelectTrigger>
            <SelectValue placeholder="All Collections" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Collections</SelectItem>
            {allCollections
              .filter(collection => starredCollections.includes(collection.id))
              .map(collection => (
                <SelectItem key={collection.id} value={collection.id.toString()}>
                  {collection.name}
                </SelectItem>
              ))
            }
          </SelectContent>
        </Select>

        {/* Condition Filter */}
        <Select value={selectedCondition} onValueChange={setSelectedCondition}>
          <SelectTrigger>
            <SelectValue placeholder="All Conditions" />
          </SelectTrigger>
          <SelectContent>
            {conditions.map(condition => (
              <SelectItem key={condition} value={condition}>
                {condition === 'all' ? 'All Conditions' : condition}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Items</p>
                <div className="text-2xl font-bold">{filteredItems.length}</div>
              </div>
              <div className="text-2xl">🎯</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Collections</p>
                <div className="text-2xl font-bold">{getUniqueCollectionIds(filteredItems)}</div>
              </div>
              <div className="text-2xl">📚</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Recent Items</p>
                <div className="text-2xl font-bold">{getRecentItemsCount(filteredItems)}</div>
              </div>
              <div className="text-2xl">⭐</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Items Grid */}
      {filteredItems.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="text-4xl mb-4">🎯</div>
          <h3 className="text-lg font-semibold mb-2">No Items Found</h3>
          <p className="text-muted-foreground">
            {allUserItems.length === 0 
              ? "You haven't added any items yet. Star some collections and start adding items!"
              : "No items match your current filters. Try adjusting your search criteria."
            }
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredItems.map(item => (
            <Card key={item.id} className="group hover:shadow-lg transition-all duration-200">
              <CardContent className="p-4">
                <div className="aspect-square bg-muted rounded-lg mb-3 overflow-hidden">
                  {item.collectibleImageUrl ? (
                    <img 
                      src={item.collectibleImageUrl} 
                      alt={item.collectibleName}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl">
                      🎯
                    </div>
                  )}
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-sm">{item.collectibleName}</h3>
                      <p className="text-xs text-muted-foreground">{item.collectibleNumber}</p>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {item.condition}
                    </Badge>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">
                      <strong>Collection:</strong> {item.collectionName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      <strong>Acquired:</strong> {new Date(item.acquiredDate).toLocaleDateString()}
                    </p>
                    {item.notes && (
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        <strong>Notes:</strong> {item.notes}
                      </p>
                    )}
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

export default ItemsScreen;