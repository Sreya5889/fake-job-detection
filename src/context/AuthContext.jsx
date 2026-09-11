import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  loginUser,
  loginDemo as apiLoginDemo,
  registerUser,
  logoutUser,
  getCurrentUser,
  updateProfile as apiUpdateProfile
} from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  // Initialize session on mount
  useEffect(() => {
    async function loadUser() {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        try {
          const currentUser = await getCurrentUser();
          if (currentUser && (currentUser.id || currentUser.email)) {
            setUser(currentUser);
            setToken(storedToken);
          } else {
            localStorage.removeItem('token');
            setUser(null);
            setToken(null);
          }
        } catch (err) {
          console.warn('Session expired or authentication failed:', err.message);
          localStorage.removeItem('token');
          setUser(null);
          setToken(null);
        }
      } else {
        setUser(null);
        setToken(null);
      }
      setLoading(false);
    }

    loadUser();
  }, []);

  const handleLogin = async (email, password) => {
    const res = await loginUser(email, password);
    const authData = res?.data || res;
    if (authData?.user && authData?.token) {
      setUser(authData.user);
      setToken(authData.token);
      localStorage.setItem('token', authData.token);
    }
    return authData;
  };

  const handleLoginDemo = async () => {
    const res = await apiLoginDemo();
    const authData = res?.data || res;
    if (authData?.user && authData?.token) {
      setUser(authData.user);
      setToken(authData.token);
      localStorage.setItem('token', authData.token);
    }
    return authData;
  };

  const handleRegister = async (userData) => {
    const res = await registerUser(userData);
    const authData = res?.data || res;
    if (authData?.user && authData?.token) {
      setUser(authData.user);
      setToken(authData.token);
      localStorage.setItem('token', authData.token);
    }
    return authData;
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch {
      // Ignore network error on logout
    }
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
  };

  const handleUpdateProfile = async (updatedFields) => {
    const res = await apiUpdateProfile(updatedFields);
    const updatedUser = res?.data || res;
    setUser((prev) => ({ ...prev, ...updatedUser }));
    return updatedUser;
  };

  const value = {
    user,
    token,
    isAuthenticated: Boolean(user && token),
    loading,
    login: handleLogin,
    loginDemo: handleLoginDemo,
    register: handleRegister,
    logout: handleLogout,
    updateProfile: handleUpdateProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
