#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 Will\'s Attic - Setup Verification\n');

// Check if essential files exist
const requiredFiles = [
  'package.json',
  'src/App.tsx',
  'src/store/index.ts',
  'src/navigation/AppNavigator.tsx',
  '.env',
  'babel.config.js',
  'metro.config.js',
  'tsconfig.json'
];

let allGood = true;

console.log('📁 Checking required files:');
requiredFiles.forEach(file => {
  const exists = fs.existsSync(path.join(__dirname, file));
  console.log(`  ${exists ? '✅' : '❌'} ${file}`);
  if (!exists) allGood = false;
});

// Check package.json dependencies
console.log('\n📦 Checking key dependencies:');
try {
  const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf8'));
  const keyDeps = [
    'react-native',
    '@react-navigation/native',
    '@reduxjs/toolkit',
    'react-redux',
    '@react-native-google-signin/google-signin'
  ];
  
  keyDeps.forEach(dep => {
    const exists = packageJson.dependencies[dep] || packageJson.devDependencies[dep];
    console.log(`  ${exists ? '✅' : '❌'} ${dep}`);
    if (!exists) allGood = false;
  });
} catch (error) {
  console.log('  ❌ Error reading package.json');
  allGood = false;
}

// Check environment variables
console.log('\n🔐 Checking environment configuration:');
try {
  const envContent = fs.readFileSync(path.join(__dirname, '.env'), 'utf8');
  const hasApiUrl = envContent.includes('API_BASE_URL');
  const hasGoogleId = envContent.includes('GOOGLE_CLIENT_ID');
  
  console.log(`  ${hasApiUrl ? '✅' : '❌'} API_BASE_URL configured`);
  console.log(`  ${hasGoogleId ? '✅' : '❌'} GOOGLE_CLIENT_ID configured`);
  
  if (!hasApiUrl || !hasGoogleId) allGood = false;
} catch (error) {
  console.log('  ❌ Error reading .env file');
  allGood = false;
}

// Final status
console.log(`\n${allGood ? '🎉' : '⚠️'} Setup Status: ${allGood ? 'READY' : 'NEEDS ATTENTION'}`);

if (allGood) {
  console.log('\n🚀 Next steps:');
  console.log('  1. Run: npm install');
  console.log('  2. Run: npm start');
  console.log('  3. Run: npm run android (or npm run ios)');
} else {
  console.log('\n🔧 Please fix the issues above before proceeding.');
}

console.log('\n📖 See DEVELOPMENT_SETUP.md for detailed instructions.');