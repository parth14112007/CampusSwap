import React from 'react';
import { CATEGORIES } from '../../data/mockData';
import { useMarketplace } from '../../context/MarketplaceContext';

export function CategoryFilter() {
  const { selectedCategory, setSelectedCategory } = useMarketplace();

  return (
    <div className="w-full flex flex-col gap-2">
      <div className="flex items-center justify-between px-1">
        <span className="text-label-md font-bold uppercase tracking-wider text-on-surface-variant">
          Categories ({CATEGORIES.length - 1})
        </span>
        {selectedCategory !== 'all' && (
          <button
            onClick={() => setSelectedCategory('all')}
            className="text-[11px] font-bold text-primary hover:underline cursor-pointer"
          >
            Show All
          </button>
        )}
      </div>

      <div className="w-full overflow-x-auto no-scrollbar py-1">
        <div className="flex items-center gap-2 min-w-max">
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory.toLowerCase() === cat.id.toLowerCase();
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-label-md transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-primary text-on-primary font-bold shadow-sm shadow-primary/20 scale-[1.02]'
                    : 'bg-surface-container hover:bg-surface-container-high text-on-surface-variant border border-outline-variant/30'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
