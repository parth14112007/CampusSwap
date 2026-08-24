import React, { useState, useEffect } from 'react';
import { TopAppBar } from '../components/common/TopAppBar';
import { BottomNav } from '../components/common/BottomNav';
import { KnowledgeCard } from '../components/knowledge/KnowledgeCard';
import { KnowledgeDetailsModal } from '../components/knowledge/KnowledgeDetailsModal';
import { knowledgeHubService, KNOWLEDGE_CATEGORIES } from '../services/knowledgeHubService';
import { useToast } from '../components/common/Toast';
import { useAuth } from '../context/AuthContext';

export function KnowledgeHubPage() {
  const { addToast } = useToast();
  const { user } = useAuth();

  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedType, setSelectedType] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [bookmarks, setBookmarks] = useState([]);
  const [activeResource, setActiveResource] = useState(null);

  useEffect(() => {
    loadResources();
    Promise.resolve(knowledgeHubService.getBookmarks(user?.id || 'user-001')).then(setBookmarks);
  }, [selectedCategory, selectedType, searchQuery, user]);

  const loadResources = async () => {
    setLoading(true);
    try {
      const data = await knowledgeHubService.getResources({
        category: selectedCategory,
        type: selectedType,
        search: searchQuery
      });
      setResources(data);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleBookmark = async (id) => {
    const updated = await knowledgeHubService.toggleBookmark(id, user?.id || 'user-001');
    setBookmarks(updated);
    if (updated.includes(id)) {
      addToast('✓ Saved to your engineering bookmarks', 'success');
    } else {
      addToast('Bookmark removed', 'info');
    }
  };

  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col antialiased">
      <TopAppBar showBack={true} />

      <main className="flex-1 w-full max-w-5xl mx-auto p-margin-mobile flex flex-col gap-lg pb-32">
        {/* Hero Header */}
        <div className="bg-gradient-to-br from-secondary via-secondary-container to-primary rounded-[24px] p-6 text-white shadow-xl relative overflow-hidden flex flex-col gap-3">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />

          <div className="flex items-center justify-between z-10">
            <span className="text-[11px] uppercase tracking-widest font-extrabold bg-white/20 px-3 py-1 rounded-full text-white">
              Engineering Reference & Pinout Hub
            </span>
            <span className="text-[11px] font-bold bg-white/15 px-2.5 py-0.5 rounded-full">
              Lab Certified Specs
            </span>
          </div>

          <div className="flex flex-col gap-1 z-10">
            <h2 className="font-display-lg-mobile text-[24px] sm:text-[28px] font-extrabold tracking-tight">
              Hardware Knowledge & Pinout Library
            </h2>
            <p className="text-body-sm text-white/85 max-w-xl leading-relaxed">
              Quickly look up GPIO pinout schematics, component operating specs, motor driver wiring notes, and 3D printing tolerances tested in campus labs.
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-[22px]">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search pinouts, IC datasheets, wiring guides (e.g. ESP32, L298N, NEMA 17)..."
            className="w-full pl-12 pr-4 py-3.5 bg-surface-container-lowest border border-outline-variant/30 rounded-[20px] text-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-semibold shadow-xs"
          />
        </div>

        {/* 11 Category Selector Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
          {KNOWLEDGE_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-full text-label-md font-bold transition-all cursor-pointer shrink-0 ${
                selectedCategory === cat
                  ? 'bg-primary text-white shadow-xs'
                  : 'bg-surface-container hover:bg-surface-container-high text-on-surface-variant border border-outline-variant/30'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Resource Type Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          {['All', 'PINOUT', 'DATASHEET', 'GUIDE', 'TUTORIAL', 'TROUBLESHOOTING'].map((type) => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`px-3 py-1 rounded-xl text-[11px] font-extrabold uppercase tracking-wider transition-all cursor-pointer shrink-0 border ${
                selectedType === type
                  ? 'bg-surface-container-high text-primary border-primary'
                  : 'bg-surface-container-low text-on-surface-variant border-outline-variant/20'
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        {/* Resources Grid */}
        {loading ? (
          <div className="p-8 text-center text-on-surface-variant font-medium">
            Loading knowledge resources...
          </div>
        ) : resources.length === 0 ? (
          <div className="bg-surface-container rounded-[24px] p-8 text-center border border-outline-variant/30 text-on-surface-variant font-medium">
            No knowledge resources found matching your query.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {resources.map((res) => (
              <KnowledgeCard
                key={res.id}
                resource={res}
                onOpen={(r) => setActiveResource(r)}
                isBookmarked={bookmarks.includes(res.id)}
                onToggleBookmark={handleToggleBookmark}
              />
            ))}
          </div>
        )}
      </main>

      {/* Resource Detail & Pinout Modal */}
      <KnowledgeDetailsModal
        resource={activeResource}
        isOpen={Boolean(activeResource)}
        onClose={() => setActiveResource(null)}
      />

      <BottomNav />
    </div>
  );
}
