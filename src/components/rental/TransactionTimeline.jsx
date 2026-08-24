import React from 'react';

export function TransactionTimeline({ timeline = [] }) {
  return (
    <div className="bg-surface-container-lowest rounded-[24px] p-lg border border-outline-variant/30 shadow-xs flex flex-col gap-md">
      <div className="flex items-center justify-between mb-sm">
        <h3 className="font-heading-lg text-heading-lg text-on-surface font-bold">
          Transaction Timeline
        </h3>
        <span className="font-label-md text-label-md text-primary font-semibold bg-primary/10 px-2 py-0.5 rounded-full">
          Verified Flow
        </span>
      </div>

      <div className="flex flex-col gap-0 relative">
        {/* Continuous Vertical Line */}
        <div className="absolute left-[13px] top-4 bottom-8 w-[2px] bg-outline-variant/40" />

        {timeline.map((step, idx) => {
          const isCompleted = step.status === 'completed';
          const isActive = step.status === 'active';
          const isPending = step.status === 'pending';

          return (
            <div key={step.id || idx} className="flex items-start gap-md py-sm relative z-10">
              {/* Status Circle Icon */}
              <div className="bg-background rounded-full p-0.5 flex items-center justify-center shrink-0">
                {isCompleted && (
                  <span
                    className="material-symbols-outlined text-primary text-[22px]"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    check_circle
                  </span>
                )}
                {isActive && (
                  <span
                    className="material-symbols-outlined text-primary text-[22px] animate-pulse"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    radio_button_checked
                  </span>
                )}
                {isPending && (
                  <span className="material-symbols-outlined text-outline text-[22px]">
                    radio_button_unchecked
                  </span>
                )}
              </div>

              {/* Step Details */}
              <div className="flex flex-col pt-xs">
                <span
                  className={`font-button-lg text-button-lg ${
                    isActive
                      ? 'text-primary font-bold'
                      : isCompleted
                      ? 'text-on-surface font-semibold'
                      : 'text-outline font-medium'
                  }`}
                >
                  {step.title}
                </span>
                {step.time && (
                  <span
                    className={`font-body-sm text-body-sm ${
                      isActive ? 'text-primary/85 font-medium' : 'text-on-surface-variant'
                    }`}
                  >
                    {step.time}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
