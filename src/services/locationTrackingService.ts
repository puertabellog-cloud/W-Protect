import { Geolocation } from '@capacitor/geolocation';
import { Capacitor } from '@capacitor/core';
import { apiClient } from '../api/apiClient';

export interface LocationTrackingData {
  latitud: number;
  longitud: number;
  accuracy?: number;
}

class LocationTrackingService {
  private intervalId: any = null;
  private isRunning: boolean = false;
  private alertId: number | null = null;

  private readonly UPDATE_INTERVAL = 30000; // 30 segundos

  private onLocationUpdate?: (data: LocationTrackingData) => void;
  private onError?: (error: string) => void;

  async start(
    alertId: number,
    callbacks?: {
      onLocationUpdate?: (data: LocationTrackingData) => void;
      onError?: (error: string) => void;
    }
  ) {
    // Si ya hay tracking con el mismo alertId, bloquear nuevo inicio
    if (this.isRunning && this.alertId === alertId) {
      console.warn('Intento de doble tracking bloqueado para alertId:', alertId);
      return;
    }

    // Si hay tracking activo para otra alerta, detenerlo antes de iniciar
    if (this.isRunning && this.alertId !== alertId) {
      console.log('Cambio de alertId detectado. Deteniendo tracking anterior:', this.alertId);
      this.stop();
    }

    this.alertId = alertId;
    this.onLocationUpdate = callbacks?.onLocationUpdate;
    this.onError = callbacks?.onError;

    await this.checkPermissions();
    // Primer envío inmediato
    await this.getLocationAndSend();
    // Asegurar que no se cree más de un intervalo
    this.startPeriodicUpdates();
    this.isRunning = true;
    console.log('Tracking iniciado para alertId:', alertId);
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    if (this.isRunning) {
      console.log('Tracking detenido para alertId:', this.alertId);
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

      const locationData: LocationTrackingData = {
        latitud: position.coords.latitude,
        longitud: position.coords.longitude,
        accuracy: position.coords.accuracy
      };

      const response = await apiClient.post(
        `/w/alerts/${this.alertId}/locations`,
        locationData
      );

      if (response.status === 400) {
        console.warn('❌ Alerta no activa. Deteniendo tracking.');
        this.stop();
        this.onError?.('La alerta fue cerrada. El tracking se ha detenido.');
        return;
      }

      if (response.status === 401) {
        console.warn('❌ Token inválido. Redirigiendo al login.');
        this.onError?.('Token inválido. Por favor, inicia sesión nuevamente.');
        return;
      }

      if (!response.status.toString().startsWith('2')) {
        console.error('❌ Error inesperado al enviar ubicación:', response.data);
        this.onError?.('Error inesperado al enviar ubicación.');
        return;
      }

      console.log('📍 Ubicación enviada con éxito:', locationData);
      this.onLocationUpdate?.(locationData);

    } catch (error) {
      console.error('❌ Error de red o al enviar ubicación:', error);
      this.onError?.('Error de red. Intentando nuevamente...');
    }
  }

  private startPeriodicUpdates() {
    // No crear otro intervalo si ya existe
    if (this.intervalId) {
      console.warn('Intento de crear intervalo duplicado bloqueado');
      return;
    }

    this.intervalId = setInterval(async () => {
      await this.getLocationAndSend();
    }, this.UPDATE_INTERVAL);
  }

  getStatus() {
    return {
      isRunning: this.isRunning,
      alertId: this.alertId,
      interval: this.UPDATE_INTERVAL,
      platform: Capacitor.getPlatform()
    };
  }
}

export const locationTrackingService = new LocationTrackingService();

export const startLocationTracking = (
  alertId: number,
  callbacks?: {
    onLocationUpdate?: (data: LocationTrackingData) => void;
    onError?: (error: string) => void;
  }
) => locationTrackingService.start(alertId, callbacks);

export const stopLocationTracking = () =>
  locationTrackingService.stop();