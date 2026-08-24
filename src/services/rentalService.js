/**
 * Rental & Escrow Service (Supabase Connected with Fallback)
 * 
 * Manages active rentals, escrow security deposits, QR code verification steps,
 * and transaction timelines.
 */

import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { INITIAL_ACTIVE_RENTALS } from '../data/mockData';

const STORAGE_RENTALS_KEY = 'campusswap_rentals_data';

function getStoredMockRentals() {
  try {
    const raw = localStorage.getItem(STORAGE_RENTALS_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_RENTALS_KEY, JSON.stringify(INITIAL_ACTIVE_RENTALS));
      return INITIAL_ACTIVE_RENTALS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_ACTIVE_RENTALS;
  }
}

function saveStoredMockRentals(rentals) {
  try {
    localStorage.setItem(STORAGE_RENTALS_KEY, JSON.stringify(rentals));
  } catch (e) {
    console.error('Failed to save rentals to storage', e);
  }
}

function formatDbRental(row) {
  return {
    id: row.id,
    itemId: row.listing_id,
    itemTitle: row.item_title,
    itemImage: row.item_image,
    ownerName: row.lender?.full_name || 'Lender',
    ownerYear: row.lender?.year || '3rd Year',
    ownerDept: row.lender?.department || 'Engineering',
    ownerAvatar: row.lender?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    dailyRate: Number(row.daily_rate),
    deposit: Number(row.deposit_held),
    startDate: row.start_date,
    dueDate: row.due_date,
    daysRemaining: row.days_remaining || 4,
    progressPercent: row.progress_percent || 10,
    statusText: row.status === 'completed' ? 'COMPLETED & REFUNDED' : `RETURN IN ${row.days_remaining || 4} DAYS`,
    statusBadge: row.status === 'completed' ? 'Completed' : 'Active',
    status: row.status,
    escrowProtected: true,
    escrowStatus: row.escrow_status || 'held',
    qrCode: row.qr_code,
    timeline: row.timeline || [],
    createdAt: row.created_at
  };
}

export const rentalService = {
  /**
   * Fetch all rentals for the current user
   */
  async getActiveRentals(userId) {
    if (isSupabaseConfigured && supabase) {
      try {
        let query = supabase
          .from('rentals')
          .select('*, lender:lender_id(id, full_name, department, year, avatar_url), renter:renter_id(id, full_name)');

        if (userId) {
          query = query.or(`renter_id.eq.${userId},lender_id.eq.${userId}`);
        }

        const { data, error } = await query;

        if (!error && data && data.length > 0) {
          return data.map(formatDbRental);
        }
      } catch (e) {
        console.warn('Supabase rental fetch encountered an issue, falling back to local dataset', e);
      }
    }

    await new Promise((res) => setTimeout(res, 50));
    return getStoredMockRentals();
  },

  /**
   * Get specific rental by ID
   */
  async getRentalById(id) {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('rentals')
        .select('*, lender:lender_id(*), renter:renter_id(*)')
        .eq('id', id)
        .single();

      if (!error && data) {
        return formatDbRental(data);
      }
    }

    const rentals = getStoredMockRentals();
    return rentals.find((r) => r.id === id) || null;
  },

  /**
   * Create a new active rental with escrow hold
   */
  async createRental(item, days = 4, renterId) {
    const deposit = item.deposit || 0;
    const dailyRate = item.price || 0;
    const totalCost = deposit + (dailyRate * days);

    const initialTimeline = [
      { id: 1, title: 'Payment secured', time: 'Just now', status: 'completed' },
      { id: 2, title: 'Handover verification', time: 'Scan QR with lender', status: 'active' },
      { id: 3, title: 'Rental active', time: `In progress (${days} days)`, status: 'pending' },
      { id: 4, title: 'Return verification', time: 'Pending return scan', status: 'pending' },
      { id: 5, title: 'Deposit released', time: `₹${deposit} refunded to Escrow wallet`, status: 'pending' }
    ];

    if (isSupabaseConfigured && supabase && renterId && item.ownerId) {
      const dbPayload = {
        listing_id: item.id.includes('-') && item.id.length > 30 ? item.id : null,
        renter_id: renterId,
        lender_id: item.ownerId,
        item_title: item.title,
        item_image: item.image,
        daily_rate: dailyRate,
        deposit_held: deposit,
        total_cost: totalCost,
        start_date: 'Today',
        due_date: `In ${days} days`,
        days_remaining: days,
        progress_percent: 10,
        status: 'active',
        escrow_status: 'held',
        qr_code: `CAMPUS_SWAP_${item.id}_${Math.floor(10000 + Math.random() * 90000)}`,
        timeline: initialTimeline
      };

      const { data: created, error } = await supabase
        .from('rentals')
        .insert(dbPayload)
        .select('*, lender:lender_id(*), renter:renter_id(*)')
        .single();

      if (!error && created) {
        return formatDbRental(created);
      }
    }

    // Fallback
    const newRental = {
      id: `rent-${Date.now()}`,
      itemId: item.id,
      itemTitle: item.title,
      itemImage: item.image,
      ownerName: item.owner?.name || 'Lender',
      ownerYear: item.owner?.year || '3rd Year',
      ownerDept: item.owner?.dept || 'Engineering',
      ownerAvatar: item.owner?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      dailyRate: dailyRate,
      deposit: deposit,
      startDate: 'Today',
      dueDate: `In ${days} days`,
      daysRemaining: days,
      progressPercent: 10,
      statusText: `RETURN IN ${days} DAYS`,
      statusBadge: 'Active',
      status: 'active',
      escrowProtected: true,
      escrowStatus: 'held',
      qrCode: `CAMPUS_SWAP_${item.id}_${Math.floor(10000 + Math.random() * 90000)}`,
      timeline: initialTimeline,
      createdAt: new Date().toISOString()
    };

    const rentals = getStoredMockRentals();
    rentals.unshift(newRental);
    saveStoredMockRentals(rentals);
    return newRental;
  },

  /**
   * Advance rental progression step
   */
  async advanceRentalStep(rentalId) {
    const rentals = getStoredMockRentals();
    const current = rentals.find((r) => r.id === rentalId);
    if (!current) return null;

    const currentActiveIdx = current.timeline.findIndex((t) => t.status === 'active');
    if (currentActiveIdx === -1 || currentActiveIdx >= current.timeline.length - 1) {
      return current;
    }

    const newTimeline = current.timeline.map((t, idx) => {
      if (idx <= currentActiveIdx) return { ...t, status: 'completed' };
      if (idx === currentActiveIdx + 1) return { ...t, status: 'active' };
      return t;
    });

    const isFinished = currentActiveIdx + 1 === current.timeline.length - 1;
    const progressPercent = isFinished ? 100 : Math.min(100, current.progressPercent + 25);
    const status = isFinished ? 'completed' : 'active';
    const escrowStatus = isFinished ? 'refunded' : 'held';

    if (isSupabaseConfigured && supabase) {
      await supabase
        .from('rentals')
        .update({
          timeline: newTimeline,
          progress_percent: progressPercent,
          status,
          escrow_status: escrowStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', rentalId);
    }

    const updated = {
      ...current,
      timeline: newTimeline,
      statusText: isFinished ? 'COMPLETED & REFUNDED' : current.statusText,
      statusBadge: isFinished ? 'Completed' : current.statusBadge,
      status,
      escrowStatus,
      progressPercent
    };

    const updatedRentals = rentals.map((r) => (r.id === rentalId ? updated : r));
    saveStoredMockRentals(updatedRentals);
    return updated;
  }
};
