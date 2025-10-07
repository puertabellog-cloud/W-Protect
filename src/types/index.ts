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
  wusuarioId: number;
  name: string;
  phone: string;
  email?: string;
  relationship?: string;
}

/**
 * Alerta - Corresponde EXACTAMENTE a la entidad Walerta del backend
 */
export interface Alert {
  id?: number;
  mensaje: string;           // ✅ Coincide con backend (no "message")
  latitud: string;          // ✅ Coincide con backend (String, no number)
  longitud: string;         // ✅ Coincide con backend (String, no number)
  timestamp?: string;       // ✅ Coincide con backend
  userId: number;           // ✅ Coincide con backend
  contactosNotificados?: number; // ✅ Coincide con backend
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
  latitud: number;
  longitud: number;
  address?: string;
}

// === TIPOS PARA SOLICITUDES DE EMERGENCIA ===

export interface EmergencyAlertRequest {
  mensaje: string;          // ✅ Coincide con backend
  latitud: string;         // ✅ Coincide con backend (String)
  longitud: string;        // ✅ Coincide con backend (String)
  userId: number;          // ✅ Coincide con backend
  timestamp?: string;      // ✅ Opcional, se puede generar en backend
  contactosNotificados?: number; // ✅ Opcional
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