import React from 'react';

export function ReputationCard({ reputation }) {
  if (!reputation) return null;

  return (
    <div className="bg-surface-container rounded-[24px] p-6 border border-outline-variant/30 shadow-xs flex flex-col gap-5">
      {/* Top Metrics Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/15 text-amber-600 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[28px]">stars</span>
          </div>

          <div className="flex flex-col">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-primary">
              Campus Trust Index
            </span>
            <div className="flex items-center gap-2">
              <span className="font-heading-xl text-[24px] font-extrabold text-on-surface">
                {reputation.overallRating} ★
              </span>
              <span className="text-[12px] font-bold text-emerald-600 bg-emerald-100 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full">
                Top Rated Peer
              </span>
            </div>
          </div>
        </div>

        <span className="text-[11px] text-outline italic">
          * Calculated from mock exchanges
        </span>
      </div>

      {/* 4 Stat Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="bg-surface-container-lowest p-3 rounded-2xl border border-outline-variant/20 flex flex-col">
          <span className="text-[10px] text-outline uppercase font-semibold">Total Exchanges</span>
          <span className="text-[16px] font-extrabold text-on-surface mt-0.5">
            {reputation.totalTransactions} Swaps
          </span>
        </div>

        <div className="bg-surface-container-lowest p-3 rounded-2xl border border-outline-variant/20 flex flex-col">
          <span className="text-[10px] text-outline uppercase font-semibold">Successful</span>
          <span className="text-[16px] font-extrabold text-emerald-600 mt-0.5">
            {reputation.successfulExchanges} Verified
          </span>
        </div>

        <div className="bg-surface-container-lowest p-3 rounded-2xl border border-outline-variant/20 flex flex-col">
          <span className="text-[10px] text-outline uppercase font-semibold">On-Time Returns</span>
          <span className="text-[16px] font-extrabold text-primary mt-0.5">
            {reputation.onTimeReturnsPercentage}%
          </span>
        </div>

        <div className="bg-surface-container-lowest p-3 rounded-2xl border border-outline-variant/20 flex flex-col">
          <span className="text-[10px] text-outline uppercase font-semibold">Response Rate</span>
          <span className="text-[16px] font-extrabold text-secondary mt-0.5">
            {reputation.responseRatePercentage}%
          </span>
        </div>
      </div>

      {/* Trust Badges Bar */}
      <div className="flex flex-col gap-2 pt-2 border-t border-outline-variant/20">
        <span className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">
          Campus Verification & Accreditations
        </span>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {(reputation.badges || []).map((badge) => (
            <div
              key={badge.id}
              className="bg-surface-container-lowest p-2.5 rounded-xl border border-outline-variant/20 flex items-center gap-2.5"
            >
              <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[18px]">{badge.icon}</span>
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-[12px] text-on-surface">{badge.label}</span>
                <span className="text-[10px] text-on-surface-variant">{badge.desc}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
