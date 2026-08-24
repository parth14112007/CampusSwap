import React from 'react';
import { Button } from '../common/Button';

export function PartnerCard({ partner, onInvite }) {
  return (
    <div className="bg-surface-container-lowest rounded-[24px] p-5 border border-outline-variant/30 shadow-xs hover:border-primary/40 hover:shadow-md transition-all flex flex-col justify-between gap-4">
      <div className="flex flex-col gap-3">
        {/* Header with Avatar, Details & Match Score */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl overflow-hidden bg-surface-container shrink-0 border border-outline-variant/20 shadow-xs">
              <img
                src={partner.avatar}
                alt={partner.name}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <h3 className="font-heading-lg text-[16px] font-bold text-on-surface">
                  {partner.name}
                </h3>
                {partner.verified && (
                  <span
                    className="material-symbols-outlined text-primary text-[16px]"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                    title="Verified Student"
                  >
                    verified
                  </span>
                )}
              </div>
              <span className="text-[12px] text-on-surface-variant">
                {partner.year} • {partner.dept}
              </span>
              <span className="text-[11px] text-amber-600 font-bold mt-0.5">
                ★ {partner.rating} Rating • {partner.availability}
              </span>
            </div>
          </div>

          {partner.matchScore && (
            <span className="px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-primary/10 text-primary border border-primary/20 shrink-0 flex items-center gap-1">
              <span className="material-symbols-outlined text-[13px]">auto_awesome</span>
              <span>{partner.matchScore}% MATCH</span>
            </span>
          )}
        </div>

        {/* Bio */}
        {partner.bio && (
          <p className="text-body-sm text-on-surface-variant text-[12px] leading-relaxed line-clamp-2">
            {partner.bio}
          </p>
        )}

        {/* Skills Chips */}
        <div className="flex flex-wrap gap-1 pt-1">
          {partner.skills.map((skill, idx) => (
            <span
              key={idx}
              className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-surface-container text-on-surface border border-outline-variant/20"
            >
              {skill}
            </span>
          ))}
        </div>
      </div>

      {/* Footer Action */}
      <div className="pt-3 border-t border-outline-variant/20 flex items-center justify-between gap-3">
        <span className="text-[11px] text-outline truncate">
          Active: {partner.currentProjects?.join(', ') || 'Available'}
        </span>

        <Button
          variant="primary"
          size="sm"
          icon="group_add"
          onClick={() => onInvite && onInvite(partner)}
          className="text-[12px] font-bold shrink-0"
        >
          Invite to Project
        </Button>
      </div>
    </div>
  );
}
