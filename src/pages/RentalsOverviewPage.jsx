import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { TopAppBar } from '../components/common/TopAppBar';
import { BottomNav } from '../components/common/BottomNav';
import { Button } from '../components/common/Button';
import { rentalService } from '../services';

export function RentalsOverviewPage() {
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    rentalService.getActiveRentals().then((data) => {
      setRentals(data);
      setLoading(false);
    });
  }, []);

  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col antialiased">
      <TopAppBar showBack={true} />

      <main className="flex-1 w-full max-w-5xl mx-auto p-margin-mobile flex flex-col gap-lg pb-32">
        {/* Header Banner */}
        <div className="bg-gradient-to-tr from-secondary via-secondary-container to-primary rounded-[24px] p-6 text-white shadow-lg relative overflow-hidden flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-widest font-bold bg-white/15 px-3 py-1 rounded-full">
              Escrow & Rental Hub
            </span>
            <span className="text-[11px] font-bold bg-white/20 px-2.5 py-0.5 rounded-full">
              100% Deposit Protection
            </span>
          </div>
          <h2 className="text-[24px] sm:text-[28px] font-extrabold tracking-tight">
            Rent & Borrow Engineering Hardware
          </h2>
          <p className="text-body-sm text-white/85 max-w-lg">
            Track active rentals, manage peer-to-peer security deposits in smart escrow, and verify gear handovers with QR codes.
          </p>

          <div className="flex flex-wrap gap-2 pt-1">
            <Link to="/active-rental">
              <Button variant="secondary" size="sm" className="bg-white text-secondary font-bold">
                Active Rental Timeline
              </Button>
            </Link>
            <Link to="/my-rentals">
              <Button variant="secondary" size="sm" className="bg-white/20 text-white font-bold border-white/30">
                My Swaps & Listed Gear
              </Button>
            </Link>
          </div>
        </div>

        {/* Active Rentals Summary */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="font-heading-lg text-[18px] font-bold text-on-surface">
              Ongoing Rental Transactions ({rentals.length})
            </h3>
          </div>

          {loading ? (
            <div className="p-8 text-center text-on-surface-variant font-medium">Loading rentals...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {rentals.map((rental) => (
                <div
                  key={rental.id}
                  className="bg-surface-container-lowest rounded-[20px] p-5 border border-outline-variant/30 shadow-xs flex flex-col gap-4"
                >
                  <div className="flex items-start gap-4">
                    <img
                      src={rental.itemImage}
                      alt={rental.itemTitle}
                      className="w-16 h-16 rounded-xl object-cover border border-outline-variant/20 shrink-0"
                    />
                    <div className="flex flex-col flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                          {rental.statusBadge}
                        </span>
                        <span className="text-[12px] font-bold text-on-surface">
                          ₹{rental.dailyRate}/day
                        </span>
                      </div>
                      <h4 className="font-heading-lg text-[16px] font-bold text-on-surface mt-1">
                        {rental.itemTitle}
                      </h4>
                      <span className="text-[12px] text-on-surface-variant">
                        Lender: {rental.ownerName} ({rental.ownerDept})
                      </span>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="flex flex-col gap-1.5 pt-2 border-t border-outline-variant/20">
                    <div className="flex justify-between text-[11px] font-bold">
                      <span className="text-on-surface-variant">{rental.statusText}</span>
                      <span className="text-primary">{rental.progressPercent}%</span>
                    </div>
                    <div className="w-full h-2 bg-surface-container rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-primary to-secondary transition-all"
                        style={{ width: `${rental.progressPercent}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[12px] font-mono text-on-surface-variant font-semibold">
                      Deposit: ₹{rental.deposit} (Held in Escrow)
                    </span>
                    <Link to="/active-rental">
                      <Button variant="primary" size="sm" icon="qr_code">
                        View QR & Escrow
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
