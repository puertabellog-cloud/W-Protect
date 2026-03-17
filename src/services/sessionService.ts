export interface AppSession {
  userId: number;
  deviceId: string;
  email?: string;
  profile?: 'USER' | 'ADMIN';
}

const SESSION_KEY = 'w-protect-session';
export const SESSION_CHANGED_EVENT = 'w-protect-session-changed';

const emitSessionChanged = (): void => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(SESSION_CHANGED_EVENT));
  }
};

export const getSession = (): AppSession | null => {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as AppSession;
    if (!parsed?.userId || !parsed?.deviceId) return null;

    return parsed;
  } catch (error) {
    console.error('Error leyendo sesión:', error);
    return null;
  }
};

export const setSession = (session: AppSession): void => {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  emitSessionChanged();
};

export const clearAuthState = (): void => {
  localStorage.removeItem(SESSION_KEY);
  localStorage.removeItem('w-protect-registered');
  localStorage.removeItem('w-protect-user');
  localStorage.removeItem('wprotect_registration');
  emitSessionChanged();
};

export const clearSession = (): void => {
  clearAuthState();
};

export const normalizeProfile = (profile?: string | null): 'ADMIN' | 'USER' | '' => {
  const normalized = (profile ?? '').trim().toUpperCase();
  if (normalized === 'ADMIN') return 'ADMIN';
  if (normalized === 'USER') return 'USER';
  return '';
};

/** Devuelve true si el usuario en sesión tiene perfil ADMIN */
export const isAdmin = (): boolean => {
  return normalizeProfile(getSession()?.profile) === 'ADMIN';
};
