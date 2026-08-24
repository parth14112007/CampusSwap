import React from 'react';
import { NavLink } from 'react-router-dom';
import { useMarketplace } from '../../context/MarketplaceContext';

export function BottomNav() {
  const { activeRentals, sosRequests } = useMarketplace();
  const openSosCount = sosRequests.filter((s) => s.status === 'Open').length;

  const navItems = [
    {
      to: '/explore',
      label: 'Explore',
      icon: 'storefront',
      activeIcon: 'storefront',
      badge: null
    },
    {
      to: '/active-rental',
      label: 'Rentals',
      icon: 'timer',
      activeIcon: 'timer',
      badge: activeRentals.length > 0 ? activeRentals.length : null,
      badgeColor: 'bg-primary'
    },
    {
      to: '/list-item',
      label: 'List Item',
      icon: 'add_circle',
      activeIcon: 'add_circle',
      isCenterAction: true
    },
    {
      to: '/sos',
      label: 'Campus SOS',
      icon: 'bolt',
      activeIcon: 'bolt',
      badge: openSosCount > 0 ? openSosCount : null,
      badgeColor: 'bg-error animate-pulse'
    },
    {
      to: '/my-rentals',
      label: 'My Swaps',
      icon: 'swap_horizontal_circle',
      activeIcon: 'swap_horizontal_circle',
      badge: null
    }
  ];

  return (
    <nav className="fixed bottom-0 left-0 w-full bg-surface/92 backdrop-blur-xl border-t border-outline-variant/30 px-3 py-2 z-40 shadow-[0_-4px_16px_rgba(0,0,0,0.04)]">
      <div className="max-w-md mx-auto flex items-center justify-around">
        {navItems.map((item) => {
          if (item.isCenterAction) {
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => `
                  relative -top-3 flex flex-col items-center group
                `}
              >
                {({ isActive }) => (
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transition-all transform group-hover:scale-105 active:scale-95 ${
                      isActive
                        ? 'bg-gradient-to-tr from-secondary to-primary text-white shadow-primary/30 ring-4 ring-surface'
                        : 'bg-primary text-white shadow-primary/20 ring-4 ring-surface'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[28px]">add</span>
                  </div>
                )}
              </NavLink>
            );
          }

          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `
                flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all relative ${
                  isActive
                    ? 'text-primary font-bold'
                    : 'text-on-surface-variant hover:text-on-surface font-medium'
                }
              `}
            >
              {({ isActive }) => (
                <>
                  <div className="relative">
                    <span
                      className="material-symbols-outlined text-[24px]"
                      style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
                    >
                      {isActive ? item.activeIcon : item.icon}
                    </span>
                    {item.badge && (
                      <span
                        className={`absolute -top-1 -right-2 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full min-w-[16px] text-center ${
                          item.badgeColor || 'bg-primary'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] tracking-tight mt-0.5">{item.label}</span>
                </>
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
