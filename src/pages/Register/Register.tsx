import React, { useState } from 'react';
import {
  IonPage,
  IonContent,
  IonButton,
  IonInput,
  IonText,
  IonToast,
  IonIcon,
  IonTextarea
} from '@ionic/react';
import {
  personOutline,
  callOutline,
  mailOutline,
  lockClosedOutline
} from 'ionicons/icons';
import { getUserByEmail, saveUser, loginUser } from '../../services/springBootServices';
import { useDevice } from '../../context/DeviceContext';
import { sendWelcomeEmail } from '../../services/emailService';
import { setSession } from '../../services/sessionService';

interface RegisterProps {
  onRegistrationComplete: () => void;
  onSwitchToLogin?: () => void;
  logoUrl?: string; // URL de tu logo
}

export const Register: React.FC<RegisterProps> = ({ 
  onRegistrationComplete, 
  onSwitchToLogin,
  logoUrl 
}) => {
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
    emergencyMessage: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const { deviceId } = useDevice();

  const handleInputChange = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const isFormValid = () => {
    return form.name.trim() && 
           form.phone.trim() && 
           form.email.trim() && 
           form.email.includes('@');
  };

  const hasValidEmail = () => {
    return form.email.trim() && form.email.includes('@');
  };

  const getInitials = (name: string): string => {
    if (!name.trim()) return '';
    const words = name.trim().split(' ');
    if (words.length === 1) {
      return words[0].charAt(0).toUpperCase();
    }
    return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
  };



  const saveLocalProfile = () => {
    const userData = {
      name: form.name.trim(),
      phone: form.phone.trim(),
      email: form.email.trim(),
      mensaje: form.emergencyMessage.trim() || 'Necesito ayuda urgente',
      registeredAt: new Date().toISOString()
    };

    localStorage.setItem('w-protect-registered', 'true');
    localStorage.setItem('w-protect-user', JSON.stringify(userData));
    localStorage.setItem('wprotect_registration', JSON.stringify(userData));
  };

  const completeAccess = () => {
    setTimeout(() => {
      onRegistrationComplete();
    }, 600);
  };

  const resolveDeviceId = (preferred?: string | null): string | null => {
    const fromPreferred = preferred?.trim();
    if (fromPreferred) return fromPreferred;

    const fromContext = deviceId?.trim();
    if (fromContext) return fromContext;

    const fromStorage = localStorage.getItem('device_id')?.trim();
    if (fromStorage) return fromStorage;

    return null;
  };

  const handleRegister = async () => {
    if (!hasValidEmail()) {
      setToastMessage('Ingresa un email válido para continuar');
      return;
    }

    if (!form.password.trim()) {
      setToastMessage('Ingresa tu contraseña para continuar');
      return;
    }

    setIsLoading(true);
    try {
      // 1) Intentar login por email si el usuario ya existe
      const existingUser = await getUserByEmail(form.email.trim());

      if (existingUser?.id) {
        // Usuario existe - usar nuevo endpoint de login
        try {
          const loggedInUser = await loginUser(form.email, form.password);

          if (!loggedInUser?.id) {
            setToastMessage('Error de servidor: usuario sin ID. Intenta nuevamente.');
            return;
          }

          const sessionDeviceId = resolveDeviceId(loggedInUser.deviceId);

          if (!sessionDeviceId) {
            setToastMessage('No se pudo resolver el deviceId para iniciar sesión.');
            return;
          }

          localStorage.setItem('device_id', sessionDeviceId);

          setSession({
            userId: loggedInUser.id,
            deviceId: sessionDeviceId,
            email: loggedInUser.email,
            profile: loggedInUser.profile ?? 'USER',
          });

          localStorage.setItem('w-protect-registered', 'true');
          localStorage.setItem('w-protect-user', JSON.stringify(loggedInUser));
          localStorage.setItem('wprotect_registration', JSON.stringify(loggedInUser));

          setToastMessage('Ingreso exitoso. Bienvenida de nuevo 💗');
          completeAccess();
          return;
        } catch (loginError: any) {
          setToastMessage(loginError.message || 'Credenciales inválidas. Por favor intenta nuevamente.');
          return;
        }
      }

      // 2) Si no existe, crear cuenta con el flujo actual
      if (!isFormValid()) {
        setToastMessage('Usuario nuevo: completa nombre y teléfono para registrarte.');
        return;
      }

      const sessionDeviceId = resolveDeviceId();

      if (!sessionDeviceId) {
        setToastMessage('No se pudo obtener el deviceId. Intenta nuevamente.');
        return;
      }

      localStorage.setItem('device_id', sessionDeviceId);

      saveLocalProfile();

      const savedUser = await saveUser({
        name: form.name.trim(),
        phone: form.phone.trim(),
        email: form.email.trim(),
        password: form.password,
        deviceId: sessionDeviceId,
        active: true
      });

      if (savedUser?.id) {
        setSession({
          userId: savedUser.id,
          deviceId: sessionDeviceId,
          email: savedUser.email || form.email.trim(),
          profile: savedUser.profile ?? 'USER',
        });
      }

      console.log('✅ Perfil guardado en API exitosamente');

      setToastMessage('¡Registro exitoso! Enviando email de bienvenida...');
      
      try {
        const emailSent = await sendWelcomeEmail(form.name.trim(), form.email.trim());
        
        if (emailSent) {
          setToastMessage('¡Registro exitoso! ✅ Email enviado. Revisa tu bandeja 💗');
        } else {
          setToastMessage('¡Registro exitoso! ⚠️ Email pendiente, pero tu cuenta está activa 💗');
        }
      } catch (emailError) {
        console.warn('⚠️ Error enviando email:', emailError);
        setToastMessage('¡Registro exitoso! Tu cuenta está activa 💗');
      }

      completeAccess();

    } catch (error) {
      console.error('Error en registro:', error);
      setToastMessage('No se pudo validar el usuario. Intenta nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const customStyles = `
    @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600;700;800&family=Inter:wght@400;500;600;700&display=swap');
    
    .register-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #ff4081, #e91e63, #ad1457);
      position: relative;
      overflow: hidden;
      padding: 20px 0;
    }
    
    .register-container::before {
      content: '';
      position: absolute;
      top: -50%;
      left: -20%;
      width: 60%;
      height: 120%;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 50%;
      transform: rotate(-15deg);
      z-index: 1;
    }
    
    .register-container::after {
      content: '';
      position: absolute;
      bottom: -60%;
      right: -30%;
      width: 80%;
      height: 140%;
      background: rgba(255, 255, 255, 0.08);
      border-radius: 50%;
      transform: rotate(25deg);
      z-index: 1;
    }
    
    .register-card {
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(20px);
      border-radius: 24px;
      padding: 32px 28px;
      width: 100%;
      max-width: 400px;
      margin: 20px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
      position: relative;
      z-index: 2;
      max-height: 90vh;
      overflow-y: auto;
    }
    
    .logo-container {
      text-align: center;
      margin-bottom: 28px;
    }
    
    .logo-image {
      width: 70px;
      height: 70px;
      border-radius: 18px;
      object-fit: cover;
      box-shadow: 0 8px 24px rgba(255, 64, 129, 0.25);
      margin-bottom: 16px;
      transition: transform 0.3s ease;
    }
    
    .logo-image:hover {
      transform: scale(1.05);
    }
    
    .brand-name {
      font-family: 'Poppins', sans-serif;
      font-size: 2rem;
      font-weight: 800;
      background: linear-gradient(135deg, #2d3748, #4a5568, #2d3748);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      margin: 0;
      letter-spacing: -0.5px;
      position: relative;
    }
    
    .brand-name::after {
      content: '';
      position: absolute;
      bottom: -4px;
      left: 50%;
      transform: translateX(-50%);
      width: 40px;
      height: 3px;
      background: linear-gradient(135deg, #ff4081, #e91e63);
      border-radius: 2px;
    }
    
    .register-title {
      font-family: 'Poppins', sans-serif;
      font-size: 2.2rem;
      font-weight: 700;
      color: #2d3748;
      text-align: center;
      margin-bottom: 8px;
      letter-spacing: -0.8px;
    }
    
    .register-subtitle {
      font-family: 'Inter', sans-serif;
      color: #718096;
      text-align: center;
      margin-bottom: 28px;
      font-size: 0.95rem;
      font-weight: 400;
      letter-spacing: 0.2px;
    }
    
    .user-avatar-section {
      text-align: center;
      margin-bottom: 24px;
    }
    
    .user-avatar {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      background: linear-gradient(135deg, #ff4081, #e91e63);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 2rem;
      font-weight: bold;
      color: white;
      margin-bottom: 8px;
      box-shadow: 0 8px 24px rgba(255, 64, 129, 0.3);
    }
    
    .avatar-label {
      font-size: 0.85rem;
      color: #718096;
    }
    
    .input-group {
      position: relative;
      margin-bottom: 18px;
    }
    
    .input-field {
      width: 100%;
      padding: 14px 14px 14px 50px;
      border: 2px solid #e2e8f0;
      border-radius: 14px;
      font-size: 0.95rem;
      background: #ffffff;
      transition: all 0.3s ease;
      color: #2d3748;
      font-family: inherit;
      box-sizing: border-box;
    }
    
    .input-field:focus {
      outline: none;
      border-color: #ff4081;
      box-shadow: 0 0 0 3px rgba(255, 64, 129, 0.1);
    }
    
    .input-field::placeholder {
      color: #a0aec0;
    }
    
    .textarea-field {
      width: 100%;
      padding: 14px 14px 14px 50px;
      border: 2px solid #e2e8f0;
      border-radius: 14px;
      font-size: 0.95rem;
      background: #ffffff;
      transition: all 0.3s ease;
      color: #2d3748;
      min-height: 80px;
      resize: vertical;
      font-family: inherit;
      box-sizing: border-box;
    }
    
    .textarea-field:focus {
      outline: none;
      border-color: #ff4081;
      box-shadow: 0 0 0 3px rgba(255, 64, 129, 0.1);
    }
    
    .input-icon {
      position: absolute;
      left: 16px;
      top: 50%;
      transform: translateY(-50%);
      color: #a0aec0;
      font-size: 1.2rem;
      z-index: 2;
      pointer-events: none;
    }
    
    .textarea-icon {
      position: absolute;
      left: 16px;
      top: 18px;
      color: #a0aec0;
      font-size: 1.2rem;
      z-index: 2;
      pointer-events: none;
    }
    
    .field-label {
      font-family: 'Inter', sans-serif;
      font-size: 0.85rem;
      color: #4a5568;
      margin-bottom: 6px;
      font-weight: 500;
      letter-spacing: 0.3px;
    }
    
    .register-button {
      width: 100%;
      padding: 16px;
      background: linear-gradient(135deg, #ff4081, #e91e63);
      border: none;
      border-radius: 14px;
      color: white;
      font-size: 1.05rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      margin: 20px 0 16px 0;
    }
    
    .register-button:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(255, 64, 129, 0.3);
    }
    
    .register-button:disabled {
      background: #cbd5e0;
      cursor: not-allowed;
      transform: none;
    }
    
    .terms-container {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      margin: 16px 0 20px 0;
      font-size: 0.85rem;
      color: #4a5568;
      line-height: 1.4;
    }
    
    .switch-mode {
      text-align: center;
      margin-top: 20px;
      color: #718096;
      font-size: 0.9rem;
    }
    
    .switch-link {
      color: #ff4081;
      font-weight: 600;
      cursor: pointer;
      text-decoration: none;
    }
    
    .switch-link:hover {
      text-decoration: underline;
    }
    
    .optional-label {
      color: #a0aec0;
      font-size: 0.75rem;
    }
  `;

  return (
    <IonPage>
      <style>{customStyles}</style>
      
      <IonContent scrollY={false}>
        <div className="register-container">
          <div className="register-card">
            {/* Logo */}
            <div className="logo-container">
        
              <div className="brand-name">W-Protect</div>
            </div>

            {/* Title */}
            <h1 className="register-title">Ingresar</h1>
            <p className="register-subtitle">Ingresa con tu email o crea tu cuenta</p>

            {/* User Avatar Preview */}
            {form.name.trim() && (
              <div className="user-avatar-section">
                <div className="user-avatar">
                  {getInitials(form.name)}
                </div>
                <div className="avatar-label">Tu avatar</div>
              </div>
            )}

            {/* Full Name Input */}
            <div className="input-group">
              <div className="field-label">Nombre Completo *</div>
              <div style={{ position: 'relative' }}>
                <IonIcon icon={personOutline} className="input-icon" />
                <input
                  type="text"
                  className="input-field"
                  placeholder="Ingresa tu nombre completo"
                  value={form.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                />
              </div>
            </div>

            {/* Email Input */}
            <div className="input-group">
              <div className="field-label">Correo Electrónico *</div>
              <div style={{ position: 'relative' }}>
                <IonIcon icon={mailOutline} className="input-icon" />
                <input
                  type="email"
                  className="input-field"
                  placeholder="tu@email.com"
                  value={form.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="input-group">
              <div className="field-label">Contraseña *</div>
              <div style={{ position: 'relative' }}>
                <IonIcon icon={lockClosedOutline} className="input-icon" />
                <input
                  type="password"
                  className="input-field"
                  placeholder="Tu contraseña"
                  value={form.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                />
              </div>
            </div>

            {/* Phone Input */}
            <div className="input-group">
              <div className="field-label">Número de Teléfono *</div>
              <div style={{ position: 'relative' }}>
                <IonIcon icon={callOutline} className="input-icon" />
                <input
                  type="tel"
                  className="input-field"
                  placeholder="+57 123 456 7890"
                  value={form.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                />
              </div>
            </div>

            {/* Register Button */}
            <button
              className="register-button"
              onClick={handleRegister}
              disabled={!hasValidEmail() || !form.password.trim() || isLoading}
            >
              {isLoading ? 'Validando acceso...' : 'Ingresar'}
            </button>

            {/* Switch to Login */}
            {onSwitchToLogin && (
              <div className="switch-mode">
                ¿Ya tienes cuenta?{' '}
                <span className="switch-link" onClick={onSwitchToLogin}>
                  Iniciar Sesión
                </span>
              </div>
            )}
          </div>
        </div>

        <IonToast
          isOpen={!!toastMessage}
          message={toastMessage}
          duration={3000}
          onDidDismiss={() => setToastMessage('')}
          position="top"
        />
      </IonContent>
    </IonPage>
  );
};