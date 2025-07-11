// Utility functions

export const formatPercentage = (value: number): string => {
  return `${Math.round(value)}%`;
};

export const formatDate = (date: string): string => {
  return new Date(date).toLocaleDateString();
};

export const getRecentItemsCount = (items: any[], days: number = 7): number => {
  const cutoffDate = Date.now() - days * 24 * 60 * 60 * 1000;
  return items.filter(item => {
    const lastUpdated = new Date(item.lastUpdated).getTime();
    return lastUpdated > cutoffDate;
  }).length;
};

export const getUniqueCollectionIds = (items: any[]): number => {
  return new Set(items.map(item => item.collectionId)).size;
};