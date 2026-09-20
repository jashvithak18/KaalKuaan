import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, UserRole } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: UserProfile | null;
  role: UserRole;
  isAuthenticated: boolean;
  login: (email: string) => Promise<{ success: boolean; message?: string }>;
  signup: (data: { name: string; email: string; phone?: string; district?: string; mandal?: string; village?: string }) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  switchRole: (role: UserRole) => Promise<void>;
  availableUsers: UserProfile[];
}

const defaultCitizenUser: UserProfile = {
  userId: 'USR-PUBLIC-04',
  name: 'G. Mallesh (Citizen)',
  email: 'citizen.mallesh@public.in',
  role: 'PUBLIC',
  jurisdiction: { district: 'Nalgonda', mandal: 'Vemulapally', village: 'Ramanapet' },
  badgeOrPhone: '+91 98480 12345'
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  role: 'PUBLIC',
  isAuthenticated: false,
  login: async () => ({ success: false }),
  signup: async () => ({ success: false }),
  logout: () => {},
  switchRole: async () => {},
  availableUsers: []
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('kaalkuaan_user');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { return null; }
    }
    return null;
  });
  const [availableUsers, setAvailableUsers] = useState<UserProfile[]>([]);

  useEffect(() => {
    api.getUsers().then((users) => {
      if (users && users.length > 0) {
        setAvailableUsers(users);
      }
    }).catch(console.error);
  }, []);

  const login = async (email: string) => {
    try {
      const res = await api.login(email);
      if (res.success && res.user) {
        setUser(res.user);
        localStorage.setItem('kaalkuaan_user', JSON.stringify(res.user));
        return { success: true };
      }
      return { success: false, message: res.message || 'Login failed' };
    } catch (err: any) {
      return { success: false, message: err.message || 'Network error' };
    }
  };

  const signup = async (data: { name: string; email: string; phone?: string; district?: string; mandal?: string; village?: string }) => {
    try {
      const res = await api.signup(data);
      if (res.success && res.user) {
        setUser(res.user);
        localStorage.setItem('kaalkuaan_user', JSON.stringify(res.user));
        return { success: true };
      }
      return { success: false, message: res.message || 'Registration failed' };
    } catch (err: any) {
      return { success: false, message: err.message || 'Network error' };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('kaalkuaan_user');
  };

  const switchRole = async (targetRole: UserRole) => {
    try {
      const res = await api.switchRole(targetRole);
      if (res.success && res.user) {
        setUser(res.user);
        localStorage.setItem('kaalkuaan_user', JSON.stringify(res.user));
      }
    } catch (err) {
      console.error('Role switch failed:', err);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      role: user?.role || 'PUBLIC',
      isAuthenticated: !!user,
      login,
      signup,
      logout,
      switchRole,
      availableUsers
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
