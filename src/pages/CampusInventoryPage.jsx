import React, { useState, useEffect, useMemo } from 'react';
import { TopAppBar } from '../components/common/TopAppBar';
import { BottomNav } from '../components/common/BottomNav';
import { Button } from '../components/common/Button';
import { CampusResourceMap } from '../components/campus/CampusResourceMap';
import { CampusResourceCard } from '../components/campus/CampusResourceCard';
import { CampusLocationCard } from '../components/campus/CampusLocationCard';
import { CampusResourceDetailsModal } from '../components/campus/CampusResourceDetailsModal';
import { AddResourceModal } from '../components/campus/AddResourceModal';
import { campusInventoryService } from '../services/campusInventoryService';
import { CATEGORIES, AVAILABILITY_STATES, RESOURCE_SORT_OPTIONS } from '../data/mockData';
import { useToast } from '../components/common/Toast';
import { useMarketplace } from '../context/MarketplaceContext';

export function CampusInventoryPage() {
  const { addToast } = useToast();
  const { user } = useMarketplace();

  const [resources, setResources] = useState([]);
  const [locations, setLocations] = useState([]);
  const [stats, setStats] = useState({
    totalResources: 128,
    availableNow: 84,
    totalLocations: 9,
    activeListings: 67
  });
  const [loading, setLoading] = useState(true);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedAvailability, setSelectedAvailability] = useState('ALL');
  const [selectedLocationId, setSelectedLocationId] = useState('all');
  const [selectedType, setSelectedType] = useState('All');
  const [sortBy, setSortBy] = useState('nearest');

  // UI view toggles
  const [showMapOnMobile, setShowMapOnMobile] = useState(true);

  // Modal State
  const [activeResource, setActiveResource] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Watches / Notification Subscriptions
  const [watchedResourceIds, setWatchedResourceIds] = useState(() => {
    try {
      const raw = localStorage.getItem('campusswap_inventory_watches');
      return raw ? JSON.parse(raw) : ['res-013', 'res-017'];
    } catch {
      return ['res-013', 'res-017'];
    }
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [resList, locList, statObj, watchedList] = await Promise.all([
        campusInventoryService.getResources(),
        campusInventoryService.getLocations(),
        campusInventoryService.getCampusStatistics(),
        campusInventoryService.getWatchedResources(user?.id)
      ]);
      setResources(resList);
      setLocations(locList);
      setStats(statObj);
      if (watchedList) setWatchedResourceIds(watchedList);
    } catch (e) {
      console.error('Failed to load campus inventory', e);
    } finally {
      setLoading(false);
    }
  };

  // Toggle "Notify Me" subscription
  const handleToggleWatch = async (resourceId) => {
    const isNowWatching = await campusInventoryService.toggleAvailabilityWatch(resourceId, user?.id);
    setWatchedResourceIds((prev) => {
      const updated = isNowWatching
        ? [...prev, resourceId]
        : prev.filter((id) => id !== resourceId);
      try {
        localStorage.setItem('campusswap_inventory_watches', JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });

    if (isNowWatching) {
      addToast('✓ Notification enabled! You will be alerted when this resource is returned.', 'success');
    } else {
      addToast('Notification alert cancelled', 'info');
    }
  };

  // Add Resource submission
  const handleAddResource = async (newResData) => {
    const created = await campusInventoryService.addCampusResource(newResData, user);
    setResources((prev) => [created, ...prev]);
    // Refresh locations & stats
    const [locList, statObj] = await Promise.all([
      campusInventoryService.getLocations(),
      campusInventoryService.getCampusStatistics()
    ]);
    setLocations(locList);
    setStats(statObj);
    addToast(`"${created.name}" registered in campus inventory!`, 'success');
  };

  // Clear filters
  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedAvailability('ALL');
    setSelectedLocationId('all');
    setSelectedType('All');
    setSortBy('nearest');
    addToast('All inventory filters cleared', 'info');
  };

  const isFilterActive = useMemo(() => {
    return (
      searchQuery.trim() !== '' ||
      selectedCategory !== 'all' ||
      selectedAvailability !== 'ALL' ||
      selectedLocationId !== 'all' ||
      selectedType !== 'All' ||
      sortBy !== 'nearest'
    );
  }, [searchQuery, selectedCategory, selectedAvailability, selectedLocationId, selectedType, sortBy]);

  // Filtered & Sorted Resources
  const filteredResources = useMemo(() => {
    return resources
      .filter((resItem) => {
        // Search query
        const q = searchQuery.trim().toLowerCase();
        const matchSearch =
          !q ||
          resItem.name.toLowerCase().includes(q) ||
          (resItem.category && resItem.category.toLowerCase().includes(q)) ||
          (resItem.building && resItem.building.toLowerCase().includes(q)) ||
          (resItem.room && resItem.room.toLowerCase().includes(q)) ||
          (resItem.provider && resItem.provider.toLowerCase().includes(q)) ||
          (resItem.description && resItem.description.toLowerCase().includes(q)) ||
          (resItem.specs &&
            resItem.specs.some((s) => s.label.toLowerCase().includes(q) || s.value.toLowerCase().includes(q)));

        // Category filter
        const matchCat =
          selectedCategory === 'all' || resItem.category.toLowerCase() === selectedCategory.toLowerCase();

        // Availability filter
        const matchAvail =
          selectedAvailability === 'ALL' || resItem.availability === selectedAvailability;

        // Location filter
        const matchLoc =
          selectedLocationId === 'all' || resItem.locationId === selectedLocationId;

        // Type filter
        const matchType =
          selectedType === 'All' || (resItem.type && resItem.type.toLowerCase() === selectedType.toLowerCase());

        return matchSearch && matchCat && matchAvail && matchLoc && matchType;
      })
      .sort((a, b) => {
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
  }, [
    resources,
    searchQuery,
    selectedCategory,
    selectedAvailability,
    selectedLocationId,
    selectedType,
    sortBy
  ]);

  const handleOpenDetails = (res) => {
    setActiveResource(res);
    setIsDetailsModalOpen(true);
  };

  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col antialiased">
      <TopAppBar showBack={true} />

      <main className="flex-1 w-full max-w-5xl mx-auto p-margin-mobile flex flex-col gap-lg pb-32">
        {/* Campus Header & Overview Stats */}
        <div className="bg-gradient-to-br from-secondary via-secondary-container to-primary rounded-[24px] p-6 text-white shadow-xl relative overflow-hidden flex flex-col gap-4">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />

          <div className="z-10 flex items-start justify-between">
            <div className="flex flex-col gap-1">
              <span className="text-[11px] uppercase tracking-widest font-bold text-on-secondary-container bg-white/20 px-2.5 py-0.5 rounded-full self-start">
                Campus Resource Network
              </span>
              <h2 className="font-display-lg-mobile text-[24px] sm:text-[28px] font-extrabold tracking-tight">
                Search & Discover Campus Lab Gear
              </h2>
              <p className="text-body-sm text-white/85 max-w-xl leading-relaxed">
                Explore real-time equipment availability across university laboratories, maker spaces, and student workshops.
              </p>
            </div>

            <Button
              variant="secondary"
              size="sm"
              icon="add_circle"
              onClick={() => setIsAddModalOpen(true)}
              className="bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-md hidden sm:flex shrink-0 font-bold"
            >
              Add Resource
            </Button>
          </div>

          {/* Dynamic Overview Stats Grid */}
          <div className="z-10 grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-white/20">
            <div className="flex flex-col">
              <span className="text-[22px] font-extrabold">{stats.totalResources}</span>
              <span className="text-[10px] text-white/80 uppercase font-semibold">Total Resources</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[22px] font-extrabold text-emerald-300">{stats.availableNow}</span>
              <span className="text-[10px] text-white/80 uppercase font-semibold">Available Now</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[22px] font-extrabold">{stats.totalLocations}</span>
              <span className="text-[10px] text-white/80 uppercase font-semibold">Campus Labs</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[22px] font-extrabold">{stats.activeListings}</span>
              <span className="text-[10px] text-white/80 uppercase font-semibold">Active Ready Gear</span>
            </div>
          </div>

          <span className="text-[10px] text-white/70 italic z-10">
            * Note: Demonstration metrics reflecting current campus maker network status.
          </span>
        </div>

        {/* Mobile Action Bar: Add Resource + Toggle Map */}
        <div className="flex sm:hidden items-center justify-between gap-2">
          <button
            onClick={() => setShowMapOnMobile(!showMapOnMobile)}
            className="flex-1 py-2 px-3 bg-surface-container rounded-xl text-[12px] font-bold text-on-surface border border-outline-variant/30 flex items-center justify-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[16px] text-primary">
              {showMapOnMobile ? 'visibility_off' : 'map'}
            </span>
            <span>{showMapOnMobile ? 'Hide Campus Map' : 'Show Campus Map'}</span>
          </button>

          <Button
            variant="primary"
            size="sm"
            icon="add"
            onClick={() => setIsAddModalOpen(true)}
            className="font-bold shrink-0"
          >
            Add Gear
          </Button>
        </div>

        {/* Interactive Visual Campus Discovery Map */}
        <div className={`${showMapOnMobile ? 'block' : 'hidden sm:block'}`}>
          <CampusResourceMap
            locations={locations}
            selectedLocationId={selectedLocationId}
            onSelectLocation={(locId) => setSelectedLocationId(locId)}
          />
        </div>

        {/* Search Bar & Transaction Switcher */}
        <div className="flex flex-col gap-3">
          {/* Main Search Input */}
          <div className="relative flex items-center w-full">
            <span className="material-symbols-outlined absolute left-3.5 text-on-surface-variant text-[22px] pointer-events-none">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Arduino, ESP32, DSO Oscilloscope, Soldering Station, 3D Printer, Lab..."
              className="w-full pl-11 pr-10 py-3 bg-surface-container-low border border-outline-variant/30 rounded-[16px] text-body-md text-on-surface placeholder:text-outline focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all shadow-xs"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 text-outline hover:text-on-surface p-1 rounded-full cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            )}
          </div>

          {/* Quick Filters Row: Availability States + Sort */}
          <div className="flex items-center justify-between gap-2 overflow-x-auto no-scrollbar pb-1">
            {/* Availability State Switcher */}
            <div className="flex items-center gap-1.5 p-1 bg-surface-container rounded-[14px] border border-outline-variant/30 shrink-0">
              {AVAILABILITY_STATES.map((st) => {
                const isActive = selectedAvailability === st.id;
                return (
                  <button
                    key={st.id}
                    onClick={() => setSelectedAvailability(st.id)}
                    className={`px-3 py-1.5 rounded-[10px] text-label-md font-semibold transition-all cursor-pointer whitespace-nowrap ${
                      isActive
                        ? 'bg-surface-container-lowest text-primary shadow-xs font-bold'
                        : 'text-on-surface-variant hover:text-on-surface'
                    }`}
                  >
                    {st.label}
                  </button>
                );
              })}
            </div>

            {/* Proximity / Sort Dropdown */}
            <div className="flex items-center gap-1.5 bg-surface-container px-3 py-1.5 rounded-[14px] border border-outline-variant/30 shrink-0">
              <span className="material-symbols-outlined text-[16px] text-on-surface-variant">sort</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent text-[12px] font-bold text-on-surface focus:outline-none cursor-pointer"
              >
                {RESOURCE_SORT_OPTIONS.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Secondary Filter Row: Category & Campus Location Dropdowns */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="p-2.5 bg-surface-container rounded-xl border border-outline-variant/30 text-body-sm text-on-surface"
            >
              <option value="all">All Categories</option>
              {CATEGORIES.filter((c) => c.id !== 'all').map((c) => (
                <option key={c.id} value={c.label}>
                  {c.label}
                </option>
              ))}
            </select>

            <select
              value={selectedLocationId}
              onChange={(e) => setSelectedLocationId(e.target.value)}
              className="p-2.5 bg-surface-container rounded-xl border border-outline-variant/30 text-body-sm text-on-surface"
            >
              <option value="all">All Campus Locations ({locations.length})</option>
              {locations.map((loc) => (
                <option key={loc.id} value={loc.id}>
                  {loc.buildingName} ({loc.totalResources || 0} gear)
                </option>
              ))}
            </select>

            <div className="col-span-2 sm:col-span-1 flex items-center justify-end">
              {isFilterActive ? (
                <button
                  onClick={handleClearFilters}
                  className="w-full sm:w-auto p-2.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-primary font-bold text-[12px] border border-outline-variant/30 flex items-center justify-center gap-1 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">clear_all</span>
                  Clear Filters
                </button>
              ) : (
                <span className="text-[12px] text-on-surface-variant font-medium hidden sm:inline">
                  Showing <strong>{filteredResources.length}</strong> resources
                </span>
              )}
            </div>
          </div>

          {/* Active Filter Chips */}
          {isFilterActive && (
            <div className="flex items-center gap-2 flex-wrap bg-surface-container/60 p-2 rounded-2xl border border-outline-variant/30 text-body-sm">
              <span className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">
                Active:
              </span>
              {searchQuery && (
                <span className="bg-surface-container-lowest text-on-surface text-[11px] font-bold px-2.5 py-0.5 rounded-full border flex items-center gap-1">
                  "{searchQuery}"
                  <button onClick={() => setSearchQuery('')} className="cursor-pointer">×</button>
                </span>
              )}
              {selectedCategory !== 'all' && (
                <span className="bg-primary/10 text-primary text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-primary/20 flex items-center gap-1">
                  {selectedCategory}
                  <button onClick={() => setSelectedCategory('all')} className="cursor-pointer">×</button>
                </span>
              )}
              {selectedAvailability !== 'ALL' && (
                <span className="bg-surface-container-lowest text-on-surface text-[11px] font-bold px-2.5 py-0.5 rounded-full border flex items-center gap-1">
                  {selectedAvailability}
                  <button onClick={() => setSelectedAvailability('ALL')} className="cursor-pointer">×</button>
                </span>
              )}
              {selectedLocationId !== 'all' && (
                <span className="bg-secondary/10 text-secondary text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-secondary/20 flex items-center gap-1">
                  {locations.find((l) => l.id === selectedLocationId)?.buildingName}
                  <button onClick={() => setSelectedLocationId('all')} className="cursor-pointer">×</button>
                </span>
              )}
            </div>
          )}
        </div>

        {/* Resources Grid Section */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h3 className="font-heading-lg text-[20px] font-bold text-on-surface">
              Available Lab Gear & Components ({filteredResources.length})
            </h3>
            <span className="text-body-sm text-on-surface-variant">
              Sorted by Proximity
            </span>
          </div>

          {loading ? (
            <div className="p-12 text-center text-on-surface-variant font-medium">
              Scanning campus hardware inventories...
            </div>
          ) : filteredResources.length === 0 ? (
            <div className="bg-surface-container rounded-[24px] p-12 text-center flex flex-col items-center gap-3 border border-outline-variant/30">
              <span className="material-symbols-outlined text-[48px] text-outline">search_off</span>
              <h4 className="font-heading-lg text-heading-lg font-bold text-on-surface">
                No matching campus resources
              </h4>
              <p className="font-body-sm text-body-sm text-on-surface-variant max-w-sm">
                No equipment matches your active search or lab filters. Try expanding your search or registering a new resource.
              </p>
              <div className="flex gap-2 mt-2">
                {isFilterActive && (
                  <Button variant="secondary" size="md" onClick={handleClearFilters}>
                    Clear Filters
                  </Button>
                )}
                <Button
                  variant="primary"
                  size="md"
                  icon="add"
                  onClick={() => setIsAddModalOpen(true)}
                >
                  Add Campus Resource
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-gutter">
              {filteredResources.map((res) => (
                <CampusResourceCard
                  key={res.id}
                  resource={res}
                  onSelectResource={handleOpenDetails}
                  isWatching={watchedResourceIds.includes(res.id)}
                  onToggleWatch={handleToggleWatch}
                />
              ))}
            </div>
          )}
        </div>

        {/* Campus Facilities Exploration Row */}
        <div className="flex flex-col gap-3 pt-4 border-t border-outline-variant/20">
          <div className="flex items-center justify-between">
            <h3 className="font-heading-lg text-[18px] font-bold text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">domain</span>
              Explore by Campus Laboratory & Facility
            </h3>
            <span className="text-[12px] text-on-surface-variant">
              {locations.length} Campus Nodes
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-gutter">
            {locations.slice(0, 3).map((loc) => (
              <CampusLocationCard
                key={loc.id}
                location={loc}
                onExplore={(locId) => {
                  setSelectedLocationId(locId);
                  window.scrollTo({ top: 400, behavior: 'smooth' });
                }}
              />
            ))}
          </div>
        </div>
      </main>

      {/* Details & Request Modal */}
      <CampusResourceDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        resource={activeResource}
        isWatching={activeResource ? watchedResourceIds.includes(activeResource.id) : false}
        onToggleWatch={handleToggleWatch}
        onRequestResource={(res, note) => {
          addToast(`Request for ${res.name} submitted to ${res.room}!`, 'success');
        }}
      />

      {/* Add Resource Modal */}
      <AddResourceModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddResource={handleAddResource}
      />

      <BottomNav />
    </div>
  );
}
