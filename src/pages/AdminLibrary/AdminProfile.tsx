import React from 'react';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonCard,
  IonCardContent,
  IonIcon,
  IonButton,
  IonText,
} from '@ionic/react';
import { logOutOutline, shieldCheckmarkOutline, mailOutline, idCardOutline } from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import { clearAuthState, getSession } from '../../services/sessionService';

const AdminProfile: React.FC = () => {
  const history = useHistory();
  const session = getSession();

  const handleLogout = () => {
    clearAuthState();
    history.replace('/');
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar style={{ '--background': 'linear-gradient(135deg, #fce7f3 0%, #f9d7e8 100%)', '--color': '#7a284a' }}>
          <IonTitle style={{ fontWeight: 700, textAlign: 'center' }}>Perfil Administrador</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent style={{ '--background': '#fff8fc' }}>
        <div style={{ padding: '16px' }}>
          <IonCard style={{ borderRadius: '20px', boxShadow: '0 12px 26px rgba(122, 40, 74, 0.12)', border: '1px solid #f4cde0' }}>
            <IonCardContent style={{ padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <div
                  style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'linear-gradient(135deg, #e879b3 0%, #be185d 100%)',
                    color: '#fff',
                  }}
                >
                  <IonIcon icon={shieldCheckmarkOutline} style={{ fontSize: '1.8rem' }} />
                </div>
                <div>
                  <h2 style={{ margin: 0, color: '#7a284a', fontWeight: 800 }}>ADMIN</h2>
                  <p style={{ margin: '4px 0 0', color: '#915067', fontSize: '0.9rem' }}>
                    Acceso de administración habilitado
                  </p>
                </div>
              </div>

              <div
                style={{
                  border: '1px solid #f4cde0',
                  borderRadius: '14px',
                  padding: '12px',
                  marginBottom: '10px',
                  background: '#fff8fc',
                }}
              >
                <p style={{ margin: 0, color: '#915067', fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.3px' }}>
                  <IonIcon icon={mailOutline} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
                  EMAIL DE SESION
                </p>
                <p style={{ margin: '6px 0 0', color: '#7a284a', fontWeight: 600 }}>{session?.email || 'Sin email en sesión'}</p>
              </div>

              <div
                style={{
                  border: '1px solid #f4cde0',
                  borderRadius: '14px',
                  padding: '12px',
                  marginBottom: '18px',
                  background: '#fff8fc',
                }}
              >
                <p style={{ margin: 0, color: '#915067', fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.3px' }}>
                  <IonIcon icon={idCardOutline} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
                  ID DE USUARIA
                </p>
                <p style={{ margin: '6px 0 0', color: '#7a284a', fontWeight: 600 }}>{session?.userId || '-'}</p>
              </div>

              <IonButton
                expand="block"
                onClick={handleLogout}
                style={{
                  '--background': 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)',
                  '--border-radius': '14px',
                  '--box-shadow': '0 10px 20px rgba(185, 28, 28, 0.35)',
                  height: '52px',
                  fontWeight: 700,
                }}
              >
                <IonIcon icon={logOutOutline} slot="start" />
                Cerrar sesión
              </IonButton>
            </IonCardContent>
          </IonCard>

          <IonText color="medium">
            <p style={{ textAlign: 'center', fontSize: '0.85rem' }}>
              Este perfil es exclusivo para administración.
            </p>
          </IonText>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default AdminProfile;
