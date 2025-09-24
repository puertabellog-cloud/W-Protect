import React, { useState, useEffect } from 'react';
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
  IonText,
  IonGrid,
  IonRow,
  IonCol,
  IonProgressBar
} from '@ionic/react';
import { 
  arrowBackOutline, 
  warningOutline, 
  callOutline, 
  locationOutline,
  chatbubbleOutline,
  timeOutline,
  alertCircleOutline,
  medkitOutline,
  helpCircleOutline,
  shieldOutline,
  carOutline,
  homeOutline
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
  const [emergencyType, setEmergencyType] = useState<string | null>(null);
  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>([]);

  const emergencyTypes = [
    { id: 'harassment', label: 'Acoso', color: 'var(--womxi-warning)', icon: alertCircleOutline },
    { id: 'unsafe-area', label: 'Zona Insegura', color: 'var(--womxi-warning)', icon: warningOutline },
    { id: 'medical', label: 'Emergencia Médica', color: 'var(--womxi-emergency)', icon: medkitOutline },
    { id: 'other', label: 'Otra Emergencia', color: 'var(--womxi-purple-500)', icon: helpCircleOutline }
  ];

  // Cargar contactos de emergencia desde localStorage
  useEffect(() => {
    const savedContacts = localStorage.getItem('emergencyContacts');
    if (savedContacts) {
      setEmergencyContacts(JSON.parse(savedContacts));
    }
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isActivated && countdown > 0) {
      interval = setInterval(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
    } else if (isActivated && countdown === 0) {
      // Aquí iría la lógica real de emergencia
      console.log('¡EMERGENCIA ACTIVADA!');
    }

    return () => clearInterval(interval);
  }, [isActivated, countdown]);

  const handleEmergencyActivation = () => {
    setIsActivated(true);
    setCountdown(10);
  };

  const handleCancel = () => {
    setIsActivated(false);
    setCountdown(0);
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar style={{ 
          '--background': 'var(--card)', 
          '--color': 'var(--foreground)',
          borderBottom: '1px solid var(--border)'
        }}>
          <IonButton
            fill="clear"
            slot="start"
            onClick={onBack}
            style={{ '--color': 'var(--foreground)' }}
          >
            <IonIcon icon={arrowBackOutline} />
          </IonButton>
          <IonTitle style={{ fontSize: '1.1rem' }}>Emergencia</IonTitle>
        </IonToolbar>
      </IonHeader>
      
      <IonContent style={{ 
        '--background': 'var(--background)',
        '--color': 'var(--foreground)'
      }}>
        <div style={{ padding: '12px' }}>
          
          {!isActivated ? (
            <>
              {/* Tarjeta Principal SOS */}
              <IonCard style={{
                '--background': 'var(--card)',
                '--color': 'var(--card-foreground)',
                borderRadius: '16px',
                border: '1px solid var(--border)',
                marginBottom: '16px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
              }}>
                <IonCardContent style={{ padding: '20px', textAlign: 'center' }}>
                  <h2 style={{ 
                    fontSize: '1.1rem', 
                    fontWeight: '600', 
                    marginBottom: '12px',
                    color: 'var(--foreground)'
                  }}>
                    Alerta de Emergencia
                  </h2>
                  <p style={{ 
                    color: 'var(--muted-foreground)', 
                    marginBottom: '20px',
                    fontSize: '0.9rem',
                    lineHeight: '1.4'
                  }}>
                    Presiona el botón SOS para enviar tu ubicación a contactos de emergencia
                  </p>
                  
                  {/* Botón SOS Circular Pequeño */}
                  <IonButton
                    style={{
                      '--background': 'var(--womxi-emergency)',
                      '--color': 'white',
                      width: '80px',
                      height: '80px',
                      borderRadius: '50%',
                      fontSize: '1rem',
                      fontWeight: 'bold',
                      margin: '0 auto 16px auto',
                      boxShadow: '0 4px 16px rgba(239, 68, 68, 0.3)'
                    }}
                    onMouseDown={handleEmergencyActivation}
                    onTouchStart={handleEmergencyActivation}
                  >
                    SOS
                  </IonButton>
                  
                  <p style={{ 
                    fontSize: '0.75rem', 
                    color: 'var(--muted-foreground)',
                    margin: 0
                  }}>
                    Mantén presionado para activar
                  </p>
                </IonCardContent>
              </IonCard>

              {/* Selección de Tipo de Emergencia */}
              <IonCard style={{
                '--background': 'var(--card)',
                '--color': 'var(--card-foreground)',
                borderRadius: '16px',
                border: '1px solid var(--border)',
                marginBottom: '16px'
              }}>
                <IonCardContent style={{ padding: '16px' }}>
                  <h3 style={{ 
                    fontSize: '1rem', 
                    fontWeight: '600', 
                    marginBottom: '12px',
                    color: 'var(--foreground)'
                  }}>
                    Tipo de Emergencia
                  </h3>
                  <IonGrid style={{ padding: 0 }}>
                    <IonRow>
                      {emergencyTypes.map((type) => (
                        <IonCol size="6" key={type.id} style={{ padding: '4px' }}>
                          <IonButton
                            expand="block"
                            fill={emergencyType === type.id ? "solid" : "outline"}
                            size="small"
                            style={{
                              '--background': emergencyType === type.id ? type.color : 'transparent',
                              '--color': emergencyType === type.id ? 'white' : 'var(--foreground)',
                              '--border-color': emergencyType === type.id ? type.color : 'var(--border)',
                              height: '44px',
                              fontSize: '0.8rem'
                            }}
                            onClick={() => setEmergencyType(type.id)}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <IonIcon icon={type.icon} style={{ fontSize: '1rem' }} />
                              <span>{type.label}</span>
                            </div>
                          </IonButton>
                        </IonCol>
                      ))}
                    </IonRow>
                  </IonGrid>
                </IonCardContent>
              </IonCard>

              {/* Acciones Rápidas */}
              <IonCard style={{
                '--background': 'var(--card)',
                '--color': 'var(--card-foreground)',
                borderRadius: '16px',
                border: '1px solid var(--border)',
                marginBottom: '16px'
              }}>
                <IonCardContent style={{ padding: '16px' }}>
                  <h3 style={{ 
                    fontSize: '1rem', 
                    fontWeight: '600', 
                    marginBottom: '12px',
                    color: 'var(--foreground)'
                  }}>
                    Acciones Rápidas
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <IonButton
                      expand="block"
                      fill="outline"
                      size="small"
                      style={{
                        '--color': 'var(--foreground)',
                        '--border-color': 'var(--border)',
                        height: '48px',
                        textAlign: 'left',
                        justifyContent: 'flex-start'
                      }}
                    >
                      <IonIcon icon={locationOutline} style={{ marginRight: '10px', color: 'var(--womxi-pink-500)' }} />
                      <div>
                        <div style={{ fontWeight: '500', fontSize: '0.9rem' }}>Compartir Ubicación</div>
                        <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>A contactos de emergencia</div>
                      </div>
                    </IonButton>
                    <IonButton
                      expand="block"
                      fill="outline"
                      size="small"
                      style={{
                        '--color': 'var(--foreground)',
                        '--border-color': 'var(--border)',
                        height: '48px',
                        textAlign: 'left',
                        justifyContent: 'flex-start'
                      }}
                    >
                      <IonIcon icon={chatbubbleOutline} style={{ marginRight: '10px', color: 'var(--womxi-purple-500)' }} />
                      <div>
                        <div style={{ fontWeight: '500', fontSize: '0.9rem' }}>Mensaje de Seguridad</div>
                        <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>Mensaje preescrito</div>
                      </div>
                    </IonButton>
                  </div>
                </IonCardContent>
              </IonCard>
            </>
          ) : (
            <>
              {/* Estado de Emergencia Activada */}
              <IonCard style={{
                '--background': 'var(--womxi-emergency)',
                '--color': 'white',
                borderRadius: '16px',
                border: 'none',
                animation: 'pulse 1s infinite',
                marginBottom: '16px'
              }}>
                <IonCardContent style={{ padding: '24px', textAlign: 'center' }}>
                  <IonIcon 
                    icon={warningOutline} 
                    style={{ fontSize: '3rem', marginBottom: '12px', color: 'white' }} 
                  />
                  <h2 style={{ fontSize: '1.3rem', fontWeight: 'bold', marginBottom: '8px' }}>
                    EMERGENCIA ACTIVADA
                  </h2>
                  <p style={{ color: 'rgba(255,255,255,0.9)', marginBottom: '12px', fontSize: '0.9rem' }}>
                    Enviando alertas a tus contactos...
                  </p>
                  <div style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '12px' }}>
                    {countdown}
                  </div>
                  <IonProgressBar 
                    value={(10 - countdown) / 10} 
                    style={{ marginBottom: '16px', height: '6px' }}
                  />
                  <IonButton
                    expand="block"
                    fill="outline"
                    onClick={handleCancel}
                    style={{
                      '--color': 'white',
                      '--border-color': 'white',
                      '--background': 'rgba(255,255,255,0.1)',
                      height: '44px'
                    }}
                  >
                    Cancelar Emergencia
                  </IonButton>
                </IonCardContent>
              </IonCard>
            </>
          )}

          {/* Contactos de Emergencia */}
          <IonCard style={{
            '--background': 'var(--card)',
            '--color': 'var(--card-foreground)',
            borderRadius: '16px',
            border: '1px solid var(--border)'
          }}>
            <IonCardContent style={{ padding: '16px' }}>
              <h3 style={{ 
                fontSize: '1rem', 
                fontWeight: '600', 
                marginBottom: '12px',
                color: 'var(--foreground)'
              }}>
                Contactos de Emergencia
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {emergencyContacts.length > 0 ? emergencyContacts.map((contact, index) => (
                  <div key={index} style={{
                    padding: '12px',
                    background: 'var(--muted)',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <div>
                      <div style={{ 
                        fontWeight: '500', 
                        color: 'var(--foreground)',
                        fontSize: '0.9rem'
                      }}>
                        {contact.alias || contact.name}
                      </div>
                      <div style={{ 
                        fontSize: '0.8rem', 
                        color: 'var(--muted-foreground)',
                        marginTop: '2px'
                      }}>
                        {contact.phone}
                      </div>
                    </div>
                    <IonButton
                      size="small"
                      style={{
                        '--background': 'var(--womxi-pink-500)',
                        '--color': 'white',
                        width: '32px',
                        height: '32px'
                      }}
                      onClick={() => window.open(`tel:${contact.phone}`)}
                    >
                      <IonIcon icon={callOutline} style={{ fontSize: '1rem' }} />
                    </IonButton>
                  </div>
                )) : (
                  <div style={{
                    padding: '16px',
                    textAlign: 'center',
                    color: 'var(--muted-foreground)'
                  }}>
                    <p style={{ margin: 0, fontSize: '0.9rem' }}>
                      No tienes contactos configurados
                    </p>
                    <p style={{ fontSize: '0.8rem', marginTop: '4px', margin: 0 }}>
                      Ve a Contactos para agregar
                    </p>
                  </div>
                )}
              </div>
            </IonCardContent>
          </IonCard>
        </div>
      </IonContent>
    </IonPage>
  );
};