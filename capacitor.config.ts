import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.wprotect.app', // ✅ Cambiar por un ID único
  appName: 'W-Protect',
  webDir: 'dist',
  server: {
    // ✅ Permitir acceso a APIs externas desde el dispositivo
    allowNavigation: ['https://goldfish-app-h7qp9.ondigitalocean.app']
  },
  plugins: {
    Geolocation: {
      permissions: ['location', 'coarseLocation'],
      enableHighAccuracy: true
    },
    // ✅ Configuración para contactos
    Contacts: {
      permissions: ['contacts']
    }
  }
};

export default config;
