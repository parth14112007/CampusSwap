import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { TopAppBar } from '../components/common/TopAppBar';
import { BottomNav } from '../components/common/BottomNav';
import { Button } from '../components/common/Button';
import { HandoverQR } from '../components/trust/HandoverQR';
import { RatingDialog } from '../components/trust/RatingDialog';
import { handoverService } from '../services/handoverService';
import { reputationService } from '../services/reputationService';
import { useToast } from '../components/common/Toast';
import { useAuth } from '../context/AuthContext';

export function HandoverPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { user } = useAuth();

  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeRole, setActiveRole] = useState('owner'); // 'owner' | 'borrower'
  const [isVerifying, setIsVerifying] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isRatingOpen, setIsRatingOpen] = useState(false);

  useEffect(() => {
    loadSession();
  }, [id]);

  const loadSession = async () => {
    setLoading(true);
    try {
      const data = await handoverService.getSession(id || 'handover-demo-001');
      if (data) {
        setSession(data);
        if (data.status === 'COMPLETED') setIsCompleted(true);
      } else {
        // Create demo session fallback
        const demo = await handoverService.createSession({
          transactionId: id || 'demo-101',
          itemTitle: 'Arduino Uno R3 & 37 Sensor Kit',
          quantity: 1,
          ownerName: 'Arjun Sharma',
          borrowerName: 'Priya Patel',
          location: 'Academic Block B Courtyard'
        });
        setSession(demo);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSimulateScan = async () => {
    if (!session) return;
    setIsVerifying(true);

    try {
      const updated = await handoverService.verifyHandover(session.id, {
        verifiedByRole: activeRole === 'owner' ? 'Owner' : 'Borrower'
      });
      setSession(updated);
      setIsVerifying(false);
      setIsCompleted(true);
      addToast('✓ Physical Handover Verified! Transaction completed successfully.', 'success');
      setTimeout(() => setIsRatingOpen(true), 600);
    } catch (err) {
      console.error(err);
      setIsVerifying(false);
    }
  };

  const handleSubmitRating = async (ratingData) => {
    const reviewerId = user?.id || 'user-001';
    const revieweeId = activeRole === 'owner' ? (session?.borrowerId || 'user-002') : (session?.ownerId || 'user-001');
    await reputationService.submitRating({
      transactionId: session?.transactionId,
      reviewerId,
      revieweeId,
      ...ratingData
    });
    addToast('★ Review submitted! Campus trust score updated.', 'success');
  };

  if (loading) {
    return (
      <div className="bg-background text-on-background min-h-screen flex flex-col antialiased">
        <TopAppBar showBack={true} />
        <div className="flex-1 flex items-center justify-center p-8 text-on-surface-variant font-medium">
          Loading Handover Session...
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col antialiased">
      <TopAppBar showBack={true} />

      <main className="flex-1 w-full max-w-xl mx-auto p-margin-mobile flex flex-col gap-lg pb-32">
        {/* Header Title */}
        <div className="flex flex-col gap-1 text-center">
          <div className="inline-flex items-center justify-center gap-1.5 text-primary text-[12px] font-extrabold uppercase tracking-wider">
            <span className="material-symbols-outlined text-[18px]">verified</span>
            <span>Campus Physical Handover Verification</span>
          </div>
          <h2 className="font-heading-xl text-[24px] font-extrabold text-on-surface">
            {session.itemTitle}
          </h2>
          <span className="text-body-sm text-on-surface-variant">
            Transaction: {session.transactionId} • Meetup: {session.location}
          </span>
        </div>

        {/* Participant Role Toggle */}
        <div className="flex items-center gap-2 bg-surface-container p-1.5 rounded-[18px] border border-outline-variant/30">
          <button
            onClick={() => setActiveRole('owner')}
            className={`flex-1 py-2 rounded-[14px] text-label-md font-bold transition-all cursor-pointer text-center flex items-center justify-center gap-1.5 ${
              activeRole === 'owner'
                ? 'bg-surface-container-lowest text-primary shadow-xs'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">qr_code_2</span>
            <span>Lender View (Show QR)</span>
          </button>

          <button
            onClick={() => setActiveRole('borrower')}
            className={`flex-1 py-2 rounded-[14px] text-label-md font-bold transition-all cursor-pointer text-center flex items-center justify-center gap-1.5 ${
              activeRole === 'borrower'
                ? 'bg-surface-container-lowest text-primary shadow-xs'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">qr_code_scanner</span>
            <span>Borrower View (Verify)</span>
          </button>
        </div>

        {/* QR Handover Display or Completed State */}
        {!isCompleted ? (
          <div className="flex flex-col gap-5">
            <HandoverQR
              token={session.qrCodeToken}
              itemTitle={session.itemTitle}
              quantity={session.quantity}
              ownerName={session.ownerName}
              borrowerName={session.borrowerName}
              location={session.location}
              status={session.status}
            />

            {/* Simulated Action Trigger */}
            <div className="bg-surface-container-lowest rounded-[24px] p-5 border border-outline-variant/30 shadow-xs flex flex-col gap-3">
              <span className="text-[12px] text-on-surface-variant text-center font-medium">
                {activeRole === 'owner'
                  ? `Present this QR code to ${session.borrowerName} during your physical campus handover.`
                  : `Meet ${session.ownerName} at ${session.location}, inspect the hardware, and tap below to verify.`}
              </span>

              <Button
                variant="primary"
                size="lg"
                fullWidth
                icon="qr_code_scanner"
                loading={isVerifying}
                onClick={handleSimulateScan}
                className="font-bold shadow-md"
              >
                {activeRole === 'owner' ? 'Simulate Borrower Scanned QR' : 'Verify Physical Handover'}
              </Button>
            </div>
          </div>
        ) : (
          /* Handover Completed Celebration State */
          <div className="bg-surface-container rounded-[24px] p-8 border border-emerald-500/40 shadow-xl flex flex-col items-center gap-5 text-center animate-scale-up">
            <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-inner">
              <span className="material-symbols-outlined text-[48px]">check_circle</span>
            </div>

            <div className="flex flex-col gap-1 max-w-sm">
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-emerald-600">
                Handover Confirmed
              </span>
              <h3 className="font-heading-xl text-[22px] font-extrabold text-on-surface">
                Hardware Exchange Complete!
              </h3>
              <p className="text-body-sm text-on-surface-variant leading-relaxed mt-1">
                Both parties have authenticated the handover of <strong>{session.itemTitle}</strong>. Escrow security protocols and exchange records are updated.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 w-full pt-2">
              <Button
                variant="secondary"
                size="md"
                onClick={() => setIsRatingOpen(true)}
                icon="star"
                className="bg-surface-container-lowest"
              >
                Rate Exchange
              </Button>
              <Button
                variant="primary"
                size="md"
                onClick={() => navigate('/profile')}
                icon="account_circle"
              >
                Go to Profile
              </Button>
            </div>
          </div>
        )}
      </main>

      {/* Post-Transaction Rating Dialog */}
      <RatingDialog
        isOpen={isRatingOpen}
        onClose={() => setIsRatingOpen(false)}
        transactionTitle={session?.itemTitle}
        otherPartyName={activeRole === 'owner' ? session?.borrowerName : session?.ownerName}
        onSubmitRating={handleSubmitRating}
      />

      <BottomNav />
    </div>
  );
}
