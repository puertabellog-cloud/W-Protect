import React, { useState, useEffect } from 'react';
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent,
  IonCard, IonCardHeader, IonCardTitle, IonCardContent,
  IonButton, IonIcon, IonList, IonItem, IonLabel,
  IonToast, IonModal, IonSearchbar, IonItemSliding,
  IonItemOption, IonItemOptions, IonInput, IonFooter,
  IonSpinner, IonRefresher, IonRefresherContent,
  IonAlert
} from '@ionic/react';
import { add, personCircle, trash, create, sync, cloudOffline } from 'ionicons/icons';
import { Contacts } from '@capacitor-community/contacts';
import { AppHeader } from '../../components/AppHeader';
import { backendService } from '../../api/backend';
import { EmergencyContact, ContactFromDevice, ProfileData } from '../../api/interface';
import { useDevice } from "../../context/DeviceContext";

// Configuración simplificada para mejor compatibilidad
const projection = {
  name: true,
  phones: true
};

const ContactsPage: React.FC = () => {
  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>([]);
  const [allContacts, setAllContacts] = useState<ContactFromDevice[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<ContactFromDevice[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
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

  /* ----- CONTEXTO DEL DISPOSITIVO (para obtener deviceId) ----- */
  const { deviceId } = useDevice();  
  /* --------------------------------------------------------------
     1️⃣  CARGAR EL PERFIL CUANDO EL COMPONENTE SE MONTA
     -------------------------------------------------------------- */
  useEffect(() => {
    // Si no tienes todavía un deviceId, no intentes la llamada.
    if (!deviceId) return;

    const fetchCurrentUser = async () => {
      try {
        // Llamada al backend (el método devuelve ProfileData)
        const profile: ProfileData = await backendService.getProfile(deviceId);
        console.log("Perfil obtenido:", profile);
        // Supongamos que el id del usuario está en profile.id (ajusta si tu campo tiene otro nombre)
        if (profile && typeof profile.id === 'number') {
          setCurrentUserId(profile.id);
          setProfileReady(true);

        } else {
          console.warn('El perfil recibido no contiene un id numérico', profile);
        }
      } catch (err) {
        console.error('No se pudo obtener el perfil del usuario', err);
        // Opcional: muestra un toast o alerta para que el usuario sepa que algo falló
      }
    };

    fetchCurrentUser();
  }, [deviceId]);   // Se vuelve a ejecutar sólo si cambia el deviceId


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
    console.warn('⚠️ No hay userId disponible; los contactos no se cargarán.');
    // Opcional: mostrar toast informativo al usuario
    showToast('No se pudo identificar al usuario. Los contactos locales estarán disponibles.', 'warning');
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

    setIsLoading(true);
    try {
      const contacts = await backendService.getEmergencyContacts(currentUserId);
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

  const saveContactToBackend = async (contactData: Omit<EmergencyContact, 'id' | 'userId'>) => {
    console.log("Intentando guardar contacto:", contactData);
    console.log("Estado actual de userId:", currentUserId);
    if (currentUserId === null) {
      console.warn('Intentando guardar contacto antes de conocer el userId');
      return;
    }
    if (!isOnline) {
      // Si no hay conexión, solo guardar localmente
      const newContact: EmergencyContact = {
        id: Date.now(), // ID temporal
        ...contactData,
        userId: currentUserId
      };
      
      const updated = [...emergencyContacts, newContact];
      setEmergencyContacts(updated);
      localStorage.setItem('emergencyContacts', JSON.stringify(updated));
      localStorage.setItem('pendingSync', 'true');
      
      showToast('Contacto guardado localmente. Se sincronizará cuando haya conexión.', 'warning');
      return;
    }

    try {
      console.log("Guardando contacto...");
      
      // Crear el objeto completo para enviar al backend
      const contactToSave: EmergencyContact = {
        ...contactData,
        userId: currentUserId
        // No incluir 'id' para que el backend sepa que es un nuevo contacto
      };
      let ave = JSON.stringify(contactToSave);
      console.log("Datos a enviar:", ave);
      
      const savedContact = await backendService.updateEmergencyContact(contactToSave);
      const updated = [...emergencyContacts, savedContact];
      setEmergencyContacts(updated);
      localStorage.setItem('emergencyContacts', JSON.stringify(updated));
      
      showToast(`Contacto agregado: ${contactData.name}`, 'success');
    } catch (error) {
      console.error('Error guardando contacto:', error);
      showToast('Error al guardar contacto en el servidor: ' + error, 'danger');
    }
  };

  const updateContactInBackend = async (contactId: number, updates: Partial<EmergencyContact>) => {
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

      const updatedContactData: EmergencyContact = {
        ...originalContact,
        ...updates
      };

      console.log("Actualizando contacto:", updatedContactData);

      const updatedContact = await backendService.updateEmergencyContact(updatedContactData);
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
      await backendService.deleteEmergencyContact(contactId);
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

  // === Obtener todos los contactos del dispositivo ===
  const openContacts = async () => {
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

    // Limpiar el número de teléfono
    const cleanPhone = phone.replace(/\s+/g, '');

    const alreadyAdded = emergencyContacts.some((c) => 
      c.phone.replace(/\s+/g, '') === cleanPhone
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
  };

  // === Editar alias ===
  const openEditModal = (index: number) => {
    setEditContactIndex(index);
    setEditName(emergencyContacts[index].alias || emergencyContacts[index].name);
    setIsEditModalOpen(true);
  };

  const saveEdit = async () => {
    if (editContactIndex === null) return;

    const contact = emergencyContacts[editContactIndex];
    if (contact.id) {
      await updateContactInBackend(contact.id, { alias: editName });
    }

    setIsEditModalOpen(false);
    setEditContactIndex(null);
  };

  // === Sincronizar con servidor ===
  const syncWithServer = async () => {
    if (!isOnline) {
      showToast('Sin conexión a internet', 'danger');
      return;
    }

    setIsLoading(true);
    try {
      // Recargar desde el servidor
      await loadEmergencyContacts();
      localStorage.removeItem('pendingSync');
      showToast('Contactos sincronizados con el servidor', 'success');
    } catch (error) {
      console.error('Error sincronizando:', error);
      showToast('Error al sincronizar contactos', 'danger');
    } finally {
      setIsLoading(false);
    }
  };

  const hasPendingSync = localStorage.getItem('pendingSync') === 'true';

  return (
    <IonPage>
      <AppHeader 
        title="Contactos de Emergencia"
        showLogo={true}
      />

      <IonContent fullscreen>
        {/* Indicador de estado de conexión */}
        {!isOnline && (
          <IonCard color="warning" style={{ margin: 16 }}>
            <IonCardContent style={{ textAlign: 'center' }}>
              <IonIcon icon={cloudOffline} /> Sin conexión - Los cambios se guardarán localmente
            </IonCardContent>
          </IonCard>
        )}

        {/* Botón de sincronización */}
        {(hasPendingSync && isOnline) && (
          <IonCard color="primary" style={{ margin: 16 }}>
            <IonCardContent style={{ textAlign: 'center' }}>
              Hay cambios pendientes por sincronizar
              <IonButton 
                fill="clear" 
                size="small" 
                color="light" 
                onClick={syncWithServer}
                disabled={isLoading}
              >
                <IonIcon icon={sync} slot="start" />
                Sincronizar ahora
              </IonButton>
            </IonCardContent>
          </IonCard>
        )}

        {/* Refresher */}
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent></IonRefresherContent>
        </IonRefresher>

        {/* Intro */}
        <IonCard color="primary" style={{ margin: 16, borderRadius: 16 }}>
          <IonCardHeader>
            <IonCardTitle style={{ color: 'white', fontSize: '1.3em', textAlign: 'center' }}>
              ¿Qué son los contactos de emergencia?
            </IonCardTitle>
          </IonCardHeader>
          <IonCardContent style={{ color: 'white', fontSize: '1em', textAlign: 'center' }}>
            Aquí podrás agregar hasta 5 personas que serán notificadas si alguna vez te encuentras en peligro.
            <br /><br />
            Cuando actives una alerta, tus contactos recibirán tu ubicación inmediatamente.
          </IonCardContent>
        </IonCard>

        {/* Loading spinner */}
        {isLoading && (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <IonSpinner name="crescent" />
            <p>Cargando...</p>
          </div>
        )}

        {/* Lista de contactos agregados */}
        <IonList>
          {emergencyContacts.map((c, index) => (
            <IonItemSliding key={c.id || index}>
              <IonItem>
                <IonIcon icon={personCircle} slot="start" />
                <IonLabel>
                  <h2>{c.alias || c.name}</h2>
                  <p>{c.phone}</p>
                  {!isOnline && <p style={{ fontSize: '0.8em', color: 'orange' }}>Offline</p>}
                </IonLabel>
              </IonItem>
              <IonItemOptions side="end">
                <IonItemOption color="warning" onClick={() => openEditModal(index)}>
                  <IonIcon icon={create} />
                </IonItemOption>
                <IonItemOption color="danger" onClick={() => confirmDeleteContact(index)}>
                  <IonIcon icon={trash} />
                </IonItemOption>
              </IonItemOptions>
            </IonItemSliding>
          ))}
        </IonList>
      </IonContent>

      {/* Botón agregar */}
      <IonFooter>
        <IonButton
          color="success"
          expand="block"
          onClick={openContacts}
          disabled={emergencyContacts.length >= 5 || isLoading}
          style={{ margin: 16 }}
        >
          <IonIcon icon={add} slot="start" />
          Agregar Contacto ({emergencyContacts.length}/5)
        </IonButton>
      </IonFooter>

      {/* Modal de todos los contactos con buscador */}
      <IonModal isOpen={isModalOpen} onDidDismiss={() => setIsModalOpen(false)}>
        <IonHeader>
          <IonToolbar>
            <IonTitle>Selecciona un contacto</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <IonSearchbar
            placeholder="Buscar contacto..."
            debounce={300}
            onIonInput={handleSearch}
          />
          <IonList>
            {filteredContacts.map((c, index) => (
              <IonItem button key={index} onClick={() => addEmergencyContact(c)}>
                <IonLabel>
                  <h2>{getContactName(c)}</h2>
                  <p>{c.phones?.[0]?.number ?? "Sin teléfono"}</p>
                </IonLabel>
              </IonItem>
            ))}
          </IonList>
        </IonContent>
      </IonModal>

      {/* Modal de edición */}
      <IonModal isOpen={isEditModalOpen} onDidDismiss={() => setIsEditModalOpen(false)}>
        <IonHeader>
          <IonToolbar>
            <IonTitle>Editar nombre</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding">
          <IonInput
            label="Nombre personalizado"
            value={editName}
            onIonInput={(e) => setEditName(e.detail.value!)}
          />
          <IonButton 
            expand="block" 
            color="primary" 
            onClick={saveEdit} 
            style={{ marginTop: 16 }}
            disabled={isLoading}
          >
            Guardar
          </IonButton>
          <IonButton 
            expand="block" 
            fill="outline" 
            color="medium" 
            onClick={() => setIsEditModalOpen(false)}
          >
            Cancelar
          </IonButton>
        </IonContent>
      </IonModal>

      {/* Alerta de confirmación de eliminación */}
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
  );
};

export default ContactsPage;