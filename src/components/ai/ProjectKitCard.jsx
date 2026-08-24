import React from 'react';
import { Button } from '../common/Button';

export function ProjectKitCard({
  kit,
  onSaveKit,
  onRequestMissing,
  isSaved = false
}) {
  return (
    <div className="bg-gradient-to-br from-surface-container via-surface-container to-surface-container-high rounded-[24px] p-6 border border-primary/30 shadow-md flex flex-col gap-4 relative overflow-hidden">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-primary text-white flex items-center justify-center shrink-0 shadow-md">
            <span className="material-symbols-outlined text-[28px]">inventory_2</span>
          </div>

          <div className="flex flex-col">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-primary">
              AI Project Kit Bundle
            </span>
            <h3 className="font-heading-lg text-[18px] font-bold text-on-surface">
              {kit.title}
            </h3>
          </div>
        </div>

        <span className="bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2.5 py-1 rounded-full border border-emerald-300">
          {kit.readinessPercentage}% In Stock
        </span>
      </div>

      <p className="text-body-sm text-on-surface-variant leading-relaxed">
        {kit.description}
      </p>

      {/* Kit Metrics */}
      <div className="grid grid-cols-3 gap-2 bg-surface-container-lowest p-3 rounded-2xl border border-outline-variant/20">
        <div className="flex flex-col">
          <span className="text-[10px] text-outline uppercase font-semibold">Total Parts</span>
          <span className="text-[14px] font-extrabold text-on-surface mt-0.5">
            {kit.componentCount} Units
          </span>
        </div>

        <div className="flex flex-col">
          <span className="text-[10px] text-outline uppercase font-semibold">Available</span>
          <span className="text-[14px] font-extrabold text-emerald-600 mt-0.5">
            {kit.availableCount} Ready
          </span>
        </div>

        <div className="flex flex-col">
          <span className="text-[10px] text-outline uppercase font-semibold">Missing</span>
          <span className="text-[14px] font-extrabold text-rose-600 mt-0.5">
            {kit.missingCount} Needed
          </span>
        </div>
      </div>

      {/* Pricing Estimate Note */}
      <div className="flex items-center justify-between text-body-sm text-on-surface-variant pt-1 border-t border-outline-variant/20">
        <span>Estimated Total BOM Value: <strong>₹{kit.totalEstimatedBOM}</strong></span>
        <span className="text-primary font-bold">~₹{kit.estimatedRentalRate}/day rental</span>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-2 pt-1">
        <Button
          variant="secondary"
          size="md"
          fullWidth
          icon={isSaved ? 'check' : 'bookmark'}
          onClick={onSaveKit}
          className="text-[12px] bg-surface-container-lowest"
        >
          {isSaved ? 'Saved to Profile' : 'Save Project Kit'}
        </Button>

        <Button
          variant="primary"
          size="md"
          fullWidth
          icon="send"
          onClick={onRequestMissing}
          className="text-[12px] font-bold"
        >
          Request Missing
        </Button>
      </div>
    </div>
  );
}
