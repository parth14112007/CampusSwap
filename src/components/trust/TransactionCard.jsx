import React from 'react';
import { Button } from '../common/Button';

export function TransactionCard({ transaction, onRate, onOpenDetails }) {
  const getTypeColor = (type) => {
    switch (type) {
      case 'RENTAL':
        return 'bg-primary/15 text-primary border-primary/20';
      case 'SOS':
        return 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950/40 dark:text-rose-300';
      case 'BORROW':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300';
      case 'SALE':
      default:
        return 'bg-secondary/15 text-secondary border-secondary/20';
    }
  };

  return (
    <div className="bg-surface-container-lowest rounded-[20px] p-4 border border-outline-variant/30 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-primary/40 transition-all">
      <div className="flex items-start gap-3.5">
        <div className="w-14 h-14 rounded-2xl overflow-hidden bg-surface-container shrink-0 border border-outline-variant/20">
          <img
            src={transaction.image}
            alt={transaction.title}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="flex flex-col">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider border ${getTypeColor(
                transaction.type
              )}`}
            >
              {transaction.type}
            </span>
            <span className="text-[11px] text-on-surface-variant font-medium">
              {transaction.date}
            </span>
          </div>

          <h4 className="font-heading-lg text-[15px] font-bold text-on-surface mt-0.5">
            {transaction.title}
          </h4>

          <span className="text-[12px] text-on-surface-variant">
            {transaction.otherPartyRole}: <strong>{transaction.otherPartyName}</strong>
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-outline-variant/20">
        <div className="flex flex-col sm:text-right">
          <span className="text-[14px] font-extrabold text-on-surface">
            {transaction.amount > 0 ? `₹${transaction.amount}` : 'Free Exchange'}
          </span>
          <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-0.5">
            <span className="material-symbols-outlined text-[13px]">verified</span>
            {transaction.handoverStatus}
          </span>
        </div>

        {transaction.rating ? (
          <span className="px-2.5 py-1 rounded-xl bg-amber-500/10 text-amber-700 dark:text-amber-300 text-[12px] font-bold border border-amber-500/20 flex items-center gap-1 shrink-0">
            ★ {transaction.rating}.0 Rated
          </span>
        ) : (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => (onRate ? onRate(transaction) : null)}
            className="text-[11px] bg-surface-container shrink-0"
          >
            Rate Exchange
          </Button>
        )}
      </div>
    </div>
  );
}
