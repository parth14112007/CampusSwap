/**
 * AI Project Assistant Service (Supabase Connected with Pluggable AI Logic)
 * 
 * Provides automated project decomposition, bill-of-materials (BOM) generation,
 * live campus availability cross-matching, project readiness scoring, Project Kit
 * generation, and Supabase project persistence.
 */

import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { INITIAL_ITEMS, CAMPUS_RESOURCES } from '../data/mockData';

const STORAGE_SAVED_PROJECTS_KEY = 'campusswap_saved_ai_projects';

export const PROJECT_PRESETS = [
  {
    id: "preset-obstacle-bot",
    name: "Obstacle Avoiding Autonomous Robot",
    domain: "Robotics",
    experienceLevel: "Beginner",
    budget: 800,
    deadline: "2 Weeks",
    description: "4-wheeled autonomous rover that navigates indoor rooms using ultrasonic pulse echo distance measurement and differential dual-motor steering."
  },
  {
    id: "preset-iot-weather",
    name: "IoT Smart Agriculture & Weather Station",
    domain: "IoT",
    experienceLevel: "Beginner",
    budget: 650,
    deadline: "1 Week",
    description: "Solar-powered environmental monitoring node with ESP32, capacitive soil moisture sensing, ambient humidity/temperature logging, and cloud MQTT telemetry."
  },
  {
    id: "preset-line-follower",
    name: "Autonomous PID Line Following Bot",
    domain: "Robotics",
    experienceLevel: "Intermediate",
    budget: 900,
    deadline: "3 Weeks",
    description: "High-speed line tracker utilizing 5-channel analog infrared sensor array with closed-loop PID microcontroller steering algorithms."
  },
  {
    id: "preset-quadcopter",
    name: "Quadcopter Flight Controller & Telemetry",
    domain: "Embedded Systems",
    experienceLevel: "Advanced",
    budget: 3500,
    deadline: "1 Month",
    description: "Custom drone flight management system with gyro/accelerometer attitude stabilization, barometer altitude hold, and live 2.4GHz radio telemetry."
  }
];

function getStoredMockProjects() {
  try {
    const raw = localStorage.getItem(STORAGE_SAVED_PROJECTS_KEY);
    if (!raw) {
      const initial = [
        {
          id: "proj-001",
          name: "Obstacle Avoiding Autonomous Robot",
          domain: "Robotics",
          experienceLevel: "Beginner",
          componentCount: 7,
          availableCount: 5,
          readinessPercentage: 71,
          estimatedCost: 780,
          savedDate: "2026-08-23",
          description: "4-wheeled autonomous rover with ultrasonic obstacle detection."
        }
      ];
      localStorage.setItem(STORAGE_SAVED_PROJECTS_KEY, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function saveStoredMockProjects(list) {
  try {
    localStorage.setItem(STORAGE_SAVED_PROJECTS_KEY, JSON.stringify(list));
  } catch (e) {
    console.error('Failed to save projects to storage', e);
  }
}

function formatDbProject(row) {
  const reqs = row.requirements || [];
  return {
    id: row.id,
    name: row.name,
    domain: row.project_type || 'Robotics',
    experienceLevel: row.experience_level || 'Intermediate',
    budget: Number(row.budget || 0),
    deadline: row.deadline || '2 Weeks',
    componentCount: row.total_components || reqs.length || 7,
    availableCount: row.available_components || 5,
    readinessPercentage: row.readiness_percentage || 71,
    estimatedCost: Number(row.estimated_cost || 0),
    savedDate: row.created_at ? row.created_at.split('T')[0] : 'Today',
    description: row.description || '',
    status: row.status || 'active',
    ownerId: row.owner_id,
    components: reqs.map((r) => ({
      id: r.id,
      name: r.component_name,
      quantity: r.quantity,
      role: r.role,
      estimatedCost: Number(r.estimated_cost),
      status: r.availability_status ? r.availability_status.toUpperCase() : 'AVAILABLE',
      statusText: r.availability_status === 'available' ? 'Available on Campus' : r.availability_status === 'limited' ? 'Limited Stock' : 'Not in Stock',
      location: r.location_hint || 'Lab Complex',
      resourceId: r.matched_resource_id,
      linkedListingId: r.matched_listing_id
    }))
  };
}

export const aiAssistantService = {
  getPresets() {
    return PROJECT_PRESETS;
  },

  /**
   * Analyze project prompt and generate recommended BOM cross-matched with Campus Inventory
   */
  async analyzeProject({
    projectName = '',
    projectDescription = '',
    domain = 'Robotics',
    experienceLevel = 'Intermediate',
    budget = 1000,
    deadline = '2 Weeks'
  } = {}) {
    await new Promise((res) => setTimeout(res, 400));

    const text = `${projectName} ${projectDescription} ${domain}`.toLowerCase();

    // 1. Determine recommended BOM based on engineering domain templates
    let recommendedComponents = [];

    if (text.includes('weather') || text.includes('iot') || text.includes('agriculture') || domain === 'IoT') {
      recommendedComponents = [
        { name: "ESP32 NodeMCU Wi-Fi + BLE", quantity: 1, estimatedCost: 350, role: "Main Compute & Wi-Fi Gateway" },
        { name: "DHT22 Temperature & Humidity Sensor", quantity: 1, estimatedCost: 160, role: "Ambient Climate Sensing" },
        { name: "Capacitive Soil Moisture Probe", quantity: 1, estimatedCost: 90, role: "Soil Hydration Measurement" },
        { name: "0.96 inch I2C OLED Display", quantity: 1, estimatedCost: 140, role: "Local Telemetry Readout" },
        { name: "MB-102 Breadboard + Jumper Wires", quantity: 1, estimatedCost: 80, role: "Prototyping Circuit Wiring" },
        { name: "5V Solar Panel + TP4056 Charger", quantity: 1, estimatedCost: 220, role: "Off-Grid Power Source" }
      ];
    } else if (text.includes('drone') || text.includes('quadcopter') || text.includes('flight')) {
      recommendedComponents = [
        { name: "STM32 Nucleo Development Board", quantity: 1, estimatedCost: 950, role: "Real-Time Flight Controller" },
        { name: "MPU6050 6-Axis Gyro & Accelerometer", quantity: 1, estimatedCost: 150, role: "Attitude & Orientation Sensor" },
        { name: "30A BLHeli Electronic Speed Controller (ESC)", quantity: 4, estimatedCost: 1200, role: "Brushless Motor ESCs" },
        { name: "2.4GHz 6-Channel Radio Receiver", quantity: 1, estimatedCost: 850, role: "Wireless Pilot Telemetry" },
        { name: "3S 2200mAh LiPo Battery Pack", quantity: 1, estimatedCost: 1400, role: "High-Discharge Power" }
      ];
    } else {
      // Default Robotics / Mechatronics / General Embedded
      recommendedComponents = [
        { name: "Arduino Uno R3 (ATmega328P)", quantity: 1, estimatedCost: 280, role: "Main Microcontroller Board" },
        { name: "HC-SR04 Ultrasonic Distance Sensor", quantity: 1, estimatedCost: 80, role: "Obstacle Detection Radar" },
        { name: "L298N Dual H-Bridge Motor Driver", quantity: 1, estimatedCost: 120, role: "DC Motor Power & Direction Control" },
        { name: "12V High-Torque DC Metal Gear Motors", quantity: 2, estimatedCost: 240, role: "Wheel Propulsion Drive" },
        { name: "TowerPro MG996R Metal Gear Servo", quantity: 1, estimatedCost: 180, role: "Sensor Sweeping Swivel Mount" },
        { name: "4WD Aluminum Robot Chassis Plate", quantity: 1, estimatedCost: 350, role: "Mechanical Structure Frame" },
        { name: "2x 18650 Li-Ion Battery Holder", quantity: 1, estimatedCost: 90, role: "Portable DC Power Supply" }
      ];
    }

    // 2. Cross-match recommended BOM with live Campus Inventory & Marketplace listings
    let availableCount = 0;
    const reconciledBOM = recommendedComponents.map((comp) => {
      const compName = comp.name.toLowerCase();

      // Search campus resources first
      const matchedCampusRes = CAMPUS_RESOURCES.find((res) => {
        const rName = res.name.toLowerCase();
        return (
          rName.includes(compName.split(' ')[0].toLowerCase()) ||
          compName.includes(rName.split(' ')[0].toLowerCase()) ||
          (compName.includes('arduino') && rName.includes('arduino')) ||
          (compName.includes('esp32') && rName.includes('esp32')) ||
          (compName.includes('ultrasonic') && rName.includes('hc-sr04')) ||
          (compName.includes('servo') && rName.includes('servo')) ||
          (compName.includes('chassis') && rName.includes('chassis')) ||
          (compName.includes('breadboard') && rName.includes('breadboard')) ||
          (compName.includes('motor driver') && rName.includes('l298n'))
        );
      });

      // Search peer marketplace listings
      const matchedMarketplaceItem = INITIAL_ITEMS.find((item) => {
        const iTitle = item.title.toLowerCase();
        return (
          iTitle.includes(compName.split(' ')[0].toLowerCase()) ||
          compName.includes(iTitle.split(' ')[0].toLowerCase())
        );
      });

      if (matchedCampusRes && (matchedCampusRes.availability === 'AVAILABLE' || matchedCampusRes.availability === 'LIMITED')) {
        availableCount++;
        return {
          ...comp,
          status: matchedCampusRes.availability === 'AVAILABLE' ? 'AVAILABLE' : 'LIMITED',
          statusText: matchedCampusRes.availability === 'AVAILABLE' ? 'Available on Campus' : 'Limited Stock',
          location: `${matchedCampusRes.building} (${matchedCampusRes.room})`,
          distanceText: matchedCampusRes.distanceText,
          provider: matchedCampusRes.provider,
          resourceId: matchedCampusRes.id,
          linkedListingId: matchedCampusRes.linkedListingId || matchedMarketplaceItem?.id
        };
      } else if (matchedMarketplaceItem && matchedMarketplaceItem.available !== false) {
        availableCount++;
        return {
          ...comp,
          status: 'AVAILABLE',
          statusText: 'Available via Peer Lender',
          location: matchedMarketplaceItem.location,
          distanceText: '120m away',
          provider: matchedMarketplaceItem.owner?.name,
          linkedListingId: matchedMarketplaceItem.id
        };
      } else {
        return {
          ...comp,
          status: 'NOT_FOUND',
          statusText: 'Not in Stock / Missing',
          location: 'Requires Student Request',
          distanceText: 'N/A',
          provider: 'Community Request'
        };
      }
    });

    const totalComponents = reconciledBOM.length;
    const readinessPercentage = Math.round((availableCount / totalComponents) * 100);
    const totalEstimatedCost = reconciledBOM.reduce((sum, c) => sum + (c.estimatedCost || 0), 0);

    return {
      projectName: projectName || "Custom Engineering Project",
      projectDescription,
      domain,
      experienceLevel,
      budget: Number(budget) || totalEstimatedCost,
      deadline,
      totalComponents,
      availableCount,
      missingCount: totalComponents - availableCount,
      readinessPercentage,
      totalEstimatedCost,
      components: reconciledBOM,
      disclaimer: "AI-generated starting point based on campus engineering curricula.",
      generatedAt: new Date().toISOString()
    };
  },

  /**
   * Generate a bundled Project Kit preview
   */
  generateProjectKit(projectAnalysis) {
    return {
      id: `kit-gen-${Date.now()}`,
      title: `${projectAnalysis.projectName} Complete Hardware Kit`,
      description: projectAnalysis.projectDescription || "Curated bundle containing all required microcontrollers, sensors, drivers, and chassis elements.",
      domain: projectAnalysis.domain,
      experienceLevel: projectAnalysis.experienceLevel,
      componentCount: projectAnalysis.totalComponents,
      availableCount: projectAnalysis.availableCount,
      missingCount: projectAnalysis.missingCount,
      readinessPercentage: projectAnalysis.readinessPercentage,
      totalEstimatedBOM: projectAnalysis.totalEstimatedCost,
      estimatedRentalRate: Math.round(projectAnalysis.totalEstimatedCost * 0.08),
      componentsList: projectAnalysis.components
    };
  },

  /**
   * Save project to Supabase with requirements persistence and local fallback
   */
  async saveProject(projectAnalysis, userId = 'user-001') {
    if (isSupabaseConfigured && supabase && userId) {
      try {
        const { data: createdProject, error: projErr } = await supabase
          .from('projects')
          .insert({
            owner_id: userId,
            name: projectAnalysis.projectName,
            description: projectAnalysis.projectDescription || '',
            project_type: projectAnalysis.domain || 'Robotics',
            experience_level: projectAnalysis.experienceLevel || 'Intermediate',
            budget: Number(projectAnalysis.budget || projectAnalysis.totalEstimatedCost || 0),
            deadline: projectAnalysis.deadline || '2 Weeks',
            readiness_percentage: projectAnalysis.readinessPercentage || 0,
            total_components: projectAnalysis.totalComponents || 0,
            available_components: projectAnalysis.availableCount || 0,
            estimated_cost: Number(projectAnalysis.totalEstimatedCost || 0),
            status: 'active'
          })
          .select()
          .single();

        if (!projErr && createdProject) {
          // Persist requirements
          if (projectAnalysis.components && projectAnalysis.components.length > 0) {
            const reqPayloads = projectAnalysis.components.map((comp) => ({
              project_id: createdProject.id,
              component_name: comp.name,
              category: comp.category || projectAnalysis.domain || 'Components',
              quantity: comp.quantity || 1,
              role: comp.role || '',
              estimated_cost: Number(comp.estimatedCost || 0),
              availability_status: (comp.status || 'available').toLowerCase() === 'not_found' ? 'missing' : (comp.status || 'available').toLowerCase(),
              location_hint: comp.location || '',
              matched_resource_id: comp.resourceId || null,
              matched_listing_id: comp.linkedListingId && comp.linkedListingId.length > 30 ? comp.linkedListingId : null
            }));

            await supabase.from('project_requirements').insert(reqPayloads);
          }

          return this.getProjectById(createdProject.id);
        }
      } catch (err) {
        console.warn('Supabase save project error, using local fallback', err);
      }
    }

    const list = getStoredMockProjects();
    const newProject = {
      id: `proj-${Date.now()}`,
      name: projectAnalysis.projectName,
      domain: projectAnalysis.domain,
      experienceLevel: projectAnalysis.experienceLevel,
      componentCount: projectAnalysis.totalComponents,
      availableCount: projectAnalysis.availableCount,
      readinessPercentage: projectAnalysis.readinessPercentage,
      estimatedCost: projectAnalysis.totalEstimatedCost,
      savedDate: new Date().toISOString().split('T')[0],
      description: projectAnalysis.projectDescription,
      components: projectAnalysis.components
    };

    list.unshift(newProject);
    saveStoredMockProjects(list);
    return newProject;
  },

  /**
   * Get project by ID
   */
  async getProjectById(id) {
    if (isSupabaseConfigured && supabase && id.includes('-') && id.length > 30) {
      try {
        const { data, error } = await supabase
          .from('projects')
          .select('*, requirements:project_requirements(*)')
          .eq('id', id)
          .single();

        if (!error && data) {
          return formatDbProject(data);
        }
      } catch (e) {
        console.warn('Supabase project fetch error', e);
      }
    }

    const list = getStoredMockProjects();
    return list.find((p) => p.id === id) || null;
  },

  /**
   * Get all saved projects for user
   */
  async getSavedProjects(userId = 'user-001') {
    if (isSupabaseConfigured && supabase && userId) {
      try {
        const { data, error } = await supabase
          .from('projects')
          .select('*, requirements:project_requirements(*)')
          .eq('owner_id', userId)
          .order('created_at', { ascending: false });

        if (!error && data && data.length > 0) {
          return data.map(formatDbProject);
        }
      } catch (err) {
        console.warn('Supabase get projects error, fallback to local', err);
      }
    }

    return getStoredMockProjects();
  },

  /**
   * Delete saved project
   */
  async deleteProject(id) {
    if (isSupabaseConfigured && supabase && id.includes('-') && id.length > 30) {
      try {
        await supabase.from('projects').delete().eq('id', id);
      } catch (e) {
        console.warn('Supabase delete project error', e);
      }
    }

    const list = getStoredMockProjects();
    const filtered = list.filter((p) => p.id !== id);
    saveStoredMockProjects(filtered);
    return true;
  }
};
