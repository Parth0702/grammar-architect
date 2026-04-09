/**
 * Binary Bloom Screen — Chomsky Normal Form (CNF)
 * Shows terminal isolation + binary reduction steps
 */
import StepControls from '../components/StepControls.jsx';
import ProductionDisplay from '../components/ProductionDisplay.jsx';

export default function BinaryBloomScreen({ steps, allSteps, currentStep, goToStep, baseGrammar }) {
  if (!baseGrammar) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <span className="material-symbols-outlined text-7xl text-outline-variant/20 mb-4">code</span>
        <h2 className="text-2xl font-bold text-on-surface mb-2">No Grammar to Convert</h2>
        <p className="text-on-surface-variant">Input a grammar in the Input tab first!</p>
      </div>
    );
  }

  const currentPhaseStep = steps.find(s => s.id === currentStep) || steps[steps.length - 1] || null;
  const displayGrammar = currentPhaseStep?.grammar || baseGrammar;

  const termSteps = steps.filter(s => s.phase === 'cnf_term');
  const binSteps = steps.filter(s => s.phase === 'cnf_bin');
  const isComplete = steps.length > 0 && currentStep >= steps[steps.length - 1]?.id;

  return (
    <div className="space-y-6">
      <div className="mb-2">
        <h2 className="text-4xl md:text-5xl font-extrabold tracking-tighter text-on-surface mb-2">
          Chomsky <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary-container">Normal Form</span>
        </h2>
        <p className="text-on-surface-variant text-lg leading-relaxed max-w-2xl">
          A grammar is in CNF if all production rules are of the form <strong className="text-primary">A → BC</strong> (two variables) or <strong className="text-secondary">A → a</strong> (one terminal).
        </p>
      </div>

      {/* Phase Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className={`bg-surface-container rounded-2xl p-5 border transition-all ${
          currentPhaseStep?.phase === 'cnf_term' ? 'border-primary/30 success-pulse' : 'border-outline-variant/5'
        }`}>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-secondary/15 flex items-center justify-center">
              <span className="material-symbols-outlined text-secondary text-xl">swap_horiz</span>
            </div>
            <div>
              <h4 className="font-bold text-on-surface">Terminal Isolation</h4>
              <p className="text-xs text-on-surface-variant">Introduce proxy variables to ensure terminals only appear in rules of nature A → a.</p>
            </div>
          </div>
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
            termSteps.length > 0 && currentStep >= termSteps[termSteps.length - 1]?.id
              ? 'bg-primary/15 text-primary' : 'bg-surface-variant text-outline'
          }`}>
            {termSteps.length > 0 && currentStep >= termSteps[termSteps.length - 1]?.id ? '✓ Done' : `${termSteps.length} step(s)`}
          </span>
        </div>

        <div className={`bg-surface-container rounded-2xl p-5 border transition-all ${
          currentPhaseStep?.phase === 'cnf_bin' ? 'border-primary/30 success-pulse' : 'border-outline-variant/5'
        }`}>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center">
              <span className="material-symbols-outlined text-primary text-xl">call_split</span>
            </div>
            <div>
              <h4 className="font-bold text-on-surface">Binary Reduction</h4>
              <p className="text-xs text-on-surface-variant">Decompose rules with more than two symbols on the RHS into a sequence of binary productions.</p>
            </div>
          </div>
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
            binSteps.length > 0 && currentStep >= binSteps[binSteps.length - 1]?.id
              ? 'bg-primary/15 text-primary' : 'bg-surface-variant text-outline'
          }`}>
            {binSteps.length > 0 && currentStep >= binSteps[binSteps.length - 1]?.id ? '✓ Done' : `${binSteps.length} step(s)`}
          </span>
        </div>
      </div>

      {/* Step Description + Grammar */}
      <div className="bg-surface-container rounded-2xl p-6 border border-outline-variant/5">
        {currentPhaseStep && (
          <div className="mb-6">
            {/* Formal */}
            <div className="bg-surface-container-low rounded-xl p-4 mb-3 border-l-4 border-primary/40">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="material-symbols-outlined text-xs text-primary">biotech</span>
                <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Formal</span>
              </div>
              <p className="text-on-surface text-sm font-medium">{currentPhaseStep.action}</p>
            </div>
            {/* Kid-Friendly */}
            <div className="bg-gradient-to-br from-surface-container-low to-surface-container rounded-xl p-4 border-l-4 border-secondary/40">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="material-symbols-outlined text-xs text-secondary">child_care</span>
                <span className="text-[10px] font-bold text-secondary uppercase tracking-widest">Kid-Friendly</span>
              </div>
              <p className="text-on-surface-variant text-sm leading-[1.7] whitespace-pre-line">{currentPhaseStep.kidExplanation}</p>
            </div>
          </div>
        )}

        <h3 className="text-sm font-bold text-primary uppercase tracking-widest mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined text-sm">account_tree</span>
          {isComplete ? 'CNF Grammar (Complete!)' : 'Current Grammar State'}
        </h3>
        <ProductionDisplay grammar={displayGrammar} highlights={currentPhaseStep?.highlights} />
      </div>

      {/* CNF Complete Badge */}
      {isComplete && (
        <div className="success-fade bg-gradient-to-br from-primary/10 to-surface-container-high rounded-2xl p-6 border border-primary/20 flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center">
            <span className="material-symbols-outlined text-primary text-4xl"
              style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
          </div>
          <div>
            <h4 className="text-xl font-bold text-primary">Chomsky Normal Form Complete! 🌺</h4>
            <p className="text-on-surface-variant text-sm">
              All production rules now satisfy the requirements: A → BC (two variables) or A → a (one terminal).
            </p>
          </div>
        </div>
      )}

      <StepControls steps={steps} currentStepIndex={currentStep} onGoToStep={goToStep} allSteps={allSteps} />
    </div>
  );
}
