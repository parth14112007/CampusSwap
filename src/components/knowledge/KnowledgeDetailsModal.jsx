import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';

export function KnowledgeDetailsModal({ resource, isOpen, onClose }) {
  const navigate = useNavigate();
  if (!resource) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={resource.title}
      subtitle={`${resource.category} • ${resource.type} • ${resource.readTime}`}
    >
      <div className="flex flex-col gap-5 max-h-[75vh] overflow-y-auto pr-1 no-scrollbar">
        {/* Preview / Pinout Graphic */}
        {resource.pinoutImage && (
          <div className="w-full h-48 sm:h-56 rounded-2xl overflow-hidden bg-surface-container border border-outline-variant/30">
            <img
              src={resource.pinoutImage}
              alt={resource.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Summary */}
        <div className="flex flex-col gap-1">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-primary">
            Overview & Key Architecture
          </span>
          <p className="text-body-sm text-on-surface leading-relaxed">
            {resource.summary}
          </p>
        </div>

        {/* Specifications Table */}
        {resource.specs && resource.specs.length > 0 && (
          <div className="flex flex-col gap-2">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-primary">
              Technical Specifications
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-surface-container p-3 rounded-2xl border border-outline-variant/30 text-[12px]">
              {resource.specs.map((s, idx) => (
                <div key={idx} className="flex flex-col bg-surface-container-lowest p-2 rounded-xl border border-outline-variant/20">
                  <span className="text-outline uppercase text-[10px] font-semibold">{s.label}</span>
                  <span className="font-bold text-on-surface mt-0.5">{s.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Wiring & Troubleshooting Notes */}
        {resource.wiringNotes && (
          <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800/40 rounded-2xl p-4 flex items-start gap-2.5">
            <span className="material-symbols-outlined text-amber-600 text-[20px] shrink-0 mt-0.5">
              lightbulb
            </span>
            <div className="flex flex-col">
              <span className="text-[11px] font-extrabold uppercase text-amber-800 dark:text-amber-300">
                Practical Lab Wiring Notes
              </span>
              <p className="text-[12px] text-amber-900 dark:text-amber-200 mt-0.5 leading-relaxed">
                {resource.wiringNotes}
              </p>
            </div>
          </div>
        )}

        {/* Bottom Actions */}
        <div className="pt-2 border-t border-outline-variant/20 flex items-center justify-between gap-3">
          <span className="text-[11px] text-on-surface-variant">
            Authored by <strong>{resource.authorName}</strong>
          </span>

          <Button
            variant="primary"
            size="sm"
            icon="storefront"
            onClick={() => {
              onClose();
              navigate(`/explore?search=${encodeURIComponent(resource.category)}`);
            }}
          >
            Find on Marketplace
          </Button>
        </div>
      </div>
    </Modal>
  );
}
