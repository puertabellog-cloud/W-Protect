import React from 'react';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonButton,
  IonButtons,
  IonIcon
} from '@ionic/react';
import { arrowBackOutline } from 'ionicons/icons';
import MapWidget from '../../components/MapWidget';

interface LocationScreenProps {
  onBack: () => void;
}

const LocationScreen: React.FC<LocationScreenProps> = ({ onBack }) => {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonButton fill="clear" onClick={onBack}>
              <IonIcon icon={arrowBackOutline} />
            </IonButton>
          </IonButtons>
          <IonTitle>Localización</IonTitle>
        </IonToolbar>
      </IonHeader>
      
      <IonContent>
        <MapWidget />
      </IonContent>
    </IonPage>
  );
};

export default LocationScreen;