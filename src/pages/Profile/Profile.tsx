import React, { useState, useEffect } from 'react';
import { patchUserProfile, getUserByEmail } from '../../services/springBootServices';
import { useHistory } from 'react-router-dom';
import { 
  IonPage, 
  IonHeader, 
  IonToolbar, 
  IonTitle, 
  IonContent, 
  IonItem, 
  IonLabel, 
  IonInput, 
  IonTextarea, 
  IonButton,
  IonCard,
  IonCardContent,
  IonRefresher,
  IonRefresherContent,
  IonSkeletonText,
  IonSpinner
} from '@ionic/react';
import { useDevice } from "../../context/DeviceContext";
import { getSession, setSession } from '../../services/sessionService';

const Profile: React.FC = () => {

  const history = useHistory();

  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    mensaje: ''
  });

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [userStats, setUserStats] = useState({
    forumsParticipated: 0,
    articlesRead: 0,
    daysActive: 0
  });

  const { deviceId } = useDevice();

  const handleChange = (event: CustomEvent) => {
    const target = event.target as HTMLInputElement;
    const name = target.name;
    const value = event.detail.value;

    setForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  useEffect(() => {

    const fetchProfile = async () => {

      setInitialLoading(true);

      try {

        let localData: any = null;

        const userData = localStorage.getItem('w-protect-user');
        const registrationData = localStorage.getItem('wprotect_registration');

        if (userData) {
          localData = JSON.parse(userData);
        } else if (registrationData) {
          localData = JSON.parse(registrationData);
        }

        let apiData: any = null;

        if (localData?.email) {
          try {
            apiData = await getUserByEmail(localData.email);
          } catch {
            console.log('Usuario no encontrado en backend aún');
          }
        }

        const data = apiData || localData || {};

        setForm({
          name: data.name ?? '',
          phone: data.phone ?? '',
          email: data.email ?? '',
          mensaje: data.mensaje ?? ''
        });

        setUserStats({
          forumsParticipated: 0,
          articlesRead: parseInt(localStorage.getItem('w-protect-articles-read') || '0'),
          daysActive: 1
        });

      } catch (err) {

        const hasLocalData =
          localStorage.getItem('w-protect-user') ||
          localStorage.getItem('wprotect_registration');

        if (!hasLocalData) {
          setError('No se pudieron cargar los datos del perfil.');
        }

      } finally {
        setInitialLoading(false);
      }

    };

    fetchProfile();

  }, [deviceId]);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const doRefresh = async (event: CustomEvent) => {
    window.location.reload();
    event.detail.complete();
  };

  const handleSubmit = async (e: React.FormEvent) => {

    e.preventDefault();

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {

      const session = getSession();

      if (!session?.userId) {
        throw new Error('No hay usuario en sesión');
      }

      const savedUser = await patchUserProfile(session.userId, {
        name: form.name,
        email: form.email,
        phone: form.phone
      });

      localStorage.setItem('w-protect-user', JSON.stringify(savedUser));

      const registrationData = localStorage.getItem('wprotect_registration');
      if (registrationData) {
        localStorage.setItem('wprotect_registration', JSON.stringify(savedUser));
      }

      setSession({
        ...session,
        email: savedUser.email,
      });

      setSuccess(true);

    } catch (err) {

      setError('Error al guardar el perfil');

    } finally {

      setLoading(false);

    }

  };

  return (

    <IonPage>

      <IonHeader>
        <IonToolbar>
          <IonTitle>Mi Perfil</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent>

        <IonRefresher slot="fixed" onIonRefresh={doRefresh}>
          <IonRefresherContent />
        </IonRefresher>

        {initialLoading ? (

          <div style={{ padding: '20px' }}>

            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
              <div style={{
                width: '120px',
                height: '120px',
                borderRadius: '50%',
                background: '#f0f0f0'
              }}>
                <IonSkeletonText animated style={{ width: '100%', height: '100%' }} />
              </div>
            </div>

            <IonCard>
              <IonCardContent>
                <IonSkeletonText animated style={{ width: '80%', height: '20px' }} />
                <IonSkeletonText animated style={{ width: '60%', height: '16px' }} />
                <IonSkeletonText animated style={{ width: '70%', height: '16px' }} />
              </IonCardContent>
            </IonCard>

          </div>

        ) : (

          <>
            <div style={{
              background: 'linear-gradient(135deg, #d946ef 0%, #ec4899 100%)',
              padding: '40px 20px',
              textAlign: 'center',
              color: 'white'
            }}>

              <div style={{
                width: '120px',
                height: '120px',
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '36px',
                fontWeight: 'bold',
                margin: '0 auto 16px auto'
              }}>
                {form.name ? getInitials(form.name) : '?'}
              </div>

              <h2>{form.name || 'Usuario W-Protect'}</h2>

            </div>

            <div style={{ padding: '20px' }}>

              <form onSubmit={handleSubmit}>

                <IonItem lines="none">
                  <IonLabel position="stacked">Nombre</IonLabel>
                  <IonInput
                    name="name"
                    value={form.name}
                    onIonInput={handleChange}
                  />
                </IonItem>

                <IonItem lines="none">
                  <IonLabel position="stacked">Teléfono</IonLabel>
                  <IonInput
                    name="phone"
                    value={form.phone}
                    onIonInput={handleChange}
                  />
                </IonItem>

                <IonItem lines="none">
                  <IonLabel position="stacked">Email</IonLabel>
                  <IonInput
                    name="email"
                    value={form.email}
                    onIonInput={handleChange}
                  />
                </IonItem>

                <IonButton expand="block" type="submit" disabled={loading}>

                  {loading ? (
                    <>
                      <IonSpinner name="crescent" />
                      Guardando...
                    </>
                  ) : (
                    'Guardar'
                  )}

                </IonButton>

                {error && (
                  <div style={{ color: '#dc2626', marginTop: '10px' }}>
                    {error}
                  </div>
                )}

                {success && (
                  <div style={{ color: '#16a34a', marginTop: '10px' }}>
                    Perfil guardado correctamente
                  </div>
                )}

              </form>

              <div style={{ marginTop: '40px' }}>

                <IonButton
                  fill="outline"
                  expand="block"
                  onClick={() => {

                    localStorage.removeItem('w-protect-registered');
                    localStorage.removeItem('w-protect-user');
                    localStorage.removeItem('wprotect_registration');

                    window.location.reload();

                  }}
                >
                  Reiniciar para Pruebas
                </IonButton>

              </div>

            </div>

            <div style={{ height: '100px' }} />

          </>

        )}

      </IonContent>

    </IonPage>

  );

};

export default Profile;