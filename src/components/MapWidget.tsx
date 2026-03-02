import React, { useEffect, useRef, useState } from 'react';
import { 
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonButton,
  IonIcon,
  IonText,
  IonSpinner,
  IonAlert,
  IonToast,
  IonChip,
  IonLabel
} from '@ionic/react';
import { locationOutline, shareOutline, refreshOutline } from 'ionicons/icons';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './MapWidget.css';
import { backendService } from '../api/backend';
import { useDevice } from "../context/DeviceContext";
import { ProfileData } from '../types';
import { EmergencyAlertRequest } from '../api/interface';
import { sendEmergencyAlertFromMap } from '../services/emergencyService';
import { startLocationTracking, stopLocationTracking, LocationTrackingData } from '../services/locationTrackingService';

// Configurar iconos por defecto de Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const MapWidget: React.FC = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const markerInstance = useRef<L.Marker | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentLocation, setCurrentLocation] = useState<{lat: number, lng: number} | null>(null);
  const [address, setAddress] = useState<string>('');
  const [userName, setUserName] = useState<string>('Usuario');
  
  // Estados para la alerta de emergencia
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [isLoadingAlert, setIsLoadingAlert] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastColor, setToastColor] = useState<'success' | 'danger'>('success');
  const [profileReady, setProfileReady] = useState(false);

  // Estados para tracking de ubicación
  const [isTrackingActive, setIsTrackingActive] = useState(false);
  const [trackingLogs, setTrackingLogs] = useState<string[]>([]);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  // Contexto del dispositivo (para obtener deviceId)
  const { deviceId } = useDevice();  
  /* --------------------------------------------------------------
      1️⃣  CARGAR EL PERFIL CUANDO EL COMPONENTE SE MONTA
      -------------------------------------------------------------- */
  useEffect(() => {
    // Si no tienes todavía un deviceId, no intentes la llamada.
    if (!deviceId) return;

    const fetchCurrentUser = async () => {
      try {
        // Llamada al backend (el método devuelve ProfileData)
        const profile: ProfileData = await backendService.getProfile('defaultArgument');
        console.log("Perfil obtenido:", profile);
        // Supongamos que el id del usuario está en profile.id (ajusta si tu campo tiene otro nombre)
        if (profile && typeof profile.id === 'number') {
          setCurrentUserId(profile.id);
          setProfileReady(true);

        } else {
          console.warn('El perfil recibido no contiene un id numérico', profile);
        }
      } catch (err) {
        console.error('No se pudo obtener el perfil del usuario', err);
        // Opcional: muestra un toast o alerta para que el usuario sepa que algo falló
      }
    };

    fetchCurrentUser();
  }, []);   // Se vuelve a ejecutar sólo si cambia el deviceId

  useEffect(() => {
    loadUserName();
    initializeMap();
  }, []);

  const loadUserName = () => {
    try {
      // Buscar el nombre del usuario en localStorage
      let userData = localStorage.getItem('w-protect-user');
      if (!userData) {
        userData = localStorage.getItem('wprotect_registration');
      }
      
      if (userData) {
        const user = JSON.parse(userData);
        if (user.name) {
          // Tomar solo el primer nombre
          const firstName = user.name.trim().split(' ')[0];
          setUserName(firstName);
        }
      }
    } catch (error) {
      console.log('No se pudo cargar el nombre del usuario:', error);
      setUserName('Usuario');
    }
  };

  const initializeMap = async () => {
    try {
      console.log('🗺️ Inicializando mapa con Leaflet...');
      await getCurrentLocation();
    } catch (err) {
      console.error('❌ Error inicializando mapa:', err);
      setError('Error al cargar el mapa');
      setLoading(false);
    }
  };

  const getCurrentLocation = (): Promise<void> => {
    return new Promise(async (resolve) => {
      if (!navigator.geolocation) {
        const defaultLocation = { lat: 4.6097, lng: -74.0817 };
        setCurrentLocation(defaultLocation);
        setAddress('Bogotá, Colombia (ubicación aproximada)');
        initMap(defaultLocation);
        resolve();
        return;
      }

      // Verificar y solicitar permisos explícitamente
      try {
        if ('permissions' in navigator) {
          const permission = await navigator.permissions.query({ name: 'geolocation' as PermissionName });
          console.log('Estado del permiso de geolocalización:', permission.state);
          
          if (permission.state === 'denied') {
            setError('Permisos de ubicación denegados. Ve a Configuración de la app y habilita la ubicación.');
            const defaultLocation = { lat: 4.6097, lng: -74.0817 };
            setCurrentLocation(defaultLocation);
            setAddress('Bogotá, Colombia (ubicación aproximada - sin permisos)');
            initMap(defaultLocation);
            resolve();
            return;
          }
        }
      } catch (err) {
        console.log('API de permisos no disponible, continuando con geolocalización directa');
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          console.log('✅ Ubicación obtenida:', position.coords);
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setCurrentLocation(location);
          setError(null); // Limpiar errores
          initMap(location);
          getAddressFromCoordinates(location);
          
          // 🚀 INICIAR TRACKING AUTOMÁTICAMENTE cuando se obtenga la ubicación
          if (!isTrackingActive) {
            startTrackingAutomatically();
          }
          
          resolve();
        },
        (error) => {
          console.error('❌ Error obteniendo ubicación:', error);
          let errorMessage = '';
          
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = '🔒 Permisos de ubicación denegados. Habilita la ubicación en Configuración > Privacidad > Ubicación.';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = '📍 No se pudo determinar tu ubicación. Verifica que el GPS esté activado.';
              break;
            case error.TIMEOUT:
              errorMessage = '⏱️ Tiempo de espera agotado al obtener ubicación.';
              break;
            default:
              errorMessage = '❌ Error obteniendo ubicación. Verifica permisos y conexión GPS.';
              break;
          }
          
          setError(errorMessage);
          const defaultLocation = { lat: 4.6097, lng: -74.0817 };
          setCurrentLocation(defaultLocation);
          setAddress('Bogotá, Colombia (ubicación aproximada)');
          initMap(defaultLocation);
          resolve();
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 60000
        }
      );
    });
  };

  const getAddressFromCoordinates = async (location: {lat: number, lng: number}) => {
    try {
      // Usar servicio de geocodificación gratuito de OpenStreetMap Nominatim
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${location.lat}&lon=${location.lng}&zoom=18&addressdetails=1`
      );
      
      if (response.ok) {
        const data = await response.json();
        if (data.display_name) {
          console.log('📍 Dirección obtenida:', data.display_name);
          setAddress(data.display_name);
          return;
        }
      }
      
      // Fallback a coordenadas si no se puede obtener dirección
      setAddress(`Coordenadas: ${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}`);
    } catch (error) {
      console.log('Error obteniendo dirección, usando coordenadas:', error);
      setAddress(`Coordenadas: ${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}`);
    }
  };

  const initMap = (location: {lat: number, lng: number}) => {
    try {
      if (!mapRef.current) {
        setError('Contenedor del mapa no disponible');
        setLoading(false);
        return;
      }

      // Limpiar mapa anterior si existe
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }

      console.log('🗺️ Creando mapa con Leaflet en:', location);
      
      // Asegurar que el contenedor tenga dimensiones
      mapRef.current.style.height = '300px';
      mapRef.current.style.width = '100%';
      mapRef.current.style.borderRadius = '12px';
      mapRef.current.style.overflow = 'hidden';
      mapRef.current.style.border = '2px solid #e0e0e0';
      mapRef.current.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
      
      // Crear nuevo mapa con Leaflet
      const map = L.map(mapRef.current, {
        center: [location.lat, location.lng],
        zoom: 17, // Zoom más alto para mejor detalle
        zoomControl: true,
        attributionControl: true,
        scrollWheelZoom: true,
        doubleClickZoom: true,
        dragging: true
      });

      // Usar tiles de CartoDB para mejor calidad visual
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors © <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 20
      }).addTo(map);

      // Crear marcador personalizado más bonito
      const customIcon = L.divIcon({
        className: 'custom-location-marker',
        html: `
          <div style="
            position: relative;
            width: 32px;
            height: 32px;
          ">
            <div style="
              background: linear-gradient(135deg, #ff4081, #ff6ec7);
              width: 24px;
              height: 24px;
              border-radius: 50%;
              border: 4px solid white;
              box-shadow: 0 4px 12px rgba(255, 64, 129, 0.4);
              position: absolute;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%);
              animation: pulse 2s infinite;
            "></div>
            <div style="
              background: rgba(255, 64, 129, 0.3);
              width: 32px;
              height: 32px;
              border-radius: 50%;
              position: absolute;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%);
              animation: ripple 2s infinite;
            "></div>
          </div>
          <style>
            @keyframes pulse {
              0% { transform: translate(-50%, -50%) scale(1); }
              50% { transform: translate(-50%, -50%) scale(1.1); }
              100% { transform: translate(-50%, -50%) scale(1); }
            }
            @keyframes ripple {
              0% { transform: translate(-50%, -50%) scale(0.8); opacity: 1; }
              100% { transform: translate(-50%, -50%) scale(2); opacity: 0; }
            }
          </style>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });

      // Crear marcador
      const marker = L.marker([location.lat, location.lng], { 
        icon: customIcon,
        title: 'Tu ubicación actual'
      }).addTo(map);

      // Añadir popup al marcador
      marker.bindPopup(`
        <div style="text-align: center; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
          <strong style="color: #ff4081;">📍 Tu ubicación actual</strong><br/>
          <small style="color: #666;">Lat: ${location.lat.toFixed(6)}<br/>
          Lng: ${location.lng.toFixed(6)}</small>
        </div>
      `, {
        closeButton: false,
        autoClose: false,
        closeOnClick: false,
        className: 'custom-popup'
      });

      // Guardar referencias
      mapInstance.current = map;
      markerInstance.current = marker;

      // Ajustar el mapa después de un momento para asegurar renderizado correcto
      setTimeout(() => {
        map.invalidateSize();
        console.log('✅ Mapa de Leaflet ajustado y optimizado');
      }, 100);

      console.log('✅ Mapa de Leaflet creado exitosamente');
      setLoading(false);
      
    } catch (err) {
      console.error('❌ Error inicializando mapa con Leaflet:', err);
      setError('Error al cargar el mapa');
      setLoading(false);
    }
  };

  const requestLocationPermission = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Forzar solicitud de ubicación para activar el diálogo de permisos
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 20000,
          maximumAge: 0 // Forzar nueva solicitud
        });
      });
      
      const location = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };
      setCurrentLocation(location);
      initMap(location);
      getAddressFromCoordinates(location);
      setLoading(false);
      
    } catch (error: any) {
      console.error('Error solicitando permisos:', error);
      setError('Para usar esta función, necesitas habilitar los permisos de ubicación en la configuración de tu dispositivo.');
      setLoading(false);
    }
  };

  const refreshLocation = () => {
    setLoading(true);
    setError(null);
    
    // Limpiar mapa anterior si existe
    if (mapInstance.current) {
      mapInstance.current.remove();
      mapInstance.current = null;
      markerInstance.current = null;
    }
    
    // Limpiar el contenedor
    if (mapRef.current) {
      mapRef.current.innerHTML = '';
      mapRef.current.style.height = '';
    }
    
    getCurrentLocation();
  };

  // Funciones para la alerta de emergencia
  const handleEmergencyClick = () => {
    if (!currentLocation) {
      setToastMessage('❌ No se puede enviar alerta sin ubicación');
      setToastColor('danger');
      setShowToast(true);
      return;
    }
    setIsAlertOpen(true);
  };

  const sendEmergencyAlert = async () => {
    if (!currentLocation) {
      setToastMessage('❌ No se puede enviar alerta sin ubicación');
      setToastColor('danger');
      setShowToast(true);
      return;
    }

    if (currentUserId === null) {
      setToastMessage('❌ No se pudo identificar al usuario');
      setToastColor('danger');
      setShowToast(true);
      return;
    }

    setIsLoadingAlert(true);
    setIsAlertOpen(false);

    try {
      console.log('📍 Coordenadas originales de Google Maps:', currentLocation);
      
      // Usar el nuevo servicio que mapea correctamente las coordenadas
      const result = await sendEmergencyAlertFromMap(
        currentUserId,
        'Necesito ayuda urgente',      // ✅ mensaje (no message)
        currentLocation,               // { lat, lng } de Google Maps  
        'GENERAL'
      );

      console.log('✅ Resultado del envío de alerta:', result);
      setToastMessage(`✅ Alerta enviada exitosamente. ID: ${result.id}`);
      setToastColor('success');
      
    } catch (error) {
      console.error('Error enviando alerta:', error);
      setToastMessage('❌ Error al enviar la alerta. Verifica tu conexión.');
      setToastColor('danger');
    } finally {
      setIsLoadingAlert(false);
      setShowToast(true);
    }
  };

  // Funciones para tracking de ubicación automático (sin botones)
  const startTrackingAutomatically = async () => {
    try {
      console.log('🌍 Iniciando tracking automático cada 5 segundos...');

      await startLocationTracking(5000, {
        onLocationUpdate: (data: LocationTrackingData) => {
          const timeStamp = new Date().toLocaleTimeString();
          const logMessage = `${timeStamp} - ✅ Enviado: ${data.latitud.toFixed(8)}, ${data.longitud.toFixed(9)} (±${data.accuracy}m)`;
          setTrackingLogs((prev) => [logMessage, ...prev.slice(0, 4)]);
          console.log('📍 Ubicación enviada al backend:', logMessage);
        },
        onError: (error: string) => {
          console.error('❌ Error de tracking automático:', error);
          const timeStamp = new Date().toLocaleTimeString();
          const logMessage = `${timeStamp} - ❌ Error: ${error.substring(0, 30)}...`;
          setTrackingLogs((prev) => [logMessage, ...prev.slice(0, 4)]);
        },
      });

      setIsTrackingActive(true);
      console.log('✅ Tracking automático iniciado correctamente');

      const startTime = new Date().toLocaleTimeString();
      const startMessage = `${startTime} - 🚀 Tracking iniciado automáticamente`;
      setTrackingLogs((prev) => [startMessage, ...prev.slice(0, 4)]);
    } catch (error) {
      console.error('❌ Error iniciando tracking automático:', error);
      const timeStamp = new Date().toLocaleTimeString();
      const errorMessage = `${timeStamp} - ❌ Error iniciando tracking: ${error}`;
      setTrackingLogs((prev) => [errorMessage, ...prev.slice(0, 4)]);
    }
  };

  // Cleanup: detener tracking y limpiar mapa cuando el componente se desmonte
  useEffect(() => {
    return () => {
      if (isTrackingActive) {
        stopLocationTracking();
        console.log('🛑 Tracking detenido al desmontar componente');
      }
      
      // Limpiar mapa de Leaflet
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
        markerInstance.current = null;
        console.log('🗺️ Mapa de Leaflet limpiado al desmontar componente');
      }
    };
  }, [isTrackingActive]);

  return (
    <IonCard className="map-widget-card">
      <IonCardHeader>
        <IonCardTitle>
          <IonIcon icon={locationOutline} style={{ marginRight: '8px' }} />
          Tu Ubicación
        </IonCardTitle>
      </IonCardHeader>
      
      <IonCardContent>
        <div className="map-container-widget">
          {loading && (
            <div className="map-loading-widget" style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '300px',
              backgroundColor: '#f8f9fa',
              borderRadius: '12px',
              border: '2px solid #e0e0e0'
            }}>
              <IonSpinner name="crescent" color="primary" style={{ transform: 'scale(1.2)' }} />
              <p style={{ marginTop: '12px', color: '#666', fontSize: '14px' }}>Obteniendo ubicación...</p>
            </div>
          )}
          
          {error && (
            <div className="map-error-widget" style={{
              padding: '20px',
              backgroundColor: '#ffebee',
              borderRadius: '12px',
              border: '2px solid #f44336',
              textAlign: 'center'
            }}>
              <IonText color="danger">
                <p style={{ margin: '0 0 16px 0' }}>{error}</p>
              </IonText>
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
                <IonButton fill="solid" size="small" onClick={requestLocationPermission}>
                  <IonIcon icon={locationOutline} slot="start" />
                  Habilitar Ubicación
                </IonButton>
                <IonButton fill="outline" size="small" onClick={refreshLocation}>
                  <IonIcon icon={refreshOutline} slot="start" />
                  Reintentar
                </IonButton>
              </div>
            </div>
          )}
          
          <div 
            ref={mapRef} 
            className="map-widget"
            style={{ 
              display: loading || error ? 'none' : 'block',
              height: '300px',
              width: '100%',
              borderRadius: '12px',
              overflow: 'hidden',
              position: 'relative',
              zIndex: 1
            }}
          />
        </div>

        {currentLocation && !loading && !error && (
          <div className="location-info-widget">
            <div className="user-location-text">
              <IonText>
                <h3>¡Hola, {userName}!</h3>
                <p>Te encuentras en:</p>
                <p><strong>{address}</strong></p>
              </IonText>
            </div>
            
            <div className="location-coordinates">
              <IonText color="medium">
                <p>
                  📍 Lat: {currentLocation.lat.toFixed(6)}<br/>
                  📍 Lng: {currentLocation.lng.toFixed(6)}
                </p>
              </IonText>
            </div>

            <div className="location-actions">
              {/* Botón de alerta de emergencia */}
              <IonButton
                expand="block"
                fill="outline"
                size="small"
                disabled={isLoadingAlert}
                onClick={handleEmergencyClick}
                style={{
                  '--color': 'var(--foreground)',
                  '--border-color': 'var(--border)',
                  height: '48px',
                  textAlign: 'left',
                  justifyContent: 'flex-start',
                  opacity: isLoadingAlert ? 0.6 : 1,
                  marginTop: '12px'
                }}
              >
                {isLoadingAlert ? (
                  <IonSpinner 
                    name="crescent" 
                    style={{ marginRight: '10px', color: 'var(--womxi-pink-500)' }} 
                  />
                ) : (
                  <IonIcon 
                    icon={locationOutline} 
                    style={{ marginRight: '10px', color: 'var(--womxi-pink-500)' }} 
                  />
                )}
                <div>
                  <div style={{ fontWeight: '500', fontSize: '0.9rem' }}>
                    {isLoadingAlert ? 'Enviando Alerta...' : 'Compartir Ubicación'}
                  </div>
                  <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>
                    A contactos de emergencia
                  </div>
                </div>
              </IonButton>

              <IonButton 
                fill="outline" 
                expand="block" 
                onClick={refreshLocation}
                style={{ marginTop: '8px' }}
              >
                <IonIcon icon={refreshOutline} slot="start" />
                Actualizar Ubicación
              </IonButton>

              {/* 📍 LOGS DE TRACKING AUTOMÁTICO (sin botones) */}
              {trackingLogs.length > 0 && (
                <div style={{ 
                  marginTop: '16px',
                  padding: '8px',
                  borderRadius: '6px',
                  backgroundColor: 'var(--ion-color-light, #f8f9fa)',
                  border: '1px solid var(--ion-color-medium, #92949c)'
                }}>
                  <IonText color="medium">
                    <p style={{ margin: '0 0 6px 0', fontWeight: '500', fontSize: '12px' }}>
                      📍 Tracking Automático Activo
                    </p>
                  </IonText>
                  
                  <div style={{
                    maxHeight: '70px',
                    overflowY: 'auto',
                    backgroundColor: 'white',
                    borderRadius: '4px',
                    padding: '4px',
                    fontSize: '9px',
                    fontFamily: 'monospace'
                  }}>
                    {trackingLogs.map((log, index) => (
                      <div key={index} style={{ 
                        padding: '1px 0', 
                        color: log.includes('❌') ? '#dc3545' : '#28a745',
                        opacity: index === 0 ? 1 : 0.7
                      }}>
                        {log}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </IonCardContent>

      {/* Confirmación de emergencia */}
      <IonAlert
        isOpen={isAlertOpen}
        onDidDismiss={() => setIsAlertOpen(false)}
        header="⚠️ Alerta de Emergencia"
        message="¿Estás seguro de que quieres enviar una alerta de emergencia? Se notificará inmediatamente a tus contactos de emergencia con tu ubicación actual."
        buttons={[
          {
            text: 'Cancelar',
            role: 'cancel',
            cssClass: 'secondary'
          },
          {
            text: '🚨 Enviar Alerta',
            cssClass: 'danger',
            handler: sendEmergencyAlert
          }
        ]}
      />

      {/* Toast de confirmación */}
      <IonToast
        isOpen={showToast}
        onDidDismiss={() => setShowToast(false)}
        message={toastMessage}
        duration={4000}
        color={toastColor}
        position="top"
      />
    </IonCard>
  );
};

export default MapWidget;