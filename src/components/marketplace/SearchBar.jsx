import React, { useState } from 'react';
import { useMarketplace } from '../../context/MarketplaceContext';
import { TRANSACTION_TYPES, CONDITIONS, SORT_OPTIONS } from '../../data/mockData';
import { Button } from '../common/Button';

export function SearchBar() {
  const {
    searchQuery,
    setSearchQuery,
    selectedType,
    setSelectedType,
    selectedCondition,
    setSelectedCondition,
    priceRange,
    setPriceRange,
    availableOnly,
    setAvailableOnly,
    selectedLocation,
    setSelectedLocation,
    sortBy,
    setSortBy,
    clearFilters,
    isFilterActive
  } = useMarketplace();

  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);

  return (
    <div className="flex flex-col gap-3 w-full">
      {/* Search Input Bar + Filter Drawer Trigger */}
      <div className="flex items-center gap-2 w-full">
        <div className="relative flex-1 flex items-center">
          <span className="material-symbols-outlined absolute left-3.5 text-on-surface-variant text-[22px] pointer-events-none">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Arduino, ESP32, Motors, Oscilloscope, Sensors, Specs..."
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

        {/* Filter Toggle Button */}
        <button
          onClick={() => setIsFilterPanelOpen(!isFilterPanelOpen)}
          className={`p-3 rounded-[16px] border flex items-center justify-center transition-all cursor-pointer relative shrink-0 ${
            isFilterPanelOpen || isFilterActive
              ? 'bg-primary text-white border-primary shadow-xs'
              : 'bg-surface-container-low border-outline-variant/30 text-on-surface hover:bg-surface-container'
          }`}
          aria-label="Filter listings"
          title="Advanced Filters"
        >
          <span className="material-symbols-outlined text-[22px]">tune</span>
          {isFilterActive && (
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-secondary rounded-full border-2 border-surface" />
          )}
        </button>
      </div>

      {/* Quick Transaction Type Switcher Tabs: All, Rent, Buy, Borrow */}
      <div className="flex items-center justify-between gap-2 overflow-x-auto no-scrollbar pb-0.5">
        <div className="flex items-center gap-1.5 p-1 bg-surface-container rounded-[14px] border border-outline-variant/30 shrink-0">
          {TRANSACTION_TYPES.map((type) => {
            const isActive = selectedType === type;
            return (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`px-3 py-1.5 rounded-[10px] text-label-md font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-surface-container-lowest text-primary shadow-xs font-bold'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                {type === 'All' ? 'All Types' : type}
              </button>
            );
          })}
        </div>

        {/* Sort Selector Dropdown */}
        <div className="flex items-center gap-1.5 bg-surface-container px-3 py-1.5 rounded-[14px] border border-outline-variant/30 shrink-0">
          <span className="material-symbols-outlined text-[16px] text-on-surface-variant">sort</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-transparent text-[12px] font-bold text-on-surface focus:outline-none cursor-pointer"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.id} value={opt.id}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Expandable Advanced Filters Drawer */}
      {isFilterPanelOpen && (
        <div className="bg-surface-container-lowest/95 backdrop-blur-xl rounded-[20px] p-5 border border-outline-variant/30 shadow-md flex flex-col gap-4 animate-scale-up">
          <div className="flex items-center justify-between border-b border-outline-variant/20 pb-2">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[20px]">filter_list</span>
              <span className="font-heading-lg text-[15px] font-bold text-on-surface">
                Advanced Marketplace Filters
              </span>
            </div>
            {isFilterActive && (
              <button
                onClick={clearFilters}
                className="text-[12px] font-bold text-primary hover:underline cursor-pointer"
              >
                Clear All Filters
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Condition Filter */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">
                Condition
              </label>
              <select
                value={selectedCondition}
                onChange={(e) => setSelectedCondition(e.target.value)}
                className="p-2.5 bg-surface-container rounded-xl border border-outline-variant/30 text-body-sm text-on-surface"
              >
                {CONDITIONS.map((cond) => (
                  <option key={cond} value={cond}>
                    {cond === 'All' ? 'All Conditions' : cond}
                  </option>
                ))}
              </select>
            </div>

            {/* Price Range Filter */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">
                  Max Price / Rent (₹)
                </label>
                <span className="text-[12px] font-bold text-primary">₹{priceRange.max}</span>
              </div>
              <input
                type="range"
                min="0"
                max="5000"
                step="50"
                value={priceRange.max}
                onChange={(e) => setPriceRange({ ...priceRange, max: Number(e.target.value) })}
                className="w-full accent-primary cursor-pointer mt-2"
              />
            </div>

            {/* Location Filter */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">
                Campus Location
              </label>
              <input
                type="text"
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                placeholder="e.g. Block B, FabLab, Hostel..."
                className="p-2.5 bg-surface-container rounded-xl border border-outline-variant/30 text-body-sm text-on-surface"
              />
            </div>
          </div>

          {/* Availability Checkbox */}
          <div className="pt-2 border-t border-outline-variant/20 flex items-center justify-between">
            <label className="flex items-center gap-2 text-body-sm font-semibold text-on-surface cursor-pointer">
              <input
                type="checkbox"
                checked={availableOnly}
                onChange={(e) => setAvailableOnly(e.target.checked)}
                className="w-4 h-4 accent-primary rounded cursor-pointer"
              />
              <span>Show only Available / In-Stock items</span>
            </label>

            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsFilterPanelOpen(false)}
            >
              Done
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
