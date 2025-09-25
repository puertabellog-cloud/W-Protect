// services/BackendService.ts
export interface EmergencyContact {
  id?: number;
  name: string;
  phone: string;
  alias?: string;
  userId?: number;
}

export interface ProfileData {
  name: string | null;
  phone: string | null;
  email: string | null;
  mensaje: string | null;
  deviceId: string | null;
  active: boolean;
  // Agrega más campos según tu modelo
}

export interface EmergencyAlertRequest {
  message?: string;
  latitude: number;
  longitude: number;
  accuracy?: number;
}

export interface EmergencyAlertResponse {
  id: number;
  message: string;
  latitude: number;
  longitude: number;
  timestamp: string;
  userId: number;
  contactsNotified: number;
}