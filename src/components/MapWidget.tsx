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
  const [userName] = useState('Gabriela'); // Puedes obtener esto del contexto de usuario

  useEffect(() => {
    loadGoogleMaps();
  }, []);

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
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        const defaultLocation = { lat: 4.6097, lng: -74.0817 };
        setCurrentLocation(defaultLocation);
        setAddress('Bogotá, Colombia (ubicación aproximada)');
        initMap(defaultLocation);
        resolve();
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setCurrentLocation(location);
          initMap(location);
          getAddressFromCoordinates(location);
          resolve();
        },
        () => {
          const defaultLocation = { lat: 4.6097, lng: -74.0817 };
          setCurrentLocation(defaultLocation);
          setAddress('Bogotá, Colombia (ubicación aproximada)');
          initMap(defaultLocation);
          resolve();
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
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

  const refreshLocation = () => {
    setLoading(true);
    setError(null);
    getCurrentLocation();
  };

  const shareLocation = () => {
    // Por ahora solo un placeholder
    console.log('Compartir ubicación:', currentLocation);
    // Aquí implementarás la funcionalidad de compartir más tarde
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
              <IonButton fill="outline" size="small" onClick={refreshLocation}>
                <IonIcon icon={refreshOutline} slot="start" />
                Reintentar
              </IonButton>
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
                <h3>¡Hola {userName}!</h3>
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