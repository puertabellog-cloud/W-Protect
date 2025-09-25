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
import { locationOutline, shareOutline, refreshOutline } from 'ionicons/icons';
import './MapWidget.css';

const MapWidget: React.FC = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentLocation, setCurrentLocation] = useState<{lat: number, lng: number} | null>(null);
  const [address, setAddress] = useState<string>('');
  const [userName, setUserName] = useState<string>('Usuario');

  useEffect(() => {
    loadUserName();
    loadGoogleMaps();
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

  const loadGoogleMapsScript = (): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (window.google?.maps?.Map) {
        resolve();
        return;
      }

      const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
      if (existingScript) {
        existingScript.addEventListener('load', () => resolve());
        existingScript.addEventListener('error', () => reject(new Error('Error cargando Google Maps')));
        return;
      }

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyA0EmWI8u92HIwlTATFM1IVSRi4lc6iHAg&libraries=geometry,places`;
      script.async = true;
      script.defer = true;
      
      script.onload = () => {
        if (window.google?.maps?.Map) {
          resolve();
        } else {
          reject(new Error('Google Maps no se cargó correctamente'));
        }
      };
      script.onerror = () => reject(new Error('Error cargando Google Maps'));
      
      document.head.appendChild(script);
    });
  };

  const loadGoogleMaps = async () => {
    try {
      if (!window.google) {
        await loadGoogleMapsScript();
      }
      await getCurrentLocation();
    } catch (err) {
      console.error('Error cargando Google Maps:', err);
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
      // Por ahora usar coordenadas, después implementaremos geocoding
      setAddress(`Coordenadas: ${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}`);
    } catch (error) {
      setAddress(`${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}`);
    }
  };

  const initMap = (location: {lat: number, lng: number}) => {
    try {
      if (!mapRef.current || !window.google?.maps?.Map) {
        setError('Google Maps no está disponible');
        setLoading(false);
        return;
      }

      mapRef.current.innerHTML = '';

      const map = new window.google.maps.Map(mapRef.current, {
        center: location,
        zoom: 16,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        zoomControl: true,
        gestureHandling: 'greedy',
        styles: [
          {
            featureType: 'poi',
            stylers: [{ visibility: 'simplified' }]
          }
        ]
      });

      const marker = new window.google.maps.Marker({
        position: location,
        map: map,
        title: 'Tu ubicación actual',
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 10,
          fillColor: '#ff4081',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 3
        }
      });

      setLoading(false);
    } catch (err) {
      console.error('Error inicializando mapa:', err);
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
    getCurrentLocation();
  };

  const shareLocation = () => {
    if (!currentLocation) return;
    
    const shareText = `Mi ubicación: https://maps.google.com/?q=${currentLocation.lat},${currentLocation.lng}`;
    
    if (navigator.share) {
      navigator.share({
        title: 'Mi Ubicación',
        text: shareText,
      }).catch(err => console.log('Error compartiendo:', err));
    } else {
      // Fallback: copiar al portapapeles
      if (navigator.clipboard) {
        navigator.clipboard.writeText(shareText)
          .then(() => alert('Ubicación copiada al portapapeles'))
          .catch(() => console.log('Error copiando'));
      }
    }
  };

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
            <div className="map-loading-widget">
              <IonSpinner name="crescent" />
              <p>Obteniendo ubicación...</p>
            </div>
          )}
          
          {error && (
            <div className="map-error-widget">
              <IonText color="danger">
                <p>{error}</p>
              </IonText>
              <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
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
            style={{ display: loading || error ? 'none' : 'block' }}
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
                expand="block" 
                onClick={shareLocation}
                style={{ marginTop: '12px' }}
              >
                <IonIcon icon={shareOutline} slot="start" />
                Compartir Mi Ubicación
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
            </div>
          </div>
        )}
      </IonCardContent>
    </IonCard>
  );
};

export default MapWidget;