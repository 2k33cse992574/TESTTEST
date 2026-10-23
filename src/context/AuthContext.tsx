import { createContext, useContext, useState, type ReactNode } from 'react';
import type { User, UserRole } from '@/types';

interface AuthContextValue {
  user: User | null;
  login: (role: UserRole) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const MOCK_USERS: Record<UserRole, User> = {
  student: {
    id: 'STU-001',
    name: 'Arjun Sharma',
    email: 'arjun.sharma@example.edu',
    role: 'student',
    avatarInitials: 'AS',
  },
  institution: {
    id: 'INST-ADM-001',
    name: 'Dr. Priya Nair',
    email: 'priya.nair@siet.edu.in',
    role: 'institution',
    institutionId: 'INST-MH-0042',
    institutionName: 'Shri Institute of Engineering & Technology',
    avatarInitials: 'PN',
  },
  officer: {
    id: 'OFCR-001',
    name: 'Shri Rajesh Kumar',
    email: 'rajesh.kumar@aicte.gov.in',
    role: 'officer',
    avatarInitials: 'RK',
  },
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('apaar_user_role') as UserRole | null;
      if (saved && MOCK_USERS[saved]) return MOCK_USERS[saved];
      // Check current route to provide seamless default
      const path = typeof window !== 'undefined' ? window.location.pathname : '';
      if (path.startsWith('/officer')) return MOCK_USERS['officer'];
      if (path.startsWith('/institution')) return MOCK_USERS['institution'];
      if (path.startsWith('/student')) return MOCK_USERS['student'];
      return MOCK_USERS['student'];
    } catch {
      return MOCK_USERS['student'];
    }
  });

  const login = (role: UserRole) => {
    try {
      localStorage.setItem('apaar_user_role', role);
    } catch {}
    setUser(MOCK_USERS[role]);
  };

  const logout = () => {
    try {
      localStorage.removeItem('apaar_user_role');
    } catch {}
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
