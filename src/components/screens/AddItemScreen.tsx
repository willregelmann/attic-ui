import React from 'react';
import { ArrowLeft, Plus, Upload, Star, Check, Tag, Camera, FileImage, X } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import type { Collection, Collectible } from '../../types';

interface AddItemScreenProps {
  allCollections: Collection[];
  setCurrentScreen: (screen: string) => void;
}

const AddItemScreen: React.FC<AddItemScreenProps> = ({
  allCollections,
  setCurrentScreen,
}) => {
  const [formData, setFormData] = React.useState({
    name: '',
    collectibleId: null as number | null, // The selected collectible
    notes: '',
    isFavorite: false,
  });

  // Typeahead state
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedCollectible, setSelectedCollectible] = React.useState<Collectible | null>(null);
  const [showSuggestions, setShowSuggestions] = React.useState(false);
  const [isCustomItem, setIsCustomItem] = React.useState(false);

  const [imageFiles, setImageFiles] = React.useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = React.useState<string[]>([]);
  
  const typeaheadRef = React.useRef<HTMLDivElement>(null);

  // Close suggestions when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (typeaheadRef.current && !typeaheadRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);


  // Get all collectibles from all collections for typeahead search
  const allCollectibles = React.useMemo(() => {
    // TODO: Load collectibles from API when needed
    const collectibles: Collectible[] = [];
    return collectibles;
  }, [allCollections]);

  // Filter collectibles based on search query
  const filteredCollectibles = React.useMemo(() => {
    if (!searchQuery.trim()) return [];
    return allCollectibles.filter(collectible =>
      collectible.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      collectible.number.toLowerCase().includes(searchQuery.toLowerCase())
    ).slice(0, 10); // Limit to 10 suggestions
  }, [allCollectibles, searchQuery]);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      // Convert FileList to Array and limit to 5 images total
      const newFiles = Array.from(files).slice(0, 5 - imageFiles.length);
      
      // Read all new files and create previews
      const newPreviews: string[] = [];
      let loadedCount = 0;
      
      newFiles.forEach((file, index) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          newPreviews[index] = e.target?.result as string;
          loadedCount++;
          
          // When all files are loaded, update state
          if (loadedCount === newFiles.length) {
            setImageFiles(prev => [...prev, ...newFiles]);
            setImagePreviews(prev => [...prev, ...newPreviews]);
          }
        };
        reader.readAsDataURL(file);
      });
    }
    
    // Reset the input so the same file can be selected again
    event.target.value = '';
  };

  const removeImage = (index: number) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleCollectibleSelect = (collectible: Collectible) => {
    setSelectedCollectible(collectible);
    setSearchQuery(collectible.name);
    setShowSuggestions(false);
    setIsCustomItem(false);
    setFormData(prev => ({
      ...prev,
      name: collectible.name,
      collectibleId: collectible.id
    }));
  };

  const handleSearchQueryChange = (value: string) => {
    setSearchQuery(value);
    setShowSuggestions(true);
    
    // If they're typing something not in suggestions, it's a custom item
    if (value && !allCollectibles.some(c => c.name.toLowerCase() === value.toLowerCase())) {
      setIsCustomItem(true);
      setSelectedCollectible(null);
      setFormData(prev => ({
        ...prev,
        name: value,
        collectibleId: null
      }));
    }
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    
    // Process form data
    const processedData = {
      ...formData,
      collectionId: selectedCollectible?.collectionId || null,
      collectibleId: formData.collectibleId,
      acquiredDate: new Date().toISOString().split('T')[0] // Auto-set to today
    };
    
    // Here you would typically send the data to your API
    console.log('Form submitted:', { ...processedData, imageFiles, selectedCollectible });
    
    // For now, just navigate back to My Collection
    alert('Item added successfully! (This is a demo - data is not persisted)');
    setCurrentScreen('my-collection');
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCurrentScreen('my-collection')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to My Collection
          </Button>
        </div>
        
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            Add New Item
          </h1>
          <p className="text-lg text-muted-foreground mt-2">
            Add a collectible to your personal collection
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Basic Info */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Tag className="h-5 w-5" />
                  Basic Information
                </CardTitle>
                <CardDescription>
                  Essential details about your collectible item
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative" ref={typeaheadRef}>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                    Item Name *
                  </label>
                  <div className="relative">
                    <Input
                      value={searchQuery}
                      onChange={(e) => handleSearchQueryChange(e.target.value)}
                      onFocus={() => setShowSuggestions(true)}
                      placeholder="Search for a collectible or enter custom name..."
                      required
                      className="pr-8"
                    />
                    {selectedCollectible && (
                      <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                        <Check className="h-4 w-4 text-green-500" />
                      </div>
                    )}
                    {isCustomItem && searchQuery && (
                      <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                        <Badge variant="secondary" className="text-xs">Custom</Badge>
                      </div>
                    )}
                  </div>
                  
                  {/* Typeahead suggestions */}
                  {showSuggestions && filteredCollectibles.length > 0 && (
                    <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg max-h-60 overflow-auto">
                      {filteredCollectibles.map((collectible) => {
                        const collection = allCollections.find(c => c.id === collectible.collectionId);
                        return (
                          <button
                            key={collectible.id}
                            type="button"
                            onClick={() => handleCollectibleSelect(collectible)}
                            className="w-full px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-between group"
                          >
                            <div>
                              <div className="font-medium text-sm">{collectible.name}</div>
                              <div className="text-xs text-gray-500">
                                {collectible.number} • {collection?.name}
                              </div>
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {collection?.category}
                            </Badge>
                          </button>
                        );
                      })}
                    </div>
                  )}
                  
                  {searchQuery && filteredCollectibles.length === 0 && showSuggestions && (
                    <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg p-3">
                      <div className="text-sm text-gray-500 text-center">
                        No collectibles found. This will be added as a custom item.
                      </div>
                    </div>
                  )}
                </div>

                {/* Show collection info if collectible is selected */}
                {selectedCollectible && (
                  <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                    <div className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-green-600" />
                      <span className="font-medium text-green-800 dark:text-green-200">
                        Official Collectible
                      </span>
                    </div>
                    <div className="text-xs text-green-700 dark:text-green-300 mt-1">
                      From "{allCollections.find(c => c.id === selectedCollectible.collectionId)?.name}" • 
                      {selectedCollectible.number}
                    </div>
                  </div>
                )}

                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                    Notes
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    placeholder="Personal notes, memories, or additional details..."
                    className="w-full px-3 py-2 text-sm rounded-md border border-input bg-background ring-offset-background placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 min-h-[80px]"
                    rows={3}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="favorite"
                    checked={formData.isFavorite}
                    onChange={(e) => handleInputChange('isFavorite', e.target.checked)}
                    className="rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <label htmlFor="favorite" className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1">
                    <Star className="h-4 w-4" />
                    Mark as favorite
                  </label>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Image & Details */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Item Photo
                </CardTitle>
                <CardDescription>
                  Add photos of your collectible (up to 5 images)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Image Previews Grid */}
                  {imagePreviews.length > 0 && (
                    <div className="grid grid-cols-2 gap-3">
                      {imagePreviews.map((preview, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={preview}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-32 object-cover rounded-md border border-gray-300 dark:border-gray-600"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                          >
                            <X className="h-3 w-3" />
                          </button>
                          <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                            {index + 1}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add More Photos Buttons (show if less than 5 images) */}
                  {imageFiles.length < 5 && (
                    <div className="space-y-3">
                      {/* Mobile Camera Capture */}
                      <button
                        type="button"
                        onClick={() => document.getElementById('camera-input')?.click()}
                        className="w-full border-2 border-dashed border-blue-300 dark:border-blue-600 rounded-lg p-4 hover:border-blue-400 dark:hover:border-blue-500 transition-colors bg-blue-50 dark:bg-blue-900/20"
                      >
                        <div className="text-center">
                          <Camera className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                          <p className="text-sm text-blue-700 dark:text-blue-300 font-medium mb-1">
                            {imageFiles.length === 0 ? 'Take Photo with Camera' : 'Add Another Photo'}
                          </p>
                          <p className="text-xs text-blue-600 dark:text-blue-400">
                            {imageFiles.length === 0 ? 'Perfect for mobile devices' : `${5 - imageFiles.length} more allowed`}
                          </p>
                        </div>
                      </button>

                      {/* File Upload */}
                      <button
                        type="button"
                        onClick={() => document.getElementById('file-input')?.click()}
                        className="w-full border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 hover:border-gray-400 dark:hover:border-gray-500 transition-colors"
                      >
                        <div className="text-center">
                          <FileImage className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                            {imageFiles.length === 0 ? 'Upload from Gallery' : 'Add from Gallery'}
                          </p>
                          <p className="text-xs text-gray-500">
                            PNG, JPG up to 10MB each
                          </p>
                        </div>
                      </button>
                    </div>
                  )}

                  {/* Full capacity message */}
                  {imageFiles.length >= 5 && (
                    <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                      <p className="text-sm text-green-700 dark:text-green-300 font-medium">
                        Maximum of 5 photos reached
                      </p>
                      <p className="text-xs text-green-600 dark:text-green-400">
                        Remove a photo to add a different one
                      </p>
                    </div>
                  )}

                  {/* Hidden inputs */}
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleImageChange}
                    className="hidden"
                    id="camera-input"
                  />
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageChange}
                    className="hidden"
                    id="file-input"
                  />
                </div>
              </CardContent>
            </Card>

          </div>
        </div>

        {/* Form Actions */}
        <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={() => setCurrentScreen('my-collection')}
            className="flex-1 sm:flex-initial"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="flex-1 sm:flex-initial flex items-center gap-2"
            disabled={!formData.name.trim()}
          >
            <Plus className="h-4 w-4" />
            Add Item to Collection
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AddItemScreen;