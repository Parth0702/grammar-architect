/**
 * Step-through controls component
 * Consistent controls shown at the bottom of Cleaning, Binary, and Flower screens
 */
import { useState, useEffect, useRef } from 'react';

export default function StepControls({ steps, currentStepIndex, onGoToStep, allSteps }) {
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const autoPlayRef = useRef(null);

  // Find the global index range for these phase steps
  const firstGlobalIdx = steps.length > 0 ? allSteps.findIndex(s => s === steps[0]) : -1;
  const lastGlobalIdx = steps.length > 0 ? allSteps.findIndex(s => s === steps[steps.length - 1]) : -1;

  // Current local step within this phase
  const localIndex = steps.findIndex(s => s.id === currentStepIndex);
  const effectiveLocal = localIndex >= 0 ? localIndex : 0;

  useEffect(() => {
    if (isAutoPlaying) {
      autoPlayRef.current = setInterval(() => {
        const nextGlobal = currentStepIndex + 1;
        if (nextGlobal <= lastGlobalIdx) {
          onGoToStep(nextGlobal);
        } else {
          setIsAutoPlaying(false);
        }
      }, 1500);
    }
    return () => {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    };
  }, [isAutoPlaying, currentStepIndex, lastGlobalIdx, onGoToStep]);

  if (steps.length === 0) {
    return (
      <div className="bg-surface-container-high/80 backdrop-blur-xl rounded-2xl p-4 flex items-center justify-center">
        <p className="text-on-surface-variant text-sm">No grammar loaded. Return to Input tab to define your grammar.</p>
      </div>
    );
  }

  const canPrev = currentStepIndex > firstGlobalIdx;
  const canNext = currentStepIndex < lastGlobalIdx;

  return (
    <div className="bg-surface-container-high/80 backdrop-blur-xl rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 border border-outline-variant/10">
      <div className="flex items-center gap-2">
        <button
          onClick={() => onGoToStep(firstGlobalIdx)}
          disabled={!canPrev}
          className="p-2 rounded-full hover:bg-surface-variant transition-colors disabled:opacity-30"
          title="Reset to start"
        >
          <span className="material-symbols-outlined text-on-surface text-xl">skip_previous</span>
        </button>
        <button
          onClick={() => onGoToStep(currentStepIndex - 1)}
          disabled={!canPrev}
          className="p-2 rounded-full hover:bg-surface-variant transition-colors disabled:opacity-30"
          title="Previous step"
        >
          <span className="material-symbols-outlined text-on-surface text-xl">navigate_before</span>
        </button>
      </div>

      <div className="flex items-center gap-3">
        <div className="bg-surface-container-low px-4 py-1.5 rounded-full">
          <span className="text-sm font-bold text-primary">
            Step {effectiveLocal + 1}
          </span>
          <span className="text-sm text-on-surface-variant">
            {' '}of {steps.length}
          </span>
        </div>

        <button
          onClick={() => setIsAutoPlaying(!isAutoPlaying)}
          className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
            isAutoPlaying
              ? 'bg-error/20 text-error border border-error/30'
              : 'bg-primary/15 text-primary border border-primary/20 hover:bg-primary/25'
          }`}
        >
          <span className="material-symbols-outlined text-sm">
            {isAutoPlaying ? 'pause' : 'play_arrow'}
          </span>
          {isAutoPlaying ? 'Pause' : 'Auto-Play'}
        </button>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => onGoToStep(currentStepIndex + 1)}
          disabled={!canNext}
          className="p-2 rounded-full hover:bg-surface-variant transition-colors disabled:opacity-30"
          title="Next step"
        >
          <span className="material-symbols-outlined text-on-surface text-xl">navigate_next</span>
        </button>
        <button
          onClick={() => onGoToStep(lastGlobalIdx)}
          disabled={!canNext}
          className="p-2 rounded-full hover:bg-surface-variant transition-colors disabled:opacity-30"
          title="Skip to end"
        >
          <span className="material-symbols-outlined text-on-surface text-xl">skip_next</span>
        </button>
      </div>
    </div>
  );
}
