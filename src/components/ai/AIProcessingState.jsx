import React, { useState, useEffect } from 'react';

const STAGES = [
  "ANALYZING REQUIREMENT & SPECIFICATIONS",
  "SEARCHING CAMPUS RESOURCE NETWORK",
  "CROSS-REFERENCING LAB INVENTORIES",
  "SCORING DISTANCE, PRICE & TRUST",
  "MATCH ANALYSIS COMPLETE"
];

export function AIProcessingState({ onComplete, duration = 1600 }) {
  const [currentStageIdx, setCurrentStageIdx] = useState(0);

  useEffect(() => {
    const intervalTime = duration / STAGES.length;
    const interval = setInterval(() => {
      setCurrentStageIdx((prev) => {
        if (prev < STAGES.length - 1) {
          return prev + 1;
        } else {
          clearInterval(interval);
          if (onComplete) setTimeout(onComplete, 200);
          return prev;
        }
      });
    }, intervalTime);

    return () => clearInterval(interval);
  }, [duration, onComplete]);

  const progressPercent = Math.min(100, Math.round(((currentStageIdx + 1) / STAGES.length) * 100));

  return (
    <div className="bg-surface-container rounded-[24px] p-8 border border-primary/30 shadow-lg flex flex-col items-center justify-center gap-6 text-center animate-scale-up relative overflow-hidden">
      {/* Subtle Glowing Radial Background */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/10 blur-xl pointer-events-none" />

      {/* AI Processing Radar Ring */}
      <div className="relative w-20 h-20 flex items-center justify-center">
        <div className="absolute inset-0 rounded-full border-4 border-primary/20 animate-ping" />
        <div className="w-16 h-16 rounded-full bg-primary/15 border-2 border-primary flex items-center justify-center text-primary shadow-inner">
          <span className="material-symbols-outlined text-[32px] animate-spin" style={{ animationDuration: '3s' }}>
            neurology
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-1.5 z-10 max-w-sm">
        <span className="text-[11px] font-extrabold uppercase tracking-widest text-primary">
          Campus Intelligence Engine
        </span>
        <h4 className="font-heading-lg text-[18px] font-bold text-on-surface">
          {STAGES[currentStageIdx]}
        </h4>
        <span className="text-[12px] text-on-surface-variant font-mono">
          Stage {currentStageIdx + 1} of {STAGES.length} • {progressPercent}%
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full max-w-xs bg-surface-container-high h-2.5 rounded-full overflow-hidden border border-outline-variant/30 z-10">
        <div
          className="bg-gradient-to-r from-primary via-secondary to-primary h-full rounded-full transition-all duration-300 shadow-sm"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
    </div>
  );
}
