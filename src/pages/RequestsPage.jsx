import React, { useState, useEffect } from 'react';
import { TopAppBar } from '../components/common/TopAppBar';
import { BottomNav } from '../components/common/BottomNav';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { requestService } from '../services';
import { useAuth } from '../context/AuthContext';

export function RequestsPage() {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Microcontrollers',
    urgency: 'MEDIUM',
    maxBudget: '',
    neededByDate: '',
    campusLocation: 'Block B / Lab Complex'
  });

  useEffect(() => {
    loadRequests();
  }, [selectedCategory]);

  const loadRequests = async () => {
    setLoading(true);
    try {
      const data = await requestService.getRequests({ category: selectedCategory });
      setRequests(data);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRequest = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;
    await requestService.createRequest(formData, user);
    setIsModalOpen(false);
    setFormData({
      title: '',
      description: '',
      category: 'Microcontrollers',
      urgency: 'MEDIUM',
      maxBudget: '',
      neededByDate: '',
      campusLocation: 'Block B / Lab Complex'
    });
    loadRequests();
  };

  const handleOffer = async (id) => {
    await requestService.matchRequest(id);
    loadRequests();
  };

  const categories = ['all', 'Microcontrollers', 'Development Boards', 'Sensors & Modules', 'Tools & Testing'];

  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col antialiased">
      <TopAppBar showBack={true} />

      <main className="flex-1 w-full max-w-5xl mx-auto p-margin-mobile flex flex-col gap-lg pb-32">
        {/* Header Hero Banner */}
        <div className="bg-gradient-to-br from-primary via-primary-container to-secondary rounded-[24px] p-6 text-white shadow-lg relative overflow-hidden flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-widest font-bold bg-white/15 px-3 py-1 rounded-full">
              Student Hardware Requests
            </span>
            <span className="text-[11px] font-bold bg-white/20 px-2.5 py-0.5 rounded-full">
              Phase 1 Foundation
            </span>
          </div>
          <h2 className="text-[24px] sm:text-[28px] font-extrabold tracking-tight leading-tight">
            Can't find a component on the marketplace?
          </h2>
          <p className="text-body-sm text-white/85 max-w-lg">
            Broadcast what board, module, or tool you need to all students and lab peers across campus.
          </p>
          <div className="pt-2">
            <Button
              variant="secondary"
              size="md"
              icon="add"
              onClick={() => setIsModalOpen(true)}
              className="bg-white text-primary hover:bg-white/90 border-0 font-bold"
            >
              Post a Request
            </Button>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full text-label-md font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-primary text-white shadow-xs'
                  : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
              }`}
            >
              {cat === 'all' ? 'All Requests' : cat}
            </button>
          ))}
        </div>

        {/* Requests List */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="font-heading-lg text-[18px] font-bold text-on-surface">
              Active Community Requests ({requests.length})
            </h3>
          </div>

          {loading ? (
            <div className="p-8 text-center text-on-surface-variant font-medium">Loading requests...</div>
          ) : requests.length === 0 ? (
            <div className="bg-surface-container rounded-[24px] p-8 text-center border border-outline-variant/30 text-on-surface-variant">
              No active student requests in this category.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {requests.map((req) => (
                <div
                  key={req.id}
                  className="bg-surface-container-lowest rounded-[20px] p-5 border border-outline-variant/30 shadow-xs flex flex-col justify-between gap-4 hover:border-primary/40 transition-all"
                >
                  <div className="flex flex-col gap-2">
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-primary/10 text-primary">
                        {req.category}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          req.urgency === 'HIGH'
                            ? 'bg-error/15 text-error'
                            : req.urgency === 'MEDIUM'
                            ? 'bg-amber-500/15 text-amber-700'
                            : 'bg-surface-container text-on-surface-variant'
                        }`}
                      >
                        {req.urgency} Urgency
                      </span>
                    </div>

                    <h4 className="font-heading-lg text-[16px] font-bold text-on-surface">
                      {req.title}
                    </h4>
                    <p className="text-body-sm text-on-surface-variant text-[13px] line-clamp-2">
                      {req.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-outline-variant/20 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <img
                        src={req.requester?.avatar}
                        alt={req.requester?.name}
                        className="w-7 h-7 rounded-full object-cover"
                      />
                      <div className="flex flex-col">
                        <span className="text-[12px] font-bold text-on-surface leading-tight">
                          {req.requester?.name}
                        </span>
                        <span className="text-[10px] text-on-surface-variant">
                          {req.requester?.year} • {req.campusLocation}
                        </span>
                      </div>
                    </div>

                    {req.status === 'matched' ? (
                      <span className="text-[12px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                        Offer Sent
                      </span>
                    ) : (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleOffer(req.id)}
                      >
                        I have this
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* New Request Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Post Hardware Request"
        subtitle="Notify fellow engineering students on campus"
      >
        <form onSubmit={handleCreateRequest} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-label-md font-bold uppercase text-on-surface">Item Title</label>
            <input
              type="text"
              required
              placeholder="e.g. STM32 BluePill + ST-Link Programmer"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="p-3 bg-surface-container rounded-xl border border-outline-variant/30 text-body-sm"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-label-md font-bold uppercase text-on-surface">Category</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="p-3 bg-surface-container rounded-xl border border-outline-variant/30 text-body-sm"
            >
              <option value="Microcontrollers">Microcontrollers</option>
              <option value="Development Boards">Development Boards</option>
              <option value="Sensors & Modules">Sensors & Modules</option>
              <option value="Tools & Testing">Tools & Testing</option>
              <option value="Kits & Robotics">Kits & Robotics</option>
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-label-md font-bold uppercase text-on-surface">Details / Project Context</label>
            <textarea
              rows={3}
              placeholder="Explain what lab/course or project you need this for..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="p-3 bg-surface-container rounded-xl border border-outline-variant/30 text-body-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-label-md font-bold uppercase text-on-surface">Urgency</label>
              <select
                value={formData.urgency}
                onChange={(e) => setFormData({ ...formData, urgency: e.target.value })}
                className="p-3 bg-surface-container rounded-xl border border-outline-variant/30 text-body-sm"
              >
                <option value="LOW">Low (Next Week)</option>
                <option value="MEDIUM">Medium (2-3 Days)</option>
                <option value="HIGH">High (Urgent / 24h)</option>
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-label-md font-bold uppercase text-on-surface">Max Budget (₹)</label>
              <input
                type="number"
                placeholder="₹0 for borrow"
                value={formData.maxBudget}
                onChange={(e) => setFormData({ ...formData, maxBudget: e.target.value })}
                className="p-3 bg-surface-container rounded-xl border border-outline-variant/30 text-body-sm"
              />
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button type="button" variant="secondary" fullWidth onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" fullWidth>
              Submit Request
            </Button>
          </div>
        </form>
      </Modal>

      <BottomNav />
    </div>
  );
}
