# Will's Attic - Development Setup Guide

## 🚀 Quick Start

This guide will help you set up and run the Will's Attic React Native app locally.

## Prerequisites

### Required Software
- **Node.js** (v16 or higher) - [Download here](https://nodejs.org/)
- **React Native CLI** - Install globally: `npm install -g react-native-cli`
- **Watchman** (macOS) - `brew install watchman`
- **CocoaPods** (iOS) - `sudo gem install cocoapods`

### For Android Development
- **Android Studio** with Android SDK
- **Java Development Kit (JDK)** 11 or higher
- **Android SDK Platform Tools**

### For iOS Development (macOS only)
- **Xcode** 12 or higher
- **iOS Simulator**

## 📱 Installation Steps

### 1. Install Dependencies
```bash
# Navigate to project directory
cd /home/will/Projects/attic-ui

# Install npm packages
npm install

# For iOS (macOS only)
cd ios && pod install && cd ..
```

### 2. Environment Setup
The project includes a `.env` file with your Google OAuth credentials:
```
API_BASE_URL=https://attic-pyhryhudn-will-regelmanns-projects.vercel.app
GOOGLE_CLIENT_ID=367613908045-rf0s4f2dg19spkhflo5dmbr0muikvfgd.apps.googleusercontent.com
```

### 3. Android Setup

#### Configure Android SDK
1. Open Android Studio
2. Go to Tools → SDK Manager
3. Install Android SDK Platform 33 (API Level 33)
4. Install Android SDK Build-Tools 33.0.0

#### Set Environment Variables
Add to your `~/.bashrc` or `~/.zshrc`:
```bash
export ANDROID_HOME=$HOME/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/tools/bin
export PATH=$PATH:$ANDROID_HOME/platform-tools
```

#### Create Android Virtual Device (AVD)
1. Open Android Studio
2. Go to Tools → AVD Manager
3. Create a new virtual device (recommended: Pixel 4 with API 33)

### 4. iOS Setup (macOS only)

#### Install iOS Simulator
1. Open Xcode
2. Go to Preferences → Components
3. Download iOS 16.0+ Simulator

## 🏃‍♂️ Running the App

### Start Metro Bundler
```bash
npm start
```

### Run on Android
```bash
# Start Android emulator first, then:
npm run android
```

### Run on iOS (macOS only)
```bash
npm run ios
```

## 🔧 Development Commands

```bash
# Start development server
npm start

# Run Android app
npm run android

# Run iOS app (macOS only)
npm run ios

# Run tests
npm test

# Lint code
npm run lint

# TypeScript check
npx tsc --noEmit

# Clean React Native cache
npx react-native clean-project-auto
```

## 🐛 Troubleshooting

### Common Issues

#### Metro Bundler Issues
```bash
# Clear Metro cache
npx react-native start --reset-cache

# Or clean everything
npm start -- --reset-cache
```

#### Android Build Issues
```bash
# Clean Android build
cd android && ./gradlew clean && cd ..

# Rebuild
npm run android
```

#### iOS Build Issues (macOS)
```bash
# Clean iOS build
cd ios && xcodebuild clean && cd ..

# Reinstall pods
cd ios && pod deintegrate && pod install && cd ..
```

#### Google Sign-In Issues
- Ensure Google OAuth credentials are properly configured
- Check that the package name matches your Google Console configuration
- Verify SHA-1 fingerprints are added to Google Console (for Android)

### Missing Dependencies
If you encounter missing dependencies:
```bash
# Install missing peer dependencies
npm install

# For React Native specific issues
npx react-native doctor
```

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
├── navigation/          # Navigation configuration
├── screens/            # Screen components
│   ├── auth/           # Authentication screens
│   ├── collection/     # Collection management
│   ├── wishlist/       # Wishlist features
│   ├── showcase/       # Showcase features
│   ├── trade/          # Trading features
│   └── profile/        # User profile
├── store/              # Redux store and slices
└── types/              # TypeScript type definitions
```

## 🔑 Authentication Testing

The app uses Google OAuth with your configured credentials:
- **Client ID**: `367613908045-rf0s4f2dg19spkhflo5dmbr0muikvfgd.apps.googleusercontent.com`
- **API Base**: `https://attic-pyhryhudn-will-regelmanns-projects.vercel.app`

### Test Authentication Flow
1. Launch the app
2. Navigate through the welcome screen
3. Tap "Get Started" → "Continue with Google"
4. Sign in with your Google account
5. Complete the profile setup

## 📚 Available Features

### ✅ Implemented
- Welcome screen with feature highlights
- Google OAuth authentication
- Profile completion flow
- Bottom tab navigation
- Collection list with mock data
- Redux state management
- Placeholder screens for all major features

### 🚧 Coming Soon
- Collection detail screens
- Item management (add/edit/delete)
- Wishlist functionality
- Trading system
- Showcase creation
- Profile management
- Camera integration
- Offline support

## 🔄 Next Development Steps

1. **Test Authentication**: Verify Google OAuth integration
2. **API Integration**: Connect to the Laravel backend
3. **Collection Management**: Implement add/edit item functionality
4. **Camera Features**: Add barcode scanning and photo capture
5. **Offline Support**: Implement Apollo Client caching

## 📞 Support

If you encounter issues:
1. Check this troubleshooting guide
2. Review React Native documentation
3. Check the project's GitHub issues
4. Ensure all prerequisites are properly installed

## 🎯 Development Tips

- Use `npm run lint` frequently to catch issues early
- Test on both Android and iOS when possible
- Use React Native Debugger for debugging
- Keep Metro bundler running for faster rebuilds
- Use TypeScript strictly - it will save time debugging

Happy coding! 🚀