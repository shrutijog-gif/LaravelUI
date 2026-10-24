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

export const login = (username: string, password: string, portalType?: string): { success: boolean; error?: string } => {
  const cleanUsername = username.trim().toLowerCase();
  const cleanPassword = password.trim();

  // Accept admin or coordinator accounts with password admin
  if (cleanPassword === 'admin' || cleanPassword === 'password') {
    let user: AuthUser;

    if (cleanUsername.includes('univ') || portalType === 'naac-university') {
      user = {
        username: 'univ.coordinator',
        name: 'Dr. Vikram Malhotra',
        email: 'iqac.director@itmuniversity.edu',
        role: 'University IQAC Coordinator',
      };
    } else if (cleanUsername.includes('school') || portalType === 'naac-school') {
      user = {
        username: 'school.coordinator',
        name: 'Dr. Rajesh Sharma',
        email: 'tech.naac@itmuniversity.edu',
        role: 'School Coordinator (Technology)',
      };
    } else if (cleanUsername.includes('program') || portalType === 'naac-program') {
      user = {
        username: 'program.coordinator',
        name: 'Prof. Anita Verma',
        email: 'cse.coord@itmuniversity.edu',
        role: 'Program Coordinator (B.Tech CSE)',
      };
    } else {
      user = {
        username: 'admin',
        name: 'Shruti Jog',
        email: 'shruti.jog@gmail.com',
        role: 'Super Administrator',
      };
    }

    if (portalType) {
      localStorage.setItem('college_cms_portal_type', portalType);
    }
    localStorage.setItem(AUTH_KEY, JSON.stringify(user));
    window.dispatchEvent(new Event('auth-changed'));
    return { success: true };
  }

  return { 
    success: false, 
    error: 'Invalid password. Hint: Use "admin"' 
  };
};

export const logout = (): void => {
  localStorage.removeItem(AUTH_KEY);
  window.dispatchEvent(new Event('auth-changed'));
};
