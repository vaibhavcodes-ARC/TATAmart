import { create } from 'zustand';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'BUYER' | 'SELLER' | 'ADMIN';
}

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => {
  // Check if we are on the client side before reading localStorage
  const isClient = typeof window !== 'undefined';
  const initialToken = isClient ? localStorage.getItem('tatamart_token') : null;
  const initialUser = isClient ? localStorage.getItem('tatamart_user') : null;

  return {
    token: initialToken,
    user: initialUser ? JSON.parse(initialUser) : null,
    isAuthenticated: !!initialToken,
    login: (token, user) => {
      if (isClient) {
        localStorage.setItem('tatamart_token', token);
        localStorage.setItem('tatamart_user', JSON.stringify(user));
      }
      set({ token, user, isAuthenticated: true });
    },
    logout: () => {
      if (isClient) {
        localStorage.removeItem('tatamart_token');
        localStorage.removeItem('tatamart_user');
      }
      set({ token: null, user: null, isAuthenticated: false });
    },
  };
});
