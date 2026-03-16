import React, { useState, useEffect } from 'react';
import { saveAlert, closeAlert, getAlertStatusById } from '../../services/springBootServices';
import { startLocationTracking, stopTracking } from '../../services/locationTrackingService';
import { getSession } from '../../services/sessionService';

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
  const ALERT_META_KEY = 'alertMeta';

  const [isActivated, setIsActivated] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>([]);
  const [alertSent, setAlertSent] = useState(false);
  const [alertId, setAlertId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  
  // Estados para tracking y UI
  const [isTracking, setIsTracking] = useState(false);
  const [trackingError, setTrackingError] = useState<string | null>(null);
  const [alertStatus, setAlertStatus] = useState<'ACTIVE' | 'CLOSED' | 'EXPIRED'>('ACTIVE');
  const [expiresAt, setExpiresAt] = useState<string | null>(null);

  const normalizeStatus = (raw?: string | null): 'ACTIVE' | 'CLOSED' | 'EXPIRED' => {
    const status = (raw ?? '').trim().toUpperCase();
    if (!status) return 'ACTIVE';
    if (status.includes('CLOSE') || status.includes('RESOL') || status === 'INACTIVE') return 'CLOSED';
    if (status.includes('EXPIR')) return 'EXPIRED';
    return 'ACTIVE';
  };

  const resetAlertVisualState = (reason: string, status: 'CLOSED' | 'EXPIRED' = 'EXPIRED') => {
    stopTracking(reason);
    setIsTracking(false);
    setIsActivated(false);
    setAlertSent(false);
    setCountdown(0);
    setAlertStatus(status);
    setAlertId(null);
    setExpiresAt(null);
    localStorage.removeItem('alertId');
    localStorage.removeItem(ALERT_META_KEY);
  };

  const persistAlertMeta = (meta: { id: number; status: string; expiresAt?: string | null }) => {
    localStorage.setItem(ALERT_META_KEY, JSON.stringify(meta));
  };

  /* =========================
     Cargar perfil del usuario y contactos guardados
  ========================== */

  useEffect(() => {

    const savedContacts = localStorage.getItem('emergencyContacts');

    if (savedContacts) {
      setEmergencyContacts(JSON.parse(savedContacts));
    }

    const session = getSession();
    if (session?.userId) {
      setCurrentUserId(session.userId);
    } else {
      console.warn('No hay sesión activa con userId para emergencia.');
    }

  }, []);

  /* =========================
     Activar automáticamente si no hay alerta activa
  ========================== */

  useEffect(() => {

    // Verificar si ya hay una alerta activa
    const stored = localStorage.getItem("alertId");
    const storedMetaRaw = localStorage.getItem(ALERT_META_KEY);
    
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

      const storedMeta = storedMetaRaw ? JSON.parse(storedMetaRaw) : null;
      const restoredStatus = normalizeStatus(storedMeta?.status);
      const restoredExpiresAt = storedMeta?.expiresAt ?? null;

      setAlertId(id);
      setAlertSent(restoredStatus === 'ACTIVE');
      setAlertStatus(restoredStatus);
      setExpiresAt(restoredExpiresAt);
      setIsActivated(restoredStatus === 'ACTIVE');

      const expiredLocally = restoredExpiresAt ? Date.now() >= new Date(restoredExpiresAt).getTime() : false;

      if (restoredStatus !== 'ACTIVE' || expiredLocally) {
        resetAlertVisualState('restore_expired_or_closed', expiredLocally ? 'EXPIRED' : 'CLOSED');
        return;
      }

      const timer = setTimeout(() => {
        setIsTracking(true);
        startLocationTracking(id, {
          onLocationUpdate: (loc) => {
            console.log("📍 Ubicación enviada:", loc);
            setTrackingError(null);
          },
          onError: (err) => {
            console.warn("❌ Error tracking:", err);
            setTrackingError(err);
          },
          onAlertExpired: () => {
            console.log("⏰ Alerta expirada - Deteniendo tracking");
            resetAlertVisualState('tracking_onAlertExpired', 'EXPIRED');
            setTrackingError('La alerta ya no está activa');
          }
        });
      }, 1000);

      return () => {
        clearTimeout(timer);
        stopTracking('useEffect_cleanup');
        setIsTracking(false);
      };

    }

  }, []);

  /* =========================
     Auto-cierre visual por expiresAt
  ========================== */

  useEffect(() => {
    if (!alertSent || !alertId || !expiresAt) return;

    const expiresAtMs = new Date(expiresAt).getTime();
    if (Number.isNaN(expiresAtMs)) return;

    const remaining = expiresAtMs - Date.now();
    if (remaining <= 0) {
      resetAlertVisualState('local_expiration_check', 'EXPIRED');
      return;
    }

    const timeoutId = setTimeout(() => {
      setTrackingError('La alerta expiró localmente por tiempo');
      resetAlertVisualState('local_expiration_timeout', 'EXPIRED');
    }, remaining);

    return () => clearTimeout(timeoutId);
  }, [alertSent, alertId, expiresAt]);

  /* =========================
     Polling de sincronización con backend (cada 3s)
  ========================== */

  useEffect(() => {
    if (!alertSent || !alertId) return;

    let cancelled = false;
    const intervalId = setInterval(async () => {
      try {
        const remote = await getAlertStatusById(alertId);

        // Si backend aún no tiene endpoint de estado, mantenemos fallback local por expiresAt.
        if (!remote || cancelled) return;

        const remoteStatus = normalizeStatus((remote as any).status ?? (remote as any).estado ?? (remote as any).state);
        const remoteExpiresAt = (remote as any).expiresAt ?? expiresAt;
        if (remoteExpiresAt) {
          setExpiresAt(remoteExpiresAt);
        }

        persistAlertMeta({ id: alertId, status: remoteStatus, expiresAt: remoteExpiresAt ?? null });

        if (remoteStatus === 'CLOSED') {
          resetAlertVisualState('polling_backend_closed', 'CLOSED');
        } else if (remoteStatus === 'EXPIRED') {
          resetAlertVisualState('polling_backend_expired', 'EXPIRED');
        }
      } catch (error) {
        // No bloqueamos UX si falla polling; fallback local sigue activo por expiresAt.
        console.warn('No se pudo sincronizar estado de alerta con backend:', error);
      }
    }, 3000);

    return () => {
      cancelled = true;
      clearInterval(intervalId);
    };
  }, [alertSent, alertId, expiresAt]);

  /* =========================
     Cleanup - React Strict Mode safe
  ========================== */

  useEffect(() => {

    return () => {
      console.log("🧹 Component unmount - Stopping tracking");
      stopTracking('component_unmount');
      setIsTracking(false);
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
      const savedStatus = normalizeStatus(savedAlert?.status ?? savedAlert?.estado ?? savedAlert?.state ?? 'ACTIVE');
      const savedExpiresAt: string | null = savedAlert?.expiresAt ?? null;

      if (id && savedStatus === 'ACTIVE') {

        setAlertId(id);
        localStorage.setItem("alertId", String(id));
        persistAlertMeta({ id, status: savedStatus, expiresAt: savedExpiresAt });
        setAlertSent(true);
        setExpiresAt(savedExpiresAt);
        setIsActivated(true);

        console.log("Alerta creada con ID:", id);

        setIsTracking(true);
        setAlertStatus(savedStatus);
        startLocationTracking(id, {
          onLocationUpdate: (loc) => {
            console.log("📍 Ubicación enviada:", loc);
            setTrackingError(null);
          },
          onError: (err) => {
            console.warn("❌ Error tracking:", err);
            setTrackingError(err);
          },
          onAlertExpired: () => {
            console.log("⏰ Alerta expirada desde envío");
            resetAlertVisualState('tracking_onAlertExpired_from_send', 'EXPIRED');
            setTrackingError('La alerta ya no está activa');
          }
        });

        alert("Alerta enviada. Contactos notificados.");

      } else {

        alert("Alerta enviada pero no se recibió ID del servidor.");
        setIsActivated(false);
        setCountdown(0);

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
      resetAlertVisualState('alert_closed', 'CLOSED');
      setTrackingError(null);

      alert("Alerta cerrada");

    } catch (error) {

      console.error("Error cerrando alerta:", error);

      alert("No se pudo cerrar la alerta");

    }

  };

  const pageStyles = `
    .emergency-page {
      --background: linear-gradient(180deg, #fff7fb 0%, #ffffff 100%);
    }

    .emergency-shell {
      padding: 18px 16px 28px;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .hero-card {
      border-radius: 22px;
      background: linear-gradient(145deg, #ffffff 0%, #fff2f8 100%);
      border: 1px solid rgba(236, 72, 153, 0.15);
      box-shadow: 0 14px 28px rgba(236, 72, 153, 0.14);
      overflow: hidden;
    }

    .hero-content {
      padding: 22px 18px;
      text-align: center;
    }

    .hero-title {
      margin: 0 0 4px;
      font-size: 1.35rem;
      font-weight: 800;
      color: #1f2937;
      letter-spacing: 0.2px;
    }

    .hero-subtitle {
      margin: 0;
      color: #64748b;
      font-size: 0.93rem;
    }

    .panic-wrap {
      margin: 18px 0 14px;
      display: flex;
      justify-content: center;
    }

    .panic-button {
      width: 156px;
      height: 156px;
      border-radius: 999px;
      border: 0;
      color: #ffffff;
      font-size: 1.85rem;
      font-weight: 900;
      letter-spacing: 1px;
      background: radial-gradient(circle at 30% 25%, #fb7185 0%, #e11d48 55%, #be123c 100%);
      box-shadow: 0 16px 34px rgba(225, 29, 72, 0.35), inset 0 2px 8px rgba(255, 255, 255, 0.2);
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.18s ease, box-shadow 0.2s ease, filter 0.2s ease;
      cursor: pointer;
      user-select: none;
    }

    .panic-button:active {
      transform: scale(0.94);
      filter: brightness(0.95);
    }

    .panic-button.countdown {
      animation: panicPulse 0.85s ease-in-out infinite;
    }

    .panic-button.sent {
      background: radial-gradient(circle at 30% 25%, #fb7185 0%, #db2777 52%, #9d174d 100%);
      box-shadow: 0 14px 30px rgba(190, 24, 93, 0.34), inset 0 2px 8px rgba(255, 255, 255, 0.2);
    }

    @keyframes panicPulse {
      0% {
        transform: scale(1);
      }
      50% {
        transform: scale(1.08);
      }
      100% {
        transform: scale(1);
      }
    }

    .timer-chip {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 8px 14px;
      border-radius: 999px;
      background: rgba(190, 24, 93, 0.12);
      color: #9d174d;
      font-size: 0.9rem;
      font-weight: 700;
      margin-bottom: 14px;
    }

    .count-value {
      font-size: 2.1rem;
      margin: 4px 0 12px;
      color: #b91c1c;
      font-weight: 900;
      letter-spacing: 0.5px;
    }

    .status-text {
      margin: 0 0 8px;
      color: #334155;
      font-size: 0.9rem;
    }

    .status-warning {
      color: #b45309;
      font-weight: 700;
    }

    .progress-wrap {
      margin-bottom: 14px;
      border-radius: 999px;
      overflow: hidden;
    }

    .cancel-button {
      --border-radius: 14px;
      --border-color: #f9a8d4;
      --color: #9d174d;
      font-weight: 700;
      height: 46px;
      margin-top: 6px;
    }

    .contacts-card {
      border-radius: 20px;
      background: #ffffff;
      border: 1px solid rgba(236, 72, 153, 0.12);
      box-shadow: 0 10px 22px rgba(236, 72, 153, 0.1);
      overflow: hidden;
    }

    .contacts-title {
      margin: 0 0 14px;
      font-size: 1.1rem;
      font-weight: 800;
      color: #1f2937;
    }

    .contact-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      padding: 12px;
      border: 1px solid #fce7f3;
      border-radius: 14px;
      background: #fff8fc;
      margin-bottom: 10px;
    }

    .contact-row:last-child {
      margin-bottom: 0;
    }

    .contact-name {
      margin: 0 0 4px;
      font-size: 0.98rem;
      font-weight: 700;
      color: #1f2937;
    }

    .contact-phone {
      margin: 0;
      color: #64748b;
      font-size: 0.86rem;
    }

    .call-button {
      --background: linear-gradient(135deg, #ec4899 0%, #be185d 100%);
      --border-radius: 12px;
      --box-shadow: 0 8px 16px rgba(190, 24, 93, 0.28);
      min-width: 46px;
      height: 42px;
      margin: 0;
    }

    .contacts-empty {
      margin: 0;
      color: #64748b;
      background: #fff8fc;
      border: 1px dashed #f9a8d4;
      border-radius: 14px;
      padding: 14px;
      text-align: center;
    }
  `;

  return (

    <IonPage>
      <style>{pageStyles}</style>

      <IonHeader>
        <IonToolbar style={{ '--background': 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)', '--color': 'white' }}>
          <IonButton fill="clear" slot="start" onClick={onBack}>
            <IonIcon icon={arrowBackOutline} style={{ color: 'white' }} />
          </IonButton>
          <IonTitle style={{ fontWeight: 700 }}>Emergencia</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="emergency-page">
        <div className="emergency-shell">

        {!isActivated && (

          <IonCard className="hero-card">

            <IonCardContent className="hero-content">

              <h2 className="hero-title">Alerta de Emergencia</h2>
              <p className="hero-subtitle">Si necesitas ayuda inmediata, activa el boton SOS.</p>

              <div className="panic-wrap">
                <button
                  type="button"
                  className="panic-button"
                  onClick={handleEmergencyActivation}
                  disabled={isSubmitting}
                >
                  SOS
                </button>
              </div>

            </IonCardContent>

          </IonCard>

        )}

        {isActivated && (

          <IonCard className="hero-card">

            <IonCardContent className="hero-content">

              <IonIcon icon={warningOutline} style={{ fontSize: '2.8rem', color: '#be123c' }} />

              <h2 className="hero-title">EMERGENCIA ACTIVADA</h2>

              <p className="hero-subtitle">Enviando alertas a tus contactos</p>

              <div className="panic-wrap">
                <button
                  type="button"
                  className={`panic-button ${!alertSent ? 'countdown' : 'sent'}`}
                >
                  SOS
                </button>
              </div>

              <div className="timer-chip">Cuenta regresiva activa</div>
              
              {isTracking && (
                <p className="status-text">Rastreando ubicacion en tiempo real...</p>
              )}
              
              {trackingError && (
                <p className="status-text status-warning">Atencion: {trackingError}</p>
              )}
              
              {alertStatus === 'EXPIRED' && (
                <p className="status-text status-warning">La alerta expiro</p>
              )}

              <h1 className="count-value">{countdown}</h1>

              <div className="progress-wrap">
                <IonProgressBar value={(5 - countdown) / 5} color="danger" />
              </div>

              <IonButton
                expand="block"
                fill="outline"
                onClick={alertSent ? handleCloseAlert : handleCancel}
                className="cancel-button"
              >
                {alertSent ? "Estoy a salvo" : "Cancelar Emergencia"}
              </IonButton>

            </IonCardContent>

          </IonCard>

        )}

        <IonCard className="contacts-card">

          <IonCardContent>

            <h3 className="contacts-title">Contactos de Emergencia</h3>

            {emergencyContacts.length > 0 ? (

              emergencyContacts.map((contact, index) => (

                <div key={index} className="contact-row">

                  <div>
                    <p className="contact-name">{contact.alias || contact.name}</p>
                    <p className="contact-phone">{contact.phone}</p>
                  </div>

                  <IonButton className="call-button" onClick={() => window.open(`tel:${contact.phone}`)}>
                    <IonIcon icon={callOutline} />
                  </IonButton>

                </div>

              ))

            ) : (

              <p className="contacts-empty">No tienes contactos configurados</p>

            )}

          </IonCardContent>

        </IonCard>

        </div>

      </IonContent>

    </IonPage>

  );

};