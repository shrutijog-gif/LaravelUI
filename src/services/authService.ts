/**
 * Simple Authentication Service for College CMS Admin Portal
 */

export interface AuthUser {
  username: string;
  name: string;
  email: string;
  role: string;
}

const AUTH_KEY = 'college_cms_auth_user';

export const getStoredAuthUser = (): AuthUser | null => {
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const isAuthenticated = (): boolean => {
  return getStoredAuthUser() !== null;
};

export const login = (username: string, password: string): { success: boolean; error?: string } => {
  const cleanUsername = username.trim().toLowerCase();
  const cleanPassword = password.trim();

  // Accept admin/admin or shruti.jog@gmail.com / admin
  if (
    (cleanUsername === 'admin' || cleanUsername === 'shruti.jog@gmail.com') &&
    cleanPassword === 'admin'
  ) {
    const user: AuthUser = {
      username: 'admin',
      name: 'Shruti Jog',
      email: 'shruti.jog@gmail.com',
      role: 'Super Administrator',
    };
    localStorage.setItem(AUTH_KEY, JSON.stringify(user));
    window.dispatchEvent(new Event('auth-changed'));
    return { success: true };
  }

  return { 
    success: false, 
    error: 'Invalid username or password. Please try again.' 
  };
};

export const logout = (): void => {
  localStorage.removeItem(AUTH_KEY);
  window.dispatchEvent(new Event('auth-changed'));
};
