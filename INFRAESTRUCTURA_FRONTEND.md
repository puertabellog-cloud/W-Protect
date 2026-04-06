# Documentacion Tecnica de Infraestructura Frontend

## 1. Resumen Ejecutivo
W-Protect Frontend es una aplicacion SPA hibrida (web y movil) construida con React + Ionic y empaquetada con Vite. Se integra con backend Spring Boot mediante Axios y puede desplegarse como sitio estatico en Nginx con Docker.

## 2. Stack Tecnologico
- Framework UI: React 19 + Ionic React 8
- Lenguaje: TypeScript
- Bundler y build: Vite 5
- Cliente HTTP: Axios
- Plataforma movil: Capacitor 7 (Android habilitado)
- Testing unitario: Vitest + jsdom
- Testing E2E: Cypress
- Integracion de correo: EmailJS

## 3. Estructura de Ejecucion
### 3.1 Entrada de aplicacion
- index.html monta el root de la SPA
- src/main.tsx inicializa React, Ionic CSS y tema global
- src/App.tsx controla rutas, tabs, autenticacion visual y modo ADMIN/USER

### 3.2 Capa de integracion API
- src/config/api.ts define base URL, endpoints y timeout
- src/api/apiClient.ts centraliza cliente Axios, interceptores y politicas de seguridad
- src/services/* contiene servicios de negocio (usuarios, alertas, sesiones, etc.)

### 3.3 Capa de sesion
- src/services/sessionService.ts maneja:
  - Persistencia de sesion en localStorage
  - Evento global de cambio de sesion
  - Limpieza atomica de estado de autenticacion
  - Normalizacion de perfil ADMIN/USER

## 4. Configuracion de Entornos
### 4.1 Variables relevantes
- VITE_API_BASE_URL: URL base del backend
- VITE_ENV: bandera de entorno (development/production)

### 4.2 Resolucion de API
- API_URL se toma de VITE_API_BASE_URL
- Prefijo funcional de endpoints: /w/*
- Timeout global HTTP: 10000 ms

## 5. Seguridad en Integracion HTTP
En src/api/apiClient.ts:
- Las rutas protegidas /w/* adjuntan headers de sesion:
  - X-User-Id
  - X-Device-Id
- Rutas publicas (registro/login) no requieren headers de sesion
- Manejo global de errores:
  - 401 en rutas protegidas: limpia sesion y redirige a /
  - 403: dispara evento global para mostrar toast de permisos

## 6. Enrutamiento y Control de Acceso
En src/App.tsx:
- Modo ADMIN:
  - Tabs administrativas (biblioteca, alertas, usuarios, perfil admin)
- Modo USER:
  - Tabs de inicio, contactos, recursos y perfil
- Sin sesion/acceso:
  - Renderiza AuthWrapper

La app reevalua acceso con evento SESSION_CHANGED_EVENT y storage events para sincronizar UI y sesion.

## 7. Build y Empaquetado
### 7.1 Scripts principales
- npm run dev: entorno local con Vite
- npm run build: TypeScript + build de produccion
- npm run preview: preview del build
- npm run test.unit: pruebas unitarias
- npm run test.e2e: pruebas end-to-end
- npm run lint: analisis estatico

### 7.2 Artefacto de salida
- Carpeta dist/ con estaticos optimizados

## 8. Despliegue con Docker
Archivo: dockerfile

Arquitectura de imagen en dos etapas:
1. Builder (node:20-alpine)
- Instala dependencias
- Ejecuta npm run build

2. Runtime (nginx:stable-alpine)
- Copia dist/ a /usr/share/nginx/html
- Expone puerto 80
- Ejecuta Nginx en foreground

## 9. Infraestructura Movil (Capacitor)
Archivo: capacitor.config.ts

- appId: com.wprotect.app
- appName: W-Protect
- webDir: dist
- Plugins habilitados:
  - Geolocation
  - Contacts
- Android:
  - allowMixedContent: true
  - captureInput: true

Proyecto nativo Android disponible en carpeta android/.

## 10. Pruebas y Calidad
### 10.1 Unit testing
- Vitest configurado en vite.config.ts
- Entorno de pruebas: jsdom

### 10.2 E2E
- Cypress configurado con baseUrl http://localhost:5173

### 10.3 Lint
- ESLint para estandares de codigo y hooks React

## 11. Dependencias Criticas de Operacion
- Backend Spring Boot disponible en VITE_API_BASE_URL
- Endpoints /w/* consistentes con contratos esperados por frontend
- Login por password operativo en POST /w/users/login
- Respuesta de login debe incluir id, deviceId y profile

## 12. Riesgos Tecnicos Identificados
- Tamaño de bundle principal elevado (advertencias de chunks > 500 kB)
- Dependencia fuerte de localStorage para estado de acceso
- Posible drift entre comentarios de endpoints y metodos reales de backend

## 13. Recomendaciones
1. Definir contrato OpenAPI para sincronizar frontend-backend
2. Implementar code splitting por rutas para reducir bundle inicial
3. Estandarizar observabilidad (request-id y trazas entre capas)
4. Fortalecer validaciones de sesion y expiracion centralizada
5. Formalizar matriz de entornos (dev/qa/prod) con variables versionadas

## 14. Referencias de Archivos Clave
- package.json
- vite.config.ts
- src/config/api.ts
- src/api/apiClient.ts
- src/services/sessionService.ts
- src/App.tsx
- capacitor.config.ts
- cypress.config.ts
- dockerfile
