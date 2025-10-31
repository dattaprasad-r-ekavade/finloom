import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

type KycStatus = 'NOT_SUBMITTED' | 'AUTO_APPROVED';

interface User {
  id: string;
  email: string;
  name: string | null;
  role: string;
  kycStatus?: KycStatus;
  hasCompletedKyc?: boolean;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isLoading: true,
      setUser: (user) => set({ user }),
      setLoading: (loading) => set({ isLoading: loading }),
      logout: async () => {
        try {
          await fetch('/api/auth/logout', { method: 'POST' });
        } catch (error) {
          console.error('Logout error:', error);
        } finally {
          set({ user: null });
        }
      },
      checkAuth: async () => {
        try {
          set({ isLoading: true });
          const response = await fetch('/api/auth/me');
          
          if (response.ok) {
            const data = await response.json();
            set({ user: data.user });
          } else {
            set({ user: null });
          }
        } catch (error) {
          console.error('Check auth error:', error);
          set({ user: null });
        } finally {
          set({ isLoading: false });
        }
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
