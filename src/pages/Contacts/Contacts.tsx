import React, { useState, useEffect } from 'react';
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent,
  IonCard, IonCardHeader, IonCardTitle, IonCardContent,
  IonButton, IonIcon, IonList, IonItem, IonLabel,
  IonToast, IonModal, IonSearchbar, IonItemSliding,
  IonItemOption, IonItemOptions, IonInput, IonFooter
} from '@ionic/react';
import { add, personCircle, trash, create } from 'ionicons/icons';
import { Contacts } from '@capacitor-community/contacts';
import { AppHeader } from '../../components/AppHeader';

// Configuración simplificada para mejor compatibilidad
const projection = {
  name: true,
  phones: true
};

interface EmergencyContact {
  name: string;
  phone: string;
  alias?: string;
}

const ContactsPage: React.FC = () => {
  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>([]);
  const [allContacts, setAllContacts] = useState<any[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string>("");
  const [editContactIndex, setEditContactIndex] = useState<number | null>(null);
  const [editName, setEditName] = useState<string>("");

  // Cargar contactos de emergencia desde localStorage al inicio
  useEffect(() => {
    const savedContacts = localStorage.getItem('emergencyContacts');
    if (savedContacts) {
      setEmergencyContacts(JSON.parse(savedContacts));
    }
  }, []);

  // Guardar contactos en localStorage cada vez que cambien
  useEffect(() => {
    localStorage.setItem('emergencyContacts', JSON.stringify(emergencyContacts));
  }, [emergencyContacts]);

  // === Obtener todos los contactos ===
  const openContacts = async () => {
    try {
      const permission = await Contacts.requestPermissions();

      if (permission.contacts === 'granted') {
        const result = await Contacts.getContacts({ projection });

        console.log('=== DEBUG: Contacts result ===');
        console.log('Total contacts:', result.contacts.length);
        
        // Solo mostrar el primer contacto para debug
        if (result.contacts.length > 0) {
          console.log('Primer contacto para análisis:');
          getContactName(result.contacts[0]);
        }

        if (!result.contacts.length) {
          setToastMessage("No se encontraron contactos en el dispositivo");
          return;
        }

        // Filtrar contactos que tienen al menos un número de teléfono
        const contactsWithPhones = result.contacts.filter(contact => 
          contact.phones && contact.phones.length > 0
        );

        console.log('Contacts with phones:', contactsWithPhones.length);

        setAllContacts(contactsWithPhones);
        setFilteredContacts(contactsWithPhones);
        setIsModalOpen(true);
      } else {
        setToastMessage("Permiso denegado para acceder a contactos");
      }
    } catch (error) {
      console.error('Error accessing contacts:', error);
      setToastMessage("Error al acceder a contactos");
    }
  };

  // === Obtener nombre de contacto (CORREGIDO) ===
  const getContactName = (contact: any) => {
    console.log('=== DEBUG CONTACTO ===');
    console.log('Contact completo:', JSON.stringify(contact, null, 2));
    
    // ¡AQUÍ ESTABA EL ERROR! 
    // El name NO es un array, es un objeto directo
    if (contact.name && typeof contact.name === 'object' && !Array.isArray(contact.name)) {
      const nameData = contact.name;
      console.log('Name object data:', nameData);
      
      // Método 1: display name (el más común)
      if (nameData.display && nameData.display.trim()) {
        console.log('✅ Nombre encontrado en name.display:', nameData.display);
        return nameData.display;
      }
      
      // Método 2: given name (nombre de pila)
      if (nameData.given && nameData.given.trim()) {
        console.log('✅ Nombre encontrado en name.given:', nameData.given);
        return nameData.given;
      }
      
      // Método 3: combinar given + family
      const firstName = nameData.given || '';
      const lastName = nameData.family || '';
      
      if (firstName.trim() || lastName.trim()) {
        const fullName = `${firstName} ${lastName}`.trim();
        console.log('✅ Nombre combinado given+family:', fullName);
        return fullName;
      }
    }
    
    // Método 4: displayName directo (por si acaso)
    if (contact.displayName && contact.displayName.trim()) {
      console.log('✅ Nombre encontrado en displayName:', contact.displayName);
      return contact.displayName;
    }
    
    // Método 5: Como último recurso, usar el número
    if (contact.phones && contact.phones.length > 0) {
      const phoneNumber = contact.phones[0].number;
      console.log('❌ Usando teléfono como nombre:', phoneNumber);
      return phoneNumber;
    }
    
    console.log('❌ No se pudo extraer nombre, usando fallback');
    return "Sin nombre";
  };

  // === Agregar contacto a la lista de emergencia ===
  const addEmergencyContact = (contact: any) => {
    if (emergencyContacts.length >= 5) {
      setToastMessage("Ya tienes el máximo de 5 contactos");
      return;
    }

    const phone = contact.phones?.[0]?.number;
    if (!phone) {
      setToastMessage("Este contacto no tiene número válido");
      return;
    }

    const alreadyAdded = emergencyContacts.some((c) => c.phone === phone);
    if (alreadyAdded) {
      setToastMessage("Ese contacto ya fue agregado");
      return;
    }

    const newContact: EmergencyContact = {
      name: getContactName(contact),
      phone,
    };

    setEmergencyContacts([...emergencyContacts, newContact]);
    setToastMessage(`Se agregó: ${getContactName(contact)}`);
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
  const deleteContact = (index: number) => {
    const updated = [...emergencyContacts];
    updated.splice(index, 1);
    setEmergencyContacts(updated);
    setToastMessage("Contacto eliminado");
  };

  // === Editar alias ===
  const openEditModal = (index: number) => {
    setEditContactIndex(index);
    setEditName(emergencyContacts[index].alias || emergencyContacts[index].name);
    setIsEditModalOpen(true);
  };

  const saveEdit = () => {
    if (editContactIndex === null) return;

    const updated = [...emergencyContacts];
    updated[editContactIndex] = {
      ...updated[editContactIndex],
      alias: editName,
    };

    setEmergencyContacts(updated);
    setToastMessage("Nombre editado");
    setIsEditModalOpen(false);
  };

  return (
    <IonPage>
      <AppHeader 
        title="Contactos de Emergencia"
        showLogo={true}
      />

      <IonContent fullscreen>
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
            Cuando actives una alerta, tus contactos recibirán tu ubicación en WhatsApp.
          </IonCardContent>
        </IonCard>

        {/* Lista de contactos agregados */}
        <IonList>
          {emergencyContacts.map((c, index) => (
            <IonItemSliding key={index}>
              <IonItem>
                <IonIcon icon={personCircle} slot="start" />
                <IonLabel>
                  <h2>{c.alias || c.name}</h2>
                  <p>{c.phone}</p>
                </IonLabel>
              </IonItem>
              <IonItemOptions side="end">
                <IonItemOption color="warning" onClick={() => openEditModal(index)}>
                  <IonIcon icon={create} />
                </IonItemOption>
                <IonItemOption color="danger" onClick={() => deleteContact(index)}>
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
          disabled={emergencyContacts.length >= 5}
          style={{ margin: 16 }}
        >
          <IonIcon icon={add} slot="start" />
          Agregar Contacto
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
          <IonButton expand="block" color="primary" onClick={saveEdit} style={{ marginTop: 16 }}>
            Guardar
          </IonButton>
          <IonButton expand="block" fill="outline" color="medium" onClick={() => setIsEditModalOpen(false)}>
            Cancelar
          </IonButton>
        </IonContent>
      </IonModal>

      {/* Toast */}
      <IonToast
        isOpen={!!toastMessage}
        message={toastMessage}
        duration={2000}
        onDidDismiss={() => setToastMessage("")}
      />
    </IonPage>
  );
};

export default ContactsPage;
