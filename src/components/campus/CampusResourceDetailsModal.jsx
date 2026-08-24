import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';

export function CampusResourceDetailsModal({
  resource,
  isOpen,
  onClose,
  isWatching = false,
  onToggleWatch,
  onRequestResource
}) {
  const navigate = useNavigate();
  const [requestNote, setRequestNote] = useState('');
  const [isRequestFlow, setIsRequestFlow] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!resource) return null;

  const isAvailable = resource.availability === 'AVAILABLE' || resource.availability === 'LIMITED';

  const handleSendRequest = (e) => {
    e.preventDefault();
    if (onRequestResource) {
      onRequestResource(resource, requestNote);
    }
    setIsSuccess(true);
  };

  const getBadgeStyle = (avail) => {
    switch (avail) {
      case 'AVAILABLE':
        return {
          icon: 'check_circle',
          text: 'Available Now',
          bg: 'bg-emerald-100 text-emerald-800 border-emerald-300'
        };
      case 'LIMITED':
        return {
          icon: 'warning',
          text: 'Limited Availability',
          bg: 'bg-amber-100 text-amber-800 border-amber-300'
        };
      case 'UNAVAILABLE':
        return {
          icon: 'cancel',
          text: 'Currently Unavailable',
          bg: 'bg-rose-100 text-rose-800 border-rose-300'
        };
      case 'UNKNOWN':
      default:
        return {
          icon: 'help_outline',
          text: 'Availability Not Recently Updated',
          bg: 'bg-slate-100 text-slate-800 border-slate-300'
        };
    }
  };

  const badge = getBadgeStyle(resource.availability);

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        setIsRequestFlow(false);
        setIsSuccess(false);
        onClose();
      }}
      title={isSuccess ? 'Request Submitted!' : isRequestFlow ? 'Submit Campus Hardware Request' : resource.name}
      subtitle={isSuccess ? 'Lab notification sent' : `${resource.building} • ${resource.room}`}
    >
      {isSuccess ? (
        <div className="flex flex-col items-center gap-4 text-center py-4">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
            <span className="material-symbols-outlined text-[40px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              check_circle
            </span>
          </div>

          <div className="flex flex-col gap-1">
            <h4 className="font-heading-lg text-[18px] font-bold text-on-surface">
              Resource Request Dispatched
            </h4>
            <p className="text-body-sm text-on-surface-variant max-w-xs">
              Your request for <strong>{resource.name}</strong> was recorded for <strong>{resource.provider}</strong> at <strong>{resource.room}</strong>.
            </p>
          </div>

          <Button
            variant="primary"
            size="lg"
            fullWidth
            onClick={() => {
              setIsSuccess(false);
              setIsRequestFlow(false);
              onClose();
            }}
          >
            Done
          </Button>
        </div>
      ) : isRequestFlow ? (
        <form onSubmit={handleSendRequest} className="flex flex-col gap-4">
          <div className="p-3 bg-surface-container rounded-2xl border border-outline-variant/30 flex items-center gap-3">
            <img
              src={resource.image}
              alt={resource.name}
              className="w-12 h-12 rounded-xl object-cover"
            />
            <div className="flex flex-col">
              <span className="text-[13px] font-bold text-on-surface">{resource.name}</span>
              <span className="text-[11px] text-on-surface-variant">
                {resource.room} • {resource.distanceText}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-on-surface">
              Project Purpose / Lab Note *
            </label>
            <textarea
              rows={3}
              required
              placeholder="e.g. Needed for Capstone project sensor interfacing test at Bench 4..."
              value={requestNote}
              onChange={(e) => setRequestNote(e.target.value)}
              className="p-3 bg-surface-container rounded-xl border border-outline-variant/30 text-body-sm text-on-surface"
            />
          </div>

          <div className="flex gap-2">
            <Button
              type="button"
              variant="secondary"
              fullWidth
              onClick={() => setIsRequestFlow(false)}
            >
              Back
            </Button>
            <Button type="submit" variant="primary" fullWidth icon="send">
              Submit Request
            </Button>
          </div>
        </form>
      ) : (
        <div className="flex flex-col gap-4">
          {/* Top Resource Media Header */}
          <div className="relative w-full h-48 rounded-2xl overflow-hidden bg-surface-variant border border-outline-variant/20">
            <img
              src={resource.image}
              alt={resource.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-3 left-3">
              <span
                className={`px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider border backdrop-blur-md flex items-center gap-1.5 shadow-sm ${badge.bg}`}
              >
                <span className="material-symbols-outlined text-[14px]">{badge.icon}</span>
                {badge.text}
              </span>
            </div>

            <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-md text-white px-3 py-1 rounded-full text-[11px] font-semibold flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[14px] text-primary-fixed">near_me</span>
              <span>{resource.distanceText} • {resource.campusZone}</span>
            </div>
          </div>

          {/* Location & Provider Info Box */}
          <div className="grid grid-cols-2 gap-2 bg-surface-container p-3.5 rounded-2xl border border-outline-variant/20 text-body-sm">
            <div className="flex flex-col">
              <span className="text-[11px] font-semibold text-outline uppercase">Lab & Room</span>
              <span className="text-on-surface font-bold text-[13px]">{resource.building}</span>
              <span className="text-on-surface-variant text-[11px]">{resource.room}</span>
            </div>

            <div className="flex flex-col">
              <span className="text-[11px] font-semibold text-outline uppercase">Provider</span>
              <span className="text-on-surface font-bold text-[13px] truncate">{resource.provider}</span>
              <span className="text-emerald-700 text-[11px] font-bold">Verified Lab Entity</span>
            </div>

            <div className="flex flex-col pt-2 border-t border-outline-variant/20">
              <span className="text-[11px] font-semibold text-outline uppercase">Campus Stock</span>
              <span className="text-on-surface font-bold text-[13px]">
                {resource.availableStock} available / {resource.totalStock} total
              </span>
            </div>

            <div className="flex flex-col pt-2 border-t border-outline-variant/20">
              <span className="text-[11px] font-semibold text-outline uppercase">Access Model</span>
              <span className="text-primary font-bold text-[13px]">{resource.type} (Free Campus Access)</span>
            </div>
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">
              Resource Overview & Lab Context
            </span>
            <p className="text-body-sm text-on-surface-variant leading-relaxed bg-surface-container-lowest p-3 rounded-xl border border-outline-variant/20">
              {resource.description}
            </p>
          </div>

          {/* Technical Specifications */}
          {resource.specs && resource.specs.length > 0 && (
            <div className="flex flex-col gap-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">
                Technical Specifications
              </span>
              <div className="grid grid-cols-2 gap-2">
                {resource.specs.map((spec, idx) => (
                  <div key={idx} className="bg-surface-container p-2.5 rounded-xl border border-outline-variant/20 flex flex-col">
                    <span className="text-[10px] text-outline uppercase font-semibold">{spec.label}</span>
                    <span className="text-[12px] font-bold text-on-surface mt-0.5">{spec.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col gap-2 pt-2 border-t border-outline-variant/20">
            {isAvailable ? (
              <Button
                variant="primary"
                size="lg"
                fullWidth
                icon="assignment_turned_in"
                onClick={() => setIsRequestFlow(true)}
                className="font-bold shadow-md"
              >
                Request Hardware at {resource.building}
              </Button>
            ) : (
              <div className="flex flex-col gap-2">
                <div className="p-3 bg-rose-50 dark:bg-rose-950/40 rounded-xl border border-rose-200 dark:border-rose-800/40 text-center">
                  <span className="text-[12px] font-bold text-rose-700 dark:text-rose-300">
                    All units are currently in use across campus labs.
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => onToggleWatch(resource.id)}
                  className={`py-3 px-4 rounded-[16px] text-button-lg font-bold border transition-all cursor-pointer flex items-center justify-center gap-2 shadow-xs ${
                    isWatching
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                      : 'bg-primary text-white border-primary hover:bg-primary-hover'
                  }`}
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {isWatching ? 'check_circle' : 'notifications_active'}
                  </span>
                  <span>{isWatching ? '✓ Notification Enabled' : 'Notify Me When Available'}</span>
                </button>
              </div>
            )}

            {/* Linked Marketplace Listing */}
            {resource.linkedListingId && (
              <Button
                variant="secondary"
                size="md"
                fullWidth
                icon="storefront"
                onClick={() => {
                  onClose();
                  navigate(`/item/${resource.linkedListingId}`);
                }}
                className="bg-surface-container-lowest text-[13px]"
              >
                View Peer Marketplace Listing
              </Button>
            )}
          </div>
        </div>
      )}
    </Modal>
  );
}
