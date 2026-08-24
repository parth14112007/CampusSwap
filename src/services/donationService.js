/**
 * Donation & Electronics Recycling Service (Supabase Connected with Fallback)
 * 
 * Manages peer component donations, free reuse catalog, and responsible
 * electronics recycling guidelines.
 */

import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { notificationService } from './notificationService';

const STORAGE_DONATIONS_KEY = 'campusswap_donations_data';

export const INITIAL_DONATIONS = [
  {
    id: "don-001",
    title: "Arduino Uno R3 Clone + USB Cable",
    category: "Arduino",
    condition: "Good / Fully Functional",
    quantity: 2,
    location: "Academic Block B (Donation Bin 1)",
    description: "Extra boards from completed robotics project. Micro-USB port tested and working.",
    handoverMethod: "Lab Drop-Off Box",
    status: "Available",
    recycleTag: "Reusable",
    donorName: "Vikram Malhotra",
    donorDept: "ECE 4th Year",
    co2SavedKg: 1.4,
    eWastePreventedGrams: 120,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "don-002",
    title: "100+ Assorted 1/4W Resistors & Capacitors Bundle",
    category: "Electronics",
    condition: "Brand New / Unused",
    quantity: 1,
    location: "Electronics Lab 2 (B-204)",
    description: "Full box of through-hole 220Ω, 1kΩ, 10kΩ resistors and ceramic caps for prototyping.",
    handoverMethod: "In-Person Handover",
    status: "Available",
    recycleTag: "Reusable",
    donorName: "Ananya Deshmukh",
    donorDept: "EEE 2nd Year",
    co2SavedKg: 0.8,
    eWastePreventedGrams: 250,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "don-003",
    title: "Desoldered DC Motor & Gearbox (Needs Wire Soldering)",
    category: "Motors",
    condition: "Needs Minor Repair",
    quantity: 2,
    location: "Mechatronics Bay 2",
    description: "Working motor coils, one solder tab broken off, easily fixable in 5 mins.",
    handoverMethod: "Lab Drop-Off Box",
    status: "Available",
    recycleTag: "Needs Repair",
    donorName: "Rohan Verma",
    donorDept: "Mechanical",
    co2SavedKg: 2.1,
    eWastePreventedGrams: 300,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
  }
];

function getStoredMockDonations() {
  try {
    const raw = localStorage.getItem(STORAGE_DONATIONS_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_DONATIONS_KEY, JSON.stringify(INITIAL_DONATIONS));
      return INITIAL_DONATIONS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_DONATIONS;
  }
}

function saveStoredMockDonations(list) {
  try {
    localStorage.setItem(STORAGE_DONATIONS_KEY, JSON.stringify(list));
  } catch (e) {
    console.error('Failed to save donations data', e);
  }
}

function formatDbDonation(row) {
  return {
    id: row.id,
    title: row.title,
    category: row.category,
    condition: row.condition || 'Good / Functional',
    quantity: row.quantity || 1,
    location: row.location || 'Academic Block B',
    description: row.description || '',
    handoverMethod: row.handover_method || 'Lab Drop-Off Box',
    status: row.status ? row.status.charAt(0).toUpperCase() + row.status.slice(1).toLowerCase() : 'Available',
    recycleTag: row.recycle_tag || 'Reusable',
    donorName: row.profiles?.full_name || 'Campus Student',
    donorDept: row.profiles?.department || 'Engineering',
    donorId: row.donor_id,
    co2SavedKg: Number(row.co2_saved_kg || 1.0),
    eWastePreventedGrams: row.ewaste_prevented_grams || 150,
    createdAt: row.created_at
  };
}

export const donationService = {
  async getDonations({ category = 'all', status = 'all' } = {}) {
    if (isSupabaseConfigured && supabase) {
      try {
        let query = supabase.from('donations').select('*, profiles:donor_id(*)');

        if (category !== 'all') {
          query = query.ilike('category', category);
        }
        if (status !== 'all') {
          query = query.ilike('status', status);
        }

        query = query.order('created_at', { ascending: false });

        const { data, error } = await query;
        if (!error && data && data.length > 0) {
          return data.map(formatDbDonation);
        }
      } catch (err) {
        console.warn('Supabase donations fetch error', err);
      }
    }

    await new Promise((res) => setTimeout(res, 50));
    let list = getStoredMockDonations();
    if (category !== 'all') {
      list = list.filter((d) => d.category.toLowerCase() === category.toLowerCase());
    }
    if (status !== 'all') {
      list = list.filter((d) => d.status.toLowerCase() === status.toLowerCase());
    }
    return list;
  },

  async donateItem({
    title,
    category = 'Electronics',
    condition = 'Good',
    quantity = 1,
    location = 'Academic Block B',
    description = '',
    handoverMethod = 'Lab Drop-Off Box',
    recycleTag = 'Reusable',
    donorName = 'Arjun Sharma',
    donorDept = 'ECE 3rd Year',
    donorId = 'user-001'
  }) {
    const co2 = Number((Math.random() * 1.5 + 0.5).toFixed(1));
    const ewaste = (Number(quantity) || 1) * 150;

    if (isSupabaseConfigured && supabase && donorId) {
      try {
        const { data: created, error } = await supabase
          .from('donations')
          .insert({
            donor_id: donorId,
            title,
            category,
            condition,
            quantity: Number(quantity) || 1,
            location,
            description,
            handover_method: handoverMethod,
            recycle_tag: recycleTag,
            co2_saved_kg: co2,
            ewaste_prevented_grams: ewaste,
            status: 'Available'
          })
          .select('*, profiles:donor_id(*)')
          .single();

        if (!error && created) {
          return formatDbDonation(created);
        }
      } catch (err) {
        console.warn('Supabase create donation error, fallback to local', err);
      }
    }

    const list = getStoredMockDonations();
    const newDonation = {
      id: `don-${Date.now()}`,
      title,
      category,
      condition,
      quantity: Number(quantity) || 1,
      location,
      description,
      handoverMethod,
      status: 'Available',
      recycleTag,
      donorName,
      donorDept,
      donorId,
      co2SavedKg: co2,
      eWastePreventedGrams: ewaste,
      createdAt: new Date().toISOString()
    };

    list.unshift(newDonation);
    saveStoredMockDonations(list);
    return newDonation;
  },

  async claimDonation(id, claimerName = 'Arjun Sharma', claimerId = 'user-001') {
    if (isSupabaseConfigured && supabase && id.includes('-') && id.length > 30) {
      try {
        await supabase
          .from('donations')
          .update({ status: 'Claimed', claimed_by_id: claimerId, updated_at: new Date().toISOString() })
          .eq('id', id);

        await supabase.from('donation_claims').insert({
          donation_id: id,
          requester_id: claimerId,
          message: `${claimerName} claimed this donation for academic reuse.`,
          status: 'pending'
        });
      } catch (e) {
        console.warn('Supabase claim donation error', e);
      }
    }

    const list = getStoredMockDonations();
    const index = list.findIndex((d) => d.id === id);
    if (index !== -1) {
      list[index].status = 'Claimed';
      list[index].claimedBy = claimerName;
      saveStoredMockDonations(list);
    }
    return list;
  },

  getRecyclingGuidelines() {
    return [
      {
        title: "Microcontrollers & ICs",
        rule: "Keep in antistatic foam or bags. If non-functional, place in the designated Green E-Waste Bin at Innovation Lab FAB-01 for precious metal reclamation."
      },
      {
        title: "Lithium-Ion / LiPo Batteries",
        rule: "Never puncture or dispose in general trash. Insulate terminals with Kapton/electrical tape and deposit in fireproof battery barrels at Electronics Lab 2."
      },
      {
        title: "Motors & Copper Coils",
        rule: "Motors with broken wires can usually be re-soldered. Fully burnt stators go to the Metal Recycling Scrap Box in Mechanical Workshop M-104."
      }
    ];
  }
};
