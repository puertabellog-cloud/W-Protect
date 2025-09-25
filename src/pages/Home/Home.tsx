import React, { useState } from 'react';
import { IonPage, IonContent } from '@ionic/react';

import { AppHeader } from '../../components/AppHeader';
import { Dashboard } from '../../components/dashboard/Dashboard';
import { EmergencyAlert } from '../../components/dashboard/EmergencyAlert';
import { ComingSoonScreen } from '../../components/dashboard/ComingSoonScreen';
import LocationScreen from '../../components/screens/LocationScreen';
import { useHistory } from 'react-router-dom';

type AppScreen = 'dashboard' | 'emergency' | 'location' | 'experiencias' | 'resources';

const Home: React.FC = () => {
    const [currentScreen, setCurrentScreen] = useState<AppScreen>('dashboard');
    const [isDark, setIsDark] = useState(false);
    const history = useHistory();

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
        if (feature === 'experiencias') {
            // Navegar al foro de historias
            history.push('/foro');
        } else {
            // Para location y otras features, mostrar en el dashboard
            setCurrentScreen(feature as AppScreen);
        }
    };

    const handleBackToDashboard = () => {
        setCurrentScreen('dashboard');
    };

    const renderScreen = () => {
        switch (currentScreen) {
            case 'emergency':
                return <EmergencyAlert onBack={handleBackToDashboard} />;
            case 'location':
                return <LocationScreen onBack={handleBackToDashboard} />;
            case 'experiencias':
                // Este caso no debería ejecutarse ya que navegamos directamente al foro
                return <ComingSoonScreen feature="Experiencias" onBack={handleBackToDashboard} />;
            case 'resources':
                return <ComingSoonScreen feature="Recursos de Ayuda" onBack={handleBackToDashboard} />;
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