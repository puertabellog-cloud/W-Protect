// Configuración de EmailJS para W-Protect
// Para obtener tus propias credenciales:
// 1. Ve a https://www.emailjs.com/
// 2. Regístrate gratis (200 emails/mes)
// 3. Crea un servicio (Gmail, Outlook, etc.)
// 4. Crea un template de email
// 5. Reemplaza estos valores con los tuyos

export const EMAIL_CONFIG = {
  // ✅ Credenciales reales de EmailJS configuradas:
  SERVICE_ID: 'service_ijizphk', 
  TEMPLATE_ID: 'template_k9qs3cg',  
  PUBLIC_KEY: '6c0jIPZLA61__TjyT'
};

// Parámetros que se envían a tu template de EmailJS
export const getEmailTemplate = (userName: string, userEmail: string) => {
  console.log('📧 Preparando email para:', { userName, userEmail });
  
  return {
    to_name: userName || 'Usuario',
    to_email: userEmail,
    from_name: 'W-Protect Team',
    reply_to: 'wprotect@safewomen.com',
    // Campos adicionales que puede necesitar tu template
    user_name: userName,
    user_email: userEmail,
    subject: '¡Bienvenida a W-Protect!',
    message: `¡Hola ${userName}! Bienvenida a W-Protect, tu espacio seguro 💗`
  };
};