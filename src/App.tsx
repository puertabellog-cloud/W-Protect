import React, { useEffect, useState } from 'react';
import { Route, Redirect } from 'react-router-dom';
import {
  IonApp,
  IonIcon,
  IonLabel,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonTabs,
  IonToast,
  setupIonicReact
} from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { home, peopleOutline, personOutline, libraryOutline, shieldCheckmarkOutline, alertCircleOutline } from 'ionicons/icons';

import Contacts from './pages/Contacts/Contacts';
import Profile from './pages/Profile/Profile';
import PerfilUsuaria from './pages/Profile/PerfilUsuaria';
import { Resources } from './pages/Resources';
import MapWidget from './components/MapWidget';
import { AuthWrapper } from './components/AuthWrapper';
import AdminLibrary from './pages/AdminLibrary/AdminLibrary';
import AdminAlerts from './pages/AdminLibrary/AdminAlerts';
import AdminUsers from './pages/AdminLibrary/AdminUsers';
import { debugError, debugLog } from './utils/debug';

/* Los estilos de Ionic ya están importados en main.tsx */

/* Context */
import { DeviceProvider } from './context/DeviceContext';

/* Sesión */
import { isAdmin, SESSION_CHANGED_EVENT } from './services/sessionService';

setupIonicReact();

const App: React.FC = () => {
  const [forbiddenToast, setForbiddenToast] = useState(false);
  const [adminMode, setAdminMode] = useState(isAdmin());

  useEffect(() => {
    debugLog('App', 'render/update', {
      adminMode,
      path: window.location.pathname,
      session: localStorage.getItem('w-protect-session'),
    });
  }, [adminMode]);

  useEffect(() => {
    const handler = () => setForbiddenToast(true);
    window.addEventListener('w-protect-forbidden', handler);
    debugLog('App', 'listening w-protect-forbidden');
    return () => window.removeEventListener('w-protect-forbidden', handler);
  }, []);

  useEffect(() => {
    const onPopState = () => {
      debugLog('App', 'route changed', { path: window.location.pathname });
    };

    window.addEventListener('popstate', onPopState);
    onPopState();

    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  useEffect(() => {
    const updateAdminMode = () => {
      try {
        const next = isAdmin();
        debugLog('App', 'session change detected', {
          nextAdminMode: next,
          path: window.location.pathname,
          session: localStorage.getItem('w-protect-session'),
        });
        setAdminMode(next);
      } catch (error) {
        debugError('App', 'error evaluating isAdmin()', error);
      }
    };

    window.addEventListener(SESSION_CHANGED_EVENT, updateAdminMode);
    window.addEventListener('storage', updateAdminMode);

    return () => {
      window.removeEventListener(SESSION_CHANGED_EVENT, updateAdminMode);
      window.removeEventListener('storage', updateAdminMode);
    };
  }, []);

  return (
    <IonApp>
      <DeviceProvider>
        <IonReactRouter key={adminMode ? 'admin-router' : 'user-router'}>
          {adminMode ? (
            <IonTabs>
              <IonRouterOutlet>
                <Route exact path="/library" component={AdminLibrary} />
                <Route exact path="/admin-alertas" component={AdminAlerts} />
                <Route exact path="/admin-usuarios" component={AdminUsers} />
                <Route exact path="/" render={() => <Redirect to="/library" />} />
                <Route render={() => <Redirect to="/library" />} />
              </IonRouterOutlet>
              <IonTabBar slot="bottom">
                <IonTabButton tab="library" href="/library">
                  <IonIcon icon={shieldCheckmarkOutline} />
                  <IonLabel>Biblioteca</IonLabel>
                </IonTabButton>
                <IonTabButton tab="admin-alertas" href="/admin-alertas">
                  <IonIcon icon={alertCircleOutline} />
                  <IonLabel>Alertas</IonLabel>
                </IonTabButton>
                <IonTabButton tab="admin-usuarios" href="/admin-usuarios">
                  <IonIcon icon={peopleOutline} />
                  <IonLabel>Usuarios</IonLabel>
                </IonTabButton>
              </IonTabBar>
            </IonTabs>
          ) : (
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
                <Route exact path="/library">
                  <Redirect to="/recursos" />
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
          )}
        </IonReactRouter>
      </DeviceProvider>

      {/* Toast global para respuestas 403 */}
      <IonToast
        isOpen={forbiddenToast}
        message="No tienes permisos para esta acción"
        duration={3000}
        color="danger"
        onDidDismiss={() => setForbiddenToast(false)}
      />
    </IonApp>
  );
};

export default App;
