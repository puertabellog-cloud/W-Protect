import React, { useState, useEffect } from 'react';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonButton,
  IonIcon,
  IonButtons,
  IonBackButton,
  IonSpinner,
  IonRefresher,
  IonRefresherContent
} from '@ionic/react';
import {
  personOutline,
  libraryOutline
} from 'ionicons/icons';
import { useParams, useHistory } from 'react-router-dom';
import './PerfilUsuaria.css';

interface RouteParams {
  userId: string;
}

const PerfilUsuaria: React.FC = () => {
  const { userId } = useParams<RouteParams>();
  const history = useHistory();
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    loadCurrentUser();
  }, [userId]);

  const loadCurrentUser = () => {
    const userData = localStorage.getItem('w-protect-user');
    if (userData) {
      setCurrentUser(JSON.parse(userData));
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonButtons slot="start">
              <IonBackButton defaultHref="/profile" />
            </IonButtons>
            <IonTitle>Perfil de Usuario</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <div className="loading-profile">
            <IonCard>
              <IonCardContent>
                <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                  <IonSpinner name="crescent" />
                  <p style={{ marginTop: '20px', color: '#666' }}>
                    Cargando perfil...
                  </p>
                </div>
              </IonCardContent>
            </IonCard>
          </div>
        </IonContent>
      </IonPage>
    );
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/profile" />
          </IonButtons>
          <IonTitle>Perfil de Usuario</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonRefresher slot="fixed" onIonRefresh={() => window.location.reload()}>
          <IonRefresherContent pullingText="Desliza para actualizar..." refreshingText="Actualizando...">
          </IonRefresherContent>
        </IonRefresher>

        <div className="profile-container">
          <IonCard className="profile-header-card">
            <IonCardContent>
              <div className="profile-info">
                <div className="profile-avatar">
                  <div className="avatar-placeholder">
                    <IonIcon icon={personOutline} size="large" />
                  </div>
                </div>
                <div className="profile-details">
                  <h2>Usuario {userId}</h2>
                  <p className="profile-email">ID: {userId}</p>
                  <div className="profile-stats">
                    <div className="stat-item">
                      <IonIcon icon={libraryOutline} />
                      <span>Ver Biblioteca de Recursos</span>
                    </div>
                  </div>
                </div>
              </div>
            </IonCardContent>
          </IonCard>

          <IonCard>
            <IonCardHeader>
              <IonCardTitle style={{ display: 'flex', alignItems: 'center' }}>
                <IonIcon icon={libraryOutline} style={{ marginRight: '8px' }} />
                Recursos Disponibles
              </IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <IonButton 
                expand="block" 
                fill="outline" 
                onClick={() => history.push('/recursos')}
              >
                <IonIcon icon={libraryOutline} slot="start" />
                Ir a Biblioteca de Recursos
              </IonButton>
            </IonCardContent>
          </IonCard>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default PerfilUsuaria;