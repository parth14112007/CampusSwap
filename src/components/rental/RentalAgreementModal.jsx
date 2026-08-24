import React from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';

export function RentalAgreementModal({ isOpen, onClose, rental }) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="CampusSwap Rental & Escrow Agreement"
      subtitle="Institutional Peer-to-Peer Agreement • Verified Student Identity"
      maxWidth="max-w-xl"
    >
      <div className="flex flex-col gap-4 text-on-surface">
        {/* Agreement Status Banner */}
        <div className="p-3 bg-primary/10 border border-primary/20 rounded-[16px] flex items-center gap-3">
          <span className="material-symbols-outlined text-primary text-[24px]">gavel</span>
          <div className="flex flex-col">
            <span className="text-[13px] font-bold text-primary">Binding Campus Agreement #CS-2026-8942</span>
            <span className="text-[11px] text-on-surface-variant">
              Protected by Campus ID Verification & Automated Escrow
            </span>
          </div>
        </div>

        {/* Contract Clauses */}
        <div className="flex flex-col gap-3 font-body-sm text-[13px] text-on-surface-variant leading-relaxed">
          <div>
            <h4 className="font-button-lg text-on-surface font-bold mb-1">1. Equipment Custody</h4>
            <p>
              The borrower ({rental?.borrowerName || 'Active Student'}) accepts full temporary custody of{' '}
              <strong className="text-on-surface">{rental?.itemTitle || 'Equipment'}</strong> in working condition.
            </p>
          </div>

          <div>
            <h4 className="font-button-lg text-on-surface font-bold mb-1">2. Escrow & Security Deposit</h4>
            <p>
              A refundable security deposit of <strong className="text-on-surface">₹{rental?.deposit || 300}</strong> is
              held in CampusSwap Escrow. Upon return verification via bilateral QR scan, the deposit is instantly credited
              back to the borrower's wallet.
            </p>
          </div>

          <div>
            <h4 className="font-button-lg text-on-surface font-bold mb-1">3. Permitted Lab Usage</h4>
            <p>
              The equipment shall be utilized solely for academic coursework, laboratory assignments, capstone projects, or
              hackathons. Over-volting, irreversible desoldering, or damaging modifications without lender consent will
              forfeit the security deposit.
            </p>
          </div>

          <div>
            <h4 className="font-button-lg text-on-surface font-bold mb-1">4. Campus Resolution Protocol</h4>
            <p>
              In the unlikely event of non-return or severe hardware defect, the CampusSwap student integrity committee and
              department lab faculty act as arbiters.
            </p>
          </div>
        </div>

        {/* Digital Signatures */}
        <div className="p-3 bg-surface-container rounded-[16px] border border-outline-variant/30 flex justify-between items-center text-[12px]">
          <div className="flex flex-col">
            <span className="text-outline">Lender</span>
            <span className="font-bold text-on-surface">{rental?.ownerName || 'Vikram (3rd Year)'}</span>
            <span className="text-[10px] text-emerald-600 font-semibold">✓ Cryptographically Signed</span>
          </div>
          <div className="flex flex-col text-right">
            <span className="text-outline">Borrower</span>
            <span className="font-bold text-on-surface">Arjun Sharma (3rd Year)</span>
            <span className="text-[10px] text-emerald-600 font-semibold">✓ Verified with Campus ID</span>
          </div>
        </div>

        <Button variant="primary" size="md" fullWidth onClick={onClose}>
          Close Agreement
        </Button>
      </div>
    </Modal>
  );
}
