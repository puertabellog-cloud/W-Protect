/**
 * Script de prueba específico para contactos de emergencia
 * Ejecutar en la consola del navegador
 */

const testContactos = {
  // Probar guardado de contacto
  async probarGuardado() {
    console.log('🧪 Iniciando prueba de guardado de contactos...');
    
    try {
      // Obtener deviceId actual
      const deviceId = localStorage.getItem('device_id') || 'test-device-123';
      console.log('📱 Device ID:', deviceId);
      
      // Obtener usuario actual
      const { getUserByDeviceId } = await import('./src/services/springBootServices.js');
      const user = await getUserByDeviceId(deviceId);
      console.log('👤 Usuario obtenido:', user);
      
      // Crear contacto de prueba
      const { saveContact } = await import('./src/services/springBootServices.js');
      const contactoPrueba = {
        name: 'María Test',
        phone: '+57987654321',
        wuserId: user.id,
        email: 'maria@test.com'
      };
      
      console.log('📝 Guardando contacto:', contactoPrueba);
      const contactoGuardado = await saveContact(contactoPrueba);
      console.log('✅ Contacto guardado exitosamente:', contactoGuardado);
      
      return contactoGuardado;
      
    } catch (error) {
      console.error('❌ Error en prueba de contactos:', error);
      throw error;
    }
  },
  
  // Probar obtener contactos
  async probarObtener() {
    console.log('🔍 Probando obtención de contactos...');
    
    try {
      const deviceId = localStorage.getItem('device_id') || 'test-device-123';
      const { getUserByDeviceId, getContactsByUserId } = await import('./src/services/springBootServices.js');
      
      const user = await getUserByDeviceId(deviceId);
      const contactos = await getContactsByUserId(user.id);
      
      console.log(`📋 Contactos obtenidos (${contactos.length}):`, contactos);
      return contactos;
      
    } catch (error) {
      console.error('❌ Error obteniendo contactos:', error);
      throw error;
    }
  },
  
  // Probar eliminar contacto
  async probarEliminar(contactoId) {
    console.log('🗑️ Probando eliminación de contacto:', contactoId);
    
    try {
      const { deleteContact } = await import('./src/services/springBootServices.js');
      await deleteContact(contactoId);
      console.log('✅ Contacto eliminado exitosamente');
      
    } catch (error) {
      console.error('❌ Error eliminando contacto:', error);
      throw error;
    }
  },
  
  // Ejecutar todas las pruebas
  async ejecutarTodasLasPruebas() {
    console.log('🚀 Ejecutando suite completa de pruebas de contactos...');
    
    try {
      // 1. Probar guardado
      const contactoNuevo = await this.probarGuardado();
      
      // 2. Probar obtención
      await this.probarObtener();
      
      // 3. Probar eliminación
      if (contactoNuevo.id) {
        await this.probarEliminar(contactoNuevo.id);
      }
      
      console.log('🎉 Todas las pruebas de contactos completadas exitosamente!');
      
    } catch (error) {
      console.error('💥 Error en suite de pruebas:', error);
    }
  }
};

// Hacer disponible globalmente
window.testContactos = testContactos;

console.log('📱 Script de prueba de contactos cargado. Usa:');
console.log('   testContactos.probarGuardado()');
console.log('   testContactos.probarObtener()');
console.log('   testContactos.ejecutarTodasLasPruebas()');