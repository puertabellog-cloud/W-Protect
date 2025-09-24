import React from 'react';
import {
  IonCard,
  IonCardContent,
  IonIcon,
  IonButton,
  IonGrid,
  IonRow,
  IonCol,
  IonText
} from '@ionic/react';
import {
  warningOutline,
  locationOutline,
  chatbubblesOutline,
  bookOutline,
  documentTextOutline,
  shieldCheckmarkOutline
} from 'ionicons/icons';

interface DashboardProps {
  onFeatureSelect: (feature: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onFeatureSelect }) => {
  const features = [
    {
      id: 'emergency',
      title: 'Emergencia',
      description: 'Activar alerta de emergencia',
      icon: warningOutline,
      color: 'var(--womxi-emergency)',
      urgent: true
    },
    {
      id: 'location',
      title: 'Localización',
      description: 'Compartir ubicación en tiempo real',
      icon: locationOutline,
      color: 'var(--womxi-blue-500)'
    },
    {
      id: 'chat',
      title: 'Chat',
      description: 'Centro de comunicación segura',
      icon: chatbubblesOutline,
      color: 'var(--womxi-purple-500)'
    },
    {
      id: 'resources',
      title: 'Recursos',
      description: 'Información y ayuda disponible',
      icon: bookOutline,
      color: 'var(--womxi-pink-500)'
    },
    {
      id: 'requests',
      title: 'Solicitudes',
      description: 'Gestionar solicitudes de ayuda',
      icon: documentTextOutline,
      color: 'var(--womxi-safe)'
    }
  ];

  return (
    <div style={{ backgroundColor: 'var(--background)', minHeight: '100vh' }}>
      {/* Welcome Section */}
      <IonCard style={{ 
        '--background': 'linear-gradient(135deg, var(--womxi-pink-50), var(--womxi-purple-50))',
        '--color': 'var(--foreground)',
        margin: '16px',
        borderRadius: 'var(--radius)',
        border: '1px solid var(--border)'
      }}>
        <IonCardContent className="ion-padding">
          <div style={{ textAlign: 'center' }}>
            <IonIcon 
              icon={shieldCheckmarkOutline} 
              style={{ 
                fontSize: '3rem', 
                color: 'var(--primary)',
                marginBottom: '1rem'
              }} 
            />
            <h2 style={{ 
              color: 'var(--primary)', 
              marginBottom: '0.5rem',
              fontWeight: 'var(--font-weight-medium)'
            }}>
              Bienvenida a W-Protect
            </h2>
            <IonText color="medium">
              <p style={{ color: 'var(--muted-foreground)' }}>
                Tu seguridad es nuestra prioridad. Accede a todas las herramientas de protección.
              </p>
            </IonText>
          </div>
        </IonCardContent>
      </IonCard>

      {/* Features Grid */}
      <div style={{ padding: '0 16px' }}>
        <IonGrid>
          {/* Emergency Button - Full Width */}
          <IonRow>
            <IonCol size="12">
              <IonCard 
                button
                onClick={() => onFeatureSelect('emergency')}
                style={{
                  '--background': 'var(--womxi-emergency)',
                  '--color': 'white',
                  borderRadius: 'var(--radius)',
                  margin: '0',
                  boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)'
                }}
              >
                <IonCardContent style={{ textAlign: 'center', padding: '24px' }}>
                  <IonIcon 
                    icon={warningOutline} 
                    style={{ fontSize: '3rem', marginBottom: '12px' }} 
                  />
                  <h3 style={{ 
                    fontSize: '1.5rem', 
                    fontWeight: 'bold', 
                    margin: '0 0 8px 0' 
                  }}>
                    EMERGENCIA
                  </h3>
                  <p style={{ margin: '0', opacity: 0.9 }}>
                    Toca para activar alerta inmediata
                  </p>
                </IonCardContent>
              </IonCard>
            </IonCol>
          </IonRow>

          {/* Other Features - 2x2 Grid */}
          <IonRow>
            {features.slice(1).map((feature) => (
              <IonCol size="6" key={feature.id}>
                <IonCard 
                  button
                  onClick={() => onFeatureSelect(feature.id)}
                  style={{
                    '--background': 'var(--card)',
                    '--color': 'var(--card-foreground)',
                    borderRadius: 'var(--radius)',
                    border: `1px solid var(--border)`,
                    margin: '0',
                    height: '140px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                  }}
                >
                  <IonCardContent style={{ 
                    textAlign: 'center', 
                    padding: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    height: '100%'
                  }}>
                    <IonIcon 
                      icon={feature.icon} 
                      style={{ 
                        fontSize: '2.5rem', 
                        color: feature.color,
                        marginBottom: '8px'
                      }} 
                    />
                    <h4 style={{ 
                      fontSize: '1rem', 
                      fontWeight: 'var(--font-weight-medium)',
                      margin: '0 0 4px 0',
                      color: 'var(--foreground)'
                    }}>
                      {feature.title}
                    </h4>
                    <p style={{ 
                      fontSize: '0.8rem',
                      margin: '0',
                      color: 'var(--muted-foreground)',
                      lineHeight: '1.2'
                    }}>
                      {feature.description}
                    </p>
                  </IonCardContent>
                </IonCard>
              </IonCol>
            ))}
          </IonRow>
        </IonGrid>
      </div>
    </div>
  );
};