import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { TopAppBar } from '../components/common/TopAppBar';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { EscrowTrustCard } from '../components/rental/EscrowTrustCard';
import { Modal } from '../components/common/Modal';
import { useMarketplace } from '../context/MarketplaceContext';

export function ItemDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { items, rentItem, buyItem, borrowItem, savedItemIds, toggleSaveItem } = useMarketplace();

  const [rentDays, setRentDays] = useState(3);
  const [customDays, setCustomDays] = useState('');
  const [isCustomDays, setIsCustomDays] = useState(false);
  const [buyerNote, setBuyerNote] = useState('');

  // Modals state
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [actionType, setActionType] = useState('Rent'); // 'Rent' | 'Buy' | 'Borrow' | 'Request'
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  const item = items.find((i) => i.id === id) || items[0];
  const isSaved = savedItemIds.includes(item?.id);

  if (!item) {
    return (
      <div className="bg-background min-h-screen flex flex-col items-center justify-center p-4">
        <span className="text-on-surface-variant font-bold">Item not found.</span>
        <Button variant="primary" size="sm" onClick={() => navigate('/explore')} className="mt-3">
          Back to Marketplace
        </Button>
      </div>
    );
  }

  const effectiveDays = isCustomDays ? Number(customDays) || 1 : rentDays;
  const totalRentalFee = item.type === 'Rent' || actionType === 'Rent' ? (item.price || 0) * effectiveDays : item.price || 0;
  const totalDueWithEscrow = totalRentalFee + (item.deposit || 0);

  const handleOpenAction = (type) => {
    setActionType(type);
    setIsActionModalOpen(true);
  };

  const handleConfirmAction = async () => {
    setIsActionModalOpen(false);

    if (actionType === 'Rent') {
      await rentItem(item, effectiveDays);
      setIsSuccessModalOpen(true);
    } else if (actionType === 'Buy') {
      await buyItem(item, buyerNote);
      setIsSuccessModalOpen(true);
    } else if (actionType === 'Borrow') {
      await borrowItem(item, effectiveDays, buyerNote);
      setIsSuccessModalOpen(true);
    }
  };

  const handleSendCustomRequest = async (e) => {
    e.preventDefault();
    setIsRequestModalOpen(false);
    await buyItem(item, buyerNote || 'Custom request inquiry');
    setIsSuccessModalOpen(true);
  };

  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col antialiased">
      <TopAppBar showBack={true} />

      <main className="flex-1 w-full max-w-3xl mx-auto p-margin-mobile flex flex-col gap-lg pb-36">
        {/* Item Image Gallery Container */}
        <div className="relative w-full h-72 sm:h-80 bg-surface-container rounded-[24px] overflow-hidden border border-outline-variant/30 shadow-md">
          <img
            src={item.image}
            alt={item.title}
            className="w-full h-full object-cover"
          />

          {/* Badges on Image */}
          <div className="absolute top-4 left-4 flex items-center gap-2 flex-wrap">
            <Badge variant={item.type.toLowerCase()} size="md">
              {item.type}
            </Badge>
            <Badge variant="glass" size="md">
              {item.condition}
            </Badge>
            <span
              className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider backdrop-blur-md ${
                item.available !== false
                  ? 'bg-emerald-950/80 text-emerald-300'
                  : 'bg-rose-950/80 text-rose-300'
              }`}
            >
              {item.available !== false ? 'In Stock' : 'Currently In Use'}
            </span>
          </div>

          {/* Favorite Button */}
          <button
            onClick={() => toggleSaveItem(item.id)}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-surface-container-lowest/85 backdrop-blur-md text-on-surface hover:bg-surface-container-lowest flex items-center justify-center shadow-sm active:scale-95 cursor-pointer"
          >
            <span
              className={`material-symbols-outlined text-[22px] transition-colors ${
                isSaved ? 'text-error fill' : 'text-on-surface-variant'
              }`}
              style={{ fontVariationSettings: isSaved ? "'FILL' 1" : "'FILL' 0" }}
            >
              favorite
            </span>
          </button>

          {/* Location Bar */}
          <div className="absolute bottom-3 left-4 bg-on-surface/80 backdrop-blur-md text-white px-3 py-1 rounded-full text-body-sm font-medium flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[16px] text-primary-container">
              location_on
            </span>
            <span>{item.location}</span>
          </div>
        </div>

        {/* Title, Category & Price Header */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="font-label-md text-label-md uppercase tracking-wider text-primary font-bold">
              {item.category}
            </span>
            <span className="text-[12px] font-mono text-on-surface-variant font-semibold">
              ID: {item.id}
            </span>
          </div>

          <h2 className="font-heading-xl text-[24px] sm:text-[28px] text-on-surface font-extrabold leading-tight">
            {item.title}
          </h2>

          <div className="flex items-baseline gap-2 mt-1 flex-wrap">
            <span className="font-display-lg-mobile text-[32px] font-extrabold text-on-surface">
              ₹{item.price}
            </span>
            <span className="font-body-md text-body-md text-on-surface-variant font-medium">
              {item.priceUnit}
            </span>
            {item.deposit > 0 && (
              <span className="text-[13px] font-semibold text-primary ml-2 bg-primary/10 px-2.5 py-0.5 rounded-full border border-primary/20">
                + ₹{item.deposit} Refundable Escrow Deposit
              </span>
            )}
          </div>
        </div>

        {/* Verified Owner Card */}
        <div className="bg-surface-container rounded-[24px] p-md border border-outline-variant/30 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full overflow-hidden bg-surface-variant border-2 border-primary/30 shrink-0">
              <img
                src={item.owner?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80'}
                alt={item.owner?.name || 'Owner'}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-button-lg text-button-lg text-on-surface font-bold">
                  {item.owner?.name}
                </span>
                {item.owner?.verified && (
                  <span
                    className="material-symbols-outlined text-primary text-[18px]"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    verified
                  </span>
                )}
              </div>
              <span className="font-body-sm text-[13px] text-on-surface-variant">
                {item.owner?.year} • {item.owner?.dept}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1 bg-surface-container-lowest px-3 py-1.5 rounded-full border border-outline-variant/30 text-body-sm font-bold text-on-surface">
            <span className="text-amber-500 font-extrabold">★</span>
            <span>{item.owner?.rating || 4.9}</span>
            <span className="text-outline text-[11px] font-normal hidden sm:inline">
              ({item.owner?.swapsCount || 18} swaps)
            </span>
          </div>
        </div>

        {/* Product Description */}
        <div className="flex flex-col gap-2">
          <h3 className="font-heading-lg text-[18px] font-bold text-on-surface">
            Description & Lab Context
          </h3>
          <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/20">
            {item.description}
          </p>
        </div>

        {/* Technical Specifications */}
        {item.specs && item.specs.length > 0 && (
          <div className="bg-surface-container rounded-[24px] p-5 sm:p-6 border border-outline-variant/30 flex flex-col gap-3 shadow-xs">
            <div className="flex items-center justify-between">
              <h3 className="font-heading-lg text-[18px] font-bold text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">memory</span>
                Hardware Specifications
              </h3>
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                Lab Verified
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {item.specs.map((spec, idx) => (
                <div
                  key={idx}
                  className="bg-surface-container-lowest p-3 rounded-xl border border-outline-variant/20 flex flex-col"
                >
                  <span className="text-[11px] font-semibold text-outline uppercase tracking-wider">
                    {spec.label}
                  </span>
                  <span className="text-[14px] font-bold text-on-surface mt-0.5">
                    {spec.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Learn about this component - Knowledge Hub Integration */}
        <div className="bg-gradient-to-r from-secondary/10 via-primary/10 to-transparent rounded-[24px] p-5 border border-primary/30 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-primary text-white flex items-center justify-center shrink-0 shadow-sm">
              <span className="material-symbols-outlined text-[24px]">menu_book</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-primary">
                Engineering Knowledge Base
              </span>
              <h4 className="font-heading-lg text-[15px] font-bold text-on-surface">
                Learn about {item.category} pinouts & tutorials
              </h4>
              <span className="text-[12px] text-on-surface-variant">
                Datasheets, GPIO mappings, and wiring guides verified by lab assistants.
              </span>
            </div>
          </div>

          <Link to="/knowledge-hub">
            <Button variant="primary" size="sm" icon="arrow_forward" className="text-[12px] shrink-0 font-bold">
              Open Guide
            </Button>
          </Link>
        </div>

        {/* Escrow Protection Guarantee */}
        <EscrowTrustCard deposit={item.deposit || 300} />
      </main>

      {/* Sticky Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 w-full bg-surface/90 backdrop-blur-xl border-t border-outline-variant/30 p-margin-mobile flex items-center justify-between shadow-[0_-4px_16px_rgba(0,0,0,0.06)] z-40">
        <div className="flex flex-col">
          <span className="text-[11px] font-semibold text-outline uppercase">
            {item.type === 'Rent' ? 'Daily Rate' : item.type === 'Buy' ? 'Purchase Price' : 'Peer Borrow'}
          </span>
          <div className="font-heading-lg text-[22px] font-extrabold text-on-surface leading-tight">
            ₹{item.price}
            <span className="text-[12px] font-normal text-on-surface-variant ml-1">
              {item.priceUnit}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="md"
            icon="chat"
            onClick={() => setIsRequestModalOpen(true)}
            className="hidden sm:flex bg-surface-container-lowest"
          >
            Inquire
          </Button>

          <Button
            variant="primary"
            size="lg"
            icon={item.type === 'Rent' ? 'timer' : item.type === 'Borrow' ? 'handshake' : 'shopping_bag'}
            onClick={() => handleOpenAction(item.type)}
            className="px-6 sm:px-8 shadow-lg font-bold"
          >
            {item.type === 'Rent' ? 'Rent with Escrow' : item.type === 'Borrow' ? 'Request Borrow' : 'Buy Item'}
          </Button>
        </div>
      </div>

      {/* Action / Checkout Modal (Rent / Buy / Borrow) */}
      <Modal
        isOpen={isActionModalOpen}
        onClose={() => setIsActionModalOpen(false)}
        title={
          actionType === 'Rent'
            ? 'Confirm Rental & Escrow Duration'
            : actionType === 'Buy'
            ? 'Confirm Component Purchase'
            : 'Request Peer Borrow'
        }
        subtitle={item.title}
      >
        <div className="flex flex-col gap-4">
          {/* Duration Selector for Rent */}
          {actionType === 'Rent' && (
            <div className="flex flex-col gap-2">
              <label className="text-body-sm font-bold text-on-surface">
                Select Rental Duration:
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[1, 3, 7].map((days) => (
                  <button
                    key={days}
                    type="button"
                    onClick={() => {
                      setRentDays(days);
                      setIsCustomDays(false);
                    }}
                    className={`py-2.5 rounded-xl text-button-lg font-bold border transition-all cursor-pointer ${
                      !isCustomDays && rentDays === days
                        ? 'bg-primary text-white border-primary shadow-xs'
                        : 'bg-surface-container text-on-surface border-outline-variant/30 hover:bg-surface-container-high'
                    }`}
                  >
                    {days} {days === 1 ? 'Day' : 'Days'}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setIsCustomDays(true)}
                  className={`py-2.5 rounded-xl text-button-lg font-bold border transition-all cursor-pointer ${
                    isCustomDays
                      ? 'bg-primary text-white border-primary shadow-xs'
                      : 'bg-surface-container text-on-surface border-outline-variant/30 hover:bg-surface-container-high'
                  }`}
                >
                  Custom
                </button>
              </div>

              {isCustomDays && (
                <div className="flex items-center gap-2 mt-1">
                  <input
                    type="number"
                    min="1"
                    max="60"
                    placeholder="Enter number of days"
                    value={customDays}
                    onChange={(e) => setCustomDays(e.target.value)}
                    className="p-2.5 bg-surface-container rounded-xl border border-outline-variant/30 text-body-sm w-full"
                  />
                  <span className="text-body-sm text-on-surface font-semibold shrink-0">Days</span>
                </div>
              )}
            </div>
          )}

          {/* Note to Owner */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">
              Message to {item.owner?.name} (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Free to meet at Electronics Lab around 2 PM..."
              value={buyerNote}
              onChange={(e) => setBuyerNote(e.target.value)}
              className="p-3 bg-surface-container rounded-xl border border-outline-variant/30 text-body-sm text-on-surface"
            />
          </div>

          {/* Pricing Breakdown Box */}
          <div className="bg-surface-container rounded-2xl p-4 border border-outline-variant/30 flex flex-col gap-2.5">
            {actionType === 'Rent' && (
              <div className="flex justify-between text-body-sm text-on-surface-variant">
                <span>Rental Fee ({effectiveDays} day{effectiveDays > 1 ? 's' : ''} × ₹{item.price})</span>
                <span className="font-semibold text-on-surface">₹{totalRentalFee}</span>
              </div>
            )}

            {actionType === 'Buy' && (
              <div className="flex justify-between text-body-sm text-on-surface-variant">
                <span>Purchase Price</span>
                <span className="font-semibold text-on-surface">₹{item.price}</span>
              </div>
            )}

            {actionType === 'Borrow' && (
              <div className="flex justify-between text-body-sm text-on-surface-variant">
                <span>Peer Borrow Fee</span>
                <span className="font-semibold text-emerald-700">₹0 (Free Peer Sharing)</span>
              </div>
            )}

            {item.deposit > 0 && (
              <div className="flex justify-between text-body-sm text-on-surface-variant">
                <span>Refundable Escrow Deposit</span>
                <span className="font-semibold text-primary">₹{item.deposit}</span>
              </div>
            )}

            <div className="pt-2 border-t border-outline-variant/30 flex justify-between font-heading-lg text-[18px] font-bold text-on-surface">
              <span>Total Authorization</span>
              <span>₹{actionType === 'Buy' ? item.price : totalDueWithEscrow}</span>
            </div>
          </div>

          <p className="text-[11px] text-on-surface-variant leading-relaxed">
            {actionType === 'Rent' || actionType === 'Borrow'
              ? 'Security deposit is locked in CampusSwap Smart Escrow and refunded directly upon bilateral QR return scan.'
              : 'Direct peer transaction verified by college student ID at pickup location.'}
          </p>

          <Button
            variant="primary"
            size="lg"
            fullWidth
            onClick={handleConfirmAction}
            icon="verified_user"
          >
            {actionType === 'Rent' ? 'Authorize Escrow & Rent' : actionType === 'Buy' ? 'Confirm Purchase Request' : 'Submit Borrow Request'}
          </Button>
        </div>
      </Modal>

      {/* Direct Request / Inquiry Modal */}
      <Modal
        isOpen={isRequestModalOpen}
        onClose={() => setIsRequestModalOpen(false)}
        title="Send Hardware Inquiry"
        subtitle={`To ${item.owner?.name} regarding ${item.title}`}
      >
        <form onSubmit={handleSendCustomRequest} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-label-md font-bold uppercase text-on-surface">Inquiry Message</label>
            <textarea
              rows={3}
              required
              placeholder="Ask about component condition, pin headers, custom rental duration, or test results..."
              value={buyerNote}
              onChange={(e) => setBuyerNote(e.target.value)}
              className="p-3 bg-surface-container rounded-xl border border-outline-variant/30 text-body-sm text-on-surface"
            />
          </div>

          <div className="flex gap-2">
            <Button type="button" variant="secondary" fullWidth onClick={() => setIsRequestModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" fullWidth icon="send">
              Send Request
            </Button>
          </div>
        </form>
      </Modal>

      {/* Success Modal */}
      <Modal
        isOpen={isSuccessModalOpen}
        onClose={() => {
          setIsSuccessModalOpen(false);
          if (actionType === 'Rent') navigate('/active-rental');
        }}
        title="Transaction Initiated Successfully!"
        subtitle="Handover details generated"
      >
        <div className="flex flex-col items-center gap-4 text-center py-2">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
            <span className="material-symbols-outlined text-[40px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              check_circle
            </span>
          </div>

          <div className="flex flex-col gap-1">
            <h4 className="font-heading-lg text-heading-lg font-bold text-on-surface">
              {actionType === 'Rent'
                ? `₹${totalDueWithEscrow} Secured in Escrow`
                : actionType === 'Buy'
                ? 'Purchase Request Sent'
                : 'Borrow Request Sent'}
            </h4>
            <p className="font-body-sm text-body-sm text-on-surface-variant max-w-xs">
              Meet <strong>{item.owner?.name}</strong> at <strong>{item.location}</strong> to complete handover.
            </p>
          </div>

          <Button
            variant="primary"
            size="lg"
            fullWidth
            onClick={() => {
              setIsSuccessModalOpen(false);
              navigate(actionType === 'Rent' ? '/active-rental' : '/explore');
            }}
          >
            {actionType === 'Rent' ? 'View Active Rental Tracker' : 'Back to Marketplace'}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
