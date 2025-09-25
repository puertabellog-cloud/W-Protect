import React, { useState, useEffect } from 'react';
import {
  IonPage,
  IonContent,
  IonSearchbar,
  IonSegment,
  IonSegmentButton,
  IonLabel,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonButton,
  IonIcon,
  IonBadge,
  IonText,
  IonSkeletonText,
  IonRefresher,
  IonRefresherContent,
  IonFab,
  IonFabButton,
  IonChip,
  IonAvatar
} from '@ionic/react';
import {
  addOutline,
  heartOutline,
  heart,
  chatbubbleOutline,
  searchOutline,
  timeOutline,
  bookOutline
} from 'ionicons/icons';
import { AppHeader } from '../../components/AppHeader';
import { useHistory } from 'react-router-dom';
import { forumService, Storia } from '../../services/forumService';
import './Foro.css';

const Foro: React.FC = () => {
  const [stories, setStories] = useState<Storia[]>([]);
  const [filteredStories, setFilteredStories] = useState<Storia[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('todas');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [likedStories, setLikedStories] = useState<Set<string>>(new Set());

  const history = useHistory();
  const categories = forumService.getCategories();

  useEffect(() => {
    loadStories();
  }, [selectedCategory]);

  useEffect(() => {
    handleSearch();
  }, [searchTerm, stories]);

  const loadStories = async () => {
    setLoading(true);
    try {
      const loadedStories = await forumService.getStories(selectedCategory);
      setStories(loadedStories);
    } catch (error) {
      console.error('Error cargando historias:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (searchTerm.trim().length > 0) {
      try {
        const searchResults = await forumService.searchStories(searchTerm);
        setFilteredStories(searchResults);
      } catch (error) {
        console.error('Error en búsqueda:', error);
        setFilteredStories(stories);
      }
    } else {
      setFilteredStories(stories);
    }
  };

  const handleLike = async (storyId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    
    if (likedStories.has(storyId)) return; // Ya le dio like
    
    try {
      await forumService.likeStory(storyId);
      setLikedStories(prev => new Set([...prev, storyId]));
      
      // Actualizar el contador local inmediatamente
      setStories(prev => prev.map(story => 
        story.id === storyId 
          ? { ...story, likes: story.likes + 1 }
          : story
      ));
      setFilteredStories(prev => prev.map(story => 
        story.id === storyId 
          ? { ...story, likes: story.likes + 1 }
          : story
      ));
    } catch (error) {
      console.error('Error dando like:', error);
    }
  };

  const openStory = (storyId: string) => {
    history.push(`/foro/historia/${storyId}`);
  };

  const createNewStory = () => {
    history.push('/foro/nueva-historia');
  };



  const formatDate = (date: Date): string => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return 'Hoy';
    if (days === 1) return 'Ayer';
    if (days < 7) return `Hace ${days} días`;
    
    return date.toLocaleDateString('es-ES', { 
      day: '2-digit', 
      month: 'short' 
    });
  };

  const getInitials = (name: string): string => {
    if (!name) return '?';
    const words = name.split(' ');
    if (words.length === 1) {
      return words[0].charAt(0).toUpperCase();
    }
    return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
  };

  const truncateContent = (content: string, maxLength: number = 150): string => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  const getCategoryInfo = (categoryId: string) => {
    return categories.find(cat => cat.id === categoryId) || categories[0];
  };

  const getRealCommentsCount = (storyId: string): number => {
    return forumService.getCommentsCountSync(storyId);
  };



  const doRefresh = async (event: CustomEvent) => {
    await loadStories();
    event.detail.complete();
  };

  const displayStories = searchTerm.trim().length > 0 ? filteredStories : stories;

  return (
    <IonPage>
      <AppHeader title="Historias de Esperanza" />
      
      <IonContent>
        <IonRefresher slot="fixed" onIonRefresh={doRefresh}>
          <IonRefresherContent />
        </IonRefresher>

        {/* Barra de búsqueda */}
        <div className="foro-search-container">
          <IonSearchbar
            value={searchTerm}
            onIonInput={(e) => setSearchTerm(e.detail.value!)}
            placeholder="Buscar historias, palabras clave..."
            showClearButton="focus"
            debounce={300}
          />
        </div>

        {/* Categorías */}
        <div className="categories-container">
          <IonSegment 
            value={selectedCategory} 
            onIonChange={(e) => setSelectedCategory(e.detail.value as string)}
            scrollable
          >
            {categories.map(category => (
              <IonSegmentButton key={category.id} value={category.id}>
                <IonLabel>
                  <span className="category-icon">{category.icon}</span>
                  <span className="category-name">{category.name}</span>
                </IonLabel>
              </IonSegmentButton>
            ))}
          </IonSegment>
        </div>

        {/* Header de resultados */}
        <div className="results-header">
          <div className="results-info">
            <IonIcon icon={bookOutline} />
            <IonText>
              <span className="results-count">
                {displayStories.length} 
                {searchTerm ? ` resultado${displayStories.length !== 1 ? 's' : ''} para "${searchTerm}"` : ' historias'}
              </span>
            </IonText>
          </div>
        </div>

        {/* Lista de historias */}
        <div className="stories-container">
          {loading ? (
            // Skeleton loading
            Array.from({ length: 3 }).map((_, index) => (
              <IonCard key={index} className="story-card">
                <IonCardHeader>
                  <div className="story-header">
                    <div className="author-info">
                      <IonAvatar className="author-avatar">
                        <IonSkeletonText animated />
                      </IonAvatar>
                      <div className="author-details">
                        <IonSkeletonText animated style={{ width: '60%' }} />
                        <IonSkeletonText animated style={{ width: '40%' }} />
                      </div>
                    </div>
                  </div>
                  <IonSkeletonText animated style={{ width: '80%' }} />
                </IonCardHeader>
                <IonCardContent>
                  <IonSkeletonText animated />
                  <IonSkeletonText animated />
                  <IonSkeletonText animated style={{ width: '60%' }} />
                </IonCardContent>
              </IonCard>
            ))
          ) : displayStories.length > 0 ? (
            displayStories.map(story => {
              const categoryInfo = getCategoryInfo(story.category);
              const isLiked = likedStories.has(story.id);
              
              return (
                <IonCard 
                  key={story.id} 
                  className="story-card" 
                  button 
                  onClick={() => openStory(story.id)}
                >
                  <IonCardHeader>
                    <div className="story-header">
                      <div className="author-info">
                        <IonAvatar className="author-avatar">
                          <div className="user-avatar">
                            {story.isAnonymous ? '👤' : getInitials(story.authorName)}
                          </div>
                        </IonAvatar>
                        <div className="author-details">
                          <div className="author-name">
                            {story.isAnonymous ? 'Usuaria Anónima' : story.authorName}
                          </div>
                          <div className="story-date">
                            <IonIcon icon={timeOutline} />
                            {formatDate(story.createdAt)}
                          </div>
                        </div>
                      </div>
                      <IonChip className={`category-chip category-${story.category}`}>
                        <span>{categoryInfo.icon}</span>
                        <IonLabel>{categoryInfo.name}</IonLabel>
                      </IonChip>
                    </div>
                    <IonCardTitle className="story-title">
                      {story.title}
                    </IonCardTitle>
                  </IonCardHeader>
                  
                  <IonCardContent className="story-content">
                    <p>{truncateContent(story.content)}</p>
                    
                    {/* Tags */}
                    {story.tags && story.tags.length > 0 && (
                      <div className="story-tags">
                        {story.tags.slice(0, 3).map(tag => (
                          <IonChip key={tag} className="story-tag">
                            <IonLabel>#{tag}</IonLabel>
                          </IonChip>
                        ))}
                        {story.tags.length > 3 && (
                          <span className="more-tags">+{story.tags.length - 3} más</span>
                        )}
                      </div>
                    )}
                    
                    {/* Acciones */}
                    <div className="story-actions">
                      <IonButton 
                        fill="clear" 
                        size="small"
                        onClick={(e) => handleLike(story.id, e)}
                        className={`like-button ${isLiked ? 'liked' : ''}`}
                        disabled={isLiked}
                      >
                        <IonIcon 
                          icon={isLiked ? heart : heartOutline} 
                          slot="start"
                        />
                        {story.likes}
                      </IonButton>
                      
                      <IonButton fill="clear" size="small" className="comment-button">
                        <IonIcon icon={chatbubbleOutline} slot="start" />
                        {getRealCommentsCount(story.id)}
                      </IonButton>
                      

                      
                      <div className="read-more">
                        <IonText color="primary">Leer más →</IonText>
                      </div>
                    </div>
                  </IonCardContent>
                </IonCard>
              );
            })
          ) : (
            // Estado vacío
            <div className="empty-state">
              <IonIcon icon={searchOutline} size="large" />
              <IonText>
                <h3>
                  {searchTerm 
                    ? `No se encontraron historias con "${searchTerm}"`
                    : 'No hay historias en esta categoría aún'
                  }
                </h3>
                <p>
                  {searchTerm 
                    ? 'Intenta con otras palabras clave'
                    : '¡Sé la primera en compartir tu historia de esperanza!'
                  }
                </p>
              </IonText>
              {!searchTerm && (
                <IonButton 
                  expand="block" 
                  fill="outline"
                  onClick={createNewStory}
                  className="create-story-button"
                >
                  Compartir mi historia
                </IonButton>
              )}
            </div>
          )}
        </div>
      </IonContent>

      {/* Botón flotante para nueva historia */}
      <IonFab vertical="bottom" horizontal="end" slot="fixed">
        <IonFabButton onClick={createNewStory} className="fab-create">
          <IonIcon icon={addOutline} />
        </IonFabButton>
      </IonFab>
    </IonPage>
  );
};

export default Foro;