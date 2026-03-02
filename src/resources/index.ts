import { Article, ResourceCategory } from '../api/interface.js';
import { articulo1, articulo2, articulo3, articulo4 } from './articles.js';

// Categorías de recursos
export const categorias: ResourceCategory[] = [
  {
    id: 'seguridad',
    nombre: 'Seguridad Personal',
    descripcion: 'Consejos y estrategias para mantenerte segura',
    icono: 'shield-checkmark-outline',
    color: '#10b981'
  },
  {
    id: 'autodefensa',
    nombre: 'Autodefensa',
    descripcion: 'Técnicas básicas de defensa personal',
    icono: 'fitness-outline',
    color: '#f59e0b'
  },
  {
    id: 'legal',
    nombre: 'Aspectos Legales',
    descripcion: 'Conoce tus derechos y opciones legales',
    icono: 'library-outline',
    color: '#3b82f6'
  },
  {
    id: 'psicologico',
    nombre: 'Apoyo Psicológico',
    descripcion: 'Cuidado de la salud mental y emocional',
    icono: 'heart-outline',
    color: '#ec4899'
  },
  {
    id: 'tecnologia',
    nombre: 'Seguridad Digital',
    descripcion: 'Protección en el mundo digital',
    icono: 'phone-portrait-outline',
    color: '#8b5cf6'
  }
];

// Todos los artículos
export const todosLosArticulos: Article[] = [
  articulo1, // Autodefensa básica
  articulo2, // Señales de peligro
  articulo3, // Números de emergencia
  articulo4, // Seguridad digital
  
  // Artículo 5
  {
    id: 'derechos-legales',
    titulo: 'Conoce tus Derechos Legales',
    categoria: 'legal',
    descripcion: 'Información esencial sobre tus derechos como mujer y ciudadana.',
    duracionLectura: 9,
    tags: ['derechos', 'legal', 'justicia'],
    destacado: false,
    icono: 'library-outline',
    fechaPublicacion: '2025-09-25',
    contenido: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; line-height: 1.6; color: #333;">
        <h2 style="color: #d946ef; margin-bottom: 20px;">⚖️ Conoce tus Derechos Legales</h2>
        
        <p style="margin-bottom: 15px; font-size: 16px;">
          Conocer tus derechos es fundamental para protegerte y buscar justicia cuando sea necesario.
        </p>

        <h3 style="color: #7c2d92; margin-top: 25px;">👩‍⚖️ Derechos Fundamentales</h3>
        <ul style="margin-left: 20px; margin-bottom: 20px;">
          <li><strong>Derecho a la vida e integridad:</strong> Nadie puede herirte física o emocionalmente</li>
          <li><strong>Derecho a la libertad:</strong> Puedes moverte y decidir libremente</li>
          <li><strong>Derecho a la igualdad:</strong> Mismo trato ante la ley sin discriminación</li>
          <li><strong>Derecho a la privacidad:</strong> Tu intimidad debe ser respetada</li>
          <li><strong>Derecho al trabajo digno:</strong> Sin acoso ni discriminación</li>
        </ul>

        <div style="background: #dcfce7; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #10b981;">
          <h4 style="color: #065f46; margin-top: 0;">🏛️ En Colombia puedes acudir a:</h4>
          <ul style="color: #047857; margin-left: 20px;">
            <li><strong>Fiscalía General de la Nación:</strong> Para denunciar delitos</li>
            <li><strong>Defensoría del Pueblo:</strong> Para protección de derechos humanos</li>
            <li><strong>Comisarías de Familia:</strong> Para violencia intrafamiliar</li>
            <li><strong>Personería:</strong> Para quejas contra autoridades</li>
          </ul>
        </div>

        <h3 style="color: #7c2d92; margin-top: 25px;">📝 Cómo Presentar una Denuncia</h3>
        <ol style="margin-left: 20px; margin-bottom: 20px;">
          <li><strong>Recopila evidencia:</strong> Fotos, mensajes, testimonios</li>
          <li><strong>Anota todo:</strong> Fechas, lugares, personas involucradas</li>
          <li><strong>Busca testigos:</strong> Personas que hayan presenciado los hechos</li>
          <li><strong>Acude a la autoridad competente:</strong> No esperes</li>
          <li><strong>Solicita copia:</strong> De tu denuncia siempre</li>
        </ol>

        <p style="margin-top: 25px; font-style: italic; color: #6b7280;">
          Recuerda: La justicia existe para protegerte. No tengas miedo de ejercer tus derechos.
        </p>
      </div>
    `
  },

  // Artículo 6
  {
    id: 'apoyo-emocional',
    titulo: 'Cuidando tu Salud Mental',
    categoria: 'psicologico',
    descripcion: 'Estrategias para mantener tu bienestar emocional en situaciones difíciles.',
    duracionLectura: 8,
    tags: ['salud mental', 'emociones', 'bienestar'],
    destacado: false,
    icono: 'heart-outline',
    fechaPublicacion: '2025-09-25',
    contenido: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; line-height: 1.6; color: #333;">
        <h2 style="color: #d946ef; margin-bottom: 20px;">💝 Cuidando tu Salud Mental</h2>
        
        <p style="margin-bottom: 15px; font-size: 16px;">
          Tu salud mental es tan importante como tu seguridad física. Aprende a cuidarte emocionalmente.
        </p>

        <h3 style="color: #7c2d92; margin-top: 25px;">🧘‍♀️ Técnicas de Manejo del Estrés</h3>
        <ul style="margin-left: 20px; margin-bottom: 20px;">
          <li><strong>Respiración profunda:</strong> 4 segundos inhalar, 4 mantener, 4 exhalar</li>
          <li><strong>Mindfulness:</strong> Concéntrate en el momento presente</li>
          <li><strong>Ejercicio físico:</strong> Libera endorfinas naturales</li>
          <li><strong>Conexión social:</strong> Habla con personas de confianza</li>
          <li><strong>Rutinas saludables:</strong> Mantén horarios regulares</li>
        </ul>

        <div style="background: #fef3e2; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
          <p style="margin: 0; font-weight: 600; color: #92400e;">⚠️ Si sientes pensamientos de hacerte daño, busca ayuda profesional inmediatamente.</p>
        </div>

        <h3 style="color: #7c2d92; margin-top: 25px;">🤝 Construyendo Redes de Apoyo</h3>
        <ul style="margin-left: 20px; margin-bottom: 20px;">
          <li><strong>Identifica personas de confianza:</strong> Familia, amigos cercanos</li>
          <li><strong>Mantén comunicación regular:</strong> No te aísles</li>
          <li><strong>Busca grupos de apoyo:</strong> Con personas en situaciones similares</li>
          <li><strong>Considera ayuda profesional:</strong> Psicólogos, trabajadores sociales</li>
        </ul>

        <p style="margin-top: 25px; font-style: italic; color: #6b7280;">
          No estás sola. Buscar ayuda es un acto de valentía, no de debilidad.
        </p>
      </div>
    `
  },

  // Artículo 7
  {
    id: 'seguridad-hogar',
    titulo: 'Seguridad en el Hogar',
    categoria: 'seguridad',
    descripcion: 'Consejos para hacer de tu hogar un lugar más seguro.',
    duracionLectura: 6,
    tags: ['hogar', 'seguridad doméstica', 'prevención'],
    destacado: false,
    icono: 'home-outline',
    fechaPublicacion: '2025-09-25',
    contenido: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; line-height: 1.6; color: #333;">
        <h2 style="color: #d946ef; margin-bottom: 20px;">🏠 Seguridad en el Hogar</h2>
        
        <p style="margin-bottom: 15px; font-size: 16px;">
          Tu hogar debe ser tu refugio seguro. Aquí te mostramos cómo fortalecerlo.
        </p>

        <h3 style="color: #7c2d92; margin-top: 25px;">🚪 Seguridad en Puertas y Ventanas</h3>
        <ul style="margin-left: 20px; margin-bottom: 20px;">
          <li><strong>Cerraduras de calidad:</strong> Invierte en cerraduras sólidas</li>
          <li><strong>Múltiples seguros:</strong> Pestillos, cadenas, barras</li>
          <li><strong>Mirilla clara:</strong> Para ver quién toca antes de abrir</li>
          <li><strong>Ventanas seguras:</strong> Rejas o películas de seguridad</li>
          <li><strong>Luces exteriores:</strong> Ilumina entradas y puntos ciegos</li>
        </ul>

        <h3 style="color: #7c2d92; margin-top: 25px;">👥 Precauciones con Visitantes</h3>
        <ul style="margin-left: 20px; margin-bottom: 20px;">
          <li><strong>Verifica identidad:</strong> Siempre pide identificación</li>
          <li><strong>No abras a desconocidos:</strong> Especialmente si estás sola</li>
          <li><strong>Citas confirmadas:</strong> Verifica servicios técnicos por teléfono</li>
          <li><strong>Ten un plan:</strong> Para situaciones de emergencia</li>
        </ul>

        <p style="margin-top: 25px; font-style: italic; color: #6b7280;">
          Un hogar seguro te da paz mental y protección para ti y tus seres queridos.
        </p>
      </div>
    `
  },

  // Artículo 8
  {
    id: 'seguridad-transporte',
    titulo: 'Seguridad en el Transporte',
    categoria: 'seguridad',
    descripcion: 'Consejos para mantenerte segura al usar transporte público y privado.',
    duracionLectura: 7,
    tags: ['transporte', 'uber', 'taxi', 'transporte público'],
    destacado: false,
    icono: 'car-outline',
    fechaPublicacion: '2025-09-25',
    contenido: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; line-height: 1.6; color: #333;">
        <h2 style="color: #d946ef; margin-bottom: 20px;">🚗 Seguridad en el Transporte</h2>
        
        <p style="margin-bottom: 15px; font-size: 16px;">
          Moverse por la ciudad puede ser riesgoso. Aquí tienes consejos para viajar más segura.
        </p>

        <h3 style="color: #7c2d92; margin-top: 25px;">🚕 Taxis y Apps de Transporte</h3>
        <ul style="margin-left: 20px; margin-bottom: 20px;">
          <li><strong>Verifica la placa:</strong> Antes de subir, confirma que coincida</li>
          <li><strong>Comparte tu viaje:</strong> Envía ubicación en tiempo real</li>
          <li><strong>Siéntate atrás:</strong> Del lado derecho para salir rápido</li>
          <li><strong>Mantén contacto:</strong> Llama a alguien durante el viaje</li>
          <li><strong>Confía en tu instinto:</strong> Si algo se siente mal, bájate</li>
        </ul>

        <h3 style="color: #7c2d92; margin-top: 25px;">🚌 Transporte Público</h3>
        <ul style="margin-left: 20px; margin-bottom: 20px;">
          <li><strong>Evita horas pico:</strong> Menos aglomeraciones = más seguro</li>
          <li><strong>Mantente alerta:</strong> No uses audífonos en zonas peligrosas</li>
          <li><strong>Cerca de la salida:</strong> Siéntate donde puedas salir rápido</li>
          <li><strong>Objetos de valor ocultos:</strong> No los muestres</li>
        </ul>

        <div style="background: #fef2f2; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ef4444;">
          <p style="margin: 0; font-weight: 600; color: #991b1b;">🚨 Señales de alerta: Conductor que no sigue la ruta, hace preguntas personales o actúa de forma extraña.</p>
        </div>

        <p style="margin-top: 25px; font-style: italic; color: #6b7280;">
          Tu seguridad vale más que llegar puntual. Si algo se siente mal, busca alternativas.
        </p>
      </div>
    `
  },

  // Artículo 9
  {
    id: 'violencia-genero',
    titulo: 'Reconocer Violencia de Género',
    categoria: 'psicologico',
    descripcion: 'Identifica los diferentes tipos de violencia y cómo buscar ayuda.',
    duracionLectura: 10,
    tags: ['violencia de género', 'ayuda', 'denuncia', 'apoyo'],
    destacado: true,
    icono: 'heart-dislike-outline',
    fechaPublicacion: '2025-09-25',
    contenido: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; line-height: 1.6; color: #333;">
        <h2 style="color: #d946ef; margin-bottom: 20px;">💔 Reconocer Violencia de Género</h2>
        
        <p style="margin-bottom: 15px; font-size: 16px;">
          La violencia de género no siempre es física. Aprende a identificar todas sus formas.
        </p>

        <div style="background: #fef2f2; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ef4444;">
          <p style="margin: 0; font-weight: 600; color: #991b1b;">⚠️ Si estás en peligro inmediato, llama al 123 o busca ayuda en lugar seguro.</p>
        </div>

        <h3 style="color: #7c2d92; margin-top: 25px;">🚩 Tipos de Violencia</h3>
        
        <h4 style="color: #7c2d92; margin-top: 20px;">Violencia Física</h4>
        <ul style="margin-left: 20px; margin-bottom: 15px;">
          <li>Golpes, empujones, pellizcos</li>
          <li>Lanzar objetos</li>
          <li>Impedir salir de casa</li>
          <li>Amenazas de muerte</li>
        </ul>

        <h4 style="color: #7c2d92; margin-top: 20px;">Violencia Psicológica</h4>
        <ul style="margin-left: 20px; margin-bottom: 15px;">
          <li>Insultos constantes, humillaciones</li>
          <li>Control excesivo (revisar teléfono, redes sociales)</li>
          <li>Aislarte de familia y amigos</li>
          <li>Chantaje emocional</li>
          <li>Destruir tu autoestima</li>
        </ul>

        <h4 style="color: #7c2d92; margin-top: 20px;">Violencia Económica</h4>
        <ul style="margin-left: 20px; margin-bottom: 15px;">
          <li>Controlar el dinero</li>
          <li>Impedir trabajar o estudiar</li>
          <li>Ocultar ingresos</li>
          <li>Generar deudas a tu nombre</li>
        </ul>

        <h4 style="color: #7c2d92; margin-top: 20px;">Violencia Sexual</h4>
        <ul style="margin-left: 20px; margin-bottom: 15px;">
          <li>Relaciones forzadas</li>
          <li>Tocamientos sin consentimiento</li>
          <li>Obligar a ver pornografía</li>
          <li>Control reproductivo</li>
        </ul>

        <div style="background: #dcfce7; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #10b981;">
          <h4 style="color: #065f46; margin-top: 0;">🆘 Dónde Buscar Ayuda:</h4>
          <ul style="color: #047857; margin-left: 20px;">
            <li><strong>Línea 155:</strong> Orientación nacional</li>
            <li><strong>Comisarías de Familia</strong></li>
            <li><strong>Fiscalía General de la Nación</strong></li>
            <li><strong>Casas de Acogida</strong></li>
            <li><strong>Fundaciones especializadas</strong></li>
          </ul>
        </div>

        <h3 style="color: #7c2d92; margin-top: 25px;">💪 Plan de Seguridad</h3>
        <ol style="margin-left: 20px; margin-bottom: 20px;">
          <li><strong>Documenta todo:</strong> Fotos, mensajes, testimonios</li>
          <li><strong>Red de apoyo:</strong> Identifica personas de confianza</li>
          <li><strong>Lugar seguro:</strong> Ten un lugar donde ir</li>
          <li><strong>Dinero de emergencia:</strong> Guarda efectivo escondido</li>
          <li><strong>Documentos importantes:</strong> Ten copias en lugar seguro</li>
        </ol>

        <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #3b82f6;">
          <p style="margin: 0; color: #1e40af; font-weight: 600;">
            💙 Recuerda: No es tu culpa. Mereces una vida libre de violencia. Hay ayuda disponible.
          </p>
        </div>

        <p style="margin-top: 25px; font-style: italic; color: #6b7280;">
          El primer paso para salir de la violencia es reconocerla. No estás sola.
        </p>
      </div>
    `
  },

  // Artículo 10
  {
    id: 'tecnologia-seguridad',
    titulo: 'Apps y Tecnología para tu Seguridad',
    categoria: 'tecnologia',
    descripcion: 'Herramientas tecnológicas que pueden ayudarte a mantenerte más segura.',
    duracionLectura: 6,
    tags: ['apps', 'tecnología', 'gps', 'alertas'],
    destacado: false,
    icono: 'phone-portrait-outline',
    fechaPublicacion: '2025-09-25',
    contenido: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; line-height: 1.6; color: #333;">
        <h2 style="color: #d946ef; margin-bottom: 20px;">📱 Apps y Tecnología para tu Seguridad</h2>
        
        <p style="margin-bottom: 15px; font-size: 16px;">
          Tu teléfono puede ser tu mejor aliado para mantenerte segura. Aquí tienes las mejores herramientas.
        </p>

        <h3 style="color: #7c2d92; margin-top: 25px;">🚨 Apps de Emergencia</h3>
        <ul style="margin-left: 20px; margin-bottom: 20px;">
          <li><strong>W-Protect:</strong> Tu app actual - alertas rápidas a contactos</li>
          <li><strong>SkyAlert:</strong> Alertas de emergencias y desastres</li>
          <li><strong>Botón de Pánico:</strong> Para alertas policiales inmediatas</li>
          <li><strong>bSafe:</strong> Grabación automática y GPS</li>
        </ul>

        <h3 style="color: #7c2d92; margin-top: 25px;">📍 Ubicación y Rastreo</h3>
        <ul style="margin-left: 20px; margin-bottom: 20px;">
          <li><strong>Encuentra Mi iPhone/Android:</strong> Para localizar tu dispositivo</li>
          <li><strong>Apps de mapas:</strong> Compartir ubicación en tiempo real</li>
          <li><strong>Life360:</strong> Para familias - círculos de ubicación</li>
          <li><strong>Glympse:</strong> Compartir ubicación temporal</li>
        </ul>

        <h3 style="color: #7c2d92; margin-top: 25px;">🔒 Configuraciones de Seguridad</h3>
        <ul style="margin-left: 20px; margin-bottom: 20px;">
          <li><strong>SOS de emergencia:</strong> Activar en configuraciones</li>
          <li><strong>Contactos de emergencia:</strong> En tu perfil médico</li>
          <li><strong>Mensajes automáticos:</strong> Que se envíen al activar SOS</li>
          <li><strong>Grabación de voz:</strong> Apps que graban automáticamente</li>
        </ul>

        <div style="background: #dcfce7; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #10b981;">
          <h4 style="color: #065f46; margin-top: 0;">💡 Consejos Importantes:</h4>
          <ul style="color: #047857; margin-left: 20px;">
            <li>Mantén tu teléfono siempre cargado</li>
            <li>Practica usar las funciones de emergencia</li>
            <li>Ten un plan de respaldo si se daña tu teléfono</li>
            <li>Actualiza las apps regularmente</li>
          </ul>
        </div>

        <h3 style="color: #7c2d92; margin-top: 25px;">⌚ Dispositivos Wearables</h3>
        <ul style="margin-left: 20px; margin-bottom: 20px;">
          <li><strong>Apple Watch/Smartwatch:</strong> Detección de caídas y SOS</li>
          <li><strong>Alarmas personales:</strong> Dispositivos pequeños y ruidosos</li>
          <li><strong>Joyería inteligente:</strong> Botones de pánico discretos</li>
        </ul>

        <p style="margin-top: 25px; font-style: italic; color: #6b7280;">
          La tecnología es una herramienta poderosa, pero recuerda que tu instinto y precaución siguen siendo fundamentales.
        </p>
      </div>
    `
  }
];

// Funciones de utilidad
export const obtenerArticulosPorCategoria = (categoria: string): Article[] => {
  return todosLosArticulos.filter(articulo => articulo.categoria === categoria);
};

export const obtenerArticulosDestacados = (): Article[] => {
  return todosLosArticulos.filter(articulo => articulo.destacado);
};

export const obtenerArticuloPorId = (id: string): Article | undefined => {
  return todosLosArticulos.find(articulo => articulo.id === id);
};

export const buscarArticulos = (termino: string): Article[] => {
  const terminoLower = termino.toLowerCase();
  return todosLosArticulos.filter(articulo => 
    articulo.titulo.toLowerCase().includes(terminoLower) ||
    articulo.descripcion.toLowerCase().includes(terminoLower) ||
    articulo.tags.some(tag => tag.toLowerCase().includes(terminoLower))
  );
};