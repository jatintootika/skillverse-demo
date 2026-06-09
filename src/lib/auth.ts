import { User } from '../types';

export interface TokenPayload {
  userId: string;
  email: string;
  role: 'student' | 'admin' | 'super_admin' | 'faculty';
  permissions: string[];
  expiresAt: number;
}

export function saveAuth(user: User) {
  const token: TokenPayload = {
    userId: user.id,
    email: user.email,
    role: user.role,
    permissions: user.permissions || [],
    expiresAt: Date.now() + 24 * 60 * 60 * 1000 // 24 hours
  };
  localStorage.setItem('sv_token', JSON.stringify(token));
  localStorage.setItem('sv_user', JSON.stringify(user));
}

export function getAuthToken(): TokenPayload | null {
  const tokenStr = localStorage.getItem('sv_token');
  if (!tokenStr) return null;
  try {
    const token = JSON.parse(tokenStr) as TokenPayload;
    if (Date.now() > token.expiresAt) {
      clearAuth();
      return null;
    }
    return token;
  } catch (e) {
    return null;
  }
}

export function getAuthUser(): User | null {
  const userStr = localStorage.getItem('sv_user');
  if (!userStr) return null;
  try {
    const user = JSON.parse(userStr) as User;
    return user;
  } catch (e) {
    return null;
  }
}

export function isLoggedIn(): boolean {
  return getAuthToken() !== null;
}

export function getUserRole(): 'student' | 'admin' | 'super_admin' | 'faculty' | '' {
  const token = getAuthToken();
  return token ? token.role : '';
}

export function getPermissions(): string[] {
  const token = getAuthToken();
  return token && token.permissions ? token.permissions : [];
}

export function clearAuth() {
  localStorage.removeItem('sv_token');
  localStorage.removeItem('sv_user');
}
