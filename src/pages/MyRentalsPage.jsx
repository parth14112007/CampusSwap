import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { TopAppBar } from '../components/common/TopAppBar';
import { BottomNav } from '../components/common/BottomNav';
import { Button } from '../components/common/Button';
import { StatusIndicatorCard } from '../components/rental/StatusIndicatorCard';
import { useMarketplace } from '../context/MarketplaceContext';

export function MyRentalsPage() {
  const navigate = useNavigate();
  const { activeRentals, myListings, user } = useMarketplace();
  const [activeTab, setActiveTab] = useState('rentals'); // 'rentals' | 'listings'

  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col antialiased">
      <TopAppBar showBack={true} />

      <main className="flex-1 w-full max-w-3xl mx-auto p-margin-mobile flex flex-col gap-lg pb-32">
        {/* Escrow Balance Card */}
        <div className="bg-surface-container rounded-[24px] p-6 border border-outline-variant/30 shadow-xs flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <span className="font-label-md text-label-md uppercase font-bold text-outline tracking-wider">
              CampusSwap Escrow Wallet
            </span>
            <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              100% Protected
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="bg-surface-container-lowest p-3.5 rounded-2xl border border-outline-variant/20 flex flex-col">
              <span className="text-[12px] text-on-surface-variant font-medium">Available Balance</span>
              <span className="font-heading-lg text-[22px] font-extrabold text-on-surface mt-0.5">
                ₹{user.escrowWallet.available}
              </span>
            </div>

            <div className="bg-primary/10 p-3.5 rounded-2xl border border-primary/25 flex flex-col">
              <span className="text-[12px] text-primary font-bold">Held in Escrow</span>
              <span className="font-heading-lg text-[22px] font-extrabold text-primary mt-0.5">
                ₹{user.escrowWallet.heldInEscrow}
              </span>
            </div>

            <div className="bg-surface-container-lowest p-3.5 rounded-2xl border border-outline-variant/20 flex flex-col col-span-2 sm:col-span-1">
              <span className="text-[12px] text-on-surface-variant font-medium">Total Earned</span>
              <span className="font-heading-lg text-[22px] font-extrabold text-emerald-600 mt-0.5">
                ₹{user.escrowWallet.totalEarned}
              </span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex bg-surface-container rounded-2xl p-1 border border-outline-variant/30">
          <button
            onClick={() => setActiveTab('rentals')}
            className={`flex-1 py-2.5 rounded-xl text-button-lg font-bold transition-all ${
              activeTab === 'rentals'
                ? 'bg-surface-container-lowest text-primary shadow-xs'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Active Rentals ({activeRentals.length})
          </button>
          <button
            onClick={() => setActiveTab('listings')}
            className={`flex-1 py-2.5 rounded-xl text-button-lg font-bold transition-all ${
              activeTab === 'listings'
                ? 'bg-surface-container-lowest text-primary shadow-xs'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            My Listings ({myListings.length})
          </button>
        </div>

        {/* Tab Contents */}
        {activeTab === 'rentals' && (
          <div className="flex flex-col gap-4">
            {activeRentals.map((rental) => (
              <div
                key={rental.id}
                onClick={() => navigate('/active-rental')}
                className="bg-surface-container-lowest rounded-[24px] p-5 border border-outline-variant/30 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col gap-4 group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-2xl overflow-hidden bg-surface-variant shrink-0 border border-outline-variant/30">
                      <img
                        src={rental.itemImage}
                        alt={rental.itemTitle}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-heading-lg text-[17px] font-bold text-on-surface">
                        {rental.itemTitle}
                      </span>
                      <span className="text-body-sm text-on-surface-variant">
                        Lender: {rental.ownerName} ({rental.ownerYear})
                      </span>
                    </div>
                  </div>

                  <span className="bg-primary/10 text-primary font-bold text-label-md px-3 py-1 rounded-full border border-primary/20">
                    {rental.statusBadge}
                  </span>
                </div>

                {/* Mini status bar */}
                <div className="w-full bg-surface-container h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-primary h-full rounded-full"
                    style={{ width: `${rental.progressPercent}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-body-sm text-on-surface-variant pt-2 border-t border-outline-variant/20">
                  <span>
                    Started: <strong className="text-on-surface">{rental.startDate}</strong> • Due:{' '}
                    <strong className="text-primary">{rental.dueDate}</strong>
                  </span>
                  <span className="text-primary font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    View Tracker
                    <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'listings' && (
          <div className="flex flex-col gap-4">
            {myListings.length === 0 ? (
              <div className="bg-surface-container rounded-[24px] p-10 text-center flex flex-col items-center gap-3">
                <span className="material-symbols-outlined text-[44px] text-outline">inventory_2</span>
                <h4 className="font-heading-lg text-heading-lg font-bold text-on-surface">
                  No components listed yet
                </h4>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  Have spare Arduino boards, multimeter, or sensors in your dorm? List them to earn rental income.
                </p>
                <Button variant="primary" size="md" onClick={() => navigate('/list-item')}>
                  List Your First Component
                </Button>
              </div>
            ) : (
              myListings.map((item) => (
                <div
                  key={item.id}
                  onClick={() => navigate(`/item/${item.id}`)}
                  className="bg-surface-container-lowest rounded-[24px] p-4 border border-outline-variant/30 shadow-xs flex items-center justify-between cursor-pointer hover:bg-surface-container-low transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-2xl overflow-hidden bg-surface-variant shrink-0">
                      <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-heading-lg text-[16px] font-bold text-on-surface">
                        {item.title}
                      </span>
                      <span className="text-[12px] text-on-surface-variant">
                        {item.type} • ₹{item.price}{item.priceUnit}
                      </span>
                    </div>
                  </div>
                  <span className="text-primary font-bold text-label-md">Manage</span>
                </div>
              ))
            )}
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
