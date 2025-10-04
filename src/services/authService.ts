/**
 * Authentication Service
 * Manejo de autenticación usando servicios centralizados
 */

import { getUserByEmail, saveUser } from './springBootServices';
import { User, LoginCredentials, RegisterData } from '../types';

// === FUNCIONES DE AUTENTICACIÓN ===

/**
 * Simular login usando el endpoint de obtener usuario por email
 */
export const login = async (credentials: LoginCredentials): Promise<User> => {
  try {
    const user = await getUserByEmail(credentials.email);
    
    // Guardar datos de usuario en localStorage
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('isLoggedIn', 'true');
    
    return user;
  } catch (error) {
    console.error('Error en login:', error);
    throw new Error('Usuario no encontrado');
  }
};

/**
 * Registrar nuevo usuario
 */
export const register = async (userData: RegisterData): Promise<User> => {
  try {
    const newUser: User = {
      name: userData.name,
      email: userData.email,
      phone: userData.phone,
      deviceId: userData.deviceId,
      active: true
    };
    
    const savedUser = await saveUser(newUser);
    
    // Guardar datos de usuario en localStorage
    localStorage.setItem('user', JSON.stringify(savedUser));
    localStorage.setItem('isLoggedIn', 'true');
    
    return savedUser;
  } catch (error) {
    console.error('Error en registro:', error);
    throw new Error('Error al registrar usuario');
  }
};

/**
 * Cerrar sesión
 */
export const logout = (): void => {
  localStorage.removeItem('user');
  localStorage.removeItem('isLoggedIn');
};

/**
 * Verificar si el usuario está autenticado
 */
export const isAuthenticated = (): boolean => {
  return localStorage.getItem('isLoggedIn') === 'true';
};

/**
 * Obtener usuario actual
 */
export const getCurrentUser = (): User | null => {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
};

/**
 * Verificar y refrescar datos del usuario actual
 */
export const refreshCurrentUser = async (): Promise<User | null> => {
  const currentUser = getCurrentUser();
  if (!currentUser || !currentUser.email) {
    return null;
  }
  
  try {
    const updatedUser = await getUserByEmail(currentUser.email);
    localStorage.setItem('user', JSON.stringify(updatedUser));
    return updatedUser;
  } catch (error) {
    console.error('Error al refrescar usuario:', error);
    return currentUser; // Retornar usuario actual en caso de error
  }
};

// === EXPORTACIONES PARA COMPATIBILIDAD ===

// Re-exportar tipos comunes
export type { User, LoginCredentials, RegisterData } from '../types';