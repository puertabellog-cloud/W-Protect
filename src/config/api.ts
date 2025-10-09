/**
 * API Configuration
 * Central configuration for all API calls
 */

// Base URL configuration
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

// Full API URL (sin /api/v1 porque Spring Boot usa directamente /w/)
export const API_URL = API_BASE_URL;

// API Endpoints basados en tus controllers reales
export const API_ENDPOINTS = {
  // User Management (WuserController)
  users: {
    getByEmail: '/w/users/email', // GET /w/users/email/{email}
    save: '/w/users/save', // PUT /w/users/save
    getByDevice: '/w/users/device', // GET /w/users/device/{id}
  },
  
  // Contacts Management (WcontactController)
  contacts: {
    getByUser: '/w/contacts/user', // GET /w/contacts/user/{userId}
    save: '/w/contacts/save', // PUT /w/contacts/save
    delete: '/w/contacts/delete', // DELETE /w/contacts/delete
  },
  
  // Alerts Management (WalertController)
  alerts: {
    save: '/w/alerts/save', // PUT /w/alerts/save
  },
  
  // Location Tracking (nuevo endpoint para tracking)
  locationTracking: {
    save: '/w/location/track', // POST /w/location/track
  },
};

// Request timeout (in milliseconds)
export const REQUEST_TIMEOUT = 10000;

// Environment check
export const isDevelopment = import.meta.env.VITE_ENV === 'development';
export const isProduction = import.meta.env.VITE_ENV === 'production';

// Helper function to build full endpoint URLs
export const buildApiUrl = (endpoint: string): string => {
  return `${API_URL}${endpoint}`;
};

console.log(`🌐 API Configuration loaded:`, {
  baseUrl: API_BASE_URL,
  fullApiUrl: API_URL,
  environment: import.meta.env.VITE_ENV,
});