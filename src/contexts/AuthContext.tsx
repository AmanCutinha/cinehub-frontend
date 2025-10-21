import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@/types';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, role: 'admin' | 'user') => Promise<boolean>;
  register: (email: string, password: string, name: string, role: 'admin' | 'user') => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Check for existing session
    const savedUser = localStorage.getItem('cinehub_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const login = async (email: string, password: string, role: 'admin' | 'user'): Promise<boolean> => {
    // This will be replaced with actual API call to Spring Boot backend
    // For now, using localStorage for demo purposes
    const users = JSON.parse(localStorage.getItem('cinehub_users') || '[]');
    const existingUser = users.find((u: User) => u.email === email);
    
    if (existingUser) {
      setUser(existingUser);
      localStorage.setItem('cinehub_user', JSON.stringify(existingUser));
      return true;
    }
    
    return false;
  };

  const register = async (email: string, password: string, name: string, role: 'admin' | 'user'): Promise<boolean> => {
    // This will be replaced with actual API call to Spring Boot backend
    const users = JSON.parse(localStorage.getItem('cinehub_users') || '[]');
    
    if (users.find((u: User) => u.email === email)) {
      return false; // User already exists
    }

    const newUser: User = {
      id: Date.now().toString(),
      email,
      name,
      role,
    };

    users.push(newUser);
    localStorage.setItem('cinehub_users', JSON.stringify(users));
    setUser(newUser);
    localStorage.setItem('cinehub_user', JSON.stringify(newUser));
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('cinehub_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
