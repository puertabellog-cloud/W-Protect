/**
 * API Configuration
 * Central configuration for all API calls
 */

// Base URL configuration
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Full API URL (sin /api/v1 porque Spring Boot usa directamente /w/)
export const API_URL = API_BASE_URL;

// API Endpoints basados en tus controllers reales
export const API_ENDPOINTS = {
  // User Management (WuserController)
  users: {
    getByEmail: '/w/users/email', // GET /w/users/email/{email}
    save: '/w/users/save', // PUT /w/users/save
    getByDevice: '/w/users/device', // GET /w/users/device/{id}
    getAll: '/w/users', // GET /w/users
    patch: '/w/users', // PATCH /w/users/{id}
  },
  
  // Contacts Management (WcontactController)
  contacts: {
    getByUser: '/w/contacts/user', // GET /w/contacts/user/{userId}
    save: '/w/contacts/save', // POST /w/contacts/save (crear) | PUT /w/contacts/save/{id} (actualizar)
    delete: '/w/contacts', // DELETE /w/contacts/{id}
  },
  
  // Alerts Management (WalertController)
  alerts: {
    getAll: '/w/alerts',        // GET /w/alerts
    save: '/w/alerts',          // POST /w/alerts
    close: '/w/alerts',         // PUT /w/alerts/{id}/close
    locations: '/w/alerts',     // POST /w/alerts/{alertId}/locations
  },

  // Library Management — admin edita, user/admin pueden leer según backend
  library: {
    getAll: '/w/library',              // GET  /w/library
    getById: '/w/library',             // GET  /w/library/{id}
    save: '/w/library/save',           // POST /w/library/save
    delete: '/w/library',              // DELETE /w/library/{id}
    edit: '/w/library/edit',           // PATCH /w/library/edit/{id}
  },

  // Resources Management (compatibilidad si existe controller dedicado)
  resources: {
    categories: '/w/resources/categories',
    articles: '/w/resources/articles',
    articleById: '/w/resources/articles',
    articlesByCategory: '/w/resources/articles/category',
    featuredArticles: '/w/resources/articles/featured',
    searchArticles: '/w/resources/articles/search',
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