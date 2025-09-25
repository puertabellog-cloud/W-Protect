import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.ionic.starter',
  appName: 'w-protect',
  webDir: 'dist',
  plugins: {
    Geolocation: {
      permissions: ['location', 'coarseLocation'],
      enableHighAccuracy: true
    }
  }
};

export default config;
