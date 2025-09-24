import React from 'react';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonIcon,
  IonCard,
  IonCardContent
} from '@ionic/react';
import { arrowBackOutline } from 'ionicons/icons';

interface ComingSoonScreenProps {
  feature: string;
  onBack: () => void;
}

export const ComingSoonScreen: React.FC<ComingSoonScreenProps> = ({ feature, onBack }) => {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar style={{ '--background': 'var(--primary)', '--color': 'var(--primary-foreground)' }}>
          <IonButton
            fill="clear"
            slot="start"
            onClick={onBack}
            style={{ '--color': 'var(--primary-foreground)' }}
          >
            <IonIcon icon={arrowBackOutline} />
          </IonButton>
          <IonTitle>{feature}</IonTitle>
        </IonToolbar>
      </IonHeader>
      
      <IonContent style={{ 
        '--background': 'linear-gradient(135deg, var(--womxi-pink-50), var(--womxi-purple-50))'
      }}>
        <div style={{ 
          padding: '40px 20px', 
          textAlign: 'center',
          minHeight: '70vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <IonCard style={{
            '--background': 'var(--card)',
            '--color': 'var(--card-foreground)',
            borderRadius: 'var(--radius)',
            border: '1px solid var(--border)',
            maxWidth: '400px',
            width: '100%'
          }}>
            <IonCardContent style={{ padding: '40px' }}>
              <div style={{
                width: '80px',
                height: '80px',
                background: 'linear-gradient(135deg, var(--womxi-pink-500), var(--womxi-purple-600))',
                borderRadius: 'var(--radius)',
                margin: '0 auto 24px auto',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '3rem'
              }}>
                🚧
              </div>
              
              <h2 style={{ 
                fontSize: '1.5rem',
                fontWeight: 'var(--font-weight-medium)',
                color: 'var(--foreground)',
                marginBottom: '16px'
              }}>
                Próximamente
              </h2>
              
              <p style={{ 
                color: 'var(--muted-foreground)',
                lineHeight: '1.5',
                marginBottom: '32px'
              }}>
                Estamos trabajando en la funcionalidad de <strong>{feature.toLowerCase()}</strong>. 
                ¡Mantente atenta a las actualizaciones!
              </p>
              
              <IonButton
                expand="block"
                onClick={onBack}
                style={{
                  '--background': 'var(--primary)',
                  '--color': 'var(--primary-foreground)',
                  borderRadius: 'var(--radius)'
                }}
              >
                Volver al Dashboard
              </IonButton>
            </IonCardContent>
          </IonCard>
        </div>
      </IonContent>
    </IonPage>
  );
};