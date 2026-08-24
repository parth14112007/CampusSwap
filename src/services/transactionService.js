/**
 * Transaction History Service (Supabase Connected with Fallback)
 * 
 * Manages user exchange records across Purchases, Sales, Rentals, Borrows, and SOS exchanges.
 */

import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';

const STORAGE_TRANSACTIONS_KEY = 'campusswap_transactions_data';

const INITIAL_TRANSACTIONS = [
  {
    id: "tx-101",
    title: "Arduino Uno R3 & 37 Sensor Kit",
    type: "RENTAL",
    amount: 150,
    deposit: 300,
    otherPartyName: "Priya Patel",
    otherPartyRole: "Borrower",
    date: "2026-08-23",
    status: "Active",
    handoverStatus: "Handover Verified",
    rating: null,
    image: "https://images.unsplash.com/photo-1608555855762-2b657eb1c348?auto=format&fit=crop&w=300&q=80"
  },
  {
    id: "tx-102",
    title: "ESP32 NodeMCU Wi-Fi Module",
    type: "SOS",
    amount: 0,
    deposit: 0,
    otherPartyName: "Rohan Verma",
    otherPartyRole: "Lender",
    date: "2026-08-22",
    status: "Completed",
    handoverStatus: "Handover Verified",
    rating: 5,
    image: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=300&q=80"
  },
  {
    id: "tx-103",
    title: "Tektronix 100MHz Digital Oscilloscope",
    type: "BORROW",
    amount: 0,
    deposit: 0,
    otherPartyName: "Electronics & Circuitry Lab 2",
    otherPartyRole: "Lab Assistant",
    date: "2026-08-20",
    status: "Returned",
    handoverStatus: "Handover Verified",
    rating: 5,
    image: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=300&q=80"
  },
  {
    id: "tx-104",
    title: "NEMA 17 High-Torque Stepper Motor",
    type: "SALE",
    amount: 320,
    deposit: 0,
    otherPartyName: "Sneha Reddy",
    otherPartyRole: "Buyer",
    date: "2026-08-18",
    status: "Completed",
    handoverStatus: "Handover Verified",
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=300&q=80"
  }
];

function getStoredMockTransactions() {
  try {
    const raw = localStorage.getItem(STORAGE_TRANSACTIONS_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_TRANSACTIONS_KEY, JSON.stringify(INITIAL_TRANSACTIONS));
      return INITIAL_TRANSACTIONS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_TRANSACTIONS;
  }
}

function saveStoredMockTransactions(list) {
  try {
    localStorage.setItem(STORAGE_TRANSACTIONS_KEY, JSON.stringify(list));
  } catch (e) {
    console.error('Failed to save transactions data', e);
  }
}

function formatDbTransaction(row, currentUserId) {
  const isBuyer = currentUserId && row.buyer_id === currentUserId;
  const otherParty = isBuyer ? row.seller : row.buyer;
  const otherPartyRole = isBuyer
    ? (row.transaction_type === 'Rent' || row.transaction_type === 'Borrow' ? 'Lender' : 'Seller')
    : (row.transaction_type === 'Rent' || row.transaction_type === 'Borrow' ? 'Borrower' : 'Buyer');

  return {
    id: row.id,
    title: row.item_title,
    type: row.transaction_type ? row.transaction_type.toUpperCase() : 'BUY',
    amount: Number(row.amount || 0),
    deposit: Number(row.deposit_amount || 0),
    otherPartyName: otherParty?.full_name || 'Campus Student',
    otherPartyRole: otherPartyRole,
    date: row.created_at ? row.created_at.split('T')[0] : 'Today',
    status: row.status ? row.status.charAt(0).toUpperCase() + row.status.slice(1) : 'Pending',
    handoverStatus: row.handover_status || 'Handover Verified',
    rating: row.rating_score ? Number(row.rating_score) : null,
    image: row.item_image || 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=300&q=80',
    buyerId: row.buyer_id,
    sellerId: row.seller_id,
    createdAt: row.created_at
  };
}

export const transactionService = {
  /**
   * Get all transactions with optional type filter
   */
  async getTransactions({ type = 'all', userId } = {}) {
    if (isSupabaseConfigured && supabase) {
      try {
        let query = supabase
          .from('transactions')
          .select('*, buyer:buyer_id(*), seller:seller_id(*)');

        if (userId) {
          query = query.or(`buyer_id.eq.${userId},seller_id.eq.${userId}`);
        }

        if (type !== 'all') {
          query = query.ilike('transaction_type', type);
        }

        const { data, error } = await query;

        if (!error && data && data.length > 0) {
          return data.map((t) => formatDbTransaction(t, userId));
        }
      } catch (e) {
        console.warn('Supabase transaction fetch error, using local fallback', e);
      }
    }

    await new Promise((res) => setTimeout(res, 50));
    const list = getStoredMockTransactions();
    if (type === 'all') return list;
    return list.filter((t) => t.type.toLowerCase() === type.toLowerCase());
  },

  /**
   * Add a new transaction record
   */
  async addTransaction(txData) {
    if (isSupabaseConfigured && supabase && txData.buyerId && txData.sellerId) {
      const dbPayload = {
        listing_id: txData.listingId || null,
        request_id: txData.requestId || null,
        buyer_id: txData.buyerId,
        seller_id: txData.sellerId,
        transaction_type: txData.type || 'Buy',
        item_title: txData.title,
        item_image: txData.image,
        amount: Number(txData.amount) || 0,
        deposit_amount: Number(txData.deposit) || 0,
        status: txData.status || 'handover_pending',
        handover_status: txData.handoverStatus || 'Pending QR Handover'
      };

      const { data: created, error } = await supabase
        .from('transactions')
        .insert(dbPayload)
        .select('*, buyer:buyer_id(*), seller:seller_id(*)')
        .single();

      if (!error && created) {
        return formatDbTransaction(created, txData.buyerId);
      }
    }

    const list = getStoredMockTransactions();
    const newTx = {
      id: `tx-${Date.now()}`,
      title: txData.title,
      type: txData.type || 'RENTAL',
      amount: txData.amount || 0,
      deposit: txData.deposit || 0,
      otherPartyName: txData.otherPartyName || 'Campus Student',
      otherPartyRole: txData.otherPartyRole || 'Peer',
      date: new Date().toISOString().split('T')[0],
      status: txData.status || 'Active',
      handoverStatus: txData.handoverStatus || 'Handover Verified',
      rating: null,
      image: txData.image || 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=300&q=80'
    };

    list.unshift(newTx);
    saveStoredMockTransactions(list);
    return newTx;
  },

  /**
   * Update transaction lifecycle state
   */
  async updateStatus(id, newStatus, handoverStatus = 'Handover Verified') {
    if (isSupabaseConfigured && supabase) {
      await supabase
        .from('transactions')
        .update({
          status: newStatus,
          handover_status: handoverStatus,
          updated_at: new Date().toISOString(),
          completed_at: newStatus === 'completed' ? new Date().toISOString() : null
        })
        .eq('id', id);
    }
    const list = getStoredMockTransactions();
    const index = list.findIndex((t) => t.id === id);
    if (index !== -1) {
      list[index].status = newStatus;
      list[index].handoverStatus = handoverStatus;
      saveStoredMockTransactions(list);
    }
  },

  /**
   * Update transaction rating
   */
  async updateRating(id, rating) {
    if (isSupabaseConfigured && supabase) {
      await supabase
        .from('transactions')
        .update({
          is_rated: true,
          rating_score: rating,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);
    }
    const list = getStoredMockTransactions();
    const index = list.findIndex((t) => t.id === id);
    if (index !== -1) {
      list[index].rating = rating;
      saveStoredMockTransactions(list);
    }
    return list;
  }
};
