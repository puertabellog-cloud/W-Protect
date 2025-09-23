import React from 'react';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonButton, IonIcon } from '@ionic/react';
import { add } from 'ionicons/icons';
import { Contacts } from '@capacitor-community/contacts';

const projection = {
    // Specify which fields should be retrieved.
    name: true,
    phones: true,
    postalAddresses: true,
  }

const openContacts = async () => {
    try {
        // Solicita permiso
        const permission = await Contacts.requestPermissions();
        if (permission.contacts === 'granted') {
        // Obtiene los contactos
        const result = await Contacts.getContacts({
            projection,
        });
        // Aquí puedes manejar los contactos, por ejemplo mostrar un modal para seleccionar uno
        console.log(result.contacts);
        alert('Contactos obtenidos. Revisa la consola.');
        } else {
        alert('Permiso denegado para acceder a los contactos.');
        }
    } catch (error) {
        alert('Error al acceder a los contactos');
        console.error(error);
    }
};

const ContactsPage: React.FC = () => (
    <IonPage>
        <IonHeader>
            <IonToolbar>
                <IonTitle>Contactos de Emergencia</IonTitle>
            </IonToolbar>
        </IonHeader>
        <IonContent fullscreen>
            <IonCard color="primary" style={{ margin: 16, borderRadius: 16 }}>
                <IonCardHeader>
                    <IonCardTitle style={{ color: 'white', fontSize: '1.3em', textAlign: 'center' }}>
                        ¿Qué son los contactos de emergencia?
                    </IonCardTitle>
                </IonCardHeader>
                <IonCardContent style={{ color: 'white', fontSize: '1em', textAlign: 'center' }}>
                    Aquí podrás agregar a las personas que serán notificadas si alguna vez te encuentras en peligro.
                    <br /><br />
                    Cuando actives una alerta, tus contactos de emergencia recibirán un aviso inmediato con tu ubicación y un mensaje de ayuda.
                </IonCardContent>
            </IonCard>
        </IonContent>
        <IonButton color="success" className='btn' onClick={openContacts}>
            <IonIcon icon={add}></IonIcon>
            Agregar Contacto
        </IonButton>
    </IonPage>
);

export default ContactsPage;