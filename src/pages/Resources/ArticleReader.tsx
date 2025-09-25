import React from 'react';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonIcon,
  IonCard,
  IonCardContent,
  IonBadge
} from '@ionic/react';
import {
  arrowBackOutline,
  timeOutline,
  bookmarkOutline,
  starOutline
} from 'ionicons/icons';
import { obtenerArticuloPorId, categorias } from '../../resources/index.js';

interface ArticleReaderProps {
  articleId: string;
  onBack: () => void;
}

export const ArticleReader: React.FC<ArticleReaderProps> = ({ articleId, onBack }) => {
  const article = obtenerArticuloPorId(articleId);
  
  if (!article) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonButton fill="clear" slot="start" onClick={onBack}>
              <IonIcon icon={arrowBackOutline} />
            </IonButton>
            <IonTitle>Artículo no encontrado</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <div style={{ padding: '40px 20px', textAlign: 'center' }}>
            <h2>❌ Artículo no encontrado</h2>
            <p>Lo sentimos, no pudimos encontrar este artículo.</p>
            <IonButton onClick={onBack}>Volver a recursos</IonButton>
          </div>
        </IonContent>
      </IonPage>
    );
  }

  const categoria = categorias.find(c => c.id === article.categoria);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar style={{ 
          '--background': 'white',
          '--color': '#1f2937'
        }}>
          <IonButton 
            fill="clear" 
            slot="start" 
            onClick={onBack}
            style={{ '--color': '#6b7280' }}
          >
            <IonIcon icon={arrowBackOutline} />
          </IonButton>
          <IonTitle style={{ fontSize: '1rem' }}>
            {article.titulo.length > 25 ? article.titulo.substring(0, 25) + '...' : article.titulo}
          </IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        {/* Header del artículo */}
        <div style={{ 
          background: 'linear-gradient(135deg, #d946ef 0%, #7c2d92 100%)',
          color: 'white',
          padding: '24px 20px'
        }}>
          {article.destacado && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              marginBottom: '12px',
              fontSize: '0.9rem',
              opacity: 0.9
            }}>
              <IonIcon icon={starOutline} />
              Artículo Destacado
            </div>
          )}
          
          <h1 style={{ 
            margin: '0 0 16px 0', 
            fontSize: '1.6rem', 
            fontWeight: 'bold',
            lineHeight: '1.3'
          }}>
            {article.titulo}
          </h1>
          
          <p style={{ 
            margin: '0 0 20px 0', 
            fontSize: '1.1rem', 
            opacity: 0.9,
            lineHeight: '1.4'
          }}>
            {article.descripcion}
          </p>
          
          {/* Metadatos */}
          <div style={{ 
            display: 'flex', 
            gap: '16px', 
            alignItems: 'center',
            flexWrap: 'wrap'
          }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '6px',
              fontSize: '0.9rem',
              opacity: 0.9
            }}>
              <IonIcon icon={timeOutline} />
              {article.duracionLectura} min de lectura
            </div>
            
            {categoria && (
              <IonBadge 
                style={{ 
                  '--background': 'rgba(255,255,255,0.2)',
                  '--color': 'white',
                  fontSize: '0.8rem'
                }}
              >
                {categoria.nombre}
              </IonBadge>
            )}
          </div>
        </div>

        {/* Contenido del artículo */}
        <div style={{ padding: '20px' }}>
          <IonCard style={{ 
            margin: 0, 
            borderRadius: '16px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
          }}>
            <IonCardContent style={{ padding: '24px' }}>
              {/* Renderizar el HTML del contenido */}
              <div 
                dangerouslySetInnerHTML={{ __html: article.contenido }}
                style={{
                  lineHeight: '1.6',
                  fontSize: '1rem'
                }}
              />
            </IonCardContent>
          </IonCard>

          {/* Tags */}
          {article.tags.length > 0 && (
            <div style={{ marginTop: '20px' }}>
              <h4 style={{ 
                margin: '0 0 12px 0', 
                color: '#6b7280', 
                fontSize: '0.9rem' 
              }}>
                Etiquetas relacionadas:
              </h4>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {article.tags.map((tag, index) => (
                  <IonBadge 
                    key={index}
                    color="light"
                    style={{ 
                      '--background': '#f3f4f6',
                      '--color': '#6b7280',
                      fontSize: '0.8rem',
                      padding: '6px 10px'
                    }}
                  >
                    #{tag}
                  </IonBadge>
                ))}
              </div>
            </div>
          )}

          {/* Mensaje de cierre */}
          <IonCard style={{ 
            marginTop: '24px', 
            background: 'linear-gradient(135deg, #10b981 0%, #047857 100%)',
            color: 'white'
          }}>
            <IonCardContent style={{ padding: '20px', textAlign: 'center' }}>
              <h3 style={{ margin: '0 0 8px 0', fontSize: '1.2rem' }}>
                💪 ¡Mantente Segura!
              </h3>
              <p style={{ margin: '0', opacity: 0.9 }}>
                Recuerda aplicar estos consejos en tu día a día para mantenerte protegida.
              </p>
            </IonCardContent>
          </IonCard>
        </div>

        {/* Spacing para navegación */}
        <div style={{ height: '40px' }} />
      </IonContent>
    </IonPage>
  );
};