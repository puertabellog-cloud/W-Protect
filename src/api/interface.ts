// Interfaces para la API de Backend

export interface EmergencyContact {
  name: string;
  phone: string;
  alias?: string;
}

export interface ProfileData {
  name: string | null;
  phone: string | null;
  email: string | null;
  mensaje: string | null;
  deviceId: string | null;
  active: boolean;
}

export interface EmergencyAlertRequest {
  userId: number;
  emergencyType: string;
  location?: {
    latitude: number;
    longitude: number;
  };
  message?: string;
  contactIds?: number[];
}

export interface EmergencyAlertResponse {
  id: string;
  status: 'sent' | 'pending' | 'failed';
  contactsNotified: number;
  timestamp: string;
  message?: string;
}

export interface AlertStatus {
  id: string;
  status: 'active' | 'resolved' | 'cancelled';
  createdAt: string;
  resolvedAt?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// Interfaces para el sistema de recursos/artículos
export interface Article {
  id: string;
  titulo: string;
  categoria: 'seguridad' | 'autodefensa' | 'legal' | 'psicologico' | 'tecnologia';
  descripcion: string;
  contenido: string; // HTML o Markdown
  fechaPublicacion: string;
  duracionLectura: number; // en minutos
  tags: string[];
  destacado: boolean;
  icono: string; // nombre del icono de Ionic
}

export interface ResourceCategory {
  id: string;
  nombre: string;
  descripcion: string;
  icono: string;
  color: string;
}

export interface EmergencyButtonProps {
  disabled?: boolean;
  className?: string;
}