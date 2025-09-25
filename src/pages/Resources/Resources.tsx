import React, { useState } from 'react';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonIcon,
  IonButton,
  IonSearchbar,
  IonSegment,
  IonSegmentButton,
  IonLabel,
  IonBadge,
  IonGrid,
  IonRow,
  IonCol
} from '@ionic/react';
import {
  timeOutline,
  eyeOutline,
  bookmarkOutline,
  starOutline,
  arrowBackOutline,
  shieldCheckmarkOutline,
  fitnessOutline,
  libraryOutline,
  heartOutline,
  phonePortraitOutline,
  alertCircleOutline,
  callOutline,
  documentTextOutline,
  peopleOutline,
  homeOutline,
  schoolOutline,
  medicalOutline,
  chatbubbleOutline,
  lockClosedOutline,
  warningOutline
} from 'ionicons/icons';
import { AppHeader } from '../../components/AppHeader';
import { todosLosArticulos, categorias, obtenerArticulosPorCategoria, obtenerArticulosDestacados, buscarArticulos } from '../../resources/index.js';
import { Article } from '../../api/interface.js';

interface ResourcesProps {
  onArticleSelect: (articleId: string) => void;
  onBack?: () => void;
}

export const Resources: React.FC<ResourcesProps> = ({ onArticleSelect, onBack }) => {
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('todos');

  // Mapeo de íconos
  const iconMap: { [key: string]: string } = {
    'shield-checkmark-outline': shieldCheckmarkOutline,
    'fitness-outline': fitnessOutline,
    'library-outline': libraryOutline,
    'heart-outline': heartOutline,
    'phone-portrait-outline': phonePortraitOutline,
    'alert-circle-outline': alertCircleOutline,
    'call-outline': callOutline,
    'document-text-outline': documentTextOutline,
    'people-outline': peopleOutline,
    'home-outline': homeOutline,
    'school-outline': schoolOutline,
    'medical-outline': medicalOutline,
    'chatbubble-outline': chatbubbleOutline,
    'lock-closed-outline': lockClosedOutline,
    'warning-outline': warningOutline
  };
  
  // Filtrar artículos según categoría y búsqueda
  const getFilteredArticles = (): Article[] => {
    let articles: Article[] = [];
    
    if (selectedCategory === 'todos') {
      articles = todosLosArticulos;
    } else if (selectedCategory === 'destacados') {
      articles = obtenerArticulosDestacados();
    } else {
      articles = obtenerArticulosPorCategoria(selectedCategory);
    }
    
    if (searchText.trim()) {
      articles = buscarArticulos(searchText).filter(article => 
        selectedCategory === 'todos' || 
        selectedCategory === 'destacados' && article.destacado ||
        article.categoria === selectedCategory
      );
    }
    
    return articles;
  };

  const filteredArticles = getFilteredArticles();

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar style={{ 
          '--background': 'white',
          '--color': '#1f2937'
        }}>
          {onBack && (
            <IonButton 
              fill="clear" 
              slot="start" 
              onClick={onBack}
              style={{ '--color': '#6b7280' }}
            >
              <IonIcon icon={arrowBackOutline} />
            </IonButton>
          )}
          <IonTitle style={{ fontSize: '1.1rem' }}>
            Recursos de Seguridad
          </IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        {/* Intro Card */}
        <IonCard style={{ margin: '16px', borderRadius: '16px' }}>
          <IonCardContent style={{ 
            background: 'linear-gradient(135deg, #d946ef 0%, #7c2d92 100%)',
            color: 'white',
            padding: '20px',
            textAlign: 'center'
          }}>
            <h2 style={{ margin: '0 0 8px 0', fontSize: '1.4rem' }}>
              📚 Biblioteca de Seguridad
            </h2>
            <p style={{ margin: 0, opacity: 0.9, fontSize: '1rem' }}>
              Artículos esenciales para tu protección y bienestar
            </p>
          </IonCardContent>
        </IonCard>

        {/* Buscador */}
        <div style={{ padding: '0 16px 16px 16px' }}>
          <IonSearchbar
            value={searchText}
            onIonInput={(e) => setSearchText(e.detail.value!)}
            placeholder="Buscar artículos..."
            style={{
              '--background': 'white',
              '--border-radius': '12px',
              '--box-shadow': '0 2px 8px rgba(0,0,0,0.1)'
            }}
          />
        </div>

        {/* Filtros por categoría */}
        <div style={{ padding: '0 16px 16px 16px' }}>
          <IonSegment 
            value={selectedCategory} 
            onIonChange={(e) => setSelectedCategory(e.detail.value as string)}
            style={{ '--background': 'transparent' }}
          >
            <IonSegmentButton value="todos">
              <IonLabel>Todos</IonLabel>
            </IonSegmentButton>
            <IonSegmentButton value="destacados">
              <IonLabel>⭐ Destacados</IonLabel>
            </IonSegmentButton>
            <IonSegmentButton value="seguridad">
              <IonLabel>🛡️ Seguridad</IonLabel>
            </IonSegmentButton>
            <IonSegmentButton value="autodefensa">
              <IonLabel>🥊 Autodefensa</IonLabel>
            </IonSegmentButton>
          </IonSegment>
        </div>

        {/* Estadísticas rápidas */}
        <div style={{ padding: '0 16px 24px 16px' }}>
          <IonGrid>
            <IonRow>
              <IonCol size="4">
                <div style={{ 
                  background: 'white', 
                  padding: '16px', 
                  borderRadius: '12px', 
                  textAlign: 'center',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#d946ef' }}>
                    {filteredArticles.length}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>
                    Artículos
                  </div>
                </div>
              </IonCol>
              <IonCol size="4">
                <div style={{ 
                  background: 'white', 
                  padding: '16px', 
                  borderRadius: '12px', 
                  textAlign: 'center',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#10b981' }}>
                    {Math.round(filteredArticles.reduce((sum, art) => sum + art.duracionLectura, 0) / filteredArticles.length) || 0}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>
                    Min promedio
                  </div>
                </div>
              </IonCol>
              <IonCol size="4">
                <div style={{ 
                  background: 'white', 
                  padding: '16px', 
                  borderRadius: '12px', 
                  textAlign: 'center',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#f59e0b' }}>
                    {obtenerArticulosDestacados().length}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>
                    Destacados
                  </div>
                </div>
              </IonCol>
            </IonRow>
          </IonGrid>
        </div>

        {/* Lista de artículos */}
        <div style={{ padding: '0 16px' }}>
          {filteredArticles.length === 0 ? (
            <IonCard>
              <IonCardContent style={{ textAlign: 'center', padding: '40px 20px' }}>
                <IonIcon 
                  icon={eyeOutline} 
                  style={{ fontSize: '3rem', color: '#9ca3af', marginBottom: '16px' }} 
                />
                <h3 style={{ color: '#6b7280', margin: '0 0 8px 0' }}>
                  No se encontraron artículos
                </h3>
                <p style={{ color: '#9ca3af', margin: 0 }}>
                  Intenta con otros términos de búsqueda
                </p>
              </IonCardContent>
            </IonCard>
          ) : (
            filteredArticles.map((article) => (
              <IonCard 
                key={article.id} 
                button 
                onClick={() => onArticleSelect(article.id)}
                style={{ 
                  marginBottom: '16px', 
                  borderRadius: '16px',
                  border: article.destacado ? '2px solid #fbbf24' : '1px solid #e5e7eb',
                  position: 'relative'
                }}
              >
                {article.destacado && (
                  <div style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    background: '#fbbf24',
                    color: 'white',
                    padding: '4px 8px',
                    borderRadius: '12px',
                    fontSize: '0.7rem',
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    <IonIcon icon={starOutline} style={{ fontSize: '0.8rem' }} />
                    Destacado
                  </div>
                )}
                
                <IonCardContent style={{ padding: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                    {/* Icono del artículo */}
                    <div style={{
                      background: `${categorias.find(c => c.id === article.categoria)?.color || '#d946ef'}20`,
                      padding: '12px',
                      borderRadius: '12px',
                      minWidth: '48px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <IonIcon 
                        icon={iconMap[article.icono] || documentTextOutline} 
                        style={{ 
                          fontSize: '1.5rem', 
                          color: categorias.find(c => c.id === article.categoria)?.color || '#d946ef'
                        }} 
                      />
                    </div>
                    
                    {/* Contenido */}
                    <div style={{ flex: 1 }}>
                      <h3 style={{ 
                        margin: '0 0 8px 0', 
                        fontSize: '1.1rem', 
                        fontWeight: '600',
                        color: '#1f2937'
                      }}>
                        {article.titulo}
                      </h3>
                      
                      <p style={{ 
                        margin: '0 0 12px 0', 
                        color: '#6b7280', 
                        fontSize: '0.9rem',
                        lineHeight: '1.4'
                      }}>
                        {article.descripcion}
                      </p>
                      
                      {/* Metadatos */}
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '16px',
                        flexWrap: 'wrap'
                      }}>
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '4px',
                          color: '#9ca3af',
                          fontSize: '0.8rem'
                        }}>
                          <IonIcon icon={timeOutline} />
                          {article.duracionLectura} min
                        </div>
                        
                        <IonBadge 
                          color="light" 
                          style={{ 
                            '--background': `${categorias.find(c => c.id === article.categoria)?.color || '#d946ef'}20`,
                            '--color': categorias.find(c => c.id === article.categoria)?.color || '#d946ef',
                            fontSize: '0.7rem'
                          }}
                        >
                          {categorias.find(c => c.id === article.categoria)?.nombre || article.categoria}
                        </IonBadge>
                      </div>
                    </div>
                  </div>
                </IonCardContent>
              </IonCard>
            ))
          )}
        </div>

        {/* Spacing para el bottom navigation */}
        <div style={{ height: '100px' }} />
      </IonContent>
    </IonPage>
  );
};