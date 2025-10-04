/**
 * Herramientas de Testing para verificar la conexión con el backend
 */

import { getUserByDeviceId, saveUser, getContactsByUserId, saveContact } from '../services/springBootServices';
import { User, Contact } from '../types';

/**
 * Probar conexión básica con el backend
 */
export const testBackendConnection = async () => {
  console.log('🧪 INICIANDO PRUEBAS DE CONEXIÓN...');
  
  try {
    // Test 1: Verificar que el servidor responde
    console.log('📡 Test 1: Verificando servidor...');
    const response = await fetch('https://goldfish-app-h7qp9.ondigitalocean.app');
    console.log('✅ Servidor responde:', response.status);
    
    return {
      serverOnline: response.ok,
      serverStatus: response.status
    };
  } catch (error) {
    console.error('❌ Error de conexión:', error);
    return {
      serverOnline: false,
      error: error
    };
  }
};

/**
 * Probar operaciones de usuario
 */
export const testUserOperations = async (deviceId: string) => {
  console.log('🧪 PROBANDO OPERACIONES DE USUARIO...');
  
  try {
    // Test 1: Intentar obtener usuario por deviceId
    console.log('📱 Test 1: Buscando usuario por deviceId:', deviceId);
    
    let user: User;
    try {
      user = await getUserByDeviceId(deviceId);
      console.log('✅ Usuario encontrado:', user);
    } catch (error) {
      console.log('ℹ️ Usuario no existe, creando uno nuevo...');
      
      // Test 2: Crear usuario nuevo
      const newUser: User = {
        name: 'Usuario de Prueba',
        email: 'test@wprotect.com',
        phone: '+1234567890',
        deviceId: deviceId,
        active: true,
        mensaje: 'Usuario creado para pruebas'
      };
      
      console.log('💾 Test 2: Creando usuario:', newUser);
      user = await saveUser(newUser);
      console.log('✅ Usuario creado exitosamente:', user);
    }
    
    return {
      success: true,
      user: user,
      operations: ['get', 'save']
    };
    
  } catch (error) {
    console.error('❌ Error en operaciones de usuario:', error);
    return {
      success: false,
      error: error
    };
  }
};

/**
 * Probar operaciones de contactos
 */
export const testContactOperations = async (userId: number) => {
  console.log('🧪 PROBANDO OPERACIONES DE CONTACTOS...');
  
  try {
    // Test 1: Obtener contactos existentes
    console.log('👥 Test 1: Obteniendo contactos para userId:', userId);
    const existingContacts = await getContactsByUserId(userId);
    console.log('✅ Contactos existentes:', existingContacts);
    
    // Test 2: Crear contacto de prueba
    const testContact: Contact = {
      wuserId: userId,
      name: 'Contacto de Prueba',
      phone: '+0987654321',
      email: 'contacto@test.com',
      relationship: 'Familiar'
    };
    
    console.log('💾 Test 2: Creando contacto:', testContact);
    const savedContact = await saveContact(testContact);
    console.log('✅ Contacto guardado:', savedContact);
    
    // Test 3: Verificar que se guardó
    console.log('🔍 Test 3: Verificando contacto guardado...');
    const updatedContacts = await getContactsByUserId(userId);
    console.log('✅ Contactos actualizados:', updatedContacts);
    
    return {
      success: true,
      initialContacts: existingContacts,
      savedContact: savedContact,
      finalContacts: updatedContacts,
      operations: ['get', 'save', 'verify']
    };
    
  } catch (error) {
    console.error('❌ Error en operaciones de contactos:', error);
    return {
      success: false,
      error: error
    };
  }
};

/**
 * Ejecutar todas las pruebas
 */
export const runFullTest = async (deviceId: string) => {
  console.log('🚀 EJECUTANDO PRUEBAS COMPLETAS...');
  console.log('================================================');
  
  const results = {
    timestamp: new Date().toISOString(),
    deviceId: deviceId,
    tests: {} as any
  };
  
  // Test 1: Conexión
  console.log('\n1️⃣ PROBANDO CONEXIÓN...');
  results.tests.connection = await testBackendConnection();
  
  if (!results.tests.connection.serverOnline) {
    console.log('❌ Servidor no disponible. Abortando pruebas.');
    return results;
  }
  
  // Test 2: Operaciones de usuario
  console.log('\n2️⃣ PROBANDO USUARIOS...');
  results.tests.user = await testUserOperations(deviceId);
  
  if (!results.tests.user.success) {
    console.log('❌ Fallo en operaciones de usuario. Abortando pruebas de contactos.');
    return results;
  }
  
  // Test 3: Operaciones de contactos
  console.log('\n3️⃣ PROBANDO CONTACTOS...');
  const userId = results.tests.user.user.id;
  if (userId) {
    results.tests.contacts = await testContactOperations(userId);
  } else {
    console.log('❌ No se pudo obtener userId. Saltando pruebas de contactos.');
  }
  
  // Resumen
  console.log('\n📊 RESUMEN DE PRUEBAS:');
  console.log('================================================');
  console.log('✅ Conexión:', results.tests.connection.serverOnline ? 'OK' : 'FALLO');
  console.log('✅ Usuarios:', results.tests.user.success ? 'OK' : 'FALLO');
  console.log('✅ Contactos:', results.tests.contacts?.success ? 'OK' : 'FALLO');
  console.log('================================================');
  
  return results;
};

/**
 * Función para usar en la consola del navegador
 */
(window as any).testWProtect = {
  connection: testBackendConnection,
  users: testUserOperations,
  contacts: testContactOperations,
  full: runFullTest,
  
  // Función rápida para probar todo
  quickTest: async () => {
    const deviceId = 'test-device-' + Date.now();
    return await runFullTest(deviceId);
  }
};