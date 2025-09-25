/**
 * Utilidades para avatares de usuario
 */

/**
 * Obtiene las iniciales de un nombre completo
 * @param name - Nombre completo del usuario
 * @returns Iniciales del usuario (máximo 2 letras)
 */
export const getInitials = (name: string): string => {
  if (!name || name.trim() === '') return '👤';
  
  const cleanName = name.trim();
  const words = cleanName.split(' ').filter(word => word.length > 0);
  
  if (words.length === 0) return '👤';
  if (words.length === 1) {
    return words[0].charAt(0).toUpperCase();
  }
  
  // Tomar primera letra del primer nombre y primera letra del último apellido
  const firstInitial = words[0].charAt(0).toUpperCase();
  const lastInitial = words[words.length - 1].charAt(0).toUpperCase();
  
  return firstInitial + lastInitial;
};

/**
 * Genera un color de fondo para el avatar basado en el nombre
 * @param name - Nombre del usuario
 * @returns Color hex para el fondo del avatar
 */
export const getAvatarColor = (name: string): string => {
  if (!name) return '#ff4081';
  
  // Generar un color basado en el hash del nombre
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  // Colores predefinidos que van bien con el tema de la app
  const colors = [
    '#ff4081', // Rosa principal
    '#e91e63', // Rosa oscuro
    '#9c27b0', // Púrpura
    '#673ab7', // Púrpura oscuro
    '#3f51b5', // Índigo
    '#2196f3', // Azul
    '#00bcd4', // Cian
    '#009688', // Teal
    '#4caf50', // Verde
    '#8bc34a', // Verde claro
    '#ff9800', // Naranja
    '#ff5722'  // Naranja oscuro
  ];
  
  const index = Math.abs(hash) % colors.length;
  return colors[index];
};

/**
 * Genera un gradiente CSS para el avatar basado en el nombre
 * @param name - Nombre del usuario
 * @returns String CSS con el gradiente
 */
export const getAvatarGradient = (name: string): string => {
  const baseColor = getAvatarColor(name);
  // Crear una versión más oscura del color para el gradiente
  const darkColor = adjustColorBrightness(baseColor, -20);
  return `linear-gradient(135deg, ${baseColor} 0%, ${darkColor} 100%)`;
};

/**
 * Ajusta el brillo de un color hex
 * @param hex - Color en formato hex (#rrggbb)
 * @param percent - Porcentaje de ajuste (-100 a 100)
 * @returns Color hex ajustado
 */
function adjustColorBrightness(hex: string, percent: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = (num >> 16) + amt;
  const G = (num >> 8 & 0x00FF) + amt;
  const B = (num & 0x0000FF) + amt;
  
  return '#' + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
    (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
    (B < 255 ? B < 1 ? 0 : B : 255))
    .toString(16).slice(1);
}