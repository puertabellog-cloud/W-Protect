import React, { useState, useEffect } from 'react';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonCard,
  IonCardContent,
  IonIcon,
  IonButton,
  IonSearchbar,
  IonLoading,
  IonToast,
  IonItem,
  IonLabel,
  IonNote,
  IonList,
  IonText,
} from '@ionic/react';
import {
  arrowBackOutline,
  linkOutline,
  openOutline,
  libraryOutline,
} from 'ionicons/icons';
import { AppHeader } from '../../components/AppHeader';
import { getAllLibraryItems } from '../../services/libraryService';
import { WLibrary } from '../../types';

interface ResourcesProps {
  onArticleSelect?: (articleId: string) => void;
  onBack?: () => void;
}

export const Resources: React.FC<ResourcesProps> = ({ onArticleSelect, onBack }) => {
  const [searchText, setSearchText] = useState('');
  const [items, setItems] = useState<WLibrary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showError, setShowError] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true);
        const data = await getAllLibraryItems();
        setItems(data);
      } catch {
        setError('Error al cargar los recursos. Intenta nuevamente.');
        setShowError(true);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const filtered = items.filter(
    item =>
      item.name.toLowerCase().includes(searchText.toLowerCase()) ||
      item.description.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar style={{ '--background': 'white', '--color': '#1f2937' }}>
          {onBack && (
            <IonButton fill="clear" slot="start" onClick={onBack} style={{ '--color': '#6b7280' }}>
              <IonIcon icon={arrowBackOutline} />
            </IonButton>
          )}
          <IonTitle style={{ fontSize: '1.1rem' }}>Recursos de Seguridad</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        <IonLoading isOpen={isLoading} message="Cargando recursos..." />
        <IonToast
          isOpen={showError}
          onDidDismiss={() => setShowError(false)}
          message={error || 'Error desconocido'}
          duration={3000}
          color="danger"
        />

        {!isLoading && (
          <>
            {/* Banner */}
            <IonCard style={{ margin: '16px', borderRadius: '16px' }}>
              <IonCardContent
                style={{
                  background: 'linear-gradient(135deg, #d946ef 0%, #7c2d92 100%)',
                  color: 'white',
                  padding: '20px',
                  textAlign: 'center',
                }}
              >
                <h2 style={{ margin: '0 0 8px 0', fontSize: '1.4rem' }}>
                  📚 Biblioteca de Seguridad
                </h2>
                <p style={{ margin: 0, opacity: 0.9, fontSize: '1rem' }}>
                  Recursos esenciales para tu protección y bienestar
                </p>
              </IonCardContent>
            </IonCard>

            {/* Buscador */}
            <div style={{ padding: '0 16px 16px 16px' }}>
              <IonSearchbar
                value={searchText}
                onIonInput={e => setSearchText(e.detail.value!)}
                placeholder="Buscar recursos..."
                style={{
                  '--background': 'white',
                  '--border-radius': '12px',
                  '--box-shadow': '0 2px 8px rgba(0,0,0,0.1)',
                }}
              />
            </div>

            {/* Lista */}
            <div style={{ padding: '0 16px' }}>
              {filtered.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
                  <IonIcon
                    icon={libraryOutline}
                    style={{ fontSize: '3rem', color: '#9ca3af', marginBottom: '1rem' }}
                  />
                  <IonText color="medium">
                    <p>{searchText ? 'No se encontraron resultados.' : 'Todavía no hay recursos disponibles.'}</p>
                  </IonText>
                </div>
              ) : (
                <IonList style={{ borderRadius: '16px', overflow: 'hidden' }}>
                  {filtered.map(item => (
                    <IonItem
                      key={item.id}
                      detail={false}
                      style={{ '--padding-start': '16px', '--inner-padding-end': '16px' }}
                    >
                      <IonIcon icon={linkOutline} slot="start" color="primary" style={{ fontSize: '1.4rem' }} />
                      <IonLabel>
                        <h2 style={{ fontWeight: '600', color: '#1f2937' }}>{item.name}</h2>
                        <p style={{ color: '#6b7280', whiteSpace: 'normal' }}>{item.description}</p>
                        <IonNote style={{ fontSize: '0.75rem' }}>{item.url}</IonNote>
                      </IonLabel>
                      <IonButton
                        fill="clear"
                        slot="end"
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Abrir enlace"
                      >
                        <IonIcon icon={openOutline} />
                      </IonButton>
                    </IonItem>
                  ))}
                </IonList>
              )}
            </div>

            <div style={{ height: '100px' }} />
          </>
        )}
      </IonContent>
    </IonPage>
  );
};