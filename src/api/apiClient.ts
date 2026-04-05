import axios, { AxiosResponse, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { API_URL, REQUEST_TIMEOUT } from '../config/api';
import { clearAuthState, getSession } from '../services/sessionService';
import { debugError, debugLog } from '../utils/debug';

// Toast global para 403 (sin depender de hooks de React)
const showForbiddenAlert = () => {
  // Dispara un evento personalizado que la app puede escuchar para mostrar un toast
  window.dispatchEvent(new CustomEvent('w-protect-forbidden'));
};

// Configuración del cliente Axios
const apiClient = axios.create({
  baseURL: API_URL,
  timeout: REQUEST_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

const isProtectedWRoute = (url: string): boolean => {
  return /^\/w\//.test(url) || /\/w\//.test(url);
};

const isPublicRegisterRoute = (url: string, method?: string): boolean => {
  const normalizedMethod = (method || 'get').toLowerCase();
  return normalizedMethod === 'post' && /\/w\/users\/save$/.test(url);
};

const isPublicEmailLoginRoute = (url: string, method?: string): boolean => {
  const normalizedMethod = (method || 'get').toLowerCase();
  return normalizedMethod === 'get' && /\/w\/users\/email\/.+/.test(url);
};

const isPublicPasswordLoginRoute = (url: string, method?: string): boolean => {
  const normalizedMethod = (method || 'post').toLowerCase();
  return normalizedMethod === 'post' && /\/w\/users\/login$/.test(url);
};

const isPublicRoute = (url: string, method?: string): boolean => {
  return isPublicRegisterRoute(url, method) || isPublicEmailLoginRoute(url, method) || isPublicPasswordLoginRoute(url, method);
};

// Interceptor para requests (headers de seguridad por sesión)
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const url = config.url || '';
    const method = config.method;

    if (isProtectedWRoute(url) && !isPublicRoute(url, method) && config.headers) {
      const session = getSession();

      if (session?.userId && session?.deviceId) {
        config.headers['X-User-Id'] = String(session.userId);
        config.headers['X-Device-Id'] = session.deviceId;
      }
    }
    
    debugLog('API', 'request', {
      method: config.method?.toUpperCase(),
      url: config.url,
      hasSession: Boolean(getSession()),
      xUserId: config.headers?.['X-User-Id'],
      xDeviceId: config.headers?.['X-Device-Id'],
    });
    return config;
  },
  (error: any) => {
    debugError('API', 'request error', error);
    return Promise.reject(error);
  }
);

// Interceptor para responses (manejo de errores globales)
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    debugLog('API', 'response', {
      status: response.status,
      url: response.config.url,
    });
    return response;
  },
  (error: AxiosError) => {
    const requestUrl = error.config?.url || '';
    const requestMethod = error.config?.method;
    const isPublicRequest = isPublicRoute(requestUrl, requestMethod);

    debugError('API', 'response error', {
      status: error.response?.status,
      url: error.config?.url,
      data: error.response?.data,
      message: error.message,
    });
    
    // Sesión inválida o headers faltantes
    if (error.response?.status === 401 && !isPublicRequest) {
      clearAuthState();
      window.location.href = '/';
    }

    // Sin permisos de ADMIN
    if (error.response?.status === 403) {
      showForbiddenAlert();
    }
    
    return Promise.reject(error);
  }
);

export { apiClient };