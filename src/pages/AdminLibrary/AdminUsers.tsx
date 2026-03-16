import React, { useEffect, useState } from 'react';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonIcon,
  IonText,
  IonList,
  IonItem,
  IonLabel,
  IonBadge,
  IonSpinner,
  IonToast,
} from '@ionic/react';
import { peopleOutline } from 'ionicons/icons';
import { getAllUsersForAdmin } from '../../services/springBootServices';
import { User } from '../../types';
import { normalizeProfile } from '../../services/sessionService';

const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showError, setShowError] = useState(false);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        setLoading(true);
        const data = await getAllUsersForAdmin();
        setUsers(data);
      } catch (error) {
        console.error('Error cargando usuarios admin:', error);
        setShowError(true);
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, []);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar style={{ '--background': 'linear-gradient(135deg, #fce7f3 0%, #f9d7e8 100%)', '--color': '#7a284a' }}>
          <IonTitle style={{ fontWeight: 700, textAlign: 'center' }}>Usuarios</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent style={{ '--background': '#fff8fc' }}>
        {loading ? (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '50vh',
            }}
          >
            <IonSpinner />
          </div>
        ) : users.length === 0 ? (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '50vh',
              gap: '1rem',
              padding: '2rem',
              textAlign: 'center',
              background: '#fff',
              margin: '16px',
              borderRadius: '18px',
              border: '1px solid #f4cde0',
              boxShadow: '0 10px 22px rgba(122, 40, 74, 0.08)',
            }}
          >
            <IonIcon
              icon={peopleOutline}
              style={{ fontSize: '4rem', color: '#b33f72' }}
            />
            <IonText color="medium">
              <h2 style={{ margin: 0 }}>Sin usuarios para mostrar</h2>
              <p>No se encontraron usuarios registrados.</p>
              <p style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}>
                Si ya existen usuarios en BD, el backend está respondiendo vacío y debe devolver un JSON de lista.
              </p>
            </IonText>
          </div>
        ) : (
          <IonList style={{ background: 'transparent', padding: '10px 12px' }}>
            {users.map(user => {
              const profile = normalizeProfile(user.profile);

              return (
              <IonItem key={user.id ?? `${user.email}-${user.deviceId ?? 'no-device'}`} style={{ '--background': '#fff', borderRadius: '14px', marginBottom: '10px', '--padding-start': '14px', '--padding-end': '10px', border: '1px solid #f4cde0', boxShadow: '0 8px 20px rgba(122, 40, 74, 0.06)' }}>
                <IonLabel>
                  <h2>{user.name}</h2>
                  <p>{user.email}</p>
                  <p>{user.phone}</p>
                </IonLabel>
                <IonBadge color={profile === 'ADMIN' ? 'tertiary' : 'primary'} style={{ fontWeight: 700, padding: '6px 10px', borderRadius: '10px' }}>
                  {profile || 'USER'}
                </IonBadge>
              </IonItem>
            )})}
          </IonList>
        )}

        <IonToast
          isOpen={showError}
          onDidDismiss={() => setShowError(false)}
          message="No se pudieron cargar los usuarios. Verifica el endpoint del backend."
          duration={3000}
          color="danger"
        />
      </IonContent>
    </IonPage>
  );
};

export default AdminUsers;
