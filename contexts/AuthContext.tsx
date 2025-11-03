import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '../services/supabaseClient';
import { setBackendAuthToken } from '../services/backendClient';

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  isAuthenticating: boolean;
  isEnabled: boolean;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const noop = async () => {
  throw new Error('Supabase client is not configured.');
};

const defaultValue: AuthContextValue = {
  user: null,
  session: null,
  isAuthenticating: false,
  isEnabled: false,
  signInWithEmail: noop,
  signUpWithEmail: noop,
  signOut: noop,
};

const AuthContext = createContext<AuthContextValue>(defaultValue);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(Boolean(supabase));

  useEffect(() => {
    let mounted = true;
    const client = supabase;

    if (!client) {
      setIsAuthenticating(false);
      setBackendAuthToken(null);
      return () => {
        mounted = false;
      };
    }

    client.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session ?? null);
      setBackendAuthToken(data.session?.access_token ?? null);
      setIsAuthenticating(false);
    });

    const { data } = client.auth.onAuthStateChange((_event, newSession) => {
      if (!mounted) return;
      setSession(newSession ?? null);
      setBackendAuthToken(newSession?.access_token ?? null);
    });

    return () => {
      mounted = false;
      data.subscription.unsubscribe();
    };
  }, []);

  const value = useMemo<AuthContextValue>(() => {
    const client = supabase;
    if (!client) {
      return defaultValue;
    }

    const signInWithEmail = async (email: string, password: string) => {
      const { error } = await client.auth.signInWithPassword({ email, password });
      if (error) throw error;
    };

    const signUpWithEmail = async (email: string, password: string) => {
      const { error } = await client.auth.signUp({ email, password });
      if (error) throw error;
    };

    const signOut = async () => {
      const { error } = await client.auth.signOut();
      if (error) throw error;
    };

    return {
      user: session?.user ?? null,
      session,
      isAuthenticating,
      isEnabled: true,
      signInWithEmail,
      signUpWithEmail,
      signOut,
    };
  }, [isAuthenticating, session, supabase]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
