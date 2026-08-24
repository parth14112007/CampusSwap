import React from 'react';

export function KnowledgeCard({ resource, onOpen, isBookmarked = false, onToggleBookmark }) {
  const getTypeBadge = (type) => {
    switch (type) {
      case 'PINOUT':
        return 'bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-950/40 dark:text-purple-300';
      case 'DATASHEET':
        return 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950/40 dark:text-blue-300';
      case 'GUIDE':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300';
      case 'TUTORIAL':
        return 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/40 dark:text-amber-300';
      case 'TROUBLESHOOTING':
        return 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950/40 dark:text-rose-300';
      default:
        return 'bg-surface-container-high text-on-surface border-outline-variant/30';
    }
  };

  return (
    <div className="bg-surface-container-lowest rounded-[24px] p-5 border border-outline-variant/30 shadow-xs hover:border-primary/40 hover:shadow-md transition-all flex flex-col justify-between gap-4">
      <div className="flex flex-col gap-3">
        {/* Top Badges Row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider border ${getTypeBadge(resource.type)}`}>
              {resource.type}
            </span>
            <span className="text-[11px] font-bold text-outline uppercase bg-surface-container px-2 py-0.5 rounded-md">
              {resource.category}
            </span>
          </div>

          <button
            onClick={() => onToggleBookmark && onToggleBookmark(resource.id)}
            className="text-on-surface-variant hover:text-primary cursor-pointer p-1"
            title="Bookmark resource"
          >
            <span
              className={`material-symbols-outlined text-[20px] ${isBookmarked ? 'text-primary' : ''}`}
              style={{ fontVariationSettings: isBookmarked ? "'FILL' 1" : "'FILL' 0" }}
            >
              bookmark
            </span>
          </button>
        </div>

        {/* Title & Summary */}
        <div className="flex flex-col gap-1 cursor-pointer" onClick={() => onOpen && onOpen(resource)}>
          <h3 className="font-heading-lg text-[16px] font-bold text-on-surface hover:text-primary transition-colors leading-snug line-clamp-2">
            {resource.title}
          </h3>
          <p className="text-body-sm text-on-surface-variant text-[12px] line-clamp-2 leading-relaxed">
            {resource.summary}
          </p>
        </div>
      </div>

      {/* Meta Footer */}
      <div className="pt-3 border-t border-outline-variant/20 flex items-center justify-between text-[11px] text-on-surface-variant">
        <div className="flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[15px] text-primary">schedule</span>
          <span>{resource.readTime}</span>
          <span>•</span>
          <span className="font-semibold text-on-surface">{resource.difficulty}</span>
        </div>

        <button
          onClick={() => onOpen && onOpen(resource)}
          className="text-[12px] font-bold text-primary hover:underline flex items-center gap-0.5 cursor-pointer"
        >
          <span>Read Guide</span>
          <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
        </button>
      </div>
    </div>
  );
}
