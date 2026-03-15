import { Geolocation } from '@capacitor/geolocation';
import { Capacitor } from '@capacitor/core';
import { apiClient } from '../api/apiClient';

export interface LocationTrackingData {
  latitud: number;
  longitud: number;
  accuracy: number | null;
  mensaje: string;
}

let trackingInterval: NodeJS.Timeout | null = null;

class LocationTrackingService {
  private isRunning: boolean = false;
  private alertId: number | null = null;

  private readonly UPDATE_INTERVAL = 30000; // 30 segundos

  private onLocationUpdate?: (data: LocationTrackingData) => void;
  private onError?: (error: string) => void;
  private onAlertExpired?: () => void;

  async start(
    alertId: number,
    callbacks?: {
      onLocationUpdate?: (data: LocationTrackingData) => void;
      onError?: (error: string) => void;
      onAlertExpired?: () => void;
    }
  ) {
    // Guard: si ya hay intervalo, no iniciar otro (React Strict Mode safe)
    if (trackingInterval !== null) {
      console.warn("⚠️ Tracking ya activo - Evitando intervalo duplicado");
      return;
    }

    // Si hay tracking activo para otra alerta, detenerlo antes de iniciar
    if (this.isRunning && this.alertId !== alertId) {
      console.log('🔄 Cambio de alertId detectado. Deteniendo tracking anterior:', this.alertId);
      this.stop('cambio_alert_id');
    }

    this.alertId = alertId;
    this.onLocationUpdate = callbacks?.onLocationUpdate;
    this.onError = callbacks?.onError;
    this.onAlertExpired = callbacks?.onAlertExpired;

    await this.checkPermissions();
    
    // Primer envío inmediato
    await this.getLocationAndSend();
    
    // Iniciar updates periódicos
    this.startPeriodicUpdates();
    this.isRunning = true;
    
    console.log('🟢 Started tracking alertId:', alertId);
  }

  stop(reason: string = 'manual') {
    if (trackingInterval) {
      clearInterval(trackingInterval);
      trackingInterval = null;
    }

    if (this.isRunning) {
      console.log('🔴 Tracking stopped for alertId:', this.alertId, 'reason=', reason);
    }

    this.isRunning = false;
    this.alertId = null;
  }

  private async checkPermissions() {
    if (!navigator.geolocation) {
      throw new Error('Geolocalización no disponible');
    }
  }

  private async getLocationAndSend() {
    if (!this.alertId) return;

    try {
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

      // Payload estandarizado para backend W-Protect
      const locationData: LocationTrackingData = {
        latitud: position.coords.latitude,
        longitud: position.coords.longitude,
        accuracy: position.coords.accuracy || null,
        mensaje: "Ubicación de seguimiento automático"
      };

      const response = await apiClient.post(
        `/w/alerts/${this.alertId}/locations`,
        locationData
      );

      // Si responde 400 o 404, detener tracking inmediatamente y marcar como expirada
      if (response.status === 400 || response.status === 404) {
        console.warn('❌ алerta expired/closed (400/404) - Stopping tracking');
        this.stop('alert_expired');
        this.onAlertExpired?.();
        return;
      }

      if (response.status === 401) {
        console.warn('❌ Token inválido. Redirigiendo al login.');
        this.onError?.('Token inválido. Por favor, inicia sesión nuevamente.');
        return;
      }

      if (!response.status.toString().startsWith('2')) {
        console.error('❌ Error inesperado al enviar ubicación:', response.status, response.data);
        this.onError?.('Error inesperado al enviar ubicación.');
        return;
      }

      console.log('📍 Location sent OK:', {
        alertId: this.alertId,
        lat: locationData.latitud.toFixed(6),
        lng: locationData.longitud.toFixed(6),
        accuracy: locationData.accuracy
      });
      
      this.onLocationUpdate?.(locationData);

    } catch (error) {
      console.error('❌ Error de red o al obtener ubicación:', error);
      this.onError?.('Error de red. Intentando nuevamente...');
    }
  }

  private startPeriodicUpdates() {
    // Guard: No crear intervalo si ya existe (React Strict Mode safe)
    if (trackingInterval !== null) {
      console.warn('⚠️ Intervalo ya existe - Evitando duplicado');
      return;
    }

    trackingInterval = setInterval(async () => {
      await this.getLocationAndSend();
    }, this.UPDATE_INTERVAL);
  }

  getStatus() {
    return {
      isRunning: this.isRunning,
      alertId: this.alertId,
      interval: this.UPDATE_INTERVAL,
      platform: Capacitor.getPlatform(),
      hasInterval: trackingInterval !== null
    };
  }
}

export const locationTrackingService = new LocationTrackingService();

export function stopTracking(reason: string = 'cleanup') {
  if (trackingInterval) {
    clearInterval(trackingInterval);
    trackingInterval = null;
  }
  locationTrackingService.stop(reason);
}

export const startLocationTracking = (
  alertId: number,
  callbacks?: {
    onLocationUpdate?: (data: LocationTrackingData) => void;
    onError?: (error: string) => void;
    onAlertExpired?: () => void;
  }
) => locationTrackingService.start(alertId, callbacks);

export const stopLocationTracking = () =>
  locationTrackingService.stop();