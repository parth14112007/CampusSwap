import React from 'react';

export function CampusResourceMap({
  locations = [],
  selectedLocationId = 'all',
  onSelectLocation
}) {
  const selectedLocation = locations.find((l) => l.id === selectedLocationId);

  return (
    <div className="bg-surface-container rounded-[24px] overflow-hidden border border-outline-variant/30 shadow-sm flex flex-col">
      {/* Map Header Controls */}
      <div className="px-4 py-3 bg-surface-container-high/80 backdrop-blur-md border-b border-outline-variant/20 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-[20px]">explore</span>
          <span className="font-heading-lg text-[14px] font-bold text-on-surface">
            Campus Visual Discovery Map
          </span>
          <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full hidden sm:inline">
            Interactive Zone Grid
          </span>
        </div>

        {selectedLocationId !== 'all' && (
          <button
            onClick={() => onSelectLocation('all')}
            className="text-[12px] font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[14px]">refresh</span>
            Show Entire Campus
          </button>
        )}
      </div>

      {/* Stylized SVG Map Canvas */}
      <div className="relative w-full h-[320px] sm:h-[380px] bg-slate-900 overflow-hidden select-none">
        {/* SVG Background: Pathways, Lawn Grids, Buildings */}
        <svg
          viewBox="0 0 1000 600"
          className="w-full h-full object-cover"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="grid-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0f172a" />
              <stop offset="100%" stopColor="#1e293b" />
            </linearGradient>
            <pattern id="campus-grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#334155" strokeWidth="0.5" strokeOpacity="0.4" />
            </pattern>
            <radialGradient id="hub-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Map Base Surface */}
          <rect width="1000" height="600" fill="url(#grid-grad)" />
          <rect width="1000" height="600" fill="url(#campus-grid)" />

          {/* Central Courtyard Glow */}
          <circle cx="500" cy="300" r="220" fill="url(#hub-glow)" />

          {/* Stylized Green Campus Parks & Lawns */}
          <path
            d="M 120,180 Q 220,140 320,200 T 480,220 L 460,340 Q 300,380 180,320 Z"
            fill="#064e3b"
            fillOpacity="0.45"
            stroke="#059669"
            strokeWidth="1.5"
            strokeDasharray="4,4"
          />
          <path
            d="M 640,160 Q 760,120 860,180 L 880,300 Q 780,340 660,280 Z"
            fill="#064e3b"
            fillOpacity="0.45"
            stroke="#059669"
            strokeWidth="1.5"
            strokeDasharray="4,4"
          />
          <path
            d="M 380,420 Q 500,380 620,440 L 600,540 Q 480,570 360,520 Z"
            fill="#064e3b"
            fillOpacity="0.35"
            stroke="#059669"
            strokeWidth="1"
          />

          {/* Campus Connecting Walkways & Corridors */}
          <path
            d="M 100,200 L 900,200 M 100,420 L 900,420 M 260,80 L 260,520 M 500,60 L 500,540 M 740,80 L 740,520"
            fill="none"
            stroke="#475569"
            strokeWidth="8"
            strokeLinecap="round"
            strokeOpacity="0.7"
          />
          <path
            d="M 100,200 L 900,200 M 100,420 L 900,420 M 260,80 L 260,520 M 500,60 L 500,540 M 740,80 L 740,520"
            fill="none"
            stroke="#94a3b8"
            strokeWidth="1.5"
            strokeDasharray="6,6"
            strokeOpacity="0.8"
          />

          {/* Building Outline Footprints */}
          {locations.map((loc) => {
            const x = (loc.mapX / 100) * 1000;
            const y = (loc.mapY / 100) * 600;
            const isSelected = selectedLocationId === loc.id;

            return (
              <g key={`footprint-${loc.id}`}>
                <rect
                  x={x - 65}
                  y={y - 30}
                  width="130"
                  height="60"
                  rx="14"
                  fill={isSelected ? "#1e1b4b" : "#1e293b"}
                  stroke={isSelected ? "#6366f1" : "#475569"}
                  strokeWidth={isSelected ? "2.5" : "1"}
                  className="transition-all duration-300"
                />
                <text
                  x={x}
                  y={y - 12}
                  textAnchor="middle"
                  fill={isSelected ? "#c7d2fe" : "#94a3b8"}
                  fontSize="11"
                  fontWeight="bold"
                  fontFamily="system-ui, sans-serif"
                >
                  {loc.buildingName.toUpperCase()}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Interactive Location Markers Overlay */}
        {locations.map((loc) => {
          const isSelected = selectedLocationId === loc.id;
          return (
            <div
              key={loc.id}
              onClick={() => onSelectLocation(loc.id === selectedLocationId ? 'all' : loc.id)}
              style={{
                left: `${loc.mapX}%`,
                top: `${loc.mapY}%`,
                transform: 'translate(-50%, -50%)'
              }}
              className="absolute z-20 cursor-pointer group"
            >
              {/* Marker Pin Badge */}
              <div
                className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-full border shadow-lg transition-all duration-200 ${
                  isSelected
                    ? 'bg-primary text-white border-white ring-4 ring-primary/40 scale-110 z-30'
                    : 'bg-surface-container-lowest/95 backdrop-blur-md text-on-surface border-outline-variant/50 hover:scale-105 hover:border-primary'
                }`}
              >
                <span
                  className={`material-symbols-outlined text-[16px] ${
                    isSelected ? 'text-white' : 'text-primary'
                  }`}
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  {loc.icon || 'location_on'}
                </span>

                <div className="flex flex-col text-left leading-none">
                  <span className="text-[11px] font-bold whitespace-nowrap">
                    {loc.buildingName}
                  </span>
                  <span
                    className={`text-[9px] font-semibold ${
                      isSelected ? 'text-white/80' : 'text-on-surface-variant'
                    }`}
                  >
                    {loc.totalResources || 0} gear ({loc.availableResources || 0} ready)
                  </span>
                </div>
              </div>

              {/* Pulsing Ripple if Selected */}
              {isSelected && (
                <div className="absolute inset-0 -m-1 rounded-full border-2 border-primary animate-ping pointer-events-none opacity-75" />
              )}
            </div>
          );
        })}

        {/* Map Legend Overlay */}
        <div className="absolute bottom-3 left-3 bg-slate-900/90 backdrop-blur-md border border-slate-700/60 rounded-xl px-3 py-1.5 text-white flex items-center gap-3 text-[10px] font-medium pointer-events-none">
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Available Gear</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-primary" />
            <span>Active Labs ({locations.length})</span>
          </div>
        </div>
      </div>

      {/* Selected Location Preview Footer Drawer */}
      {selectedLocation && (
        <div className="p-4 bg-surface-container-lowest border-t border-outline-variant/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-scale-up">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[24px]">
                {selectedLocation.icon || 'domain'}
              </span>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-heading-lg text-[15px] font-bold text-on-surface">
                  {selectedLocation.labName}
                </span>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                  {selectedLocation.availableResources} Available Now
                </span>
              </div>
              <span className="text-[12px] text-on-surface-variant">
                {selectedLocation.roomNumber} • {selectedLocation.floor} • In charge: {selectedLocation.managerName}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={() => onSelectLocation('all')}
              className="text-[12px] font-bold text-on-surface-variant hover:text-on-surface px-3 py-1.5 rounded-xl border border-outline-variant/30 cursor-pointer"
            >
              Clear Focus
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
