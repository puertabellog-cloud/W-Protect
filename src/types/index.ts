/**
 * Tipos centralizados para la aplicación W-Protect
 * Interfaces que coinciden exactamente con las entidades Spring Boot
 */

// === ENTIDADES PRINCIPALES ===

/**
 * Usuario - Corresponde a la entidad Wuser del backend
 */
export interface User {
  id?: number;
  name: string;
  email: string;
  phone?: string;
  deviceId?: string;
  active?: boolean;
  mensaje?: string;
}

/**
 * Contacto - Corresponde a la entidad Wcontact del backend
 */
export interface Contact {
  id?: number;
  wuserId: number;
  name: string;
  phone: string;
  email?: string;
  relationship?: string;
}

/**
 * Alerta - Corresponde a la entidad Walert del backend
 */
export interface Alert {
  id?: number;
  userId: number;
  message: string;
  alertType?: string;
  timestamp?: string;
  location?: {
    latitude: number;
    longitude: number;
  };
}

// === TIPOS PARA AUTENTICACIÓN ===

export interface LoginCredentials {
  email: string;
  password?: string; // Opcional ya que no hay autenticación real
}

export interface RegisterData {
  name: string;
  email: string;
  phone?: string;
  deviceId?: string;
}

// === TIPOS PARA API RESPONSES ===

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

// === TIPOS PARA GEOLOCALIZACIÓN ===

export interface Location {
  latitude: number;
  longitude: number;
  address?: string;
}

// === TIPOS PARA SOLICITUDES DE EMERGENCIA ===

export interface EmergencyAlertRequest {
  message: string;
  latitude: number;
  longitude: number;
  accuracy: number;
  userId: number | null;
  emergencyType: string;
}

// === ALIAS PARA COMPATIBILIDAD ===

// Alias para mantener compatibilidad con código existente
export type UserProfile = User;
export type EmergencyContact = Contact;
export type EmergencyAlert = Alert;
export type Wuser = User;
export type Wcontact = Contact;
export type Walert = Alert;
export type ProfileData = User;