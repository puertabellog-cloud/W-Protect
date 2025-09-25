// Servicio alternativo para enviar emails usando Formspree (100% gratuito)
export const sendEmailViaFormspree = async (userName: string, userEmail: string) => {
  try {
    const response = await fetch('https://formspree.io/f/wprotect-demo', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: userEmail,
        name: userName,
        subject: '¡Bienvenida a la familia W-Protect! 💗',
        message: `Nueva usuaria registrada: ${userName} (${userEmail})`,
        _replyto: userEmail,
        _subject: `Bienvenida ${userName} a W-Protect`
      })
    });

    return response.ok;
  } catch (error) {
    console.error('Error con Formspree:', error);
    return false;
  }
};

// Servicio usando Web3Forms (gratuito ilimitado)
export const sendEmailViaWeb3Forms = async (userName: string, userEmail: string) => {
  try {
    const formData = new FormData();
    formData.append('access_key', 'demo-wprotect-key'); // Reemplazar con key real
    formData.append('subject', '¡Bienvenida a la familia W-Protect! 💗');
    formData.append('email', userEmail);
    formData.append('name', userName);
    formData.append('message', `¡Hola ${userName}!

¡Gracias por hacer parte de la familia W-Protect! 💗

Tu seguridad es nuestra prioridad. Ahora tienes acceso completo a todas las funciones de protección.

🛡️ Funciones disponibles:
✨ Alertas a contactos de confianza
🚨 Botón de pánico
📱 Ubicación en tiempo real

¡Mantente segura!

El equipo de W-Protect 💗`);

    const response = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      body: formData
    });

    return response.ok;
  } catch (error) {
    console.error('Error con Web3Forms:', error);
    return false;
  }
};