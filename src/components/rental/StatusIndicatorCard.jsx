import React from 'react';

export function StatusIndicatorCard({
  statusText = 'RETURN IN 4 DAYS',
  progressPercent = 60,
  startDate = 'Oct 12',
  dueDate = 'Oct 18',
  statusBadge = 'Status'
}) {
  return (
    <div className="bg-primary-container text-on-primary-container rounded-[24px] p-lg shadow-lg relative overflow-hidden flex flex-col gap-md">
      {/* Ambient background glow circle */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary opacity-20 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />

      {/* Top Header */}
      <div className="flex justify-between items-center z-10">
        <span className="font-label-md text-label-md bg-on-primary/20 px-sm py-xs rounded-full uppercase font-bold tracking-wider">
          {statusBadge}
        </span>
        <span className="material-symbols-outlined text-[32px]">timer</span>
      </div>

      {/* Main Countdown & Progress */}
      <div className="z-10 flex flex-col gap-sm mt-unit">
        <h3 className="font-display-lg-mobile text-[26px] sm:text-display-lg-mobile font-extrabold tracking-tight">
          {statusText}
        </h3>

        {/* Progress Bar */}
        <div className="w-full bg-on-primary/20 h-unit rounded-full mt-sm overflow-hidden">
          <div
            className="bg-on-primary h-full rounded-full transition-all duration-500 ease-out"
            style={{ width: `${Math.min(100, Math.max(5, progressPercent))}%` }}
          />
        </div>

        {/* Timeline Dates */}
        <div className="flex justify-between font-label-md text-label-md mt-xs opacity-90 font-medium">
          <span>Started: {startDate}</span>
          <span>Due: {dueDate}</span>
        </div>
      </div>
    </div>
  );
}
