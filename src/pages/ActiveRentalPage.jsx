import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TopAppBar } from '../components/common/TopAppBar';
import { StatusIndicatorCard } from '../components/rental/StatusIndicatorCard';
import { EscrowTrustCard } from '../components/rental/EscrowTrustCard';
import { TransactionTimeline } from '../components/rental/TransactionTimeline';
import { QRScannerModal } from '../components/rental/QRScannerModal';
import { RentalAgreementModal } from '../components/rental/RentalAgreementModal';
import { useMarketplace } from '../context/MarketplaceContext';

export function ActiveRentalPage() {
  const navigate = useNavigate();
  const { activeRentals, advanceRentalStep } = useMarketplace();
  const [selectedRentalIndex, setSelectedRentalIndex] = useState(0);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [isAgreementModalOpen, setIsAgreementModalOpen] = useState(false);

  const rental = activeRentals[selectedRentalIndex] || activeRentals[0];

  const handleVerifyScan = () => {
    if (rental) {
      advanceRentalStep(rental.id);
    }
  };

  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col antialiased">
      {/* TopAppBar */}
      <TopAppBar showBack={true} />

      {/* Main Canvas (Task-Focused Detail View - Nav Suppressed) */}
      <main className="flex-1 w-full max-w-3xl mx-auto p-margin-mobile flex flex-col gap-xl pb-36">
        {/* Active Rentals Switcher (if multiple exist) */}
        {activeRentals.length > 1 && (
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
            {activeRentals.map((r, idx) => (
              <button
                key={r.id}
                onClick={() => setSelectedRentalIndex(idx)}
                className={`px-3.5 py-1.5 rounded-full text-label-md font-bold transition-all cursor-pointer ${
                  selectedRentalIndex === idx
                    ? 'bg-primary text-on-primary shadow-xs'
                    : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high border border-outline-variant/30'
                }`}
              >
                {r.itemTitle}
              </button>
            ))}
          </div>
        )}

        {/* Header Section */}
        <div className="flex flex-col gap-xs">
          <div className="flex items-center justify-between">
            <h2 className="font-heading-xl text-heading-xl text-on-surface font-bold">
              Active Rental
            </h2>
            <span className="font-label-md text-label-md bg-secondary/10 text-secondary font-bold px-3 py-1 rounded-full border border-secondary/20">
              ID: {rental?.id || 'rent-001'}
            </span>
          </div>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Manage your current equipment usage and escrow.
          </p>
        </div>

        {/* Main Indicator: Status Card */}
        {rental && (
          <StatusIndicatorCard
            statusText={rental.statusText}
            progressPercent={rental.progressPercent}
            startDate={rental.startDate}
            dueDate={rental.dueDate}
            statusBadge={rental.statusBadge || 'Status'}
          />
        )}

        {/* Bento Grid: Product & Escrow Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
          {/* Product Info */}
          <div className="bg-surface-container rounded-[24px] p-md flex flex-col gap-md border border-outline-variant/30 shadow-xs">
            <div className="flex items-start gap-md">
              <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0 bg-surface-variant border border-outline-variant/20">
                <img
                  className="w-full h-full object-cover"
                  src={
                    rental?.itemImage ||
                    'https://images.unsplash.com/photo-1553406830-ef2513450d76?auto=format&fit=crop&w=600&q=80'
                  }
                  alt={rental?.itemTitle || 'Equipment'}
                />
              </div>
              <div className="flex flex-col gap-xs">
                <h4 className="font-heading-lg text-heading-lg text-on-surface leading-tight font-bold">
                  {rental?.itemTitle || 'Arduino Uno R3'}
                </h4>
                <div className="flex items-center gap-xs text-on-surface-variant">
                  <div className="w-6 h-6 rounded-full overflow-hidden bg-surface-variant border border-outline-variant/30">
                    <img
                      className="w-full h-full object-cover"
                      src={
                        rental?.ownerAvatar ||
                        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'
                      }
                      alt={rental?.ownerName || 'Lender'}
                    />
                  </div>
                  <span className="font-body-sm text-body-sm">
                    {rental?.ownerName || 'Vikram'} • {rental?.ownerYear || '3rd Year'}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-unit pt-sm border-t border-outline-variant/30 mt-auto">
              <div className="flex flex-col">
                <span className="font-label-md text-label-md text-outline font-medium">Rental</span>
                <span className="font-button-lg text-button-lg text-on-surface font-bold">
                  ₹{rental?.dailyRate || 80}/day
                </span>
              </div>
              <div className="flex flex-col">
                <span className="font-label-md text-label-md text-outline font-medium">Deposit</span>
                <span className="font-button-lg text-button-lg text-on-surface font-bold">
                  ₹{rental?.deposit || 300} • Ref.
                </span>
              </div>
            </div>
          </div>

          {/* Trust / Escrow Message */}
          <EscrowTrustCard deposit={rental?.deposit || 300} />
        </div>

        {/* Transaction Timeline */}
        {rental && <TransactionTimeline timeline={rental.timeline} />}
      </main>

      {/* Sticky CTAs at Bottom (Contextual action bar replacing standard nav shell) */}
      <div className="fixed bottom-0 left-0 w-full bg-surface/90 backdrop-blur-xl border-t border-outline-variant/30 p-margin-mobile flex flex-col sm:flex-row-reverse gap-md justify-center items-center shadow-[0_-4px_16px_rgba(0,0,0,0.06)] z-40">
        <button
          onClick={() => setIsQRModalOpen(true)}
          className="w-full sm:w-auto flex-1 bg-primary text-on-primary font-button-lg text-button-lg py-md px-xl rounded-[16px] flex items-center justify-center gap-sm shadow-md hover:opacity-90 active:scale-95 transition-all cursor-pointer font-bold"
        >
          <span className="material-symbols-outlined text-[22px]">qr_code_scanner</span>
          Scan Handover QR
        </button>

        <button
          onClick={() => setIsAgreementModalOpen(true)}
          className="w-full sm:w-auto flex-1 bg-transparent border-2 border-outline-variant text-on-surface font-button-lg text-button-lg py-md px-xl rounded-[16px] flex items-center justify-center gap-sm hover:bg-surface-container-high active:scale-95 transition-all cursor-pointer font-semibold"
        >
          <span className="material-symbols-outlined text-[22px]">description</span>
          View Rental Agreement
        </button>
      </div>

      {/* Modals */}
      <QRScannerModal
        isOpen={isQRModalOpen}
        onClose={() => setIsQRModalOpen(false)}
        rental={rental}
        onVerifyScan={handleVerifyScan}
      />

      <RentalAgreementModal
        isOpen={isAgreementModalOpen}
        onClose={() => setIsAgreementModalOpen(false)}
        rental={rental}
      />
    </div>
  );
}
