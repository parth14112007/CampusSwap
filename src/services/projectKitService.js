/**
 * Project Kit Service (Supabase Connected with Pluggable BOM Engine)
 * 
 * Manages 10 curated engineering hardware project bundles with live campus
 * availability cross-referencing, project creation, and Supabase persistence.
 */

import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { CAMPUS_RESOURCES, INITIAL_ITEMS } from '../data/mockData';

const STORAGE_SAVED_KITS_KEY = 'campusswap_saved_kits';

export const INITIAL_PROJECT_KITS = [
  {
    id: "kit-001",
    title: "Obstacle Avoiding Autonomous Robot Kit",
    description: "4-wheeled autonomous rover with ultrasonic obstacle detection and differential motor control.",
    category: "Robotics",
    targetLevel: "Beginner",
    estimatedBudget: 850,
    duration: "1–2 Weeks",
    rating: 4.9,
    creator: "Robotics Society Lab",
    isOfficialLabKit: true,
    image: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=400&q=80",
    tags: ["Arduino", "Ultrasonic", "Motors", "Robotics"],
    componentsList: [
      { name: "Arduino Uno R3", quantity: 1, estimatedCost: 280, role: "Main Microcontroller" },
      { name: "HC-SR04 Ultrasonic Distance Sensor", quantity: 1, estimatedCost: 80, role: "Obstacle Detection" },
      { name: "L298N Dual H-Bridge Motor Driver", quantity: 1, estimatedCost: 120, role: "Motor Speed/Direction" },
      { name: "12V High-Torque DC Metal Gear Motors", quantity: 2, estimatedCost: 240, role: "Wheel Propulsion" },
      { name: "TowerPro MG996R Metal Gear Servo", quantity: 1, estimatedCost: 180, role: "Swivel Mount" },
      { name: "4WD Aluminum Robot Chassis Plate", quantity: 1, estimatedCost: 350, role: "Robot Frame" },
      { name: "2x 18650 Li-Ion Battery Holder", quantity: 1, estimatedCost: 90, role: "DC Power Supply" }
    ]
  },
  {
    id: "kit-002",
    title: "Autonomous PID Line Following Robot Kit",
    description: "High-speed line tracker utilizing 5-channel analog infrared sensor array with closed-loop PID control.",
    category: "Robotics",
    targetLevel: "Intermediate",
    estimatedBudget: 950,
    duration: "2 Weeks",
    rating: 4.8,
    creator: "Mechatronics Lab Bay 2",
    isOfficialLabKit: true,
    image: "https://images.unsplash.com/photo-1561557944-6e7860d1a7eb?auto=format&fit=crop&w=400&q=80",
    tags: ["Arduino Nano", "IR Sensors", "PID Control", "Robotics"],
    componentsList: [
      { name: "Arduino Nano V3", quantity: 1, estimatedCost: 220, role: "Compute Unit" },
      { name: "5-Channel TCRT5000 IR Sensor Array", quantity: 1, estimatedCost: 180, role: "Line Tracking" },
      { name: "L298N Motor Driver", quantity: 1, estimatedCost: 120, role: "Motor Power" },
      { name: "N20 Micro Metal Gear Motors (600RPM)", quantity: 2, estimatedCost: 280, role: "High-Speed Drive" },
      { name: "Rubber Wheels with Brass Couplers", quantity: 2, estimatedCost: 100, role: "Traction Wheels" },
      { name: "Castor Ball Wheel", quantity: 1, estimatedCost: 50, role: "Balance Support" }
    ]
  },
  {
    id: "kit-003",
    title: "Smart IoT Greenhouse Automation Kit",
    description: "Automated climate regulation node with soil moisture control, water pump relay, and OLED dashboard.",
    category: "IoT",
    targetLevel: "Beginner",
    estimatedBudget: 750,
    duration: "1 Week",
    rating: 4.9,
    creator: "IoT Student Maker Space",
    isOfficialLabKit: true,
    image: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=400&q=80",
    tags: ["ESP32", "Soil Moisture", "Relays", "IoT"],
    componentsList: [
      { name: "ESP32 NodeMCU Wi-Fi + BLE", quantity: 1, estimatedCost: 350, role: "Cloud IoT Gateway" },
      { name: "Capacitive Soil Moisture Sensor v1.2", quantity: 2, estimatedCost: 180, role: "Soil Hydration Sensor" },
      { name: "5V 1-Channel Isolated Relay Module", quantity: 1, estimatedCost: 70, role: "Pump Trigger" },
      { name: "Mini 5V Submersible Water Pump & Tube", quantity: 1, estimatedCost: 150, role: "Irrigation Flow" },
      { name: "0.96 inch I2C OLED Display (128x64)", quantity: 1, estimatedCost: 140, role: "Local Telemetry" }
    ]
  },
  {
    id: "kit-004",
    title: "ESP32 Environmental Weather Station Kit",
    description: "Solar-powered environmental monitoring node with barometric pressure, humidity, and cloud MQTT telemetry.",
    category: "IoT",
    targetLevel: "Beginner",
    estimatedBudget: 680,
    duration: "1 Week",
    rating: 4.9,
    creator: "Electronics Lab 2",
    isOfficialLabKit: true,
    image: "https://images.unsplash.com/photo-1530595467537-0b5996c41f2d?auto=format&fit=crop&w=400&q=80",
    tags: ["ESP32", "BME280", "Weather", "MQTT"],
    componentsList: [
      { name: "ESP32 NodeMCU Wi-Fi + BLE", quantity: 1, estimatedCost: 350, role: "Wi-Fi Telemetry" },
      { name: "DHT22 High-Precision Temperature & Humidity", quantity: 1, estimatedCost: 160, role: "Atmospheric Data" },
      { name: "BMP280 Barometric Pressure Sensor", quantity: 1, estimatedCost: 120, role: "Altitude / Weather" },
      { name: "5V Solar Panel + TP4056 Charging Module", quantity: 1, estimatedCost: 220, role: "Off-Grid Solar" }
    ]
  },
  {
    id: "kit-005",
    title: "Smart Home Automation Relay Gateway Kit",
    description: "App-controlled 4-channel AC appliance relay gateway with manual wall switch feedback and energy monitoring.",
    category: "Embedded Systems",
    targetLevel: "Intermediate",
    estimatedBudget: 820,
    duration: "2 Weeks",
    rating: 4.7,
    creator: "Campus Innovation Lab",
    isOfficialLabKit: true,
    image: "https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=400&q=80",
    tags: ["ESP32", "Relays", "Smart Home", "AC Mains"],
    componentsList: [
      { name: "ESP32 NodeMCU Wi-Fi + BLE", quantity: 1, estimatedCost: 350, role: "Central Smart Hub" },
      { name: "4-Channel 5V Optocoupler Relay Board", quantity: 1, estimatedCost: 220, role: "Appliance Switching" },
      { name: "ACS712 20A AC/DC Current Sensor", quantity: 1, estimatedCost: 140, role: "Power Consumption" },
      { name: "HLK-PM01 230V to 5V Step-Down Converter", quantity: 1, estimatedCost: 180, role: "Mains Power Supply" }
    ]
  },
  {
    id: "kit-006",
    title: "Bluetooth RC Telemetry Car Kit",
    description: "Smartphone-controlled 2WD racing chassis with real-time battery voltage telemetry and speed PID tuning.",
    category: "Robotics",
    targetLevel: "Beginner",
    estimatedBudget: 620,
    duration: "1 Week",
    rating: 4.8,
    creator: "Robotics Club",
    isOfficialLabKit: false,
    image: "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=400&q=80",
    tags: ["HC-05", "Arduino", "Bluetooth", "RC Car"],
    componentsList: [
      { name: "Arduino Uno R3", quantity: 1, estimatedCost: 280, role: "Onboard Controller" },
      { name: "HC-05 Bluetooth Serial Module", quantity: 1, estimatedCost: 150, role: "Wireless Link" },
      { name: "L298N Dual Motor Driver", quantity: 1, estimatedCost: 120, role: "Dual Motors" },
      { name: "2WD Acrylic Smart Car Chassis Kit", quantity: 1, estimatedCost: 250, role: "Chassis Frame" }
    ]
  },
  {
    id: "kit-007",
    title: "Mini Quadcopter Drone Flight Kit",
    description: "Custom drone flight management system with gyro attitude stabilization and 2.4GHz radio telemetry.",
    category: "Embedded Systems",
    targetLevel: "Advanced",
    estimatedBudget: 3400,
    duration: "3–4 Weeks",
    rating: 4.9,
    creator: "Aero & Robotics Lab",
    isOfficialLabKit: true,
    image: "https://images.unsplash.com/photo-1527977966376-1c8408f9f108?auto=format&fit=crop&w=400&q=80",
    tags: ["STM32", "Drone", "MPU6050", "ESCs"],
    componentsList: [
      { name: "STM32 Nucleo-F401RE Board", quantity: 1, estimatedCost: 950, role: "Flight Compute" },
      { name: "MPU6050 6-Axis Gyroscope & Accelerometer", quantity: 1, estimatedCost: 150, role: "Attitude Sensing" },
      { name: "30A BLHeli Brushless ESCs (Set of 4)", quantity: 1, estimatedCost: 1200, role: "Motor Control" },
      { name: "F450 Quadcopter Drone Frame Kit", quantity: 1, estimatedCost: 650, role: "Frame & Landing Gear" }
    ]
  },
  {
    id: "kit-008",
    title: "4-DOF Robotic Arm Manipulator Kit",
    description: "Acrylic 4-degree-of-freedom tabletop robotic arm with claw gripper and analog joystick coordinate control.",
    category: "Robotics",
    targetLevel: "Intermediate",
    estimatedBudget: 1100,
    duration: "2 Weeks",
    rating: 4.9,
    creator: "Mechatronics Bay",
    isOfficialLabKit: true,
    image: "https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=400&q=80",
    tags: ["Servos", "Robotic Arm", "Arduino", "Kinematics"],
    componentsList: [
      { name: "Arduino Uno R3", quantity: 1, estimatedCost: 280, role: "Kinematics Compute" },
      { name: "TowerPro MG90S Metal Gear Micro Servos", quantity: 4, estimatedCost: 400, role: "Joint Actuators" },
      { name: "Dual-Axis Analog PS2 Joystick Modules", quantity: 2, estimatedCost: 120, role: "Manual Controller" },
      { name: "Laser-Cut Acrylic 4-DOF Arm Frame", quantity: 1, estimatedCost: 350, role: "Arm Mechanical Assembly" }
    ]
  },
  {
    id: "kit-009",
    title: "Smart Agriculture & Solar Irrigation Kit",
    description: "Automated solar-powered drip irrigation system with capacitive probes and low-power ESP-NOW mesh networking.",
    category: "IoT",
    targetLevel: "Intermediate",
    estimatedBudget: 1250,
    duration: "2 Weeks",
    rating: 4.8,
    creator: "Campus Sustainability Hub",
    isOfficialLabKit: true,
    image: "https://images.unsplash.com/photo-1592417817098-8f3d6eb22500?auto=format&fit=crop&w=400&q=80",
    tags: ["Solar", "ESP32", "Irrigation", "Agriculture"],
    componentsList: [
      { name: "ESP32 NodeMCU Wi-Fi + BLE", quantity: 1, estimatedCost: 350, role: "Solar Mesh Node" },
      { name: "Capacitive Soil Moisture Sensors", quantity: 3, estimatedCost: 270, role: "Multi-Zone Soil Sensing" },
      { name: "12V 10W Monocrystalline Solar Panel", quantity: 1, estimatedCost: 450, role: "Solar Power Harvest" },
      { name: "12V DC Solenoid Valve 1/2 inch", quantity: 1, estimatedCost: 280, role: "Drip Line Water Control" }
    ]
  },
  {
    id: "kit-010",
    title: "Edge AI Object Detection Vision Kit",
    description: "Neural network object recognition and tracking system powered by NVIDIA Jetson Nano and Sony IMX219 camera.",
    category: "AI/ML",
    targetLevel: "Advanced",
    estimatedBudget: 4200,
    duration: "3–4 Weeks",
    rating: 5.0,
    creator: "AI & Computer Vision Lab",
    isOfficialLabKit: true,
    image: "https://images.unsplash.com/photo-1555255707-c07966088b7b?auto=format&fit=crop&w=400&q=80",
    tags: ["Jetson Nano", "Computer Vision", "YOLOv8", "Edge AI"],
    componentsList: [
      { name: "NVIDIA Jetson Nano 4GB AI Developer Kit", quantity: 1, estimatedCost: 3200, role: "Edge GPU Tensor Core" },
      { name: "Sony IMX219 8MP CSI Camera Module", quantity: 1, estimatedCost: 850, role: "Real-Time Video Capture" },
      { name: "5V 4A DC Barrel Jack Power Supply", quantity: 1, estimatedCost: 350, role: "High-Current Power" }
    ]
  }
];

function getStoredSavedKits() {
  try {
    const raw = localStorage.getItem(STORAGE_SAVED_KITS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveStoredSavedKits(list) {
  try {
    localStorage.setItem(STORAGE_SAVED_KITS_KEY, JSON.stringify(list));
  } catch (e) {
    console.error(e);
  }
}

export const projectKitService = {
  /**
   * Get all project kits with optional category or difficulty filtering
   */
  async getProjectKits({ category = 'all', difficulty = 'all' } = {}) {
    await new Promise((res) => setTimeout(res, 50));
    return INITIAL_PROJECT_KITS.filter((kit) => {
      const matchCat = category === 'all' || kit.category.toLowerCase() === category.toLowerCase();
      const matchDiff = difficulty === 'all' || kit.targetLevel.toLowerCase() === difficulty.toLowerCase();
      return matchCat && matchDiff;
    });
  },

  /**
   * Get single kit by ID with full campus availability cross-matching
   */
  async getProjectKitById(id) {
    const kit = INITIAL_PROJECT_KITS.find((k) => k.id === id) || INITIAL_PROJECT_KITS[0];
    
    // Cross-match components with live campus resources
    let availableCount = 0;
    const reconciledComponents = kit.componentsList.map((comp) => {
      const cName = comp.name.toLowerCase();
      const matchedRes = CAMPUS_RESOURCES.find((r) => r.name.toLowerCase().includes(cName.split(' ')[0]) || cName.includes(r.name.toLowerCase().split(' ')[0]));
      const isAvailable = matchedRes && (matchedRes.availability === 'AVAILABLE' || matchedRes.availability === 'LIMITED');

      if (isAvailable) availableCount++;

      return {
        ...comp,
        status: isAvailable ? (matchedRes.availability === 'AVAILABLE' ? 'AVAILABLE' : 'LIMITED') : 'NOT_FOUND',
        location: matchedRes ? `${matchedRes.building} (${matchedRes.room})` : 'Peer Marketplace',
        distanceText: matchedRes ? matchedRes.distanceText : 'Needs Request',
        resourceId: matchedRes?.id,
        linkedListingId: matchedRes?.linkedListingId
      };
    });

    const totalCount = kit.componentsList.length;
    const readinessPercentage = Math.round((availableCount / totalCount) * 100);

    return {
      ...kit,
      componentsList: reconciledComponents,
      availableCount,
      missingCount: totalCount - availableCount,
      readinessPercentage
    };
  },

  /**
   * Save a kit to user profile in Supabase with local fallback
   */
  async saveProjectKit(kit, userId = 'user-001') {
    if (isSupabaseConfigured && supabase && userId) {
      try {
        await supabase.from('project_kits').insert({
          user_id: userId,
          name: kit.title,
          description: kit.description || '',
          difficulty: kit.targetLevel || 'Beginner',
          estimated_duration: kit.duration || '1-2 Weeks',
          image_url: kit.image,
          status: 'saved'
        });
      } catch (err) {
        console.warn('Supabase save kit error', err);
      }
    }

    const list = getStoredSavedKits();
    if (!list.some((k) => k.id === kit.id)) {
      list.unshift(kit);
      saveStoredSavedKits(list);
    }
    return list;
  },

  /**
   * Get saved kits
   */
  async getSavedKits(userId = 'user-001') {
    if (isSupabaseConfigured && supabase && userId) {
      try {
        const { data, error } = await supabase
          .from('project_kits')
          .select('*')
          .eq('user_id', userId);

        if (!error && data && data.length > 0) {
          return data.map((k) => ({
            id: k.id,
            title: k.name,
            description: k.description,
            targetLevel: k.difficulty,
            duration: k.estimated_duration,
            image: k.image_url || 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=400&q=80',
            savedAt: k.created_at
          }));
        }
      } catch (err) {
        console.warn('Supabase get saved kits error', err);
      }
    }

    return getStoredSavedKits();
  }
};
