/**
 * Servicio de Tracking de Ubicación
 * Envía la ubicación cada 5 segundos al backend
 * Compatible con iOS y Android
 */

import { Geolocation } from '@capacitor/geolocation';
import { saveLocationTracking } from './springBootServices';
import { Capacitor } from '@capacitor/core';

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
      console.log('📱 Platform:', Capacitor.getPlatform());
      
      this.deviceId = deviceId;
      this.onLocationUpdate = callbacks?.onLocationUpdate;
      this.onError = callbacks?.onError;
      
      // Verificar permisos dependiendo de la plataforma
      await this.checkPermissions();
      
      console.log('✅ Permisos de ubicación verificados');
      
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
   * Verificar permisos según la plataforma
   */
  private async checkPermissions(): Promise<void> {
    const platform = Capacitor.getPlatform();
    
    if (platform === 'web') {
      // En web, usar API del navegador
      if (!navigator.geolocation) {
        throw new Error('Geolocalización no soportada en este navegador');
      }
      
      // Verificar permisos en web
      if ('permissions' in navigator) {
        try {
          const permission = await navigator.permissions.query({ name: 'geolocation' as PermissionName });
          if (permission.state === 'denied') {
            throw new Error('Permisos de ubicación denegados en el navegador');
          }
        } catch (err) {
          console.log('API de permisos no disponible, continuando...');
        }
      }
      
    } else {
      // En iOS/Android, usar Capacitor
      try {
        const permissions = await Geolocation.checkPermissions();
        
        if (permissions.location !== 'granted') {
          console.log('🔐 Solicitando permisos de ubicación...');
          const requestResult = await Geolocation.requestPermissions();
          
          if (requestResult.location !== 'granted') {
            throw new Error('Permisos de ubicación denegados');
          }
        }
      } catch (error) {
        console.log('❌ Error con Capacitor Geolocation, usando API nativa del navegador');
        // Fallback a API nativa si Capacitor falla
        if (!navigator.geolocation) {
          throw new Error('Geolocalización no disponible');
        }
      }
    }
  }

  /**
   * Obtener ubicación actual y enviar al backend
   */
  private async getLocationAndSend(): Promise<void> {
    try {
      console.log('📍 Obteniendo ubicación...');
      
      const position = await this.getCurrentPosition();

      const locationData: LocationTrackingData = {
        deviceId: this.deviceId!,
        latitud: position.lat.toString(),
        longitud: position.lng.toString(),
        timestamp: new Date().toISOString(),
        accuracy: position.accuracy || undefined
      };

      console.log('📍 Ubicación obtenida:', {
        lat: position.lat.toFixed(6),
        lng: position.lng.toFixed(6),
        accuracy: `${position.accuracy}m`,
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
   * Obtener posición actual usando la mejor API disponible
   */
  private async getCurrentPosition(): Promise<{lat: number, lng: number, accuracy: number}> {
    const platform = Capacitor.getPlatform();
    
    // Intentar primero con API nativa del navegador (más confiable en iOS)
    if (navigator.geolocation) {
      try {
        console.log('📍 Usando API nativa del navegador...');
        
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(
            resolve,
            reject,
            {
              enableHighAccuracy: true,
              timeout: 8000,
              maximumAge: 5000
            }
          );
        });

        return {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy || 0
        };
        
      } catch (error) {
        console.log('❌ Error con API nativa, intentando Capacitor...');
      }
    }
    
    // Fallback a Capacitor (solo si API nativa falla)
    if (platform !== 'web') {
      try {
        console.log('📍 Usando Capacitor Geolocation...');
        
        const position = await Geolocation.getCurrentPosition({
          enableHighAccuracy: true,
          timeout: 8000,
          maximumAge: 5000
        });

        return {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy || 0
        };
        
      } catch (error) {
        console.error('❌ Error con Capacitor Geolocation:', error);
        throw new Error('No se pudo obtener ubicación con ningún método');
      }
    }
    
    throw new Error('Geolocalización no disponible');
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
      updateInterval: this.UPDATE_INTERVAL,
      platform: Capacitor.getPlatform()
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