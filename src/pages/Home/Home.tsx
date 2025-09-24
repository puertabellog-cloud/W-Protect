import React, { useState } from 'react';
import { IonPage, IonContent } from '@ionic/react';

import { AppHeader } from '../../components/AppHeader';
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

    // Si estamos en el dashboard, mostramos el header personalizado
    if (currentScreen === 'dashboard') {
        return (
            <IonPage>
                <AppHeader 
                    isDarkMode={isDark}
                    onToggleDarkMode={toggleDarkMode}
                    showLogo={true}
                />
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