import React from 'react';

export function ProjectReadiness({
  availableCount = 0,
  totalCount = 0,
  percentage = 0,
  estimatedCost = 0
}) {
  const isReady = percentage >= 80;
  const isModerate = percentage >= 50 && percentage < 80;

  return (
    <div className="bg-surface-container rounded-[24px] p-5 border border-outline-variant/30 shadow-xs flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-[22px]">
            analytics
          </span>
          <span className="font-heading-lg text-[15px] font-bold text-on-surface">
            Campus Project Readiness
          </span>
        </div>

        <span
          className={`px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider border ${
            isReady
              ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
              : isModerate
              ? 'bg-amber-100 text-amber-800 border-amber-300'
              : 'bg-rose-100 text-rose-800 border-rose-300'
          }`}
        >
          {percentage}% Ready to Build
        </span>
      </div>

      {/* Visual Progress Bar */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between text-body-sm">
          <span className="text-on-surface font-bold text-[13px]">
            {availableCount} of {totalCount} Components In Stock
          </span>
          <span className="text-on-surface-variant text-[12px]">
            {totalCount - availableCount} Missing / Needs Request
          </span>
        </div>

        <div className="w-full bg-surface-container-high h-3 rounded-full overflow-hidden border border-outline-variant/20">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              isReady ? 'bg-emerald-500' : isModerate ? 'bg-amber-500' : 'bg-primary'
            }`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      {/* Key Metrics Pill Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2 border-t border-outline-variant/20">
        <div className="bg-surface-container-lowest p-2.5 rounded-xl border border-outline-variant/20 flex flex-col">
          <span className="text-[10px] text-outline uppercase font-semibold">Available</span>
          <span className="text-[14px] font-extrabold text-emerald-600 mt-0.5">
            {availableCount} Units
          </span>
        </div>

        <div className="bg-surface-container-lowest p-2.5 rounded-xl border border-outline-variant/20 flex flex-col">
          <span className="text-[10px] text-outline uppercase font-semibold">Estimated BOM</span>
          <span className="text-[14px] font-extrabold text-on-surface mt-0.5">
            ₹{estimatedCost}
          </span>
        </div>

        <div className="bg-surface-container-lowest p-2.5 rounded-xl border border-outline-variant/20 flex flex-col col-span-2 sm:col-span-1">
          <span className="text-[10px] text-outline uppercase font-semibold">Est. Peer Rental</span>
          <span className="text-[14px] font-extrabold text-primary mt-0.5">
            ~₹{Math.round(estimatedCost * 0.08)}/day
          </span>
        </div>
      </div>
    </div>
  );
}
