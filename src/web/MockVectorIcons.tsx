import React from 'react';

// Mock vector icons for web
export const Icon = ({ name, size = 24, color = '#000', style, ...props }: any) => {
  // Simple emoji/unicode mapping for common icons
  const iconMap: { [key: string]: string } = {
    // Navigation icons
    'home': '🏠',
    'list': '📚',
    'heart': '💖',
    'star': '⭐',
    'user': '👤',
    'search': '🔍',
    'settings': '⚙️',
    'plus': '➕',
    'minus': '➖',
    'close': '✖️',
    'check': '✓',
    'arrow-left': '←',
    'arrow-right': '→',
    'arrow-up': '↑',
    'arrow-down': '↓',
    
    // Common app icons
    'camera': '📸',
    'image': '🖼️',
    'edit': '✏️',
    'delete': '🗑️',
    'share': '🔗',
    'download': '⬇️',
    'upload': '⬆️',
    'refresh': '🔄',
    'filter': '🔍',
    'sort': '🔀',
    
    // Status icons
    'check-circle': '✅',
    'x-circle': '❌',
    'alert-circle': '⚠️',
    'info': 'ℹ️',
    'bell': '🔔',
    'mail': '✉️',
    
    // Social/trading icons
    'users': '👥',
    'message-circle': '💬',
    'dollar-sign': '💰',
    'trending-up': '📈',
    'trending-down': '📉',
    'gift': '🎁',
    'shopping-cart': '🛒',
  };

  const iconChar = iconMap[name] || '❓';

  return (
    <span
      style={{
        fontSize: size,
        color,
        lineHeight: 1,
        display: 'inline-block',
        ...style,
      }}
      {...props}
    >
      {iconChar}
    </span>
  );
};

// Export different icon families
export const Feather = Icon;
export const Ionicons = Icon;
export const MaterialIcons = Icon;
export const MaterialCommunityIcons = Icon;
export const FontAwesome = Icon;
export const FontAwesome5 = Icon;
export const AntDesign = Icon;
export const Entypo = Icon;

export default Icon;