import React, { useState, useEffect } from 'react';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonText,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonItem,
  IonTextarea,
  IonCheckbox,
  IonList,
  IonAvatar,
  IonChip,
  IonLabel,
  IonBackButton,
  IonButtons,
  IonToast,
  IonRefresher,
  IonRefresherContent,
  IonSkeletonText,
  IonIcon
} from '@ionic/react';
import {
  heartOutline,
  heart,
  chatbubbleOutline,
  sendOutline,
  timeOutline,
  chevronBackOutline
} from 'ionicons/icons';
import { useParams, useHistory } from 'react-router-dom';
import { forumService, Storia, Comment } from '../../services/forumService';
import './HistoriaIndividual.css';

interface RouteParams {
  storyId: string;
}

const HistoriaIndividual: React.FC = () => {
  const { storyId } = useParams<RouteParams>();
  const history = useHistory();
  const [story, setStory] = useState<Storia | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [currentUser, setCurrentUser] = useState<any>(null);


  useEffect(() => {
    loadCurrentUser();
    loadStory();
    loadComments();
  }, [storyId]);

  const loadCurrentUser = () => {
    const userData = localStorage.getItem('w-protect-user');
    if (userData) {
      setCurrentUser(JSON.parse(userData));
    }
  };

  const loadStory = async () => {
    try {
      const loadedStory = await forumService.getStoryById(storyId);
      if (!loadedStory) {
        setToastMessage('Historia no encontrada');
        setTimeout(() => history.push('/foro'), 2000);
        return;
      }
      setStory(loadedStory);
    } catch (error) {
      console.error('Error cargando historia:', error);
      setToastMessage('Error cargando la historia');
    } finally {
      setLoading(false);
    }
  };

  const loadComments = async () => {
    try {
      const loadedComments = await forumService.getComments(storyId);
      setComments(loadedComments);
    } catch (error) {
      console.error('Error cargando comentarios:', error);
    }
  };

  const handleLike = async () => {
    if (!story || isLiked) return;
    
    try {
      await forumService.likeStory(story.id);
      setStory(prev => prev ? { ...prev, likes: prev.likes + 1 } : null);
      setIsLiked(true);
      setToastMessage('❤️ Historia apoyada');
    } catch (error) {
      console.error('Error dando like:', error);
      setToastMessage('Error enviando apoyo');
    }
  };

  const handleSubmitComment = async () => {
    if (!newComment.trim() || !currentUser || !story) return;

    setSubmitting(true);
    try {
      const comment = await forumService.addComment({
        storiaId: story.id,
        authorId: currentUser.email,
        authorName: currentUser.name,
        content: newComment.trim(),
        isAnonymous
      });

      setComments(prev => [...prev, comment]);
      setNewComment('');
      setIsAnonymous(false);
      setToastMessage('✅ Comentario enviado');
      
      // Actualizar contador en la historia
      setStory(prev => prev ? { ...prev, commentsCount: prev.commentsCount + 1 } : null);
    } catch (error) {
      console.error('Error enviando comentario:', error);
      setToastMessage('Error enviando comentario');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLikeComment = async (commentId: string) => {
    try {
      await forumService.likeComment(commentId);
      setComments(prev =>
        prev.map(comment =>
          comment.id === commentId
            ? { ...comment, likes: comment.likes + 1 }
            : comment
        )
      );
    } catch (error) {
      console.error('Error dando like al comentario:', error);
    }
  };





  const formatDate = (date: Date): string => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (minutes < 60) return `Hace ${minutes} min`;
    if (hours < 24) return `Hace ${hours}h`;
    if (days < 7) return `Hace ${days} días`;
    
    return date.toLocaleDateString('es-ES', { 
      day: '2-digit', 
      month: 'short',
      year: 'numeric'
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

  const getCategoryInfo = (categoryId: string) => {
    const categories = forumService.getCategories();
    return categories.find(cat => cat.id === categoryId) || categories[0];
  };

  const doRefresh = async (event: CustomEvent) => {
    await Promise.all([loadStory(), loadComments()]);
    event.detail.complete();
  };

  if (loading) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonButtons slot="start">
              <IonBackButton defaultHref="/foro" />
            </IonButtons>
            <IonTitle>Cargando...</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <div className="loading-story">
            <IonCard>
              <IonCardHeader>
                <div className="story-header-skeleton">
                  <IonAvatar>
                    <IonSkeletonText animated />
                  </IonAvatar>
                  <div className="story-meta-skeleton">
                    <IonSkeletonText animated style={{ width: '60%' }} />
                    <IonSkeletonText animated style={{ width: '40%' }} />
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
          </div>
        </IonContent>
      </IonPage>
    );
  }

  if (!story) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonButtons slot="start">
              <IonBackButton defaultHref="/foro" />
            </IonButtons>
            <IonTitle>Historia no encontrada</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <div className="error-state">
            <IonText>
              <h2>Historia no encontrada</h2>
              <p>Esta historia ya no existe o ha sido eliminada</p>
            </IonText>
            <IonButton expand="block" fill="outline" onClick={() => history.push('/foro')}>
              Volver al Foro
            </IonButton>
          </div>
        </IonContent>
      </IonPage>
    );
  }

  const categoryInfo = getCategoryInfo(story.category);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton 
              defaultHref="/foro" 
              icon={chevronBackOutline}
            />
          </IonButtons>
          <IonTitle>Historia</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        <IonRefresher slot="fixed" onIonRefresh={doRefresh}>
          <IonRefresherContent />
        </IonRefresher>

        {/* Historia Principal */}
        <IonCard className="main-story-card">
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
          
          <IonCardContent>
            <div className="story-content">
              <p>{story.content}</p>
            </div>
            
            {/* Tags */}
            {story.tags && story.tags.length > 0 && (
              <div className="story-tags">
                {story.tags.map(tag => (
                  <IonChip key={tag} className="story-tag">
                    <IonLabel>#{tag}</IonLabel>
                  </IonChip>
                ))}
              </div>
            )}
            
            {/* Acciones */}
            <div className="story-actions">
              <IonButton 
                fill="clear" 
                onClick={handleLike}
                className={`like-button ${isLiked ? 'liked' : ''}`}
                disabled={isLiked}
              >
                <IonIcon 
                  icon={isLiked ? heart : heartOutline} 
                  slot="start"
                />
                {story.likes} Apoyos
              </IonButton>
              
              <IonButton fill="clear" className="comment-button">
                <IonIcon icon={chatbubbleOutline} slot="start" />
                {comments.length} Comentarios
              </IonButton>


            </div>
          </IonCardContent>
        </IonCard>

        {/* Formulario de Comentario */}
        {currentUser && (
          <IonCard className="comment-form-card">
            <IonCardContent>
              <div className="comment-form-header">
                <IonAvatar className="current-user-avatar">
                  <div className="user-avatar">
                    {getInitials(currentUser.name)}
                  </div>
                </IonAvatar>
                <div className="comment-form-title">
                  <IonText>
                    <h3>Comparte tu apoyo</h3>
                  </IonText>
                </div>
              </div>
              
              <IonItem className="comment-input">
                <IonTextarea
                  value={newComment}
                  onIonInput={(e) => setNewComment(e.detail.value!)}
                  placeholder="Escribe un mensaje de apoyo..."
                  rows={3}
                  maxlength={500}
                />
              </IonItem>
              
              <div className="comment-form-actions">
                <IonItem className="anonymous-check">
                  <IonCheckbox
                    checked={isAnonymous}
                    onIonChange={(e) => setIsAnonymous(e.detail.checked)}
                  />
                  <IonLabel className="ion-margin-start">
                    Comentar de forma anónima
                  </IonLabel>
                </IonItem>
                
                <IonButton
                  expand="block"
                  onClick={handleSubmitComment}
                  disabled={!newComment.trim() || submitting}
                  className="submit-comment-button"
                >
                  <IonIcon icon={sendOutline} slot="start" />
                  {submitting ? 'Enviando...' : 'Enviar Apoyo'}
                </IonButton>
              </div>
            </IonCardContent>
          </IonCard>
        )}

        {/* Lista de Comentarios */}
        <div className="comments-section">
          <div className="comments-header">
            <IonText>
              <h2>Comentarios de Apoyo ({comments.length})</h2>
            </IonText>
          </div>
          
          {comments.length > 0 ? (
            <IonList className="comments-list">
              {comments.map(comment => (
                <IonCard key={comment.id} className="comment-card">
                  <IonCardContent>
                    <div className="comment-header">
                      <IonAvatar className="comment-avatar">
                        <div className="user-avatar small">
                          {comment.isAnonymous ? '👤' : getInitials(comment.authorName)}
                        </div>
                      </IonAvatar>
                      <div className="comment-meta">
                        <div className="comment-author">
                          {comment.isAnonymous ? 'Usuaria Anónima' : comment.authorName}
                        </div>
                        <div className="comment-date">
                          {formatDate(comment.createdAt)}
                        </div>
                      </div>
                    </div>
                    
                    <div className="comment-content">
                      <p>{comment.content}</p>
                    </div>
                    
                    <div className="comment-actions">
                      <IonButton 
                        fill="clear" 
                        size="small"
                        onClick={() => handleLikeComment(comment.id)}
                        className="comment-like-button"
                      >
                        <IonIcon icon={heartOutline} slot="start" />
                        {comment.likes}
                      </IonButton>
                    </div>
                  </IonCardContent>
                </IonCard>
              ))}
            </IonList>
          ) : (
            <div className="no-comments">
              <IonIcon icon={chatbubbleOutline} size="large" />
              <IonText>
                <h3>Sé la primera en apoyar</h3>
                <p>Comparte un mensaje de apoyo o experiencia similar</p>
              </IonText>
            </div>
          )}
        </div>
      </IonContent>

      <IonToast
        isOpen={!!toastMessage}
        message={toastMessage}
        duration={3000}
        onDidDismiss={() => setToastMessage('')}
        position="top"
      />
    </IonPage>
  );
};

export default HistoriaIndividual;