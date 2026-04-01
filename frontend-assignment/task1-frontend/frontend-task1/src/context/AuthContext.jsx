import React, { createContext, useState } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // Sync state with localStorage immediately
  const [user, setUser] = useState(() => {
    const token = localStorage.getItem('access');
    const username = localStorage.getItem('username');
    return token ? { isAuthenticated: true, username } : null;
  });

  const login = (data) => {
    localStorage.setItem('access', data.access);
    localStorage.setItem('refresh', data.refresh);
    localStorage.setItem('username', data.username || 'User');
    setUser({ isAuthenticated: true, username: data.username || 'User' });
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