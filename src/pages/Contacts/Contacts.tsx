import React, { useState, useEffect } from 'react';
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent,
  IonCard, IonCardHeader, IonCardTitle, IonCardContent,
  IonButton, IonIcon, IonList, IonItem, IonLabel,
  IonToast, IonModal, IonSearchbar, IonItemSliding,
  IonItemOption, IonItemOptions, IonInput, IonFooter,
  IonText, IonBadge, IonAvatar, IonAlert
} from '@ionic/react';
import { 
  add, personCircle, trash, create, shieldCheckmarkOutline,
  peopleOutline, callOutline, locationOutline, personAdd, close, checkmark
} from 'ionicons/icons';
import { Contacts } from '@capacitor-community/contacts';
import { Capacitor } from '@capacitor/core';
import { AppHeader } from '../../components/AppHeader';
import { getInitials } from '../../utils/avatarUtils';
import { getContactsByUserId, createContact, updateContact, saveContact, deleteContact as deleteContactService } from '../../services/springBootServices';
import { Contact } from '../../types';
import { getSession } from '../../services/sessionService';

// Tipos específicos para este componente
interface ContactFromDevice {
  contactId: string;
  displayName?: string;
  name?: {
    given?: string;
    family?: string;
    display?: string;
  };
  phones?: Array<{
    number: string;
  }>;
}

// Configuración simplificada para mejor compatibilidad
const projection = {
  name: true,
  phones: true
};

const ContactsPage: React.FC = () => {
  const [emergencyContacts, setEmergencyContacts] = useState<Contact[]>([]);
  const [allContacts, setAllContacts] = useState<ContactFromDevice[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<ContactFromDevice[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [isManualContactModalOpen, setIsManualContactModalOpen] = useState(false);
  const [manualContactName, setManualContactName] = useState('');
  const [manualContactPhone, setManualContactPhone] = useState('');
  const [toastMessage, setToastMessage] = useState<string>("");
  const [toastColor, setToastColor] = useState<'success' | 'danger' | 'warning'>('success');
  const [editContactIndex, setEditContactIndex] = useState<number | null>(null);
  const [deleteContactIndex, setDeleteContactIndex] = useState<number | null>(null);
  const [editName, setEditName] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  // Estado que indica si ya terminamos de cargar el perfil
  const [profileReady, setProfileReady] = useState(false);

  /* ----- NUEVO ESTADO PARA EL USER ID ----- */
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  /* --------------------------------------------------------------
     1️⃣  CARGAR EL USER ID DESDE LA SESIÓN
     -------------------------------------------------------------- */
  useEffect(() => {
    const session = getSession();

    if (session?.userId) {
      setCurrentUserId(session.userId);
    } else {
      console.warn('No hay sesión activa con userId.');
    }

    setProfileReady(true);
  }, []);


  // Monitorear estado de conexión
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
  // Esperamos a que el perfil se haya intentado cargar
  if (!profileReady) return;

  // Si no conseguimos un id, podemos abortar o usar un fallback
  if (currentUserId === null) {
    console.debug('No hay userId disponible; cargando contactos locales si existen.');
    // Podemos aun cargar los contactos locales (offline) aquí si queremos
    loadEmergencyContacts();   // <-- llamamos a la función que ya tienes
    return;
  }

  // Con id válido, cargamos los contactos del servidor (o local si offline)
  loadEmergencyContacts();
}, [profileReady, currentUserId]); 

  // === FUNCIONES DE BACKEND ===

  const loadEmergencyContacts = async () => {
    if (!isOnline) {
      // Si no hay conexión, cargar desde localStorage
      const savedContacts = localStorage.getItem('emergencyContacts');
      if (savedContacts) {
        setEmergencyContacts(JSON.parse(savedContacts));
      }
      return;
    }

    // Verificar que tenemos un userId válido
    if (currentUserId === null) {
      console.debug('No se puede cargar contactos sin userId - usando fallback local si existe');
      return;
    }

    setIsLoading(true);
    try {
      const contacts = await getContactsByUserId(currentUserId);
      setEmergencyContacts(contacts);
      
      // Guardar en localStorage como backup
      localStorage.setItem('emergencyContacts', JSON.stringify(contacts));
      
    } catch (error) {
      console.error('Error cargando contactos:', error);
      showToast('Error cargando contactos del servidor: ' + error, 'danger');
      
      // Cargar desde localStorage como fallback
      const savedContacts = localStorage.getItem('emergencyContacts');
      if (savedContacts) {
        setEmergencyContacts(JSON.parse(savedContacts));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const saveContactToBackend = async (contactData: { name: string; phone: string }) => {
    // Requerimos que exista un `currentUserId` válido y conexión en producción.
    if (currentUserId === null) {
      // No permitimos crear contactos sin userId; la app en producción siempre debe tenerlo.
      console.error('Intento de guardar contacto sin userId disponible');
      showToast('Error: usuario no identificado. Inicia sesión en el dispositivo.', 'danger');
      return;
    }

    if (!isOnline) {
      console.error('Intento de guardar contacto sin conexión');
      showToast('No hay conexión. Conéctate a internet para agregar contactos.', 'danger');
      return;
    }

    try {
      console.log("Creando nuevo contacto...");
      
      // Crear el objeto para nuevo contacto (sin ID)
      const contactToCreate = {
        ...contactData,
        wusuarioId: currentUserId // Usar wusuarioId según la estructura de Contact
        // No incluir 'id' para nuevo contacto
      };
      let dataToSend = JSON.stringify(contactToCreate);
      console.log("Datos a enviar para creación:", dataToSend);
      
      const savedContact = await createContact(contactToCreate);
      const updated = [...emergencyContacts, savedContact];
      setEmergencyContacts(updated);
      localStorage.setItem('emergencyContacts', JSON.stringify(updated));
      
      showToast(`Contacto agregado: ${contactData.name}`, 'success');
    } catch (error) {
      console.error('Error guardando contacto:', error);
      showToast('Error al guardar contacto en el servidor: ' + error, 'danger');
    }
  };

  const updateContactInBackend = async (contactId: number, updates: Partial<Contact>) => {
    if (!isOnline) {
      // Actualizar solo localmente
      const updated = emergencyContacts.map(c => 
        c.id === contactId ? { ...c, ...updates } : c
      );
      setEmergencyContacts(updated);
      localStorage.setItem('emergencyContacts', JSON.stringify(updated));
      localStorage.setItem('pendingSync', 'true');
      
      showToast('Cambios guardados localmente', 'warning');
      return;
    }

    try {
      // Buscar el contacto completo y actualizarlo
      const originalContact = emergencyContacts.find(c => c.id === contactId);
      if (!originalContact) {
        throw new Error('Contacto no encontrado');
      }

      const updatedContactData: Contact = {
        ...originalContact,
        ...updates
      };

      console.log("Actualizando contacto con ID:", contactId, updatedContactData);

      // Usar updateContact específicamente para actualizaciones (PUT)
      const updatedContact = await updateContact(contactId, updatedContactData);
      const updated = emergencyContacts.map(c => 
        c.id === contactId ? updatedContact : c
      );
      setEmergencyContacts(updated);
      localStorage.setItem('emergencyContacts', JSON.stringify(updated));
      
      showToast('Contacto actualizado', 'success');
    } catch (error) {
      console.error('Error actualizando contacto:', error);
      showToast('Error al actualizar contacto: ' + error, 'danger');
    }
  };

  const deleteContactFromBackend = async (contactId: number) => {
    if (!isOnline) {
      // Eliminar solo localmente
      const updated = emergencyContacts.filter(c => c.id !== contactId);
      setEmergencyContacts(updated);
      localStorage.setItem('emergencyContacts', JSON.stringify(updated));
      localStorage.setItem('pendingSync', 'true');
      
      showToast('Contacto eliminado localmente', 'warning');
      return;
    }

    try {
      await deleteContactService(contactId);
      const updated = emergencyContacts.filter(c => c.id !== contactId);
      setEmergencyContacts(updated);
      localStorage.setItem('emergencyContacts', JSON.stringify(updated));
      
      showToast('Contacto eliminado', 'success');
    } catch (error) {
      console.error('Error eliminando contacto:', error);
      showToast('Error al eliminar contacto: ' + error, 'danger');
    }
  };

  // === FUNCIONES DE UI ===

  const showToast = (message: string, color: 'success' | 'danger' | 'warning' = 'success') => {
    setToastMessage(message);
    setToastColor(color);
  };

  // Refrescar datos
  const handleRefresh = async (event: CustomEvent) => {
    await loadEmergencyContacts();
    event.detail.complete();
  };

  // Detectar si está en web para mostrar opción de contacto manual
  const isWeb = (() => {
    try {
      // Método más confiable para detectar web
      return !Capacitor.isNativePlatform();
    } catch {
      // Fallback si Capacitor no está disponible
      return typeof window !== 'undefined' && 
             !window.DeviceMotionEvent && 
             navigator.userAgent.indexOf('Mobile') === -1;
    }
  })();

  // === Formatear con +57 automáticamente ===
  const formatPhoneWithCode = (phone: string): string => {
    const cleaned = phone.replace(/\s+/g, '');
    if (!cleaned.startsWith('+57')) {
      return '+57' + cleaned;
    }
    return cleaned;
  };

  // === Agregar contacto manual (para web) ===
  const addManualContact = async () => {
    if (!manualContactName.trim() || !manualContactPhone.trim()) {
      showToast('Por favor completa todos los campos', 'danger');
      return;
    }

    if (emergencyContacts.length >= 5) {
      showToast('Has alcanzado el límite de 5 contactos de emergencia', 'warning');
      return;
    }

    // Limpiar el número de teléfono y agregar +57
    const cleanPhone = formatPhoneWithCode(manualContactPhone.replace(/\s+/g, ''));

    // Verificar si ya existe
    const alreadyAdded = emergencyContacts.some((c) => 
      c.phone.replace(/\s+/g, '') === cleanPhone
    );
    if (alreadyAdded) {
      showToast('Este contacto ya está en tu lista', 'warning');
      return;
    }

    const newContactData = {
      name: manualContactName.trim(),
      phone: cleanPhone,
    };

    console.log("Agregando contacto manual:", newContactData);
    await saveContactToBackend(newContactData);
    
    // Limpiar formulario
    setManualContactName('');
    setManualContactPhone('');
    setIsManualContactModalOpen(false);
  };

  // === Obtener todos los contactos del dispositivo ===
  const openContacts = async () => {
    // Si estamos en web, mostrar mensaje informativo y usar la opción manual
    if (isWeb) {
      showToast('En versión web, usa "Agregar Contacto Manual" para añadir contactos', 'warning');
      return;
    }

    // Verificación adicional para asegurar que no estamos en web
    if (!Capacitor.isNativePlatform()) {
      showToast('Esta función solo está disponible en dispositivos móviles', 'warning');
      return;
    }

    try {
      const permission = await Contacts.requestPermissions();

      if (permission.contacts === 'granted') {
        const result = await Contacts.getContacts({ projection });

        if (!result.contacts.length) {
          showToast("No se encontraron contactos en el dispositivo", 'warning');
          return;
        }

        const contactsWithPhones = result.contacts.filter(contact => 
          contact.phones && contact.phones.length > 0
        ) as ContactFromDevice[];

        setAllContacts(contactsWithPhones);
        setFilteredContacts(contactsWithPhones);
        setIsModalOpen(true);
      } else {
        showToast("Permiso denegado para acceder a contactos", 'danger');
      }
    } catch (error) {
      console.error('Error accessing contacts:', error);
      showToast("Error al acceder a contactos", 'danger');
    }
  };

  // === Obtener nombre de contacto ===
  const getContactName = (contact: ContactFromDevice): string => {
    if (contact.name && typeof contact.name === 'object' && !Array.isArray(contact.name)) {
      const nameData = contact.name;
      
      if (nameData.display && nameData.display.trim()) {
        return nameData.display;
      }
      
      if (nameData.given && nameData.given.trim()) {
        return nameData.given;
      }
      
      const firstName = nameData.given || '';
      const lastName = nameData.family || '';
      
      if (firstName.trim() || lastName.trim()) {
        return `${firstName} ${lastName}`.trim();
      }
    }
    
    if (contact.displayName && contact.displayName.trim()) {
      return contact.displayName;
    }
    
    if (contact.phones && contact.phones.length > 0) {
      return contact.phones[0].number;
    }
    
    return "Sin nombre";
  };

  // === Agregar contacto a la lista de emergencia ===
  const addEmergencyContact = async (contact: ContactFromDevice) => {
    if (emergencyContacts.length >= 5) {
      showToast("Ya tienes el máximo de 5 contactos", 'warning');
      return;
    }

    const phone = contact.phones?.[0]?.number;
    if (!phone) {
      showToast("Este contacto no tiene número válido", 'danger');
      return;
    }

    // Limpiar el número de teléfono y agregar +57
    const cleanPhone = formatPhoneWithCode(phone.replace(/\s+/g, ''));

    const alreadyAdded = emergencyContacts.some((c) => 
      c.phone === cleanPhone
    );
    if (alreadyAdded) {
      showToast("Ese contacto ya fue agregado", 'warning');
      return;
    }

    const newContactData = {
      name: getContactName(contact),
      phone: cleanPhone,
    };

    console.log("Agregando nuevo contacto:", newContactData);
    await saveContactToBackend(newContactData);
    setIsModalOpen(false);
  };

  // === Buscador en la lista de contactos ===
  const handleSearch = (e: CustomEvent) => {
    const query = (e.detail.value || "").toLowerCase();
    if (!query) {
      setFilteredContacts(allContacts);
      return;
    }
    const results = allContacts.filter((c) =>
      getContactName(c).toLowerCase().includes(query)
    );
    setFilteredContacts(results);
  };

  // === Eliminar de emergencia ===
  const confirmDeleteContact = (index: number) => {
    setDeleteContactIndex(index);
    setIsDeleteAlertOpen(true);
  };

  const deleteContact = async () => {
    if (deleteContactIndex === null) return;
    
    const contact = emergencyContacts[deleteContactIndex];
    if (contact.id) {
      await deleteContactFromBackend(contact.id);
    }
    
    setIsDeleteAlertOpen(false);
    setDeleteContactIndex(null);
    // Cerrar cualquier IonItemSliding abierto para ocultar botones
    closeAllSliding();
  };

  // === Editar alias ===
  const openEditModal = (index: number) => {
    setEditContactIndex(index);
    setEditName(emergencyContacts[index].name);
    setIsEditModalOpen(true);
  };

  const saveEdit = async () => {
    if (editContactIndex === null) return;

    const contact = emergencyContacts[editContactIndex];
    
    // Verificar que el contacto tenga ID para actualizarlo
    if (contact.id) {
      console.log('✏️ Editando contacto existente con ID:', contact.id);
      await updateContactInBackend(contact.id, { name: editName });
    } else {
      console.error('❌ Error: Intentando editar contacto sin ID válido');
      showToast('Error: No se puede editar un contacto sin ID válido', 'danger');
      return;
    }

    setIsEditModalOpen(false);
    setEditContactIndex(null);
    // Al guardar, cerrar los sliders abiertos (si veníamos del deslizar)
    closeAllSliding();
  };

  // Cierra todos los IonItemSliding abiertos en la vista
  const closeAllSliding = () => {
    try {
      const sliders = document.querySelectorAll('ion-item-sliding');
      sliders.forEach((s: any) => {
        if (s && typeof s.close === 'function') {
          s.close();
        }
      });
    } catch (err) {
      console.warn('No se pudieron cerrar los sliders automáticamente', err);
    }
  };

  // Estilos CSS modernos para la página
  const pageStyles = `
    .contacts-container {
      background: linear-gradient(180deg, #fff7fb 0%, #ffffff 100%);
      min-height: 100vh;
      padding-bottom: 80px;
    }
    
    .welcome-section {
      padding: 24px 20px 16px 20px;
      text-align: center;
      background: linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(255, 241, 247, 0.9));
      backdrop-filter: blur(10px);
      margin-bottom: 8px;
      border: 1px solid rgba(236, 72, 153, 0.12);
      border-radius: 0 0 24px 24px;
    }
    
    .welcome-icon {
      font-size: 2.2rem;
      color: #ec4899;
      margin-bottom: 8px;
    }
    
    .welcome-title {
      color: #2d3748;
      font-size: 1.3rem;
      font-weight: 700;
      margin-bottom: 12px;
    }
    
    .welcome-subtitle {
      color: #64748b;
      font-size: 0.9rem;
      margin: 0;
      line-height: 1.4;
      max-width: 320px;
      margin: 0 auto;
    }
    
    .contacts-section {
      margin: 20px 16px;
    }
    
    .section-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 16px;
      padding: 0 4px;
    }
    
    .section-title {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #2d3748;
      font-size: 1.2rem;
      font-weight: 700;
      font-family: 'Poppins', sans-serif;
    }
    
    .contacts-counter {
      background: linear-gradient(135deg, #ec4899 0%, #db2777 100%);
      color: white;
      font-size: 0.8rem;
      font-weight: 600;
      padding: 4px 10px;
      border-radius: 12px;
    }
    
    .contact-card {
      background: white;
      border-radius: 20px;
      margin-bottom: 16px;
      box-shadow: 0 10px 28px rgba(236, 72, 153, 0.12);
      overflow: hidden;
      transition: all 0.3s ease;
      border: 1px solid rgba(236, 72, 153, 0.14);
      position: relative;
    }
    
    .contact-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 3px;
      background: linear-gradient(135deg, #f472b6 0%, #ec4899 100%);
    }
    
    .contact-card:hover {
      transform: translateY(-3px);
      box-shadow: 0 16px 36px rgba(236, 72, 153, 0.2);
    }
    
    .contact-item {
      --padding-start: 24px;
      --padding-end: 24px;
      --padding-top: 20px;
      --padding-bottom: 20px;
      --background: transparent;
    }
    
    .contact-avatar {
      width: 56px;
      height: 56px;
      border-radius: 50%;
      background: linear-gradient(135deg, #f472b6 0%, #db2777 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: 700;
      font-size: 1.3rem;
      font-family: 'Poppins', sans-serif;
      letter-spacing: 0.5px;
      box-shadow: 0 8px 18px rgba(219, 39, 119, 0.35);
      margin-right: 20px;
      border: 3px solid rgba(255, 255, 255, 0.3);
    }
    
    .contact-info {
      flex: 1;
      min-width: 0;
    }
    
    .contact-name {
      font-size: 1.2rem;
      font-weight: 700;
      color: #2d3748;
      margin: 0 0 8px 0;
      font-family: 'Poppins', sans-serif;
      line-height: 1.2;
    }
    
    .contact-phone {
      font-size: 0.95rem;
      color: #64748b;
      display: flex;
      align-items: center;
      gap: 8px;
      margin: 0;
      padding: 6px 12px;
      background: rgba(100, 116, 139, 0.1);
      border-radius: 8px;
      width: fit-content;
    }
    
    .contact-phone ion-icon {
      font-size: 16px;
      color: #ec4899;
    }
    
    .empty-state {
      text-align: center;
      padding: 60px 20px;
      background: white;
      border-radius: 20px;
      box-shadow: 0 10px 28px rgba(236, 72, 153, 0.1);
      border: 2px dashed rgba(236, 72, 153, 0.22);
    }
    
    .empty-icon {
      font-size: 5rem;
      margin-bottom: 20px;
      color: #ec4899;
      opacity: 0.7;
    }
    
    .empty-title {
      font-size: 1.4rem;
      font-weight: 700;
      margin: 0 0 12px 0;
      color: #2d3748;
      font-family: 'Poppins', sans-serif;
    }
    
    .empty-description {
      font-size: 1rem;
      line-height: 1.6;
      margin: 0;
      color: #64748b;
      max-width: 280px;
      margin: 0 auto;
    }
    
    .add-button {
      --background: linear-gradient(135deg, #ec4899 0%, #be185d 100%);
      --border-radius: 20px;
      --box-shadow: 0 10px 26px rgba(190, 24, 93, 0.35);
      margin: 20px;
      height: 60px;
      font-weight: 700;
      font-size: 1.2rem;
      font-family: 'Poppins', sans-serif;
      letter-spacing: 0.5px;
    }
    
    .add-button:hover {
      --box-shadow: 0 14px 34px rgba(190, 24, 93, 0.45);
      transform: translateY(-2px);
    }
    
    .add-button:disabled {
      --background: linear-gradient(135deg, #e5e7eb 0%, #d1d5db 100%);
      --color: #9ca3af;
      --box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }
    
    /* Botón optimizado para móvil */
    .mobile-add-button {
      --transition: all 0.3s ease;
      display: block !important;
      visibility: visible !important;
      opacity: 1 !important;
    }
    
    .mobile-add-button:hover {
      transform: translateY(-2px);
    }
    
    /* Asegurar que el content tenga padding-bottom suficiente */
    .contacts-container {
      padding-bottom: 120px !important;
    }
    
    .action-buttons {
      display: flex;
      gap: 8px;
    }
    
    .action-button {
      --border-radius: 16px;
      --padding-start: 16px;
      --padding-end: 16px;
      width: 50px;
      height: 50px;
    }
    
    .edit-button {
      --background: linear-gradient(135deg, #f472b6 0%, #ec4899 100%);
      --color: white;
      --box-shadow: 0 6px 14px rgba(236, 72, 153, 0.3);
    }
    
    .edit-button:hover {
      --box-shadow: 0 8px 18px rgba(219, 39, 119, 0.38);
    }
    
    .delete-button {
      --background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
      --color: white;
      --box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
    }
    
    .delete-button:hover {
      --box-shadow: 0 6px 16px rgba(239, 68, 68, 0.4);
    }
    
    @media (max-width: 768px) {
      .welcome-section {
        padding: 20px 16px 14px 16px;
      }
      
      .welcome-title {
        font-size: 1.2rem;
      }
      
      .welcome-icon {
        font-size: 2rem;
      }
      
      .welcome-subtitle {
        font-size: 0.85rem;
        max-width: 280px;
      }
      
      .contacts-section {
        margin: 16px 12px;
      }
      
      .contact-card {
        margin-bottom: 14px;
        border-radius: 16px;
      }
      
      .contact-item {
        --padding-start: 20px;
        --padding-end: 20px;
        --padding-top: 18px;
        --padding-bottom: 18px;
      }
      
      .contact-avatar {
        width: 50px;
        height: 50px;
        font-size: 1.2rem;
        margin-right: 16px;
      }
      
      .contact-name {
        font-size: 1.1rem;
      }
      
      .contact-phone {
        font-size: 0.9rem;
      }
      
      .action-button {
        width: 46px;
        height: 46px;
      }
      
      .add-button {
        margin: 12px;
        height: 52px;
        font-size: 1rem;
      }
    }
  `;

  return (
    <>
      <style>{pageStyles}</style>
      <IonPage>
        <AppHeader 
          title="Contactos de Emergencia"
          showLogo={true}
        />

        <IonContent 
          fullscreen 
          className="contacts-container"
          scrollY={true}
          style={{ '--padding-bottom': '120px' }}
        >
        {/* Header estilo dashboard */}
        <div className="welcome-section">
          <IonIcon icon={shieldCheckmarkOutline} className="welcome-icon" />
          <h2 className="welcome-title">Mis Contactos de Emergencia</h2>
          <p className="welcome-subtitle">
            Agrega hasta 5 personas de confianza que serán notificadas automáticamente si te encuentras en peligro. 
            Recibirán tu ubicación exacta por mensaje de texto para poder ayudarte rápidamente.
          </p>
        </div>

        {/* Lista de contactos mejorada */}
        <div className="contacts-section">
          <div className="section-header">
            <div className="section-title">
              <IonIcon icon={peopleOutline} />
              <span>Mis Contactos</span>
            </div>
            <IonBadge className="contacts-counter">
              {emergencyContacts.length}/5
            </IonBadge>
          </div>

          {emergencyContacts.length === 0 ? (
            <div className="empty-state">
              <IonIcon icon={peopleOutline} className="empty-icon" />
              <h3 className="empty-title">No tienes contactos de emergencia</h3>
              <p className="empty-description">
                Agrega personas de confianza que puedan ayudarte en caso de emergencia
              </p>
            </div>
          ) : (
            <div>
              {emergencyContacts.map((c, index) => (
                <IonItemSliding key={index} className="contact-card">
                  <IonItem className="contact-item">
                    <div className="contact-avatar">
                      {getInitials(c.name)}
                    </div>
                    <div className="contact-info">
                      <h3 className="contact-name">{c.name}</h3>
                      <p className="contact-phone">
                        <IonIcon icon={callOutline} />
                        {c.phone}
                      </p>
                    </div>
                  </IonItem>
                  <IonItemOptions side="end">
                    <IonItemOption className="edit-button" onClick={() => openEditModal(index)}>
                      <IonIcon icon={create} />
                    </IonItemOption>
                    <IonItemOption className="delete-button" onClick={() => confirmDeleteContact(index)}>
                      <IonIcon icon={trash} />
                    </IonItemOption>
                  </IonItemOptions>
                </IonItemSliding>
              ))}
            </div>
          )}
        </div>

        {/* Espaciado para el contenido */}
        <div style={{ height: '80px' }}></div>
      </IonContent>

      {/* Botón flotante fijo - SIEMPRE VISIBLE */}
      <div style={{
        position: 'fixed',
        bottom: '20px',
        left: '20px',
        right: '20px',
        zIndex: 1000,
        padding: '0',
        background: 'transparent'
      }}>
        <IonButton
          expand="block"
          onClick={isWeb ? () => setIsManualContactModalOpen(true) : openContacts}
          disabled={emergencyContacts.length >= 5}
          style={{
            '--background': emergencyContacts.length >= 5 
              ? 'linear-gradient(135deg, #e5e7eb 0%, #d1d5db 100%)' 
              : 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)',
            '--color': emergencyContacts.length >= 5 ? '#9ca3af' : 'white',
            '--border-radius': '20px',
            '--box-shadow': emergencyContacts.length >= 5 
              ? '0 8px 20px rgba(0, 0, 0, 0.15)'
              : '0 12px 30px rgba(190, 24, 93, 0.45)',
            height: '64px',
            fontWeight: '700',
            fontSize: '1.1rem',
            fontFamily: 'Poppins, sans-serif',
            letterSpacing: '0.5px',
            margin: '0',
            width: '100%',
            border: '2px solid rgba(255, 255, 255, 0.8)'
          }}
        >
          <IonIcon icon={add} slot="start" style={{ fontSize: '1.3rem' }} />
          {emergencyContacts.length >= 5 ? 'Límite alcanzado (5/5)' : 
           isWeb ? 'Agregar Contacto Manual' : 'Agregar Contacto'
          }
        </IonButton>
        
        {/* Se elimina el botón secundario para mantener una sola acción 'Agregar Contacto' */}
      </div>

      {/* Modal de todos los contactos con buscador mejorado */}
      <IonModal isOpen={isModalOpen} onDidDismiss={() => setIsModalOpen(false)}>
        <IonHeader>
          <IonToolbar style={{ '--background': 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)', '--color': 'white' }}>
            <IonTitle style={{ fontWeight: '600' }}>
              <IonIcon icon={peopleOutline} style={{ marginRight: '8px', fontSize: '1.2rem' }} />
              Selecciona un contacto
            </IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent style={{ '--background': '#fff7fb' }}>
          <div style={{ padding: '16px 16px 8px 16px' }}>
            <IonSearchbar
              placeholder="Buscar por nombre..."
              debounce={300}
              onIonInput={handleSearch}
              style={{ 
                '--background': '#ffffff',
                '--border-radius': '12px',
                '--box-shadow': '0 8px 18px rgba(236, 72, 153, 0.12)'
              }}
            />
          </div>
          
          {filteredContacts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: '#64748b' }}>
              <IonIcon icon={peopleOutline} style={{ fontSize: '3rem', marginBottom: '16px', opacity: 0.5 }} />
              <h3 style={{ margin: '0 0 8px 0', fontWeight: '600' }}>No se encontraron contactos</h3>
              <p style={{ margin: 0 }}>Intenta con otro término de búsqueda</p>
            </div>
          ) : (
            <div style={{ padding: '0 16px 16px 16px' }}>
              {filteredContacts.map((c, index) => (
                <div key={index} style={{
                  background: 'white',
                  borderRadius: '12px',
                  marginBottom: '8px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                  overflow: 'hidden'
                }}>
                  <IonItem button onClick={() => addEmergencyContact(c)} style={{
                    '--padding-start': '16px',
                    '--padding-end': '16px',
                    '--background': 'transparent'
                  }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #f472b6 0%, #db2777 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontWeight: '700',
                      fontSize: '1rem',
                      marginRight: '12px'
                    }}>
                      {getInitials(getContactName(c))}
                    </div>
                    <IonLabel>
                      <h2 style={{ margin: '0 0 4px 0', fontWeight: '600', color: '#2d3748' }}>
                        {getContactName(c)}
                      </h2>
                      <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>
                        <IonIcon icon={callOutline} style={{ fontSize: '14px', marginRight: '4px' }} />
                        {c.phones?.[0]?.number ?? "Sin teléfono"}
                      </p>
                    </IonLabel>
                  </IonItem>
                </div>
              ))}
            </div>
          )}
        </IonContent>
      </IonModal>

      {/* Modal de edición mejorado */}
      <IonModal isOpen={isEditModalOpen} onDidDismiss={() => setIsEditModalOpen(false)}>
        <IonHeader>
          <IonToolbar style={{ '--background': 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)', '--color': 'white' }}>
            <IonTitle style={{ fontWeight: '600' }}>
              <IonIcon icon={create} style={{ marginRight: '8px', fontSize: '1.2rem' }} />
              Editar nombre
            </IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent style={{ '--background': '#fff7fb' }}>
          <div style={{ padding: '24px' }}>
            <div style={{
              background: 'white',
              borderRadius: '16px',
              padding: '24px',
              boxShadow: '0 10px 24px rgba(236, 72, 153, 0.14)',
              marginBottom: '20px'
            }}>
              <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <div style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #f472b6 0%, #db2777 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontWeight: '700',
                  fontSize: '1.5rem',
                  margin: '0 auto 12px auto',
                  boxShadow: '0 8px 16px rgba(219, 39, 119, 0.3)'
                }}>
                  {editContactIndex !== null && getInitials(emergencyContacts[editContactIndex]?.name)}
                </div>
                <p style={{ color: '#64748b', margin: 0 }}>
                  Personaliza como quieres que aparezca este contacto
                </p>
              </div>
              
              <IonInput
                label="Nombre personalizado"
                labelPlacement="stacked"
                value={editName}
                onIonInput={(e) => setEditName(e.detail.value!)}
                style={{
                  '--background': '#f8fafc',
                  '--border-radius': '12px',
                  '--padding-start': '16px',
                  '--padding-end': '16px'
                }}
              />
            </div>
            
            <IonButton 
              expand="block" 
              onClick={saveEdit} 
              style={{ 
                '--background': 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)',
                '--border-radius': '12px',
                height: '48px',
                fontWeight: '600',
                marginBottom: '12px'
              }}
            >
              <IonIcon icon={create} slot="start" />
              Guardar cambios
            </IonButton>
            
            <IonButton 
              expand="block" 
              fill="outline" 
              onClick={() => {
                setIsEditModalOpen(false);
                setEditContactIndex(null);
                closeAllSliding();
              }}
              style={{ 
                '--border-radius': '12px',
                '--color': '#64748b',
                '--border-color': '#e2e8f0',
                height: '48px'
              }}
            >
              Cancelar
            </IonButton>
          </div>
        </IonContent>
      </IonModal>

      {/* Alerta de confirmación de eliminación */}
      {/* Modal para agregar contacto manual (web) */}
      <IonModal isOpen={isManualContactModalOpen} onDidDismiss={() => {
        setIsManualContactModalOpen(false);
        setManualContactName('');
        setManualContactPhone('');
      }}>
        <IonHeader>
          <IonToolbar style={{ '--background': 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)', '--color': 'white' }}>
            <IonTitle style={{ fontWeight: '600' }}>
              <IonIcon icon={personAdd} style={{ marginRight: '8px', fontSize: '1.2rem' }} />
              Agregar Contacto Manual
            </IonTitle>
            <IonButton
              slot="end"
              fill="clear"
              onClick={() => {
                setIsManualContactModalOpen(false);
                setManualContactName('');
                setManualContactPhone('');
              }}
            >
              <IonIcon icon={close} style={{ color: 'white' }} />
            </IonButton>
          </IonToolbar>
        </IonHeader>
        <IonContent style={{ '--background': '#fff7fb' }}>
          <div style={{ padding: '20px' }}>
            <p style={{ color: '#64748b', marginBottom: '20px', textAlign: 'center' }}>
              Agrega un contacto escribiendo su nombre y teléfono manualmente
            </p>
            
            <IonInput
              label="Nombre del contacto"
              labelPlacement="stacked"
              value={manualContactName}
              onIonInput={(e) => setManualContactName(e.detail.value!)}
              placeholder="Ej: María García"
              style={{
                '--background': 'white',
                '--border-radius': '12px',
                '--padding-start': '16px',
                '--padding-end': '16px',
                '--padding-top': '12px',
                '--padding-bottom': '12px',
                marginBottom: '16px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                border: '1px solid #e2e8f0'
              }}
            />
            
            <div style={{ marginBottom: '24px' }}>
              <div style={{ marginBottom: '8px', fontWeight: '600', fontSize: '0.9rem', color: '#64748b' }}>
                Número de teléfono
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <div style={{
                  background: '#f1f5f9',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  padding: '12px 16px',
                  fontWeight: '600',
                  color: '#64748b',
                  minWidth: '60px',
                  textAlign: 'center',
                  fontSize: '1rem'
                }}>
                  +57
                </div>
                <IonInput
                  value={manualContactPhone}
                  onIonInput={(e) => setManualContactPhone(e.detail.value!)}
                  placeholder="300 123 4567"
                  type="tel"
                  style={{
                    '--background': 'white',
                    '--border-radius': '8px',
                    '--padding-start': '16px',
                    '--padding-end': '16px',
                    '--padding-top': '12px',
                    '--padding-bottom': '12px',
                    boxShadow: '0 8px 18px rgba(236, 72, 153, 0.1)',
                    border: '1px solid #e2e8f0',
                    flex: '1'
                  }}
                />
              </div>
            </div>
            
            <IonButton
              expand="block"
              onClick={addManualContact}
              disabled={!manualContactName.trim() || !manualContactPhone.trim()}
              style={{
                '--background': 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)',
                '--border-radius': '15px',
                height: '55px',
                fontWeight: '700',
                fontSize: '1.1rem',
                marginBottom: '12px'
              }}
            >
              <IonIcon icon={checkmark} slot="start" style={{ fontSize: '1.2rem' }} />
              Agregar Contacto
            </IonButton>
            
            <IonButton
              expand="block"
              fill="outline"
              onClick={() => {
                setIsManualContactModalOpen(false);
                setManualContactName('');
                setManualContactPhone('');
              }}
              style={{
                '--border-color': '#f9a8d4',
                '--color': '#9d174d',
                '--border-radius': '15px',
                height: '45px',
                fontWeight: '600'
              }}
            >
              Cancelar
            </IonButton>
          </div>
        </IonContent>
      </IonModal>

      <IonAlert
        isOpen={isDeleteAlertOpen}
        onDidDismiss={() => setIsDeleteAlertOpen(false)}
        header="Confirmar eliminación"
        message="¿Estás seguro de que quieres eliminar este contacto de emergencia?"
        buttons={[
          {
            text: 'Cancelar',
            role: 'cancel'
          },
          {
            text: 'Eliminar',
            role: 'destructive',
            handler: deleteContact
          }
        ]}
      />

      {/* Toast */}
      <IonToast
        isOpen={!!toastMessage}
        message={toastMessage}
        duration={3000}
        color={toastColor}
        onDidDismiss={() => setToastMessage("")}
      />
      </IonPage>
    </>
  );
};

export default ContactsPage;