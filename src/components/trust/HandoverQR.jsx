import React from 'react';

export function HandoverQR({
  token = 'CAMPUS_SWAP_AUTH_8941_VERIFY',
  itemTitle = 'Hardware Component',
  quantity = 1,
  ownerName = 'Arjun Sharma',
  borrowerName = 'Priya Patel',
  location = 'Academic Block B Courtyard',
  status = 'QR_GENERATED'
}) {
  return (
    <div className="bg-surface-container rounded-[24px] p-6 border border-primary/30 shadow-lg flex flex-col items-center gap-5 text-center relative overflow-hidden">
      {/* Top Banner */}
      <div className="flex flex-col gap-1">
        <span className="text-[11px] font-extrabold uppercase tracking-widest text-primary">
          Simulated Physical Handover Verification
        </span>
        <h3 className="font-heading-lg text-[20px] font-bold text-on-surface">
          {itemTitle} ({quantity}x)
        </h3>
        <span className="text-[12px] text-on-surface-variant">
          Exchange between <strong>{ownerName}</strong> & <strong>{borrowerName}</strong>
        </span>
      </div>

      {/* Stylized QR Code Visual Canvas */}
      <div className="relative p-4 bg-white rounded-3xl border-2 border-primary/40 shadow-inner flex flex-col items-center justify-center">
        {/* Animated Scanning Line */}
        <div className="absolute inset-x-4 top-4 h-1 bg-primary/80 rounded-full blur-[1px] animate-bounce pointer-events-none" />

        <svg
          className="w-48 h-48 sm:w-56 sm:h-56"
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Corner Markers */}
          <rect x="5" y="5" width="25" height="25" rx="4" stroke="#1E293B" strokeWidth="4" />
          <rect x="11" y="11" width="13" height="13" rx="2" fill="#1E293B" />
          
          <rect x="70" y="5" width="25" height="25" rx="4" stroke="#1E293B" strokeWidth="4" />
          <rect x="76" y="11" width="13" height="13" rx="2" fill="#1E293B" />

          <rect x="5" y="70" width="25" height="25" rx="4" stroke="#1E293B" strokeWidth="4" />
          <rect x="11" y="76" width="13" height="13" rx="2" fill="#1E293B" />

          {/* Center Logo Marker */}
          <circle cx="50" cy="50" r="12" fill="#2563EB" />
          <path d="M46 50L49 53L55 47" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

          {/* Stylized Matrix Elements */}
          <rect x="36" y="8" width="6" height="6" fill="#1E293B" rx="1" />
          <rect x="46" y="8" width="6" height="6" fill="#1E293B" rx="1" />
          <rect x="56" y="8" width="6" height="6" fill="#1E293B" rx="1" />
          <rect x="8" y="36" width="6" height="6" fill="#1E293B" rx="1" />
          <rect x="8" y="46" width="6" height="6" fill="#1E293B" rx="1" />
          <rect x="8" y="56" width="6" height="6" fill="#1E293B" rx="1" />

          <rect x="36" y="20" width="8" height="8" fill="#1E293B" rx="1.5" />
          <rect x="52" y="20" width="8" height="8" fill="#1E293B" rx="1.5" />
          <rect x="20" y="36" width="8" height="8" fill="#1E293B" rx="1.5" />
          <rect x="20" y="52" width="8" height="8" fill="#1E293B" rx="1.5" />

          <rect x="70" y="36" width="7" height="7" fill="#1E293B" rx="1.5" />
          <rect x="82" y="36" width="8" height="8" fill="#1E293B" rx="1.5" />
          <rect x="70" y="50" width="8" height="8" fill="#1E293B" rx="1.5" />
          <rect x="82" y="50" width="7" height="7" fill="#1E293B" rx="1.5" />

          <rect x="36" y="70" width="7" height="7" fill="#1E293B" rx="1.5" />
          <rect x="50" y="70" width="8" height="8" fill="#1E293B" rx="1.5" />
          <rect x="36" y="82" width="8" height="8" fill="#1E293B" rx="1.5" />
          <rect x="50" y="82" width="7" height="7" fill="#1E293B" rx="1.5" />
          <rect x="70" y="70" width="20" height="20" fill="#1E293B" rx="3" />
        </svg>

        <span className="text-[10px] font-mono text-slate-700 font-bold tracking-widest mt-2">
          {token}
        </span>
      </div>

      {/* Safety Reminder Prompt */}
      <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800/40 rounded-2xl p-3.5 flex items-start gap-2.5 text-left">
        <span className="material-symbols-outlined text-amber-600 text-[20px] shrink-0 mt-0.5">
          verified_user
        </span>
        <div className="flex flex-col">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-800 dark:text-amber-300">
            Campus Meetup Safety Checklist
          </span>
          <p className="text-[12px] text-amber-900 dark:text-amber-200 mt-0.5 leading-relaxed">
            Meet at a designated campus location ({location}) and verify that the hardware powers on and matches specifications before completing the physical exchange.
          </p>
        </div>
      </div>
    </div>
  );
}
