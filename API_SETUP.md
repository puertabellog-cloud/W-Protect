# W-Protect Frontend - Configuración de API

## 🌐 Conexión con Backend

Este documento explica cómo está configurada la conexión entre el frontend y el backend de W-Protect.

### URL del Backend
```
https://goldfish-app-h7qp9.ondigitalocean.app/
```

## 📁 Estructura de Archivos

### Variables de Entorno
- **`.env`** - Configuración de producción
- **`.env.development`** - Configuración de desarrollo

### Configuración
- **`src/config/api.ts`** - Configuración central de la API
- **`src/api/client.ts`** - Cliente HTTP con Axios configurado

### Servicios
- **`src/services/authService.ts`** - Autenticación de usuarios
- **`src/services/userService.ts`** - Gestión de perfiles de usuario
- **`src/services/emergencyService.ts`** - Manejo de emergencias

## 🚀 Cómo Usar

### 1. Importar servicios en tus componentes:

```typescript
import { login, register } from '../services/authService';
import { getUserProfile, updateUserProfile } from '../services/userService';
import { triggerEmergencyAlert } from '../services/emergencyService';
```

### 2. Ejemplo de uso en un componente:

```typescript
// Autenticación
const handleLogin = async (email: string, password: string) => {
  try {
    const result = await login({ email, password });
    console.log('Usuario autenticado:', result.user);
  } catch (error) {
    console.error('Error de login:', error);
  }
};

// Actualizar perfil
const handleUpdateProfile = async (profileData) => {
  try {
    const updatedProfile = await updateUserProfile(profileData);
    console.log('Perfil actualizado:', updatedProfile);
  } catch (error) {
    console.error('Error al actualizar perfil:', error);
  }
};
```

### 3. Para hacer llamadas directas al API:

```typescript
import { apiClient } from '../api/client';

// Ejemplo de llamada personalizada
const customApiCall = async () => {
  try {
    const response = await apiClient.get('/custom-endpoint');
    return response.data;
  } catch (error) {
    console.error('Error en llamada personalizada:', error);
    throw error;
  }
};
```

## 🔧 Configuración Avanzada

### Interceptores de Axios

El cliente HTTP está configurado con interceptores que:

1. **Request Interceptor**: Agrega automáticamente el token de autenticación
2. **Response Interceptor**: Maneja errores globalmente (ej: redirección en 401)

### Manejo de Tokens

Los tokens se almacenan automáticamente en `localStorage` y se incluyen en todas las peticiones.

### Timeout

Las peticiones tienen un timeout de 10 segundos configurado por defecto.

## 🌍 Cambiar Entorno

Para cambiar entre desarrollo y producción, modifica las variables en los archivos `.env`:

```bash
# Desarrollo
VITE_API_BASE_URL=http://localhost:3000

# Producción  
VITE_API_BASE_URL=https://goldfish-app-h7qp9.ondigitalocean.app
```

## 📝 Agregar Nuevos Endpoints

1. Agrega el endpoint en `src/config/api.ts`:
```typescript
export const API_ENDPOINTS = {
  // ... endpoints existentes
  newFeature: {
    list: '/new-feature',
    create: '/new-feature',
    update: '/new-feature/:id',
  }
};
```

2. Crea un nuevo servicio en `src/services/`:
```typescript
// src/services/newFeatureService.ts
import { apiClient } from '../api/client';
import { API_ENDPOINTS } from '../config/api';

export const getNewFeatureList = async () => {
  const response = await apiClient.get(API_ENDPOINTS.newFeature.list);
  return response.data;
};
```

## 🔍 Debug y Logs

El sistema incluye logs automáticos para todas las peticiones. Revisa la consola del navegador para ver:
- 🚀 Peticiones salientes
- ✅ Respuestas exitosas  
- ❌ Errores de API

---

**Nota**: Asegúrate de que el backend esté funcionando en la URL configurada antes de hacer peticiones desde el frontend.