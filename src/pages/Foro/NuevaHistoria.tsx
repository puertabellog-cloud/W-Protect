import React, { useState } from 'react';
import {
  IonPage,
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButton,
  IonButtons,
  IonBackButton,
  IonItem,
  IonLabel,
  IonInput,
  IonTextarea,
  IonSelect,
  IonSelectOption,
  IonCheckbox,
  IonCard,
  IonCardContent,
  IonChip,
  IonIcon,
  IonToast,
  IonLoading,
  IonText
} from '@ionic/react';
import { 
  arrowBack, 
  checkmarkCircle, 
  addOutline, 
  closeOutline,
  heartOutline,
  lockClosedOutline,
  eyeOutline
} from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import { forumService } from '../../services/forumService';
import './NuevaHistoria.css';

type CategoryType = 'superacion' | 'violencia' | 'trabajo' | 'familia' | 'salud' | 'educacion' | 'otro';

interface FormData {
  title: string;
  content: string;
  category: CategoryType;
  tags: string[];
  isAnonymous: boolean;
}

const NuevaHistoria: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    title: '',
    content: '',
    category: 'superacion',
    tags: [],
    isAnonymous: false
  });
  
  const [newTag, setNewTag] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});
  
  const history = useHistory();
  const categories = forumService.getCategories().filter(cat => cat.id !== 'todas');

  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Limpiar error cuando el usuario empiece a escribir
    if (formErrors[field]) {
      setFormErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const addTag = () => {
    const tag = newTag.trim().toLowerCase();
    if (tag && !formData.tags.includes(tag) && formData.tags.length < 5) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const validateForm = (): boolean => {
    const errors: {[key: string]: string} = {};

    if (!formData.title.trim()) {
      errors.title = 'El título es obligatorio';
    } else if (formData.title.trim().length < 10) {
      errors.title = 'El título debe tener al menos 10 caracteres';
    } else if (formData.title.trim().length > 100) {
      errors.title = 'El título no puede exceder 100 caracteres';
    }

    if (!formData.content.trim()) {
      errors.content = 'El contenido es obligatorio';
    } else if (formData.content.trim().length < 50) {
      errors.content = 'Tu historia debe tener al menos 50 caracteres';
    } else if (formData.content.trim().length > 2000) {
      errors.content = 'Tu historia no puede exceder 2000 caracteres';
    }

    if (!formData.category) {
      errors.category = 'Selecciona una categoría';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      setToastMessage('Por favor, completa todos los campos correctamente');
      setShowToast(true);
      return;
    }

    setIsSubmitting(true);

    try {
      const currentUser = forumService.getCurrentUser();
      if (!currentUser) {
        throw new Error('Usuario no autenticado');
      }

      await forumService.createStory({
        authorId: currentUser.id,
        authorName: formData.isAnonymous ? 'Usuaria Anónima' : currentUser.name,
        title: formData.title.trim(),
        content: formData.content.trim(),
        category: formData.category,
        tags: formData.tags,
        isAnonymous: formData.isAnonymous,
        status: 'published'
      });

      setToastMessage('¡Tu historia ha sido publicada exitosamente! 🎉');
      setShowToast(true);
      
      // Redirigir al foro después de un momento
      setTimeout(() => {
        history.push('/foro');
      }, 2000);

    } catch (error) {
      console.error('Error al publicar historia:', error);
      setToastMessage('Error al publicar tu historia. Por favor, intenta de nuevo.');
      setShowToast(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const goBack = () => {
    history.goBack();
  };

  const getCategoryInfo = (categoryId: string) => {
    return categories.find(cat => cat.id === categoryId) || categories[0];
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonButton fill="clear" onClick={goBack}>
              <IonIcon icon={arrowBack} />
            </IonButton>
          </IonButtons>
          <IonTitle>Compartir mi Historia</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="nueva-historia-content">
        <div className="story-form-container">
          
          {/* Título */}
          <IonCard className="form-section">
            <IonCardContent>
              <IonItem className="form-item">
                <IonLabel position="stacked">
                  <span className="required">*</span> Título de tu historia
                </IonLabel>
                <IonInput
                  value={formData.title}
                  onIonInput={(e) => handleInputChange('title', e.detail.value!)}
                  placeholder="Ej: Mi camino hacia la independencia económica"
                  maxlength={100}
                  className={formErrors.title ? 'error' : ''}
                />
              </IonItem>
              
              {formErrors.title && (
                <IonText color="danger" className="error-text">
                  <small>{formErrors.title}</small>
                </IonText>
              )}
              
              <div className="char-counter">
                {formData.title.length}/100 caracteres
              </div>
            </IonCardContent>
          </IonCard>

          {/* Categoría */}
          <IonCard className="form-section">
            <IonCardContent>
              <IonItem className="form-item">
                <IonLabel position="stacked">
                  <span className="required">*</span> Categoría
                </IonLabel>
                <IonSelect
                  value={formData.category}
                  onIonChange={(e) => handleInputChange('category', e.detail.value as CategoryType)}
                  placeholder="Selecciona una categoría"
                  className={formErrors.category ? 'error' : ''}
                >
                  {categories.map(category => (
                    <IonSelectOption key={category.id} value={category.id}>
                      {category.icon} {category.name}
                    </IonSelectOption>
                  ))}
                </IonSelect>
              </IonItem>
              
              {formErrors.category && (
                <IonText color="danger" className="error-text">
                  <small>{formErrors.category}</small>
                </IonText>
              )}
              
              {formData.category && (
                <div className="category-preview">
                  <IonChip className={`category-chip category-${formData.category}`}>
                    <span>{getCategoryInfo(formData.category).icon}</span>
                    <IonLabel>{getCategoryInfo(formData.category).name}</IonLabel>
                  </IonChip>
                </div>
              )}
            </IonCardContent>
          </IonCard>

          {/* Contenido */}
          <IonCard className="form-section">
            <IonCardContent>
              <IonItem className="form-item">
                <IonLabel position="stacked">
                  <span className="required">*</span> Tu historia
                </IonLabel>
                <IonTextarea
                  value={formData.content}
                  onIonInput={(e) => handleInputChange('content', e.detail.value!)}
                  placeholder="Comparte tu experiencia, tus desafíos, cómo los superaste y qué aprendiste en el camino. Tu historia puede inspirar a otras mujeres..."
                  rows={8}
                  maxlength={2000}
                  className={formErrors.content ? 'error' : ''}
                />
              </IonItem>
              
              {formErrors.content && (
                <IonText color="danger" className="error-text">
                  <small>{formErrors.content}</small>
                </IonText>
              )}
              
              <div className="char-counter">
                {formData.content.length}/2000 caracteres
              </div>
            </IonCardContent>
          </IonCard>

          {/* Tags/Etiquetas */}
          <IonCard className="form-section">
            <IonCardContent>
              <IonLabel className="section-title">
                Etiquetas (opcional)
              </IonLabel>
              <p className="section-description">
                Añade palabras clave para que otras usuarias puedan encontrar tu historia fácilmente
              </p>
              
              <div className="tags-input">
                <IonItem>
                  <IonInput
                    value={newTag}
                    onIonInput={(e) => setNewTag(e.detail.value!)}
                    placeholder="Ej: emprendimiento, familia, superación..."
                    onKeyPress={(e) => e.key === 'Enter' && addTag()}
                  />
                  <IonButton 
                    fill="clear" 
                    onClick={addTag}
                    disabled={!newTag.trim() || formData.tags.length >= 5}
                  >
                    <IonIcon icon={addOutline} />
                  </IonButton>
                </IonItem>
              </div>
              
              {formData.tags.length > 0 && (
                <div className="tags-list">
                  {formData.tags.map(tag => (
                    <IonChip key={tag} className="tag-item">
                      <IonLabel>#{tag}</IonLabel>
                      <IonIcon 
                        icon={closeOutline} 
                        onClick={() => removeTag(tag)}
                      />
                    </IonChip>
                  ))}
                </div>
              )}
              
              <div className="tags-info">
                {formData.tags.length}/5 etiquetas
              </div>
            </IonCardContent>
          </IonCard>

          {/* Opciones de privacidad */}
          <IonCard className="form-section">
            <IonCardContent>
              <IonItem className="checkbox-item">
                <IonCheckbox
                  checked={formData.isAnonymous}
                  onIonChange={(e) => handleInputChange('isAnonymous', e.detail.checked)}
                />
                <IonLabel className="checkbox-label">
                  <div className="checkbox-title">
                    <IonIcon icon={formData.isAnonymous ? lockClosedOutline : eyeOutline} />
                    Publicar de forma anónima
                  </div>
                  <p className="checkbox-description">
                    {formData.isAnonymous 
                      ? 'Tu historia se publicará como "Usuaria Anónima"'
                      : 'Tu historia se publicará con tu nombre de usuario'
                    }
                  </p>
                </IonLabel>
              </IonItem>
            </IonCardContent>
          </IonCard>

          {/* Botones de acción */}
          <div className="action-buttons">
            <IonButton 
              expand="block" 
              fill="solid"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="submit-button"
            >
              <IonIcon icon={heartOutline} slot="start" />
              {isSubmitting ? 'Publicando...' : 'Compartir mi Historia'}
            </IonButton>
            
            <IonButton 
              expand="block" 
              fill="clear" 
              onClick={goBack}
              disabled={isSubmitting}
              className="cancel-button"
            >
              Cancelar
            </IonButton>
          </div>

        </div>

        <IonLoading
          isOpen={isSubmitting}
          message="Publicando tu historia..."
        />

        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message={toastMessage}
          duration={toastMessage.includes('exitosamente') ? 2000 : 3000}
          color={toastMessage.includes('exitosamente') ? 'success' : 'danger'}
          position="top"
        />
      </IonContent>
    </IonPage>
  );
};

export default NuevaHistoria;