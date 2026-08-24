import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { TopAppBar } from '../components/common/TopAppBar';
import { BottomNav } from '../components/common/BottomNav';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { ListingCard } from '../components/marketplace/ListingCard';
import { KnowledgeCard } from '../components/knowledge/KnowledgeCard';
import { DonationCard } from '../components/community/DonationCard';
import { ReputationCard } from '../components/trust/ReputationCard';
import { TransactionCard } from '../components/trust/TransactionCard';
import { RatingDialog } from '../components/trust/RatingDialog';
import { ImpactMetricsGrid } from '../components/community/ImpactMetricsGrid';
import { useMarketplace } from '../context/MarketplaceContext';
import { useAuth } from '../context/AuthContext';
import { aiAssistantService } from '../services/aiAssistantService';
import { transactionService } from '../services/transactionService';
import { reputationService } from '../services/reputationService';
import { projectKitService } from '../services/projectKitService';
import { knowledgeHubService } from '../services/knowledgeHubService';
import { partnerFinderService } from '../services/partnerFinderService';
import { donationService } from '../services/donationService';
import { profileService } from '../services/profileService';
import { storageService } from '../services/storageService';
import { useToast } from '../components/common/Toast';

export function ProfilePage() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const {
    myListings,
    favoriteItems,
    editItem,
    deleteItem,
    toggleItemAvailability,
    user: marketplaceUser
  } = useMarketplace();
  const { user: authUser, logout } = useAuth();

  const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'listings' | 'projects' | 'knowledge' | 'donations' | 'transactions'
  const [savedProjects, setSavedProjects] = useState(() => aiAssistantService.getSavedProjects());
  const [savedKits, setSavedKits] = useState(() => projectKitService.getSavedKits());
  const [bookmarkedResources, setBookmarkedResources] = useState([]);
  const [teamMembers, setTeamMembers] = useState(() => partnerFinderService.getTeamMembers());
  const [donations, setDonations] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [reputation, setReputation] = useState(null);
  const [ratingTx, setRatingTx] = useState(null);

  // Modals state
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deletingItemId, setDeletingItemId] = useState(null);
  const [customAvatar, setCustomAvatar] = useState(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingAvatar(true);
    try {
      const ext = file.name.split('.').pop() || 'jpg';
      const userId = authUser?.id || 'user-001';
      const path = `${userId}/avatar-${Date.now()}.${ext}`;
      const result = await storageService.uploadFile('avatars', path, file);
      setCustomAvatar(result.publicUrl);
      await profileService.updateProfile(userId, { avatar: result.publicUrl, avatar_url: result.publicUrl });
      addToast('Profile avatar updated successfully!', 'success');
    } catch (err) {
      addToast(err.message || 'Avatar upload failed', 'error');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  useEffect(() => {
    const userId = authUser?.id || 'user-001';
    transactionService.getTransactions({ userId }).then(setTransactions);
    reputationService.getReputation(userId).then(setReputation);
    donationService.getDonations().then(setDonations);
    
    // Load projects and kits from Supabase
    Promise.resolve(aiAssistantService.getSavedProjects(userId)).then((p) => p && setSavedProjects(p));
    Promise.resolve(projectKitService.getSavedKits(userId)).then((k) => k && setSavedKits(k));

    // Load bookmarked knowledge
    const bookmarkIds = knowledgeHubService.getBookmarks();
    knowledgeHubService.getResources().then((all) => {
      setBookmarkedResources(all.filter((r) => bookmarkIds.includes(r.id)));
    });
  }, [authUser]);

  const handleOpenRating = (tx) => {
    setRatingTx(tx);
  };

  const handleSubmitRating = async (ratingData) => {
    const userId = authUser?.id || 'user-001';
    const targetRevieweeId = ratingTx?.buyerId === userId ? ratingTx?.sellerId : ratingTx?.buyerId;

    const updatedReputation = await reputationService.submitRating({
      transactionId: ratingTx?.id,
      reviewerId: userId,
      revieweeId: targetRevieweeId || 'user-002',
      ...ratingData
    });
    setReputation(updatedReputation);
    const updatedTx = await transactionService.getTransactions({ userId });
    setTransactions(updatedTx);
    setRatingTx(null);
    addToast('★ Review submitted! Campus trust score updated.', 'success');
  };

  const handleDeleteProject = (id) => {
    aiAssistantService.deleteProject(id);
    setSavedProjects((prev) => prev.filter((p) => p.id !== id));
    addToast('Project removed from saved list', 'info');
  };

  const handleRemoveTeamMember = (memberId) => {
    setTeamMembers((prev) => prev.filter((m) => m.id !== memberId));
    addToast('Team member removed from project', 'info');
  };

  const currentUser = {
    ...marketplaceUser,
    ...authUser,
    name: authUser?.name || marketplaceUser.name,
    id: authUser?.studentId || marketplaceUser.id,
    dept: authUser?.dept || marketplaceUser.dept,
    year: authUser?.year || marketplaceUser.year,
    email: authUser?.email || 'arjun.sharma@mit.edu',
    campus: authUser?.campus || marketplaceUser.campus
  };

  const handleConfirmLogout = async () => {
    setIsLogoutModalOpen(false);
    await logout();
    navigate('/login', { replace: true });
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingItem) return;
    await editItem(editingItem.id, editingItem);
    setEditingItem(null);
  };

  const handleConfirmDelete = async () => {
    if (!deletingItemId) return;
    await deleteItem(deletingItemId);
    setDeletingItemId(null);
  };

  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col antialiased">
      <TopAppBar showBack={true} />

      <main className="flex-1 w-full max-w-5xl mx-auto p-margin-mobile flex flex-col gap-lg pb-36">
        {/* Profile Card Header */}
        <div className="bg-gradient-to-tr from-secondary via-secondary-container to-primary text-white rounded-[24px] p-6 shadow-xl relative overflow-hidden flex flex-col gap-4">
          <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />

          <div className="flex items-start justify-between z-10">
            <div className="flex items-center gap-4">
              <div className="relative group w-16 h-16 rounded-2xl overflow-hidden border-2 border-white/40 shadow-md">
                <img
                  src={
                    customAvatar ||
                    currentUser.avatar ||
                    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80'
                  }
                  alt={currentUser.name}
                  className="w-full h-full object-cover"
                />
                <label className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity">
                  <span className="material-symbols-outlined text-white text-[20px]">
                    {isUploadingAvatar ? 'hourglass_top' : 'photo_camera'}
                  </span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleAvatarUpload}
                    disabled={isUploadingAvatar}
                    className="hidden"
                  />
                </label>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <h2 className="font-heading-xl text-[22px] font-extrabold">{currentUser.name}</h2>
                  <span
                    className="material-symbols-outlined text-white text-[20px]"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    verified
                  </span>
                </div>
                <span className="text-body-sm text-white/90 font-medium">
                  {currentUser.year} • {currentUser.dept}
                </span>
                <span className="text-[11px] text-white/75 font-mono">
                  ID: {currentUser.id} • {currentUser.email}
                </span>
              </div>
            </div>

            <button
              onClick={() => setIsLogoutModalOpen(true)}
              className="bg-white/20 hover:bg-white/30 backdrop-blur-md px-3 py-1.5 rounded-full text-label-md font-bold transition-all cursor-pointer flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[16px]">logout</span>
              <span>Logout</span>
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-3 border-t border-white/20 z-10">
            <div className="flex flex-col">
              <span className="text-[18px] font-extrabold">{reputation?.overallRating || 4.9} ★</span>
              <span className="text-[10px] text-white/80 uppercase font-semibold">Trust Score</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[18px] font-extrabold">{transactions.length || 24}</span>
              <span className="text-[10px] text-white/80 uppercase font-semibold">Swaps Done</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[18px] font-extrabold">{savedProjects.length || 2}</span>
              <span className="text-[10px] text-white/80 uppercase font-semibold">Active Projects</span>
            </div>
          </div>
        </div>

        {/* Profile Navigation Tabs (6 Consolidated Categories) */}
        <div className="flex items-center gap-2 bg-surface-container p-1.5 rounded-[18px] border border-outline-variant/30 overflow-x-auto no-scrollbar">
          {[
            { id: 'profile', label: 'Trust & Impact', icon: 'stars' },
            { id: 'listings', label: `Listings (${myListings.length})`, icon: 'storefront' },
            { id: 'projects', label: `Projects & Team (${savedProjects.length})`, icon: 'smart_toy' },
            { id: 'knowledge', label: `Saved Kits (${savedKits.length + bookmarkedResources.length})`, icon: 'bookmark' },
            { id: 'donations', label: `Donations (${donations.length})`, icon: 'volunteer_activism' },
            { id: 'transactions', label: `History (${transactions.length})`, icon: 'receipt_long' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 min-w-[130px] py-2.5 px-3 rounded-[14px] text-label-md font-bold transition-all cursor-pointer text-center flex items-center justify-center gap-1.5 shrink-0 ${
                activeTab === tab.id
                  ? 'bg-surface-container-lowest text-primary shadow-xs'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-[17px]">{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* TAB 1: Profile & Trust & Impact */}
        {activeTab === 'profile' && (
          <div className="flex flex-col gap-lg">
            {/* Dynamic Reputation Dashboard */}
            {reputation && <ReputationCard reputation={reputation} />}

            {/* Campus Sustainability Impact Dashboard */}
            <ImpactMetricsGrid />

            {/* Campus Node Settings */}
            <div className="bg-surface-container rounded-[24px] p-6 border border-outline-variant/30 shadow-xs flex flex-col gap-4">
              <h3 className="font-heading-lg text-[18px] font-bold text-on-surface">
                Campus Node & Lab Settings
              </h3>
              <div className="flex flex-col gap-3 text-body-sm text-on-surface-variant">
                <div className="flex items-center justify-between p-3 bg-surface-container-lowest rounded-xl border border-outline-variant/20">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">location_city</span>
                    <span>Active Campus: <strong>{currentUser.campus}</strong></span>
                  </div>
                  <Link to="/settings" className="text-primary font-bold text-[12px]">Change</Link>
                </div>
                <div className="flex items-center justify-between p-3 bg-surface-container-lowest rounded-xl border border-outline-variant/20">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">hub</span>
                    <span>Assigned Lab: <strong>Academic Block B • Electronics Lab 2</strong></span>
                  </div>
                  <Link to="/inventory" className="text-primary font-bold text-[12px]">View Node</Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: My Listings & Saved Favorites */}
        {activeTab === 'listings' && (
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <h3 className="font-heading-lg text-[18px] font-bold text-on-surface">
                My Active Marketplace Listings ({myListings.length})
              </h3>
              <Link to="/list-item">
                <Button variant="primary" size="sm" icon="add">
                  Add New Listing
                </Button>
              </Link>
            </div>

            {myListings.length === 0 ? (
              <div className="bg-surface-container rounded-[24px] p-8 text-center border border-outline-variant/30 text-on-surface-variant font-medium">
                No active listings yet.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {myListings.map((item) => (
                  <div
                    key={item.id}
                    className="bg-surface-container-lowest rounded-[20px] p-4 border border-outline-variant/30 shadow-xs flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <img src={item.image} alt={item.title} className="w-14 h-14 rounded-xl object-cover" />
                      <div className="flex flex-col">
                        <span className="font-bold text-[14px] text-on-surface line-clamp-1">{item.title}</span>
                        <span className="text-[12px] text-primary font-bold">₹{item.price}{item.priceUnit}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setEditingItem(item)}
                        className="p-2 rounded-xl bg-surface-container text-on-surface hover:bg-surface-container-high"
                      >
                        <span className="material-symbols-outlined text-[18px]">edit</span>
                      </button>
                      <button
                        onClick={() => setDeletingItemId(item.id)}
                        className="p-2 rounded-xl bg-error/10 text-error hover:bg-error/20"
                      >
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Saved Favorites Section */}
            <div className="flex flex-col gap-3 pt-4 border-t border-outline-variant/20">
              <h3 className="font-heading-lg text-[18px] font-bold text-on-surface">
                Saved Favorites ({favoriteItems.length})
              </h3>
              {favoriteItems.length === 0 ? (
                <span className="text-[12px] text-on-surface-variant">No saved components.</span>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {favoriteItems.map((item) => (
                    <ListingCard key={item.id} item={item} />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: My AI Projects & Team */}
        {activeTab === 'projects' && (
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <h3 className="font-heading-lg text-[18px] font-bold text-on-surface">
                Engineering Projects ({savedProjects.length})
              </h3>
              <Link to="/ai-assistant">
                <Button variant="primary" size="sm" icon="add">
                  Plan New Project
                </Button>
              </Link>
            </div>

            <div className="flex flex-col gap-3">
              {savedProjects.map((proj) => (
                <div
                  key={proj.id}
                  className="bg-surface-container-lowest rounded-[20px] p-5 border border-outline-variant/30 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3.5 flex-1">
                    <div className="w-12 h-12 rounded-2xl bg-secondary/15 text-secondary flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-[26px]">psychology</span>
                    </div>

                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                          {proj.domain || 'Robotics'}
                        </span>
                        <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                          {proj.readinessPercentage || 71}% Ready
                        </span>
                      </div>

                      <h4 className="font-heading-lg text-[16px] font-bold text-on-surface mt-1">
                        {proj.name}
                      </h4>

                      <span className="text-[12px] text-on-surface-variant">
                        {proj.componentCount || 7} Components • Est. ₹{proj.estimatedCost || 800} • Saved {proj.savedDate}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <Link to="/ai-assistant">
                      <Button variant="secondary" size="sm" icon="open_in_new" className="text-[12px] bg-surface-container">
                        Open in Assistant
                      </Button>
                    </Link>

                    <button
                      onClick={() => handleDeleteProject(proj.id)}
                      className="p-2 rounded-xl bg-error/10 hover:bg-error/20 text-error transition-colors cursor-pointer"
                      title="Delete project"
                    >
                      <span className="material-symbols-outlined text-[18px]">delete</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Project Team Members */}
            <div className="flex flex-col gap-3 pt-4 border-t border-outline-variant/20">
              <div className="flex items-center justify-between">
                <h3 className="font-heading-lg text-[18px] font-bold text-on-surface flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">groups</span>
                  Active Project Team ({teamMembers.length} Members)
                </h3>
                <Link to="/partner-finder">
                  <Button variant="secondary" size="sm" icon="person_add" className="text-[12px] bg-surface-container">
                    Find Teammates
                  </Button>
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {teamMembers.map((member) => (
                  <div
                    key={member.id}
                    className="bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/20 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-[14px]">
                        {member.name.charAt(0)}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-[14px] text-on-surface">{member.name}</span>
                        <span className="text-[11px] text-primary font-semibold">{member.role}</span>
                        <span className="text-[10px] text-on-surface-variant">{member.dept}</span>
                      </div>
                    </div>

                    {!member.isOwner && (
                      <button
                        onClick={() => handleRemoveTeamMember(member.id)}
                        className="text-error hover:bg-error/10 p-1.5 rounded-lg text-[11px] font-bold cursor-pointer"
                        title="Remove member"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: Saved Knowledge & Kits */}
        {activeTab === 'knowledge' && (
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <h3 className="font-heading-lg text-[18px] font-bold text-on-surface">
                Saved Engineering Project Kits ({savedKits.length})
              </h3>
              <Link to="/project-kits">
                <Button variant="primary" size="sm" icon="explore">
                  Explore Kits
                </Button>
              </Link>
            </div>

            {savedKits.length === 0 ? (
              <div className="bg-surface-container rounded-[24px] p-6 text-center border border-outline-variant/30 text-on-surface-variant font-medium text-[13px]">
                No saved project kits yet.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {savedKits.map((kit) => (
                  <div
                    key={kit.id}
                    className="bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/20 flex items-center justify-between gap-3"
                  >
                    <div className="flex flex-col">
                      <span className="font-bold text-[14px] text-on-surface">{kit.title}</span>
                      <span className="text-[11px] text-primary">{kit.category} • ₹{kit.estimatedBudget}</span>
                    </div>
                    <Link to="/project-kits">
                      <Button variant="secondary" size="sm" className="text-[11px] bg-surface-container">
                        Open Kit
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            )}

            {/* Bookmarked Technical Guides */}
            <div className="flex flex-col gap-3 pt-4 border-t border-outline-variant/20">
              <div className="flex items-center justify-between">
                <h3 className="font-heading-lg text-[18px] font-bold text-on-surface">
                  Bookmarked Pinouts & Guides ({bookmarkedResources.length})
                </h3>
                <Link to="/knowledge-hub">
                  <Button variant="secondary" size="sm" icon="menu_book" className="text-[12px] bg-surface-container">
                    Knowledge Hub
                  </Button>
                </Link>
              </div>

              {bookmarkedResources.length === 0 ? (
                <span className="text-[12px] text-on-surface-variant">No bookmarked technical references.</span>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {bookmarkedResources.map((res) => (
                    <KnowledgeCard key={res.id} resource={res} isBookmarked={true} />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 5: My Donations & Reuse */}
        {activeTab === 'donations' && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="font-heading-lg text-[18px] font-bold text-on-surface">
                Campus Donations & Circular Hardware ({donations.length})
              </h3>
              <Link to="/donate">
                <Button variant="primary" size="sm" icon="add">
                  Donate Gear
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {donations.map((item) => (
                <DonationCard key={item.id} donation={item} />
              ))}
            </div>
          </div>
        )}

        {/* TAB 6: Transactions History */}
        {activeTab === 'transactions' && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="font-heading-lg text-[18px] font-bold text-on-surface">
                Hardware Exchange & Transaction History ({transactions.length})
              </h3>
              <span className="text-[11px] text-outline">
                All rentals, borrows, and emergency SOS records
              </span>
            </div>

            {transactions.length === 0 ? (
              <div className="bg-surface-container rounded-[24px] p-8 text-center border border-outline-variant/30 flex flex-col items-center gap-2">
                <span className="material-symbols-outlined text-[40px] text-primary">receipt_long</span>
                <span className="text-on-surface-variant font-medium">No past transactions found.</span>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {transactions.map((tx) => (
                  <TransactionCard
                    key={tx.id}
                    transaction={tx}
                    onRate={handleOpenRating}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Post-Transaction Rating Dialog */}
      {ratingTx && (
        <RatingDialog
          isOpen={true}
          onClose={() => setRatingTx(null)}
          transactionTitle={ratingTx.title}
          otherPartyName={ratingTx.otherPartyName}
          onSubmitRating={handleSubmitRating}
        />
      )}

      {/* Edit Listing Modal */}
      {editingItem && (
        <Modal
          isOpen={true}
          onClose={() => setEditingItem(null)}
          title="Edit Listing Details"
          subtitle={editingItem.title}
        >
          <form onSubmit={handleSaveEdit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-label-md font-bold uppercase text-on-surface">Title</label>
              <input
                type="text"
                value={editingItem.title}
                onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                className="p-3 bg-surface-container rounded-xl text-body-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-label-md font-bold uppercase text-on-surface">Price (₹)</label>
                <input
                  type="number"
                  value={editingItem.price}
                  onChange={(e) => setEditingItem({ ...editingItem, price: Number(e.target.value) })}
                  className="p-3 bg-surface-container rounded-xl text-body-sm"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-label-md font-bold uppercase text-on-surface">Location</label>
                <input
                  type="text"
                  value={editingItem.location}
                  onChange={(e) => setEditingItem({ ...editingItem, location: e.target.value })}
                  className="p-3 bg-surface-container rounded-xl text-body-sm"
                />
              </div>
            </div>

            <Button type="submit" variant="primary" size="lg" fullWidth>
              Save Changes
            </Button>
          </form>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {deletingItemId && (
        <Modal
          isOpen={true}
          onClose={() => setDeletingItemId(null)}
          title="Delete Listing?"
          subtitle="This item will be permanently removed."
        >
          <div className="flex flex-col gap-4">
            <p className="text-body-sm text-on-surface-variant">
              Are you sure you want to remove this listing?
            </p>
            <div className="flex items-center justify-end gap-2">
              <Button variant="secondary" size="md" onClick={() => setDeletingItemId(null)}>
                Cancel
              </Button>
              <Button variant="danger" size="md" onClick={handleConfirmDelete}>
                Delete
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Logout Modal */}
      {isLogoutModalOpen && (
        <Modal
          isOpen={true}
          onClose={() => setIsLogoutModalOpen(false)}
          title="Sign Out"
          subtitle="Are you sure you want to end your current session?"
        >
          <div className="flex flex-col gap-4">
            <p className="text-body-sm text-on-surface-variant">
              You will need to sign in again to access your rentals, listings, and campus network.
            </p>
            <div className="flex items-center justify-end gap-2">
              <Button variant="secondary" size="md" onClick={() => setIsLogoutModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="md" onClick={handleConfirmLogout}>
                Sign Out
              </Button>
            </div>
          </div>
        </Modal>
      )}

      <BottomNav />
    </div>
  );
}
