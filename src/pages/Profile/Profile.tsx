import React, { useState, useEffect } from 'react';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonItem, IonLabel, IonInput, IonTextarea, IonButton } from '@ionic/react';
import { updateProfile, getProfile } from '../../api/client';
import { useDevice } from "../../context/DeviceContext";

const Profile: React.FC = () => {
    const [form, setForm] = useState({
        name: '',
        phone: '',
        email: '',
        mensaje: '',
        deviceId: '' // Initialize as empty string to match string type
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

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
            if (!deviceId) return;
            setLoading(true);
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
                    apiData = await getProfile(deviceId);
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
                setLoading(false);
            }
        };
        fetchProfile();
    }, [deviceId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(false);
        try {
            await updateProfile({
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
                <div style={{ display: 'flex', justifyContent: 'center', marginTop: 24, marginBottom: 24 }}>
                    <div
                        style={{
                            width: 120,
                            height: 120,
                            borderRadius: '50%',
                            overflow: 'hidden',
                            border: '2px solid #ccc',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: '#f4f4f4'
                        }}
                    >
                        <img
                            src="https://www.gravatar.com/avatar/?d=mp"
                            alt="Foto de perfil"
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                    </div>
                </div>
                <form style={{ padding: 16 }} onSubmit={handleSubmit}>
                    <IonItem>
                        <IonLabel position="stacked">Nombre</IonLabel>
                        <IonInput
                            name="name"
                            type="text"
                            placeholder="Tu nombre"
                            value={form.name}
                            onIonInput={handleChange}
                        />
                    </IonItem>
                    <IonItem>
                        <IonLabel position="stacked">Teléfono</IonLabel>
                        <IonInput
                            name="phone"
                            type="tel"
                            placeholder="Tu teléfono"
                            value={form.phone}
                            onIonInput={handleChange}
                        />
                    </IonItem>
                    <IonItem>
                        <IonLabel position="stacked">Email</IonLabel>
                        <IonInput
                            name="email"
                            type="email"
                            placeholder="Tu email"
                            value={form.email}
                            onIonInput={handleChange}
                        />
                    </IonItem>
                    <IonItem>
                        <IonLabel position="stacked">Mensaje</IonLabel>
                        <IonTextarea
                            name="mensaje"
                            placeholder="Tu mensaje"
                            value={form.mensaje}
                            onIonInput={handleChange}
                        />
                    </IonItem>
                    <IonButton expand="block" type="submit" style={{ marginTop: 16 }} disabled={loading}>
                        {loading ? 'Guardando...' : 'Guardar'}
                    </IonButton>
                    
                    {/* Botón temporal para probar el registro */}
                    <IonButton 
                        expand="block" 
                        fill="outline" 
                        color="danger"
                        style={{ marginTop: 16 }} 
                        onClick={() => {
                            localStorage.removeItem('w-protect-registered');
                            localStorage.removeItem('w-protect-user');
                            localStorage.removeItem('wprotect_registration');
                            window.location.reload();
                        }}
                    >
                        🔄 Ver Registro (Solo para Pruebas)
                    </IonButton>
                    
                    {error && <div style={{ color: 'red', marginTop: 8 }}>{error}</div>}
                    {success && <div style={{ color: 'green', marginTop: 8 }}>Perfil guardado correctamente</div>}
                </form>
            </IonContent>
        </IonPage>
    );
};

export default Profile;