import React from 'react';
import { useNavigate } from 'react-router-dom';

export function ComponentRequirementRow({
  component,
  onNotify,
  onRequest,
  isNotified = false
}) {
  const navigate = useNavigate();

  const isAvailable = component.status === 'AVAILABLE';
  const isLimited = component.status === 'LIMITED';
  const isMissing = component.status === 'NOT_FOUND';

  return (
    <div className="p-4 bg-surface-container-lowest rounded-[20px] border border-outline-variant/30 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      {/* Component Details */}
      <div className="flex items-start gap-3">
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
            isAvailable
              ? 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-800/40'
              : isLimited
              ? 'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-950/40 dark:border-amber-800/40'
              : 'bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-950/40 dark:border-rose-800/40'
          }`}
        >
          <span className="material-symbols-outlined text-[20px]">
            {isAvailable ? 'check_circle' : isLimited ? 'warning' : 'search'}
          </span>
        </div>

        <div className="flex flex-col">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="font-heading-lg text-[15px] font-bold text-on-surface">
              {component.name}
            </h4>
            <span className="text-[11px] font-bold text-outline bg-surface-container-high px-2 py-0.2 rounded-full">
              {component.quantity} ×
            </span>
          </div>

          <span className="text-[12px] text-on-surface-variant mt-0.5">
            Role: <strong>{component.role}</strong>
          </span>

          <div className="flex items-center gap-2 text-[11px] text-on-surface-variant mt-1">
            <span
              className={`font-extrabold uppercase tracking-wider ${
                isAvailable
                  ? 'text-emerald-700 dark:text-emerald-300'
                  : isLimited
                  ? 'text-amber-700 dark:text-amber-300'
                  : 'text-rose-700 dark:text-rose-300'
              }`}
            >
              {isAvailable ? '🟢 Available' : isLimited ? '🟡 Limited' : '🔴 Missing on Campus'}
            </span>
            <span>•</span>
            <span className="truncate">{component.location}</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
        {isAvailable || isLimited ? (
          <button
            onClick={() => {
              if (component.linkedListingId) {
                navigate(`/item/${component.linkedListingId}`);
              } else {
                navigate(`/inventory`);
              }
            }}
            className="px-3 py-1.5 rounded-xl bg-primary text-white font-bold text-[12px] hover:bg-primary-hover transition-colors cursor-pointer flex items-center gap-1 shadow-xs"
          >
            <span>View Match</span>
            <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
          </button>
        ) : (
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => navigate(`/explore?search=${encodeURIComponent(component.name)}`)}
              className="px-2.5 py-1.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface text-[11px] font-bold border border-outline-variant/30 cursor-pointer"
              title="Search marketplace"
            >
              Find on Market
            </button>

            <button
              onClick={() => (onNotify ? onNotify(component.name) : null)}
              className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold border transition-colors cursor-pointer flex items-center gap-1 ${
                isNotified
                  ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                  : 'bg-primary/10 text-primary border-primary/20 hover:bg-primary/20'
              }`}
            >
              <span className="material-symbols-outlined text-[14px]">
                {isNotified ? 'check' : 'notifications_active'}
              </span>
              <span>{isNotified ? 'Notified' : 'Notify Me'}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
