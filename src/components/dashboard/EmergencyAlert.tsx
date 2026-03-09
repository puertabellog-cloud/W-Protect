import React, { useState, useEffect } from 'react';
import { getCurrentUser } from '../../services/authService';
import { saveAlert, closeAlert, getUserByEmail } from '../../services/springBootServices';
import { startLocationTracking, stopLocationTracking } from '../../services/locationTrackingService';

import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonIcon,
  IonCard,
  IonCardContent,
  IonProgressBar
} from '@ionic/react';

import {
  arrowBackOutline,
  warningOutline,
  callOutline
} from 'ionicons/icons';

interface EmergencyContact {
  name: string;
  phone: string;
  alias?: string;
}

interface EmergencyAlertProps {
  onBack: () => void;
}

export const EmergencyAlert: React.FC<EmergencyAlertProps> = ({ onBack }) => {

  const [isActivated, setIsActivated] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>([]);
  const [alertSent, setAlertSent] = useState(false);
  const [alertId, setAlertId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  /* =========================
     Cargar perfil del usuario y contactos guardados
  ========================== */

  useEffect(() => {

    const savedContacts = localStorage.getItem('emergencyContacts');

    if (savedContacts) {
      setEmergencyContacts(JSON.parse(savedContacts));
    }

    // Cargar perfil del usuario
    const fetchCurrentUser = async () => {
      try {
        // Obtener email del usuario desde localStorage
        let userData = localStorage.getItem('w-protect-user');
        if (!userData) {
          userData = localStorage.getItem('wprotect_registration');
        }
        
        if (!userData) {
          console.warn('No hay datos de usuario en localStorage');
          return;
        }

        const user = JSON.parse(userData);
        if (!user.email) {
          console.warn('No se encontró email en los datos de usuario');
          return;
        }

        // Llamada al backend usando el email
        const profile = await getUserByEmail(user.email);
        console.log("Perfil obtenido para emergencia:", profile);
        
        if (profile && typeof profile.id === 'number') {
          setCurrentUserId(profile.id);
        } else {
          console.warn("Perfil inválido o no encontrado para emergencia.");
        }
      } catch (error) {
        console.error("Error obteniendo el perfil del usuario para emergencia:", error);
      }
    };

    fetchCurrentUser();

  }, []);

  /* =========================
     Activar automáticamente si no hay alerta activa
  ========================== */

  useEffect(() => {

    // Verificar si ya hay una alerta activa
    const stored = localStorage.getItem("alertId");
    
    if (stored) return; // Ya hay alerta activa, no activar automáticamente
    
    // Auto-activar emergencia cuando se monta el componente
    setTimeout(() => {
      if (!isActivated && !alertSent) {
        handleEmergencyActivation();
      }
    }, 500); // Pequeño delay para que se vea el componente primero

  }, []);

  /* =========================
     Restaurar alerta activa
  ========================== */

  useEffect(() => {

    const stored = localStorage.getItem("alertId");

    if (!stored) return;

    const id = Number(stored);

    if (!isNaN(id)) {

      console.log("Restaurando alerta activa:", id);

      setAlertId(id);
      setAlertSent(true);

      startLocationTracking(id, {
        onLocationUpdate: (loc: any) => console.log("Ubicación enviada", loc),
        onError: (err: any) => console.warn("Error tracking", err)
      });

    }

  }, []);

  /* =========================
     Cleanup
  ========================== */

  useEffect(() => {

    return () => {
      console.log("Deteniendo tracking al desmontar componente");
      stopLocationTracking();
    };

  }, []);

  /* =========================
     Countdown emergencia
  ========================== */

  useEffect(() => {

    let interval: ReturnType<typeof setInterval>;

    if (isActivated && countdown > 0) {

      interval = setInterval(() => {
        setCountdown(prev => prev - 1);
      }, 1000);

    } else if (isActivated && countdown === 0) {

      if (!alertSent) {
        handleSendAlert();
      }

    }

    return () => clearInterval(interval);

  }, [isActivated, countdown]);

  /* =========================
     Activar emergencia
  ========================== */

  const handleEmergencyActivation = () => {

    if (isActivated || isSubmitting) return;

    setIsActivated(true);
    setCountdown(5);

  };

  const handleCancel = () => {

    setIsActivated(false);
    setCountdown(0);

  };

  /* =========================
     Enviar alerta
  ========================== */

  const handleSendAlert = async () => {

    if (isSubmitting) return;

    setIsSubmitting(true);

    try {

      // Usar el userId que obtuvimos desde localStorage
      const userId = currentUserId;

      if (!userId) {
        throw new Error("Usuario no identificado. Verifica que hayas iniciado sesión correctamente.");
      }

      console.log("Enviando alerta para usuario ID:", userId);

      const position = await new Promise<GeolocationPosition>((resolve, reject) => {

        navigator.geolocation.getCurrentPosition(
          resolve,
          reject,
          { enableHighAccuracy: true, timeout: 10000 }
        );

      });

      const lat = position.coords.latitude.toString();
      const lng = position.coords.longitude.toString();

      const savedAlert: any = await saveAlert({
        userId,
        message: "¡Ayuda! Estoy en peligro",
        latitud: lat,
        longitud: lng,
        emergencyMode: true
      });

      const id = savedAlert?.id ?? null;

      if (id) {

        setAlertId(id);
        localStorage.setItem("alertId", String(id));
        setAlertSent(true);

        console.log("Alerta creada con ID:", id);

        startLocationTracking(id, {
          onLocationUpdate: (loc: any) => console.log("Ubicación enviada", loc),
          onError: (err: any) => console.warn("Error tracking", err)
        });

        alert("Alerta enviada. Contactos notificados.");

      } else {

        alert("Alerta enviada pero no se recibió ID del servidor.");

      }

    } catch (error) {

      console.error("Error enviando alerta:", error);

      alert("No se pudo enviar la alerta.");

      setIsActivated(false);
      setCountdown(0);

    } finally {

      setIsSubmitting(false);

    }

  };

  /* =========================
     Cerrar alerta
  ========================== */

  const handleCloseAlert = async () => {

    try {

      let id = alertId;

      if (!id) {

        const stored = localStorage.getItem("alertId");

        if (stored) id = Number(stored);

      }

      if (!id) {

        alert("No hay alerta activa");
        return;

      }

      await closeAlert(id);

      stopLocationTracking();

      setAlertSent(false);
      setAlertId(null);

      localStorage.removeItem("alertId");

      setIsActivated(false);
      setCountdown(0);

      alert("Alerta cerrada");

    } catch (error) {

      console.error("Error cerrando alerta:", error);

      alert("No se pudo cerrar la alerta");

    }

  };

  return (

    <IonPage>

      <IonHeader>
        <IonToolbar>
          <IonButton fill="clear" slot="start" onClick={onBack}>
            <IonIcon icon={arrowBackOutline} />
          </IonButton>
          <IonTitle>Emergencia</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent>

        {!isActivated && (

          <IonCard>

            <IonCardContent>

              <h2>Alerta de Emergencia</h2>

              <IonButton
                color="danger"
                style={{ width: 120, height: 120, borderRadius: "50%" }}
                disabled={true}
              >
                SOS
              </IonButton>

            </IonCardContent>

          </IonCard>

        )}

        {isActivated && (

          <IonCard color="danger">

            <IonCardContent>

              <IonIcon icon={warningOutline} style={{ fontSize: "3rem" }} />

              <h2>EMERGENCIA ACTIVADA</h2>

              <p>Enviando alertas a tus contactos</p>

              <h1>{countdown}</h1>

              <IonProgressBar value={(5 - countdown) / 5} />

              <IonButton
                expand="block"
                fill="outline"
                onClick={alertSent ? handleCloseAlert : handleCancel}
              >
                {alertSent ? "Estoy a salvo" : "Cancelar Emergencia"}
              </IonButton>

            </IonCardContent>

          </IonCard>

        )}

        <IonCard>

          <IonCardContent>

            <h3>Contactos de Emergencia</h3>

            {emergencyContacts.length > 0 ? (

              emergencyContacts.map((contact, index) => (

                <div key={index} style={{ marginBottom: 10 }}>

                  <div>{contact.alias || contact.name}</div>
                  <div>{contact.phone}</div>

                  <IonButton onClick={() => window.open(`tel:${contact.phone}`)}>
                    <IonIcon icon={callOutline} />
                  </IonButton>

                </div>

              ))

            ) : (

              <p>No tienes contactos configurados</p>

            )}

          </IonCardContent>

        </IonCard>

      </IonContent>

    </IonPage>

  );

};