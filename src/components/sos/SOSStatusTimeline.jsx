import React from 'react';

const STEPS = [
  { key: 'ACTIVE', label: 'Active SOS', icon: 'campaign' },
  { key: 'MATCH_FOUND', label: 'Match Found', icon: 'search_check' },
  { key: 'RESOURCE_OFFERED', label: 'Offered', icon: 'handshake' },
  { key: 'HANDOVER_PENDING', label: 'Handover', icon: 'qr_code_scanner' },
  { key: 'COMPLETED', label: 'Completed', icon: 'check_circle' }
];

export function SOSStatusTimeline({ currentStatus = 'ACTIVE' }) {
  const getStepIndex = (status) => {
    switch (status) {
      case 'ACTIVE':
        return 0;
      case 'MATCH_FOUND':
        return 1;
      case 'RESOURCE_OFFERED':
        return 2;
      case 'ACCEPTED':
      case 'HANDOVER_PENDING':
        return 3;
      case 'COMPLETED':
        return 4;
      default:
        return 0;
    }
  };

  const currentIdx = getStepIndex(currentStatus);

  return (
    <div className="w-full py-2">
      <div className="flex items-center justify-between relative">
        {/* Background Connecting Line */}
        <div className="absolute top-1/2 left-4 right-4 h-0.5 bg-outline-variant/30 -translate-y-1/2 z-0" />
        
        {/* Active Connecting Line */}
        <div
          className="absolute top-1/2 left-4 h-0.5 bg-primary -translate-y-1/2 transition-all duration-500 z-0"
          style={{ width: `${(currentIdx / (STEPS.length - 1)) * 90}%` }}
        />

        {STEPS.map((step, idx) => {
          const isCompleted = idx <= currentIdx;
          const isCurrent = idx === currentIdx;

          return (
            <div key={step.key} className="flex flex-col items-center gap-1 z-10">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-[14px] transition-all ${
                  isCurrent
                    ? 'bg-primary text-white ring-4 ring-primary/20 shadow-sm'
                    : isCompleted
                    ? 'bg-primary text-white'
                    : 'bg-surface-container-high text-on-surface-variant border border-outline-variant/30'
                }`}
              >
                <span className="material-symbols-outlined text-[15px]">{step.icon}</span>
              </div>
              <span
                className={`text-[9px] font-bold uppercase tracking-wider hidden sm:block ${
                  isCurrent ? 'text-primary' : isCompleted ? 'text-on-surface' : 'text-outline'
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
