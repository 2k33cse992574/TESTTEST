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
  const [user, setUser] = useState<User | null>(null);

  const login = (role: UserRole) => setUser(MOCK_USERS[role]);
  const logout = () => setUser(null);

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
