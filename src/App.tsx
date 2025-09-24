import { Route } from 'react-router-dom';
import {
  IonApp,
  IonIcon,
  IonLabel,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonTabs,
  setupIonicReact
} from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { home, peopleOutline, personOutline } from 'ionicons/icons';

import Home from './pages/Home/Home';
import Contacts from './pages/Contacts/Contacts';
import Profile from './pages/Profile/Profile';

/* Los estilos de Ionic ya están importados en main.tsx */

/* Context */
import { DeviceProvider } from './context/DeviceContext';

setupIonicReact();

const App: React.FC = () => (
  <IonApp>
    <DeviceProvider>
    <IonReactRouter>
      <IonTabs>
        <IonRouterOutlet>
          <Route exact path="/home" component={Home} />
          <Route exact path="/contacts" component={Contacts} />
          <Route exact path="/profile" component={Profile} />
          <Route exact path="/">
            <Home />
          </Route>
          <Route exact path="/contacts">
            <Contacts />
          </Route>
          <Route exact path="/profile">
            <Profile />
          </Route>
        </IonRouterOutlet>
        <IonTabBar slot="bottom">
          <IonTabButton tab="home" href="/home">
            <IonIcon aria-hidden="true" icon={home} />
            <IonLabel>Inicio</IonLabel>
          </IonTabButton>
          <IonTabButton tab="contacts" href="/contacts">
            <IonIcon aria-hidden="true" icon={peopleOutline} />
            <IonLabel>Contactos</IonLabel>
          </IonTabButton>
          <IonTabButton tab="profile" href="/profile">
            <IonIcon aria-hidden="true" icon={personOutline} />
            <IonLabel>Mi Perfil</IonLabel>
          </IonTabButton>
        </IonTabBar>
      </IonTabs>
    </IonReactRouter>
    </DeviceProvider>
  </IonApp>
);

export default App;
