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
 * Crear alerta de emergencia
 */
export const createEmergencyAlert = async (
  userId: number, 
  message: string, 
  alertType?: string,
  location?: { latitude: number; longitude: number }
): Promise<Alert> => {
  const alert: Alert = {
    userId,
    message,
    alertType: alertType || 'emergency',
    timestamp: new Date().toISOString(),
    location
  };
  
  return saveAlert(alert);
};

/**
 * Disparar alerta de pánico
 */
export const triggerPanicAlert = async (
  userId: number,
  location?: { latitude: number; longitude: number }
): Promise<Alert> => {
  return createEmergencyAlert(userId, 'Alerta de pánico activada', 'panic', location);
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