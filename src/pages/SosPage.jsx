import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TopAppBar } from '../components/common/TopAppBar';
import { BottomNav } from '../components/common/BottomNav';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { SosCard } from '../components/sos/SosCard';
import { RatingDialog } from '../components/trust/RatingDialog';
import { sosService } from '../services/sosService';
import { reputationService } from '../services/reputationService';
import { aiMatchService } from '../services/aiMatchService';
import { useToast } from '../components/common/Toast';
import { useAuth } from '../context/AuthContext';

export function SosPage() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { user } = useAuth();

  const [sosRequests, setSosRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all' | 'my' | 'nearby' | 'completed'

  // Post SOS Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    componentName: '',
    quantity: 1,
    projectContext: '',
    urgency: 'URGENT',
    requiredBy: 'Within 1 Hour',
    preferredLocation: 'Academic Block B - Lab 204',
    budget: 50,
    additionalSpecs: ''
  });

  // Offer Resource Modal
  const [activeOfferSOS, setActiveOfferSOS] = useState(null);
  const [offerNote, setOfferNote] = useState('Working unit ready with connector pins');
  const [offerLocation, setOfferLocation] = useState('Academic Block B Courtyard');

  // Rate Modal
  const [ratingSOS, setRatingSOS] = useState(null);

  useEffect(() => {
    loadRequests();
  }, [filter]);

  const loadRequests = async () => {
    setLoading(true);
    try {
      const data = await sosService.getSOSRequests({ filter, currentUserId: user?.id || 'user-001' });
      setSosRequests(data);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSOS = async (e) => {
    e.preventDefault();
    if (!formData.componentName.trim()) return;

    const newSOS = await sosService.createSOSRequest({
      ...formData,
      currentUser: user || {
        id: 'user-001',
        name: 'Arjun Sharma',
        dept: 'ECE',
        year: '3rd Year',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
        rating: 4.9
      }
    });

    setIsModalOpen(false);
    addToast(`🚨 Emergency SOS for "${formData.componentName}" broadcasted!`, 'success');
    loadRequests();
  };

  const handleOpenOfferModal = (sos) => {
    setActiveOfferSOS(sos);
  };

  const handleConfirmOffer = async (e) => {
    e.preventDefault();
    if (!activeOfferSOS) return;

    await sosService.offerResource(activeOfferSOS.id, {
      offerorName: user?.name || 'Arjun Sharma',
      offerorDept: `${user?.year || '3rd Year'} ${user?.dept || 'Engineering'}`,
      itemNote: offerNote,
      location: offerLocation,
      offerorId: user?.id || 'user-001'
    });

    setActiveOfferSOS(null);
    addToast(`Offered hardware to ${activeOfferSOS.requester?.name || 'Student'}!`, 'success');
    loadRequests();
  };

  const handleAcceptOffer = async (sosId) => {
    const result = await sosService.acceptOffer(sosId, user);
    addToast('✓ Offer accepted! Generating physical Handover QR...', 'success');
    if (result?.handoverId) {
      navigate(`/handover/${result.handoverId}`);
    } else {
      loadRequests();
    }
  };

  const handleDeclineOffer = async (sosId) => {
    await sosService.cancelSOS(sosId);
    addToast('Offer declined. SOS reset to active search.', 'info');
    loadRequests();
  };

  const handleRateExchange = (sos) => {
    setRatingSOS(sos);
  };

  const handleSubmitRating = async (ratingData) => {
    await reputationService.submitRating(ratingData);
    addToast('★ Review submitted! Campus trust score updated.', 'success');
    setRatingSOS(null);
    loadRequests();
  };

  const autocompleteChips = aiMatchService.getAutocompleteSuggestions(formData.componentName);

  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col antialiased">
      <TopAppBar showBack={true} />

      <main className="flex-1 w-full max-w-4xl mx-auto p-margin-mobile flex flex-col gap-lg pb-32">
        {/* Urgent Alert Banner */}
        <div className="bg-gradient-to-br from-rose-600 via-rose-700 to-amber-700 text-white rounded-[24px] p-6 shadow-xl relative overflow-hidden flex flex-col gap-3">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />

          <div className="flex items-center justify-between z-10">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[24px] animate-bounce">
                emergency
              </span>
              <span className="font-label-md uppercase tracking-wider font-extrabold bg-white/20 px-3 py-1 rounded-full text-white">
                Academic Hardware Emergency Network
              </span>
            </div>
            <span className="text-[11px] font-bold bg-white/15 px-2.5 py-0.5 rounded-full">
              Live Campus Radar
            </span>
          </div>

          <div className="flex flex-col gap-1 z-10">
            <h2 className="font-display-lg-mobile text-[22px] sm:text-[26px] font-extrabold tracking-tight">
              Urgent Project & Lab SOS Hub
            </h2>
            <p className="text-body-sm text-white/90 leading-relaxed max-w-xl">
              Burned a microcontroller before an exam evaluation? Missing a critical sensor for your capstone demo? Broadcast an urgent SOS request to nearby labs and peers.
            </p>
          </div>

          <div className="pt-2 z-10 flex items-center gap-2 flex-wrap">
            <Button
              variant="surface"
              size="md"
              icon="add_alert"
              onClick={() => setIsModalOpen(true)}
              className="text-rose-700 font-extrabold bg-white hover:bg-white/90 border-0 shadow-md"
            >
              Post Emergency SOS Request
            </Button>
          </div>
        </div>

        {/* Dashboard Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          {[
            { id: 'all', label: 'All SOS Alerts', icon: 'campaign' },
            { id: 'my', label: 'My Active SOS', icon: 'person' },
            { id: 'nearby', label: 'Nearby Urgent', icon: 'near_me' },
            { id: 'completed', label: 'Completed', icon: 'check_circle' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`px-4 py-2 rounded-full text-label-md font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                filter === tab.id
                  ? 'bg-primary text-white shadow-xs'
                  : 'bg-surface-container hover:bg-surface-container-high text-on-surface-variant border border-outline-variant/30'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* SOS Requests List */}
        {loading ? (
          <div className="p-8 text-center text-on-surface-variant font-medium">
            Loading SOS requests...
          </div>
        ) : sosRequests.length === 0 ? (
          <div className="bg-surface-container rounded-[24px] p-10 text-center border border-outline-variant/30 flex flex-col items-center gap-3">
            <span className="material-symbols-outlined text-[48px] text-outline">verified</span>
            <h4 className="font-heading-lg text-[18px] font-bold text-on-surface">
              No active SOS alerts in this category
            </h4>
            <p className="text-body-sm text-on-surface-variant max-w-sm">
              All peer requests in this category are fulfilled or clear. Broadcast an alert if you need urgent hardware.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {sosRequests.map((sos) => (
              <SosCard
                key={sos.id}
                sos={sos}
                onOfferResource={handleOpenOfferModal}
                onAcceptOffer={handleAcceptOffer}
                onDeclineOffer={handleDeclineOffer}
                onRateExchange={handleRateExchange}
                isMyRequest={sos.requesterId === 'user-001'}
              />
            ))}
          </div>
        )}
      </main>

      {/* Post Emergency SOS Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Broadcast Emergency SOS Request"
        subtitle="Notify nearby students & labs immediately for urgent assistance"
      >
        <form onSubmit={handleCreateSOS} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-label-md uppercase font-bold text-on-surface">
              Component Required *
            </label>
            <input
              type="text"
              required
              value={formData.componentName}
              onChange={(e) => setFormData({ ...formData, componentName: e.target.value })}
              placeholder="e.g. ESP32 NodeMCU, HC-SR04, NEMA 17 Stepper, DSO Probe..."
              className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant/30 rounded-[16px] text-body-md text-on-surface focus:outline-none focus:border-rose-500 font-semibold"
            />

            {/* Suggestions */}
            <div className="flex items-center gap-1.5 flex-wrap pt-1">
              <span className="text-[11px] text-outline font-semibold">Quick select:</span>
              {autocompleteChips.slice(0, 5).map((chip, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setFormData({ ...formData, componentName: chip })}
                  className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-surface-container text-on-surface-variant border border-outline-variant/30"
                >
                  {chip}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-bold uppercase text-on-surface-variant">
                Quantity
              </label>
              <input
                type="number"
                min="1"
                max="10"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                className="p-3 bg-surface-container-low rounded-xl border border-outline-variant/30 text-body-sm text-on-surface"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-bold uppercase text-on-surface-variant">
                Urgency Level
              </label>
              <select
                value={formData.urgency}
                onChange={(e) => setFormData({ ...formData, urgency: e.target.value })}
                className="p-3 bg-surface-container-low rounded-xl border border-outline-variant/30 text-body-sm text-on-surface font-bold text-rose-600"
              >
                <option value="URGENT">URGENT (Within 1 Hour / Exam Viva)</option>
                <option value="HIGH">HIGH (Today by Evening)</option>
                <option value="NORMAL">NORMAL (Tomorrow)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-bold uppercase text-on-surface-variant">
                Preferred Campus Location *
              </label>
              <input
                type="text"
                required
                value={formData.preferredLocation}
                onChange={(e) => setFormData({ ...formData, preferredLocation: e.target.value })}
                placeholder="e.g. Block B - Lab 204"
                className="p-3 bg-surface-container-low rounded-xl border border-outline-variant/30 text-body-sm text-on-surface"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-bold uppercase text-on-surface-variant">
                Optional Bounty / Budget (₹)
              </label>
              <input
                type="number"
                value={formData.budget}
                onChange={(e) => setFormData({ ...formData, budget: Number(e.target.value) })}
                placeholder="0 for free borrow"
                className="p-3 bg-surface-container-low rounded-xl border border-outline-variant/30 text-body-sm text-on-surface"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-bold uppercase text-on-surface-variant">
              Project Context Note *
            </label>
            <textarea
              rows="2"
              required
              value={formData.projectContext}
              onChange={(e) => setFormData({ ...formData, projectContext: e.target.value })}
              placeholder="e.g. Practical lab evaluation starting in 45 mins, burned my controller."
              className="p-3 bg-surface-container-low rounded-xl border border-outline-variant/30 text-body-sm text-on-surface"
            />
          </div>

          <Button
            type="submit"
            variant="danger"
            size="lg"
            fullWidth
            icon="emergency_share"
            className="font-bold shadow-md"
          >
            Broadcast Emergency SOS
          </Button>
        </form>
      </Modal>

      {/* Offer Resource Modal */}
      {activeOfferSOS && (
        <Modal
          isOpen={true}
          onClose={() => setActiveOfferSOS(null)}
          title={`Offer ${activeOfferSOS.componentName}`}
          subtitle={`Fulfill emergency request for ${activeOfferSOS.requester.name}`}
        >
          <form onSubmit={handleConfirmOffer} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-label-md font-bold uppercase text-on-surface">
                Item Condition & Pickup Note *
              </label>
              <input
                type="text"
                required
                value={offerNote}
                onChange={(e) => setOfferNote(e.target.value)}
                placeholder="e.g. Tested working unit with headers, ready right now"
                className="p-3 bg-surface-container-low rounded-xl border border-outline-variant/30 text-body-sm text-on-surface"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-label-md font-bold uppercase text-on-surface">
                Pickup Meeting Location *
              </label>
              <input
                type="text"
                required
                value={offerLocation}
                onChange={(e) => setOfferLocation(e.target.value)}
                placeholder="e.g. Academic Block B Courtyard"
                className="p-3 bg-surface-container-low rounded-xl border border-outline-variant/30 text-body-sm text-on-surface"
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              icon="handshake"
              className="font-bold"
            >
              Send Resource Offer
            </Button>
          </form>
        </Modal>
      )}

      {/* Post-Transaction Rating Dialog */}
      {ratingSOS && (
        <RatingDialog
          isOpen={true}
          onClose={() => setRatingSOS(null)}
          transactionTitle={ratingSOS.componentName}
          otherPartyName={ratingSOS.requester?.name}
          onSubmitRating={handleSubmitRating}
        />
      )}

      <BottomNav />
    </div>
  );
}
