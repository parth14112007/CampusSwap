/**
 * User Profile & Trust Metrics Service (Supabase Connected with Fallback)
 * 
 * Manages student profiles, avatars, escrow balances, ratings, and verified badges.
 */

import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { CURRENT_USER } from '../data/mockData';

const STORAGE_PROFILE_KEY = 'campusswap_profile_data';

function getStoredProfile() {
  try {
    const raw = localStorage.getItem(STORAGE_PROFILE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_PROFILE_KEY, JSON.stringify(CURRENT_USER));
      return CURRENT_USER;
    }
    return JSON.parse(raw);
  } catch {
    return CURRENT_USER;
  }
}

function saveStoredProfile(profile) {
  try {
    localStorage.setItem(STORAGE_PROFILE_KEY, JSON.stringify(profile));
  } catch (e) {
    console.error('Failed to save profile', e);
  }
}

export const profileService = {
  /**
   * Get current user profile details
   */
  async getProfile(userId = 'user-001') {
    if (isSupabaseConfigured && supabase && userId) {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();

        if (!error && data) {
          return {
            id: data.id,
            name: data.full_name,
            email: data.email,
            dept: data.department,
            year: data.year,
            campus: data.campus,
            avatar: data.avatar_url,
            trustScore: Number(data.trust_score || 4.9),
            totalSwaps: data.total_swaps || 0,
            escrowWallet: {
              available: Number(data.escrow_balance || 450),
              heldInEscrow: 0
            }
          };
        }
      } catch (err) {
        console.warn('Supabase profile get error', err);
      }
    }

    await new Promise((res) => setTimeout(res, 50));
    return getStoredProfile();
  },

  /**
   * Update profile information
   */
  async updateProfile(userId, updates) {
    if (isSupabaseConfigured && supabase && userId && userId.includes('-') && userId.length > 30) {
      try {
        const dbUpdates = {};
        if (updates.name) dbUpdates.full_name = updates.name;
        if (updates.dept) dbUpdates.department = updates.dept;
        if (updates.year) dbUpdates.year = updates.year;
        if (updates.avatar || updates.avatar_url) dbUpdates.avatar_url = updates.avatar || updates.avatar_url;
        if (updates.phone) dbUpdates.phone = updates.phone;

        await supabase
          .from('profiles')
          .update({ ...dbUpdates, updated_at: new Date().toISOString() })
          .eq('id', userId);
      } catch (e) {
        console.warn('Supabase updateProfile error', e);
      }
    }

    const current = getStoredProfile();
    const updated = { ...current, ...updates };
    saveStoredProfile(updated);
    return updated;
  },

  /**
   * Update escrow wallet balance
   */
  async adjustEscrowWallet(amountDelta, heldDelta = 0) {
    const current = getStoredProfile();
    const updated = {
      ...current,
      escrowWallet: {
        ...current.escrowWallet,
        available: current.escrowWallet.available + amountDelta,
        heldInEscrow: Math.max(0, current.escrowWallet.heldInEscrow + heldDelta)
      }
    };
    saveStoredProfile(updated);
    return updated.escrowWallet;
  }
};
