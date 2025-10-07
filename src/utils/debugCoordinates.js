/**
 * Utilidad para debuggear problemas de coordenadas
 * Ejecutar en la consola del navegador para ver qué se está enviando exactamente
 */

const debugCoordinates = {
  
  // Probar envío de alerta con logs detallados
  async testAlert() {
    console.log('🔍 === DEBUG DE COORDENADAS ===');
    
    // Simular coordenadas de Google Maps
    const googleMapsCoords = { lat: 4.7110, lng: -74.0721 }; // Bogotá
    console.log('📍 Coordenadas de Google Maps:', googleMapsCoords);
    
    // Mapear al formato backend
    const backendCoords = {
      latitud: googleMapsCoords.lat,
      longitud: googleMapsCoords.lng
    };
    console.log('📍 Coordenadas mapeadas para backend:', backendCoords);
    
    // Estructura completa de alerta
    const alert = {
      userId: 1, // Cambiar por tu ID real
      message: 'Alerta de prueba - debugging coordenadas',
      alertType: 'TEST',
      timestamp: new Date().toISOString(),
      location: backendCoords
    };
    
    console.log('🚨 Estructura completa de alerta:', JSON.stringify(alert, null, 2));
    
    // Mostrar como JSON raw
    console.log('📤 JSON que se enviará:', JSON.stringify(alert));
    
    try {
      // Intentar envío real
      const { saveAlert } = await import('./src/services/springBootServices.js');
      console.log('📤 Enviando a saveAlert...');
      const result = await saveAlert(alert);
      console.log('✅ Resultado exitoso:', result);
      
    } catch (error) {
      console.error('❌ Error en envío:', error);
      console.error('❌ Detalles del error:', error.response?.data || error.message);
    }
  },
  
  // Verificar qué formato espera el backend
  checkBackendFormat() {
    console.log('🔍 === FORMATOS ESPERADOS ===');
    
    console.log('❌ Formato incorrecto (Google Maps):');
    console.log(JSON.stringify({
      latitude: 4.7110,
      longitude: -74.0721
    }, null, 2));
    
    console.log('✅ Formato correcto (Backend):');
    console.log(JSON.stringify({
      latitud: 4.7110,
      longitud: -74.0721
    }, null, 2));
  },
  
  // Ver qué se está enviando actualmente
  async inspectCurrentImplementation() {
    console.log('🔍 === INSPECCIÓN DE IMPLEMENTACIÓN ACTUAL ===');
    
    try {
      const { sendEmergencyAlertFromMap } = await import('./src/services/emergencyService.js');
      
      // Mock de coordenadas
      const mockCoords = { lat: 4.7110, lng: -74.0721 };
      
      console.log('📍 Probando sendEmergencyAlertFromMap con:', mockCoords);
      
      // Esta llamada debería mostrar los logs internos
      await sendEmergencyAlertFromMap(1, 'Prueba de inspección', mockCoords, 'TEST');
      
    } catch (error) {
      console.error('Error en inspección:', error);
    }
  }
};

// Hacer disponible globalmente
window.debugCoordinates = debugCoordinates;

console.log('🔧 Debug de coordenadas cargado. Usa:');
console.log('   debugCoordinates.checkBackendFormat()');
console.log('   debugCoordinates.testAlert()');
console.log('   debugCoordinates.inspectCurrentImplementation()');