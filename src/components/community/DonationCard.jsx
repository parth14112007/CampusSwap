import React from 'react';
import { Button } from '../common/Button';

export function DonationCard({ donation, onClaim }) {
  const isClaimed = donation.status === 'Claimed';

  return (
    <div className="bg-surface-container-lowest rounded-[24px] p-5 border border-outline-variant/30 shadow-xs flex flex-col justify-between gap-4 hover:border-primary/40 transition-all">
      <div className="flex flex-col gap-3">
        {/* Header Badges */}
        <div className="flex items-center justify-between">
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300">
            Free Campus Reuse
          </span>

          <span className="text-[11px] font-bold text-on-surface-variant bg-surface-container px-2 py-0.5 rounded-md">
            {donation.category}
          </span>
        </div>

        {/* Title & Description */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <h4 className="font-heading-lg text-[16px] font-bold text-on-surface">
              {donation.title}
            </h4>
            <span className="text-[11px] font-extrabold text-primary">
              {donation.quantity} × Available
            </span>
          </div>

          <span className="text-[12px] text-emerald-700 font-semibold flex items-center gap-1">
            <span className="material-symbols-outlined text-[15px]">check_circle</span>
            Condition: {donation.condition}
          </span>

          <p className="text-body-sm text-on-surface-variant text-[12px] leading-relaxed line-clamp-2 mt-0.5">
            {donation.description}
          </p>
        </div>

        {/* Eco Impact Estimate */}
        <div className="flex items-center gap-2 text-[11px] text-on-surface-variant bg-surface-container-low p-2 rounded-xl border border-outline-variant/20">
          <span className="material-symbols-outlined text-emerald-600 text-[16px]">eco</span>
          <span>Prevents <strong>{donation.eWastePreventedGrams}g e-waste</strong> • <strong>{donation.co2SavedKg}kg CO₂ saved</strong></span>
        </div>
      </div>

      {/* Footer Location & Action */}
      <div className="pt-3 border-t border-outline-variant/20 flex items-center justify-between gap-3">
        <div className="flex flex-col text-[11px] text-on-surface-variant">
          <span>Pickup: <strong>{donation.location}</strong></span>
          <span className="text-[10px] text-outline">Donor: {donation.donorName}</span>
        </div>

        {isClaimed ? (
          <span className="text-emerald-700 font-bold text-[12px] bg-emerald-100 px-3 py-1.5 rounded-xl flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">check</span>
            Claimed
          </span>
        ) : (
          <Button
            variant="primary"
            size="sm"
            icon="volunteer_activism"
            onClick={() => onClaim && onClaim(donation)}
            className="text-[12px] font-bold"
          >
            Claim Free Item
          </Button>
        )}
      </div>
    </div>
  );
}
