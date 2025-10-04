import axios, { AxiosResponse, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { API_URL, REQUEST_TIMEOUT } from '../config/api';

// Re-exportar el cliente desde apiClient.ts para evitar dependencias circulares
export { apiClient } from './apiClient';
export { default } from './apiClient';

// === FUNCIONES DE COMPATIBILIDAD ===

/**
 * NOTA: Estas funciones han sido removidas para evitar dependencias circulares.
 * Usar directamente los servicios de springBootServices.ts en su lugar.
 * 
 * Ejemplo:
 * import { getUserByDeviceId, saveUser } from '../services/springBootServices';
 */

// Funciones removidas para evitar imports circulares:
// - getProfile (usar getUserByDeviceId)
// - updateProfile (usar saveUser)

// === TIPOS PARA COMPATIBILIDAD ===

/**
 * @deprecated Usar User de ../types en su lugar
 */
export interface ProfileData {
  id?: number;
  name: string;
  email: string;
  phone?: string;
  deviceId?: string;
  active?: boolean;
  mensaje?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}