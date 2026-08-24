/**
 * AI Smart Match Service (Supabase Connected with Pluggable Match Engine)
 * 
 * Provides deterministic weighted multi-factor matching between student
 * hardware requirements and the CampusSwap catalog (Marketplace & Lab Inventory),
 * plus persistent Smart Match history in Supabase.
 */

import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { INITIAL_ITEMS, CAMPUS_RESOURCES } from '../data/mockData';

const STORAGE_SAVED_MATCHES_KEY = 'campusswap_saved_smart_matches';

const COMMON_COMPONENTS = [
  "Arduino Uno R3",
  "Arduino Nano",
  "ESP32 NodeMCU Wi-Fi + BLE",
  "Raspberry Pi 4 Model B (4GB)",
  "HC-SR04 Ultrasonic Sensor",
  "TowerPro MG996R Metal Gear Servo",
  "12V High-Torque DC Gear Motor",
  "NEMA 17 Stepper Motor",
  "L298N Dual H-Bridge Motor Driver",
  "BTS7960 43A High-Power Driver",
  "Tektronix 100MHz Digital Oscilloscope",
  "Keysight True RMS Digital Multimeter",
  "Quick 861DW ESD Hot Air SMD Rework Station",
  "Creality Ender 3 V2 3D Printer",
  "4WD Aluminum Robot Chassis Kit",
  "ESP32 IoT Weather Station Kit",
  "Regulated Benchtop DC Power Supply",
  "TS100 Smart Portable Soldering Iron",
  "24MHz 8-Channel USB Logic Analyzer",
  "NVIDIA Jetson Nano 4GB AI Kit",
  "STM32 Nucleo-F401RE Board",
  "Solderless Breadboard & Jumper Wires"
];

function getStoredItems() {
  try {
    const raw = localStorage.getItem('campusswap_listings_data');
    return raw ? JSON.parse(raw) : INITIAL_ITEMS;
  } catch {
    return INITIAL_ITEMS;
  }
}

function getStoredCampusResources() {
  try {
    const raw = localStorage.getItem('campusswap_campus_resources_data');
    return raw ? JSON.parse(raw) : CAMPUS_RESOURCES;
  } catch {
    return CAMPUS_RESOURCES;
  }
}

function getStoredSavedMatches() {
  try {
    const raw = localStorage.getItem(STORAGE_SAVED_MATCHES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveStoredSavedMatches(list) {
  try {
    localStorage.setItem(STORAGE_SAVED_MATCHES_KEY, JSON.stringify(list));
  } catch (e) {
    console.error(e);
  }
}

export const aiMatchService = {
  /**
   * Autocomplete suggestions for component requirement inputs
   */
  getAutocompleteSuggestions(query = '') {
    const q = query.trim().toLowerCase();
    if (!q) return COMMON_COMPONENTS.slice(0, 6);
    return COMMON_COMPONENTS.filter((c) => c.toLowerCase().includes(q)).slice(0, 8);
  },

  /**
   * Run deterministic multi-factor smart matching
   */
  async findSmartMatches({
    component = '',
    requirement = '',
    quantity = 1,
    transactionType = 'All',
    maxBudget = 1000,
    requiredDate = 'Soon',
    urgency = 'Normal',
    userId = 'user-001'
  } = {}) {
    await new Promise((res) => setTimeout(res, 350));

    const query = `${component} ${requirement}`.trim().toLowerCase();
    const queryTokens = query.split(/[\s,+/_-]+/).filter((t) => t.length > 1);

    const marketplaceItems = getStoredItems();
    const campusResources = getStoredCampusResources();

    // Pool candidate items
    const candidates = [
      ...marketplaceItems.map((item) => ({
        id: item.id,
        title: item.title,
        category: item.category,
        type: item.type,
        price: item.price,
        priceUnit: item.priceUnit,
        deposit: item.deposit || 0,
        condition: item.condition || 'Lab Tested',
        available: item.available !== false,
        location: item.location || 'Academic Block B',
        distanceMeters: item.location?.includes('Robotics') ? 240 : item.location?.includes('FabLab') ? 90 : 120,
        distanceText: item.location?.includes('Robotics') ? '240m away' : item.location?.includes('FabLab') ? '90m away' : '120m away',
        image: item.image,
        description: item.description,
        specs: item.specs || [],
        owner: item.owner || { name: 'Campus Student', rating: 4.8, verified: true },
        sourceType: 'marketplace'
      })),
      ...campusResources.map((res) => ({
        id: res.id,
        title: res.name,
        category: res.category,
        type: res.type === 'Lab Access' ? 'Borrow' : res.type,
        price: res.price || 0,
        priceUnit: res.price ? '/day' : 'Free Lab Access',
        deposit: 0,
        condition: res.condition || 'Lab Tested',
        available: res.availability === 'AVAILABLE' || res.availability === 'LIMITED',
        location: `${res.building} • ${res.room}`,
        distanceMeters: res.distanceMeters || 150,
        distanceText: res.distanceText || `${res.distanceMeters || 150}m away`,
        image: res.image,
        description: res.description,
        specs: res.specs || [],
        owner: {
          name: res.provider,
          rating: res.rating || 4.9,
          verified: res.isVerified !== false,
          dept: res.building
        },
        sourceType: 'campus_inventory',
        linkedListingId: res.linkedListingId
      }))
    ];

    // Score each candidate using weighted multi-factor formula
    const scoredResults = candidates.map((item) => {
      let similarityScore = 0;
      const itemText = `${item.title} ${item.category} ${item.description} ${(item.specs || []).map((s) => `${s.label} ${s.value}`).join(' ')}`.toLowerCase();

      // Factor 1: Keyword similarity (Weight: 35%)
      if (queryTokens.length > 0) {
        let matchedTokenCount = 0;
        for (const token of queryTokens) {
          if (itemText.includes(token)) {
            matchedTokenCount++;
            if (item.title.toLowerCase().includes(token)) {
              matchedTokenCount += 1.5;
            }
          }
        }
        similarityScore = Math.min(100, (matchedTokenCount / (queryTokens.length * 1.5)) * 100);
      } else {
        similarityScore = 50;
      }

      // Factor 2: Availability (Weight: 25%)
      const availabilityScore = item.available ? 100 : 20;

      // Factor 3: Proximity / Distance (Weight: 15%)
      const dist = item.distanceMeters || 200;
      const distanceScore = dist < 100 ? 100 : dist < 200 ? 90 : dist < 350 ? 75 : 55;

      // Factor 4: Budget Fit (Weight: 15%)
      const budget = Number(maxBudget) || 1000;
      const price = Number(item.price) || 0;
      let budgetScore = 100;
      if (price > budget) {
        budgetScore = Math.max(30, 100 - ((price - budget) / budget) * 100);
      }

      // Factor 5: Trust & Verification (Weight: 10%)
      const rating = Number(item.owner?.rating) || 4.5;
      const verifiedBonus = item.owner?.verified ? 10 : 0;
      const trustScore = Math.min(100, (rating / 5.0) * 90 + verifiedBonus);

      // Urgency boost if item is available nearby
      let urgencyMultiplier = 1.0;
      if (urgency === 'Urgent' && item.available && dist < 150) {
        urgencyMultiplier = 1.06;
      }

      // Filter penalty if transaction type specified
      let typeMultiplier = 1.0;
      if (transactionType !== 'All' && item.type.toLowerCase() !== transactionType.toLowerCase()) {
        typeMultiplier = 0.85;
      }

      const rawScore =
        (similarityScore * 0.35 +
          availabilityScore * 0.25 +
          distanceScore * 0.15 +
          budgetScore * 0.15 +
          trustScore * 0.1) *
        urgencyMultiplier *
        typeMultiplier;

      const finalMatchPercentage = Math.min(98, Math.max(45, Math.round(rawScore)));

      const reasons = [];
      if (similarityScore > 65) reasons.push("Exact component specification match");
      if (item.available) reasons.push("In stock and available immediately");
      if (dist <= 150) reasons.push(`Close proximity (${item.distanceText})`);
      if (price <= budget) reasons.push(`Within specified budget (₹${price})`);
      if (item.owner?.rating >= 4.8) reasons.push(`High lender rating (${item.owner.rating}★)`);

      const reasonText = reasons.length > 0
        ? `Strong match because it is ${reasons.slice(0, 3).join(', ').toLowerCase()}.`
        : "Moderate compatibility match based on laboratory category overlap.";

      return {
        ...item,
        matchPercentage: finalMatchPercentage,
        reasonText,
        factors: {
          similarity: Math.round(similarityScore),
          availability: availabilityScore,
          distance: distanceScore,
          budget: Math.round(budgetScore),
          trust: Math.round(trustScore)
        }
      };
    });

    const filteredMatches = scoredResults
      .filter((r) => r.matchPercentage >= 50)
      .sort((a, b) => b.matchPercentage - a.matchPercentage);

    const uniqueMatches = [];
    const seenTitles = new Set();
    for (const match of filteredMatches) {
      if (!seenTitles.has(match.title.toLowerCase())) {
        seenTitles.add(match.title.toLowerCase());
        uniqueMatches.push(match);
      }
    }

    const finalMatches = uniqueMatches.slice(0, 6).map((match, idx) => ({
      ...match,
      rank: idx === 0 ? 'BEST MATCH' : idx === 1 ? 'SECOND BEST MATCH' : 'ALTERNATIVE OPTION',
      rankBadge: idx === 0 ? '🏆 Top AI Match' : idx === 1 ? '🥈 Great Alternative' : '📦 Nearby Option'
    }));

    // Record in history if Supabase is configured
    if (isSupabaseConfigured && supabase && userId && finalMatches.length > 0) {
      try {
        await supabase.from('smart_match_history').insert({
          user_id: userId,
          query: component || requirement,
          requirement,
          quantity: Number(quantity) || 1,
          transaction_type: transactionType,
          max_budget: Number(maxBudget) || 1000,
          urgency,
          top_match_title: finalMatches[0].title,
          top_match_score: finalMatches[0].matchPercentage,
          is_saved: false
        });
      } catch (e) {
        console.warn('Smart match history record error', e);
      }
    }

    return finalMatches;
  },

  /**
   * Save match to user favorites / bookmarks
   */
  async saveSmartMatch(match, userId = 'user-001') {
    if (isSupabaseConfigured && supabase && userId) {
      try {
        await supabase.from('smart_match_history').insert({
          user_id: userId,
          query: match.title,
          requirement: match.description || match.title,
          quantity: 1,
          transaction_type: match.type || 'All',
          max_budget: Number(match.price) || 0,
          top_match_title: match.title,
          top_match_score: match.matchPercentage || 95,
          is_saved: true
        });
      } catch (err) {
        console.warn('Supabase save match error', err);
      }
    }

    const list = getStoredSavedMatches();
    if (!list.some((m) => m.id === match.id)) {
      list.unshift(match);
      saveStoredSavedMatches(list);
    }
    return list;
  },

  getSavedSmartMatches() {
    return getStoredSavedMatches();
  }
};
