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

  private readonly UPDATE_INTERVAL = 5000;

  private onLocationUpdate?: (data: LocationTrackingData) => void;
  private onError?: (error: string) => void;

  async start(
    alertId: number,
    callbacks?: {
      onLocationUpdate?: (data: LocationTrackingData) => void;
      onError?: (error: string) => void;
    }
  ) {
    if (this.isRunning) return;

    this.alertId = alertId;
    this.onLocationUpdate = callbacks?.onLocationUpdate;
    this.onError = callbacks?.onError;

    await this.checkPermissions();
    await this.getLocationAndSend();
    this.startPeriodicUpdates();
    this.isRunning = true;
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
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

      this.onLocationUpdate?.(locationData);

    } catch (error) {
      console.error('❌ Error de red o al enviar ubicación:', error);
      this.onError?.('Error de red. Intentando nuevamente...');
    }
  }

  private startPeriodicUpdates() {
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