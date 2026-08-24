import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';

export function QRScannerModal({ isOpen, onClose, rental, onVerifyScan }) {
  const [activeTab, setActiveTab] = useState('scan'); // 'scan' | 'show'
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifiedSuccess, setVerifiedSuccess] = useState(false);

  const handleSimulateScan = () => {
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      setVerifiedSuccess(true);
      if (onVerifyScan) {
        onVerifyScan();
      }
      setTimeout(() => {
        setVerifiedSuccess(false);
        onClose();
      }, 1500);
    }, 1200);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Handover & Return Verification"
      subtitle={rental ? `${rental.itemTitle} • Escrow ₹${rental.deposit}` : ''}
    >
      <div className="flex flex-col gap-5">
        {/* Tab Switcher */}
        <div className="flex bg-surface-container rounded-xl p-1 border border-outline-variant/30">
          <button
            onClick={() => setActiveTab('scan')}
            className={`flex-1 py-2 rounded-lg text-label-md font-bold transition-all ${
              activeTab === 'scan'
                ? 'bg-surface-container-lowest text-primary shadow-xs'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Scan Peer QR
          </button>
          <button
            onClick={() => setActiveTab('show')}
            className={`flex-1 py-2 rounded-lg text-label-md font-bold transition-all ${
              activeTab === 'show'
                ? 'bg-surface-container-lowest text-primary shadow-xs'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Show My QR Code
          </button>
        </div>

        {activeTab === 'scan' ? (
          <div className="flex flex-col items-center gap-4">
            {/* Viewfinder Mockup */}
            <div className="relative w-64 h-64 bg-inverse-surface rounded-[24px] overflow-hidden flex items-center justify-center border-4 border-primary/40 shadow-inner">
              {/* Scan Corner Guides */}
              <div className="absolute top-4 left-4 w-8 h-8 border-t-4 border-l-4 border-primary rounded-tl-lg" />
              <div className="absolute top-4 right-4 w-8 h-8 border-t-4 border-r-4 border-primary rounded-tr-lg" />
              <div className="absolute bottom-4 left-4 w-8 h-8 border-b-4 border-l-4 border-primary rounded-bl-lg" />
              <div className="absolute bottom-4 right-4 w-8 h-8 border-b-4 border-r-4 border-primary rounded-br-lg" />

              {/* Laser Animation Line */}
              <div className="absolute inset-x-4 h-0.5 bg-gradient-to-r from-transparent via-red-500 to-transparent animate-pulse" />

              {verifiedSuccess ? (
                <div className="flex flex-col items-center gap-2 text-emerald-400 z-10 animate-scale-up">
                  <span className="material-symbols-outlined text-[64px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                    check_circle
                  </span>
                  <span className="font-button-lg text-button-lg font-bold">Verification Successful!</span>
                </div>
              ) : isVerifying ? (
                <div className="flex flex-col items-center gap-2 text-white z-10">
                  <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                  <span className="text-body-sm font-medium">Verifying with Escrow Smart Lock...</span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 text-white/70 z-10 text-center px-4">
                  <span className="material-symbols-outlined text-[44px]">qr_code_scanner</span>
                  <span className="text-body-sm">Align lender or borrower's CampusSwap QR within frame</span>
                </div>
              )}
            </div>

            <Button
              variant="primary"
              size="lg"
              fullWidth
              disabled={isVerifying || verifiedSuccess}
              onClick={handleSimulateScan}
              icon="verified"
            >
              {verifiedSuccess ? 'Verified!' : isVerifying ? 'Verifying...' : 'Simulate Verified QR Scan'}
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4 text-center">
            {/* Display Simulated QR Code */}
            <div className="p-4 bg-white rounded-2xl border-2 border-outline-variant/40 shadow-md">
              <svg viewBox="0 0 100 100" className="w-48 h-48 text-on-surface">
                {/* SVG pattern simulating high-density QR code */}
                <rect width="100" height="100" fill="white" />
                <path
                  d="M10 10h30v30h-30z M15 15v20h20v-20z M20 20h10v10h-10z M60 10h30v30h-30z M65 15v20h20v-20z M70 20h10v10h-10z M10 60h30v30h-30z M15 65v20h20v-20z M20 70h10v10h-10z M45 15h10v10h-10z M45 35h10v10h-10z M15 45h10v10h-10z M35 45h10v10h-10z M55 45h10v10h-10z M75 45h10v10h-10z M45 60h10v10h-10z M60 60h10v10h-10z M75 60h10v10h-10z M60 75h10v10h-10z M75 75h10v10h-10z M45 80h10v10h-10z M85 85h5v5h-5z"
                  fill="currentColor"
                />
              </svg>
            </div>

            <div className="flex flex-col gap-1">
              <span className="font-button-lg text-button-lg font-bold text-on-surface">
                Token: {rental?.qrCode || 'CAMPUS_SWAP_SECURE_TOKEN'}
              </span>
              <p className="font-body-sm text-body-sm text-on-surface-variant max-w-xs">
                Have the student scan this screen to authenticate physical handover or return.
              </p>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
