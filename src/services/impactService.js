/**
 * Campus Sustainability & Impact Service (Pluggable Mock Engine)
 * 
 * Tracks circular economy impact metrics and awards sustainability badges.
 */

export const DEMO_IMPACT_METRICS = {
  componentsReused: 342,
  itemsDonated: 118,
  projectsSupported: 85,
  equipmentShared: 256,
  ewasteAvoidedKg: 42.5,
  co2SavedKg: 184.2,
  badges: [
    { id: 'sharer', label: 'RESOURCE SHARER', icon: 'share', desc: 'Shared 10+ hardware components' },
    { id: 'engineer', label: 'HELPFUL ENGINEER', icon: 'handyman', desc: 'Assisted 5+ peer emergency SOS requests' },
    { id: 'champion', label: 'REUSE CHAMPION', icon: 'recycling', desc: 'Contributed 3+ items to free reuse bins' },
    { id: 'contributor', label: 'PROJECT CONTRIBUTOR', icon: 'groups', desc: 'Active member on 2+ verified project teams' },
    { id: 'builder', label: 'CAMPUS BUILDER', icon: 'military_tech', desc: 'Top 5% sustainability score this semester' }
  ]
};

export const impactService = {
  async getMetrics() {
    await new Promise((res) => setTimeout(res, 50));
    return DEMO_IMPACT_METRICS;
  }
};
