/**
 * Servicio para el módulo WLibrary (Biblioteca de recursos)
 * Todos los endpoints requieren X-User-Id + X-Device-Id (inyectados por el interceptor)
 * y que el usuario tenga profile = "ADMIN" en base de datos.
 */

import { apiClient } from '../api/apiClient';
import { API_ENDPOINTS } from '../config/api';
import { WLibrary } from '../types';
import { debugError, debugLog } from '../utils/debug';

type LibraryListResponse = WLibrary[] | { content?: WLibrary[]; data?: WLibrary[] };

const toLibraryArray = (payload: LibraryListResponse): WLibrary[] => {
  debugLog('LibraryService', 'raw payload received', payload);

  if (Array.isArray(payload)) {
    debugLog('LibraryService', 'payload is array', { count: payload.length });
    return payload;
  }

  if (Array.isArray(payload.content)) {
    debugLog('LibraryService', 'payload.content is array', { count: payload.content.length });
    return payload.content;
  }

  if (Array.isArray(payload.data)) {
    debugLog('LibraryService', 'payload.data is array', { count: payload.data.length });
    return payload.data;
  }

  debugLog('LibraryService', 'payload has unknown shape, returning []');
  return [];
};

/** Obtener todos los recursos */
export const getAllLibraryItems = async (): Promise<WLibrary[]> => {
  try {
    debugLog('LibraryService', 'request getAllLibraryItems');
    const response = await apiClient.get<LibraryListResponse>(API_ENDPOINTS.library.getAll);
    debugLog('LibraryService', 'response getAllLibraryItems', {
      status: response.status,
      url: response.config.url,
    });
    return toLibraryArray(response.data);
  } catch (error) {
    debugError('LibraryService', 'getAllLibraryItems failed', error);
    throw error;
  }
};

/** Obtener un recurso por id */
export const getLibraryItemById = async (id: number): Promise<WLibrary> => {
  const response = await apiClient.get<WLibrary>(`${API_ENDPOINTS.library.getById}/${id}`);
  return response.data;
};

/** Crear un nuevo recurso */
export const saveLibraryItem = async (library: WLibrary): Promise<WLibrary> => {
  const response = await apiClient.post<WLibrary>(API_ENDPOINTS.library.save, library);
  return response.data;
};

/** Eliminar un recurso por id */
export const deleteLibraryItem = async (id: number): Promise<void> => {
  await apiClient.delete(`${API_ENDPOINTS.library.delete}/${id}`);
};

/** Editar parcialmente un recurso (PATCH) */
export const patchLibraryItem = async (id: number, data: Partial<WLibrary>): Promise<WLibrary> => {
  const response = await apiClient.patch<WLibrary>(`${API_ENDPOINTS.library.edit}/${id}`, data);
  return response.data;
};
