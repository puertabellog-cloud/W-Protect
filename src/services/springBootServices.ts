/**
 * Servicios principales para comunicación con Spring Boot backend
 * Funciones que mapean directamente a los endpoints del backend
 */

import { apiClient } from '../api/apiClient';
import { API_ENDPOINTS } from '../config/api';
import { User, Contact, Alert } from '../types';

// === SERVICIOS DE USUARIO ===

/**
 * Obtener usuario por deviceId
 */
export const getUserByDeviceId = async (deviceId: string): Promise<User> => {
  try {
    const response = await apiClient.get(`${API_ENDPOINTS.users.getByDevice}/${deviceId}`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener usuario por dispositivo:', error);
    throw new Error('Error al obtener usuario por dispositivo');
  }
};

/**
 * Obtener usuario por email
 */
export const getUserByEmail = async (email: string): Promise<User> => {
  try {
    const response = await apiClient.get(`${API_ENDPOINTS.users.getByEmail}/${email}`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener usuario por email:', error);
    throw new Error('Error al obtener usuario por email');
  }
};

/**
 * Guardar/actualizar usuario
 */
export const saveUser = async (user: User): Promise<User> => {
  try {
    console.log('Guardando usuario:', user);
    const response = await apiClient.put(API_ENDPOINTS.users.save, user);
    return response.data;
  } catch (error) {
    console.error('Error al guardar usuario:', error);
    throw new Error('Error al guardar usuario');
  }
};

// === SERVICIOS DE CONTACTOS ===

/**
 * Obtener contactos por userId
 */
export const getContactsByUserId = async (userId: number): Promise<Contact[]> => {
  try {
    const response = await apiClient.get(`${API_ENDPOINTS.contacts.getByUser}/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener contactos:', error);
    throw new Error('Error al obtener contactos');
  }
};

/**
 * Guardar contacto
 */
export const saveContact = async (contact: Contact): Promise<Contact> => {
  try {
    console.log('Guardando contacto:', contact);
    const response = await apiClient.put(API_ENDPOINTS.contacts.save, contact);
    return response.data;
  } catch (error) {
    console.error('Error al guardar contacto:', error);
    throw new Error('Error al guardar contacto');
  }
};

/**
 * Eliminar contacto
 */
export const deleteContact = async (contactId: number): Promise<void> => {
  try {
    await apiClient.delete(`${API_ENDPOINTS.contacts.delete}/${contactId}`);
  } catch (error) {
    console.error('Error al eliminar contacto:', error);
    throw new Error('Error al eliminar contacto');
  }
};

// === SERVICIOS DE ALERTAS ===

/**
 * Guardar alerta
 */
export const saveAlert = async (alert: Alert): Promise<Alert> => {
  try {
    console.log('Guardando alerta:', alert);
    const response = await apiClient.put(API_ENDPOINTS.alerts.save, alert);
    return response.data;
  } catch (error) {
    console.error('Error al guardar alerta:', error);
    throw new Error('Error al guardar alerta');
  }
};

// === SERVICIOS DE TRACKING DE UBICACIÓN ===

/**
 * Enviar tracking de ubicación cada 5 segundos
 */
export const saveLocationTracking = async (locationData: {
  deviceId: string;
  latitud: string;
  longitud: string;
  timestamp: string;
  accuracy?: number;
}): Promise<void> => {
  try {
    console.log('📍 Enviando tracking de ubicación:', locationData);
    await apiClient.post(API_ENDPOINTS.locationTracking.save, locationData);
    console.log('✅ Tracking de ubicación enviado exitosamente');
  } catch (error) {
    console.error('❌ Error enviando tracking de ubicación:', error);
    throw new Error('Error enviando tracking de ubicación');
  }
};