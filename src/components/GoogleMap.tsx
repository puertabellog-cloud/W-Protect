import React, { useEffect, useRef, useState } from 'react';
import { 
  IonPage, 
  IonHeader, 
  IonToolbar, 
  IonTitle, 
  IonContent,
  IonButton,
  IonButtons,
  IonBackButton,
  IonLoading,
  IonToast
} from '@ionic/react';
import './GoogleMap.css';

declare global {
  interface Window {
    google: {
      maps: {
        Map: any;
        Marker: any;
        SymbolPath: any;
        importLibrary?: any;
      };
    };
  }
}

const GoogleMap: React.FC = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentLocation, setCurrentLocation] = useState<{lat: number, lng: number} | null>(null);
  const [mapInitialized, setMapInitialized] = useState(false);

  useEffect(() => {
    if (!mapInitialized) {
      loadGoogleMaps();
    }
    
    // Cleanup function
    return () => {
      if (mapRef.current) {
        mapRef.current.innerHTML = '';
      }
    };
  }, [mapInitialized]);

  const loadGoogleMaps = async () => {
    try {
      // Cargar el script de Google Maps si no está cargado
      if (!window.google) {
        await loadGoogleMapsScript();
      }
      
      // Obtener ubicación actual
      await getCurrentLocation();
      
    } catch (err) {
      console.error('Error cargando Google Maps:', err);
      
      // Si hay error de API key, mostrar mensaje específico
      if (err instanceof Error && err.message.includes('RefererNotAllowedMapError')) {
        setError('Error de configuración de API. El mapa no está disponible en este dominio.');
      } else {
        setError('Error al cargar el mapa. Verifica tu conexión a internet.');
      }
      setLoading(false);
    }
  };

  const loadGoogleMapsScript = (): Promise<void> => {
    return new Promise((resolve, reject) => {
      // Verificar si ya existe el script o Google Maps está cargado
      if (window.google?.maps?.Map) {
        resolve();
        return;
      }

      // Verificar si ya existe un script de Google Maps
      const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
      if (existingScript) {
        existingScript.addEventListener('load', () => resolve());
        existingScript.addEventListener('error', () => reject(new Error('Error cargando Google Maps')));
        return;
      }

      // Crear el script con el método tradicional (sin importLibrary)
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyA0EmWI8u92HIwlTATFM1IVSRi4lc6iHAg&libraries=geometry,places`;
      script.async = true;
      script.defer = true;
      
      script.onload = () => {
        // Verificar que Google Maps esté disponible
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

  const getCurrentLocation = (): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocalización no disponible'));
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
          resolve();
        },
        (error) => {
          console.error('Error obteniendo ubicación:', error);
          // Usar ubicación por defecto (Bogotá, Colombia)
          const defaultLocation = { lat: 4.6097, lng: -74.0817 };
          setCurrentLocation(defaultLocation);
          initMap(defaultLocation);
          setError('No se pudo obtener tu ubicación. Mostrando ubicación por defecto.');
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

  const initMap = (location: {lat: number, lng: number}) => {
    try {
      if (!mapRef.current || !window.google?.maps?.Map) {
        setError('Google Maps no está disponible');
        setLoading(false);
        return;
      }

      // Limpiar el contenedor del mapa
      mapRef.current.innerHTML = '';

      // Crear el mapa usando la API tradicional
      const map = new window.google.maps.Map(mapRef.current, {
        center: location,
        zoom: 16,
        mapTypeControl: true,
        streetViewControl: true,
        fullscreenControl: true,
        zoomControl: true,
        gestureHandling: 'greedy'
      });

      // Crear el marcador tradicional
      const marker = new window.google.maps.Marker({
        position: location,
        map: map,
        title: 'Tu ubicación actual',
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: '#ff4081',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 2
        }
      });

      setMapInitialized(true);
      setLoading(false);
    } catch (err) {
      console.error('Error inicializando mapa:', err);
      setError('Error al inicializar el mapa. Verifica tu conexión.');
      setLoading(false);
    }
  };

  const refreshLocation = () => {
    setLoading(true);
    setError(null);
    setMapInitialized(false);
    getCurrentLocation();
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/home" />
          </IonButtons>
          <IonTitle>Mi Ubicación</IonTitle>
          <IonButtons slot="end">
            <IonButton fill="clear" onClick={refreshLocation}>
              🔄
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      
      <IonContent>
        <div 
          ref={mapRef} 
          style={{ 
            width: '100%', 
            height: '100%',
            minHeight: '400px'
          }}
        />
        
        <IonLoading isOpen={loading} message="Cargando mapa..." />
        
        <IonToast
          isOpen={!!error}
          message={error || ''}
          duration={3000}
          onDidDismiss={() => setError(null)}
          color="warning"
        />

        {currentLocation && (
          <div style={{
            position: 'absolute',
            bottom: '20px',
            left: '20px',
            right: '20px',
            background: 'rgba(255, 255, 255, 0.95)',
            padding: '12px',
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
            fontSize: '14px',
            textAlign: 'center'
          }}>
            <strong>📍 Tu ubicación:</strong><br/>
            Lat: {currentLocation.lat.toFixed(6)}<br/>
            Lng: {currentLocation.lng.toFixed(6)}
          </div>
        )}
      </IonContent>
    </IonPage>
  );
};

export default GoogleMap;