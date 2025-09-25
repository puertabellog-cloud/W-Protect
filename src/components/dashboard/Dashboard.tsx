import React from 'react';
import {
  IonCard,
  IonCardContent,
  IonIcon,
  IonGrid,
  IonRow,
  IonCol,
  IonText
} from '@ionic/react';
import {
  warningOutline,
  locationOutline,
  chatbubblesOutline,
  bookOutline,
  shieldCheckmarkOutline
} from 'ionicons/icons';

interface DashboardProps {
  onFeatureSelect: (feature: string) => void;
  userName?: string;
}

export const Dashboard: React.FC<DashboardProps> = ({ 
  onFeatureSelect, 
  userName = "Usuaria" 
}) => {
  const features = [
    {
      id: 'location',
      title: 'Localización',
      description: 'Compartir ubicación en tiempo real',
      icon: locationOutline,
      color: '#3b82f6'
    },
    {
      id: 'experiencias',
      title: 'Experiencias',
      description: 'Historias de esperanza y superación',
      icon: chatbubblesOutline,
      color: '#a855f7'
    },
    {
      id: 'resources',
      title: 'Recursos',
      description: 'Biblioteca de seguridad y artículos',
      icon: bookOutline,
      color: '#ec4899'
    }
  ];

  const dashboardStyles = `
    .dashboard-container {
      background: linear-gradient(180deg, #fdf2f8 0%, #ffffff 100%);
      min-height: 100vh;
      padding-bottom: 80px;
    }
    
    .welcome-section {
      padding: 24px 20px 16px 20px;
      text-align: center;
      background: rgba(255, 255, 255, 0.8);
      backdrop-filter: blur(10px);
      margin-bottom: 8px;
    }
    
    .welcome-icon {
      font-size: 2.2rem;
      color: #ff4081;
      margin-bottom: 8px;
    }
    
    .welcome-title {
      color: #2d3748;
      font-size: 1.3rem;
      font-weight: 700;
      margin-bottom: 4px;
    }
    
    .welcome-author {
      color: #9ca3af;
      font-size: 0.8rem;
      font-weight: 300;
      font-style: italic;
      margin: 0 0 12px 0;
      letter-spacing: 0.5px;
    }
    
    .welcome-subtitle {
      color: #64748b;
      font-size: 0.9rem;
      margin: 0;
      line-height: 1.4;
      max-width: 280px;
      margin: 0 auto;
    }
    
    .emergency-card {
      background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
      border-radius: 18px;
      margin: 0 16px 24px 16px;
      box-shadow: 0 6px 20px rgba(239, 68, 68, 0.3);
      cursor: pointer;
      transition: all 0.3s ease;
      position: relative;
      overflow: hidden;
    }
    
    .emergency-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(239, 68, 68, 0.4);
    }
    
    .emergency-content {
      padding: 28px 24px;
      text-align: center;
    }
    
    .emergency-icon {
      font-size: 2.8rem;
      color: white;
      margin-bottom: 10px;
    }
    
    .emergency-title {
      color: white;
      font-size: 1.4rem;
      font-weight: bold;
      margin: 0 0 6px 0;
      letter-spacing: 0.5px;
    }
    
    .emergency-subtitle {
      color: rgba(255, 255, 255, 0.9);
      margin: 0;
      font-size: 0.9rem;
    }
    
    .features-container {
      padding: 0 16px;
    }
    
    .feature-card {
      background: white;
      border-radius: 16px;
      margin: 0 0 16px 0;
      cursor: pointer;
      transition: all 0.3s ease;
      box-shadow: 0 3px 15px rgba(0,0,0,0.08);
      border: 1px solid rgba(0,0,0,0.06);
      width: 100%;
    }
    
    .feature-card:hover {
      transform: translateY(-3px);
      box-shadow: 0 8px 25px rgba(0,0,0,0.12);
    }
    
    .feature-content {
      padding: 20px 24px;
      display: flex;
      align-items: center;
      text-align: left;
    }
    
    .feature-icon {
      font-size: 2.5rem;
      margin-right: 20px;
      flex-shrink: 0;
    }
    
    .feature-text {
      flex: 1;
    }
    
    .feature-title {
      font-size: 1.2rem;
      font-weight: 600;
      margin: 0 0 4px 0;
      color: #2d3748;
    }
    
    .feature-description {
      font-size: 0.9rem;
      color: #64748b;
      line-height: 1.4;
      margin: 0;
    }
    
    @media (max-width: 768px) {
      .welcome-section {
        padding: 20px 16px 14px 16px;
      }
      
      .emergency-content {
        padding: 24px 20px;
      }
      
      .feature-content {
        padding: 18px 20px;
      }
      
      .feature-icon {
        font-size: 2.2rem;
        margin-right: 16px;
      }
      
      .feature-title {
        font-size: 1.1rem;
      }
      
      .feature-description {
        font-size: 0.85rem;
      }
    }
  `;

  return (
    <>
      <style>{dashboardStyles}</style>
      
      <div className="dashboard-container">
        {/* Welcome Section - Sin botón rosa, solo mensaje */}
        <div className="welcome-section">
          <IonIcon icon={shieldCheckmarkOutline} className="welcome-icon" />
          <h2 className="welcome-title">Bienvenida a W-Protect</h2>
          <p className="welcome-author">by Gabriela Puerta</p>
          <p className="welcome-subtitle">
            Tu seguridad es nuestra prioridad. Accede a todas las herramientas de protección.
          </p>
        </div>

        {/* Emergency Button - Mantiene el ancho completo pero más compacto */}
        <div 
          className="emergency-card"
          onClick={() => onFeatureSelect('emergency')}
        >
          <div className="emergency-content">
            <IonIcon icon={warningOutline} className="emergency-icon" />
            <h3 className="emergency-title">EMERGENCIA</h3>
            <p className="emergency-subtitle">Toca para activar alerta inmediata</p>
          </div>
        </div>

        {/* Features List - Botones rectangulares uno debajo del otro */}
        <div className="features-container">
          {features.map((feature) => (
            <div 
              key={feature.id}
              className="feature-card"
              onClick={() => onFeatureSelect(feature.id)}
            >
              <div className="feature-content">
                <IonIcon 
                  icon={feature.icon} 
                  className="feature-icon"
                  style={{ color: feature.color }}
                />
                <div className="feature-text">
                  <h4 className="feature-title">{feature.title}</h4>
                  <p className="feature-description">{feature.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};