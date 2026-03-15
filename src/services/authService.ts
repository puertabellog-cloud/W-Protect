/**
 * Authentication Service
 * Manejo de autenticación para W-Protect
 * Usa el backend Spring Boot
 */

import { getUserByEmail, saveUser } from './springBootServices'
import { User, LoginCredentials, RegisterData } from '../types'

/* =====================================================
   LOGIN
===================================================== */

export const login = async (credentials: LoginCredentials): Promise<User> => {

  try {

    const user = await getUserByEmail(credentials.email)

    if (!user) {
      throw new Error('Usuario no encontrado')
    }

    localStorage.setItem('user', JSON.stringify(user))
    localStorage.setItem('isLoggedIn', 'true')

    return user

  } catch (error) {

    console.error('Error en login:', error)
    throw new Error('Usuario no encontrado')

  }

}

/* =====================================================
   REGISTER
===================================================== */

export const register = async (userData: RegisterData): Promise<User> => {

  try {

    const newUser: User = {
      name: userData.name!,
      email: userData.email!,
      phone: userData.phone!,
      active: true
    }

    const savedUser = await saveUser(newUser)

    localStorage.setItem('user', JSON.stringify(savedUser))
    localStorage.setItem('isLoggedIn', 'true')

    return savedUser

  } catch (error) {

    console.error('Error en registro:', error)
    throw new Error('Error al registrar usuario')

  }

}

/* =====================================================
   LOGOUT
===================================================== */

export const logout = (): void => {

  localStorage.removeItem('user')
  localStorage.removeItem('isLoggedIn')

}

/* =====================================================
   AUTH STATE
===================================================== */

export const isAuthenticated = (): boolean => {

  return localStorage.getItem('isLoggedIn') === 'true'

}

/* =====================================================
   CURRENT USER
===================================================== */

export const getCurrentUser = (): User | null => {

  try {

    const userStr = localStorage.getItem('user')

    if (!userStr) return null

    return JSON.parse(userStr)

  } catch (error) {

    console.error('Error obteniendo usuario actual:', error)
    return null

  }

}

/* =====================================================
   REFRESH USER
===================================================== */

export const refreshCurrentUser = async (): Promise<User | null> => {

  const currentUser = getCurrentUser()

  if (!currentUser || !currentUser.email) return null

  try {

    const updatedUser = await getUserByEmail(currentUser.email)

    localStorage.setItem('user', JSON.stringify(updatedUser))

    return updatedUser

  } catch (error) {

    console.error('Error refrescando usuario:', error)
    return currentUser

  }

}

/* =====================================================
   EXPORT TYPES
===================================================== */

export type { User, LoginCredentials, RegisterData }