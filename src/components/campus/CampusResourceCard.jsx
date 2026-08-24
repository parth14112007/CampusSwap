import React from 'react';
import { Button } from '../common/Button';

export function CampusResourceCard({
  resource,
  onSelectResource,
  isWatching = false,
  onToggleWatch
}) {
  const getAvailabilityBadge = (state) => {
    switch (state) {
      case 'AVAILABLE':
        return {
          icon: 'check_circle',
          text: 'Available Now',
          classes: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/70 dark:text-emerald-300 dark:border-emerald-800/40'
        };
      case 'LIMITED':
        return {
          icon: 'warning',
          text: 'Limited Stock',
          classes: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/70 dark:text-amber-300 dark:border-amber-800/40'
        };
      case 'UNAVAILABLE':
        return {
          icon: 'cancel',
          text: 'Currently In Use',
          classes: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/70 dark:text-rose-300 dark:border-rose-800/40'
        };
      case 'UNKNOWN':
      default:
        return {
          icon: 'help_outline',
          text: 'Not Recently Updated',
          classes: 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-900/70 dark:text-slate-300 dark:border-slate-800/40'
        };
    }
  };

  const badge = getAvailabilityBadge(resource.availability);
  const isAvailable = resource.availability === 'AVAILABLE' || resource.availability === 'LIMITED';

  return (
    <div
      onClick={() => onSelectResource(resource)}
      className="bg-surface-container rounded-[24px] overflow-hidden border border-outline-variant/30 shadow-xs hover:shadow-md hover:border-primary/40 transition-all duration-200 flex flex-col justify-between group cursor-pointer"
    >
      {/* Top Image Container */}
      <div className="relative w-full h-44 bg-surface-variant overflow-hidden">
        <img
          src={resource.image}
          alt={resource.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />

        {/* Availability Badge */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 z-10">
          <span
            className={`px-2.5 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider border backdrop-blur-md flex items-center gap-1 shadow-xs ${badge.classes}`}
          >
            <span
              className="material-symbols-outlined text-[13px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              {badge.icon}
            </span>
            {badge.text}
          </span>
        </div>

        {/* Distance Badge */}
        <div className="absolute bottom-2.5 left-3 bg-on-surface/80 backdrop-blur-md text-white px-2.5 py-0.5 rounded-full text-[11px] font-medium flex items-center gap-1">
          <span className="material-symbols-outlined text-[13px] text-primary-fixed">near_me</span>
          <span>{resource.distanceText || `${resource.distanceMeters || 100}m away`}</span>
        </div>

        {/* Type / Access Tag */}
        <div className="absolute bottom-2.5 right-3 bg-surface-container-lowest/90 backdrop-blur-md text-on-surface px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider border border-outline-variant/30">
          {resource.type || 'Lab Access'}
        </div>
      </div>

      {/* Card Body */}
      <div className="p-4 flex-1 flex flex-col justify-between gap-3">
        <div>
          <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider mb-1 text-primary">
            <span>{resource.category}</span>
            <span className="text-on-surface-variant font-normal">
              {resource.availableStock || 0}/{resource.totalStock || 1} Ready
            </span>
          </div>

          <h3 className="font-heading-lg text-[16px] text-on-surface font-bold line-clamp-1 group-hover:text-primary transition-colors">
            {resource.name}
          </h3>

          <div className="flex items-center gap-1.5 text-[12px] text-on-surface-variant mt-1">
            <span className="material-symbols-outlined text-[15px] text-primary shrink-0">
              location_on
            </span>
            <span className="truncate">
              {resource.building} • {resource.room}
            </span>
          </div>

          <p className="font-body-sm text-[12px] text-on-surface-variant line-clamp-2 mt-2 leading-relaxed">
            {resource.description}
          </p>
        </div>

        {/* Footer Actions */}
        <div className="pt-3 border-t border-outline-variant/20 flex flex-col gap-2">
          <div className="flex items-center justify-between text-[11px] text-on-surface-variant">
            <span>Provider: <strong>{resource.provider}</strong></span>
            {resource.isVerified && (
              <span className="text-primary font-bold flex items-center gap-0.5">
                <span className="material-symbols-outlined text-[14px]">verified</span> Verified
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <Button
              variant="secondary"
              size="sm"
              fullWidth
              onClick={(e) => {
                e.stopPropagation();
                onSelectResource(resource);
              }}
              className="text-[12px] py-1.5 bg-surface-container-lowest"
            >
              Details
            </Button>

            {isAvailable ? (
              <Button
                variant="primary"
                size="sm"
                fullWidth
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectResource(resource, 'request');
                }}
                className="text-[12px] py-1.5 font-bold"
              >
                Request
              </Button>
            ) : (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleWatch(resource.id);
                }}
                className={`py-1.5 px-2 rounded-[14px] text-[11px] font-bold border transition-all cursor-pointer flex items-center justify-center gap-1 ${
                  isWatching
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                    : 'bg-primary/10 text-primary border-primary/30 hover:bg-primary/20'
                }`}
              >
                <span className="material-symbols-outlined text-[14px]">
                  {isWatching ? 'check' : 'notifications_active'}
                </span>
                <span className="truncate">
                  {isWatching ? 'Subscribed' : 'Notify Me'}
                </span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
