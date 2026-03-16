import React, { useEffect, useRef, useState } from 'react';
import { 
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonButton,
  IonIcon,
  IonText,
  IonSpinner
} from '@ionic/react';
import { locationOutline, refreshOutline } from 'ionicons/icons';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './MapWidget.css';

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
      mapRef.current.style.height = '260px';
      mapRef.current.style.width = '100%';
      mapRef.current.style.borderRadius = '16px';
      mapRef.current.style.overflow = 'hidden';
      mapRef.current.style.border = '1px solid rgba(236, 72, 153, 0.15)';
      mapRef.current.style.boxShadow = '0 10px 22px rgba(236, 72, 153, 0.12)';
      
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
            width: 36px;
            height: 36px;
          ">
            <div style="
              background: linear-gradient(135deg, #f472b6, #be185d);
              width: 26px;
              height: 26px;
              border-radius: 50%;
              border: 4px solid white;
              box-shadow: 0 4px 14px rgba(190, 24, 93, 0.45);
              position: absolute;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%);
              animation: pulse 2s infinite;
            "></div>
            <div style="
              background: rgba(236, 72, 153, 0.25);
              width: 36px;
              height: 36px;
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
              50% { transform: translate(-50%, -50%) scale(1.12); }
              100% { transform: translate(-50%, -50%) scale(1); }
            }
            @keyframes ripple {
              0% { transform: translate(-50%, -50%) scale(0.8); opacity: 1; }
              100% { transform: translate(-50%, -50%) scale(2.2); opacity: 0; }
            }
          </style>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 18]
      });

      // Crear marcador
      const marker = L.marker([location.lat, location.lng], { 
        icon: customIcon,
        title: 'Tu ubicación actual'
      }).addTo(map);

      // Añadir popup al marcador
      marker.bindPopup(`
        <div style="text-align: center; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 4px 2px;">
          <strong style="color: #be185d;">Tu ubicación actual</strong><br/>
          <small style="color: #64748b;">Lat: ${location.lat.toFixed(6)}<br/>
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



  // Cleanup: limpiar mapa cuando el componente se desmonte
  useEffect(() => {
    return () => {
      // Limpiar mapa de Leaflet
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
        markerInstance.current = null;
        console.log('🗺️ Mapa de Leaflet limpiado al desmontar componente');
      }
    };
  }, []);

  return (
    <IonCard className="map-widget-card">
      <IonCardHeader style={{ background: 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)', padding: '14px 18px' }}>
        <IonCardTitle style={{ color: 'white', fontWeight: 800, fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <IonIcon icon={locationOutline} />
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
              height: '260px',
              background: 'linear-gradient(135deg, #fff7fb 0%, #ffffff 100%)',
              borderRadius: '16px',
              border: '1px solid rgba(236, 72, 153, 0.1)'
            }}>
              <IonSpinner name="crescent" style={{ '--color': '#ec4899', transform: 'scale(1.3)' }} />
              <p style={{ marginTop: '14px', color: '#9d174d', fontSize: '14px', fontWeight: 600 }}>Obteniendo ubicación...</p>
            </div>
          )}
          
          {error && (
            <div className="map-error-widget" style={{
              padding: '24px',
              background: 'linear-gradient(135deg, #fff7fb 0%, #ffe4f0 100%)',
              borderRadius: '16px',
              border: '1px solid rgba(236, 72, 153, 0.25)',
              textAlign: 'center'
            }}>
              <IonText>
                <p style={{ margin: '0 0 18px 0', color: '#9d174d', fontWeight: 600 }}>{error}</p>
              </IonText>
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
                <IonButton fill="solid" size="small" onClick={requestLocationPermission}
                  style={{ '--background': 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)', '--border-radius': '12px' }}>
                  <IonIcon icon={locationOutline} slot="start" />
                  Habilitar Ubicación
                </IonButton>
                <IonButton fill="outline" size="small" onClick={refreshLocation}
                  style={{ '--border-color': '#f9a8d4', '--color': '#be185d', '--border-radius': '12px' }}>
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
              <IonButton 
                fill="outline" 
                expand="block" 
                onClick={refreshLocation}
                style={{ marginTop: '8px', '--border-color': '#f9a8d4', '--color': '#be185d', '--border-radius': '14px' }}
              >
                <IonIcon icon={refreshOutline} slot="start" />
                Actualizar Ubicación
              </IonButton>
            </div>
          </div>
        )}
      </IonCardContent>
    </IonCard>
  );
};

export default MapWidget;