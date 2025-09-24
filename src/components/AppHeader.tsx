import React from 'react';
import { IonHeader, IonToolbar, IonTitle, IonIcon, IonButton } from '@ionic/react';
import { moonOutline, sunnyOutline } from 'ionicons/icons';
import logo from '../assets/w-protect-logo.svg';

interface AppHeaderProps {
  title?: string;
  isDarkMode?: boolean;
  onToggleDarkMode?: () => void;
  showLogo?: boolean;
}

export const AppHeader: React.FC<AppHeaderProps> = ({ 
  title = "W-Protect", 
  isDarkMode = false, 
  onToggleDarkMode,
  showLogo = true 
}) => {
  return (
    <IonHeader>
      <IonToolbar style={{
        '--background': 'var(--card)',
        '--color': 'var(--foreground)',
        borderBottom: '1px solid var(--border)',
        padding: '8px 0'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 16px',
          height: '56px'
        }}>
          {/* Logo y título */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            {showLogo && (
              <div className="w-protect-logo">
                <span style={{
                  fontSize: '18px',
                  fontWeight: 'bold',
                  color: 'var(--womxi-pink-600)',
                  fontFamily: 'serif'
                }}>
                  W
                </span>
              </div>
            )}
            
            <div>
              <h1 className="w-protect-title">
                {title}
              </h1>
              <p className="w-protect-subtitle">
                Nunca sola, siempre protegida
              </p>
            </div>
          </div>

          {/* Botón de modo oscuro */}
          {onToggleDarkMode && (
            <IonButton
              fill="clear"
              onClick={onToggleDarkMode}
              style={{
                '--color': 'var(--foreground)',
                '--padding-start': '8px',
                '--padding-end': '8px'
              }}
            >
              <IonIcon 
                icon={isDarkMode ? sunnyOutline : moonOutline} 
                style={{ fontSize: '1.2rem' }}
              />
            </IonButton>
          )}
        </div>
      </IonToolbar>
    </IonHeader>
  );
};