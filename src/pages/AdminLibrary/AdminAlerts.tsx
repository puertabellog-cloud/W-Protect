import React, { useEffect, useState } from 'react';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonIcon,
  IonText,
  IonList,
  IonItem,
  IonLabel,
  IonBadge,
  IonSpinner,
  IonToast,
} from '@ionic/react';
import { alertCircleOutline } from 'ionicons/icons';
import { getAllAlertsForAdmin } from '../../services/springBootServices';
import { Alert } from '../../types';

type AdminAlertItem = Alert & {
  status?: string;
  estado?: string;
  state?: string;
  createdAt?: string;
  updatedAt?: string;
  closedAt?: string;
  userName?: string;
  userEmail?: string;
};

const normalizeAlertStatus = (alert: AdminAlertItem): string => {
  const raw = String(alert.status ?? alert.estado ?? alert.state ?? '').trim().toUpperCase();
  if (!raw) return 'ACTIVE';
  if (raw.includes('CLOSE') || raw.includes('RESOL') || raw === 'INACTIVE') return 'CLOSED';
  if (raw.includes('EXPIR')) return 'EXPIRED';
  if (raw.includes('PEND')) return 'PENDING';
  return raw;
};

const statusColor = (status: string): 'success' | 'warning' | 'danger' | 'medium' => {
  if (status === 'ACTIVE') return 'success';
  if (status === 'PENDING') return 'warning';
  if (status === 'EXPIRED') return 'danger';
  if (status === 'CLOSED') return 'medium';
  return 'medium';
};

const formatDate = (alert: AdminAlertItem): string => {
  const candidate = alert.timestamp ?? alert.createdAt ?? alert.updatedAt ?? '';
  if (!candidate) return 'Sin fecha';
  const dt = new Date(candidate);
  if (Number.isNaN(dt.getTime())) return candidate;
  return dt.toLocaleString('es-CO', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const AdminAlerts: React.FC = () => {
  const [alerts, setAlerts] = useState<AdminAlertItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showError, setShowError] = useState(false);

  useEffect(() => {
    const loadAlerts = async () => {
      try {
        setLoading(true);
        const data = await getAllAlertsForAdmin();
        setAlerts(data as AdminAlertItem[]);
      } catch (error) {
        console.error('Error cargando alertas admin:', error);
        setShowError(true);
      } finally {
        setLoading(false);
      }
    };

    loadAlerts();
  }, []);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar style={{ '--background': 'linear-gradient(135deg, #fce7f3 0%, #f9d7e8 100%)', '--color': '#7a284a' }}>
          <IonTitle style={{ fontWeight: 700, textAlign: 'center' }}>Alertas</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent style={{ '--background': '#fff8fc' }}>
        {loading ? (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '50vh',
            }}
          >
            <IonSpinner />
          </div>
        ) : alerts.length === 0 ? (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '60vh',
              gap: '1rem',
              padding: '2rem',
              textAlign: 'center',
              background: '#fff',
              margin: '16px',
              borderRadius: '18px',
              border: '1px solid #f4cde0',
              boxShadow: '0 10px 22px rgba(122, 40, 74, 0.08)',
            }}
          >
            <IonIcon icon={alertCircleOutline} style={{ fontSize: '4rem', color: '#b33f72' }} />
            <IonText color="medium">
              <h2 style={{ margin: 0 }}>Sin alertas para mostrar</h2>
              <p>No se encontraron alertas registradas.</p>
            </IonText>
          </div>
        ) : (
          <IonList style={{ background: 'transparent', padding: '10px 12px' }}>
            {alerts.map((alert, index) => {
              const status = normalizeAlertStatus(alert);
              return (
                <IonItem
                  key={alert.id ?? `alert-${index}`}
                  style={{
                    '--background': '#fff',
                    borderRadius: '14px',
                    marginBottom: '10px',
                    '--padding-start': '14px',
                    '--padding-end': '10px',
                    border: '1px solid #f4cde0',
                    boxShadow: '0 8px 20px rgba(122, 40, 74, 0.06)',
                  }}
                >
                  <IonLabel>
                    <h2 style={{ marginBottom: '4px' }}>{alert.message || 'Alerta sin mensaje'}</h2>
                    <p style={{ margin: '0 0 4px' }}>ID: {alert.id ?? '-'}</p>
                    <p style={{ margin: '0 0 4px' }}>Usuario: {alert.userName || alert.userEmail || alert.userId || '-'}</p>
                    <p style={{ margin: 0 }}>Fecha: {formatDate(alert)}</p>
                  </IonLabel>
                  <IonBadge color={statusColor(status)} style={{ fontWeight: 700, padding: '6px 10px', borderRadius: '10px' }}>
                    {status}
                  </IonBadge>
                </IonItem>
              );
            })}
          </IonList>
        )}

        <IonToast
          isOpen={showError}
          onDidDismiss={() => setShowError(false)}
          message="No se pudieron cargar las alertas. Verifica el endpoint del backend."
          duration={3000}
          color="danger"
        />
      </IonContent>
    </IonPage>
  );
};

export default AdminAlerts;
