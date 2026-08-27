import React, { useState } from 'react';
import { TopAppBar } from '../components/common/TopAppBar';
import { BottomNav } from '../components/common/BottomNav';
import { Button } from '../components/common/Button';
import { useAuth } from '../context/AuthContext';

export function SettingsPage() {
  const { user } = useAuth();
  const [sosRadius, setSosRadius] = useState('500m');
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [autoEscrowRefund, setAutoEscrowRefund] = useState(true);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col antialiased">
      <TopAppBar showBack={true} />

      <main className="flex-1 w-full max-w-3xl mx-auto p-margin-mobile flex flex-col gap-lg pb-32">
        {/* Header */}
        <div className="flex flex-col gap-1">
          <h2 className="font-heading-xl text-[24px] font-extrabold text-on-surface">
            Settings & Campus Node Preferences
          </h2>
          <span className="text-body-sm text-on-surface-variant">
            Manage your engineering campus node, SOS radar distance, and notification thresholds
          </span>
        </div>

        {savedSuccess && (
          <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center gap-2.5 text-emerald-800 text-[13px] font-semibold">
            <span className="material-symbols-outlined text-emerald-600 text-[20px]">check_circle</span>
            <span>Preferences saved successfully!</span>
          </div>
        )}

        <form onSubmit={handleSave} className="flex flex-col gap-4">
          {/* Active Campus Node */}
          <div className="bg-surface-container rounded-[24px] p-6 border border-outline-variant/30 shadow-xs flex flex-col gap-4">
            <h3 className="font-heading-lg text-[18px] font-bold text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">school</span>
              Campus Node Location
            </h3>

            <div className="flex flex-col gap-2">
              <label className="text-label-md font-bold uppercase text-on-surface-variant">Active Institution</label>
              <input
                type="text"
                disabled
                value={user?.campus || 'K. K. Wagh Institute of Engineering Education & Research • Nashik'}
                className="p-3 bg-surface-container-low rounded-xl border border-outline-variant/20 text-body-sm text-on-surface font-medium cursor-not-allowed"
              />
              <span className="text-[11px] text-on-surface-variant">
                Locked to verified college domain (@mit.edu)
              </span>
            </div>
          </div>

          {/* SOS Urgent Radar Distance */}
          <div className="bg-surface-container rounded-[24px] p-6 border border-outline-variant/30 shadow-xs flex flex-col gap-4">
            <h3 className="font-heading-lg text-[18px] font-bold text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-error">bolt</span>
              Campus Emergency SOS Radar Radius
            </h3>

            <div className="flex flex-col gap-2">
              <label className="text-label-md font-bold uppercase text-on-surface-variant">Broadcast Alert Range</label>
              <select
                value={sosRadius}
                onChange={(e) => setSosRadius(e.target.value)}
                className="p-3 bg-surface-container-lowest rounded-xl border border-outline-variant/30 text-body-sm text-on-surface font-medium"
              >
                <option value="200m">200m (Same Department / Floor)</option>
                <option value="500m">500m (Academic Complex Block)</option>
                <option value="1km">1km (Full Campus & Hostels)</option>
              </select>
              <span className="text-[11px] text-on-surface-variant">
                You will receive high-priority alerts when lab peers within this range need urgent passives or tools.
              </span>
            </div>
          </div>

          {/* Escrow & Security Preferences */}
          <div className="bg-surface-container rounded-[24px] p-6 border border-outline-variant/30 shadow-xs flex flex-col gap-4">
            <h3 className="font-heading-lg text-[18px] font-bold text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary">verified_user</span>
              Trust, Verification & Escrow
            </h3>

            <div className="flex flex-col gap-3">
              <label className="flex items-center justify-between p-3 bg-surface-container-lowest rounded-xl border border-outline-variant/20 cursor-pointer">
                <div className="flex flex-col">
                  <span className="text-[14px] font-bold text-on-surface">Auto-Release Escrow Deposit</span>
                  <span className="text-[11px] text-on-surface-variant">
                    Automatically release deposit to lender wallet upon bilateral QR return scan
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={autoEscrowRefund}
                  onChange={(e) => setAutoEscrowRefund(e.target.checked)}
                  className="w-5 h-5 accent-primary rounded cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-3 bg-surface-container-lowest rounded-xl border border-outline-variant/20 cursor-pointer">
                <div className="flex flex-col">
                  <span className="text-[14px] font-bold text-on-surface">Email Digest & Lab Availability</span>
                  <span className="text-[11px] text-on-surface-variant">
                    Receive email when watched lab equipment (DSO/3D Printers) becomes free
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={emailAlerts}
                  onChange={(e) => setEmailAlerts(e.target.checked)}
                  className="w-5 h-5 accent-primary rounded cursor-pointer"
                />
              </label>
            </div>
          </div>

          <div className="pt-2">
            <Button type="submit" variant="primary" size="lg" icon="save">
              Save Preferences
            </Button>
          </div>
        </form>
      </main>

      <BottomNav />
    </div>
  );
}
