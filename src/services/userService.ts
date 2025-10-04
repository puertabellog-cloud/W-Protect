/**
 * User Service
 * Wrapper específico para operaciones de usuario con funciones de conveniencia
 */

import { getUserByDeviceId, getUserByEmail, saveUser } from './springBootServices';
import { User, LoginCredentials, RegisterData } from '../types';

// === FUNCIONES DE CONVENIENCIA PARA USUARIOS ===

/**
 * Obtener perfil por deviceId (alias para compatibilidad)
 */
export const getProfileByDevice = getUserByDeviceId;

/**
 * Obtener perfil de usuario actual (requiere deviceId)
 */
export const getUserProfile = (deviceId: string): Promise<User> => {
  return getUserByDeviceId(deviceId);
};

/**
 * Actualizar perfil de usuario (alias para compatibilidad)
 */
export const updateUserProfile = saveUser;

/**
 * Guardar perfil (alias para compatibilidad)
 */
export const saveProfile = saveUser;

/**
 * Buscar usuario por email
 */
export const findUserByEmail = getUserByEmail;

/**
 * Crear nuevo usuario
 */
export const createUser = async (userData: RegisterData): Promise<User> => {
  const newUser: User = {
    name: userData.name,
    email: userData.email,
    phone: userData.phone,
    deviceId: userData.deviceId,
    active: true
  };
  
  return saveUser(newUser);
};

/**
 * Verificar si un usuario existe por email
 */
export const userExists = async (email: string): Promise<boolean> => {
  try {
    await getUserByEmail(email);
    return true;
  } catch (error) {
    return false;
  }
};

// === EXPORTACIONES PARA COMPATIBILIDAD ===

// Re-exportar tipos comunes
export type { User, UserProfile } from '../types';