import React, { useState, useEffect } from 'react';
import { Register } from '../pages/Register/Register';
import Home from '../pages/Home/Home';
import { getSession, isAuthenticated, SESSION_CHANGED_EVENT } from '../services/sessionService';
import { debugLog } from '../utils/debug';

interface AuthWrapperProps {
  children?: React.ReactNode;
}

export const AuthWrapper: React.FC<AuthWrapperProps> = ({ children }) => {
  const [isRegistered, setIsRegistered] = useState<boolean | null>(null);

  useEffect(() => {
    const checkRegistration = () => {
      const registered = localStorage.getItem('w-protect-registered');
      const hasSession = isAuthenticated();
      const nextValue = registered === 'true' || hasSession;

      debugLog('AuthWrapper', 'checkRegistration', {
        registered,
        hasSession,
        nextValue,
        path: window.location.pathname,
      });

      setIsRegistered(nextValue);
    };

    checkRegistration();

    window.addEventListener(SESSION_CHANGED_EVENT, checkRegistration);
    window.addEventListener('storage', checkRegistration);

    return () => {
      window.removeEventListener(SESSION_CHANGED_EVENT, checkRegistration);
      window.removeEventListener('storage', checkRegistration);
    };
  }, []);

  const handleRegistrationComplete = () => {
    debugLog('AuthWrapper', 'registrationComplete', { path: window.location.pathname });
    setIsRegistered(true);
  };

  // Mostrar loading mientras verificamos el estado
  if (isRegistered === null) {
    debugLog('AuthWrapper', 'render loading', { path: window.location.pathname });
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: 'var(--background)',
        color: 'var(--foreground)'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid var(--womxi-pink-200)',
            borderTop: '4px solid var(--womxi-pink-500)',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px auto'
          }}></div>
          <p>Cargando W-Protect...</p>
        </div>
      </div>
    );
  }

  // Si no está registrado, mostrar pantalla de registro
  if (!isRegistered) {
    debugLog('AuthWrapper', 'render register', { path: window.location.pathname });
    return <Register onRegistrationComplete={handleRegistrationComplete} />;
  }

  debugLog('AuthWrapper', 'render content', {
    hasChildren: Boolean(children),
    path: window.location.pathname,
  });

  return children ? <>{children}</> : <Home />;
};