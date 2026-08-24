import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TopAppBar } from '../components/common/TopAppBar';
import { BottomNav } from '../components/common/BottomNav';
import { Button } from '../components/common/Button';
import { SmartMatchCard } from '../components/ai/SmartMatchCard';
import { AIProcessingState } from '../components/ai/AIProcessingState';
import { Modal } from '../components/common/Modal';
import { aiMatchService } from '../services/aiMatchService';
import { useToast } from '../components/common/Toast';
import { useMarketplace } from '../context/MarketplaceContext';
import { useAuth } from '../context/AuthContext';

export function AiSmartMatchPage() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { rentItem, buyItem, borrowItem } = useMarketplace();
  const { user } = useAuth();

  const [componentInput, setComponentInput] = useState('Arduino UNO');
  const [requirementContext, setRequirementContext] = useState('For an obstacle avoiding robot');
  const [quantity, setQuantity] = useState(1);
  const [transactionType, setTransactionType] = useState('All');
  const [maxBudget, setMaxBudget] = useState(300);
  const [urgency, setUrgency] = useState('Normal');

  const [isProcessing, setIsProcessing] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [matches, setMatches] = useState([]);

  // Checkout modal state for direct rent/buy/borrow
  const [selectedMatchItem, setSelectedMatchItem] = useState(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [rentDays, setRentDays] = useState(3);

  const autocompleteChips = aiMatchService.getAutocompleteSuggestions(componentInput);

  const handleRunMatch = async (e) => {
    if (e) e.preventDefault();
    if (!componentInput.trim()) return;

    setIsProcessing(true);
    setHasSearched(false);

    try {
      const results = await aiMatchService.findSmartMatches({
        component: componentInput,
        requirement: requirementContext,
        quantity,
        transactionType,
        maxBudget,
        urgency,
        userId: user?.id || 'user-001'
      });
      setMatches(results);
    } catch (err) {
      console.error(err);
    }
  };

  const handleProcessingComplete = () => {
    setIsProcessing(false);
    setHasSearched(true);
  };

  const handleOpenRentModal = (match) => {
    setSelectedMatchItem(match);
    setIsCheckoutOpen(true);
  };

  const handleConfirmCheckout = async () => {
    if (!selectedMatchItem) return;
    setIsCheckoutOpen(false);
    if (selectedMatchItem.type === 'Borrow') {
      await borrowItem(selectedMatchItem, rentDays);
    } else if (selectedMatchItem.type === 'Buy') {
      await buyItem(selectedMatchItem);
    } else {
      await rentItem(selectedMatchItem, rentDays);
      navigate('/active-rental');
    }
  };

  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col antialiased">
      <TopAppBar showBack={true} />

      <main className="flex-1 w-full max-w-4xl mx-auto p-margin-mobile flex flex-col gap-lg pb-32">
        {/* AI Header Card */}
        <div className="bg-gradient-to-br from-primary via-primary-container to-secondary rounded-[24px] p-6 text-white shadow-xl relative overflow-hidden flex flex-col gap-3">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />

          <div className="z-10 flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px] text-primary-fixed animate-pulse">
                auto_awesome
              </span>
              <span className="text-[11px] uppercase tracking-widest font-extrabold text-on-primary-container bg-white/20 px-2.5 py-0.5 rounded-full">
                AI Smart Match Engine
              </span>
            </div>
            <h2 className="font-display-lg-mobile text-[24px] sm:text-[28px] font-extrabold tracking-tight">
              Instant Hardware Requirement Matching
            </h2>
            <p className="text-body-sm text-white/85 max-w-xl leading-relaxed">
              Describe your project requirement and our multi-factor scoring algorithm will find and rank the best available campus gear by compatibility, distance, price, and trust.
            </p>
          </div>
        </div>

        {/* Input Form Section */}
        <form
          onSubmit={handleRunMatch}
          className="bg-surface-container-lowest rounded-[24px] p-6 border border-outline-variant/30 shadow-xs flex flex-col gap-5"
        >
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="font-label-md text-label-md uppercase font-bold text-on-surface">
                Hardware Component Needed *
              </label>
              <span className="text-[11px] text-primary font-semibold">Autocomplete Ready</span>
            </div>

            <input
              type="text"
              required
              value={componentInput}
              onChange={(e) => setComponentInput(e.target.value)}
              placeholder="e.g. Arduino UNO, ESP32, NEMA 17 Stepper, Oscilloscope..."
              className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant/30 rounded-[16px] text-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-semibold"
            />

            {/* Autocomplete Chips */}
            <div className="flex items-center gap-1.5 flex-wrap pt-1">
              <span className="text-[11px] text-outline font-semibold">Suggestions:</span>
              {autocompleteChips.map((chip, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setComponentInput(chip)}
                  className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-surface-container hover:bg-surface-container-high text-on-surface-variant border border-outline-variant/30 transition-all cursor-pointer"
                >
                  {chip}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-label-md text-label-md uppercase font-bold text-on-surface">
              Project Context & Application (Optional)
            </label>
            <input
              type="text"
              value={requirementContext}
              onChange={(e) => setRequirementContext(e.target.value)}
              placeholder="e.g. For an obstacle avoiding robot / lab viva examination..."
              className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant/30 rounded-[16px] text-body-sm text-on-surface focus:outline-none focus:border-primary"
            />
          </div>

          {/* Grid Options: Type, Budget, Urgency */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">
                Transaction Type
              </label>
              <select
                value={transactionType}
                onChange={(e) => setTransactionType(e.target.value)}
                className="p-3 bg-surface-container-low rounded-xl border border-outline-variant/30 text-body-sm text-on-surface"
              >
                <option value="All">All Types (Rent / Buy / Borrow)</option>
                <option value="Rent">Rent with Escrow</option>
                <option value="Buy">Buy Component</option>
                <option value="Borrow">Free Peer Borrow</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">
                  Max Budget (₹)
                </label>
                <span className="text-[12px] font-bold text-primary">₹{maxBudget}</span>
              </div>
              <input
                type="range"
                min="0"
                max="2000"
                step="50"
                value={maxBudget}
                onChange={(e) => setMaxBudget(Number(e.target.value))}
                className="w-full accent-primary cursor-pointer mt-2"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">
                Urgency Level
              </label>
              <div className="flex items-center gap-1 bg-surface-container-low p-1 rounded-xl border border-outline-variant/30">
                {['Normal', 'Soon', 'Urgent'].map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setUrgency(lvl)}
                    className={`flex-1 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                      urgency === lvl
                        ? lvl === 'Urgent'
                          ? 'bg-error text-white'
                          : 'bg-primary text-white'
                        : 'text-on-surface-variant hover:text-on-surface'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            icon="auto_awesome"
            className="font-bold shadow-md"
          >
            Run AI Smart Match
          </Button>
        </form>

        {/* Processing State */}
        {isProcessing && (
          <AIProcessingState onComplete={handleProcessingComplete} />
        )}

        {/* Matches Results Section */}
        {!isProcessing && hasSearched && (
          <div className="flex flex-col gap-4 animate-scale-up">
            <div className="flex items-center justify-between border-b border-outline-variant/20 pb-2">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[22px]">
                  award_star
                </span>
                <h3 className="font-heading-lg text-[20px] font-bold text-on-surface">
                  Ranked Smart Match Results ({matches.length})
                </h3>
              </div>
              <span className="text-[11px] text-outline italic">
                * Match scores are prototype calculations
              </span>
            </div>

            {matches.length === 0 ? (
              <div className="bg-surface-container rounded-[24px] p-10 text-center border border-outline-variant/30 flex flex-col items-center gap-3">
                <span className="material-symbols-outlined text-[48px] text-outline">search_off</span>
                <h4 className="font-heading-lg text-[18px] font-bold text-on-surface">
                  No direct matches found
                </h4>
                <p className="text-body-sm text-on-surface-variant max-w-sm">
                  We could not find matching hardware in stock for "{componentInput}". Try broadening your budget or requirement terms.
                </p>
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => navigate('/list-item')}
                >
                  Create Hardware Request
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
                {matches.map((match) => (
                  <SmartMatchCard
                    key={match.id}
                    match={match}
                    onRent={handleOpenRentModal}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Direct Rent / Checkout Modal */}
      {selectedMatchItem && (
        <Modal
          isOpen={isCheckoutOpen}
          onClose={() => setIsCheckoutOpen(false)}
          title={`Confirm ${selectedMatchItem.type}`}
          subtitle={selectedMatchItem.title}
        >
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3 p-3 bg-surface-container rounded-2xl border border-outline-variant/30">
              <img
                src={selectedMatchItem.image}
                alt={selectedMatchItem.title}
                className="w-14 h-14 rounded-xl object-cover"
              />
              <div className="flex flex-col">
                <span className="text-[14px] font-bold text-on-surface">
                  {selectedMatchItem.title}
                </span>
                <span className="text-[12px] text-on-surface-variant">
                  {selectedMatchItem.location} • ₹{selectedMatchItem.price}{selectedMatchItem.priceUnit}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-body-sm font-bold text-on-surface">Select Duration (Days):</label>
              <div className="grid grid-cols-3 gap-2">
                {[1, 3, 7].map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setRentDays(d)}
                    className={`py-2 rounded-xl text-button-lg font-bold border transition-all cursor-pointer ${
                      rentDays === d
                        ? 'bg-primary text-white border-primary'
                        : 'bg-surface-container text-on-surface border-outline-variant/30'
                    }`}
                  >
                    {d} {d === 1 ? 'Day' : 'Days'}
                  </button>
                ))}
              </div>
            </div>

            <Button
              variant="primary"
              size="lg"
              fullWidth
              onClick={handleConfirmCheckout}
              icon="verified_user"
            >
              Confirm & Authorize
            </Button>
          </div>
        </Modal>
      )}

      <BottomNav />
    </div>
  );
}
