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
  setUser: (user: User | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
      logout: () => set({ user: null }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
