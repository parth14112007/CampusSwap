import React from 'react';
import { Button } from '../common/Button';

export function CampusLocationCard({ location, onExplore }) {
  return (
    <div className="bg-surface-container rounded-[24px] p-5 border border-outline-variant/30 shadow-xs hover:border-primary/40 hover:shadow-md transition-all flex flex-col justify-between gap-4 group">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0 border border-primary/20 group-hover:scale-105 transition-transform">
            <span className="material-symbols-outlined text-[26px]">
              {location.icon || 'apartment'}
            </span>
          </div>
          <div className="flex flex-col">
            <h3 className="font-heading-lg text-[16px] font-bold text-on-surface leading-tight">
              {location.buildingName}
            </h3>
            <span className="text-[12px] text-on-surface-variant line-clamp-1 mt-0.5">
              {location.labName}
            </span>
          </div>
        </div>

        <span className="bg-surface-container-lowest text-primary text-[11px] font-bold px-2.5 py-1 rounded-full border border-outline-variant/30">
          {location.totalResources || 0} Gear
        </span>
      </div>

      {/* Lab Details & Stats */}
      <div className="flex flex-col gap-2 bg-surface-container-lowest p-3 rounded-2xl border border-outline-variant/20">
        <div className="flex items-center justify-between text-body-sm text-on-surface-variant">
          <span>Room Code:</span>
          <strong className="text-on-surface">{location.roomNumber}</strong>
        </div>
        <div className="flex items-center justify-between text-body-sm text-on-surface-variant">
          <span>Available Right Now:</span>
          <strong className="text-emerald-600">{location.availableResources || 0} items</strong>
        </div>
        <div className="flex items-center justify-between text-body-sm text-on-surface-variant">
          <span>In Charge:</span>
          <span className="text-on-surface text-[12px] truncate max-w-[140px] font-medium">{location.managerName}</span>
        </div>
      </div>

      {/* Sample Hardware Tags */}
      {location.sampleTags && location.sampleTags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {location.sampleTags.slice(0, 4).map((tag, idx) => (
            <span
              key={idx}
              className="bg-surface-container-high text-on-surface-variant text-[10px] font-bold px-2 py-0.5 rounded-md"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Explore Button */}
      <Button
        variant="secondary"
        size="md"
        fullWidth
        icon="travel_explore"
        onClick={() => onExplore(location.id)}
        className="text-[13px] bg-surface-container-lowest"
      >
        Explore Lab Resources
      </Button>
    </div>
  );
}
