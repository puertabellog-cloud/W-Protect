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
import { home, peopleOutline, personOutline, libraryOutline } from 'ionicons/icons';

import Contacts from './pages/Contacts/Contacts';
import Profile from './pages/Profile/Profile';
import PerfilUsuaria from './pages/Profile/PerfilUsuaria';
import { Resources } from './pages/Resources';
import MapWidget from './components/MapWidget';
import { AuthWrapper } from './components/AuthWrapper';

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
            <Route exact path="/home">
              <AuthWrapper />
            </Route>
            <Route exact path="/contacts">
              <AuthWrapper>
                <Contacts />
              </AuthWrapper>
            </Route>
            <Route exact path="/recursos">
              <AuthWrapper>
                <Resources onArticleSelect={() => {}} />
              </AuthWrapper>
            </Route>
            <Route exact path="/profile">
              <AuthWrapper>
                <Profile />
              </AuthWrapper>
            </Route>
            <Route exact path="/profile/usuario/:userId">
              <AuthWrapper>
                <PerfilUsuaria />
              </AuthWrapper>
            </Route>
            <Route exact path="/mapa">
              <AuthWrapper>
                <MapWidget />
              </AuthWrapper>
            </Route>
            <Route exact path="/">
              <AuthWrapper />
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
            <IonTabButton tab="recursos" href="/recursos">
              <IonIcon aria-hidden="true" icon={libraryOutline} />
              <IonLabel>Recursos</IonLabel>
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
