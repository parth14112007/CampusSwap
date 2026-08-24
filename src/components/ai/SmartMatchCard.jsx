import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MatchScore } from './MatchScore';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { useMarketplace } from '../../context/MarketplaceContext';

export function SmartMatchCard({ match, onRent, onRequest }) {
  const navigate = useNavigate();
  const { savedItemIds, toggleSaveItem } = useMarketplace();
  const isSaved = savedItemIds.includes(match.id);

  const isBest = match.rank === 'BEST MATCH';

  return (
    <div
      className={`rounded-[24px] overflow-hidden border transition-all duration-200 flex flex-col justify-between shadow-xs hover:shadow-md ${
        isBest
          ? 'bg-surface-container-lowest border-primary/50 ring-2 ring-primary/20'
          : 'bg-surface-container-lowest border-outline-variant/30 hover:border-primary/30'
      }`}
    >
      {/* Header Rank Bar */}
      <div
        className={`px-4 py-2 flex items-center justify-between border-b ${
          isBest
            ? 'bg-gradient-to-r from-primary/15 via-secondary/15 to-transparent border-primary/20 text-primary'
            : 'bg-surface-container-high/60 border-outline-variant/20 text-on-surface-variant'
        }`}
      >
        <div className="flex items-center gap-1.5 font-bold text-[12px] uppercase tracking-wider">
          <span className="material-symbols-outlined text-[16px]">
            {isBest ? 'workspace_premium' : 'recommend'}
          </span>
          <span>{match.rank}</span>
        </div>

        <MatchScore score={match.matchPercentage} />
      </div>

      {/* Main Content Body */}
      <div className="p-5 flex flex-col gap-4">
        {/* Top Info Row */}
        <div className="flex items-start gap-4">
          <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden bg-surface-variant shrink-0 border border-outline-variant/20">
            <img
              src={match.image}
              alt={match.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-1.5 left-1.5">
              <span
                className={`px-1.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase ${
                  match.available
                    ? 'bg-emerald-950/80 text-emerald-300'
                    : 'bg-rose-950/80 text-rose-300'
                }`}
              >
                {match.available ? 'Ready' : 'In Use'}
              </span>
            </div>
          </div>

          <div className="flex flex-col flex-1 gap-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-primary truncate">
                {match.category}
              </span>
              <button
                onClick={() => toggleSaveItem(match.id)}
                aria-label="Save to favorites"
                className="text-on-surface-variant hover:text-error cursor-pointer p-1"
              >
                <span
                  className={`material-symbols-outlined text-[18px] ${
                    isSaved ? 'text-error fill' : ''
                  }`}
                  style={{ fontVariationSettings: isSaved ? "'FILL' 1" : "'FILL' 0" }}
                >
                  favorite
                </span>
              </button>
            </div>

            <h3
              onClick={() => navigate(match.linkedListingId ? `/item/${match.linkedListingId}` : `/item/${match.id}`)}
              className="font-heading-lg text-[17px] font-bold text-on-surface line-clamp-1 hover:text-primary cursor-pointer transition-colors"
            >
              {match.title}
            </h3>

            <div className="flex items-center gap-2 text-[12px] text-on-surface-variant">
              <span className="flex items-center gap-0.5">
                <span className="material-symbols-outlined text-[14px] text-primary">location_on</span>
                {match.location}
              </span>
              <span>•</span>
              <span className="font-semibold text-on-surface">
                {match.distanceText || 'Nearby'}
              </span>
            </div>

            <div className="flex items-baseline gap-2 mt-1">
              <span className="font-heading-lg text-[18px] font-extrabold text-on-surface">
                ₹{match.price}
              </span>
              <span className="text-[11px] text-on-surface-variant">
                {match.priceUnit || '/day'}
              </span>
              {match.condition && (
                <span className="bg-surface-container-high px-2 py-0.5 rounded-full text-[10px] font-bold text-on-surface-variant ml-auto">
                  {match.condition}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* AI Match Rationale Callout */}
        <div className="p-3 rounded-2xl bg-surface-container border border-outline-variant/20 flex items-start gap-2.5">
          <span className="material-symbols-outlined text-primary text-[18px] shrink-0 mt-0.5">
            psychology
          </span>
          <div className="flex flex-col">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-primary">
              AI Match Rationale
            </span>
            <p className="text-[12px] text-on-surface-variant leading-relaxed mt-0.5">
              {match.reasonText}
            </p>
          </div>
        </div>

        {/* Owner & Trust Row */}
        <div className="flex items-center justify-between text-body-sm text-on-surface-variant pt-1 border-t border-outline-variant/20">
          <div className="flex items-center gap-1.5">
            <span className="text-[12px]">Lender: <strong>{match.owner?.name}</strong></span>
            {match.owner?.verified && (
              <span
                className="material-symbols-outlined text-primary text-[14px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                verified
              </span>
            )}
          </div>

          <span className="text-amber-600 font-bold text-[12px]">
            ★ {match.owner?.rating || 4.9}
          </span>
        </div>

        {/* Action Button Grid */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <Button
            variant="secondary"
            size="sm"
            fullWidth
            onClick={() =>
              navigate(match.linkedListingId ? `/item/${match.linkedListingId}` : `/item/${match.id}`)
            }
            className="text-[12px] bg-surface-container"
          >
            View Listing
          </Button>

          <Button
            variant="primary"
            size="sm"
            fullWidth
            onClick={() => {
              if (onRent) onRent(match);
              else navigate(match.linkedListingId ? `/item/${match.linkedListingId}` : `/item/${match.id}`);
            }}
            className="text-[12px] font-bold"
          >
            {match.type === 'Borrow' ? 'Request Borrow' : 'Rent with Escrow'}
          </Button>
        </div>
      </div>
    </div>
  );
}
