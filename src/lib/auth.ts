import { supabase } from './supabase';
import { User, Session, AuthError } from '@supabase/supabase-js';

export interface AuthResponse {
  user: User | null;
  session: Session | null;
  error: AuthError | null;
}

export const auth = {
  // Registreer nieuwe gebruiker
  signUp: async (email: string, password: string): Promise<AuthResponse> => {
    if (!supabase) {
      return {
        user: null,
        session: null,
        error: { message: 'Supabase not configured', status: 500 } as AuthError,
      };
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/verify`,
      },
    });

    return {
      user: data.user,
      session: data.session,
      error,
    };
  },

  // Log in met bestaande gebruiker
  signIn: async (email: string, password: string): Promise<AuthResponse> => {
    if (!supabase) {
      return {
        user: null,
        session: null,
        error: { message: 'Supabase not configured', status: 500 } as AuthError,
      };
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    return {
      user: data.user,
      session: data.session,
      error,
    };
  },

  // Log uit
  signOut: async (): Promise<{ error: AuthError | null }> => {
    if (!supabase) {
      return {
        error: { message: 'Supabase not configured', status: 500 } as AuthError,
      };
    }

    const { error } = await supabase.auth.signOut();
    return { error };
  },

  // Haal huidige sessie op
  getSession: async (): Promise<Session | null> => {
    if (!supabase) return null;

    const { data } = await supabase.auth.getSession();
    return data.session;
  },

  // Haal huidige gebruiker op
  getUser: async (): Promise<User | null> => {
    if (!supabase) return null;

    const { data } = await supabase.auth.getUser();
    return data.user;
  },

  // Luister naar auth state changes
  onAuthStateChange: (callback: (event: string, session: Session | null) => void) => {
    if (!supabase) return { data: { subscription: null }, error: null };

    return supabase.auth.onAuthStateChange((event, session) => {
      callback(event, session);
    });
  },

  // Verifieer email met token
  verifyEmail: async (token: string): Promise<{ error: AuthError | null }> => {
    if (!supabase) {
      return {
        error: { message: 'Supabase not configured', status: 500 } as AuthError,
      };
    }

    // Supabase verwerkt email verificatie automatisch via de redirect URL
    // Deze functie kan gebruikt worden voor extra verificatie logica
    return { error: null };
  },
};

