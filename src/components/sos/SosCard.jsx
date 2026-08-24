import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../common/Button';
import { SOSStatusTimeline } from './SOSStatusTimeline';

export function SosCard({
  sos,
  onOfferResource,
  onAcceptOffer,
  onDeclineOffer,
  onRateExchange,
  isMyRequest = false
}) {
  const navigate = useNavigate();

  const isUrgent = sos.urgency === 'URGENT';
  const isHigh = sos.urgency === 'HIGH';

  return (
    <div
      className={`rounded-[24px] p-5 border transition-all duration-200 flex flex-col gap-4 shadow-xs ${
        isUrgent
          ? 'bg-surface-container-lowest border-rose-500/40 ring-1 ring-rose-500/20'
          : isHigh
          ? 'bg-surface-container-lowest border-amber-500/40'
          : 'bg-surface-container-lowest border-outline-variant/30'
      }`}
    >
      {/* Top Header with Urgency & Timeframe */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span
            className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider border flex items-center gap-1 ${
              isUrgent
                ? 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950/50 dark:text-rose-300'
                : isHigh
                ? 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/50 dark:text-amber-300'
                : 'bg-surface-container-high text-on-surface border-outline-variant/30'
            }`}
          >
            <span className="material-symbols-outlined text-[13px] animate-pulse">
              {isUrgent ? 'emergency' : 'schedule'}
            </span>
            <span>{sos.urgency} SOS</span>
          </span>

          <span className="text-[11px] font-bold text-on-surface-variant">
            Needed: {sos.requiredBy}
          </span>
        </div>

        {sos.budget > 0 && (
          <span className="bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold">
            ₹{sos.budget} Budget
          </span>
        )}
      </div>

      {/* Main Content */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <h3 className="font-heading-lg text-[18px] font-bold text-on-surface">
            {sos.componentName} ({sos.quantity} ×)
          </h3>
        </div>

        <div className="flex items-center gap-1 text-on-surface-variant text-[12px]">
          <span className="material-symbols-outlined text-[16px] text-primary">location_on</span>
          <span>{sos.preferredLocation}</span>
        </div>

        {sos.projectContext && (
          <p className="text-[12px] text-on-surface-variant bg-surface-container-low p-2.5 rounded-xl mt-1 leading-relaxed">
            <strong className="text-on-surface">Context:</strong> {sos.projectContext}
          </p>
        )}

        {sos.additionalSpecs && (
          <span className="text-[11px] text-outline italic mt-0.5">
            Specs: {sos.additionalSpecs}
          </span>
        )}
      </div>

      {/* Visual Status Progression */}
      <div className="pt-1 border-t border-outline-variant/20">
        <SOSStatusTimeline currentStatus={sos.status} />
      </div>

      {/* Offered Resource Callout Box */}
      {sos.status === 'RESOURCE_OFFERED' && sos.offeredResource && (
        <div className="bg-primary/10 border border-primary/30 rounded-2xl p-3 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase text-primary">
              Hardware Offered by {sos.offeredResource.offerorName}
            </span>
            <span className="text-[10px] text-on-surface-variant">
              {sos.offeredResource.offerorDept}
            </span>
          </div>
          <p className="text-[12px] text-on-surface">
            "{sos.offeredResource.itemNote}" • Pickup at {sos.offeredResource.location}
          </p>

          {isMyRequest && (
            <div className="grid grid-cols-2 gap-2 pt-1">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => onDeclineOffer && onDeclineOffer(sos.id)}
                className="text-[11px] bg-surface-container-lowest"
              >
                Decline
              </Button>
              <Button
                variant="primary"
                size="sm"
                icon="verified"
                onClick={() => onAcceptOffer && onAcceptOffer(sos.id)}
                className="text-[11px] font-bold"
              >
                Accept & Generate QR
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Requester & Action Row */}
      <div className="pt-2 border-t border-outline-variant/20 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full overflow-hidden bg-surface-variant shrink-0 border border-outline-variant/20">
            <img
              src={sos.requester?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80'}
              alt={sos.requester?.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex flex-col">
            <span className="text-[12px] font-bold text-on-surface leading-tight">
              {sos.requester?.name}
            </span>
            <span className="text-[10px] text-on-surface-variant">
              {sos.requester?.year} • {sos.requester?.dept} • ★ {sos.requester?.rating || 4.9}
            </span>
          </div>
        </div>

        {/* Action Button States */}
        <div className="flex items-center gap-1.5">
          {sos.status === 'HANDOVER_PENDING' ? (
            <Button
              variant="primary"
              size="sm"
              icon="qr_code_scanner"
              onClick={() => navigate(`/handover/${sos.handoverId || 'handover-demo-001'}`)}
              className="text-[11px] font-bold"
            >
              Open QR Handover
            </Button>
          ) : sos.status === 'COMPLETED' ? (
            <Button
              variant="secondary"
              size="sm"
              icon="star"
              onClick={() => onRateExchange && onRateExchange(sos)}
              className="text-[11px] bg-surface-container"
            >
              Rate Exchange
            </Button>
          ) : !isMyRequest && sos.status !== 'RESOURCE_OFFERED' ? (
            <Button
              variant="primary"
              size="sm"
              icon="handshake"
              onClick={() => onOfferResource && onOfferResource(sos)}
              className="text-[11px] font-bold"
            >
              Offer Resource
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
