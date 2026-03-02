import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.wprotect.app',
  appName: 'W-Protect',
  webDir: 'dist',
  server: {
    allowNavigation: ['https://goldfish-app-h7qp9.ondigitalocean.app']
  },
  plugins: {
    Geolocation: {
      permissions: ['location', 'coarseLocation'],
      enableHighAccuracy: true
    },
    Contacts: {
      permissions: ['contacts']
    }
  },
  // Solo Android - no iOS
  android: {
    allowMixedContent: true,
    captureInput: true
  }
};

export default config;
