import React, { useState, useEffect } from 'react';
import { Register } from '../pages/Register/Register';
import Home from '../pages/Home/Home';

interface AuthWrapperProps {
  children?: React.ReactNode;
}

export const AuthWrapper: React.FC<AuthWrapperProps> = ({ children }) => {
  const [isRegistered, setIsRegistered] = useState<boolean | null>(null);

  useEffect(() => {
    // Verificar si el usuario ya está registrado
    const checkRegistration = () => {
      const registered = localStorage.getItem('w-protect-registered');
      setIsRegistered(registered === 'true');
    };

    checkRegistration();
  }, []);

  const handleRegistrationComplete = () => {
    setIsRegistered(true);
  };

  // Mostrar loading mientras verificamos el estado
  if (isRegistered === null) {
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
    return <Register onRegistrationComplete={handleRegistrationComplete} />;
  }

  // Si está registrado, mostrar el componente hijo o la aplicación principal
  return children ? <>{children}</> : <Home />;
};