const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// 🛡️⚓️🚀 MoodMate Industrial SSR Protection
// Mocks out browser-intensive packages during the static bundling phase
if (config.resolver) {
  const mockPath = path.resolve(__dirname, 'utils/expo-notifications-mock.js');
  const originalResolveRequest = config.resolver.resolveRequest;
  
  config.resolver.resolveRequest = (context, moduleName, platform) => {
    // 🔥 The "Iron Curtain" Fix: 
    // Redirect expo-notifications to a safe mock for Web AND Android (Expo Go SDK 53 fix).
    if ((platform === 'web' || platform === 'android' || platform === 'ios') && moduleName === 'expo-notifications') {
      return {
        type: 'sourceFile',
        filePath: mockPath,
      };
    }
    
    if (originalResolveRequest) {
      return originalResolveRequest(context, moduleName, platform);
    }
    return context.resolveRequest(context, moduleName, platform);
  };
}

module.exports = config;
