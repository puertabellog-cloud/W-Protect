import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.wprotect.app',
  appName: 'W Protect',
  webDir: 'dist',
  server: {
    allowNavigation: ['/api/']
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
