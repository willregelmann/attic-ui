# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Will's Attic is a comprehensive collectibles management application consisting of:
- **React web application** - Frontend built with React, Vite, and ShadCN UI
- **Laravel API backend** - RESTful API hosted on Vercel
- **Collection admin interface** - Full CRUD operations for managing collectibles

## Technology Stack

### Web Application (React)
- **Framework**: React 18 with Vite 5.x
- **UI Components**: ShadCN UI + Tailwind CSS
- **State Management**: React hooks (useState, useEffect)
- **Authentication**: Google Identity Services (GSI)
- **Build Tool**: Vite with TypeScript support
- **Deployment**: Vercel static hosting
- **Current URL**: https://attic-ilwnq9i2k-will-regelmanns-projects.vercel.app

### Backend API (Laravel)
- **Framework**: Laravel (PHP)
- **Authentication**: Google OAuth 2.0 + Laravel Sanctum
- **Database**: PostgreSQL/MySQL (hosted on Vercel)
- **Deployment**: Vercel serverless functions
- **API Base URL**: https://attic-pyhryhudn-will-regelmanns-projects.vercel.app

## Application Architecture

### Core Data Models
- **User**: Authentication, profile, preferences, trade ratings, subscriptions
- **Collection**: Official/community collections (e.g., Pokemon cards, action figures)
- **Collectible**: Base items within collections with variants and components
- **Item**: User-owned instances of collectibles with condition, ownership details

### Main Feature Areas
1. **Authentication Flow**: Google OAuth integration with JWT token handling
2. **Collection Management**: Browse, view details, and track completion progress
3. **Personal Collection Management**: "My Collection" screen for hobbyist collectors
4. **Admin Interface**: Full CRUD operations for managing collection items
5. **Dashboard**: Overview statistics and starred collections
6. **Responsive Design**: Mobile-first UI with desktop optimization

### Application Navigation Structure
```
App
├── My Collection (Default home page - personal collection management for hobbyists)
│   ├── Integrated Authentication (Google Sign-In when not authenticated)
│   ├── Personal Items Management (search, filter, sort, favorites)
│   ├── Collection Statistics (total items, favorites, categories, recent activity)
│   └── Quick Add Item Button
├── Browse Collections (Search, filter, view all collections)
├── Collection Detail (Individual collection view with items)
├── Add Item (Mobile-friendly form with camera support)
│   ├── Smart Typeahead Search (for existing collectibles)
│   ├── Multiple Image Upload (up to 5 photos)
│   ├── Camera Integration (mobile camera capture)
│   └── Streamlined Form (name, notes, favorite checkbox only)
└── Admin Interface (User dropdown menu)
    ├── Collection Selection (Choose collection to manage)
    └── Item Management (Add, edit, delete items with forms)
```

## API Integration

### Authentication Pattern
```javascript
// Current implementation uses client-side Google authentication
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

// 1. Initialize Google Identity Services
// 2. Handle Google credential response
// 3. Decode JWT payload for user info
// 4. Store authentication state in localStorage
```

### Data Management
- **Collections**: Mock data with 6 predefined collections (Pokemon, Star Wars, Marvel, etc.)
- **Items**: Generated dynamically with mock data for testing admin functionality
- **Authentication**: Client-side Google OAuth without API backend dependency
- **Future**: Integration with Laravel API for persistent data storage

## Development Commands

### Web Application Development
```bash
# React + Vite development commands
npm install                 # Install dependencies
npm run dev                # Start Vite dev server
npm run build              # Production build
npm run preview            # Preview production build
vercel --prod              # Deploy to Vercel production
```

### Environment Setup
```bash
# Required environment variables
VITE_GOOGLE_CLIENT_ID=your_google_client_id
VITE_API_BASE_URL=https://attic-pyhryhudn-will-regelmanns-projects.vercel.app
```

## Key Implementation Notes

### My Collection Features (Primary Interface)
- **Hobbyist Focus**: No value tracking or investment-focused features
- **Smart Filtering**: Search, starred collections filter, sort by date/name/condition
- **Personal Stats**: Total items, favorites, categories, recent additions (30 days)
- **Grid/List Views**: Toggle between visual grid and detailed list view
- **Integrated Authentication**: Seamless sign-in flow when not authenticated
- **Mobile Optimized**: Touch-friendly interface with responsive design

### Add Item Features (Mobile-First Design)
- **Smart Typeahead**: Search existing collectibles with auto-linking to collections
- **Multiple Photos**: Support for up to 5 images per item
- **Camera Integration**: Direct camera capture with `capture="environment"` for rear camera
- **File Upload**: Traditional gallery selection with `multiple` attribute support
- **Streamlined Form**: Minimal fields (name, notes, favorite) for quick entry
- **Custom Items**: Support for items not in existing collections

### Admin Interface Features
- **Collection Management**: Grid view of all available collections
- **Item CRUD Operations**: Add, edit, delete items with comprehensive forms
- **User Dropdown Access**: Admin and dark mode toggle in user menu
- **Form Validation**: Required field checking and state management
- **Responsive Design**: Works on mobile and desktop devices

### Performance Optimizations
- **Vite Build**: Fast development and optimized production builds
- **Component Design**: Functional components with React hooks
- **State Management**: Local state with localStorage persistence

### Authentication Flow
1. Initialize Google Identity Services on app load
2. Display Google Sign-In button when ready
3. Handle credential response and decode JWT payload
4. Extract user information (name, email, avatar)
5. Store authentication state in localStorage
6. Redirect to home dashboard on successful login

### Current Architecture
- **Authentication**: Google Identity Services with client-side JWT decoding
- **Navigation**: Screen-based routing with protected route guards
- **Data**: Mock collections and items for demonstration
- **UI**: ShadCN components with Tailwind CSS styling
- **State**: React hooks for local component state management

### File Structure
- `src/main.tsx`: Main application component with HTML5 History API navigation
- `src/components/screens/`: Individual screen components
  - `MyCollectionScreen.tsx`: Primary interface with integrated auth (default home)
  - `AddItemScreen.tsx`: Mobile-optimized item creation form
  - `CollectionsScreen.tsx`: Browse all collections interface
  - `CollectionDetailScreen.tsx`: Individual collection view
  - `AdminScreen.tsx`: Collection management interface
- `src/components/GoogleSignInButton.tsx`: Isolated Google OAuth component
- `src/components/ErrorBoundary.tsx`: Error handling wrapper
- `src/components/ui/`: ShadCN UI component library
- `src/lib/utils.ts`: Utility functions for formatting and styling
- `src/globals.css`: Global styles and Tailwind imports

## Current Implementation Status

### ✅ Completed Features
- **My Collection as Home Page**: Default landing page for authenticated users with integrated sign-in
- **Hobbyist-Focused Design**: No value tracking, condition badges, or investment features
- **Mobile-First Add Item**: Camera capture, multiple photos (up to 5), smart typeahead search
- **Google OAuth Integration**: Isolated component with proper React patterns
- **HTML5 History Navigation**: Browser back/forward button support
- **User Dropdown Menu**: Admin access, dark mode toggle, sign out
- **Smart Filtering**: Search, starred collections only, clear sort labeling
- **Personal Statistics**: Total items, favorites, categories, recent additions
- **Grid/List Toggle Views**: Visual grid and detailed list views for items
- **Responsive Design**: Mobile-optimized interface that works on all devices
- **Component Architecture**: Modular screens with proper hook usage patterns
- **Error Boundaries**: Graceful error handling with detailed logging
- **Deployment**: Live on Vercel at https://attic-ilwnq9i2k-will-regelmanns-projects.vercel.app

### 🚧 Future Enhancements
- **Laravel API Integration**: Connect to backend for persistent data
- **Real Data**: Replace mock data with API-driven collections and items
- **Advanced Features**: Wishlist, trading, showcases, analytics
- **Offline Support**: PWA capabilities and offline data management

## Development Workflow

1. **Environment Setup**: Configure Google OAuth client ID and environment variables
2. **Local Development**: Use `npm run dev` for hot-reload development server
3. **Component Design**: Follow ShadCN UI patterns and Tailwind CSS utilities
4. **Authentication**: Ensure protected routes require Google sign-in
5. **Testing**: Manual testing of admin CRUD operations and responsive design
6. **Deployment**: Use `vercel --prod` for production deployments