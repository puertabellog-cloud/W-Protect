/**
 * Tipos centralizados para la aplicación W-Protect
 * Interfaces que coinciden exactamente con las entidades Spring Boot
 */

// === ENTIDADES PRINCIPALES ===

/**
 * Usuario - Corresponde a la entidad Wuser del backend
 */
export interface User {
  id?: number
  name: string
  email: string
  phone: string
  deviceId?: string
  profile?: 'USER' | 'ADMIN'
  active?: boolean
  emergencyMode?: boolean
}

/**
 * Contacto - Corresponde a la entidad Wcontact del backend
 */

export interface Contact {
  id?: number
  name: string
  phone: string
  alias?: string
  wusuarioId: number
}

/**
 * Alerta - Corresponde EXACTAMENTE a la entidad Walerta del backend
 */
export interface Alert {
  id?: number
  message: string
  latitud: string
  longitud: string
  userId: number
  emergencyMode?: boolean
  timestamp?: string
  contactsNotified?: number
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

// === TIPOS PARA RECURSOS Y ARTÍCULOS ===

/**
 * Artículo de recursos de seguridad
 */
export interface Article {
  id: string;
  titulo: string;
  categoria: 'seguridad' | 'autodefensa' | 'legal' | 'psicologico' | 'tecnologia';
  descripcion: string;
  contenido: string; // HTML o Markdown
  fechaPublicacion: string;
  duracionLectura: number; // en minutos
  tags: string[];
  destacado: boolean;
  icono: string; // nombre del icono de Ionic
}

/**
 * Categoría de recursos
 */
export interface ResourceCategory {
  id: string;
  nombre: string;
  descripcion: string;
  icono: string;
  color: string;
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

// === BIBLIOTECA (WLibrary) ===

/**
 * Recurso de la biblioteca — módulo /w/library (solo ADMIN)
 */
export interface WLibrary {
  id?: number;
  name: string;
  description: string;
  url: string;
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