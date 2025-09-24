import React, { useState } from 'react';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonIcon } from '@ionic/react';
import { moonOutline, sunnyOutline } from 'ionicons/icons';

import { Dashboard } from '../../components/dashboard/Dashboard';
import { EmergencyAlert } from '../../components/dashboard/EmergencyAlert';
import { ComingSoonScreen } from '../../components/dashboard/ComingSoonScreen';

type AppScreen = 'dashboard' | 'emergency' | 'location' | 'chat' | 'resources' | 'requests';

const Home: React.FC = () => {
    const [currentScreen, setCurrentScreen] = useState<AppScreen>('dashboard');
    const [isDark, setIsDark] = useState(false);

    const toggleDarkMode = () => {
        const newMode = !isDark;
        setIsDark(newMode);
        
        if (newMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    };

    const handleFeatureSelect = (feature: string) => {
        setCurrentScreen(feature as AppScreen);
    };

    const handleBackToDashboard = () => {
        setCurrentScreen('dashboard');
    };

    const renderScreen = () => {
        switch (currentScreen) {
            case 'emergency':
                return <EmergencyAlert onBack={handleBackToDashboard} />;
            case 'location':
                return <ComingSoonScreen feature="Localización" onBack={handleBackToDashboard} />;
            case 'chat':
                return <ComingSoonScreen feature="Chat Seguro" onBack={handleBackToDashboard} />;
            case 'resources':
                return <ComingSoonScreen feature="Recursos de Ayuda" onBack={handleBackToDashboard} />;
            case 'requests':
                return <ComingSoonScreen feature="Solicitudes" onBack={handleBackToDashboard} />;
            default:
                return <Dashboard onFeatureSelect={handleFeatureSelect} />;
        }
    };

    // Si estamos en el dashboard, mostramos el header con el toggle de tema
    if (currentScreen === 'dashboard') {
        return (
            <IonPage>
                <IonHeader>
                    <IonToolbar style={{ '--background': 'var(--primary)', '--color': 'var(--primary-foreground)' }}>
                        <IonTitle>W-Protect 💜</IonTitle>
                        <IonButton 
                            fill="clear" 
                            slot="end"
                            onClick={toggleDarkMode}
                            style={{ '--color': 'var(--primary-foreground)' }}
                        >
                            <IonIcon icon={isDark ? sunnyOutline : moonOutline} />
                        </IonButton>
                    </IonToolbar>
                </IonHeader>
                <IonContent>
                    <Dashboard onFeatureSelect={handleFeatureSelect} />
                </IonContent>
            </IonPage>
        );
    }

    // Para otras pantallas, los componentes manejan su propio header
    return renderScreen();
};

export default Home;