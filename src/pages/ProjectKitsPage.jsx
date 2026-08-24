import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TopAppBar } from '../components/common/TopAppBar';
import { BottomNav } from '../components/common/BottomNav';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { projectKitService } from '../services/projectKitService';
import { aiAssistantService } from '../services/aiAssistantService';
import { useToast } from '../components/common/Toast';
import { useAuth } from '../context/AuthContext';

export function ProjectKitsPage() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { user } = useAuth();

  const [kits, setKits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [inspectingKit, setInspectingKit] = useState(null);

  useEffect(() => {
    loadKits();
  }, [selectedCategory, selectedDifficulty]);

  const loadKits = async () => {
    setLoading(true);
    try {
      const data = await projectKitService.getProjectKits({
        category: selectedCategory,
        difficulty: selectedDifficulty
      });
      setKits(data);
    } finally {
      setLoading(false);
    }
  };

  const handleInspectKit = async (kit) => {
    const detailed = await projectKitService.getProjectKitById(kit.id);
    setInspectingKit(detailed);
  };

  const handleSaveKit = async (kit) => {
    await projectKitService.saveProjectKit(kit, user?.id || 'user-001');
    addToast(`"${kit.title}" saved to your profile!`, 'success');
  };

  const handleCreateProjectFromKit = async (kit) => {
    await aiAssistantService.saveProject({
      projectName: kit.title,
      projectDescription: kit.description,
      domain: kit.category,
      experienceLevel: kit.targetLevel,
      totalComponents: kit.componentsList?.length || 5,
      availableCount: kit.availableCount || 4,
      readinessPercentage: kit.readinessPercentage || 75,
      totalEstimatedCost: kit.estimatedBudget,
      components: kit.componentsList || []
    }, user?.id || 'user-001');

    addToast(`Project created from "${kit.title}"! Open in My Projects.`, 'success');
    setInspectingKit(null);
    navigate('/profile');
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
              Curated Engineering Kits & BOMs
            </span>
            <span className="text-[11px] font-bold bg-white/15 px-2.5 py-0.5 rounded-full">
              Lab Tested Bundles
            </span>
          </div>

          <div className="flex flex-col gap-1 z-10">
            <h2 className="font-display-lg-mobile text-[24px] sm:text-[28px] font-extrabold tracking-tight">
              Pre-Packaged Hardware Project Kits
            </h2>
            <p className="text-body-sm text-white/85 max-w-xl leading-relaxed">
              Discover verified hardware bundles complete with bills of materials, difficulty ratings, and automated campus inventory stock matching.
            </p>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
            {['all', 'Robotics', 'IoT', 'Embedded Systems', 'AI/ML'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-full text-label-md font-bold transition-all cursor-pointer shrink-0 ${
                  selectedCategory === cat
                    ? 'bg-primary text-white shadow-xs'
                    : 'bg-surface-container hover:bg-surface-container-high text-on-surface-variant border border-outline-variant/30'
                }`}
              >
                {cat === 'all' ? 'All Categories' : cat}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[11px] text-outline uppercase font-bold">Level:</span>
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="px-3 py-1.5 bg-surface-container-low rounded-xl border border-outline-variant/30 text-body-sm font-bold text-on-surface"
            >
              <option value="all">All Levels</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>
        </div>

        {/* Kits Grid */}
        {loading ? (
          <div className="p-8 text-center text-on-surface-variant font-medium">
            Loading project kits...
          </div>
        ) : kits.length === 0 ? (
          <div className="bg-surface-container rounded-[24px] p-8 text-center border border-outline-variant/30 text-on-surface-variant font-medium">
            No project kits match the selected filters.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {kits.map((kit) => (
              <div
                key={kit.id}
                className="bg-surface-container-lowest rounded-[24px] p-5 border border-outline-variant/30 shadow-xs flex flex-col justify-between gap-4 hover:border-primary/40 hover:shadow-md transition-all"
              >
                <div className="flex flex-col gap-3">
                  <div className="h-44 rounded-2xl overflow-hidden relative bg-surface-container">
                    <img
                      src={kit.image}
                      alt={kit.title}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute top-2 left-2 bg-surface/90 backdrop-blur-md text-on-surface text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full shadow-xs">
                      {kit.targetLevel}
                    </span>
                    <span className="absolute top-2 right-2 bg-emerald-950/80 text-emerald-300 text-[10px] font-bold px-2.5 py-1 rounded-full">
                      {kit.duration}
                    </span>
                  </div>

                  <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-primary">
                        {kit.category}
                      </span>
                      <span className="text-amber-600 font-bold text-[12px]">
                        ★ {kit.rating}
                      </span>
                    </div>

                    <h4 className="font-heading-lg text-[16px] font-bold text-on-surface leading-snug">
                      {kit.title}
                    </h4>

                    <p className="text-body-sm text-on-surface-variant text-[12px] line-clamp-2 leading-relaxed">
                      {kit.description}
                    </p>
                  </div>

                  {/* Components Snapshot */}
                  <div className="flex flex-col gap-1.5 pt-2 border-t border-outline-variant/20">
                    <span className="text-[10px] font-bold uppercase text-on-surface-variant">
                      Includes {kit.componentsList?.length || 0} Core Components:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {kit.componentsList?.slice(0, 3).map((c, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] bg-surface-container text-on-surface px-2 py-0.5 rounded-md font-medium"
                        >
                          {c.name}
                        </span>
                      ))}
                      {(kit.componentsList?.length || 0) > 3 && (
                        <span className="text-[10px] bg-surface-container text-primary font-bold px-2 py-0.5 rounded-md">
                          +{kit.componentsList.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-outline-variant/20 flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-outline uppercase font-semibold">Estimated BOM</span>
                    <span className="text-[16px] font-extrabold text-primary">₹{kit.estimatedBudget}</span>
                  </div>

                  <Button
                    variant="primary"
                    size="sm"
                    icon="explore"
                    onClick={() => handleInspectKit(kit)}
                  >
                    Inspect Kit
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Inspect Kit Modal */}
      {inspectingKit && (
        <Modal
          isOpen={true}
          onClose={() => setInspectingKit(null)}
          title={inspectingKit.title}
          subtitle={`${inspectingKit.category} • ${inspectingKit.targetLevel} • Est. Duration: ${inspectingKit.duration}`}
        >
          <div className="flex flex-col gap-5 max-h-[75vh] overflow-y-auto pr-1 no-scrollbar">
            <p className="text-body-sm text-on-surface-variant leading-relaxed">
              {inspectingKit.description}
            </p>

            {/* Campus Readiness Gauge */}
            <div className="bg-surface-container p-4 rounded-2xl border border-outline-variant/30 flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-[10px] text-outline uppercase font-semibold">Campus Stock Readiness</span>
                <span className="font-heading-lg text-[16px] font-bold text-on-surface">
                  {inspectingKit.availableCount} of {inspectingKit.componentsList?.length} Components Ready on Campus
                </span>
              </div>
              <span className="bg-emerald-100 text-emerald-800 text-[12px] font-extrabold px-3 py-1 rounded-full border border-emerald-300">
                {inspectingKit.readinessPercentage}% In Stock
              </span>
            </div>

            {/* Component Requirements List */}
            <div className="flex flex-col gap-2">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-primary">
                Required Bill of Materials (BOM)
              </span>

              <div className="flex flex-col gap-2">
                {inspectingKit.componentsList?.map((comp, idx) => (
                  <div
                    key={idx}
                    className="bg-surface-container-lowest p-3 rounded-xl border border-outline-variant/20 flex items-center justify-between gap-3 text-[12px]"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-2.5 h-2.5 rounded-full ${
                          comp.status === 'AVAILABLE'
                            ? 'bg-emerald-500'
                            : comp.status === 'LIMITED'
                            ? 'bg-amber-500'
                            : 'bg-rose-500'
                        }`}
                      />
                      <div className="flex flex-col">
                        <span className="font-bold text-on-surface">{comp.name}</span>
                        <span className="text-[10px] text-on-surface-variant">{comp.role}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-right">
                      <span className="text-on-surface-variant">{comp.location}</span>
                      <span className="font-bold text-primary">₹{comp.estimatedCost}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-outline-variant/20">
              <Button
                variant="secondary"
                size="md"
                icon="bookmark"
                onClick={() => handleSaveKit(inspectingKit)}
                className="bg-surface-container text-[12px]"
              >
                Save to Profile
              </Button>

              <Button
                variant="primary"
                size="md"
                icon="rocket_launch"
                onClick={() => handleCreateProjectFromKit(inspectingKit)}
                className="font-bold text-[12px]"
              >
                Create My Project
              </Button>
            </div>
          </div>
        </Modal>
      )}

      <BottomNav />
    </div>
  );
}
