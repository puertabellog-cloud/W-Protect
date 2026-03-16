import React, { useState, useEffect } from 'react';
import { patchUserProfile, getUserByEmail } from '../../services/springBootServices';
import { useHistory, useLocation } from 'react-router-dom';
import { IonHeader, IonToolbar, IonButton, IonIcon } from '@ionic/react';
import { arrowBackOutline } from 'ionicons/icons';
import {
  IonPage,
  IonContent,
  IonRefresher,
  IonRefresherContent,
  IonSkeletonText,
  IonSpinner
} from '@ionic/react';
import { useDevice } from "../../context/DeviceContext";
import { getSession, setSession } from '../../services/sessionService';

const PINK = '#D4537E';
const PINK_DARK = '#72243E';
const PINK_MID = '#993556';
const PINK_LIGHT = '#F4C0D1';
const PINK_LIGHTER = '#FBEAF0';

const styles: Record<string, React.CSSProperties> = {
  page: {
    fontFamily: "'Segoe UI', system-ui, sans-serif",
  },
  heroBand: {
    background: `linear-gradient(160deg, ${PINK_LIGHTER} 0%, ${PINK_LIGHT} 60%, #ED93B1 100%)`,
    padding: '40px 20px 52px',
    textAlign: 'center',
    position: 'relative',
  },
  heroLabel: {
    fontSize: '11px',
    fontWeight: 600,
    color: PINK_MID,
    textTransform: 'uppercase',
    letterSpacing: '1.2px',
    margin: '0 0 24px',
  },
  avatarWrapper: {
    display: 'flex',
    justifyContent: 'center',
  },
  avatarCircle: {
    width: '96px',
    height: '96px',
    borderRadius: '50%',
    background: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: `3px solid ${PINK}`,
  },
  avatarText: {
    fontSize: '32px',
    fontWeight: 500,
    color: PINK,
    letterSpacing: '-1px',
    userSelect: 'none',
  },
  heroName: {
    textAlign: 'center',
    fontSize: '18px',
    fontWeight: 500,
    color: PINK_DARK,
    margin: '16px 0 4px',
  },
  heroSub: {
    textAlign: 'center',
    fontSize: '13px',
    color: PINK_MID,
    margin: 0,
  },
  formSection: {
    padding: '24px 20px 0',
  },
  fieldLabel: {
    display: 'block',
    fontSize: '11px',
    fontWeight: 600,
    color: PINK,
    textTransform: 'uppercase',
    letterSpacing: '0.9px',
    marginBottom: '6px',
  },
  fieldRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    border: '0.5px solid #e5c6d4',
    borderRadius: '10px',
    padding: '11px 14px',
    background: '#fdf7f9',
    marginBottom: '16px',
  },
  fieldInput: {
    border: 'none',
    background: 'transparent',
    fontSize: '15px',
    color: '#1a1a1a',
    outline: 'none',
    width: '100%',
    fontFamily: 'inherit',
  },
  saveButton: {
    width: '100%',
    padding: '15px',
    background: PINK,
    border: 'none',
    borderRadius: '12px',
    fontSize: '15px',
    fontWeight: 600,
    color: 'white',
    cursor: 'pointer',
    marginTop: '8px',
    letterSpacing: '0.3px',
    fontFamily: 'inherit',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
  },
  resetButton: {
    width: '100%',
    padding: '12px',
    background: 'transparent',
    border: '0.5px solid #e0c0cc',
    borderRadius: '12px',
    fontSize: '13px',
    color: '#888',
    cursor: 'pointer',
    marginTop: '10px',
    fontFamily: 'inherit',
  },
  errorMsg: {
    color: '#dc2626',
    fontSize: '13px',
    marginTop: '10px',
    textAlign: 'center',
  },
  successMsg: {
    color: '#16a34a',
    fontSize: '13px',
    marginTop: '10px',
    textAlign: 'center',
  },
  skeletonAvatar: {
    width: '96px',
    height: '96px',
    borderRadius: '50%',
    background: '#f0e8ec',
    margin: '0 auto 20px',
    overflow: 'hidden',
  },
  skeletonLine: {
    height: '16px',
    borderRadius: '8px',
    background: '#f0e8ec',
    marginBottom: '10px',
  },
};

const IconPerson = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={PINK} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);

const IconPhone = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={PINK} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13.5a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2.69h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 10a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
  </svg>
);

const IconEmail = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={PINK} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
    <polyline points="22,6 12,13 2,6"/>
  </svg>
);

const IconShield = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={PINK} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
);

const getInitials = (name: string) => {
  return name
    .trim()
    .split(/\s+/)
    .map(word => word[0] || '')
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

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

  const { deviceId } = useDevice();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
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
      if (!session?.userId) throw new Error('No hay usuario en sesión');

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
      setSession({ ...session, email: savedUser.email });
      setSuccess(true);
    } catch (err) {
      setError('Error al guardar el perfil');
    } finally {
      setLoading(false);
    }
  };

  const location = useLocation<{ fromHome?: boolean }>();
  const initials = form.name ? getInitials(form.name) : '?';

  return (
    <IonPage style={styles.page}>
      {location.state?.fromHome && (
        <IonHeader className="ion-no-border">
          <IonToolbar style={{ '--background': '#FBEAF0', '--color': '#72243E', '--border-width': '0', borderBottom: '1px solid #f4c0d1' }}>
            <IonButton fill="clear" slot="start" onClick={() => history.goBack()} style={{ '--color': '#993556' }}>
              <IonIcon icon={arrowBackOutline} />
            </IonButton>
            <span slot="start" style={{ fontWeight: 700, fontSize: '1rem', color: '#72243E', marginLeft: '4px' }}>Mi Perfil</span>
          </IonToolbar>
        </IonHeader>
      )}
      <IonContent>

        <IonRefresher slot="fixed" onIonRefresh={doRefresh}>
          <IonRefresherContent />
        </IonRefresher>

        {initialLoading ? (

          <div style={{ padding: '40px 20px' }}>
            <div style={styles.skeletonAvatar}>
              <IonSkeletonText animated style={{ width: '100%', height: '100%' }} />
            </div>
            <div style={{ ...styles.skeletonLine, width: '60%', margin: '0 auto 10px' }}>
              <IonSkeletonText animated style={{ width: '100%', height: '100%' }} />
            </div>
            <div style={{ ...styles.skeletonLine, width: '80%', margin: '0 auto 10px' }}>
              <IonSkeletonText animated style={{ width: '100%', height: '100%' }} />
            </div>
            <div style={{ ...styles.skeletonLine, width: '70%', margin: '0 auto' }}>
              <IonSkeletonText animated style={{ width: '100%', height: '100%' }} />
            </div>
          </div>

        ) : (

          <>
            {/* Hero band */}
            <div style={styles.heroBand}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px', marginBottom: '24px' }}>
                <IconShield />
                <span style={{ fontSize: '13px', fontWeight: 600, color: PINK_MID, letterSpacing: '0.5px' }}>
                  W-Protect
                </span>
              </div>

              <div style={styles.avatarWrapper}>
                <div style={styles.avatarCircle}>
                  <span style={styles.avatarText}>{initials}</span>
                </div>
              </div>

              <p style={styles.heroName}>{form.name || 'Usuario W-Protect'}</p>
              <p style={styles.heroSub}>Mi perfil</p>
            </div>

            {/* Form */}
            <div style={styles.formSection}>
              <form onSubmit={handleSubmit}>

                <label style={styles.fieldLabel}>Nombre</label>
                <div style={styles.fieldRow}>
                  <IconPerson />
                  <input
                    style={styles.fieldInput}
                    name="name"
                    type="text"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Tu nombre completo"
                  />
                </div>

                <label style={styles.fieldLabel}>Teléfono</label>
                <div style={styles.fieldRow}>
                  <IconPhone />
                  <input
                    style={styles.fieldInput}
                    name="phone"
                    type="tel"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="Tu número de teléfono"
                  />
                </div>

                <label style={styles.fieldLabel}>Email</label>
                <div style={styles.fieldRow}>
                  <IconEmail />
                  <input
                    style={styles.fieldInput}
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="Tu correo electrónico"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    ...styles.saveButton,
                    opacity: loading ? 0.8 : 1,
                  }}
                >
                  {loading ? (
                    <>
                      <IonSpinner name="crescent" style={{ width: '18px', height: '18px', color: 'white' }} />
                      Guardando...
                    </>
                  ) : (
                    'Guardar cambios'
                  )}
                </button>

                {error && <p style={styles.errorMsg}>{error}</p>}
                {success && <p style={styles.successMsg}>Perfil guardado correctamente</p>}

              </form>

            </div>

            <div style={{ height: '100px' }} />
          </>

        )}

      </IonContent>
    </IonPage>
  );
};

export default Profile;