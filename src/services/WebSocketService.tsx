import { EmergencyAlertResponse } from '../api/interface';

export interface WebSocketMessage {
  type: 'EMERGENCY_ALERT' | 'CONNECTION_STATUS' | 'ERROR';
  data: any;
  timestamp: string;
}

class WebSocketService {
  private ws: WebSocket | null = null;
  private serverUrl: string;
  private currentUserId: number | null = null;
  private reconnectInterval: number = 5000; // 5 segundos
  private maxReconnectAttempts: number = 10;
  private reconnectAttempts: number = 0;
  private isConnecting: boolean = false;
  private messageHandlers: Map<string, (data: any) => void> = new Map();

  constructor() {
    // Cambiar por la URL de tu WebSocket server
    this.serverUrl = process.env.REACT_APP_WS_URL || 'ws://localhost:8080/ws';
  }

  // Conectar WebSocket
  connect(userId: number): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        resolve();
        return;
      }

      if (this.isConnecting) {
        reject(new Error('Ya hay una conexión en proceso'));
        return;
      }

      this.currentUserId = userId;
      this.isConnecting = true;

      try {
        console.log('Conectando WebSocket para usuario:', userId);
        this.ws = new WebSocket(`${this.serverUrl}?userId=${userId}`);

        this.ws.onopen = () => {
          console.log('WebSocket conectado');
          this.isConnecting = false;
          this.reconnectAttempts = 0;
          
          // Registrar usuario en el servidor
          this.send({
            type: 'REGISTER_USER',
            data: { userId },
            timestamp: new Date().toISOString()
          });

          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const message: WebSocketMessage = JSON.parse(event.data);
            this.handleMessage(message);
          } catch (error) {
            console.error('Error parseando mensaje WebSocket:', error);
          }
        };

        this.ws.onclose = (event) => {
          console.log('WebSocket desconectado:', event.code, event.reason);
          this.isConnecting = false;
          this.ws = null;
          
          // Intentar reconectar si no fue cerrado intencionalmente
          if (event.code !== 1000) { // 1000 = cierre normal
            this.scheduleReconnect();
          }
        };

        this.ws.onerror = (error) => {
          console.error('Error en WebSocket:', error);
          this.isConnecting = false;
          
          if (this.reconnectAttempts === 0) {
            reject(error);
          }
        };

      } catch (error) {
        this.isConnecting = false;
        reject(error);
      }
    });
  }

  // Manejar mensajes entrantes
  private handleMessage(message: WebSocketMessage) {
    console.log('Mensaje WebSocket recibido:', message);

    switch (message.type) {
      case 'EMERGENCY_ALERT':
        this.handleEmergencyAlert(message.data);
        break;
      case 'CONNECTION_STATUS':
        console.log('Estado de conexión:', message.data);
        break;
      case 'ERROR':
        console.error('Error del servidor:', message.data);
        break;
      default:
        console.warn('Tipo de mensaje desconocido:', message.type);
    }

    // Llamar handlers personalizados
    const handler = this.messageHandlers.get(message.type);
    if (handler) {
      handler(message.data);
    }
  }

  // Manejar alerta de emergencia específicamente
  private handleEmergencyAlert(alertData: EmergencyAlertResponse) {
    console.log('Nueva alerta de emergencia recibida:', alertData);
    
    // Vibrar para llamar la atención
    if (navigator.vibrate) {
      navigator.vibrate([500, 200, 500, 200, 500]);
    }

    // Disparar evento personalizado para el componente de UI
    const event = new CustomEvent('emergency-alert-received', { 
      detail: alertData 
    });
    window.dispatchEvent(event);
  }

  // Enviar mensaje al servidor
  private send(message: WebSocketMessage) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      console.error('WebSocket no está conectado');
    }
  }

  // Programar reconexión automática
  private scheduleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Máximo de intentos de reconexión alcanzado');
      return;
    }

    this.reconnectAttempts++;
    console.log(`Reconectando en ${this.reconnectInterval}ms (intento ${this.reconnectAttempts})`);
    
    setTimeout(() => {
      if (this.currentUserId && this.ws?.readyState !== WebSocket.OPEN) {
        this.connect(this.currentUserId).catch(error => {
          console.error('Error en reconexión:', error);
        });
      }
    }, this.reconnectInterval);
  }

  // Agregar handler personalizado para tipos de mensaje
  addMessageHandler(type: string, handler: (data: any) => void) {
    this.messageHandlers.set(type, handler);
  }

  // Remover handler
  removeMessageHandler(type: string) {
    this.messageHandlers.delete(type);
  }

  // Marcar alerta como vista (enviar al servidor)
  markAlertAsSeen(alertId: number) {
    this.send({
      type: 'MARK_ALERT_SEEN',
      data: { alertId },
      timestamp: new Date().toISOString()
    });
  }

  // Confirmar recepción de alerta
  confirmAlertReceived(alertId: number) {
    this.send({
      type: 'ALERT_RECEIVED',
      data: { 
        alertId,
        userId: this.currentUserId
      },
      timestamp: new Date().toISOString()
    });
  }

  // Verificar estado de conexión
  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  // Desconectar WebSocket
  disconnect() {
    if (this.ws) {
      console.log('Desconectando WebSocket');
      this.ws.close(1000, 'Desconexión manual'); // 1000 = cierre normal
      this.ws = null;
    }
  }

  // Obtener información de conexión
  getConnectionInfo() {
    return {
      connected: this.isConnected(),
      userId: this.currentUserId,
      reconnectAttempts: this.reconnectAttempts,
      maxReconnectAttempts: this.maxReconnectAttempts
    };
  }
}

export const webSocketService = new WebSocketService();