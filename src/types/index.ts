// Type definitions for Will's Attic

export interface User {
  id: number;
  email: string;
}

export interface GoogleProfile {
  name: string;
  picture: string;
  email: string;
}

export interface Collection {
  id: number;
  name: string;
  category: string;
  completion: number;
  totalItems: number;
  ownedItems: number;
  recentActivity: string;
  year: number;
}

export interface Collectible {
  id: number;
  name: string;
  number: string;
  imageUrl?: string;
  collectionId: number;
  wishlistCount: number;
}

export interface UserItem {
  id: number;
  collectibleId: number;
  userId: string;
  condition: string;
  acquiredDate: string;
  notes: string;
  customImageUrl: string | null;
  lastUpdated: string;
}

export interface EnhancedUserItem extends UserItem {
  collectibleName: string;
  collectibleNumber: string;
  collectibleImageUrl?: string;
  collectionName: string;
  collectionId: number;
}

export type ScreenType = 'collections' | 'my-collection' | 'collection-detail' | 'admin' | 'add-item';

export type ViewMode = 'grid' | 'list';

export type Condition = 'Mint' | 'Near Mint' | 'Lightly Played' | 'Moderately Played' | 'Heavily Played' | 'Damaged';