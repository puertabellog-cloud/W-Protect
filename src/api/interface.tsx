// services/BackendService.ts
export interface EmergencyContact {
  id?: number | null; // Opcional para nuevos contactos
  name: string | null;
  phone: string | null;
  alias?: string | null;
  userId: number | null;
}

export interface ProfileData {
  id: number | null;
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
  latitud: number;
  longitud: number;
  accuracy?: number;
}

export interface EmergencyAlertResponse {
  id: number;
  message: string;
  latitud: number;
  longitud: number;
  timestamp: string;
  userId: number;
  contactsNotified: number;
}
// Tipos para el frontend
export interface ContactFromDevice {
  name: {
    display?: string;
    given?: string;
    family?: string;
  };
  phones: Array<{
    number: string;
    type?: string;
  }>;
  displayName?: string;
}
export interface EmergencyButtonProps {
  disabled?: boolean;
  className?: string;
}