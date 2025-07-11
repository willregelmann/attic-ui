import React from 'react';
import { Search, Grid3X3, List, Clock, Package, Star } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Progress } from '../ui/progress';
import { cn, formatPercentage } from '../../lib/utils';
import type { Collection, ViewMode } from '../../types';

interface CollectionsScreenProps {
  allCollections: Collection[];
  starredCollections: number[];
  toggleStar: (collectionId: number) => void;
  setSelectedCollection: (collection: Collection) => void;
  setCurrentScreen: (screen: string, collection?: Collection) => void;
}

const CollectionsScreen: React.FC<CollectionsScreenProps> = ({
  allCollections,
  starredCollections,
  toggleStar,
  setSelectedCollection,
  setCurrentScreen,
}) => {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedCategory, setSelectedCategory] = React.useState('all');
  const [viewMode, setViewMode] = React.useState<ViewMode>('grid');

  const categories = ['all', 'Trading Cards', 'Action Figures', 'Collectible Figures'];

  // Filter collections based on search and category
  const filteredCollections = allCollections.filter(collection => {
    const matchesSearch = collection.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         collection.category.toLowerCase().includes(searchTerm.toLowerCase());
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
                  <Badge variant="secondary">
                    {collection.category}
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

export default CollectionsScreen;