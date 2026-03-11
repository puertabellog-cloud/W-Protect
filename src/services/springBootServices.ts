/**
 * Servicios principales para comunicación con Spring Boot backend
 * Mapean directamente a los endpoints reales del backend
 */

import { apiClient } from '../api/apiClient'
import { API_ENDPOINTS } from '../config/api'
import { User, Contact, Alert } from '../types'

/* =========================================================
   USUARIOS
========================================================= */

/**
 * Obtener usuario por email
 */
export const getUserByEmail = async (email: string): Promise<User> => {
  try {

    const response = await apiClient.get(
      `${API_ENDPOINTS.users.getByEmail}/${email}`
    )

    return response.data

  } catch (error) {

    console.error('Error al obtener usuario por email:', error)
    throw new Error('Error al obtener usuario por email')

  }
}

/**
 * Crear o actualizar usuario
 */
export const saveUser = async (user: User): Promise<User> => {
  try {

    const payload = {
      name: user.name,
      email: user.email,
      phone: user.phone,
      profile: user.profile ?? 'USER',
      active: user.active ?? true,
      emergencyMode: user.emergencyMode ?? false
    }

    const response = await apiClient.post(
      API_ENDPOINTS.users.save,
      payload
    )

    return response.data

  } catch (error) {

    console.error('Error al guardar usuario:', error)
    throw new Error('Error al guardar usuario')

  }
}


/* =========================================================
   CONTACTOS
========================================================= */

/**
 * Obtener contactos de un usuario
 */
export const getContactsByUserId = async (userId: number): Promise<Contact[]> => {
  try {

    const response = await apiClient.get(
      `${API_ENDPOINTS.contacts.getByUser}/${userId}`
    )

    console.log('📋 Contactos cargados:', response.data.length, 'contactos con IDs:', response.data.map(c => c.id));
    return response.data

  } catch (error) {

    console.error('Error al obtener contactos:', error)
    throw new Error('Error al obtener contactos')

  }
}

/**
 * Crear contacto nuevo
 */
export const createContact = async (contact: Omit<Contact, 'id'>): Promise<Contact> => {
  try {

    const payload = {
      name: contact.name,
      phone: contact.phone,
      alias: contact.alias ?? '',
      wusuarioId: contact.wusuarioId
      // Sin ID para creación
    }

    // POST /w/contacts/save para crear nuevo contacto
    const response = await apiClient.post(
      API_ENDPOINTS.contacts.save,
      payload
    )

    console.log('✅ Contacto creado:', response.data)
    return response.data

  } catch (error) {

    console.error('Error al crear contacto:', error)
    throw new Error('Error al crear contacto')

  }
}

/**
 * Actualizar contacto existente
 */
export const updateContact = async (contactId: number, contact: Contact): Promise<Contact> => {
  try {

    const payload = {
      id: contactId,
      name: contact.name,
      phone: contact.phone,
      alias: contact.alias ?? '',
      wusuarioId: contact.wusuarioId
    }

    // PUT /w/contacts/{id} para actualizar contacto existente
    const response = await apiClient.put(
      `${API_ENDPOINTS.contacts.save}/${contactId}`,
      payload
    )

    console.log('🔄 Contacto actualizado:', response.data)
    return response.data

  } catch (error) {

    console.error('Error al actualizar contacto:', error)
    throw new Error('Error al actualizar contacto')

  }
}

/**
 * Crear o actualizar contacto (mantener para compatibilidad)
 * @deprecated Usar createContact() o updateContact() directamente
 */
export const saveContact = async (contact: Contact): Promise<Contact> => {
  try {

    // Diferenciar entre crear y actualizar basado en la presencia del ID
    if (contact.id) {
      console.log('🔄 Actualizando contacto existente con ID:', contact.id)
      return await updateContact(contact.id, contact)
    } else {
      console.log('✅ Creando nuevo contacto')
      return await createContact(contact)
    }

  } catch (error) {

    console.error('Error al guardar contacto:', error)
    throw new Error('Error al guardar contacto')

  }
}

/**
 * Eliminar contacto
 */
export const deleteContact = async (contactId: number): Promise<void> => {
  try {

    // DELETE /w/contacts/{id} para eliminar contacto
    const response = await apiClient.delete(
      `${API_ENDPOINTS.contacts.delete}/${contactId}`
    )

    console.log('🗑️ Contacto eliminado con ID:', contactId)
    return response.data

  } catch (error) {

    console.error('Error al eliminar contacto:', error)
    throw new Error('Error al eliminar contacto')

  }
}


/* =========================================================
   ALERTAS
========================================================= */

/**
 * Crear alerta de emergencia
 */
export const saveAlert = async (alert: Alert): Promise<Alert> => {
  try {

    const payload = {
      message: alert.message,
      latitud: alert.latitud,
      longitud: alert.longitud,
      userId: alert.userId,
      emergencyMode: alert.emergencyMode ?? true
    }

    const response = await apiClient.post(
      '/w/alerts',
      payload
    )

    console.log('🚨 Alerta creada:', response.data)

    return response.data

  } catch (error) {

    console.error('Error al crear alerta:', error)
    throw new Error('Error al crear alerta')

  }
}

/**
 * Cerrar alerta activa
 */
export const closeAlert = async (alertId: number): Promise<void> => {
  try {

    const response = await apiClient.put(
      `/w/alerts/${alertId}/close`
    )

    console.log('🔒 Alerta cerrada:', alertId, response.status)

  } catch (error) {

    console.error('Error cerrando alerta:', error)
    throw new Error('Error cerrando alerta')

  }
}

/**
 * Enviar ubicación asociada a una alerta
 */
export const postAlertLocation = async (
  alertId: number,
  location: {
    latitud: number
    longitud: number
    accuracy?: number
  }
): Promise<void> => {
  try {

    const payload = {
      latitud: location.latitud,
      longitud: location.longitud,
      accuracy: location.accuracy ?? null,
      mensaje: 'movimiento'
    }

    const response = await apiClient.post(
      `/w/alerts/${alertId}/locations`,
      payload
    )

    console.log('📍 Ubicación enviada:', response.status)

  } catch (error) {

    console.error('Error enviando ubicación:', error)
    throw new Error('Error enviando ubicación')

  }
}