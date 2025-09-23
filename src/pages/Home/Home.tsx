import React from 'react';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonIcon, IonCol, IonRow, IonGrid } from '@ionic/react';
import { warningOutline } from 'ionicons/icons';


const Home: React.FC = () => (
    <IonPage>
        <IonHeader>
            <IonToolbar>
                <IonTitle>Inicio</IonTitle>
            </IonToolbar>
        </IonHeader>
        <IonContent class='ion-padding'>
            <IonGrid>
                <IonRow>
                    <IonCol>
                        <IonButton color="danger" className='btn'
                            onClick={(e) => {
                                e.preventDefault();
                            }}
                            >
                            <IonIcon icon={warningOutline}></IonIcon>
                            EMERGENCIA
                        </IonButton>
                    </IonCol>
                </IonRow>
            </IonGrid>
        </IonContent>
    </IonPage>
);

export default Home;