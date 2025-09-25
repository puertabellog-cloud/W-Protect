import React, { useState, useEffect } from 'react';
// import { updateProfile, getProfile } from '../../api/client';
import { backendService } from '../../api/backend';
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
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonList,
  IonIcon,
  IonRefresher,
  IonRefresherContent,
  IonSkeletonText,
  IonSpinner,
  IonGrid,
  IonRow,
  IonCol,
  IonBadge,
  IonAvatar
} from '@ionic/react';
import { 
  personOutline,
  mailOutline,
  callOutline,
  chatbubbleOutline,
  statsChartOutline,
  shieldCheckmarkOutline,
  timeOutline,
  heartOutline,
  bookOutline,
  peopleOutline,
  settingsOutline,
  logOutOutline
} from 'ionicons/icons';
import { useDevice } from "../../context/DeviceContext";
import { forumService } from '../../services/forumService';

const Profile: React.FC = () => {
    const history = useHistory();
    const [form, setForm] = useState({
        name: '',
        phone: '',
        email: '',
        mensaje: '',
        deviceId: '' // Initialize as empty string to match string type
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


    const handleChange = (event: CustomEvent) => {
        const target = event.target as HTMLInputElement;
        const name = target.name;
        const value = event.detail.value;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const { deviceId } = useDevice();
    
    // Cargar datos del perfil al montar el componente
    useEffect(() => {
        const fetchProfile = async () => {
            if (!deviceId) {
                setInitialLoading(false);
                return;
            }
            setInitialLoading(true);
            setError(null);
            
            try {

                // 1. Intentar cargar desde localStorage (múltiples fuentes)
                let localData = null;
                
                // Buscar datos del registro más reciente
                const userData = localStorage.getItem('w-protect-user');
                const registrationData = localStorage.getItem('wprotect_registration');
                
                if (userData) {
                    localData = JSON.parse(userData);
                    console.log('✅ Datos cargados desde w-protect-user');
                } else if (registrationData) {
                    localData = JSON.parse(registrationData);
                    console.log('✅ Datos cargados desde wprotect_registration');
                }

                // 2. Intentar cargar desde API como respaldo
                let apiData = null;
                try {
                    const rawData = await backendService.getProfile(deviceId);
                    // Si rawData es null/undefined, lo reemplazamos por {}
                    const apiData = rawData ?? {};
                    console.log('✅ Datos cargados desde API');
                } catch (apiError) {
                    console.log('⚠️ API no disponible, usando datos locales');
                }
                
                // 3. Combinar datos: localStorage tiene prioridad si existe
                const data = localData || apiData || {};
                setForm({
                    name:    data.name    ?? '',
                    phone:   data.phone   ?? '',
                    email:   data.email   ?? '',
                    mensaje: data.mensaje ?? '',
                    deviceId: deviceId
                });
                
                // Cargar estadísticas del usuario
                try {
                    const stories = await forumService.getStories();
                    const userStories = stories.filter((story: any) => story.usuario === data.name);
                    const commentsCount = stories.reduce((total: number, story: any) => 
                        total + story.comentarios.filter((comment: any) => comment.usuario === data.name).length, 0
                    );
                    
                    setUserStats({
                        forumsParticipated: userStories.length + commentsCount,
                        articlesRead: parseInt(localStorage.getItem('w-protect-articles-read') || '0'),
                        daysActive: Math.floor((Date.now() - new Date(data.fechaRegistro || Date.now()).getTime()) / (1000 * 60 * 60 * 24)) || 1
                    });
                } catch (statsError) {
                    console.log('No se pudieron cargar las estadísticas del usuario');
                    setUserStats({
                        forumsParticipated: 0,
                        articlesRead: parseInt(localStorage.getItem('w-protect-articles-read') || '0'),
                        daysActive: 1
                    });
                }

                console.log('📱 Perfil cargado exitosamente:', {
                    hasLocalData: !!localData,
                    hasApiData: !!apiData,
                    finalData: data
                });
                
            } catch (err) {
                console.warn('⚠️ Error al cargar perfil:', err);
                // Solo mostrar error si NO hay datos locales disponibles
                const hasLocalData = localStorage.getItem('w-protect-user') || 
                                   localStorage.getItem('wprotect_registration');
                if (!hasLocalData) {
                    setError('No se pudieron cargar los datos del perfil. Completa la información.');
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
        // Refrescar perfil si es necesario
        event.detail.complete();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(false);
        try {
            await backendService.updateProfile({
                ...form,
                active: true,
                deviceId: deviceId
            });
            // Limpiar datos de registro del localStorage ya que ahora están en la API
            localStorage.removeItem('wprotect_registration');
            setSuccess(true);
        } catch (err) {
            setError('Error al guardar el perfil: '+err);
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
                        {/* Skeleton del avatar */}
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
                        
                        {/* Skeleton de las cards */}
                        <IonCard>
                            <IonCardContent>
                                <IonSkeletonText animated style={{ width: '80%', height: '20px' }} />
                                <IonSkeletonText animated style={{ width: '60%', height: '16px' }} />
                                <IonSkeletonText animated style={{ width: '70%', height: '16px' }} />
                            </IonCardContent>
                        </IonCard>
                        
                        <IonCard>
                            <IonCardContent>
                                <IonSkeletonText animated style={{ width: '50%', height: '20px' }} />
                                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                                    <IonSkeletonText animated style={{ width: '30%', height: '40px' }} />
                                    <IonSkeletonText animated style={{ width: '30%', height: '40px' }} />
                                    <IonSkeletonText animated style={{ width: '30%', height: '40px' }} />
                                </div>
                            </IonCardContent>
                        </IonCard>
                    </div>
                ) : (
                    <>
                        {/* Header del perfil con fondo gradient */}
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
                                background: 'rgba(255, 255, 255, 0.2)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                fontSize: '36px',
                                fontWeight: 'bold',
                                margin: '0 auto 16px auto',
                                border: '3px solid rgba(255, 255, 255, 0.3)',
                                backdropFilter: 'blur(10px)'
                            }}>
                                {form.name ? getInitials(form.name) : '?'}
                            </div>
                            <h2 style={{ margin: '0 0 8px 0', fontSize: '1.5rem', fontWeight: '600' }}>
                                {form.name || 'Usuario W-Protect'}
                            </h2>
                            <p style={{ margin: 0, opacity: 0.9, fontSize: '1rem' }}>
                                Miembro desde hace {userStats.daysActive} días
                            </p>
                        </div>
                        {/* Información personal - Diseño minimalista */}
                        <div style={{ padding: '20px' }}>
                            <h3 style={{ 
                                margin: '20px 0 24px 0', 
                                fontSize: '1.2rem', 
                                fontWeight: '600',
                                color: '#1f2937'
                            }}>
                                Información Personal
                            </h3>
                            <form onSubmit={handleSubmit}>
                                <div style={{ marginBottom: '20px' }}>
                                    <IonItem lines="none" style={{ 
                                        '--padding-start': '0', 
                                        '--padding-end': '0',
                                        '--background': 'transparent'
                                    }}>
                                        <IonLabel position="stacked" style={{ marginBottom: '8px', color: '#374151' }}>
                                            Nombre
                                        </IonLabel>
                                        <IonInput
                                            name="name"
                                            type="text"
                                            placeholder="Tu nombre completo"
                                            value={form.name}
                                            onIonInput={handleChange}
                                            style={{ 
                                                '--padding-start': '0',
                                                '--padding-end': '0',
                                                borderBottom: '1px solid #e5e7eb',
                                            }}
                                        />
                                    </IonItem>
                                </div>

                                <div style={{ marginBottom: '20px' }}>
                                    <IonItem lines="none" style={{ 
                                        '--padding-start': '0', 
                                        '--padding-end': '0',
                                        '--background': 'transparent'
                                    }}>
                                        <IonLabel position="stacked" style={{ marginBottom: '8px', color: '#374151' }}>
                                            Teléfono
                                        </IonLabel>
                                        <IonInput
                                            name="phone"
                                            type="tel"
                                            placeholder="Tu número de teléfono"
                                            value={form.phone}
                                            onIonInput={handleChange}
                                            style={{ 
                                                '--padding-start': '0',
                                                '--padding-end': '0',
                                                borderBottom: '1px solid #e5e7eb'
                                            }}
                                        />
                                    </IonItem>
                                </div>

                                <div style={{ marginBottom: '20px' }}>
                                    <IonItem lines="none" style={{ 
                                        '--padding-start': '0', 
                                        '--padding-end': '0',
                                        '--background': 'transparent'
                                    }}>
                                        <IonLabel position="stacked" style={{ marginBottom: '8px', color: '#374151' }}>
                                            Email
                                        </IonLabel>
                                        <IonInput
                                            name="email"
                                            type="email"
                                            placeholder="Tu correo electrónico"
                                            value={form.email}
                                            onIonInput={handleChange}
                                            style={{ 
                                                '--padding-start': '0',
                                                '--padding-end': '0',
                                                borderBottom: '1px solid #e5e7eb'
                                            }}
                                        />
                                    </IonItem>
                                </div>

                                <div style={{ marginBottom: '32px' }}>
                                    <IonItem lines="none" style={{ 
                                        '--padding-start': '0', 
                                        '--padding-end': '0',
                                        '--background': 'transparent'
                                    }}>
                                        <IonLabel position="stacked" style={{ marginBottom: '8px', color: '#374151' }}>
                                            Mensaje Personal
                                        </IonLabel>
                                        <IonTextarea
                                            name="mensaje"
                                            placeholder="Cuéntanos algo sobre ti..."
                                            value={form.mensaje}
                                            onIonInput={handleChange}
                                            rows={3}
                                            style={{ 
                                                '--padding-start': '0',
                                                '--padding-end': '0',
                                                borderBottom: '1px solid #e5e7eb'
                                            }}
                                        />
                                    </IonItem>
                                </div>

                                <IonButton 
                                    expand="block" 
                                    type="submit" 
                                    disabled={loading}
                                    style={{
                                        '--background': 'linear-gradient(135deg, #d946ef, #ec4899)',
                                        '--border-radius': '8px',
                                        height: '48px',
                                        fontWeight: '500',
                                        marginBottom: '16px'
                                    }}
                                >
                                    {loading ? (
                                        <>
                                            <IonSpinner name="crescent" style={{ marginRight: '8px' }} />
                                            Guardando...
                                        </>
                                    ) : (
                                        'Guardar'
                                    )}
                                </IonButton>
                                
                                {error && (
                                    <div style={{ 
                                        color: '#dc2626', 
                                        fontSize: '0.9rem',
                                        textAlign: 'center',
                                        marginTop: '12px'
                                    }}>
                                        {error}
                                    </div>
                                )}
                                
                                {success && (
                                    <div style={{ 
                                        color: '#16a34a', 
                                        fontSize: '0.9rem',
                                        textAlign: 'center',
                                        marginTop: '12px'
                                    }}>
                                        ✅ Perfil guardado correctamente
                                    </div>
                                )}
                            </form>

                            {/* Botón temporal para probar el registro */}
                            <div style={{ 
                                marginTop: '40px', 
                                paddingTop: '20px',
                                borderTop: '1px solid #e5e7eb'
                            }}>
                                <IonButton 
                                    fill="outline" 
                                    expand="block"
                                    color="medium"
                                    style={{ 
                                        '--border-radius': '8px',
                                        height: '40px'
                                    }}
                                    onClick={() => {
                                        localStorage.removeItem('w-protect-registered');
                                        localStorage.removeItem('w-protect-user');
                                        localStorage.removeItem('wprotect_registration');
                                        window.location.reload();
                                    }}
                                >
                                    🔄 Reiniciar para Pruebas
                                </IonButton>
                                
                                <p style={{ 
                                    fontSize: '0.75rem', 
                                    color: '#9ca3af', 
                                    textAlign: 'center',
                                    margin: '8px 0 0 0'
                                }}>
                                    Botón temporal para testing
                                </p>
                            </div>
                        </div>

                        {/* Espaciado para el bottom navigation */}
                        <div style={{ height: '100px' }} />
                    </>
                )}
            </IonContent>
        </IonPage>
    );
};

export default Profile;