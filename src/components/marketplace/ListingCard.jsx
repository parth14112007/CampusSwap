import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { useMarketplace } from '../../context/MarketplaceContext';

export function ListingCard({ item }) {
  const navigate = useNavigate();
  const { savedItemIds, toggleSaveItem } = useMarketplace();
  const isSaved = savedItemIds.includes(item.id);

  const getBadgeVariant = (type) => {
    switch (type?.toLowerCase()) {
      case 'rent':
        return 'rent';
      case 'buy':
        return 'buy';
      case 'borrow':
        return 'borrow';
      default:
        return 'primary';
    }
  };

  return (
    <div
      onClick={() => navigate(`/item/${item.id}`)}
      className="bg-surface-container rounded-[24px] overflow-hidden border border-outline-variant/30 shadow-xs hover:shadow-md hover:border-primary/40 transition-all duration-200 flex flex-col justify-between group cursor-pointer"
    >
      {/* Top Image Container */}
      <div className="relative w-full h-48 bg-surface-variant overflow-hidden">
        <img
          src={item.image}
          alt={item.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />

        {/* Floating Badges */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 z-10 flex-wrap">
          <Badge variant={getBadgeVariant(item.type)} size="sm">
            {item.type}
          </Badge>
          {item.condition && (
            <Badge variant="glass" size="sm">
              {item.condition}
            </Badge>
          )}
        </div>

        {/* Favorite Heart Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleSaveItem(item.id);
          }}
          aria-label={isSaved ? 'Remove from favorites' : 'Save to favorites'}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-surface-container-lowest/85 backdrop-blur-md text-on-surface hover:bg-surface-container-lowest flex items-center justify-center transition-all active:scale-90 z-10 shadow-xs hover:scale-105"
        >
          <span
            className={`material-symbols-outlined text-[18px] transition-colors ${
              isSaved ? 'text-error fill' : 'text-on-surface-variant'
            }`}
            style={{ fontVariationSettings: isSaved ? "'FILL' 1" : "'FILL' 0" }}
          >
            favorite
          </span>
        </button>

        {/* Availability & Location Bar */}
        <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between pointer-events-none">
          <div className="bg-on-surface/80 backdrop-blur-md text-white px-2.5 py-0.5 rounded-full text-[11px] font-medium flex items-center gap-1 max-w-[70%]">
            <span className="material-symbols-outlined text-[13px] text-primary-fixed">location_on</span>
            <span className="truncate">{item.location}</span>
          </div>

          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider backdrop-blur-md ${
              item.available !== false
                ? 'bg-emerald-950/80 text-emerald-300'
                : 'bg-rose-950/80 text-rose-300'
            }`}
          >
            {item.available !== false ? 'In Stock' : 'In Use'}
          </span>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-4 flex-1 flex flex-col justify-between gap-3">
        <div>
          <div className="flex items-center justify-between text-on-surface-variant text-[11px] font-bold uppercase tracking-wider mb-1">
            <span className="text-primary truncate">{item.category}</span>
            {item.deposit > 0 && (
              <span className="text-on-surface-variant font-medium shrink-0">₹{item.deposit} Escrow</span>
            )}
          </div>

          <h3 className="font-heading-lg text-[17px] text-on-surface line-clamp-1 font-bold group-hover:text-primary transition-colors">
            {item.title}
          </h3>

          <p className="font-body-sm text-[13px] text-on-surface-variant line-clamp-2 mt-1 leading-relaxed">
            {item.description}
          </p>
        </div>

        {/* Owner Info & Price Footer */}
        <div className="pt-3 border-t border-outline-variant/20 flex flex-col gap-2.5 mt-auto">
          <div className="flex items-center justify-between">
            {/* Owner Details */}
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full overflow-hidden bg-surface-variant shrink-0 border border-outline-variant/30">
                <img
                  src={item.owner?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80'}
                  alt={item.owner?.name || 'Owner'}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1">
                  <span className="font-body-sm text-[12px] font-bold text-on-surface leading-tight">
                    {item.owner?.name || 'Student'}
                  </span>
                  {item.owner?.verified && (
                    <span
                      className="material-symbols-outlined text-primary text-[14px]"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      verified
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1 text-[10px] text-on-surface-variant">
                  <span className="text-amber-600 font-bold">★ {item.owner?.rating || 4.9}</span>
                  <span>• {item.owner?.dept || 'Engineering'}</span>
                </div>
              </div>
            </div>

            {/* Price in INR */}
            <div className="text-right">
              <div className="font-heading-lg text-[18px] font-extrabold text-on-surface leading-none">
                ₹{item.price}
              </div>
              <span className="font-body-sm text-[11px] text-on-surface-variant">
                {item.priceUnit}
              </span>
            </div>
          </div>

          {/* Quick Action Button */}
          <div className="pt-1 flex items-center justify-between gap-2">
            <Button
              variant="secondary"
              size="sm"
              fullWidth
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/item/${item.id}`);
              }}
              icon="visibility"
              className="text-[12px] py-1.5 bg-surface-container-lowest"
            >
              View Details
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
