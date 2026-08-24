/**
 * SOS Emergency Service (Supabase Connected with Fallback)
 * 
 * Manages academic hardware emergency requests, multi-factor campus matching,
 * peer resource offers, status history, and in-app alert notifications.
 */

import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { INITIAL_ITEMS, CAMPUS_RESOURCES } from '../data/mockData';
import { handoverService } from './handoverService';
import { notificationService } from './notificationService';

const STORAGE_SOS_KEY = 'campusswap_sos_requests_data';

const INITIAL_SOS_REQUESTS = [
  {
    id: "sos-101",
    requesterId: "user-002",
    componentName: "ESP32 NodeMCU Wi-Fi + BLE",
    quantity: 1,
    projectContext: "IoT Sensor Gateway Lab Viva Demo starting in 45 minutes",
    urgency: "URGENT",
    requiredBy: "Within 1 Hour",
    preferredLocation: "Electronics Lab (Block B - 204)",
    budget: 100,
    additionalSpecs: "Need 30-pin version with working micro-USB port",
    status: "ACTIVE",
    requester: {
      id: "user-002",
      name: "Priya Patel",
      dept: "ECE",
      year: "3rd Year",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80",
      rating: 4.8
    },
    createdAt: new Date(Date.now() - 35 * 60 * 1000).toISOString()
  },
  {
    id: "sos-102",
    requesterId: "user-003",
    componentName: "NEMA 17 Stepper Motor",
    quantity: 2,
    projectContext: "3D printer Z-axis repair before robotics project evaluation tomorrow morning",
    urgency: "HIGH",
    requiredBy: "Today by 6 PM",
    preferredLocation: "Robotics Lab / Mech Workshop",
    budget: 250,
    additionalSpecs: "1.8 deg step angle, 4-lead connector included",
    status: "MATCH_FOUND",
    requester: {
      id: "user-003",
      name: "Rohan Verma",
      dept: "Mechanical",
      year: "4th Year",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80",
      rating: 4.9
    },
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "sos-103",
    requesterId: "user-001",
    componentName: "Tektronix 100MHz Digital Oscilloscope",
    quantity: 1,
    projectContext: "Signal waveform debugging for final year capstone circuit submission",
    urgency: "NORMAL",
    requiredBy: "Tomorrow Morning",
    preferredLocation: "Academic Block B",
    budget: 0,
    additionalSpecs: "Need 2x 100MHz probes with ground clips",
    status: "COMPLETED",
    requester: {
      id: "user-001",
      name: "Arjun Sharma",
      dept: "ECE",
      year: "3rd Year",
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80",
      rating: 4.9
    },
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  }
];

function getStoredMockSOS() {
  try {
    const raw = localStorage.getItem(STORAGE_SOS_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_SOS_KEY, JSON.stringify(INITIAL_SOS_REQUESTS));
      return INITIAL_SOS_REQUESTS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_SOS_REQUESTS;
  }
}

function saveStoredMockSOS(list) {
  try {
    localStorage.setItem(STORAGE_SOS_KEY, JSON.stringify(list));
  } catch (e) {
    console.error('Failed to save SOS data', e);
  }
}

function formatDbSOS(row) {
  const isExpired = row.expires_at && new Date(row.expires_at) < new Date() && row.status === 'active';
  const status = isExpired ? 'EXPIRED' : row.status ? row.status.toUpperCase() : 'ACTIVE';

  return {
    id: row.id,
    requesterId: row.requester_id,
    componentName: row.component_name,
    quantity: row.quantity || 1,
    projectContext: row.description || 'Academic lab emergency',
    urgency: row.urgency ? row.urgency.toUpperCase() : 'URGENT',
    requiredBy: row.required_by || 'Within 2 Hours',
    preferredLocation: row.preferred_location || 'Academic Block B',
    budget: Number(row.budget || 0),
    additionalSpecs: row.additional_specs || '',
    status: status,
    offeredResource: row.offered_resource,
    handoverId: row.handover_id,
    requester: {
      id: row.requester_id,
      name: row.profiles?.full_name || 'Student Engineer',
      dept: row.profiles?.department || 'Engineering',
      year: row.profiles?.year || '3rd Year',
      avatar: row.profiles?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
      rating: row.profiles?.trust_score ? Number(row.profiles.trust_score) : 4.9
    },
    createdAt: row.created_at
  };
}

export const sosService = {
  /**
   * Get SOS requests with optional filtering
   */
  async getSOSRequests({ filter = 'all', currentUserId = 'user-001' } = {}) {
    if (isSupabaseConfigured && supabase) {
      try {
        let query = supabase
          .from('sos_requests')
          .select('*, profiles:requester_id(*)');

        if (filter === 'my' && currentUserId) {
          query = query.eq('requester_id', currentUserId);
        } else if (filter === 'completed') {
          query = query.eq('status', 'completed');
        } else if (filter === 'nearby') {
          query = query.in('status', ['active', 'match_found', 'resource_offered']);
        }

        query = query.order('created_at', { ascending: false });

        const { data, error } = await query;

        if (!error && data && data.length > 0) {
          return data.map(formatDbSOS);
        }
      } catch (err) {
        console.warn('Supabase SOS fetch error, using local fallback', err);
      }
    }

    await new Promise((res) => setTimeout(res, 50));
    const list = getStoredMockSOS();

    if (filter === 'my') {
      return list.filter((r) => r.requesterId === currentUserId);
    }
    if (filter === 'nearby') {
      return list.filter((r) => r.status === 'ACTIVE' || r.status === 'MATCH_FOUND' || r.status === 'RESOURCE_OFFERED');
    }
    if (filter === 'completed') {
      return list.filter((r) => r.status === 'COMPLETED');
    }
    return list;
  },

  /**
   * Get single SOS request by ID
   */
  async getSOSById(id) {
    if (isSupabaseConfigured && supabase && id.includes('-') && id.length > 30) {
      try {
        const { data, error } = await supabase
          .from('sos_requests')
          .select('*, profiles:requester_id(*)')
          .eq('id', id)
          .single();

        if (!error && data) {
          return formatDbSOS(data);
        }
      } catch (e) {
        console.warn('Supabase SOS get by ID error', e);
      }
    }

    const list = getStoredMockSOS();
    return list.find((r) => r.id === id) || null;
  },

  /**
   * Find candidate matches across Marketplace and Campus Inventory for an SOS
   */
  findMatchesForSOS(sosRequest) {
    const query = (sosRequest.componentName || '').toLowerCase();
    const matches = [];

    // Check campus resources
    CAMPUS_RESOURCES.forEach((res) => {
      if (res.name.toLowerCase().includes(query) || query.includes(res.name.toLowerCase().split(' ')[0])) {
        matches.push({
          id: res.id,
          title: res.name,
          category: res.category,
          source: 'Campus Lab',
          provider: res.provider,
          location: `${res.building} (${res.room})`,
          distanceText: res.distanceText,
          availability: res.availability,
          rating: res.rating || 4.9,
          price: res.price || 0,
          matchScore: res.availability === 'AVAILABLE' ? 95 : 75,
          image: res.image
        });
      }
    });

    // Check marketplace items
    INITIAL_ITEMS.forEach((item) => {
      if (item.title.toLowerCase().includes(query) || query.includes(item.title.toLowerCase().split(' ')[0])) {
        matches.push({
          id: item.id,
          title: item.title,
          category: item.category,
          source: 'Peer Lender',
          provider: item.owner?.name || 'Student',
          location: item.location,
          distanceText: '150m away',
          availability: item.available !== false ? 'AVAILABLE' : 'UNAVAILABLE',
          rating: item.owner?.rating || 4.8,
          price: item.price,
          matchScore: item.available !== false ? 92 : 60,
          image: item.image
        });
      }
    });

    return matches.sort((a, b) => b.matchScore - a.matchScore);
  },

  /**
   * Create a new SOS Request in Supabase with match generation
   */
  async createSOSRequest({
    componentName,
    quantity = 1,
    projectContext,
    urgency = 'URGENT',
    requiredBy = 'Within 2 Hours',
    preferredLocation = 'Academic Block B',
    budget = 0,
    additionalSpecs = '',
    currentUser = { id: 'user-001', name: 'Arjun Sharma', dept: 'ECE', year: '3rd Year', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80', rating: 4.9 }
  }) {
    let initialStatus = 'active';
    const candidateMatches = this.findMatchesForSOS({ componentName });
    if (candidateMatches.length > 0) {
      initialStatus = 'match_found';
    }

    if (isSupabaseConfigured && supabase && currentUser?.id) {
      try {
        const { data: created, error } = await supabase
          .from('sos_requests')
          .insert({
            requester_id: currentUser.id,
            component_name: componentName,
            quantity: Number(quantity) || 1,
            description: projectContext || 'Academic lab emergency',
            urgency: urgency.toLowerCase(),
            required_by: requiredBy,
            preferred_location: preferredLocation,
            budget: Number(budget) || 0,
            additional_specs: additionalSpecs,
            status: initialStatus
          })
          .select('*, profiles:requester_id(*)')
          .single();

        if (!error && created) {
          // Record status transition
          await supabase.from('sos_status_history').insert({
            sos_request_id: created.id,
            status: initialStatus,
            changed_by: currentUser.id,
            note: 'SOS Request Broadcasted'
          });

          // Persist top matches
          if (candidateMatches.length > 0) {
            const matchPayloads = candidateMatches.slice(0, 4).map((m) => ({
              sos_request_id: created.id,
              match_title: m.title,
              match_source: m.source,
              match_score: m.matchScore,
              status: 'suggested'
            }));
            await supabase.from('sos_matches').insert(matchPayloads);
          }

          // Trigger in-app notification
          await notificationService.sendNotification({
            userId: currentUser.id,
            type: 'sos_alert',
            priority: urgency.toUpperCase() === 'URGENT' ? 'urgent' : 'high',
            title: `Emergency SOS Broadcasted: ${componentName}`,
            message: `Searching ${preferredLocation} and campus labs for immediate hardware matches.`,
            linkUrl: `/sos`,
            relatedEntityType: 'sos_request',
            relatedEntityId: created.id
          });

          return formatDbSOS(created);
        }
      } catch (err) {
        console.warn('Supabase SOS creation error, fallback to local', err);
      }
    }

    const list = getStoredMockSOS();
    const newSOS = {
      id: `sos-${Date.now()}`,
      requesterId: currentUser.id,
      componentName,
      quantity: Number(quantity) || 1,
      projectContext: projectContext || 'Academic lab emergency',
      urgency,
      requiredBy,
      preferredLocation,
      budget: Number(budget) || 0,
      additionalSpecs,
      status: initialStatus.toUpperCase(),
      requester: currentUser,
      createdAt: new Date().toISOString()
    };

    list.unshift(newSOS);
    saveStoredMockSOS(list);

    await notificationService.sendNotification({
      userId: currentUser.id,
      type: 'sos_alert',
      priority: urgency.toUpperCase() === 'URGENT' ? 'urgent' : 'high',
      title: `Emergency SOS Broadcasted: ${componentName}`,
      message: `Searching ${preferredLocation} and campus labs for immediate hardware matches.`,
      linkUrl: `/sos`
    });

    return newSOS;
  },

  /**
   * Peer offers resource to fulfill SOS
   */
  async offerResource(sosId, { offerorName = 'Campus Student', offerorDept = 'ECE', itemNote = 'Working unit ready for pickup', location = 'Academic Block B', offerorId = 'user-002' } = {}) {
    const offeredData = {
      offerorName,
      offerorDept,
      itemNote,
      location,
      offeredAt: new Date().toISOString()
    };

    if (isSupabaseConfigured && supabase && sosId.includes('-') && sosId.length > 30) {
      try {
        const { data: updated } = await supabase
          .from('sos_requests')
          .update({
            status: 'resource_offered',
            offered_resource: offeredData,
            updated_at: new Date().toISOString()
          })
          .eq('id', sosId)
          .select('*, profiles:requester_id(*)')
          .single();

        if (updated) {
          await supabase.from('sos_status_history').insert({
            sos_request_id: sosId,
            status: 'resource_offered',
            changed_by: offerorId,
            note: `${offerorName} offered hardware at ${location}`
          });

          await notificationService.sendNotification({
            userId: updated.requester_id,
            type: 'sos_alert',
            priority: 'urgent',
            title: `Resource Offered for SOS: ${updated.component_name}`,
            message: `${offerorName} offered hardware at ${location}. Accept offer to generate Handover QR.`,
            linkUrl: `/sos`,
            relatedEntityType: 'sos_request',
            relatedEntityId: sosId
          });

          return formatDbSOS(updated);
        }
      } catch (err) {
        console.warn('Supabase SOS offer error', err);
      }
    }

    const list = getStoredMockSOS();
    const index = list.findIndex((r) => r.id === sosId);
    if (index === -1) return null;

    list[index].status = 'RESOURCE_OFFERED';
    list[index].offeredResource = offeredData;
    saveStoredMockSOS(list);

    await notificationService.sendNotification({
      type: 'sos_alert',
      priority: 'urgent',
      title: `Resource Offered for SOS: ${list[index].componentName}`,
      message: `${offerorName} offered hardware at ${location}. Accept offer to generate Handover QR.`,
      linkUrl: `/sos`
    });

    return list[index];
  },

  /**
   * Requester accepts the offered resource
   */
  async acceptOffer(sosId, currentUser) {
    const sosItem = await this.getSOSById(sosId);
    if (!sosItem) return null;

    const handover = await handoverService.createSession({
      transactionId: sosId,
      itemTitle: sosItem.componentName,
      quantity: sosItem.quantity,
      ownerName: sosItem.offeredResource?.offerorName || 'Peer Lender',
      borrowerName: sosItem.requester?.name || 'Requester',
      location: sosItem.preferredLocation
    });

    if (isSupabaseConfigured && supabase && sosId.includes('-') && sosId.length > 30) {
      try {
        await supabase
          .from('sos_requests')
          .update({
            status: 'handover_pending',
            handover_id: handover.id && handover.id.length > 30 ? handover.id : null,
            updated_at: new Date().toISOString()
          })
          .eq('id', sosId);

        await supabase.from('sos_status_history').insert({
          sos_request_id: sosId,
          status: 'handover_pending',
          changed_by: currentUser?.id,
          note: 'Offer accepted, QR handover generated'
        });
      } catch (e) {
        console.warn('Supabase accept offer error', e);
      }
    }

    const list = getStoredMockSOS();
    const index = list.findIndex((r) => r.id === sosId);
    if (index !== -1) {
      list[index].status = 'HANDOVER_PENDING';
      list[index].handoverId = handover.id;
      saveStoredMockSOS(list);
    }

    await notificationService.sendNotification({
      userId: currentUser?.id || 'user-001',
      type: 'sos_alert',
      priority: 'urgent',
      title: `SOS Accepted: QR Handover Pending`,
      message: `Meet at ${sosItem.preferredLocation} and scan QR to verify hardware exchange.`,
      linkUrl: `/handover/${handover.id}`
    });

    return { sos: sosItem, handoverId: handover.id };
  },

  /**
   * Complete SOS
   */
  async completeSOS(sosId) {
    if (isSupabaseConfigured && supabase && sosId.includes('-') && sosId.length > 30) {
      await supabase
        .from('sos_requests')
        .update({ status: 'completed', updated_at: new Date().toISOString() })
        .eq('id', sosId);
    }
    const list = getStoredMockSOS();
    const index = list.findIndex((r) => r.id === sosId);
    if (index !== -1) {
      list[index].status = 'COMPLETED';
      saveStoredMockSOS(list);
      return list[index];
    }
    return null;
  },

  /**
   * Cancel SOS
   */
  async cancelSOS(sosId) {
    if (isSupabaseConfigured && supabase && sosId.includes('-') && sosId.length > 30) {
      await supabase
        .from('sos_requests')
        .update({ status: 'cancelled', updated_at: new Date().toISOString() })
        .eq('id', sosId);
    }
    const list = getStoredMockSOS();
    const index = list.findIndex((r) => r.id === sosId);
    if (index !== -1) {
      list[index].status = 'CANCELLED';
      saveStoredMockSOS(list);
      return list[index];
    }
    return null;
  }
};
