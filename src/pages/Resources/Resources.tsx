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
  shieldOutline,
} from 'ionicons/icons';
import { useHistory, useLocation } from 'react-router-dom';
import { getAllLibraryItems } from '../../services/libraryService';
import { WLibrary } from '../../types';

const PINK = '#D4537E';
const PINK_DARK = '#72243E';
const PINK_MID = '#993556';
const PINK_LIGHT = '#F4C0D1';
const PINK_LIGHTER = '#FBEAF0';

interface ResourcesProps {
  onArticleSelect?: (articleId: string) => void;
  onBack?: () => void;
}

export const Resources: React.FC<ResourcesProps> = ({ onArticleSelect, onBack }) => {
  const history = useHistory();
  const location = useLocation<{ fromHome?: boolean }>();
  const fromHome = (location.state as { fromHome?: boolean } | undefined)?.fromHome === true;
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
        <IonToolbar style={{ '--background': '#ffffff', '--color': PINK_DARK }}>
          {(onBack || fromHome) && (
            <IonButton fill="clear" slot="start" onClick={onBack ? onBack : () => history.go(-1)} style={{ '--color': PINK_MID }}>
              <IonIcon icon={arrowBackOutline} />
            </IonButton>
          )}
          <IonTitle style={{ fontSize: '1.05rem', fontWeight: 600 }}>Biblioteca</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent style={{ '--background': '#fff9fb' }}>
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
            <div
              style={{
                margin: '14px 14px 0',
                borderRadius: '22px',
                background: `linear-gradient(160deg, ${PINK_LIGHTER} 0%, ${PINK_LIGHT} 58%, #ED93B1 100%)`,
                padding: '22px 18px 18px',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  width: '110px',
                  height: '110px',
                  borderRadius: '50%',
                  right: '-24px',
                  top: '-28px',
                  background: 'rgba(255,255,255,0.18)',
                }}
              />

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                <IonIcon icon={shieldOutline} style={{ color: PINK_MID, fontSize: '1rem' }} />
                <span style={{ color: PINK_MID, fontWeight: 600, fontSize: '0.8rem', letterSpacing: '0.5px' }}>
                  W-PROTECT RECURSOS
                </span>
              </div>

              <h2 style={{ margin: '0 0 6px', color: PINK_DARK, fontSize: '1.35rem', fontWeight: 600 }}>
                Biblioteca de Seguridad
              </h2>
              <p style={{ margin: 0, color: PINK_MID, fontSize: '0.92rem' }}>
                Guías, enlaces y herramientas para tu protección diaria.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', margin: '12px 14px 0' }}>
              <IonCard style={{ margin: 0, borderRadius: '14px', boxShadow: '0 8px 22px rgba(114,36,62,0.08)' }}>
                <IonCardContent style={{ padding: '12px 14px', textAlign: 'center' }}>
                  <div style={{ color: PINK_DARK, fontSize: '1.2rem', fontWeight: 700 }}>{items.length}</div>
                  <div style={{ color: PINK_MID, fontSize: '0.76rem' }}>Total recursos</div>
                </IonCardContent>
              </IonCard>
              <IonCard style={{ margin: 0, borderRadius: '14px', boxShadow: '0 8px 22px rgba(114,36,62,0.08)' }}>
                <IonCardContent style={{ padding: '12px 14px', textAlign: 'center' }}>
                  <div style={{ color: PINK_DARK, fontSize: '1.2rem', fontWeight: 700 }}>{filtered.length}</div>
                  <div style={{ color: PINK_MID, fontSize: '0.76rem' }}>Resultados</div>
                </IonCardContent>
              </IonCard>
            </div>

            {/* Buscador */}
            <div style={{ padding: '12px 14px 14px' }}>
              <IonSearchbar
                value={searchText}
                onIonInput={e => setSearchText(e.detail.value!)}
                placeholder="Buscar recursos..."
                style={{
                  '--background': '#fdf7f9',
                  '--border-radius': '14px',
                  '--box-shadow': '0 8px 18px rgba(114,36,62,0.08)',
                  '--color': PINK_DARK,
                  '--placeholder-color': '#b07a8f',
                }}
              />
            </div>

            {/* Lista */}
            <div style={{ padding: '0 14px' }}>
              {filtered.length === 0 ? (
                <div
                  style={{
                    textAlign: 'center',
                    padding: '2.6rem 1rem',
                    background: '#fff',
                    borderRadius: '18px',
                    boxShadow: '0 10px 26px rgba(114,36,62,0.08)'
                  }}
                >
                  <IonIcon
                    icon={libraryOutline}
                    style={{ fontSize: '3rem', color: '#d08aa4', marginBottom: '0.8rem' }}
                  />
                  <IonText style={{ color: PINK_MID }}>
                    <p>{searchText ? 'No se encontraron resultados.' : 'Todavía no hay recursos disponibles.'}</p>
                  </IonText>
                </div>
              ) : (
                <IonList style={{ borderRadius: '18px', overflow: 'hidden', background: 'transparent' }}>
                  {filtered.map(item => (
                    <IonItem
                      key={item.id}
                      detail={false}
                      style={{
                        '--padding-start': '14px',
                        '--inner-padding-end': '14px',
                        '--background': '#ffffff',
                        borderRadius: '14px',
                        marginBottom: '10px',
                        boxShadow: '0 8px 20px rgba(114,36,62,0.07)'
                      }}
                    >
                      <IonIcon icon={linkOutline} slot="start" style={{ fontSize: '1.2rem', color: PINK }} />
                      <IonLabel>
                        <h2 style={{ fontWeight: 600, color: PINK_DARK }}>{item.name}</h2>
                        <p style={{ color: '#6b7280', whiteSpace: 'normal', marginBottom: '6px' }}>{item.description}</p>
                        <IonNote style={{ fontSize: '0.73rem', color: '#a16b7f' }}>{item.url}</IonNote>
                      </IonLabel>
                      <IonButton
                        fill="solid"
                        slot="end"
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Abrir enlace"
                        style={{
                          '--background': '#fbe4ee',
                          '--color': PINK_DARK,
                          '--border-radius': '10px',
                          width: '40px',
                          height: '40px'
                        }}
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