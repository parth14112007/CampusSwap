import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { TopAppBar } from '../components/common/TopAppBar';
import { BottomNav } from '../components/common/BottomNav';
import { SearchBar } from '../components/marketplace/SearchBar';
import { CategoryFilter } from '../components/marketplace/CategoryFilter';
import { ListingCard } from '../components/marketplace/ListingCard';
import { useMarketplace } from '../context/MarketplaceContext';
import { Button } from '../components/common/Button';

export function ExplorePage() {
  const navigate = useNavigate();
  const {
    filteredItems,
    sosRequests,
    user,
    activeRentals,
    loading,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    selectedType,
    setSelectedType,
    selectedCondition,
    setSelectedCondition,
    availableOnly,
    setAvailableOnly,
    clearFilters,
    isFilterActive
  } = useMarketplace();

  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'featured' | 'recent'

  const activeSos = sosRequests.find((s) => s.status === 'Open');

  // Tab filtering on top of search/filters
  const displayItems = filteredItems.filter((item) => {
    if (activeTab === 'featured') return item.featured === true;
    if (activeTab === 'recent') {
      const isRecent = new Date(item.createdAt || 0) > new Date(Date.now() - 7 * 86400000);
      return isRecent || item.featured;
    }
    return true;
  });

  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col antialiased">
      {/* Sticky Glassmorphic Header */}
      <TopAppBar />

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-5xl mx-auto p-margin-mobile flex flex-col gap-lg pb-28">
        {/* Campus Hero Card */}
        <div className="bg-gradient-to-br from-primary via-primary-container to-secondary rounded-[24px] p-6 text-white shadow-lg relative overflow-hidden flex flex-col gap-4">
          {/* Ambient Glow circles */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-secondary-container/30 rounded-full blur-xl -ml-10 -mb-10 pointer-events-none" />

          <div className="z-10 flex flex-col gap-1">
            <span className="text-[11px] uppercase tracking-widest font-bold text-on-primary-container bg-white/15 px-2.5 py-0.5 rounded-full self-start">
              Campus Hardware Exchange
            </span>
            <h2 className="font-display-lg-mobile text-[24px] sm:text-[28px] font-extrabold tracking-tight">
              Buy, Rent & Borrow Lab Gear
            </h2>
            <p className="text-body-sm text-white/85 max-w-lg leading-relaxed">
              Rent Arduino, RPi, DSO probes, motor drivers & microcontrollers from fellow engineering students with automated escrow protection.
            </p>
          </div>

          {/* Quick Stats Pill Row */}
          <div className="z-10 grid grid-cols-3 gap-2 pt-2 border-t border-white/20">
            <div className="flex flex-col">
              <span className="text-[18px] font-extrabold">₹0 Fee</span>
              <span className="text-[10px] text-white/80 uppercase font-semibold">Peer Swaps</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[18px] font-extrabold">100%</span>
              <span className="text-[10px] text-white/80 uppercase font-semibold">Escrow Backed</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[18px] font-extrabold">{user?.campus ? user.campus.split('•')[0] : 'MIT Tech'}</span>
              <span className="text-[10px] text-white/80 uppercase font-semibold">Verified Network</span>
            </div>
          </div>
        </div>

        {/* Active Rental Quick Notice Banner (if any active) */}
        {activeRentals.length > 0 && (
          <Link
            to="/active-rental"
            className="bg-primary/10 border border-primary/25 rounded-[20px] p-3.5 flex items-center justify-between hover:bg-primary/15 transition-all shadow-xs group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[22px]">timer</span>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="text-[13px] font-bold text-on-surface">Active Rental in Progress</span>
                  <span className="text-[10px] font-extrabold bg-primary text-white px-2 py-0.2 rounded-full">
                    {activeRentals[0].daysRemaining}d left
                  </span>
                </div>
                <span className="text-[12px] text-on-surface-variant">
                  {activeRentals[0].itemTitle} • Tap to view escrow timeline & return QR
                </span>
              </div>
            </div>
            <span className="material-symbols-outlined text-primary group-hover:translate-x-1 transition-transform">
              arrow_forward
            </span>
          </Link>
        )}

        {/* Emergency SOS Ticker */}
        {activeSos && (
          <div className="bg-error/10 border border-error/25 rounded-[20px] p-3.5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-error text-white flex items-center justify-center shrink-0 animate-pulse">
                <span className="material-symbols-outlined text-[20px]">bolt</span>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-extrabold uppercase tracking-wide text-error">
                    Campus SOS Alert
                  </span>
                  <span className="text-[11px] text-on-surface-variant font-medium">
                    {activeSos.timeAgo}
                  </span>
                </div>
                <span className="text-[13px] font-bold text-on-surface line-clamp-1">
                  {activeSos.title} ({activeSos.lab})
                </span>
              </div>
            </div>
            <Link
              to="/sos"
              className="bg-error text-white text-[12px] font-bold px-3 py-1.5 rounded-xl hover:opacity-90 transition-all shrink-0 ml-2"
            >
              Assist
            </Link>
          </div>
        )}

        {/* Search & Transaction Type Switcher */}
        <SearchBar />

        {/* Horizontal Category Selector */}
        <CategoryFilter />

        {/* Active Filter Badges Bar */}
        {isFilterActive && (
          <div className="flex items-center gap-2 flex-wrap bg-surface-container/60 p-2.5 rounded-2xl border border-outline-variant/30 text-body-sm">
            <span className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">
              Active Filters:
            </span>
            {searchQuery && (
              <span className="bg-surface-container-lowest text-on-surface text-[11px] font-bold px-2.5 py-1 rounded-full border flex items-center gap-1">
                Keyword: "{searchQuery}"
                <button onClick={() => setSearchQuery('')} className="cursor-pointer text-outline hover:text-on-surface">×</button>
              </span>
            )}
            {selectedCategory !== 'all' && (
              <span className="bg-primary/10 text-primary text-[11px] font-bold px-2.5 py-1 rounded-full border border-primary/20 flex items-center gap-1">
                Category: {selectedCategory}
                <button onClick={() => setSelectedCategory('all')} className="cursor-pointer hover:opacity-75">×</button>
              </span>
            )}
            {selectedType !== 'All' && (
              <span className="bg-secondary/10 text-secondary text-[11px] font-bold px-2.5 py-1 rounded-full border border-secondary/20 flex items-center gap-1">
                Type: {selectedType}
                <button onClick={() => setSelectedType('All')} className="cursor-pointer hover:opacity-75">×</button>
              </span>
            )}
            {selectedCondition !== 'All' && (
              <span className="bg-surface-container-lowest text-on-surface text-[11px] font-bold px-2.5 py-1 rounded-full border flex items-center gap-1">
                Condition: {selectedCondition}
                <button onClick={() => setSelectedCondition('All')} className="cursor-pointer text-outline hover:text-on-surface">×</button>
              </span>
            )}
            {availableOnly && (
              <span className="bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2.5 py-1 rounded-full border border-emerald-300 flex items-center gap-1">
                Available Only
                <button onClick={() => setAvailableOnly(false)} className="cursor-pointer hover:opacity-75">×</button>
              </span>
            )}
            <button
              onClick={clearFilters}
              className="text-[11px] font-bold text-primary hover:underline ml-auto cursor-pointer"
            >
              Reset All
            </button>
          </div>
        )}

        {/* View Section Tabs */}
        <div className="flex items-center gap-2 border-b border-outline-variant/20 pb-2">
          <button
            onClick={() => setActiveTab('all')}
            className={`text-[13px] font-bold pb-1 cursor-pointer transition-colors ${
              activeTab === 'all'
                ? 'text-primary border-b-2 border-primary'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            All Gear ({filteredItems.length})
          </button>
          <button
            onClick={() => setActiveTab('featured')}
            className={`text-[13px] font-bold pb-1 cursor-pointer transition-colors ${
              activeTab === 'featured'
                ? 'text-primary border-b-2 border-primary'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            ⭐ Featured & Lab Picks
          </button>
          <button
            onClick={() => setActiveTab('recent')}
            className={`text-[13px] font-bold pb-1 cursor-pointer transition-colors ${
              activeTab === 'recent'
                ? 'text-primary border-b-2 border-primary'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            ⚡ Recently Added
          </button>
        </div>

        {/* Marketplace Items Grid */}
        <div className="flex flex-col gap-3">
          {loading ? (
            <div className="p-12 text-center text-on-surface-variant font-medium">
              Loading engineering components...
            </div>
          ) : displayItems.length === 0 ? (
            <div className="bg-surface-container rounded-[24px] p-12 text-center flex flex-col items-center gap-3 border border-outline-variant/30">
              <span className="material-symbols-outlined text-[48px] text-outline">search_off</span>
              <h4 className="font-heading-lg text-heading-lg font-bold text-on-surface">
                No components found
              </h4>
              <p className="font-body-sm text-body-sm text-on-surface-variant max-w-sm">
                No engineering hardware matches your search or active filters.
              </p>
              <div className="flex gap-2 mt-2">
                {isFilterActive && (
                  <Button variant="secondary" size="md" onClick={clearFilters}>
                    Clear Filters
                  </Button>
                )}
                <Button
                  variant="primary"
                  size="md"
                  icon="add"
                  onClick={() => navigate('/list-item')}
                >
                  List this Component
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-gutter">
              {displayItems.map((item) => (
                <ListingCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Mobile-first Bottom Navigation */}
      <BottomNav />
    </div>
  );
}
