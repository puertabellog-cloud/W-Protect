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

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/**
 * Ionic Dark Mode
 * -----------------------------------------------------
 * For more info, please see:
 * https://ionicframework.com/docs/theming/dark-mode
 */

/* import '@ionic/react/css/palettes/dark.always.css'; */
/* import '@ionic/react/css/palettes/dark.class.css'; */
import '@ionic/react/css/palettes/dark.system.css';

/* Theme variables */
import './theme/variables.css';

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
