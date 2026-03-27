import React, { createContext, useState } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // Sync state with localStorage immediately
  const [user, setUser] = useState(() => {
    const token = localStorage.getItem('access');
    return token ? { isAuthenticated: true } : null;
  });

  const login = (data) => {
    localStorage.setItem('access', data.access);
    localStorage.setItem('refresh', data.refresh);
    setUser({ isAuthenticated: true });
  };

  const logout = () => {
    localStorage.clear();
    setUser(null);
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};