const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Add support for absolute imports
config.resolver.alias = {
  '@': path.resolve(__dirname, 'src'),
  '@/components': path.resolve(__dirname, 'src/components'),
  '@/screens': path.resolve(__dirname, 'src/screens'),
  '@/services': path.resolve(__dirname, 'src/services'),
  '@/hooks': path.resolve(__dirname, 'src/hooks'),
  '@/contexts': path.resolve(__dirname, 'src/contexts'),
  '@/config': path.resolve(__dirname, 'src/config'),
  '@/types': path.resolve(__dirname, 'src/types'),
  '@/utils': path.resolve(__dirname, 'src/utils'),
  '@/store': path.resolve(__dirname, 'src/store'),
  '@/modules': path.resolve(__dirname, 'src/modules'),
};

// Improve module resolution
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

// Add file extensions for better resolution
config.resolver.sourceExts.push('cjs');

module.exports = config;
