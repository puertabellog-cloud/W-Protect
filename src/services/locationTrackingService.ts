/**
 * Servicio de Tracking de Ubicación
 * Envía la ubicación cada 5 segundos al backend
 */

import { Geolocation } from '@capacitor/geolocation';
import { saveLocationTracking } from './springBootServices';

export interface LocationTrackingData {
  deviceId: string;
  latitud: string;
  longitud: string;
  timestamp: string;
  accuracy?: number;
}

class LocationTrackingService {
  private intervalId: NodeJS.Timeout | null = null;
  private isRunning: boolean = false;
  private deviceId: string | null = null;
  
  // Configuración
  private readonly UPDATE_INTERVAL = 5000; // 5 segundos
  
  // Callbacks
  private onLocationUpdate?: (data: LocationTrackingData) => void;
  private onError?: (error: string) => void;

  /**
   * Inicializar tracking de ubicación
   */
  async start(deviceId: string, callbacks?: {
    onLocationUpdate?: (data: LocationTrackingData) => void;
    onError?: (error: string) => void;
  }) {
    try {
      console.log('🌍 Iniciando tracking de ubicación cada 5 segundos...');
      console.log('📱 Device ID:', deviceId);
      
      this.deviceId = deviceId;
      this.onLocationUpdate = callbacks?.onLocationUpdate;
      this.onError = callbacks?.onError;
      
      // Verificar permisos
      const permissions = await Geolocation.checkPermissions();
      
      if (permissions.location !== 'granted') {
        console.log('🔐 Solicitando permisos de ubicación...');
        const requestResult = await Geolocation.requestPermissions();
        
        if (requestResult.location !== 'granted') {
          throw new Error('Permisos de ubicación denegados');
        }
      }
      
      console.log('✅ Permisos de ubicación concedidos');
      
      // Obtener ubicación inicial
      await this.getLocationAndSend();
      
      // Iniciar envío cada 5 segundos
      this.startPeriodicUpdates();
      
      return true;
      
    } catch (error) {
      console.error('❌ Error iniciando tracking:', error);
      this.onError?.(error instanceof Error ? error.message : 'Error desconocido');
      throw error;
    }
  }

  /**
   * Obtener ubicación actual y enviar al backend
   */
  private async getLocationAndSend(): Promise<void> {
    try {
      console.log('📍 Obteniendo ubicación...');
      
      const position = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 8000,
        maximumAge: 5000
      });

      const locationData: LocationTrackingData = {
        deviceId: this.deviceId!,
        latitud: position.coords.latitude.toString(),
        longitud: position.coords.longitude.toString(),
        timestamp: new Date().toISOString(),
        accuracy: position.coords.accuracy || undefined
      };

      console.log('📍 Ubicación obtenida:', {
        lat: position.coords.latitude.toFixed(6),
        lng: position.coords.longitude.toFixed(6),
        accuracy: `${position.coords.accuracy}m`,
        time: new Date().toLocaleTimeString()
      });

      // Enviar al backend
      await saveLocationTracking(locationData);
      
      // Notificar callback
      this.onLocationUpdate?.(locationData);
      
    } catch (error) {
      console.error('❌ Error obteniendo/enviando ubicación:', error);
      this.onError?.(`Error de ubicación: ${error}`);
    }
  }

  /**
   * Iniciar envío periódico cada 5 segundos
   */
  private startPeriodicUpdates() {
    if (this.isRunning) {
      console.log('⚠️ El tracking ya está corriendo');
      return;
    }

    console.log('🔄 Iniciando envío automático cada 5 segundos...');
    
    this.intervalId = setInterval(async () => {
      await this.getLocationAndSend();
    }, this.UPDATE_INTERVAL);
    
    this.isRunning = true;
  }

  /**
   * Detener tracking
   */
  stop() {
    console.log('🛑 Deteniendo tracking de ubicación');
    
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    
    this.isRunning = false;
    this.deviceId = null;
  }

  /**
   * Obtener estado actual
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      deviceId: this.deviceId,
      updateInterval: this.UPDATE_INTERVAL
    };
  }
}

// Singleton del servicio
export const locationTrackingService = new LocationTrackingService();

// Funciones principales
export const startLocationTracking = (deviceId: string, callbacks?: {
  onLocationUpdate?: (data: LocationTrackingData) => void;
  onError?: (error: string) => void;
}) => locationTrackingService.start(deviceId, callbacks);

export const stopLocationTracking = () => locationTrackingService.stop();

export const getTrackingStatus = () => locationTrackingService.getStatus();