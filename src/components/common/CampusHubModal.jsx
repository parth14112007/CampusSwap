import React from 'react';
import { Link } from 'react-router-dom';
import { Modal } from './Modal';

export function CampusHubModal({ isOpen, onClose }) {
  const sections = [
    {
      category: "Marketplace & Swaps",
      items: [
        { to: "/explore", label: "Explore Market", icon: "storefront", desc: "Buy, rent, borrow lab gear", color: "text-primary" },
        { to: "/requests", label: "Student Requests", icon: "assignment", desc: "Broadcast hardware needs", color: "text-primary" },
        { to: "/rentals", label: "Rentals & Escrow", icon: "timer", desc: "Active timelines & QR", color: "text-primary" },
        { to: "/list-item", label: "List Hardware", icon: "add_circle", desc: "Monetize or share tools", color: "text-primary" }
      ]
    },
    {
      category: "Lab Network & AI Tools",
      items: [
        { to: "/inventory", label: "Campus Lab Inventory", icon: "science", desc: "DSO, 3D printers, reflow", color: "text-secondary" },
        { to: "/ai-match", label: "AI Smart Match", icon: "auto_awesome", desc: "Match BOM with campus gear", color: "text-secondary" },
        { to: "/ai-assistant", label: "AI Project Advisor", icon: "psychology", desc: "Architecture & pinout check", color: "text-secondary" },
        { to: "/project-kits", label: "Project Kits & BOMs", icon: "inventory_2", desc: "Verified lab hardware packs", color: "text-secondary" }
      ]
    },
    {
      category: "Community & Impact",
      items: [
        { to: "/sos", label: "Campus SOS Radar", icon: "bolt", desc: "Urgent 20-min hardware alerts", color: "text-error" },
        { to: "/partner-finder", label: "Partner Finder", icon: "group_add", desc: "Hackathons & capstones", color: "text-emerald-700" },
        { to: "/knowledge-hub", label: "Knowledge Hub", icon: "menu_book", desc: "Pinouts, datasheets, guides", color: "text-emerald-700" },
        { to: "/donate", label: "Donate & Circular", icon: "eco", desc: "Zero e-waste & reuse metrics", color: "text-emerald-700" }
      ]
    },
    {
      category: "Account & Preferences",
      items: [
        { to: "/profile", label: "Profile & Wallet", icon: "account_circle", desc: "Trust score & escrow balance", color: "text-on-surface" },
        { to: "/notifications", label: "All Notifications", icon: "notifications", desc: "Alerts & availability", color: "text-on-surface" },
        { to: "/settings", label: "Node Settings", icon: "settings", desc: "Campus & SOS radar radius", color: "text-on-surface" }
      ]
    }
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Campus Resource Hub"
      subtitle="Complete Engineering Resource Ecosystem"
    >
      <div className="flex flex-col gap-5 max-h-[70vh] overflow-y-auto pr-1">
        {sections.map((sec, idx) => (
          <div key={idx} className="flex flex-col gap-2.5">
            <span className="text-[11px] uppercase tracking-wider font-extrabold text-on-surface-variant px-1">
              {sec.category}
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {sec.items.map((item, iIdx) => (
                <Link
                  key={iIdx}
                  to={item.to}
                  onClick={onClose}
                  className="p-3 bg-surface-container rounded-[16px] hover:bg-surface-container-high border border-outline-variant/20 transition-all flex items-start gap-3 group"
                >
                  <div className={`w-9 h-9 rounded-xl bg-surface-container-lowest flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform ${item.color}`}>
                    <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[13px] font-bold text-on-surface group-hover:text-primary transition-colors">
                      {item.label}
                    </span>
                    <span className="text-[11px] text-on-surface-variant line-clamp-1">
                      {item.desc}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Modal>
  );
}
