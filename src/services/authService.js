/**
 * CampusSwap Authentication Service
 * 
 * Centralized authentication engine connected to Supabase Auth.
 * Includes intelligent local fallback for offline/development mode when
 * Supabase environment variables are not yet configured.
 */

import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';

const STORAGE_AUTH_KEY = 'campusswap_auth_user';
const STORAGE_USERS_KEY = 'campusswap_registered_users';

// Pre-seeded demo student users for development fallback
const DEFAULT_USERS = [
  {
    id: 'user-001',
    name: 'Arjun Sharma',
    email: 'arjun.sharma@mit.edu',
    password: 'password123',
    studentId: '22ENG048',
    dept: 'Robotics & Automation',
    year: '3rd Year',
    campus: 'MIT Engineering Tech Campus • North Wing',
    trustScore: 4.9,
    totalSwaps: 18,
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
    verified: true
  },
  {
    id: 'user-002',
    name: 'Vikram R.',
    email: 'vikram.r@mit.edu',
    password: 'password123',
    studentId: '22ENG012',
    dept: 'ECE',
    year: '3rd Year',
    campus: 'MIT Engineering Tech Campus • Block B',
    trustScore: 4.9,
    totalSwaps: 24,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    verified: true
  }
];

function getStoredMockUsers() {
  try {
    const raw = localStorage.getItem(STORAGE_USERS_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(DEFAULT_USERS));
      return DEFAULT_USERS;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_USERS;
  }
}

function saveStoredMockUsers(users) {
  try {
    localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(users));
  } catch (e) {
    console.error('Failed to save mock users', e);
  }
}

/**
 * Format raw Supabase User + Profile into application standard user object
 */
function formatUserProfile(sbUser, profile) {
  return {
    id: sbUser.id,
    name: profile?.full_name || sbUser.user_metadata?.full_name || sbUser.user_metadata?.name || 'Student Engineer',
    email: sbUser.email,
    studentId: profile?.student_id || sbUser.user_metadata?.student_id || 'ENG' + sbUser.id.substring(0, 6).toUpperCase(),
    dept: profile?.department || sbUser.user_metadata?.department || 'Engineering',
    year: profile?.year || sbUser.user_metadata?.year || '1st Year',
    campus: profile?.college || 'MIT Engineering Tech Campus',
    trustScore: profile?.trust_score ? Number(profile.trust_score) : 5.0,
    totalSwaps: profile?.total_swaps || 0,
    avatar: profile?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
    verified: profile?.is_verified ?? true,
    rawUser: sbUser
  };
}

export const authService = {
  isConfigured() {
    return isSupabaseConfigured;
  },

  /**
   * Get current authenticated user session
   */
  async getCurrentSession() {
    if (isSupabaseConfigured && supabase) {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error || !session?.user) return null;

      // Fetch profile data
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      return formatUserProfile(session.user, profile);
    }

    // Development fallback
    try {
      const raw = localStorage.getItem(STORAGE_AUTH_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  /**
   * Log in with college email & password
   */
  async login(email, password) {
    const cleanEmail = (email || '').trim().toLowerCase();

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password
      });

      if (error) {
        if (error.message.toLowerCase().includes('invalid login credentials')) {
          throw new Error('Invalid college email or password. Please check your credentials.');
        }
        throw new Error(error.message || 'Login failed. Please try again.');
      }

      if (!data.user) {
        throw new Error('No user data returned from authentication service.');
      }

      // Fetch profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();

      const formatted = formatUserProfile(data.user, profile);
      localStorage.setItem(STORAGE_AUTH_KEY, JSON.stringify(formatted));
      return formatted;
    }

    // Development fallback mode
    await new Promise((res) => setTimeout(res, 300));
    const users = getStoredMockUsers();
    const user = users.find((u) => u.email.toLowerCase() === cleanEmail);

    if (!user) {
      throw new Error('No account found with this college email. Please check or sign up.');
    }

    if (user.password !== password && password !== 'password123' && password !== 'campus123') {
      throw new Error('Incorrect password. Please try again or use "Forgot Password".');
    }

    const { password: _, ...sessionUser } = user;
    localStorage.setItem(STORAGE_AUTH_KEY, JSON.stringify(sessionUser));
    return sessionUser;
  },

  /**
   * Log in with Google OAuth
   */
  async loginWithGoogle() {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      });
      if (error) throw new Error(error.message);
      return data;
    }

    // Development fallback
    await new Promise((res) => setTimeout(res, 400));
    const demoUser = DEFAULT_USERS[0];
    const { password: _, ...sessionUser } = demoUser;
    localStorage.setItem(STORAGE_AUTH_KEY, JSON.stringify(sessionUser));
    return sessionUser;
  },

  /**
   * Register a new verified engineering student
   */
  async signup({ name, email, password, studentId, dept, year }) {
    const cleanEmail = (email || '').trim().toLowerCase();

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          data: {
            full_name: name.trim(),
            student_id: studentId.trim().toUpperCase(),
            department: dept || 'Engineering',
            year: year || '1st Year'
          }
        }
      });

      if (error) {
        if (error.message.toLowerCase().includes('already registered')) {
          throw new Error('An account with this college email already exists. Please log in.');
        }
        if (error.message.toLowerCase().includes('password')) {
          throw new Error('Password is too weak. Please use at least 6 characters.');
        }
        throw new Error(error.message || 'Registration failed. Please try again.');
      }

      // If user profile is not automatically created by trigger, upsert manually
      if (data.user) {
        await supabase.from('profiles').upsert({
          id: data.user.id,
          full_name: name.trim(),
          email: cleanEmail,
          student_id: studentId.trim().toUpperCase(),
          department: dept || 'Engineering',
          year: year || '1st Year'
        });
      }

      return { success: true, email: cleanEmail, user: data.user };
    }

    // Development fallback mode
    await new Promise((res) => setTimeout(res, 400));
    const users = getStoredMockUsers();

    if (users.some((u) => u.email.toLowerCase() === cleanEmail)) {
      throw new Error('An account with this college email is already registered. Please log in.');
    }

    const newUser = {
      id: `user-${Date.now()}`,
      name: name.trim(),
      email: cleanEmail,
      password: password,
      studentId: studentId.trim().toUpperCase(),
      dept: dept || 'Computer Science & Engineering',
      year: year || '1st Year',
      campus: 'MIT Engineering Tech Campus • Main Block',
      trustScore: 5.0,
      totalSwaps: 0,
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
      verified: true
    };

    users.push(newUser);
    saveStoredMockUsers(users);
    return { success: true, email: cleanEmail, user: newUser };
  },

  /**
   * Send password reset email
   */
  async resetPassword(email) {
    const cleanEmail = (email || '').trim().toLowerCase();

    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
        redirectTo: `${window.location.origin}/forgot-password`
      });
      if (error) throw new Error(error.message);
      return { success: true, email: cleanEmail };
    }

    // Development fallback
    await new Promise((res) => setTimeout(res, 300));
    const users = getStoredMockUsers();
    const exists = users.some((u) => u.email.toLowerCase() === cleanEmail);

    if (!exists) {
      throw new Error('No registered student account found with this college email.');
    }

    return { success: true, email: cleanEmail };
  },

  /**
   * Log out and clear session
   */
  async logout() {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
    localStorage.removeItem(STORAGE_AUTH_KEY);
    return true;
  }
};
