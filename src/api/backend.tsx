import { EmergencyContact, EmergencyAlertRequest, EmergencyAlertResponse, ProfileData } from './interface.js';


class BackendService {
    private baseUrl: string;

    constructor() {
        // Cambia esta URL por la de tu backend
        // this.baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';
        this.baseUrl = 'https://oikoom.azurewebsites.net/oikoom/api/w';
    }

    // Manejo genérico de errores
    private async handleResponse<T>(response: Response): Promise<T> {
        if (!response.ok) {
            const errorText = await response.text();
            let errorMessage = `HTTP ${response.status}: ${response.statusText}`;

            try {
                const errorJson = JSON.parse(errorText);
                errorMessage = errorJson.message || errorJson.error || errorMessage;
            } catch {
                // Si no es JSON válido, usar el texto tal como está
                if (errorText) {
                    errorMessage = errorText;
                }
            }

            throw new Error(errorMessage);
        }

        const text = await response.text();
        if (!text) {
            throw new Error('No se recibió respuesta del servidor');
        }
        return JSON.parse(text) as T;
    }

    // === GESTIÓN DE CONTACTOS DE EMERGENCIA ===

    // Obtener contactos de emergencia del usuario
    async getEmergencyContacts(userId: number): Promise<EmergencyContact[]> {
        try {
            const response = await fetch(`${this.baseUrl}/contacts/user/${userId}`, {
                method: 'GET',
            });

            return await this.handleResponse<EmergencyContact[]>(response);
        } catch (error) {
            console.error('Error obteniendo contactos de emergencia:', error);
            throw error;
        }
    }

    // Agregar un contacto de emergencia
    // async addEmergencyContact(userId: number, contact: Omit<EmergencyContact, 'id' | 'userId'>): Promise<EmergencyContact> {
    //     try {
    //         const response = await fetch(`${this.baseUrl}/emergency-contacts`, {
    //             method: 'POST',
    //             headers: this.getHeaders(),
    //             body: JSON.stringify({
    //                 ...contact,
    //                 userId
    //             }),
    //         });

    //         return await this.handleResponse<EmergencyContact>(response);
    //     } catch (error) {
    //         console.error('Error agregando contacto de emergencia:', error);
    //         throw error;
    //     }
    // }

    // Actualizar un contacto de emergencia
    async updateEmergencyContact(updates: Partial<EmergencyContact>): Promise<EmergencyContact> {
        try {
            const response = await fetch(`${this.baseUrl}/contacts/save`, {
                method: 'PUT',
                body: JSON.stringify(updates),
            });

            return await this.handleResponse<EmergencyContact>(response);
        } catch (error) {
            console.error('Error actualizando contacto de emergencia:', error);
            throw error;
        }
    }

    // // Eliminar un contacto de emergencia
    async deleteEmergencyContact(contactId: number): Promise<void> {
        try {
            const response = await fetch(`${this.baseUrl}/contacts/delete/${contactId}`, {
                method: 'DELETE',
            });

            await this.handleResponse<void>(response);
        } catch (error) {
            console.error('Error eliminando contacto de emergencia:', error);
            throw error;
        }
    }

    // // Sincronizar todos los contactos (borrar existentes y crear nuevos)
    // async syncEmergencyContacts(userId: number, contacts: Omit<EmergencyContact, 'id' | 'userId'>[]): Promise<EmergencyContact[]> {
    //     try {
    //         const response = await fetch(`${this.baseUrl}/emergency-contacts/sync/${userId}`, {
    //             method: 'POST',
    //             headers: this.getHeaders(),
    //             body: JSON.stringify(contacts),
    //         });

    //         return await this.handleResponse<EmergencyContact[]>(response);
    //     } catch (error) {
    //         console.error('Error sincronizando contactos de emergencia:', error);
    //         throw error;
    //     }
    // }

    // // === GESTIÓN DE ALERTAS DE EMERGENCIA ===

    // // Enviar alerta de emergencia
    // async sendEmergencyAlert(userId: number, alertData: EmergencyAlertRequest): Promise<EmergencyAlertResponse> {
    //     try {
    //         const response = await fetch(`${this.baseUrl}/emergency-alerts`, {
    //             method: 'POST',
    //             headers: this.getHeaders(),
    //             body: JSON.stringify({
    //                 ...alertData,
    //                 userId
    //             }),
    //         });

    //         return await this.handleResponse<EmergencyAlertResponse>(response);
    //     } catch (error) {
    //         console.error('Error enviando alerta de emergencia:', error);
    //         throw error;
    //     }
    // }

    // // Obtener historial de alertas del usuario
    // async getEmergencyAlerts(userId: number): Promise<EmergencyAlertResponse[]> {
    //     try {
    //         const response = await fetch(`${this.baseUrl}/emergency-alerts/user/${userId}`, {
    //             method: 'GET',
    //             headers: this.getHeaders(),
    //         });

    //         return await this.handleResponse<EmergencyAlertResponse[]>(response);
    //     } catch (error) {
    //         console.error('Error obteniendo alertas de emergencia:', error);
    //         throw error;
    //     }
    // }

    // === GESTIÓN DE USUARIOS ===


    // Obtener información del usuario actual
    async getProfile(deviceId: string): Promise<ProfileData> {
        try {
            const response = await fetch(`${this.baseUrl}/users/device/${deviceId}`, {
                method: 'GET',
            });
            return await this.handleResponse<ProfileData>(response);
        } catch (error) {
            console.error('Error obteniendo usuario actual:', error);
            throw error;
        }
    }

    // Actualizar información del usuario
    async updateProfile(updates: Partial<ProfileData>): Promise<ProfileData> {
        try {
            const response = await fetch(`${this.baseUrl}/users/save`, {
                method: 'PUT',
                body: JSON.stringify(updates),
            });

            return await this.handleResponse<ProfileData>(response);
        } catch (error) {
            console.error('Error actualizando usuario:', error);
            throw error;
        }
    }

    // === UTILIDADES ===

    // // Verificar conectividad con el backend
    // async healthCheck(): Promise<{ status: string; timestamp: string }> {
    //     try {
    //         const response = await fetch(`${this.baseUrl}/health`, {
    //             method: 'GET',
    //             headers: {
    //                 'Content-Type': 'application/json',
    //             },
    //         });

    //         return await this.handleResponse<{ status: string; timestamp: string }>(response);
    //     } catch (error) {
    //         console.error('Error en health check:', error);
    //         throw error;
    //     }
    // }

    // // Limpiar token de autenticación
    // clearAuth() {
    //     this.authToken = null;
    // }
}

export const backendService = new BackendService();