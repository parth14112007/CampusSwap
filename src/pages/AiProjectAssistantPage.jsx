import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TopAppBar } from '../components/common/TopAppBar';
import { BottomNav } from '../components/common/BottomNav';
import { Button } from '../components/common/Button';
import { AIProcessingState } from '../components/ai/AIProcessingState';
import { ProjectReadiness } from '../components/ai/ProjectReadiness';
import { ComponentRequirementRow } from '../components/ai/ComponentRequirementRow';
import { ProjectKitCard } from '../components/ai/ProjectKitCard';
import { aiAssistantService, PROJECT_PRESETS } from '../services/aiAssistantService';
import { useToast } from '../components/common/Toast';
import { useAuth } from '../context/AuthContext';

export function AiProjectAssistantPage() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    projectName: 'Obstacle Avoiding Autonomous Robot',
    projectDescription: '4-wheeled autonomous rover that navigates indoor rooms using ultrasonic pulse echo distance measurement and differential dual-motor steering.',
    domain: 'Robotics',
    experienceLevel: 'Beginner',
    budget: 800,
    deadline: '2 Weeks'
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [hasAnalyzed, setHasAnalyzed] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [generatedKit, setGeneratedKit] = useState(null);
  const [isProjectSaved, setIsProjectSaved] = useState(false);
  const [notifiedComponents, setNotifiedComponents] = useState([]);

  const handleSelectPreset = (preset) => {
    setFormData({
      projectName: preset.name,
      projectDescription: preset.description,
      domain: preset.domain,
      experienceLevel: preset.experienceLevel,
      budget: preset.budget,
      deadline: preset.deadline
    });
    addToast(`Loaded "${preset.name}" template`, 'info');
  };

  const handleAnalyze = async (e) => {
    if (e) e.preventDefault();
    if (!formData.projectName.trim()) return;

    setIsProcessing(true);
    setHasAnalyzed(false);
    setGeneratedKit(null);
    setIsProjectSaved(false);

    try {
      const result = await aiAssistantService.analyzeProject(formData);
      setAnalysis(result);
    } catch (err) {
      console.error(err);
    }
  };

  const handleProcessingComplete = () => {
    setIsProcessing(false);
    setHasAnalyzed(true);
  };

  const handleGenerateKit = () => {
    if (!analysis) return;
    const kit = aiAssistantService.generateProjectKit(analysis);
    setGeneratedKit(kit);
    addToast('Project Kit generated! Review component bundle below.', 'success');
  };

  const handleSaveProject = async () => {
    if (!analysis) return;
    await aiAssistantService.saveProject(analysis, user?.id || 'user-001');
    setIsProjectSaved(true);
    addToast(`"${analysis.projectName}" saved to your profile!`, 'success');
  };

  const handleNotifyMissing = (compName) => {
    setNotifiedComponents((prev) => [...prev, compName]);
    addToast(`✓ Notification alert enabled for "${compName}" across campus labs`, 'success');
  };

  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col antialiased">
      <TopAppBar showBack={true} />

      <main className="flex-1 w-full max-w-4xl mx-auto p-margin-mobile flex flex-col gap-lg pb-32">
        {/* Header Hero */}
        <div className="bg-gradient-to-br from-secondary via-secondary-container to-primary rounded-[24px] p-6 text-white shadow-xl relative overflow-hidden flex flex-col gap-3">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />

          <div className="z-10 flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px] text-secondary-fixed animate-pulse">
                smart_toy
              </span>
              <span className="text-[11px] uppercase tracking-widest font-extrabold text-on-secondary-container bg-white/20 px-2.5 py-0.5 rounded-full">
                AI Project Planner & BOM Generator
              </span>
            </div>
            <h2 className="font-display-lg-mobile text-[24px] sm:text-[28px] font-extrabold tracking-tight">
              Turn Project Ideas into Real Hardware Plans
            </h2>
            <p className="text-body-sm text-white/85 max-w-xl leading-relaxed">
              Describe your project concept and our engine will decompose it into a recommended bill of materials, automatically check live campus lab availability, and estimate readiness.
            </p>
          </div>
        </div>

        {/* Quick Presets Row */}
        <div className="flex flex-col gap-2">
          <span className="text-label-md font-bold uppercase tracking-wider text-on-surface-variant">
            ⚡ Quick-Load Engineering Project Presets
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {PROJECT_PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleSelectPreset(preset)}
                className={`p-3 rounded-2xl border text-left flex flex-col justify-between gap-1.5 transition-all cursor-pointer ${
                  formData.projectName === preset.name
                    ? 'bg-primary/10 border-primary text-primary font-bold shadow-xs'
                    : 'bg-surface-container hover:bg-surface-container-high border-outline-variant/30 text-on-surface'
                }`}
              >
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-primary">
                  {preset.domain}
                </span>
                <span className="text-[12px] font-bold line-clamp-2 leading-tight">
                  {preset.name}
                </span>
                <span className="text-[10px] text-on-surface-variant">
                  ₹{preset.budget} • {preset.deadline}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Project Input Form */}
        <form
          onSubmit={handleAnalyze}
          className="bg-surface-container-lowest rounded-[24px] p-6 border border-outline-variant/30 shadow-xs flex flex-col gap-5"
        >
          <div className="flex flex-col gap-1.5">
            <label className="font-label-md text-label-md uppercase font-bold text-on-surface">
              Project Title *
            </label>
            <input
              type="text"
              required
              value={formData.projectName}
              onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
              placeholder="e.g. IoT Smart Agriculture Station, Quadcopter Drone..."
              className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant/30 rounded-[16px] text-body-md text-on-surface focus:outline-none focus:border-primary font-bold"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-label-md text-label-md uppercase font-bold text-on-surface">
              Project Scope & Functional Description *
            </label>
            <textarea
              rows={3}
              required
              value={formData.projectDescription}
              onChange={(e) => setFormData({ ...formData, projectDescription: e.target.value })}
              placeholder="Describe what the system does, sensors used, power source, and intended demo..."
              className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant/30 rounded-[16px] text-body-sm text-on-surface focus:outline-none focus:border-primary"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">
                Domain
              </label>
              <select
                value={formData.domain}
                onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                className="p-3 bg-surface-container-low rounded-xl border border-outline-variant/30 text-body-sm text-on-surface"
              >
                <option value="Robotics">Robotics & Mechatronics</option>
                <option value="IoT">IoT & Wireless</option>
                <option value="Embedded Systems">Embedded Systems</option>
                <option value="AI/ML">Edge AI & Computer Vision</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">
                Experience Level
              </label>
              <select
                value={formData.experienceLevel}
                onChange={(e) => setFormData({ ...formData, experienceLevel: e.target.value })}
                className="p-3 bg-surface-container-low rounded-xl border border-outline-variant/30 text-body-sm text-on-surface"
              >
                <option value="Beginner">Beginner (Starter Kits)</option>
                <option value="Intermediate">Intermediate (Custom Microcontrollers)</option>
                <option value="Advanced">Advanced (Custom PCBs / RTOS)</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">
                Budget Target (₹)
              </label>
              <input
                type="number"
                value={formData.budget}
                onChange={(e) => setFormData({ ...formData, budget: Number(e.target.value) })}
                className="p-3 bg-surface-container-low rounded-xl border border-outline-variant/30 text-body-sm text-on-surface"
              />
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            icon="psychology"
            className="font-bold shadow-md"
          >
            Generate AI Hardware BOM & Check Availability
          </Button>
        </form>

        {/* Processing State Animation */}
        {isProcessing && (
          <AIProcessingState onComplete={handleProcessingComplete} />
        )}

        {/* Analysis & BOM Results Section */}
        {!isProcessing && hasAnalyzed && analysis && (
          <div className="flex flex-col gap-6 animate-scale-up">
            {/* Project Overview Banner */}
            <div className="bg-surface-container-lowest rounded-[24px] p-6 border border-outline-variant/30 shadow-xs flex flex-col gap-4">
              <div className="flex items-start justify-between">
                <div className="flex flex-col">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-primary">
                    AI Project Decomposition Analysis
                  </span>
                  <h3 className="font-heading-lg text-[22px] font-extrabold text-on-surface">
                    {analysis.projectName}
                  </h3>
                  <span className="text-body-sm text-on-surface-variant mt-1">
                    {analysis.domain} • {analysis.experienceLevel} Level • Target: {analysis.deadline}
                  </span>
                </div>

                <Button
                  variant="secondary"
                  size="sm"
                  icon={isProjectSaved ? 'bookmark_added' : 'bookmark'}
                  onClick={handleSaveProject}
                  className="shrink-0"
                >
                  {isProjectSaved ? 'Saved to Profile' : 'Save Project'}
                </Button>
              </div>

              <span className="text-[11px] text-outline italic">
                * Note: AI-generated starting point based on campus engineering curricula.
              </span>
            </div>

            {/* Project Readiness Gauge */}
            <ProjectReadiness
              availableCount={analysis.availableCount}
              totalCount={analysis.totalComponents}
              percentage={analysis.readinessPercentage}
              estimatedCost={analysis.totalEstimatedCost}
            />

            {/* Recommended BOM & Campus Reconciliation */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <h3 className="font-heading-lg text-[18px] font-bold text-on-surface flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">inventory_2</span>
                  Recommended Bill of Materials ({analysis.components.length} Items)
                </h3>
                <span className="text-[12px] text-emerald-700 font-bold">
                  {analysis.availableCount} Available on Campus
                </span>
              </div>

              <div className="flex flex-col gap-2.5">
                {analysis.components.map((comp, idx) => (
                  <ComponentRequirementRow
                    key={idx}
                    component={comp}
                    onNotify={handleNotifyMissing}
                    isNotified={notifiedComponents.includes(comp.name)}
                  />
                ))}
              </div>
            </div>

            {/* Action Card: Generate Project Kit */}
            {!generatedKit ? (
              <div className="bg-surface-container rounded-[24px] p-6 text-center border border-primary/30 flex flex-col items-center gap-3">
                <span className="material-symbols-outlined text-[40px] text-primary">
                  all_inbox
                </span>
                <h4 className="font-heading-lg text-[18px] font-bold text-on-surface">
                  Bundle into Campus Project Kit
                </h4>
                <p className="text-body-sm text-on-surface-variant max-w-md">
                  Package all {analysis.components.length} required components into a single shareable Project Kit bundle with estimated escrow rental calculations.
                </p>
                <Button
                  variant="primary"
                  size="md"
                  icon="inventory"
                  onClick={handleGenerateKit}
                  className="font-bold mt-1"
                >
                  Create Project Kit
                </Button>
              </div>
            ) : (
              <ProjectKitCard
                kit={generatedKit}
                onSaveKit={handleSaveProject}
                isSaved={isProjectSaved}
                onRequestMissing={() => {
                  navigate('/list-item');
                }}
              />
            )}
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
