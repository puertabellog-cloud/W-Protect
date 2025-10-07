/**
 * Emergency Service
 * Wrapper específico para operaciones de emergencia con funciones de conveniencia
 */

import { getContactsByUserId, saveContact, deleteContact, saveAlert } from './springBootServices';
import { Contact, Alert } from '../types';

// === FUNCIONES DE CONVENIENCIA PARA CONTACTOS DE EMERGENCIA ===

/**
 * Obtener contactos de emergencia del usuario
 */
export const getEmergencyContacts = getContactsByUserId;

/**
 * Agregar nuevo contacto de emergencia
 */
export const addEmergencyContact = saveContact;

/**
 * Actualizar contacto de emergencia (usar saveContact ya que Spring Boot usa PUT)
 */
export const updateEmergencyContact = saveContact;

/**
 * Eliminar contacto de emergencia
 */
export const deleteEmergencyContact = deleteContact;

// === FUNCIONES DE CONVENIENCIA PARA ALERTAS ===

/**
 * Crear alerta de emergencia con mapeo correcto de coordenadas
 */
export const createEmergencyAlert = async (
  userId: number, 
  mensaje: string,  // ✅ Cambiado de "message" a "mensaje"
  alertType?: string,
  location?: { latitud: string; longitud: string } // ✅ Cambiado a string
): Promise<Alert> => {
  const alert: Alert = {
    userId,
    mensaje,     // ✅ Campo correcto
    latitud: location?.latitud || '0',    // ✅ String con valor por defecto
    longitud: location?.longitud || '0',  // ✅ String con valor por defecto
    timestamp: new Date().toISOString(),
    contactosNotificados: 0
  };
  
  return saveAlert(alert);
};

/**
 * Enviar alerta de emergencia con coordenadas desde Google Maps
 * Convierte automáticamente coordinates de Google Maps al formato exacto del backend Walerta
 */
export const sendEmergencyAlertFromMap = async (
  userId: number,
  mensaje: string,
  coordinates: { lat: number; lng: number }, // De Google Maps
  emergencyType: string = 'GENERAL'
): Promise<Alert> => {
  
  console.log('📍 Coordenadas recibidas de Google Maps:', coordinates);
  
  // Convertir las coordenadas de number a string como espera el backend
  const latitudStr = coordinates.lat.toString();
  const longitudStr = coordinates.lng.toString();
  
  console.log('📍 Coordenadas convertidas a String:', { 
    latitud: latitudStr, 
    longitud: longitudStr 
  });
  
  // Crear la alerta con el formato EXACTO que espera Walerta
  const alert: Alert = {
    userId,
    mensaje,                 // ✅ Campo correcto (no "message")
    latitud: latitudStr,     // ✅ String como espera el backend
    longitud: longitudStr,   // ✅ String como espera el backend
    timestamp: new Date().toISOString(),
    contactosNotificados: 0  // Inicializar en 0
  };
  
  console.log('🚨 Alerta final para Walerta:', JSON.stringify(alert, null, 2));
  
  return saveAlert(alert);
};

/**
 * Disparar alerta de pánico
 */
export const triggerPanicAlert = async (
  userId: number,
  location?: { latitud: number; longitud: number }
): Promise<Alert> => {
  // Convertir coordenadas de number a string si se proporcionan
  const locationStr = location ? {
    latitud: location.latitud.toString(),
    longitud: location.longitud.toString()
  } : undefined;
  
  return createEmergencyAlert(userId, 'Alerta de pánico activada', 'panic', locationStr);
};

/**
 * Guardar alerta personalizada
 */
export const saveEmergencyAlert = saveAlert;

/**
 * Alias para compatibilidad
 */
export const triggerEmergencyAlert = createEmergencyAlert;

// === EXPORTACIONES PARA COMPATIBILIDAD ===

// Re-exportar tipos comunes
export type { Contact, Alert, EmergencyContact, EmergencyAlert } from '../types';