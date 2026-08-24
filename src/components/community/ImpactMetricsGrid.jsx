import React from 'react';
import { DEMO_IMPACT_METRICS } from '../../services/impactService';

export function ImpactMetricsGrid({ metrics = DEMO_IMPACT_METRICS }) {
  return (
    <div className="bg-surface-container rounded-[24px] p-6 border border-outline-variant/30 shadow-xs flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[24px]">eco</span>
          </div>
          <div className="flex flex-col">
            <h3 className="font-heading-lg text-[18px] font-bold text-on-surface">
              Campus Circular Economy & Impact
            </h3>
            <span className="text-[11px] text-outline">
              * Demonstration sustainability metrics across campus laboratories
            </span>
          </div>
        </div>
      </div>

      {/* 5-Metric Counter Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
        <div className="bg-surface-container-lowest p-3 rounded-2xl border border-outline-variant/20 flex flex-col">
          <span className="text-[10px] text-outline uppercase font-semibold">Components Reused</span>
          <span className="text-[18px] font-extrabold text-emerald-600 mt-0.5">
            {metrics.componentsReused}
          </span>
        </div>

        <div className="bg-surface-container-lowest p-3 rounded-2xl border border-outline-variant/20 flex flex-col">
          <span className="text-[10px] text-outline uppercase font-semibold">Items Donated</span>
          <span className="text-[18px] font-extrabold text-primary mt-0.5">
            {metrics.itemsDonated}
          </span>
        </div>

        <div className="bg-surface-container-lowest p-3 rounded-2xl border border-outline-variant/20 flex flex-col">
          <span className="text-[10px] text-outline uppercase font-semibold">Projects Supported</span>
          <span className="text-[18px] font-extrabold text-secondary mt-0.5">
            {metrics.projectsSupported}
          </span>
        </div>

        <div className="bg-surface-container-lowest p-3 rounded-2xl border border-outline-variant/20 flex flex-col">
          <span className="text-[10px] text-outline uppercase font-semibold">Equipment Shared</span>
          <span className="text-[18px] font-extrabold text-on-surface mt-0.5">
            {metrics.equipmentShared}
          </span>
        </div>

        <div className="bg-surface-container-lowest p-3 rounded-2xl border border-outline-variant/20 flex flex-col col-span-2 sm:col-span-1">
          <span className="text-[10px] text-outline uppercase font-semibold">E-Waste Avoided</span>
          <span className="text-[18px] font-extrabold text-emerald-700 mt-0.5">
            {metrics.ewasteAvoidedKg} kg
          </span>
        </div>
      </div>

      {/* Badges Carousel / Row */}
      <div className="flex flex-col gap-2 pt-2 border-t border-outline-variant/20">
        <span className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">
          Sustainability & Contributor Accreditations
        </span>

        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          {(metrics.badges || []).map((badge) => (
            <div
              key={badge.id}
              className="bg-surface-container-lowest px-3 py-2 rounded-xl border border-outline-variant/20 flex items-center gap-2 shrink-0 shadow-xs"
            >
              <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[16px]">{badge.icon}</span>
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-[11px] text-on-surface">{badge.label}</span>
                <span className="text-[9px] text-on-surface-variant truncate max-w-[140px]">
                  {badge.desc}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
