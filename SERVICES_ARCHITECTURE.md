# 📁 Estructura de Servicios Organizados - W-Protect

## 🎯 **Nueva Arquitectura Limpia**

La estructura ha sido reorganizada siguiendo buenas prácticas para eliminar duplicaciones y mantener el código limpio.

### 📂 **Estructura de Archivos:**

```
src/
├── types/
│   └── index.ts                 # ✅ Tipos centralizados
├── config/
│   └── api.ts                   # ✅ Configuración de endpoints
├── api/
│   └── client.ts                # ✅ Cliente HTTP (solo configuración)
└── services/
    ├── springBootServices.ts    # ✅ Servicios principales (CORE)
    ├── userService.ts           # ✅ Wrapper de conveniencia para usuarios
    ├── emergencyService.ts      # ✅ Wrapper de conveniencia para emergencias
    └── authService.ts           # ✅ Wrapper de conveniencia para autenticación
```

## 🔧 **Cómo Funciona:**

### **1. Tipos Centralizados (`src/types/index.ts`)**
- ✅ **Una sola fuente de verdad** para todas las interfaces
- ✅ **Interfaces exactas** que coinciden con tu backend Spring Boot
- ✅ **Alias de compatibilidad** para código existente

```typescript
import { User, Contact, Alert } from '../types';
```

### **2. Servicios Principales (`springBootServices.ts`)**
- ✅ **Funciones principales** que llaman directamente a tu API
- ✅ **Un endpoint = una función** (mapeo directo)
- ✅ **No duplicación** de lógica

```typescript
// Funciones principales que hacen las llamadas HTTP reales
export const getUserByDeviceId = async (deviceId: string): Promise<User>
export const saveUser = async (user: User): Promise<User>
export const getContactsByUserId = async (userId: number): Promise<Contact[]>
```

### **3. Servicios de Conveniencia (wrappers)**
- ✅ **Funciones específicas** por dominio (user, emergency, auth)
- ✅ **Alias y shortcuts** para facilitar el uso
- ✅ **Re-exportan** funciones principales sin duplicar código

```typescript
// userService.ts - Funciones de conveniencia para usuarios
export const getProfileByDevice = getUserByDeviceId; // Alias
export const createUser = async (userData: RegisterData) => { /* lógica específica */ }

// emergencyService.ts - Funciones de conveniencia para emergencias  
export const triggerPanicAlert = async (userId: number) => { /* lógica específica */ }
```

## 🚀 **Cómo Usar:**

### **Opción 1: Usar servicios principales (recomendado)**
```typescript
import { getUserByDeviceId, saveUser } from '../services/springBootServices';

const user = await getUserByDeviceId('device123');
const savedUser = await saveUser(userData);
```

### **Opción 2: Usar servicios de conveniencia**
```typescript
import { getProfileByDevice, createUser } from '../services/userService';
import { triggerPanicAlert } from '../services/emergencyService';
import { login, register } from '../services/authService';

const user = await getProfileByDevice('device123');
const newUser = await createUser(registerData);
```

### **Opción 3: Compatibilidad con código existente**
```typescript
// Estas funciones siguen funcionando por compatibilidad
import { getProfile, updateProfile } from '../api/client';
```

## 📋 **Endpoints Mapeados:**

| **Endpoint Spring Boot** | **Función Principal** | **Wrappers Disponibles** |
|---------------------------|----------------------|---------------------------|
| `GET /w/users/device/{id}` | `getUserByDeviceId()` | `getProfileByDevice()`, `getProfile()` |
| `GET /w/users/email/{email}` | `getUserByEmail()` | `findUserByEmail()` |
| `PUT /w/users/save` | `saveUser()` | `saveProfile()`, `updateProfile()` |
| `GET /w/contacts/user/{userId}` | `getContactsByUserId()` | `getEmergencyContacts()` |
| `PUT /w/contacts/save` | `saveContact()` | `addEmergencyContact()` |
| `DELETE /w/contacts/delete/{id}` | `deleteContact()` | `deleteEmergencyContact()` |
| `PUT /w/alerts/save` | `saveAlert()` | `saveEmergencyAlert()` |

## 💡 **Beneficios de esta Estructura:**

1. ✅ **Sin duplicación** de código o interfaces
2. ✅ **Fácil mantenimiento** - cambios en un solo lugar
3. ✅ **Flexibilidad** - usa el nivel de abstracción que prefieras
4. ✅ **Compatibilidad** - código existente sigue funcionando
5. ✅ **Tipado fuerte** - TypeScript en toda la aplicación
6. ✅ **Fácil testing** - funciones pequeñas y específicas

## 🔄 **Migración Gradual:**

Puedes migrar tu código gradualmente:

```typescript
// Antes:
import { getProfile } from '../api/client';

// Después (opción 1):
import { getUserByDeviceId } from '../services/springBootServices';

// Después (opción 2):  
import { getProfileByDevice } from '../services/userService';
```

## 🎯 **Recomendaciones:**

- **Para nuevos componentes**: Usa `springBootServices.ts` directamente
- **Para funcionalidad específica**: Usa los wrappers (`userService`, `emergencyService`)
- **Para autenticación**: Usa `authService.ts`
- **Para compatibilidad**: Las funciones viejas siguen funcionando

Esta estructura te permite tener **código limpio, organizado y mantenible** 🚀