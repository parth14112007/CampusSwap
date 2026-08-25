import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize session on mount
  useEffect(() => {
    let subscription = null;

    const initializeAuth = async () => {
      try {
        if (isSupabaseConfigured && supabase) {
          // Get current active session
          const { data: { session: activeSession } } = await supabase.auth.getSession();
          setSession(activeSession);

          if (activeSession?.user) {
            const profile = await authService.getCurrentSession();
            setUser(profile);
          } else {
            setUser(null);
          }

          // Listen for auth state changes
          const { data } = supabase.auth.onAuthStateChange(async (event, newSession) => {
            setSession(newSession);
            if (newSession?.user) {
              const updatedProfile = await authService.getCurrentSession();
              setUser(updatedProfile);
            } else if (event === 'SIGNED_OUT') {
              setUser(null);
            }
          });

          subscription = data.subscription;
        } else {
          // Fallback local storage session
          const activeUser = await authService.getCurrentSession();
          setUser(activeUser);
        }
      } catch (e) {
        console.error('Failed to initialize auth state', e);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    return () => {
      if (subscription) subscription.unsubscribe();
    };
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const loggedUser = await authService.login(email, password);
      setUser(loggedUser);
      return loggedUser;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (userData) => {
    setLoading(true);
    try {
      return await authService.signup(userData);
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email) => {
    return await authService.resetPassword(email);
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
    setSession(null);
  };

  const value = {
    user,
    session,
    isAuthenticated: Boolean(user),
    loading,
    isSupabaseConfigured,
    login,
    signup,
    logout,
    resetPassword
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
