/**
 * Cleaning Screen — Grammar Cleaning
 * Three essential phases to prepare the grammar for normalization:
 *   ε-Removal:    Eliminate null productions
 *   Unit Removal: Eliminate unit productions
 *   Useless Removal: Eliminate non-generating and unreachable symbols
 */
import StepControls from '../components/StepControls.jsx';
import ProductionDisplay from '../components/ProductionDisplay.jsx';

const PHASE_INFO = {
  input: {
    icon: 'park',
    title: 'Original Grammar',
    color: 'primary',
    description: 'The raw context-free grammar as initially provided.',
  },
  epsilon: {
    icon: 'backspace',
    title: 'ε-Removal',
    color: 'error',
    robotName: 'PHASE-1A',
    description: 'Elimination of null productions (A → ε).',
  },
  unit: {
    icon: 'content_cut',
    title: 'Unit Removal',
    color: 'tertiary',
    robotName: 'PHASE-1B',
    description: 'Elimination of unit productions (A → B).',
  },
  useless: {
    icon: 'compost',
    title: 'Useless Removal',
    color: 'secondary',
    robotName: 'PHASE-1C',
    description: 'Elimination of non-generating and unreachable symbols.',
  },
};

export default function CleaningScreen({ steps, allSteps, currentStep, goToStep, grammar }) {
  if (!grammar) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <span className="material-symbols-outlined text-7xl text-outline-variant/20 mb-4">mop</span>
        <h2 className="text-2xl font-bold text-on-surface mb-2">No Grammar to Clean</h2>
        <p className="text-on-surface-variant">Go to the Input tab and define your grammar first!</p>
      </div>
    );
  }

  const currentPhaseStep = steps.find(s => s.id === currentStep) || steps[0];
  const phaseInfo = PHASE_INFO[currentPhaseStep?.phase] || PHASE_INFO.input;

  const phaseGroups = {};
  for (const s of steps) {
    if (!phaseGroups[s.phase]) phaseGroups[s.phase] = [];
    phaseGroups[s.phase].push(s);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4 mb-2">
        <div>
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tighter text-on-surface mb-2">
            Grammar <span className="text-primary">Cleaning</span>
          </h2>
          <p className="text-on-surface-variant text-lg leading-relaxed">
            Essential preprocessing phases to simplify the context-free grammar.
          </p>
        </div>
      </div>

      {/* Robot Specialists Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {['epsilon', 'unit', 'useless'].map(phase => {
          const info = PHASE_INFO[phase];
          const phaseSteps = phaseGroups[phase] || [];
          const isActive = currentPhaseStep?.phase === phase;
          const isComplete = phaseSteps.length > 0 && currentStep >= phaseSteps[phaseSteps.length - 1].id;

          return (
            <div key={phase} className={`bg-surface-container-high rounded-2xl p-5 border transition-all duration-500 ${
              isActive ? 'border-primary/30 success-pulse' :
              isComplete ? 'border-primary/10 opacity-80' : 'border-outline-variant/5 opacity-50'
            }`}>
              <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 transition-transform ${
                isActive ? 'scale-110' : ''
              }`} style={{ background: `var(--color-${info.color})15` }}>
                <span className={`material-symbols-outlined text-2xl text-${info.color}`}>{info.icon}</span>
              </div>
              <h4 className="text-lg font-bold mb-1">{info.title}</h4>
              <p className="text-on-surface-variant text-xs mb-3">{info.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-widest text-outline">{info.robotName}</span>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                  isComplete ? 'bg-primary/15 text-primary' :
                  isActive ? 'bg-tertiary/15 text-tertiary' : 'bg-surface-variant text-outline'
                }`}>
                  {isComplete ? '✓ Done' : isActive ? '⟳ Active' : `${phaseSteps.length} step(s)`}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Current Step Display */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8">
          <div className="bg-surface-container rounded-2xl p-6 border border-outline-variant/5">
            {currentPhaseStep && (
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-3">
                  <span className={`bg-${phaseInfo.color}/15 text-${phaseInfo.color} px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-${phaseInfo.color}/20`}>
                    {currentPhaseStep.metadata?.phaseLabel || phaseInfo.title}
                  </span>
                  <span className="text-[10px] text-outline uppercase tracking-widest">
                    Step {currentPhaseStep.id + 1}
                  </span>
                </div>

                {/* Technical description */}
                <div className="bg-surface-container-low rounded-xl p-4 mb-3 border-l-4 border-primary/40">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="material-symbols-outlined text-xs text-primary">biotech</span>
                    <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Formal</span>
                  </div>
                  <p className="text-on-surface text-sm font-medium leading-relaxed">
                    {currentPhaseStep.action}
                  </p>
                </div>

                {/* Kid-friendly explanation */}
                <div className="bg-gradient-to-br from-surface-container-low to-surface-container rounded-xl p-4 border-l-4 border-secondary/40">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="material-symbols-outlined text-xs text-secondary">child_care</span>
                    <span className="text-[10px] font-bold text-secondary uppercase tracking-widest">Kid-Friendly</span>
                  </div>
                  <p className="text-on-surface-variant text-sm leading-[1.7] whitespace-pre-line">
                    {currentPhaseStep.kidExplanation}
                  </p>
                </div>
              </div>
            )}

            <h3 className="text-sm font-bold text-primary uppercase tracking-widest mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">account_tree</span>
              Current Grammar State
            </h3>
            <ProductionDisplay grammar={currentPhaseStep?.grammar} highlights={currentPhaseStep?.highlights} />
          </div>
        </div>

        {/* Step Log */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-surface-container-high rounded-2xl p-5 border border-outline-variant/5 max-h-[500px] overflow-y-auto">
            <h4 className="text-sm font-bold text-on-surface-variant uppercase tracking-widest mb-4">Step Log</h4>
            <div className="space-y-2">
              {steps.map((step) => {
                const info = PHASE_INFO[step.phase] || PHASE_INFO.input;
                const isActive = step.id === currentStep;
                const isPast = step.id < currentStep;

                return (
                  <button key={step.id} onClick={() => goToStep(step.id)}
                    className={`w-full text-left p-3 rounded-xl text-xs transition-all ${
                      isActive ? 'bg-primary/10 border border-primary/20' :
                      isPast ? 'bg-surface-container-low/50 opacity-60 hover:opacity-80' :
                      'bg-surface-container-low/30 opacity-40 hover:opacity-60'
                    }`}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`material-symbols-outlined text-xs ${isActive ? 'text-primary' : 'text-outline'}`}>
                        {isPast ? 'check_circle' : isActive ? 'radio_button_checked' : 'radio_button_unchecked'}
                      </span>
                      <span className={`font-bold uppercase tracking-wider ${isActive ? 'text-primary' : 'text-outline'}`}>
                        {step.metadata?.phaseLabel || info.title}
                      </span>
                    </div>
                    <p className="text-on-surface-variant line-clamp-2 pl-5">{step.action}</p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <StepControls steps={steps} currentStepIndex={currentStep} onGoToStep={goToStep} allSteps={allSteps} />
    </div>
  );
}
