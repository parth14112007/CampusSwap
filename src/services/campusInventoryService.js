/**
 * Campus Inventory & Lab Locations Service (Supabase Connected with Fallback)
 * 
 * Provides campus laboratory directories, university-owned gear availability,
 * stylized map coordinates, and persistent notification subscriptions.
 */

import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { CAMPUS_LOCATIONS, CAMPUS_RESOURCES } from '../data/mockData';
import { Models } from '../types';

const STORAGE_CAMPUS_RESOURCES_KEY = 'campusswap_campus_resources_data';
const STORAGE_INVENTORY_WATCHES_KEY = 'campusswap_inventory_watches';

function getStoredMockResources() {
  try {
    const raw = localStorage.getItem(STORAGE_CAMPUS_RESOURCES_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_CAMPUS_RESOURCES_KEY, JSON.stringify(CAMPUS_RESOURCES));
      return CAMPUS_RESOURCES;
    }
    return JSON.parse(raw);
  } catch {
    return CAMPUS_RESOURCES;
  }
}

function saveStoredMockResources(resources) {
  try {
    localStorage.setItem(STORAGE_CAMPUS_RESOURCES_KEY, JSON.stringify(resources));
  } catch (e) {
    console.error('Failed to save campus resources to storage', e);
  }
}

function getStoredMockWatches() {
  try {
    const raw = localStorage.getItem(STORAGE_INVENTORY_WATCHES_KEY);
    return raw ? JSON.parse(raw) : ['res-013', 'res-017'];
  } catch {
    return ['res-013', 'res-017'];
  }
}

function saveStoredMockWatches(watches) {
  try {
    localStorage.setItem(STORAGE_INVENTORY_WATCHES_KEY, JSON.stringify(watches));
  } catch (e) {
    console.error('Failed to save watches to storage', e);
  }
}

function formatDbResource(row) {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    type: row.resource_type || 'equipment',
    condition: row.condition || 'Calibrated / Verified',
    availability: row.availability || 'AVAILABLE',
    totalStock: row.total_stock || 1,
    availableStock: row.available_stock || 1,
    building: row.location?.building_name || 'Academic Block B',
    room: row.location?.room_number || 'Lab 2',
    locationId: row.location_id,
    campusZone: row.location?.wing || 'North Wing',
    distanceText: row.distance_text || row.location?.distance_text || '2 mins walk',
    distanceMeters: row.distance_meters || row.location?.distance_meters || 120,
    provider: row.provider || (row.profiles ? `${row.profiles.full_name} (${row.profiles.department})` : 'Electronics Lab 2'),
    description: row.description || '',
    specs: row.specifications || [],
    image: row.image_url,
    rating: row.rating ? Number(row.rating) : 4.9,
    isVerified: row.is_verified ?? true,
    linkedListingId: row.linked_listing_id,
    createdAt: row.created_at
  };
}

function formatDbLocation(row, allResources = []) {
  const locResources = allResources.filter((r) => r.location_id === row.id || r.locationId === row.id);
  const availableCount = locResources.filter((r) => r.availability === 'AVAILABLE' || r.availability === 'LIMITED').length;

  return {
    id: row.id,
    name: row.name,
    buildingName: row.building_name,
    room: row.room_number,
    wing: row.wing,
    zoneType: row.zone_type,
    distanceText: row.distance_text,
    distanceMeters: row.distance_meters,
    coords: row.map_coords || { x: 50, y: 50 },
    description: row.description,
    tags: row.tags || [],
    icon: row.icon || 'science',
    totalResources: locResources.length,
    availableResources: availableCount,
    sampleTags: row.tags || []
  };
}

export const campusInventoryService = {
  /**
   * Get all registered campus lab and workshop locations
   */
  async getLocations() {
    if (isSupabaseConfigured && supabase) {
      try {
        const [{ data: locData, error: locErr }, { data: resData }] = await Promise.all([
          supabase.from('campus_locations').select('*'),
          supabase.from('campus_resources').select('id, location_id, availability')
        ]);

        if (!locErr && locData && locData.length > 0) {
          return locData.map((loc) => formatDbLocation(loc, resData || []));
        }
      } catch (err) {
        console.warn('Supabase locations fetch error, using local dataset', err);
      }
    }

    await new Promise((res) => setTimeout(res, 40));
    const resources = getStoredMockResources();

    return CAMPUS_LOCATIONS.map((loc) => {
      const locResources = resources.filter(
        (r) => r.locationId === loc.id || (r.building && r.building.toLowerCase().includes(loc.buildingName.toLowerCase()))
      );
      const availableCount = locResources.filter((r) => r.availability === 'AVAILABLE' || r.availability === 'LIMITED').length;

      return {
        ...loc,
        totalResources: locResources.length,
        availableResources: availableCount,
        sampleTags: loc.tags || []
      };
    });
  },

  /**
   * Get dynamic campus overview statistics
   */
  async getCampusStatistics() {
    if (isSupabaseConfigured && supabase) {
      try {
        const [{ data: resData }, { data: locData }] = await Promise.all([
          supabase.from('campus_resources').select('total_stock, available_stock, availability'),
          supabase.from('campus_locations').select('id')
        ]);

        if (resData && resData.length > 0) {
          const totalResources = resData.reduce((acc, r) => acc + (r.total_stock || 1), 0);
          const availableNow = resData.reduce((acc, r) => acc + (r.availability === 'AVAILABLE' ? (r.available_stock || 1) : 0), 0);
          const activeListings = resData.filter((r) => r.availability === 'AVAILABLE' || r.availability === 'LIMITED').length;

          return {
            totalResources,
            availableNow,
            totalLocations: locData?.length || 9,
            activeListings
          };
        }
      } catch (e) {
        console.warn('Using local fallback for campus stats', e);
      }
    }

    const resources = getStoredMockResources();
    const totalResources = resources.reduce((acc, r) => acc + (r.totalStock || 1), 0);
    const availableNow = resources.reduce((acc, r) => acc + (r.availability === 'AVAILABLE' ? (r.availableStock || 1) : 0), 0);
    const totalLocations = CAMPUS_LOCATIONS.length;
    const activeListings = resources.filter((r) => r.availability === 'AVAILABLE' || r.availability === 'LIMITED').length;

    return {
      totalResources: totalResources || 128,
      availableNow: availableNow || 84,
      totalLocations: totalLocations || 9,
      activeListings: activeListings || 67
    };
  },

  /**
   * Get campus resources with multi-criteria search, filters, and proximity sorting
   */
  async getResources({
    search = '',
    category = 'all',
    availability = 'ALL',
    locationId = 'all',
    type = 'All',
    sortBy = 'nearest'
  } = {}) {
    if (isSupabaseConfigured && supabase) {
      try {
        let query = supabase
          .from('campus_resources')
          .select('*, location:location_id(*), profiles:owner_id(*)');

        if (category !== 'all') {
          query = query.eq('category', category);
        }

        if (availability !== 'ALL') {
          query = query.eq('availability', availability);
        }

        if (locationId !== 'all') {
          query = query.eq('location_id', locationId);
        }

        if (type !== 'All') {
          query = query.eq('resource_type', type);
        }

        const { data, error } = await query;

        if (!error && data && data.length > 0) {
          let list = data.map(formatDbResource);

          if (search.trim()) {
            const q = search.toLowerCase();
            list = list.filter(
              (r) =>
                r.name.toLowerCase().includes(q) ||
                r.category.toLowerCase().includes(q) ||
                r.building.toLowerCase().includes(q) ||
                r.room.toLowerCase().includes(q) ||
                r.provider.toLowerCase().includes(q) ||
                r.description.toLowerCase().includes(q)
            );
          }

          return list.sort((a, b) => {
            switch (sortBy) {
              case 'nearest':
                return (a.distanceMeters || 100) - (b.distanceMeters || 100);
              case 'recently_available':
                return (b.availability === 'AVAILABLE' ? 1 : 0) - (a.availability === 'AVAILABLE' ? 1 : 0);
              case 'rating':
                return (b.rating || 0) - (a.rating || 0);
              case 'most_resources':
                return (b.availableStock || 0) - (a.availableStock || 0);
              case 'alphabetical':
                return a.name.localeCompare(b.name);
              default:
                return (a.distanceMeters || 100) - (b.distanceMeters || 100);
            }
          });
        }
      } catch (err) {
        console.warn('Supabase resources fetch error, falling back to local dataset', err);
      }
    }

    // Local / Offline Fallback
    await new Promise((res) => setTimeout(res, 50));
    const resources = getStoredMockResources();

    const filtered = resources.filter((resItem) => {
      const q = search.trim().toLowerCase();
      const matchSearch =
        !q ||
        resItem.name.toLowerCase().includes(q) ||
        (resItem.category && resItem.category.toLowerCase().includes(q)) ||
        (resItem.building && resItem.building.toLowerCase().includes(q)) ||
        (resItem.room && resItem.room.toLowerCase().includes(q)) ||
        (resItem.provider && resItem.provider.toLowerCase().includes(q)) ||
        (resItem.description && resItem.description.toLowerCase().includes(q)) ||
        (resItem.specs && resItem.specs.some((s) => s.label.toLowerCase().includes(q) || s.value.toLowerCase().includes(q)));

      const matchCategory =
        category === 'all' || (resItem.category && resItem.category.toLowerCase() === category.toLowerCase());

      const matchAvailability =
        availability === 'ALL' || resItem.availability === availability;

      const matchLocation =
        locationId === 'all' || resItem.locationId === locationId;

      const matchType =
        type === 'All' || (resItem.type && resItem.type.toLowerCase() === type.toLowerCase());

      return matchSearch && matchCategory && matchAvailability && matchLocation && matchType;
    });

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'nearest':
          return (a.distanceMeters || 100) - (b.distanceMeters || 100);
        case 'recently_available':
          return (b.availability === 'AVAILABLE' ? 1 : 0) - (a.availability === 'AVAILABLE' ? 1 : 0);
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        case 'most_resources':
          return (b.availableStock || 0) - (a.availableStock || 0);
        case 'alphabetical':
          return a.name.localeCompare(b.name);
        default:
          return (a.distanceMeters || 100) - (b.distanceMeters || 100);
      }
    });
  },

  /**
   * Get single campus resource by ID
   */
  async getResourceById(id) {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('campus_resources')
        .select('*, location:location_id(*), profiles:owner_id(*)')
        .eq('id', id)
        .single();

      if (!error && data) {
        return formatDbResource(data);
      }
    }

    const resources = getStoredMockResources();
    return resources.find((r) => r.id === id) || null;
  },

  /**
   * Add a new student or lab contributed campus resource
   */
  async addCampusResource(resourceData, currentUser) {
    if (isSupabaseConfigured && supabase) {
      const dbPayload = {
        id: `res-${Date.now()}`,
        owner_id: currentUser?.id,
        location_id: resourceData.locationId || 'loc-main-ee',
        name: resourceData.name,
        category: resourceData.category || 'Electronics',
        resource_type: resourceData.type || 'equipment',
        condition: resourceData.condition || 'Calibrated / Verified',
        availability: resourceData.availability || 'AVAILABLE',
        total_stock: Number(resourceData.totalStock) || 1,
        available_stock: Number(resourceData.totalStock) || 1,
        provider: resourceData.provider || `${currentUser?.name || 'Student'} (Lab Contributor)`,
        description: resourceData.description || '',
        specifications: resourceData.specs || [],
        image_url: resourceData.image || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=400&q=80',
        distance_text: '2 mins walk',
        distance_meters: 100,
        is_verified: true
      };

      const { data, error } = await supabase
        .from('campus_resources')
        .insert(dbPayload)
        .select('*, location:location_id(*), profiles:owner_id(*)')
        .single();

      if (!error && data) {
        return formatDbResource(data);
      }
    }

    // Local fallback
    const resources = getStoredMockResources();
    const locationObj = CAMPUS_LOCATIONS.find((l) => l.id === resourceData.locationId) || CAMPUS_LOCATIONS[0];

    const newResource = Models.createCampusResource({
      ...resourceData,
      id: `res-${Date.now()}`,
      building: locationObj.buildingName,
      campusZone: locationObj.wing || 'Academic Zone',
      provider: resourceData.provider || `${currentUser?.name || 'Student'} (Lab Contributor)`,
      isVerified: true,
      createdAt: new Date().toISOString()
    });

    resources.unshift(newResource);
    saveStoredMockResources(resources);
    return newResource;
  },

  /**
   * Update resource availability
   */
  async updateAvailability(resourceId, newAvailability) {
    if (isSupabaseConfigured && supabase) {
      await supabase
        .from('campus_resources')
        .update({ availability: newAvailability, updated_at: new Date().toISOString() })
        .eq('id', resourceId);
    }
    const resources = getStoredMockResources();
    const updated = resources.map((r) => (r.id === resourceId ? { ...r, availability: newAvailability } : r));
    saveStoredMockResources(updated);
    return newAvailability;
  },

  /**
   * Toggle a "Notify me when available" alert for an unavailable resource
   */
  async toggleAvailabilityWatch(resourceId, userId = 'user-001') {
    if (isSupabaseConfigured && supabase && userId) {
      const { data: existing } = await supabase
        .from('resource_notifications')
        .select('id')
        .eq('user_id', userId)
        .eq('resource_id', resourceId)
        .maybeSingle();

      if (existing) {
        await supabase.from('resource_notifications').delete().eq('id', existing.id);
        return false; // unsubscribed
      } else {
        await supabase.from('resource_notifications').insert({
          user_id: userId,
          resource_id: resourceId,
          status: 'active'
        });
        return true; // subscribed
      }
    }

    // Local fallback
    const watches = getStoredMockWatches();
    const isSubscribed = watches.includes(resourceId);

    let updated;
    if (isSubscribed) {
      updated = watches.filter((id) => id !== resourceId);
    } else {
      updated = [...watches, resourceId];
    }

    saveStoredMockWatches(updated);
    return !isSubscribed;
  },

  /**
   * Get watched resource IDs for user
   */
  async getWatchedResources(userId = 'user-001') {
    if (isSupabaseConfigured && supabase && userId) {
      const { data, error } = await supabase
        .from('resource_notifications')
        .select('resource_id')
        .eq('user_id', userId);

      if (!error && data) {
        return data.map((n) => n.resource_id);
      }
    }
    return getStoredMockWatches();
  },

  isWatchingItem(resourceId) {
    const watches = getStoredMockWatches();
    return watches.includes(resourceId);
  }
};
