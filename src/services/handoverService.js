/**
 * QR Handover Service (Supabase Connected with Fallback)
 * 
 * Manages physical exchange verification between student lenders and borrowers
 * with simulated QR verification tokens, dual-party confirmation, and safety checks.
 */

import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { transactionService } from './transactionService';

const STORAGE_HANDOVER_KEY = 'campusswap_handover_sessions';

const INITIAL_HANDOVERS = [
  {
    id: "handover-demo-001",
    transactionId: "tx-101",
    itemTitle: "Arduino Uno R3 & Sensor Kit",
    quantity: 1,
    ownerId: "user-001",
    ownerName: "Arjun Sharma",
    borrowerId: "user-002",
    borrowerName: "Priya Patel",
    qrCodeToken: "CAMPUS_SWAP_AUTH_8941_VERIFY",
    status: "QR_GENERATED",
    location: "Academic Block B Courtyard",
    safetyReminderConfirmed: true,
    createdAt: new Date().toISOString()
  }
];

function getStoredHandovers() {
  try {
    const raw = localStorage.getItem(STORAGE_HANDOVER_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_HANDOVER_KEY, JSON.stringify(INITIAL_HANDOVERS));
      return INITIAL_HANDOVERS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_HANDOVERS;
  }
}

function saveStoredHandovers(list) {
  try {
    localStorage.setItem(STORAGE_HANDOVER_KEY, JSON.stringify(list));
  } catch (e) {
    console.error('Failed to save handover data', e);
  }
}

function formatDbHandover(row) {
  const tx = row.transaction;
  return {
    id: row.id,
    transactionId: row.transaction_id,
    itemTitle: tx?.item_title || 'Hardware Component',
    quantity: 1,
    ownerId: tx?.seller_id,
    ownerName: tx?.seller?.full_name || 'Lender',
    borrowerId: tx?.buyer_id,
    borrowerName: tx?.buyer?.full_name || 'Borrower',
    qrCodeToken: row.verification_code,
    status: row.status.toUpperCase(),
    location: 'Academic Block B Courtyard',
    safetyReminderConfirmed: true,
    createdAt: row.created_at,
    verifiedAt: row.verified_at,
    completedAt: row.completed_at
  };
}

export const handoverService = {
  /**
   * Create a new handover session
   */
  async createSession({
    transactionId = `tx-${Date.now()}`,
    itemTitle = 'Hardware Component',
    quantity = 1,
    ownerId = 'user-001',
    ownerName = 'Arjun Sharma',
    borrowerId = 'user-002',
    borrowerName = 'Priya Patel',
    location = 'Academic Block B'
  } = {}) {
    const token = `CAMPUS_SWAP_TOKEN_${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    if (isSupabaseConfigured && supabase && transactionId.includes('-') && transactionId.length > 30) {
      try {
        const { data: created, error } = await supabase
          .from('handovers')
          .insert({
            transaction_id: transactionId,
            initiated_by: ownerId,
            status: 'qr_generated',
            verification_code: token
          })
          .select('*, transaction:transaction_id(*, buyer:buyer_id(*), seller:seller_id(*))')
          .single();

        if (!error && created) {
          return formatDbHandover(created);
        }
      } catch (err) {
        console.warn('Supabase handover creation error, using local fallback', err);
      }
    }

    const list = getStoredHandovers();
    const newSession = {
      id: `handover-${Date.now()}`,
      transactionId,
      itemTitle,
      quantity,
      ownerId,
      ownerName,
      borrowerId,
      borrowerName,
      qrCodeToken: token,
      status: 'QR_GENERATED',
      location,
      safetyReminderConfirmed: true,
      createdAt: new Date().toISOString()
    };

    list.unshift(newSession);
    saveStoredHandovers(list);
    return newSession;
  },

  /**
   * Get session by ID
   */
  async getSession(id) {
    if (isSupabaseConfigured && supabase && id.includes('-') && id.length > 30) {
      try {
        const { data, error } = await supabase
          .from('handovers')
          .select('*, transaction:transaction_id(*, buyer:buyer_id(*), seller:seller_id(*))')
          .eq('id', id)
          .single();

        if (!error && data) {
          return formatDbHandover(data);
        }
      } catch (e) {
        console.warn('Supabase handover fetch error, fallback to local', e);
      }
    }

    const list = getStoredHandovers();
    return list.find((s) => s.id === id || s.transactionId === id) || null;
  },

  /**
   * Simulate QR verification scan
   */
  async verifyHandover(id, { verifiedByRole = 'Borrower' } = {}) {
    await new Promise((res) => setTimeout(res, 400));

    if (isSupabaseConfigured && supabase && id.includes('-') && id.length > 30) {
      try {
        const { data: updatedHandover } = await supabase
          .from('handovers')
          .update({
            status: 'completed',
            verified_by_role: verifiedByRole,
            verified_at: new Date().toISOString(),
            completed_at: new Date().toISOString()
          })
          .eq('id', id)
          .select('*, transaction:transaction_id(*, buyer:buyer_id(*), seller:seller_id(*))')
          .single();

        if (updatedHandover) {
          if (updatedHandover.transaction_id) {
            await transactionService.updateStatus(updatedHandover.transaction_id, 'completed', 'Handover Verified');
          }
          return formatDbHandover(updatedHandover);
        }
      } catch (err) {
        console.warn('Supabase handover verification update error', err);
      }
    }

    const list = getStoredHandovers();
    const index = list.findIndex((s) => s.id === id);
    if (index === -1) return null;

    const session = list[index];
    session.status = 'COMPLETED';
    session.completedAt = new Date().toISOString();
    session.verifiedBy = verifiedByRole;

    saveStoredHandovers(list);

    // Synchronize linked transaction status
    if (session.transactionId) {
      await transactionService.updateStatus(session.transactionId, 'completed', 'Handover Verified');
    }

    return session;
  }
};
