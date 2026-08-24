/**
 * Student Component Requests Service (Supabase Connected with Fallback)
 * 
 * Manages student requests for components, matching with peer listings or lab inventory,
 * owner acceptance/rejection, and automated transaction creation.
 */

import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { STUDENT_REQUESTS } from '../data/mockData';
import { transactionService } from './transactionService';
import { rentalService } from './rentalService';

const STORAGE_REQUESTS_KEY = 'campusswap_student_requests';

function getStoredMockRequests() {
  try {
    const raw = localStorage.getItem(STORAGE_REQUESTS_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_REQUESTS_KEY, JSON.stringify(STUDENT_REQUESTS));
      return STUDENT_REQUESTS;
    }
    return JSON.parse(raw);
  } catch {
    return STUDENT_REQUESTS;
  }
}

function saveStoredMockRequests(requests) {
  try {
    localStorage.setItem(STORAGE_REQUESTS_KEY, JSON.stringify(requests));
  } catch (e) {
    console.error('Failed to save student requests to storage', e);
  }
}

function formatDbRequest(row) {
  return {
    id: row.id,
    listingId: row.listing_id,
    title: row.title,
    description: row.description,
    category: row.category,
    requestType: row.request_type || 'Buy',
    urgency: row.urgency || 'MEDIUM',
    maxBudget: Number(row.max_budget || 0),
    neededByDate: row.needed_by_date || 'Soon',
    campusLocation: row.campus_location || 'Main Campus',
    status: row.status || 'pending',
    requesterId: row.requester_id,
    ownerId: row.owner_id,
    requester: {
      name: row.profiles?.full_name || 'Student Engineer',
      year: `${row.profiles?.year || '3rd Year'} ${row.profiles?.department || 'Engineering'}`,
      avatar: row.profiles?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80'
    },
    createdAt: row.created_at
  };
}

export const requestService = {
  /**
   * Get all active student component requests
   */
  async getRequests({ category = 'all', search = '', userId } = {}) {
    if (isSupabaseConfigured && supabase) {
      try {
        let query = supabase
          .from('listing_requests')
          .select('*, profiles:requester_id(*)');

        if (category !== 'all') {
          query = query.eq('category', category);
        }

        if (userId) {
          query = query.or(`requester_id.eq.${userId},owner_id.eq.${userId}`);
        }

        const { data, error } = await query;

        if (!error && data && data.length > 0) {
          let list = data.map(formatDbRequest);
          if (search.trim()) {
            const q = search.toLowerCase();
            list = list.filter(
              (r) =>
                r.title.toLowerCase().includes(q) ||
                r.description.toLowerCase().includes(q)
            );
          }
          return list;
        }
      } catch (e) {
        console.warn('Supabase request fetch error, falling back to local dataset', e);
      }
    }

    await new Promise((res) => setTimeout(res, 50));
    const requests = getStoredMockRequests();
    return requests.filter((r) => {
      const matchCat = category === 'all' || r.category.toLowerCase() === category.toLowerCase();
      const matchSearch =
        !search ||
        r.title.toLowerCase().includes(search.toLowerCase()) ||
        r.description.toLowerCase().includes(search.toLowerCase());
      return matchCat && matchSearch;
    });
  },

  /**
   * Post a new student hardware request
   */
  async createRequest(data, currentUser) {
    if (isSupabaseConfigured && supabase && currentUser?.id) {
      const dbPayload = {
        listing_id: data.listingId || null,
        requester_id: currentUser.id,
        owner_id: data.ownerId || null,
        title: data.title,
        description: data.description,
        category: data.category || 'Microcontrollers',
        request_type: data.requestType || 'Buy',
        urgency: data.urgency || 'MEDIUM',
        max_budget: Number(data.maxBudget) || 0,
        needed_by_date: data.neededByDate || 'Soon',
        campus_location: data.campusLocation || 'Main Campus',
        status: 'pending'
      };

      const { data: created, error } = await supabase
        .from('listing_requests')
        .insert(dbPayload)
        .select('*, profiles:requester_id(*)')
        .single();

      if (!error && created) {
        return formatDbRequest(created);
      }
    }

    // Fallback
    const requests = getStoredMockRequests();
    const newReq = {
      id: `req-${Date.now()}`,
      listingId: data.listingId,
      title: data.title,
      description: data.description,
      category: data.category || 'Microcontrollers',
      requestType: data.requestType || 'Buy',
      urgency: data.urgency || 'MEDIUM',
      maxBudget: Number(data.maxBudget) || 0,
      neededByDate: data.neededByDate || 'Soon',
      campusLocation: data.campusLocation || 'Main Campus',
      status: 'pending',
      requesterId: currentUser?.id || 'user-001',
      ownerId: data.ownerId,
      requester: {
        name: currentUser?.name || 'Student',
        year: `${currentUser?.year || '3rd Year'} ${currentUser?.dept || 'Engineering'}`,
        avatar: currentUser?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80'
      },
      createdAt: new Date().toISOString()
    };

    requests.unshift(newReq);
    saveStoredMockRequests(requests);
    return newReq;
  },

  /**
   * Owner accepts request -> triggers transaction creation
   */
  async acceptRequest(requestId, currentUser) {
    if (isSupabaseConfigured && supabase) {
      const { data: reqData } = await supabase
        .from('listing_requests')
        .update({ status: 'accepted', updated_at: new Date().toISOString() })
        .eq('id', requestId)
        .select('*, profiles:requester_id(*)')
        .single();

      if (reqData) {
        // Automatically create associated transaction
        await transactionService.addTransaction({
          requestId: reqData.id,
          listingId: reqData.listing_id,
          buyerId: reqData.requester_id,
          sellerId: currentUser?.id || reqData.owner_id,
          title: reqData.title,
          type: reqData.request_type ? reqData.request_type.toUpperCase() : 'BUY',
          amount: Number(reqData.max_budget) || 0,
          otherPartyName: reqData.profiles?.full_name || 'Student Requester',
          status: 'handover_pending',
          handoverStatus: 'Pending QR Handover'
        });
      }
    }

    const requests = getStoredMockRequests();
    const updated = requests.map((r) => (r.id === requestId ? { ...r, status: 'accepted' } : r));
    saveStoredMockRequests(updated);
    return updated.find((r) => r.id === requestId);
  },

  /**
   * Owner rejects request
   */
  async rejectRequest(requestId) {
    if (isSupabaseConfigured && supabase) {
      await supabase
        .from('listing_requests')
        .update({ status: 'rejected', updated_at: new Date().toISOString() })
        .eq('id', requestId);
    }
    const requests = getStoredMockRequests();
    const updated = requests.map((r) => (r.id === requestId ? { ...r, status: 'rejected' } : r));
    saveStoredMockRequests(updated);
    return updated.find((r) => r.id === requestId);
  },

  /**
   * Requester cancels request
   */
  async cancelRequest(requestId) {
    if (isSupabaseConfigured && supabase) {
      await supabase
        .from('listing_requests')
        .update({ status: 'cancelled', updated_at: new Date().toISOString() })
        .eq('id', requestId);
    }
    const requests = getStoredMockRequests();
    const updated = requests.map((r) => (r.id === requestId ? { ...r, status: 'cancelled' } : r));
    saveStoredMockRequests(updated);
    return updated.find((r) => r.id === requestId);
  },

  /**
   * Fulfill or offer component for a request (legacy compatibility)
   */
  async matchRequest(requestId) {
    return this.acceptRequest(requestId);
  }
};
