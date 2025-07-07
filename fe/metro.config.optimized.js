const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Performance optimizations
config.transformer = {
  ...config.transformer,
  // Enable inline requires for better performance
  inlineRequires: true,
};

// Enable hermes for better JavaScript performance
config.resolver.platforms = ['native', 'android', 'ios', 'web'];

// Create a mock for net module
const mockNet = path.resolve(__dirname, 'mocks/net.js');

config.resolver.extraNodeModules = {
  stream: require.resolve('readable-stream'),
  events: require.resolve('events'),
  buffer: require.resolve('buffer'),
  util: require.resolve('util'),
  process: require.resolve('process/browser'),
  http: require.resolve('stream-http'),
  https: require.resolve('https-browserify'),
  url: require.resolve('url'),
  zlib: require.resolve('browserify-zlib'),
  path: require.resolve('path-browserify'),
  net: mockNet,
  fs: false,
  tls: false,
  child_process: false,
};

// Optimize bundle size
config.resolver.alias = {
  ...config.resolver.alias,
  // Add any aliases to reduce bundle size
};

module.exports = config;
