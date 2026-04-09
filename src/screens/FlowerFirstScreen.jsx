/**
 * Flower-First Screen — Greibach Normal Form (GNF)
 * Phases: Variable Ranking → Forward Substitution → Left Recursion Elimination → Back-Substitution
 */
import StepControls from '../components/StepControls.jsx';
import ProductionDisplay from '../components/ProductionDisplay.jsx';

const GNF_PHASES = {
  gnf_rank: {
    icon: 'format_list_numbered',
    title: 'Variable Ranking',
    description: 'Assign indices to variables to establish a processing order.',
  },
  gnf_substitute: {
    icon: 'swap_vert',
    title: 'Forward Substitution',
    description: 'Eliminate productions Aᵢ → Aⱼγ where j < i.',
  },
  gnf_left_recursion: {
    icon: 'loop',
    title: 'Left Recursion',
    description: 'Eliminate immediate left recursion Aᵢ → Aᵢα using Lemma 1.',
  },
  gnf_backsubstitute: {
    icon: 'replay',
    title: 'Back-Substitution',
    description: 'Substitute variables in reverse order to ensure A → aα form.',
  },
};

export default function FlowerFirstScreen({ steps, allSteps, currentStep, goToStep, baseGrammar, targetForm }) {
  if (targetForm !== 'GNF') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <span className="material-symbols-outlined text-7xl text-outline-variant/20 mb-4">local_florist</span>
        <h2 className="text-2xl font-bold text-on-surface mb-2">GNF Selection</h2>
        <p className="text-on-surface-variant">Go to the Input tab and select GNF as the target form.</p>
      </div>
    );
  }

  if (!baseGrammar) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <span className="material-symbols-outlined text-7xl text-outline-variant/20 mb-4">local_florist</span>
        <h2 className="text-2xl font-bold text-on-surface mb-2">No Grammar Yet</h2>
        <p className="text-on-surface-variant">Input a grammar in the Input tab first.</p>
      </div>
    );
  }

  const currentPhaseStep = steps.find(s => s.id === currentStep) || steps[steps.length - 1] || null;
  const displayGrammar = currentPhaseStep?.grammar || baseGrammar;
  const isLeftRecursion = currentPhaseStep?.metadata?.isLeftRecursion;
  const isComplete = steps.length > 0 && currentStep >= steps[steps.length - 1]?.id;

  const rankStep = steps.find(s => s.phase === 'gnf_rank');
  const ranking = rankStep?.metadata?.ranking || {};

  return (
    <div className="space-y-6">
      <div className="mb-2">
        <h2 className="text-4xl md:text-5xl font-extrabold tracking-tighter text-on-surface mb-2">
          Greibach <span className="text-transparent bg-clip-text bg-gradient-to-r from-secondary to-secondary-dim">Normal Form</span>
        </h2>
        <p className="text-on-surface-variant text-lg leading-relaxed max-w-2xl">
          A grammar is in GNF if all production rules start with a <strong className="text-secondary">terminal symbol</strong>, followed by zero or more variables.
          Form: <strong className="text-secondary">A → a α</strong> where a ∈ Σ and α ∈ V*.
        </p>
      </div>

      {/* Phase row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {Object.entries(GNF_PHASES).map(([phase, info]) => {
          const phaseSteps = steps.filter(s => s.phase === phase);
          const isActive = currentPhaseStep?.phase === phase;
          const isPhaseComplete = phaseSteps.length > 0 && currentStep >= phaseSteps[phaseSteps.length - 1]?.id;
          const isLR = phase === 'gnf_left_recursion';

          return (
            <div key={phase} className={`bg-surface-container rounded-xl p-4 border transition-all ${
              isActive ? (isLR ? 'border-error/40 transition-pulse' : 'border-primary/30 success-pulse')
              : 'border-outline-variant/5'
            } ${!isActive && !isPhaseComplete ? 'opacity-50' : ''}`}>
              <span className={`material-symbols-outlined text-2xl mb-2 block ${
                isLR && isActive ? 'text-error' : 'text-primary'
              }`}>{info.icon}</span>
              <h5 className="text-xs font-bold mb-1">{info.title}</h5>
              <p className="text-[10px] text-on-surface-variant leading-snug">{info.description}</p>
              <div className="mt-2">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  isPhaseComplete ? 'bg-primary/15 text-primary' :
                  isActive ? 'bg-tertiary/15 text-tertiary' : 'bg-surface-variant text-outline'
                }`}>
                  {isPhaseComplete ? '✓' : isActive ? '⟳' : `${phaseSteps.length}`}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8">
          {/* Left Recursion Warning */}
          {isLeftRecursion && (
            <div className="mb-4 transition-pulse bg-[#1a0b12] rounded-2xl p-5 border border-error/30 flex items-start gap-4">
              <span className="material-symbols-outlined text-error text-3xl animate-pulse">warning</span>
              <div>
                <h4 className="text-error font-bold text-lg mb-1">🔴 Left Recursion Detected!</h4>
                <p className="text-on-surface-variant text-sm">
                  Variable <strong className="text-error">{currentPhaseStep?.metadata?.leftRecursiveVar}</strong> exhibits immediate left recursion.
                  Introducing new non-terminal <strong className="text-primary">{currentPhaseStep?.metadata?.newVar}</strong> to eliminate recursion.
                </p>
              </div>
            </div>
          )}

          <div className="bg-surface-container rounded-2xl p-6 border border-outline-variant/5">
            {currentPhaseStep && (
              <div className="mb-6">
                {/* Formal */}
                <div className="bg-surface-container-low rounded-xl p-4 mb-3 border-l-4 border-secondary/40">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="material-symbols-outlined text-xs text-secondary">biotech</span>
                    <span className="text-[10px] font-bold text-secondary uppercase tracking-widest">Formal</span>
                  </div>
                  <p className="text-on-surface text-sm font-medium">{currentPhaseStep.action}</p>
                </div>
                {/* Kid-Friendly */}
                <div className="bg-gradient-to-br from-surface-container-low to-surface-container rounded-xl p-4 border-l-4 border-primary/40">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="material-symbols-outlined text-xs text-primary">child_care</span>
                    <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Kid-Friendly</span>
                  </div>
                  <p className="text-on-surface-variant text-sm leading-[1.7] whitespace-pre-line">{currentPhaseStep.kidExplanation}</p>
                </div>
              </div>
            )}

            <h3 className="text-sm font-bold text-secondary uppercase tracking-widest mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">account_tree</span>
              Current Grammar State
            </h3>
            <ProductionDisplay grammar={displayGrammar} highlights={currentPhaseStep?.highlights} />
          </div>
        </div>

        {/* The Ladder (Ranking sidebar) */}
        <div className="lg:col-span-4">
          <div className="bg-surface-container-high rounded-2xl p-5 border border-outline-variant/5">
            <h4 className="text-sm font-bold text-on-surface-variant uppercase tracking-widest mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-sm text-tertiary">format_list_numbered</span>
              Variable Ranking
            </h4>
            <p className="text-xs text-on-surface-variant mb-4 leading-relaxed">
              Indices assigned to variables. A rule A<sub>i</sub> → A<sub>j</sub>γ is valid only if <strong className="text-tertiary">j &gt; i</strong>.
            </p>
            {Object.keys(ranking).length > 0 ? (
              <div className="space-y-2">
                {Object.entries(ranking)
                  .sort(([, a], [, b]) => a - b)
                  .map(([variable, rank]) => (
                    <div key={variable} className="flex items-center gap-3 p-2 rounded-xl bg-surface-container-low">
                      <span className="w-7 h-7 rounded-full bg-tertiary/20 flex items-center justify-center text-tertiary text-xs font-black">
                        {rank}
                      </span>
                      <div className="variable-node !w-8 !h-8 !text-sm">{variable}</div>
                      <span className="text-on-surface-variant text-xs">Index i={rank}</span>
                    </div>
                  ))}
              </div>
            ) : (
              <p className="text-on-surface-variant text-xs text-center py-4">Ranking will appear after the ranking step.</p>
            )}
          </div>

          {/* Stake Method Explainer */}
          <div className="mt-4 bg-gradient-to-br from-error/5 to-surface-container-high rounded-2xl p-5 border border-error/10">
            <h4 className="font-bold text-on-surface mb-2 flex items-center gap-2 text-sm">
              <span className="material-symbols-outlined text-error text-lg">carpenter</span>
              Left Recursion Elimination
            </h4>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Immediate left recursion (A → Aα) is eliminated by introducing a new variable and converting it to right-recursive form.
              <br/><br/>
              <strong>Formal:</strong> A → Aα | β becomes A → β | βZ, Z → α | αZ.
            </p>
          </div>
        </div>
      </div>

      {/* GNF Complete Badge */}
      {isComplete && (
        <div className="success-fade bg-gradient-to-br from-secondary/10 to-surface-container-high rounded-2xl p-6 border border-secondary/20 flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-secondary/20 flex items-center justify-center">
            <span className="material-symbols-outlined text-secondary text-4xl"
              style={{ fontVariationSettings: "'FILL' 1" }}>local_florist</span>
          </div>
          <div>
            <h4 className="text-xl font-bold text-secondary">Greibach Normal Form Complete! 🌸</h4>
            <p className="text-on-surface-variant text-sm">
              All production rules satisfy the GNF requirement: A → a α (terminal symbol followed by variables).
            </p>
          </div>
        </div>
      )}

      <StepControls steps={steps} currentStepIndex={currentStep} onGoToStep={goToStep} allSteps={allSteps} />
    </div>
  );
}
