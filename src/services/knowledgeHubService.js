/**
 * Engineering Knowledge Hub Service (Supabase Connected with Fallback)
 * 
 * Provides technical pinouts, datasheets, wiring schematics, and tutorials
 * across 11 engineering hardware categories with persistent bookmarks.
 */

import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';

const STORAGE_SAVED_KNOWLEDGE_KEY = 'campusswap_saved_knowledge';

export const KNOWLEDGE_CATEGORIES = [
  "All",
  "Arduino",
  "ESP32",
  "Sensors",
  "Motors",
  "Motor Drivers",
  "Electronics",
  "Robotics",
  "IoT",
  "Embedded Systems",
  "CAD",
  "Manufacturing"
];

export const INITIAL_KNOWLEDGE_RESOURCES = [
  {
    id: "kb-001",
    title: "ESP32 NodeMCU Complete GPIO & Pinout Reference",
    category: "ESP32",
    type: "PINOUT",
    difficulty: "Beginner",
    readTime: "5 min read",
    authorName: "IoT Lab Assistant",
    verifiedByFaculty: true,
    summary: "Complete GPIO matrix showing ADC channels, capacitive touch pins, hardware UART, I2C, SPI, and strapping pins to avoid during boot.",
    pinoutImage: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=500&q=80",
    specs: [
      { label: "Core Architecture", value: "Tensilica Xtensa Dual-Core 32-bit LX6" },
      { label: "Operating Voltage", value: "3.3V (5V via Micro-USB regulator)" },
      { label: "Wi-Fi & BLE", value: "802.11 b/g/n (up to 150 Mbps) + Bluetooth v4.2 BR/EDR and BLE" },
      { label: "ADC Channels", value: "18 Channels (12-bit SAR ADC)" }
    ],
    wiringNotes: "Do not pull GPIO 0 or GPIO 2 HIGH at boot if uploading sketches. Always use a common ground when interfacing 5V sensors.",
    relatedComponentId: "comp-esp32"
  },
  {
    id: "kb-002",
    title: "L298N Dual H-Bridge Motor Driver Wiring & PWM Guide",
    category: "Motor Drivers",
    type: "GUIDE",
    difficulty: "Beginner",
    readTime: "4 min read",
    authorName: "Robotics Society",
    verifiedByFaculty: true,
    summary: "Step-by-step connection guide for driving dual DC motors or one 4-wire stepper motor with 5V onboard jumper logic rules.",
    pinoutImage: "https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=500&q=80",
    specs: [
      { label: "Driver IC", value: "L298N Dual Full-Bridge Driver" },
      { label: "Motor Supply Voltage", value: "5V – 35V DC" },
      { label: "Peak Output Current", value: "2A per channel" },
      { label: "Logic Voltage", value: "5V" }
    ],
    wiringNotes: "If motor supply exceeds 12V, remove the onboard 5V enable jumper to protect the onboard 78M05 linear regulator.",
    relatedComponentId: "comp-l298n"
  },
  {
    id: "kb-003",
    title: "HC-SR04 Ultrasonic Sensor Timing & Precision Code",
    category: "Sensors",
    type: "TUTORIAL",
    difficulty: "Beginner",
    readTime: "3 min read",
    authorName: "Electronics & Circuitry Lab",
    verifiedByFaculty: true,
    summary: "Trigger pulse timing equations (10µs HIGH), speed of sound calculations (340 m/s), and obstacle edge cases.",
    pinoutImage: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=500&q=80",
    specs: [
      { label: "Working Voltage", value: "DC 5V" },
      { label: "Ranging Distance", value: "2 cm – 400 cm" },
      { label: "Resolution", value: "0.3 cm" },
      { label: "Measuring Angle", value: "15 degrees" }
    ],
    wiringNotes: "Connect Echo pin to an Arduino digital pin. If using with ESP32 (3.3V), use a 1kΩ / 2kΩ voltage divider on Echo.",
    relatedComponentId: "comp-hcsr04"
  },
  {
    id: "kb-004",
    title: "Arduino Uno R3 Official Schematic & ATmega328P Pin Mapping",
    category: "Arduino",
    type: "DATASHEET",
    difficulty: "Beginner",
    readTime: "6 min read",
    authorName: "Embedded Systems Faculty",
    verifiedByFaculty: true,
    summary: "Complete ATmega328P pin mapping showing Arduino digital/analog pin correlations, internal pull-up resistor behavior, and timer interrupts.",
    pinoutImage: "https://images.unsplash.com/photo-1608555855762-2b657eb1c348?auto=format&fit=crop&w=500&q=80",
    specs: [
      { label: "Microcontroller", value: "ATmega328P (8-bit AVR)" },
      { label: "Clock Speed", value: "16 MHz" },
      { label: "Flash Memory", value: "32 KB (0.5 KB bootloader)" },
      { label: "PWM Digital I/O", value: "6 Pins (D3, D5, D6, D9, D10, D11)" }
    ],
    wiringNotes: "Maximum current per I/O pin is 40mA. Total board current limit via 5V pin is 500mA when powered via USB.",
    relatedComponentId: "comp-uno"
  },
  {
    id: "kb-005",
    title: "NEMA 17 Stepper Motor & A4988 / DRV8825 Current Limiting Guide",
    category: "Motors",
    type: "TROUBLESHOOTING",
    difficulty: "Intermediate",
    readTime: "8 min read",
    authorName: "Mechatronics Bay 2",
    verifiedByFaculty: true,
    summary: "How to set the VREF potentiometer voltage on stepper driver carriers to prevent skipped steps and excessive motor heating.",
    pinoutImage: "https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=500&q=80",
    specs: [
      { label: "Step Angle", value: "1.8° (200 steps/rev)" },
      { label: "Holding Torque", value: "45 N.cm (63.7 oz.in)" },
      { label: "Rated Current", value: "1.5A / Phase" },
      { label: "Phase Resistance", value: "1.6 ohms" }
    ],
    wiringNotes: "Always calculate VREF = Current_Limit × 8 × R_sense before powering the stepper motor. Never disconnect motor wires while powered.",
    relatedComponentId: "comp-nema17"
  },
  {
    id: "kb-006",
    title: "Creality 3D Printer Bed Leveling & Slicer First Layer Troubleshooting",
    category: "Manufacturing",
    type: "TROUBLESHOOTING",
    difficulty: "Beginner",
    readTime: "5 min read",
    authorName: "FabLab Rapid Prototyping",
    verifiedByFaculty: true,
    summary: "Diagnosing nozzle offset, first-layer squish, bed temperature adhesion for PLA/PETG, and extruder tension calibration.",
    pinoutImage: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=500&q=80",
    specs: [
      { label: "Build Volume", value: "220 × 220 × 250 mm" },
      { label: "Nozzle Diameter", value: "0.4 mm Brass" },
      { label: "Bed Temperature", value: "60°C (PLA) / 80°C (PETG)" }
    ],
    wiringNotes: "Use standard A4 paper feeler gauge at all 4 bed leveling corners when the nozzle and bed are preheated.",
    relatedComponentId: "comp-3dprinter"
  },
  {
    id: "kb-007",
    title: "Fusion 360 Parametric Enclosure Design & 3D Print Tolerance Reference",
    category: "CAD",
    type: "GUIDE",
    difficulty: "Intermediate",
    readTime: "7 min read",
    authorName: "Mechanical Engineering Dept",
    verifiedByFaculty: true,
    summary: "Best practices for designing snap-fit tabs, PCB standoff screw boss diameters (M2/M3), and 0.3mm FDM 3D printing clearance offsets.",
    pinoutImage: "https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=500&q=80",
    specs: [
      { label: "Snap-fit Clearance", value: "0.3 mm (FDM standard)" },
      { label: "M3 Screw Boss Hole", value: "2.8 mm for thread forming" },
      { label: "Minimum Wall Thickness", value: "1.6 mm (4 perimeters)" }
    ],
    wiringNotes: "Add chamfers and fillets to inside corners to relieve stress concentrations during rapid prototyping drops.",
    relatedComponentId: "comp-cad"
  }
];

function getStoredBookmarks() {
  try {
    const raw = localStorage.getItem(STORAGE_SAVED_KNOWLEDGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function formatDbResource(row) {
  return {
    id: row.id,
    title: row.title,
    category: row.category,
    type: row.resource_type ? row.resource_type.toUpperCase() : 'GUIDE',
    difficulty: row.difficulty || 'Beginner',
    readTime: row.read_time || '5 min read',
    authorName: row.author_name || 'Engineering Faculty',
    verifiedByFaculty: row.verified_by_faculty !== false,
    summary: row.summary,
    pinoutImage: row.pinout_image || "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=500&q=80",
    specs: row.specs || [],
    wiringNotes: row.wiring_notes || '',
    relatedComponentId: row.related_component_id || null,
    createdAt: row.created_at
  };
}

export const knowledgeHubService = {
  getCategories() {
    return KNOWLEDGE_CATEGORIES;
  },

  async getResources({ category = 'All', type = 'All', search = '', sort = 'useful' } = {}) {
    if (isSupabaseConfigured && supabase) {
      try {
        let query = supabase.from('knowledge_resources').select('*');

        if (category !== 'All') {
          query = query.ilike('category', category);
        }
        if (type !== 'All') {
          query = query.ilike('resource_type', type);
        }

        const { data, error } = await query;
        if (!error && data && data.length > 0) {
          let list = data.map(formatDbResource);
          if (search.trim()) {
            const q = search.toLowerCase();
            list = list.filter((r) =>
              r.title.toLowerCase().includes(q) ||
              r.category.toLowerCase().includes(q) ||
              r.summary.toLowerCase().includes(q)
            );
          }
          if (sort === 'alphabetical') {
            list.sort((a, b) => a.title.localeCompare(b.title));
          }
          return list;
        }
      } catch (err) {
        console.warn('Supabase knowledge resources fetch error', err);
      }
    }

    await new Promise((res) => setTimeout(res, 50));
    let list = [...INITIAL_KNOWLEDGE_RESOURCES];

    if (category !== 'All') {
      list = list.filter((r) => r.category.toLowerCase() === category.toLowerCase());
    }

    if (type !== 'All') {
      list = list.filter((r) => r.type.toLowerCase() === type.toLowerCase());
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((r) =>
        r.title.toLowerCase().includes(q) ||
        r.category.toLowerCase().includes(q) ||
        r.summary.toLowerCase().includes(q) ||
        r.type.toLowerCase().includes(q)
      );
    }

    if (sort === 'alphabetical') {
      list.sort((a, b) => a.title.localeCompare(b.title));
    }

    return list;
  },

  async toggleBookmark(resourceId, userId = 'user-001') {
    if (isSupabaseConfigured && supabase && userId && resourceId.length > 30) {
      try {
        const { data: existing } = await supabase
          .from('saved_knowledge_resources')
          .select('id')
          .eq('user_id', userId)
          .eq('resource_id', resourceId)
          .maybeSingle();

        if (existing) {
          await supabase.from('saved_knowledge_resources').delete().eq('id', existing.id);
        } else {
          await supabase.from('saved_knowledge_resources').insert({ user_id: userId, resource_id: resourceId });
        }
      } catch (e) {
        console.warn('Supabase toggle bookmark error', e);
      }
    }

    const list = getStoredBookmarks();
    let updated = [];
    if (list.includes(resourceId)) {
      updated = list.filter((id) => id !== resourceId);
    } else {
      updated = [...list, resourceId];
    }
    localStorage.setItem(STORAGE_SAVED_KNOWLEDGE_KEY, JSON.stringify(updated));
    return updated;
  },

  async getBookmarks(userId = 'user-001') {
    if (isSupabaseConfigured && supabase && userId) {
      try {
        const { data, error } = await supabase
          .from('saved_knowledge_resources')
          .select('resource_id')
          .eq('user_id', userId);

        if (!error && data) {
          return data.map((d) => d.resource_id);
        }
      } catch (e) {
        console.warn('Supabase getBookmarks error', e);
      }
    }
    return getStoredBookmarks();
  }
};
