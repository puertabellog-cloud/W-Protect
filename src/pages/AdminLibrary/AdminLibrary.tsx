import React, { useEffect, useState } from 'react';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonButton,
  IonIcon,
  IonFab,
  IonFabButton,
  IonAlert,
  IonModal,
  IonInput,
  IonTextarea,
  IonToast,
  IonSpinner,
  IonText,
  IonButtons,
  IonNote,
} from '@ionic/react';
import { add, trashOutline, createOutline, linkOutline } from 'ionicons/icons';
import {
  getAllLibraryItems,
  saveLibraryItem,
  deleteLibraryItem,
  patchLibraryItem,
} from '../../services/libraryService';
import { WLibrary } from '../../types';
import { debugError, debugLog } from '../../utils/debug';

const EMPTY_FORM: Omit<WLibrary, 'id'> = { name: '', description: '', url: '' };

const AdminLibrary: React.FC = () => {
  const [items, setItems] = useState<WLibrary[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState('');
  const [toastColor, setToastColor] = useState<'success' | 'danger'>('success');

  // Modal de crear/editar
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<WLibrary | null>(null);
  const [form, setForm] = useState<Omit<WLibrary, 'id'>>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  // Alert de confirmación de eliminación
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);

  /* ─── Carga inicial ─────────────────────────────────────── */
  const loadItems = async () => {
    try {
      setLoading(true);
      debugLog('AdminLibrary', 'loadItems start');
      const data = await getAllLibraryItems();
      debugLog('AdminLibrary', 'loadItems success', {
        count: Array.isArray(data) ? data.length : -1,
        firstItem: Array.isArray(data) && data.length > 0 ? data[0] : null,
      });
      setItems(data);
    } catch (error) {
      debugError('AdminLibrary', 'loadItems failed', error);
      showToast('Error al cargar los recursos', 'danger');
    } finally {
      setLoading(false);
      debugLog('AdminLibrary', 'loadItems end');
    }
  };

  useEffect(() => {
    debugLog('AdminLibrary', 'mounted');
    loadItems();
  }, []);

  useEffect(() => {
    debugLog('AdminLibrary', 'state changed', {
      loading,
      itemsCount: items.length,
      showModal,
    });
  }, [loading, items.length, showModal]);

  /* ─── Helpers ────────────────────────────────────────────── */
  const showToast = (msg: string, color: 'success' | 'danger' = 'success') => {
    setToast(msg);
    setToastColor(color);
  };

  const openCreate = () => {
    setEditingItem(null);
    setForm(EMPTY_FORM);
    setShowModal(true);
  };

  const openEdit = (item: WLibrary) => {
    setEditingItem(item);
    setForm({ name: item.name, description: item.description, url: item.url });
    setShowModal(true);
  };

  const isFormValid = () =>
    form.name.trim() !== '' &&
    form.description.trim() !== '' &&
    form.url.trim() !== '';

  /* ─── Guardar (crear o editar) ──────────────────────────── */
  const handleSave = async () => {
    if (!isFormValid()) {
      showToast('Completa todos los campos', 'danger');
      return;
    }
    setSaving(true);
    try {
      if (editingItem?.id) {
        debugLog('AdminLibrary', 'updating item', { id: editingItem.id, form });
        const updated = await patchLibraryItem(editingItem.id, form);
        setItems(prev => prev.map(i => (i.id === updated.id ? updated : i)));
        showToast('Recurso actualizado correctamente');
      } else {
        debugLog('AdminLibrary', 'creating item', { form });
        const created = await saveLibraryItem(form);
        setItems(prev => [...prev, created]);
        showToast('Recurso creado correctamente');
      }
      setShowModal(false);
    } catch (error) {
      debugError('AdminLibrary', 'handleSave failed', error);
      showToast('Error al guardar el recurso', 'danger');
    } finally {
      setSaving(false);
    }
  };

  /* ─── Eliminar ──────────────────────────────────────────── */
  const handleDelete = async () => {
    if (deleteTargetId === null) return;
    try {
      debugLog('AdminLibrary', 'deleting item', { id: deleteTargetId });
      await deleteLibraryItem(deleteTargetId);
      setItems(prev => prev.filter(i => i.id !== deleteTargetId));
      showToast('Recurso eliminado');
    } catch (error) {
      debugError('AdminLibrary', 'handleDelete failed', error);
      showToast('Error al eliminar el recurso', 'danger');
    } finally {
      setDeleteTargetId(null);
    }
  };

  /* ─── Render ─────────────────────────────────────────────── */
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonTitle>Biblioteca (Admin)</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
            <IonSpinner />
          </div>
        ) : items.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <IonText color="medium">No hay recursos en la biblioteca.</IonText>
          </div>
        ) : (
          <IonList>
            {items.map(item => (
              <IonItem key={item.id}>
                <IonIcon icon={linkOutline} slot="start" color="primary" />
                <IonLabel>
                  <h2>{item.name}</h2>
                  <p>{item.description}</p>
                  <IonNote>{item.url}</IonNote>
                </IonLabel>
                <IonButton
                  fill="clear"
                  slot="end"
                  onClick={() => openEdit(item)}
                  aria-label="Editar"
                >
                  <IonIcon icon={createOutline} />
                </IonButton>
                <IonButton
                  fill="clear"
                  slot="end"
                  color="danger"
                  onClick={() => setDeleteTargetId(item.id!)}
                  aria-label="Eliminar"
                >
                  <IonIcon icon={trashOutline} />
                </IonButton>
              </IonItem>
            ))}
          </IonList>
        )}

        {/* FAB para crear nuevo recurso */}
        <IonFab vertical="bottom" horizontal="end" slot="fixed">
          <IonFabButton onClick={openCreate} color="primary">
            <IonIcon icon={add} />
          </IonFabButton>
        </IonFab>

        {/* Modal crear/editar */}
        <IonModal isOpen={showModal} onDidDismiss={() => setShowModal(false)}>
          <IonHeader>
            <IonToolbar>
              <IonTitle>{editingItem ? 'Editar recurso' : 'Nuevo recurso'}</IonTitle>
              <IonButtons slot="end">
                <IonButton onClick={() => setShowModal(false)}>Cancelar</IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>
          <IonContent className="ion-padding">
            <IonItem>
              <IonLabel position="stacked">Nombre *</IonLabel>
              <IonInput
                value={form.name}
                onIonInput={e => setForm(prev => ({ ...prev, name: e.detail.value ?? '' }))}
                placeholder="Nombre del recurso"
              />
            </IonItem>
            <IonItem>
              <IonLabel position="stacked">Descripción *</IonLabel>
              <IonTextarea
                value={form.description}
                onIonInput={e => setForm(prev => ({ ...prev, description: e.detail.value ?? '' }))}
                placeholder="Descripción del recurso"
                rows={3}
              />
            </IonItem>
            <IonItem>
              <IonLabel position="stacked">URL *</IonLabel>
              <IonInput
                value={form.url}
                onIonInput={e => setForm(prev => ({ ...prev, url: e.detail.value ?? '' }))}
                placeholder="https://..."
                type="url"
              />
            </IonItem>
            <div style={{ padding: '1rem' }}>
              <IonButton
                expand="block"
                onClick={handleSave}
                disabled={saving || !isFormValid()}
              >
                {saving ? <IonSpinner name="crescent" /> : editingItem ? 'Guardar cambios' : 'Crear recurso'}
              </IonButton>
            </div>
          </IonContent>
        </IonModal>

        {/* Alert de confirmación de eliminación */}
        <IonAlert
          isOpen={deleteTargetId !== null}
          header="Eliminar recurso"
          message="¿Estás segura de que deseas eliminar este recurso? Esta acción no se puede deshacer."
          buttons={[
            { text: 'Cancelar', role: 'cancel', handler: () => setDeleteTargetId(null) },
            { text: 'Eliminar', role: 'destructive', handler: handleDelete },
          ]}
          onDidDismiss={() => setDeleteTargetId(null)}
        />

        {/* Toast de feedback */}
        <IonToast
          isOpen={toast !== ''}
          message={toast}
          duration={2500}
          color={toastColor}
          onDidDismiss={() => setToast('')}
        />
      </IonContent>
    </IonPage>
  );
};

export default AdminLibrary;
