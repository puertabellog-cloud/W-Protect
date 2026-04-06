export interface AppSession {
  userId: number;
  email?: string;
  token?: string;
  deviceId?: string;
  profile?: 'USER' | 'ADMIN' | '';
}

const SESSION_KEY = 'w-protect-session';
export const SESSION_CHANGED_EVENT = 'w-protect-session-changed';

const emitSessionChanged = (): void => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(SESSION_CHANGED_EVENT));
  }
};

const isValidSession = (s: any): s is AppSession => {
  return !!s && typeof s === 'object' && typeof s.userId === 'number' && s.userId > 0;
};

export const getSession = (): AppSession | null => {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    if (!isValidSession(parsed)) return null;

    // Normalize profile field
    if (!parsed.profile) parsed.profile = '';

    return parsed as AppSession;
  } catch (error) {
    console.error('Error leyendo sesión:', error);
    return null;
  }
};

/**
 * Guarda/actualiza la sesión en localStorage. Acepta campos parciales y los
 * mergea con la sesión existente. Siempre intenta mantener un `userId` numérico.
 */
export const setSession = (sessionPatch: Partial<AppSession>): void => {
  try {
    const current = getSession() || ({} as AppSession);
    const merged: any = { ...current, ...sessionPatch };

    if (!isValidSession(merged)) {
      // If merged session doesn't have valid userId, still persist if userId provided in patch
      if (!isValidSession(sessionPatch)) {
        console.warn('Intento de setSession con userId inválido:', sessionPatch);
        // do not write invalid session
        return;
      }
    }

    localStorage.setItem(SESSION_KEY, JSON.stringify(merged));
    emitSessionChanged();
  } catch (error) {
    console.error('Error guardando sesión:', error);
  }
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
  const normalized = (profile ?? '').toString().trim().toUpperCase();
  if (normalized === 'ADMIN') return 'ADMIN';
  if (normalized === 'USER') return 'USER';
  return '';
};

/** Devuelve true si el usuario en sesión tiene perfil ADMIN */
export const isAdmin = (): boolean => {
  return normalizeProfile(getSession()?.profile) === 'ADMIN';
};

/** Utilidad: devuelve true si hay una sesión válida (userId presente). */
export const isAuthenticated = (): boolean => {
  return getSession() !== null;
};
