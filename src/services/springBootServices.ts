/**
 * Servicios principales para comunicación con Spring Boot backend
 * Mapean directamente a los endpoints reales del backend
 */

import { apiClient } from '../api/apiClient'
import { API_ENDPOINTS } from '../config/api'
import { User, Contact, Alert, Article, ResourceCategory } from '../types'
import { getSession, setSession } from './sessionService'
import axios from 'axios'

/* =========================================================
   USUARIOS
========================================================= */

/**
 * Obtener usuario por deviceId
 */
export const getUserByDeviceId = async (deviceId: string): Promise<User | null> => {
  try {
    const response = await apiClient.get(
      `${API_ENDPOINTS.users.getByDevice}/${deviceId}`
    )

    const user: User = response.data
    const currentSession = getSession()
    if (currentSession && user.id) {
      setSession({
        ...currentSession,
        userId: user.id,
        email: user.email,
        profile: user.profile ?? currentSession.profile,
      })
    }

    return user
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return null
    }

    console.error('Error al obtener usuario por deviceId:', error)
    throw new Error('Error al obtener usuario por deviceId')
  }
}

/**
 * Obtener usuario por email
 */
export const getUserByEmail = async (email: string): Promise<User | null> => {
  try {

    const response = await apiClient.get(
      `${API_ENDPOINTS.users.getByEmail}/${email}`
    )

    // Refrescar sesión con el profile actualizado que devuelve el backend
    const user: User = response.data;
    const currentSession = getSession();
    if (currentSession && user.id) {
      setSession({
        ...currentSession,
        userId: user.id,
        email: user.email,
        profile: user.profile ?? currentSession.profile,
      });
    }

    return user;

  } catch (error) {

    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return null
    }

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
      emergencyMode: user.emergencyMode ?? false,
      deviceId: user.deviceId
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

type UsersListResponse = User[] | { content?: User[]; data?: User[]; users?: User[] };

const toUsersArray = (payload: unknown): { users: User[]; recognized: boolean } => {
  if (Array.isArray(payload)) {
    return { users: payload as User[], recognized: true };
  }

  if (payload && typeof payload === 'object' && Array.isArray((payload as { content?: User[] }).content)) {
    return { users: (payload as { content: User[] }).content, recognized: true };
  }

  if (payload && typeof payload === 'object' && Array.isArray((payload as { data?: User[] }).data)) {
    return { users: (payload as { data: User[] }).data, recognized: true };
  }

  if (payload && typeof payload === 'object' && Array.isArray((payload as { users?: User[] }).users)) {
    return { users: (payload as { users: User[] }).users, recognized: true };
  }

  return { users: [], recognized: false };
};

/**
 * Obtener todos los usuarios para el panel admin.
 * Prueba varios endpoints compatibles para evitar bloquear UI
 * mientras se confirma la ruta final del backend.
 */
export const getAllUsersForAdmin = async (): Promise<User[]> => {
  const candidateEndpoints = Array.from(new Set([
    API_ENDPOINTS.users.getAll,
    '/w/users/all',
    '/w/users/list',
  ]));

  for (const endpoint of candidateEndpoints) {
    try {
      const response = await apiClient.get<UsersListResponse>(endpoint);
      const parsed = toUsersArray(response.data);

      // Algunos backends responden 200 con body vacío; en ese caso seguimos al siguiente endpoint.
      if (!parsed.recognized) {
        continue;
      }

      return parsed.users;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        continue;
      }
      throw error;
    }
  }

  throw new Error('No se encontró un endpoint de listado de usuarios disponible');
}


/* =========================================================
   CONTACTOS
========================================================= */

/**
 * Obtener contactos de un usuario
 */
export const getContactsByUserId = async (userId: number): Promise<Contact[]> => {
  try {

    const response = await apiClient.get<Contact[]>(
      `${API_ENDPOINTS.contacts.getByUser}/${userId}`
    )

    console.log('📋 Contactos cargados:', response.data.length, 'contactos con IDs:', response.data.map((c: Contact) => c.id));
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
   GESTIÓN DE RECURSOS Y ARTÍCULOS
========================================================= */

/**
 * Obtener todas las categorías de recursos
 */
export const getResourceCategories = async (): Promise<ResourceCategory[]> => {
  try {
    console.log('📚 Obteniendo categorías de recursos...')
    const response = await apiClient.get(API_ENDPOINTS.resources.categories)
    console.log('✅ Categorías obtenidas:', response.data.length)
    return response.data
  } catch (error) {
    console.error('Error al obtener categorías:', error)
    throw new Error('Error al obtener categorías de recursos')
  }
}

/**
 * Obtener todos los artículos
 */
export const getAllArticles = async (): Promise<Article[]> => {
  try {
    console.log('📖 Obteniendo todos los artículos...')
    const response = await apiClient.get(API_ENDPOINTS.resources.articles)
    console.log('✅ Artículos obtenidos:', response.data.length)
    return response.data
  } catch (error) {
    console.error('Error al obtener artículos:', error)
    throw new Error('Error al obtener artículos')
  }
}

/**
 * Obtener artículo por ID
 */
export const getArticleById = async (articleId: string): Promise<Article | null> => {
  try {
    console.log('🔍 Obteniendo artículo ID:', articleId)
    const response = await apiClient.get(`${API_ENDPOINTS.resources.articleById}/${articleId}`)
    console.log('✅ Artículo obtenido:', response.data.titulo)
    return response.data
  } catch (error) {
    console.error('Error al obtener artículo:', error)
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return null // Artículo no encontrado
    }
    throw new Error('Error al obtener artículo')
  }
}

/**
 * Obtener artículos por categoría
 */
export const getArticlesByCategory = async (categoria: string): Promise<Article[]> => {
  try {
    console.log('🏷️ Obteniendo artículos de categoría:', categoria)
    const response = await apiClient.get(`${API_ENDPOINTS.resources.articlesByCategory}/${categoria}`)
    console.log('✅ Artículos de categoría obtenidos:', response.data.length)
    return response.data
  } catch (error) {
    console.error('Error al obtener artículos por categoría:', error)
    throw new Error('Error al obtener artículos por categoría')
  }
}

/**
 * Obtener artículos destacados
 */
export const getFeaturedArticles = async (): Promise<Article[]> => {
  try {
    console.log('⭐ Obteniendo artículos destacados...')
    const response = await apiClient.get(API_ENDPOINTS.resources.featuredArticles)
    console.log('✅ Artículos destacados obtenidos:', response.data.length)
    return response.data
  } catch (error) {
    console.error('Error al obtener artículos destacados:', error)
    throw new Error('Error al obtener artículos destacados')
  }
}

/**
 * Buscar artículos por término
 */
export const searchArticles = async (searchTerm: string): Promise<Article[]> => {
  try {
    console.log('🔍 Buscando artículos con término:', searchTerm)
    const response = await apiClient.get(
      `${API_ENDPOINTS.resources.searchArticles}?q=${encodeURIComponent(searchTerm)}`
    )
    console.log('✅ Resultados de búsqueda:', response.data.length)
    return response.data
  } catch (error) {
    console.error('Error al buscar artículos:', error)
    throw new Error('Error al buscar artículos')
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