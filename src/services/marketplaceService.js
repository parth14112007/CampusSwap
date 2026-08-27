/**
 * Marketplace Service (Supabase Connected with Local Fallback)
 * 
 * Provides listing querying, joins with student profiles, multi-criteria filtering,
 * search, sorting, and CRUD actions.
 */

import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { INITIAL_ITEMS, CATEGORIES, TRANSACTION_TYPES, CONDITIONS, SORT_OPTIONS } from '../data/mockData';
import { Models } from '../types';

const STORAGE_LISTINGS_KEY = 'campusswap_listings_data';
const STORAGE_FAVORITES_KEY = 'campusswap_saved_item_ids';

function getStoredMockListings() {
  try {
    const raw = localStorage.getItem(STORAGE_LISTINGS_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_LISTINGS_KEY, JSON.stringify(INITIAL_ITEMS));
      return INITIAL_ITEMS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_ITEMS;
  }
}

function saveStoredMockListings(items) {
  try {
    localStorage.setItem(STORAGE_LISTINGS_KEY, JSON.stringify(items));
  } catch (e) {
    console.error('Failed to save mock listings', e);
  }
}

function formatDbListing(row) {
  return {
    id: row.id,
    ownerId: row.owner_id,
    title: row.title,
    description: row.description,
    category: row.category,
    type: row.listing_type,
    price: Number(row.price),
    priceUnit: row.price_unit || '',
    deposit: Number(row.deposit || 0),
    condition: row.condition,
    location: row.location,
    available: row.available ?? true,
    featured: row.featured ?? false,
    image: row.image_url,
    specs: row.specs || [],
    tags: row.tags || [],
    createdAt: row.created_at,
    owner: {
      id: row.profiles?.id || row.owner_id,
      name: row.profiles?.full_name || 'Student Engineer',
      dept: row.profiles?.department || 'Engineering',
      year: row.profiles?.year || '3rd Year',
      campus: row.profiles?.college || 'K. K. Wagh Institute of Engineering Education & Research',
      rating: row.profiles?.trust_score ? Number(row.profiles.trust_score) : 4.9,
      swapsCount: row.profiles?.total_swaps || 18,
      avatar: row.profiles?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
      verified: row.profiles?.is_verified ?? true
    }
  };
}

export const marketplaceService = {
  /**
   * Fetch marketplace listings with multi-criteria filters & sorting
   */
  async getListings({
    search = '',
    category = 'all',
    type = 'All',
    condition = 'All',
    minPrice = 0,
    maxPrice = Infinity,
    availableOnly = false,
    location = '',
    sortBy = 'featured'
  } = {}) {
    if (isSupabaseConfigured && supabase) {
      try {
        let query = supabase
          .from('listings')
          .select('*, profiles:owner_id(id, full_name, department, year, college, avatar_url, trust_score, total_swaps, is_verified)');

        if (category !== 'all') {
          query = query.eq('category', category);
        }

        if (type !== 'All') {
          query = query.eq('listing_type', type);
        }

        if (condition !== 'All') {
          query = query.eq('condition', condition);
        }

        if (availableOnly) {
          query = query.eq('available', true);
        }

        if (minPrice > 0) {
          query = query.gte('price', minPrice);
        }

        if (maxPrice < Infinity) {
          query = query.lte('price', maxPrice);
        }

        if (sortBy === 'price_asc') {
          query = query.order('price', { ascending: true });
        } else if (sortBy === 'price_desc') {
          query = query.order('price', { ascending: false });
        } else if (sortBy === 'newest') {
          query = query.order('created_at', { ascending: false });
        }

        const { data, error } = await query;

        if (!error && data && data.length > 0) {
          let results = data.map(formatDbListing);

          // In-memory text search fallback for flexible spec filtering
          if (search.trim()) {
            const q = search.toLowerCase();
            results = results.filter(
              (item) =>
                item.title.toLowerCase().includes(q) ||
                item.description.toLowerCase().includes(q) ||
                item.category.toLowerCase().includes(q) ||
                item.location.toLowerCase().includes(q)
            );
          }

          if (location.trim()) {
            results = results.filter((i) => i.location.toLowerCase().includes(location.toLowerCase()));
          }

          return results;
        }
      } catch (err) {
        console.warn('Supabase listing fetch encountered an issue, falling back to local dataset', err);
      }
    }

    // Local / Offline Development Fallback
    await new Promise((res) => setTimeout(res, 50));
    const items = getStoredMockListings();

    const filtered = items.filter((item) => {
      const q = search.trim().toLowerCase();
      const matchSearch =
        !q ||
        item.title.toLowerCase().includes(q) ||
        (item.description && item.description.toLowerCase().includes(q)) ||
        (item.category && item.category.toLowerCase().includes(q)) ||
        (item.location && item.location.toLowerCase().includes(q)) ||
        (item.specs && item.specs.some((s) => s.label.toLowerCase().includes(q) || s.value.toLowerCase().includes(q)));

      const matchCategory =
        category === 'all' || (item.category && item.category.toLowerCase() === category.toLowerCase());

      const matchType =
        type === 'All' || (item.type && item.type.toLowerCase() === type.toLowerCase());

      const matchCondition =
        condition === 'All' || (item.condition && item.condition.toLowerCase() === condition.toLowerCase());

      const itemPrice = Number(item.price) || 0;
      const matchPrice = itemPrice >= (Number(minPrice) || 0) && itemPrice <= (Number(maxPrice) || Infinity);

      const matchAvailability = !availableOnly || item.available === true;

      const matchLoc = !location || (item.location && item.location.toLowerCase().includes(location.toLowerCase()));

      return (
        matchSearch &&
        matchCategory &&
        matchType &&
        matchCondition &&
        matchPrice &&
        matchAvailability &&
        matchLoc
      );
    });

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price_asc':
          return (a.price || 0) - (b.price || 0);
        case 'price_desc':
          return (b.price || 0) - (a.price || 0);
        case 'rating':
          return (b.owner?.rating || 0) - (a.owner?.rating || 0);
        case 'newest':
          return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        case 'featured':
        default:
          return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
      }
    });
  },

  /**
   * Get listing by unique ID
   */
  async getListingById(id) {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('listings')
        .select('*, profiles:owner_id(*)')
        .eq('id', id)
        .single();

      if (!error && data) {
        return formatDbListing(data);
      }
    }

    const items = getStoredMockListings();
    return items.find((item) => item.id === id) || null;
  },

  /**
   * Create and publish a new hardware listing
   */
  async createListing(listingData, currentUser) {
    if (isSupabaseConfigured && supabase && currentUser?.id) {
      const dbPayload = {
        owner_id: currentUser.id,
        title: listingData.title,
        description: listingData.description,
        category: listingData.category,
        listing_type: listingData.type || 'Buy',
        price: Number(listingData.price) || 0,
        price_unit: listingData.priceUnit || '',
        deposit: Number(listingData.deposit || 0),
        condition: listingData.condition || 'Good',
        location: listingData.location || 'Main Campus',
        image_url: listingData.image || 'https://images.unsplash.com/photo-1553406830-ef2513450d76?auto=format&fit=crop&w=400&q=80',
        specs: listingData.specs || [],
        tags: listingData.tags || [],
        available: true,
        featured: false
      };

      const { data, error } = await supabase
        .from('listings')
        .insert(dbPayload)
        .select('*, profiles:owner_id(*)')
        .single();

      if (!error && data) {
        return formatDbListing(data);
      }
    }

    // Development fallback
    const items = getStoredMockListings();
    const newListing = Models.createListing({
      ...listingData,
      id: `item-${Date.now()}`,
      ownerId: currentUser?.id || 'user-001',
      owner: {
        name: currentUser?.name || 'Arjun Sharma',
        year: currentUser?.year || '3rd Year',
        dept: currentUser?.dept || 'Robotics & Automation',
        rating: currentUser?.trustScore || 4.9,
        swapsCount: currentUser?.totalSwaps || 18,
        avatar: currentUser?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
        verified: true
      },
      createdAt: new Date().toISOString()
    });

    items.unshift(newListing);
    saveStoredMockListings(items);
    return newListing;
  },

  /**
   * Update an existing listing
   */
  async updateListing(id, updatedData) {
    if (isSupabaseConfigured && supabase) {
      const dbPayload = {
        title: updatedData.title,
        description: updatedData.description,
        price: updatedData.price !== undefined ? Number(updatedData.price) : undefined,
        price_unit: updatedData.priceUnit,
        deposit: updatedData.deposit !== undefined ? Number(updatedData.deposit) : undefined,
        location: updatedData.location,
        condition: updatedData.condition,
        category: updatedData.category,
        available: updatedData.available,
        updated_at: new Date().toISOString()
      };

      // Clean undefined keys
      Object.keys(dbPayload).forEach((k) => dbPayload[k] === undefined && delete dbPayload[k]);

      const { data, error } = await supabase
        .from('listings')
        .update(dbPayload)
        .eq('id', id)
        .select('*, profiles:owner_id(*)')
        .single();

      if (!error && data) {
        return formatDbListing(data);
      }
    }

    const items = getStoredMockListings();
    const updated = items.map((item) => (item.id === id ? { ...item, ...updatedData } : item));
    saveStoredMockListings(updated);
    return updated.find((i) => i.id === id);
  },

  /**
   * Delete a listing
   */
  async deleteListing(id) {
    if (isSupabaseConfigured && supabase) {
      await supabase.from('listings').delete().eq('id', id);
    }
    const items = getStoredMockListings();
    const filtered = items.filter((item) => item.id !== id);
    saveStoredMockListings(filtered);
    return true;
  },

  /**
   * Toggle listing availability
   */
  async toggleListingAvailability(id) {
    const item = await this.getListingById(id);
    const newAvail = !(item?.available ?? true);
    await this.updateListing(id, { available: newAvail });
    return newAvail;
  },

  /**
   * Favorites Management (Supabase + localStorage fallback)
   */
  async getFavorites(userId) {
    if (isSupabaseConfigured && supabase && userId) {
      const { data, error } = await supabase
        .from('favorites')
        .select('listing_id')
        .eq('user_id', userId);

      if (!error && data) {
        return data.map((f) => f.listing_id);
      }
    }

    try {
      const raw = localStorage.getItem(STORAGE_FAVORITES_KEY);
      return raw ? JSON.parse(raw) : ['item-rpi-4', 'item-arduino-uno'];
    } catch {
      return ['item-rpi-4', 'item-arduino-uno'];
    }
  },

  async toggleFavorite(userId, listingId) {
    if (isSupabaseConfigured && supabase && userId) {
      const { data: existing } = await supabase
        .from('favorites')
        .select('id')
        .eq('user_id', userId)
        .eq('listing_id', listingId)
        .maybeSingle();

      if (existing) {
        await supabase.from('favorites').delete().eq('id', existing.id);
        return false;
      } else {
        await supabase.from('favorites').insert({ user_id: userId, listing_id: listingId });
        return true;
      }
    }

    // Local fallback
    const raw = localStorage.getItem(STORAGE_FAVORITES_KEY);
    const list = raw ? JSON.parse(raw) : [];
    let isFav = false;
    let updated = [];
    if (list.includes(listingId)) {
      updated = list.filter((id) => id !== listingId);
      isFav = false;
    } else {
      updated = [...list, listingId];
      isFav = true;
    }
    localStorage.setItem(STORAGE_FAVORITES_KEY, JSON.stringify(updated));
    return isFav;
  },

  getCategories() {
    return CATEGORIES;
  },

  getTransactionTypes() {
    return TRANSACTION_TYPES;
  },

  getConditions() {
    return CONDITIONS;
  },

  getSortOptions() {
    return SORT_OPTIONS;
  }
};

