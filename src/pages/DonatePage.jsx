import React, { useState, useEffect } from 'react';
import { TopAppBar } from '../components/common/TopAppBar';
import { BottomNav } from '../components/common/BottomNav';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { DonationCard } from '../components/community/DonationCard';
import { donationService } from '../services/donationService';
import { storageService } from '../services/storageService';
import { useToast } from '../components/common/Toast';
import { useAuth } from '../context/AuthContext';

export function DonatePage() {
  const { addToast } = useToast();
  const { user } = useAuth();

  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    category: 'Arduino',
    condition: 'Good / Tested',
    quantity: 1,
    location: 'Academic Block B (Donation Bin 1)',
    description: '',
    handoverMethod: 'Lab Drop-Off Box',
    recycleTag: 'Reusable',
    image: ''
  });

  useEffect(() => {
    loadDonations();
  }, [selectedCategory]);

  const loadDonations = async () => {
    setLoading(true);
    try {
      const data = await donationService.getDonations({ category: selectedCategory });
      setDonations(data);
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingPhoto(true);
    try {
      const ext = file.name.split('.').pop() || 'jpg';
      const userId = user?.id || 'user-001';
      const path = `${userId}/${Date.now()}_donation.${ext}`;
      const result = await storageService.uploadFile('donation-images', path, file);
      setFormData((prev) => ({ ...prev, image: result.publicUrl }));
      addToast('Photo uploaded for donation listing', 'info');
    } catch (err) {
      addToast(err.message || 'Photo upload failed', 'error');
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleDonateSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    await donationService.donateItem({
      ...formData,
      donorName: user?.name || 'Arjun Sharma',
      donorDept: `${user?.year || '3rd Year'} ${user?.dept || 'ECE'}`,
      donorId: user?.id || 'user-001'
    });

    setIsModalOpen(false);
    setFormData({
      title: '',
      category: 'Arduino',
      condition: 'Good / Tested',
      quantity: 1,
      location: 'Academic Block B (Donation Bin 1)',
      description: '',
      handoverMethod: 'Lab Drop-Off Box',
      recycleTag: 'Reusable',
      image: ''
    });

    addToast('🌱 Donation registered! Added to Campus Reuse catalog.', 'success');
    loadDonations();
  };

  const handleClaim = async (donation) => {
    await donationService.claimDonation(
      donation.id,
      user?.name || 'Arjun Sharma',
      user?.id || 'user-001'
    );
    addToast(`✓ Claimed "${donation.title}"! Pick it up at ${donation.location}.`, 'success');
    loadDonations();
  };

  const recyclingRules = donationService.getRecyclingGuidelines();

  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col antialiased">
      <TopAppBar showBack={true} />

      <main className="flex-1 w-full max-w-5xl mx-auto p-margin-mobile flex flex-col gap-lg pb-32">
        {/* Header Hero */}
        <div className="bg-gradient-to-br from-emerald-600 via-teal-700 to-primary rounded-[24px] p-6 text-white shadow-xl relative overflow-hidden flex flex-col gap-3">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />

          <div className="flex items-center justify-between z-10">
            <span className="text-[11px] uppercase tracking-widest font-extrabold bg-white/20 px-3 py-1 rounded-full text-white">
              Circular Campus Hardware Economy
            </span>
            <span className="text-[11px] font-bold bg-white/15 px-2.5 py-0.5 rounded-full">
              Zero Waste Initiative
            </span>
          </div>

          <div className="flex flex-col gap-1 z-10">
            <h2 className="font-display-lg-mobile text-[24px] sm:text-[28px] font-extrabold tracking-tight">
              Donate, Reuse & Recycle Electronics
            </h2>
            <p className="text-body-sm text-white/85 max-w-xl leading-relaxed">
              Give your unused development boards, passives, and motors to junior students, or responsibly recycle non-functional lab equipment.
            </p>
          </div>

          <div className="pt-2 z-10">
            <Button
              variant="surface"
              size="md"
              icon="volunteer_activism"
              onClick={() => setIsModalOpen(true)}
              className="text-emerald-800 font-extrabold bg-white hover:bg-white/90 border-0 shadow-md"
            >
              Donate Unused Component
            </Button>
          </div>
        </div>

        {/* Sustainability Dashboard */}
        <ImpactMetricsGrid />

        {/* Available for Reuse Catalog */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h3 className="font-heading-lg text-[20px] font-bold text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-emerald-600">recycling</span>
              Available for Free Campus Reuse ({donations.length})
            </h3>

            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
              {['all', 'Arduino', 'Sensors', 'Motors', 'Electronics'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 rounded-full text-[12px] font-bold transition-all cursor-pointer shrink-0 ${
                    selectedCategory === cat
                      ? 'bg-primary text-white shadow-xs'
                      : 'bg-surface-container hover:bg-surface-container-high text-on-surface-variant border border-outline-variant/30'
                  }`}
                >
                  {cat === 'all' ? 'All Donated Gear' : cat}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="p-8 text-center text-on-surface-variant font-medium">
              Loading donated items...
            </div>
          ) : donations.length === 0 ? (
            <div className="bg-surface-container rounded-[24px] p-8 text-center border border-outline-variant/30 text-on-surface-variant font-medium">
              No items currently available in this category. Be the first to donate!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {donations.map((item) => (
                <DonationCard
                  key={item.id}
                  donation={item}
                  onClaim={handleClaim}
                />
              ))}
            </div>
          )}
        </div>

        {/* Responsible Electronics Recycling Section */}
        <div className="bg-surface-container rounded-[24px] p-6 border border-outline-variant/30 flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-amber-600 text-[24px]">
              battery_charging_full
            </span>
            <h3 className="font-heading-lg text-[18px] font-bold text-on-surface">
              Responsible Campus E-Waste Guidelines
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {recyclingRules.map((rule, idx) => (
              <div
                key={idx}
                className="bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/20 flex flex-col gap-1"
              >
                <span className="font-bold text-[14px] text-on-surface">{rule.title}</span>
                <p className="text-[12px] text-on-surface-variant leading-relaxed mt-0.5">
                  {rule.rule}
                </p>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Donate Item Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Donate Hardware to Campus Community"
        subtitle="Help fellow students build their engineering projects"
      >
        <form onSubmit={handleDonateSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-bold uppercase text-on-surface-variant">
              Component / Item Name *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Arduino Uno Clone, Resistor Pack, 12V DC Motors..."
              className="p-3 bg-surface-container-low rounded-xl border border-outline-variant/30 text-body-sm text-on-surface font-semibold"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-bold uppercase text-on-surface-variant">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="p-3 bg-surface-container-low rounded-xl border border-outline-variant/30 text-body-sm text-on-surface"
              >
                <option value="Arduino">Arduino & Microcontrollers</option>
                <option value="Sensors">Sensors & Modules</option>
                <option value="Motors">Motors & Actuators</option>
                <option value="Electronics">Electronics & Passives</option>
                <option value="Tools">Tools & Prototyping</option>
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-bold uppercase text-on-surface-variant">
                Condition
              </label>
              <select
                value={formData.condition}
                onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                className="p-3 bg-surface-container-low rounded-xl border border-outline-variant/30 text-body-sm text-on-surface"
              >
                <option value="Brand New / Unused">Brand New / Unused</option>
                <option value="Good / Fully Functional">Good / Fully Functional</option>
                <option value="Needs Minor Repair">Needs Minor Repair</option>
                <option value="For E-Waste Recycling">For E-Waste Recycling</option>
              </select>
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
                max="100"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                className="p-3 bg-surface-container-low rounded-xl border border-outline-variant/30 text-body-sm text-on-surface"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-bold uppercase text-on-surface-variant">
                Drop-Off / Pickup Location *
              </label>
              <input
                type="text"
                required
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="e.g. Academic Block B Donation Bin 1"
                className="p-3 bg-surface-container-low rounded-xl border border-outline-variant/30 text-body-sm text-on-surface"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold uppercase text-on-surface-variant">
              Component Photo (Optional)
            </label>
            <label className="flex items-center justify-center gap-2 p-3 bg-surface-container-low hover:bg-surface-container border border-dashed border-primary/40 rounded-xl cursor-pointer text-[12px] text-primary font-bold transition-colors">
              <span className="material-symbols-outlined text-[18px]">
                {isUploadingPhoto ? 'hourglass_top' : 'add_a_photo'}
              </span>
              <span>{isUploadingPhoto ? 'Uploading to Supabase...' : formData.image ? '✓ Photo Attached (Click to change)' : 'Upload Hardware Photo'}</span>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handlePhotoUpload}
                disabled={isUploadingPhoto}
                className="hidden"
              />
            </label>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-bold uppercase text-on-surface-variant">
              Description & Notes
            </label>
            <textarea
              rows="2"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="e.g. Tested working pins, extra jumper wires included."
              className="p-3 bg-surface-container-low rounded-xl border border-outline-variant/30 text-body-sm text-on-surface"
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            icon="volunteer_activism"
            className="font-bold"
          >
            Submit Component Donation
          </Button>
        </form>
      </Modal>

      <BottomNav />
    </div>
  );
}
