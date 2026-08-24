import React, { useState, useEffect } from 'react';
import { TopAppBar } from '../components/common/TopAppBar';
import { BottomNav } from '../components/common/BottomNav';
import { Button } from '../components/common/Button';
import { PartnerCard } from '../components/community/PartnerCard';
import { InvitePartnerModal } from '../components/community/InvitePartnerModal';
import { partnerFinderService } from '../services/partnerFinderService';
import { useToast } from '../components/common/Toast';
import { useAuth } from '../context/AuthContext';

export function PartnerFinderPage() {
  const { addToast } = useToast();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState('browse'); // 'browse' | 'invitations'
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSkill, setSelectedSkill] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [invitingPartner, setInvitingPartner] = useState(null);
  const [invitations, setInvitations] = useState([]);

  useEffect(() => {
    loadPartners();
    Promise.resolve(partnerFinderService.getInvitations(user?.id || 'user-001')).then((invs) => invs && setInvitations(invs));
  }, [selectedSkill, searchQuery, user]);

  const loadPartners = async () => {
    setLoading(true);
    try {
      const data = await partnerFinderService.getPartners({
        skill: selectedSkill,
        search: searchQuery,
        currentUserId: user?.id || 'user-001'
      });
      setPartners(data);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmInvite = async (invitationData) => {
    await partnerFinderService.sendInvitation({
      ...invitationData,
      senderId: user?.id || 'user-001',
      senderName: user?.name || 'Arjun Sharma'
    });
    const updated = await partnerFinderService.getInvitations(user?.id || 'user-001');
    setInvitations(updated);
    addToast(`Project invitation sent to ${invitationData.recipientName}!`, 'success');
  };

  const handleAcceptInvitation = async (id) => {
    await partnerFinderService.acceptInvitation(id, user?.id || 'user-001');
    const updated = await partnerFinderService.getInvitations(user?.id || 'user-001');
    setInvitations(updated);
    addToast('✓ Invitation accepted! Added to Project Team in your profile.', 'success');
  };

  const handleDeclineInvitation = async (id) => {
    await partnerFinderService.declineInvitation(id);
    const updated = await partnerFinderService.getInvitations(user?.id || 'user-001');
    setInvitations(updated);
    addToast('Invitation declined', 'info');
  };

  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col antialiased">
      <TopAppBar showBack={true} />

      <main className="flex-1 w-full max-w-5xl mx-auto p-margin-mobile flex flex-col gap-lg pb-32">
        {/* Header Hero */}
        <div className="bg-gradient-to-br from-primary via-primary-container to-secondary rounded-[24px] p-6 text-white shadow-xl relative overflow-hidden flex flex-col gap-3">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />

          <div className="flex items-center justify-between z-10">
            <span className="text-[11px] uppercase tracking-widest font-extrabold bg-white/20 px-3 py-1 rounded-full text-white">
              Campus Engineering Teammate Finder
            </span>
            <span className="text-[11px] font-bold bg-white/15 px-2.5 py-0.5 rounded-full">
              Verified Profiles
            </span>
          </div>

          <div className="flex flex-col gap-1 z-10">
            <h2 className="font-display-lg-mobile text-[24px] sm:text-[28px] font-extrabold tracking-tight">
              Build Your Engineering Dream Team
            </h2>
            <p className="text-body-sm text-white/85 max-w-xl leading-relaxed">
              Find student collaborators by technical skill overlap, CAD expertise, firmware abilities, and project availability for hackathons and capstones.
            </p>
          </div>
        </div>

        {/* View Tabs */}
        <div className="flex items-center gap-2 bg-surface-container p-1.5 rounded-[18px] border border-outline-variant/30">
          <button
            onClick={() => setActiveTab('browse')}
            className={`flex-1 py-2.5 px-4 rounded-[14px] text-label-md font-bold transition-all cursor-pointer text-center flex items-center justify-center gap-1.5 ${
              activeTab === 'browse'
                ? 'bg-surface-container-lowest text-primary shadow-xs'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">group</span>
            <span>Discover Collaborators ({partners.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('invitations')}
            className={`flex-1 py-2.5 px-4 rounded-[14px] text-label-md font-bold transition-all cursor-pointer text-center flex items-center justify-center gap-1.5 ${
              activeTab === 'invitations'
                ? 'bg-surface-container-lowest text-primary shadow-xs'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">mail</span>
            <span>Project Invitations ({invitations.length})</span>
          </button>
        </div>

        {activeTab === 'browse' && (
          <div className="flex flex-col gap-4">
            {/* Search & Skills Filter */}
            <div className="flex flex-col gap-3">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by student name, department, or skill (e.g. ROS, CAD, ESP32, PyTorch)..."
                className="w-full px-4 py-3.5 bg-surface-container-lowest border border-outline-variant/30 rounded-[20px] text-body-md text-on-surface focus:outline-none focus:border-primary font-semibold shadow-xs"
              />

              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
                {['all', 'CAD', 'ESP32', 'Arduino', 'ROS', 'Python', 'PCB Design', '3D Printing', 'Computer Vision'].map((sk) => (
                  <button
                    key={sk}
                    onClick={() => setSelectedSkill(sk)}
                    className={`px-3 py-1.5 rounded-full text-[12px] font-bold transition-all cursor-pointer shrink-0 ${
                      selectedSkill === sk
                        ? 'bg-primary text-white shadow-xs'
                        : 'bg-surface-container hover:bg-surface-container-high text-on-surface-variant border border-outline-variant/30'
                    }`}
                  >
                    {sk === 'all' ? 'All Skills' : sk}
                  </button>
                ))}
              </div>
            </div>

            {/* Partners Grid */}
            {loading ? (
              <div className="p-8 text-center text-on-surface-variant font-medium">
                Loading collaborators...
              </div>
            ) : partners.length === 0 ? (
              <div className="bg-surface-container rounded-[24px] p-8 text-center border border-outline-variant/30 text-on-surface-variant font-medium">
                No engineering partners found with the selected skills.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {partners.map((partner) => (
                  <PartnerCard
                    key={partner.id}
                    partner={partner}
                    onInvite={(p) => setInvitingPartner(p)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Invitations Tab */}
        {activeTab === 'invitations' && (
          <div className="flex flex-col gap-4">
            <h3 className="font-heading-lg text-[18px] font-bold text-on-surface">
              Project Team Invitations ({invitations.length})
            </h3>

            {invitations.length === 0 ? (
              <div className="bg-surface-container rounded-[24px] p-8 text-center border border-outline-variant/30 text-on-surface-variant font-medium">
                No active project invitations.
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {invitations.map((inv) => (
                  <div
                    key={inv.id}
                    className="bg-surface-container-lowest rounded-[20px] p-5 border border-outline-variant/30 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-start gap-3.5">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-[22px]">mail</span>
                      </div>

                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-extrabold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                            {inv.status}
                          </span>
                          <span className="text-[11px] text-on-surface-variant">
                            {new Date(inv.createdAt).toLocaleDateString()}
                          </span>
                        </div>

                        <h4 className="font-heading-lg text-[16px] font-bold text-on-surface mt-1">
                          {inv.projectTitle}
                        </h4>

                        <span className="text-[12px] text-on-surface-variant">
                          Role: <strong>{inv.role}</strong> • From: {inv.senderName} to {inv.recipientName}
                        </span>

                        {inv.message && (
                          <p className="text-[12px] text-on-surface-variant bg-surface-container-low p-2 rounded-xl mt-1.5 italic">
                            "{inv.message}"
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      {inv.status === 'Pending' ? (
                        <>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleDeclineInvitation(inv.id)}
                            className="text-[12px] bg-surface-container"
                          >
                            Decline
                          </Button>
                          <Button
                            variant="primary"
                            size="sm"
                            icon="check"
                            onClick={() => handleAcceptInvitation(inv.id)}
                            className="text-[12px] font-bold"
                          >
                            Accept & Join Team
                          </Button>
                        </>
                      ) : (
                        <span className="text-emerald-700 font-bold text-[12px] bg-emerald-100 px-3 py-1.5 rounded-xl">
                          ✓ {inv.status}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Invite Modal */}
      <InvitePartnerModal
        partner={invitingPartner}
        isOpen={Boolean(invitingPartner)}
        onClose={() => setInvitingPartner(null)}
        onConfirmInvite={handleConfirmInvite}
      />

      <BottomNav />
    </div>
  );
}
