import React from 'react';
import { Search, ArrowLeft, Package, Eye } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { cn } from '../../lib/utils';
import type { Collection } from '../../types';
import { apolloClient, CREATE_COLLECTION, UPDATE_COLLECTION } from '../../services/graphql';

interface AdminScreenProps {
  allCollections: Collection[];
  setAllCollections: (collections: Collection[]) => void;
  editingItem: any;
  setEditingItem: (item: any) => void;
  getCollectionItems: (collectionId: number) => any[];
}

interface ItemFormProps {
  item?: any;
  onSave: (item: any) => void;
  onCancel: () => void;
}

const ItemForm: React.FC<ItemFormProps> = ({ item, onSave, onCancel }) => {
  const [formData, setFormData] = React.useState({
    name: item?.name || '',
    number: item?.number || '',
    imageUrl: item?.imageUrl || '',
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
      const formData = new FormData();
      formData.append('image', selectedFile);
      
      const authToken = localStorage.getItem('auth_token');
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'}/upload/item-image`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
        body: formData,
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Convert relative URL to absolute URL
        const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
        return data.url.startsWith('http') ? data.url : `${baseUrl}${data.url}`;
      } else {
        setUploadError(data.error || 'Failed to upload image');
        return null;
      }
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
                  Upload an image (max 5MB). Images will be stored securely on the server.
                </p>
              </div>
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

interface CollectionFormProps {
  collection?: Collection;
  onSave: (collection: any) => void;
  onCancel: () => void;
}

const CollectionForm: React.FC<CollectionFormProps> = ({ collection, onSave, onCancel }) => {
  const [formData, setFormData] = React.useState({
    name: collection?.name || '',
    category: collection?.category || 'Trading Cards',
    year: collection?.year || new Date().getFullYear(),
    imageUrl: collection?.image_url || '',
  });
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  
  // Image upload state
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = React.useState<string>(collection?.image_url || '');
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
      const formData = new FormData();
      formData.append('image', selectedFile);
      
      const authToken = localStorage.getItem('auth_token');
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'}/upload/collection-image`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
        body: formData,
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Convert relative URL to absolute URL
        const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
        return data.url.startsWith('http') ? data.url : `${baseUrl}${data.url}`;
      } else {
        setUploadError(data.error || 'Failed to upload image');
        return null;
      }
    } catch (error) {
      console.error('Upload error:', error);
      setUploadError('Failed to upload image. Please try again.');
      return null;
    } finally {
      setUploading(false);
    }
  };

  const clearImage = () => {
    setSelectedFile(null);
    setPreviewUrl('');
    setFormData(prev => ({ ...prev, imageUrl: '' }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      let imageUrl = formData.imageUrl;
      
      // Upload new image if selected
      if (selectedFile) {
        const uploadedUrl = await uploadImage();
        if (uploadedUrl) {
          imageUrl = uploadedUrl;
        } else {
          // Don't submit if upload failed
          setIsSubmitting(false);
          return;
        }
      }

      // Create or update collection through GraphQL API
      const mutation = collection ? UPDATE_COLLECTION : CREATE_COLLECTION;
      const variables = collection 
        ? {
            id: collection.id,
            input: {
              name: formData.name,
              category: formData.category,
              metadata: JSON.stringify({ year: formData.year }),
              image_url: imageUrl,
            }
          }
        : {
            input: {
              name: formData.name,
              category: formData.category,
              metadata: JSON.stringify({ year: formData.year }),
              image_url: imageUrl,
            }
          };

      const { data } = await apolloClient.mutate({
        mutation,
        variables
      });

      // Return the created/updated collection
      const result = collection ? data.updateCollection : data.createCollection;
      onSave(result);
    } catch (err) {
      console.error(`Failed to ${collection ? 'update' : 'create'} collection:`, err);
      setError(err instanceof Error ? err.message : `Failed to ${collection ? 'update' : 'create'} collection`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>{collection ? 'Edit Collection' : 'Create New Collection'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Collection Name</label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="e.g., Pokemon Base Set"
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Category</label>
            <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Trading Cards">Trading Cards</SelectItem>
                <SelectItem value="Action Figures">Action Figures</SelectItem>
                <SelectItem value="Collectible Figures">Collectible Figures</SelectItem>
                <SelectItem value="Die Cast">Die Cast</SelectItem>
                <SelectItem value="Comics">Comics</SelectItem>
                <SelectItem value="Memorabilia">Memorabilia</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Year</label>
            <Input
              type="number"
              value={formData.year}
              onChange={(e) => setFormData(prev => ({ ...prev, year: parseInt(e.target.value) }))}
              placeholder="e.g., 1999"
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Collection Image</label>
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
                Upload a collection cover image (max 5MB). Images will be stored securely on the server.
              </p>
            </div>
          </div>
          {error && (
            <div className="text-sm text-destructive bg-destructive/10 p-2 rounded">
              {error}
            </div>
          )}
          <div className="flex gap-3">
            <Button type="submit" className="flex-1" disabled={isSubmitting || uploading}>
              {uploading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                  Uploading...
                </div>
              ) : isSubmitting ? (
                'Creating...'
              ) : (
                collection ? 'Update Collection' : 'Create Collection'
              )}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel} className="flex-1" disabled={isSubmitting || uploading}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

const AdminScreen: React.FC<AdminScreenProps> = ({
  allCollections,
  setAllCollections,
  editingItem,
  setEditingItem,
  getCollectionItems,
}) => {
  const [selectedCollectionId, setSelectedCollectionId] = React.useState<number | null>(null);
  const [showItemForm, setShowItemForm] = React.useState(false);
  const [showCollectionForm, setShowCollectionForm] = React.useState(false);
  const [editingCollection, setEditingCollection] = React.useState<Collection | null>(null);
  const [items, setItems] = React.useState<any[]>([]);

  // Initialize items for selected collection
  React.useEffect(() => {
    if (selectedCollectionId) {
      const collectionItems = getCollectionItems(selectedCollectionId);
      setItems(collectionItems);
    }
  }, [selectedCollectionId, getCollectionItems]);

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
      // TODO: Add backend API call to delete the image from storage
      // For now, just remove from local state
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
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Select a Collection to Manage</h2>
            <Button 
              onClick={() => {
                setEditingCollection(null);
                setShowCollectionForm(true);
              }}
              className="flex items-center gap-2"
            >
              <Search className="h-4 w-4" />
              Create New Collection
            </Button>
          </div>
          
          {showCollectionForm && (
            <CollectionForm
              collection={editingCollection}
              onSave={(savedCollection) => {
                if (editingCollection) {
                  // Update existing collection
                  setAllCollections(allCollections.map(c => 
                    c.id === editingCollection.id ? savedCollection : c
                  ));
                } else {
                  // Add new collection
                  setAllCollections([...allCollections, savedCollection]);
                }
                setShowCollectionForm(false);
                setEditingCollection(null);
              }}
              onCancel={() => {
                setShowCollectionForm(false);
                setEditingCollection(null);
              }}
            />
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {allCollections.map(collection => (
              <Card 
                key={collection.id} 
                className="hover:shadow-lg transition-all duration-200 hover:-translate-y-1"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl w-16 h-16 flex items-center justify-center overflow-hidden bg-gradient-to-br from-pink-400 to-red-500">
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
                    <div className="flex-1">
                      <CardTitle className="text-xl">{collection.name}</CardTitle>
                      <CardDescription>{collection.category} • {collection.year}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    {collection.ownedItems}/{collection.totalItems} items
                  </p>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setEditingCollection(collection);
                        setShowCollectionForm(true);
                      }}
                      className="flex-1"
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => setSelectedCollectionId(collection.id)}
                      className="flex-1"
                    >
                      Manage Items
                    </Button>
                  </div>
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
                  📦
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
                        <CardDescription>{item.number}</CardDescription>
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

export default AdminScreen;