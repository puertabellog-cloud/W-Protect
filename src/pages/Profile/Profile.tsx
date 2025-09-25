import React, { useState, useEffect } from 'react';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonItem, IonLabel, IonInput, IonTextarea, IonButton } from '@ionic/react';
// import { updateProfile, getProfile } from '../../api/client';
import { backendService } from '../../api/backend';
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
                const rawData = await backendService.getProfile(deviceId);
                // Si rawData es null/undefined, lo reemplazamos por {}
                const data = rawData ?? {};
                setForm({
                    name:    data.name    ?? '',
                    phone:   data.phone   ?? '',
                    email:   data.email   ?? '',
                    mensaje: data.mensaje ?? '',
                    deviceId: deviceId
                });
            } catch (err) {
                setError('Error al cargar el perfil: ' + err);
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
            await backendService.updateProfile({
                ...form,
                active: true,
                deviceId: deviceId
            });
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
                    {error && <div style={{ color: 'red', marginTop: 8 }}>{error}</div>}
                    {success && <div style={{ color: 'green', marginTop: 8 }}>Perfil guardado correctamente</div>}
                </form>
            </IonContent>
        </IonPage>
    );
};

export default Profile;