import React from 'react';

export function MatchScore({ score = 90, label = 'MATCH', size = 'md' }) {
  const isHigh = score >= 85;
  const isMedium = score >= 70 && score < 85;

  const colorClasses = isHigh
    ? 'bg-primary/10 text-primary border-primary/30 ring-primary/20'
    : isMedium
    ? 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30 ring-amber-500/20'
    : 'bg-surface-container-high text-on-surface border-outline-variant/30';

  if (size === 'sm') {
    return (
      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-extrabold border flex items-center gap-1 ${colorClasses}`}>
        <span className="material-symbols-outlined text-[13px]">auto_awesome</span>
        <span>{score}% {label}</span>
      </span>
    );
  }

  return (
    <div className={`px-3 py-1 rounded-full text-[12px] font-extrabold border flex items-center gap-1.5 shadow-xs ${colorClasses}`}>
      <span className="material-symbols-outlined text-[15px] animate-pulse">auto_awesome</span>
      <span>{score}% {label}</span>
    </div>
  );
}
