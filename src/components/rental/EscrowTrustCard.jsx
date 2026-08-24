import React from 'react';

export function EscrowTrustCard({ deposit = 300 }) {
  return (
    <div className="bg-surface-container-low rounded-[24px] p-md flex flex-col justify-center items-center text-center gap-md border border-primary/20 relative overflow-hidden shadow-xs">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
      
      <div className="w-12 h-12 rounded-full bg-primary-container flex items-center justify-center text-primary z-10 shadow-xs">
        <span
          className="material-symbols-outlined text-[26px]"
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          shield_lock
        </span>
      </div>

      <div className="z-10 flex flex-col gap-xs">
        <h4 className="font-button-lg text-button-lg text-on-surface font-bold">
          Escrow Protected
        </h4>
        <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
          Your ₹{deposit} security deposit is securely held in escrow and will be automatically refunded upon verified return.
        </p>
      </div>
    </div>
  );
}
