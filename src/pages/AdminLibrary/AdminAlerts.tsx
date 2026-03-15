import React from 'react';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonIcon,
  IonText,
} from '@ionic/react';
import { alertCircleOutline } from 'ionicons/icons';

const AdminAlerts: React.FC = () => {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonTitle>Alertas</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '60vh',
            gap: '1rem',
            padding: '2rem',
            textAlign: 'center',
          }}
        >
          <IonIcon
            icon={alertCircleOutline}
            style={{ fontSize: '4rem', color: 'var(--ion-color-primary)' }}
          />
          <IonText color="medium">
            <h2 style={{ margin: 0 }}>Alertas</h2>
            <p>Próximamente podrás ver y gestionar las alertas de emergencia aquí.</p>
          </IonText>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default AdminAlerts;
