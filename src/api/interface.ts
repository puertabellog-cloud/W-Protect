// Archivo de compatibilidad - Se recomienda usar ../types en su lugar
// Re-exportamos tipos centralizados para mantener compatibilidad

export type { 
  Contact as EmergencyContact,
  User as ProfileData,
  ApiResponse,
  Alert as EmergencyAlert,
  Location
} from '../types';

// Tipos específicos para la API de emergencias
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

// Tipo específico para contactos del dispositivo
export interface ContactFromDevice {
  contactId: string;
  displayName?: string;
  name?: {
    given?: string;
    family?: string;
    display?: string;
  };
  phones?: Array<{
    number: string;
  }>;
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