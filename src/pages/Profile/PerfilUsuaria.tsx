import React, { useState, useEffect } from 'react';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonButtons,
  IonBackButton,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonList,
  IonItem,
  IonLabel,
  IonAvatar,
  IonChip,
  IonIcon,
  IonText,
  IonRefresher,
  IonRefresherContent,
  IonSkeletonText
} from '@ionic/react';
import {
  personOutline,
  timeOutline,
  libraryOutline,
  chatbubbleOutline,
  heartOutline,
  calendarOutline
} from 'ionicons/icons';
import { useParams, useHistory } from 'react-router-dom';
import { forumService, ForumUser, Storia } from '../../services/forumService';
import './PerfilUsuaria.css';

interface RouteParams {
  userId: string;
}

const PerfilUsuaria: React.FC = () => {
  const { userId } = useParams<RouteParams>();
  const history = useHistory();
  const [user, setUser] = useState<ForumUser | null>(null);
  const [stories, setStories] = useState<Storia[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);


  useEffect(() => {
    loadCurrentUser();
    loadUserProfile();
    loadUserStories();
  }, [userId]);

  const loadCurrentUser = () => {
    const userData = localStorage.getItem('w-protect-user');
    if (userData) {
      setCurrentUser(JSON.parse(userData));
    }
  };

  const loadUserProfile = async () => {
    try {
      // Crear perfil básico desde las historias del usuario
      const allStories = await forumService.getStories();
      const userFirstStory = allStories.find(story => story.authorId === userId);
      
      if (userFirstStory) {
        const userStories = allStories.filter(story => story.authorId === userId);
        const storiesCount = userStories.length;
        
        // Contar comentarios del usuario
        const allComments: any[] = [];
        for (const story of allStories) {
          const storyComments = await forumService.getComments(story.id);
          allComments.push(...storyComments);
        }
        const commentsCount = allComments.filter(comment => comment.authorId === userId).length;
        
        const userProfile: ForumUser = {
          id: userId,
          name: userFirstStory.authorName,
          email: userId,
          joinedAt: userFirstStory.createdAt,
          storiesCount,
          commentsCount,
          likesReceived: userStories.reduce((sum, story) => sum + story.likes, 0)
        };
        
        setUser(userProfile);
      }
    } catch (error) {
      console.error('Error cargando perfil:', error);
    }
  };

  const loadUserStories = async () => {
    try {
      const allStories = await forumService.getStories();
      const userStories = allStories.filter(story => story.authorId === userId);
      setStories(userStories);
    } catch (error) {
      console.error('Error cargando historias:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getInitials = (name: string): string => {
    return name.split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getCategoryInfo = (categoryId: string) => {
    const categories = forumService.getCategories();
    return categories.find(cat => cat.id === categoryId) || categories[0];
  };

  const truncateContent = (content: string, maxLength: number = 150): string => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  const openStory = (storyId: string) => {
    history.push(`/foro/historia/${storyId}`);
  };

  const doRefresh = async (event: CustomEvent) => {
    await Promise.all([loadUserProfile(), loadUserStories()]);
    event.detail.complete();
  };

  const goBack = () => {
    history.goBack();
  };

  if (loading) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonButtons slot="start">
              <IonBackButton defaultHref="/foro" />
            </IonButtons>
            <IonTitle>Perfil</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <div className="loading-profile">
            <IonCard>
              <IonCardContent>
                <div className="profile-header-skeleton">
                  <IonSkeletonText animated style={{ width: '80px', height: '80px', borderRadius: '50%' }} />
                  <div className="profile-info-skeleton">
                    <IonSkeletonText animated style={{ width: '60%' }} />
                    <IonSkeletonText animated style={{ width: '40%' }} />
                  </div>
                </div>
              </IonCardContent>
            </IonCard>
          </div>
        </IonContent>
      </IonPage>
    );
  }

  if (!user) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonButtons slot="start">
              <IonBackButton defaultHref="/foro" />
            </IonButtons>
            <IonTitle>Perfil</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <div className="error-state">
            <IonIcon icon={personOutline} size="large" />
            <h2>Perfil no disponible</h2>
            <p>No tienes permisos para ver este perfil o la usuaria no existe.</p>
            <IonButton fill="solid" onClick={goBack}>
              Volver
            </IonButton>
          </div>
        </IonContent>
      </IonPage>
    );
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonButton fill="clear" onClick={goBack}>
              <IonIcon icon="arrow-back" />
            </IonButton>
          </IonButtons>
          <IonTitle>Perfil de {user.name}</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        <IonRefresher slot="fixed" onIonRefresh={doRefresh}>
          <IonRefresherContent />
        </IonRefresher>

        {/* Información del perfil */}
        <IonCard className="profile-card">
          <IonCardContent>
            <div className="profile-header">
              <IonAvatar className="profile-avatar">
                <div className="user-avatar">
                  {getInitials(user.name)}
                </div>
              </IonAvatar>
              <div className="profile-info">
                <h2>{user.name}</h2>
                <div className="profile-stats">
                  <div className="stat-item">
                    <IonIcon icon={libraryOutline} />
                    <span>{user.storiesCount} historias</span>
                  </div>
                  <div className="stat-item">
                    <IonIcon icon={chatbubbleOutline} />
                    <span>{user.commentsCount} comentarios</span>
                  </div>
                  <div className="stat-item">
                    <IonIcon icon={calendarOutline} />
                    <span>Desde {formatDate(user.joinedAt)}</span>
                  </div>
                </div>
              </div>
            </div>


          </IonCardContent>
        </IonCard>

        {/* Historias de la usuaria */}
        <IonCard>
          <IonCardHeader>
            <IonCardTitle>
              <IonIcon icon={libraryOutline} style={{ marginRight: '8px' }} />
              Sus Historias ({stories.length})
            </IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            {stories.length > 0 ? (
              <IonList>
                {stories.map(story => {
                  const categoryInfo = getCategoryInfo(story.category);
                  return (
                    <IonCard 
                      key={story.id} 
                      className="story-preview-card" 
                      button 
                      onClick={() => openStory(story.id)}
                    >
                      <IonCardHeader>
                        <div className="story-preview-header">
                          <IonChip className={`category-chip category-${story.category}`}>
                            <span>{categoryInfo.icon}</span>
                            <IonLabel>{categoryInfo.name}</IonLabel>
                          </IonChip>
                          <div className="story-date">
                            <IonIcon icon={timeOutline} />
                            {formatDate(story.createdAt)}
                          </div>
                        </div>
                        <IonCardTitle className="story-preview-title">
                          {story.title}
                        </IonCardTitle>
                      </IonCardHeader>
                      <IonCardContent>
                        <p className="story-preview-content">
                          {truncateContent(story.content)}
                        </p>
                        <div className="story-preview-stats">
                          <span>
                            <IonIcon icon={heartOutline} />
                            {story.likes}
                          </span>
                          <span>
                            <IonIcon icon={chatbubbleOutline} />
                            {story.commentsCount}
                          </span>
                        </div>
                      </IonCardContent>
                    </IonCard>
                  );
                })}
              </IonList>
            ) : (
              <div className="no-stories">
                <IonIcon icon={libraryOutline} size="large" />
                <h3>Sin historias aún</h3>
                <p>{user?.name} no ha compartido historias todavía.</p>
              </div>
            )}
          </IonCardContent>
        </IonCard>
      </IonContent>
    </IonPage>
  );
};

export default PerfilUsuaria;