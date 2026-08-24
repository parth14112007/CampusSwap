import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useMarketplace } from '../../context/MarketplaceContext';
import { useAuth } from '../../context/AuthContext';
import { CampusHubModal } from './CampusHubModal';

export function TopAppBar({ title = 'CampusSwap', showBack = false, onBack }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { notificationCount, setNotificationCount } = useMarketplace();
  const { user: authUser, logout } = useAuth();
  
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showCampusHub, setShowCampusHub] = useState(false);

  const isHome = location.pathname === '/' || location.pathname === '/explore';
  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (window.history.length > 2) {
      navigate(-1);
    } else {
      navigate('/explore');
    }
  };

  const handleLogout = async () => {
    setShowUserMenu(false);
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <>
      <header className="bg-surface/85 backdrop-blur-xl top-0 sticky z-40 border-b border-outline-variant/30 shadow-xs flex justify-between items-center px-margin-mobile h-16 w-full transition-all">
        {/* Left: Back button & Title */}
        <div className="flex items-center gap-2 sm:gap-md">
          {(!isHome || showBack) ? (
            <button
              onClick={handleBack}
              aria-label="Go back"
              className="text-on-surface-variant hover:bg-surface-container-high transition-colors p-2 rounded-full flex items-center justify-center cursor-pointer"
            >
              <span className="material-symbols-outlined text-[24px]">arrow_back</span>
            </button>
          ) : (
            <Link to="/explore" className="flex items-center gap-1.5 group">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-secondary to-secondary-container flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform">
                <span className="material-symbols-outlined text-[20px]">swap_horiz</span>
              </div>
            </Link>
          )}

          <Link to="/explore" className="flex flex-col">
            <h1 className="font-display-lg-mobile text-[24px] sm:text-display-lg-mobile font-extrabold text-secondary tracking-tight">
              CampusSwap
            </h1>
            <span className="text-[10px] uppercase font-bold tracking-widest text-on-surface-variant -mt-1 hidden sm:block">
              Engineering Marketplace
            </span>
          </Link>
        </div>

        {/* Center: Campus selector / indicator */}
        <div className="hidden md:flex items-center gap-1.5 bg-surface-container px-3 py-1 rounded-full border border-outline-variant/30 text-body-sm text-on-surface-variant">
          <span className="material-symbols-outlined text-primary text-[18px]">school</span>
          <span className="font-medium text-[13px]">{authUser?.campus || 'MIT Engineering Tech Campus'}</span>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Campus Hub Launcher Button */}
          <button
            onClick={() => {
              setShowCampusHub(true);
              setShowNotifications(false);
              setShowUserMenu(false);
            }}
            title="Campus Resource Hub"
            aria-label="Open Campus Resource Hub"
            className="text-on-surface hover:bg-surface-container-high text-primary transition-colors p-2 rounded-full flex items-center justify-center cursor-pointer"
          >
            <span className="material-symbols-outlined text-[22px]">grid_view</span>
          </button>

          {/* Urgent SOS Quick Link */}
          <Link
            to="/sos"
            className="flex items-center gap-1 bg-error/10 hover:bg-error/20 text-error px-2.5 py-1 rounded-full text-label-md font-bold transition-all border border-error/20"
          >
            <span className="material-symbols-outlined text-[16px] animate-pulse">bolt</span>
            <span className="hidden xs:inline">SOS</span>
          </Link>

          {/* Notifications button */}
          <div className="relative">
            <button
              onClick={() => {
                setShowNotifications(!showNotifications);
                setShowUserMenu(false);
                if (notificationCount > 0) setNotificationCount(0);
              }}
              aria-label="Notifications"
              className="text-primary font-heading-lg hover:bg-surface-container-high transition-colors p-2 rounded-full flex items-center justify-center relative cursor-pointer"
            >
              <span
                className="material-symbols-outlined text-[24px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                notifications
              </span>
              {notificationCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-error text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {notificationCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-surface-container-lowest/95 backdrop-blur-xl rounded-[20px] shadow-xl border border-outline-variant/30 p-3 z-50 animate-scale-up">
                <div className="flex items-center justify-between pb-2 border-b border-outline-variant/20 px-2">
                  <span className="font-heading-lg text-[16px] font-bold text-on-surface">Notifications</span>
                  <Link
                    to="/notifications"
                    onClick={() => setShowNotifications(false)}
                    className="text-[11px] text-primary font-semibold hover:underline"
                  >
                    View All
                  </Link>
                </div>
                <div className="flex flex-col gap-2 mt-2">
                  <Link
                    to="/active-rental"
                    onClick={() => setShowNotifications(false)}
                    className="p-2.5 rounded-xl hover:bg-surface-container transition-colors flex gap-2.5 items-start"
                  >
                    <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                      <span className="material-symbols-outlined text-[18px]">timer</span>
                    </div>
                    <div className="flex flex-col text-left">
                      <span className="text-[13px] font-bold text-on-surface">Rental Due in 4 Days</span>
                      <span className="text-[11px] text-on-surface-variant">Arduino Uno R3 from Vikram R.</span>
                    </div>
                  </Link>
                  <Link
                    to="/sos"
                    onClick={() => setShowNotifications(false)}
                    className="p-2.5 rounded-xl hover:bg-surface-container transition-colors flex gap-2.5 items-start"
                  >
                    <div className="w-8 h-8 rounded-full bg-error/10 text-error flex items-center justify-center shrink-0 mt-0.5">
                      <span className="material-symbols-outlined text-[18px]">emergency</span>
                    </div>
                    <div className="flex flex-col text-left">
                      <span className="text-[13px] font-bold text-error">New SOS in VLSI Lab</span>
                      <span className="text-[11px] text-on-surface-variant">Devansh needs a 10k Potentiometer</span>
                    </div>
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* User Profile Avatar / Menu Trigger */}
          <div className="relative">
            <button
              onClick={() => {
                setShowUserMenu(!showUserMenu);
                setShowNotifications(false);
              }}
              className="w-9 h-9 rounded-full overflow-hidden border-2 border-secondary/40 hover:border-secondary transition-all hover:scale-105 ml-1 cursor-pointer"
            >
              <img
                src={
                  authUser?.avatar ||
                  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80'
                }
                alt={authUser?.name || 'User'}
                className="w-full h-full object-cover"
              />
            </button>

            {/* User Dropdown Menu */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-64 bg-surface-container-lowest/95 backdrop-blur-xl rounded-[20px] shadow-xl border border-outline-variant/30 p-3 z-50 animate-scale-up flex flex-col gap-2">
                <div className="p-2 border-b border-outline-variant/20 flex flex-col">
                  <span className="text-[14px] font-bold text-on-surface leading-tight">
                    {authUser?.name || 'Student'}
                  </span>
                  <span className="text-[11px] text-on-surface-variant font-medium mt-0.5">
                    {authUser?.email || 'student@mit.edu'}
                  </span>
                  <span className="text-[10px] text-primary font-bold mt-1">
                    {authUser?.studentId ? `ID: ${authUser.studentId}` : 'Verified Student'} • {authUser?.year || '3rd Year'}
                  </span>
                </div>

                <Link
                  to="/profile"
                  onClick={() => setShowUserMenu(false)}
                  className="flex items-center gap-2.5 p-2 rounded-xl text-body-sm font-semibold text-on-surface hover:bg-surface-container transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px] text-primary">person</span>
                  <span>My Profile & Wallet</span>
                </Link>

                <Link
                  to="/my-rentals"
                  onClick={() => setShowUserMenu(false)}
                  className="flex items-center gap-2.5 p-2 rounded-xl text-body-sm font-semibold text-on-surface hover:bg-surface-container transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px] text-secondary">
                    swap_horizontal_circle
                  </span>
                  <span>My Swaps & Listings</span>
                </Link>

                <Link
                  to="/settings"
                  onClick={() => setShowUserMenu(false)}
                  className="flex items-center gap-2.5 p-2 rounded-xl text-body-sm font-semibold text-on-surface hover:bg-surface-container transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px] text-on-surface-variant">
                    settings
                  </span>
                  <span>Settings & Preferences</span>
                </Link>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex items-center gap-2.5 p-2 rounded-xl text-body-sm font-bold text-error hover:bg-error/10 transition-colors w-full text-left cursor-pointer border-t border-outline-variant/20 pt-2"
                >
                  <span className="material-symbols-outlined text-[18px]">logout</span>
                  <span>Log Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Campus Hub Quick Navigation Modal */}
      <CampusHubModal
        isOpen={showCampusHub}
        onClose={() => setShowCampusHub(false)}
      />
    </>
  );
}
