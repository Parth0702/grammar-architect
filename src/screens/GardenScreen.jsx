/**
 * Garden Screen — Grammar Input
 * Formal Grammar Definition — the main input screen
 */
import { useState } from 'react';
import { EXAMPLE_GRAMMARS, grammarToString } from '../engine/grammar.js';

export default function GardenScreen({ onConvert, error, inputText, setInputText, grammar, targetForm, setTargetForm }) {
  const [showExamples, setShowExamples] = useState(false);

  const loadExample = (key) => {
    setInputText(EXAMPLE_GRAMMARS[key]);
    setShowExamples(false);
  };

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-2xl p-8 md:p-12">
        <div className="absolute inset-0 z-0">
          <div className="w-full h-full bg-gradient-to-br from-primary/8 via-surface-container to-surface-container-low"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/60 to-transparent"></div>
          {/* Animated particles */}
          <div className="absolute top-10 left-[20%] w-2 h-2 rounded-full bg-primary/30 animate-pulse"></div>
          <div className="absolute top-20 right-[30%] w-1.5 h-1.5 rounded-full bg-secondary/40 animate-pulse" style={{animationDelay: '1s'}}></div>
          <div className="absolute bottom-10 left-[60%] w-1 h-1 rounded-full bg-tertiary/30 animate-pulse" style={{animationDelay: '2s'}}></div>
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-4">
            <div className="px-3 py-1 rounded-full bg-surface-variant border border-primary/20 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
              <span className="text-xs font-bold uppercase tracking-widest text-primary">Live Validation</span>
            </div>
          </div>
          <h2 className="text-4xl md:text-6xl font-extrabold tracking-tighter mb-4 text-on-surface">
            Grammar <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary-container">Definition</span>
          </h2>
          <p className="text-on-surface-variant max-w-xl text-lg leading-relaxed">
            Specify production rules for your context-free grammar. The Architect will guide you through the formal transformation process.
          </p>
        </div>
      </section>

      {/* Main Input Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Text Area (The Soil) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="glass-panel p-1 rounded-2xl shadow-2xl">
            <div className="bg-surface-container-low rounded-[1.8rem] p-6 min-h-[350px] flex flex-col">
              <label className="text-xs font-bold text-primary mb-4 uppercase tracking-[0.2em] flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">edit_note</span>
                Production Rules
              </label>
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="flex-1 bg-transparent border-none focus:ring-0 focus:outline-none text-lg md:text-xl text-on-surface placeholder:text-outline/40 resize-none font-medium leading-relaxed font-mono"
                placeholder={`Enter grammar rules (one per line):\n\nS -> A B | a\nA -> a A | ε\nB -> b B | b\n\nUse -> for production arrow\nUse | to separate alternatives\nUse ε for epsilon`}
                rows={10}
              />

              {error && (
                <div className="mt-3 p-3 rounded-xl bg-error/10 border border-error/30 flex items-start gap-2">
                  <span className="material-symbols-outlined text-error text-lg mt-0.5">error</span>
                  <p className="text-error text-sm font-medium">{error}</p>
                </div>
              )}

              <div className="mt-6 flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-outline-variant/10">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setShowExamples(!showExamples)}
                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-surface-variant text-on-surface-variant hover:text-primary transition-colors text-sm font-semibold"
                  >
                    <span className="material-symbols-outlined text-lg">auto_fix_high</span>
                    Examples
                  </button>

                  {/* Target Form Selector */}
                  <div className="flex gap-1 bg-surface-variant rounded-full p-1">
                    <button
                      onClick={() => setTargetForm('CNF')}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                        targetForm === 'CNF'
                          ? 'bg-primary text-on-primary-container'
                          : 'text-on-surface-variant hover:text-primary'
                      }`}
                    >
                      CNF
                    </button>
                    <button
                      onClick={() => setTargetForm('GNF')}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                        targetForm === 'GNF'
                          ? 'bg-secondary text-on-secondary'
                          : 'text-on-surface-variant hover:text-secondary'
                      }`}
                    >
                      GNF
                    </button>
                  </div>
                </div>

                <button
                  onClick={() => onConvert(inputText, targetForm)}
                  disabled={!inputText.trim()}
                  className="bg-gradient-to-br from-primary to-primary-container text-on-primary-container px-8 py-3 rounded-full font-bold shadow-[0_0_20px_rgba(195,255,156,0.3)] hover:scale-105 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-40 disabled:hover:scale-100"
                >
                  <span className="material-symbols-outlined">analytics</span>
                  Convert to {targetForm}
                </button>
              </div>
            </div>
          </div>

          {/* Examples Dropdown */}
          {showExamples && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {Object.entries(EXAMPLE_GRAMMARS).map(([name, text]) => (
                <button
                  key={name}
                  onClick={() => loadExample(name)}
                  className="bg-surface-container p-4 rounded-xl border border-outline-variant/10 hover:bg-surface-container-high hover:border-primary/20 transition-all text-left group"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="material-symbols-outlined text-primary text-sm group-hover:scale-110 transition-transform">eco</span>
                    <h4 className="font-bold text-on-surface text-sm">{name}</h4>
                  </div>
                  <pre className="text-xs text-on-surface-variant font-mono leading-relaxed">{text}</pre>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Botanical Parameters */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-surface-container-high rounded-2xl p-7 border border-primary/10 relative overflow-hidden">
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/10 blur-[100px] rounded-full"></div>
            <h3 className="text-lg font-bold text-on-surface mb-6 flex items-center gap-2 relative z-10">
              <span className="material-symbols-outlined text-primary">analytics</span>
              Formal Definitions
            </h3>

            {grammar ? (
              <div className="space-y-5 relative z-10">
                {/* Seeds Count */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="variable-node !w-7 !h-7 !text-xs">{grammar.variables.size}</div>
                    <span className="text-on-surface-variant text-sm font-medium">Non-Terminals (Variables)</span>
                  </div>
                  <span className="text-primary font-bold text-sm">{[...grammar.variables].join(', ')}</span>
                </div>

                {/* Flowers Count */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="terminal-node !w-6 !h-6 !text-[10px]">
                      <span>{grammar.terminals.size}</span>
                    </div>
                    <span className="text-on-surface-variant text-sm font-medium">Terminals</span>
                  </div>
                  <span className="text-secondary font-bold text-sm">{[...grammar.terminals].join(', ')}</span>
                </div>

                {/* Production Count */}
                <div className="flex items-center justify-between">
                  <span className="text-on-surface-variant text-sm font-medium">Production Rules</span>
                  <span className="text-on-surface font-bold text-sm">
                    {Object.values(grammar.productions).reduce((sum, rhs) => sum + rhs.length, 0)}
                  </span>
                </div>

                {/* Start Symbol */}
                <div className="flex items-center justify-between">
                  <span className="text-on-surface-variant text-sm font-medium">Start Symbol</span>
                  <div className="variable-node !w-8 !h-8 !text-sm">{grammar.startSymbol}</div>
                </div>

                {/* Target */}
                <div className="pt-3 border-t border-outline-variant/10">
                  <div className="flex items-center justify-between">
                    <span className="text-on-surface-variant text-sm font-medium">Target Form</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      targetForm === 'CNF'
                        ? 'bg-primary/15 text-primary border border-primary/20'
                        : 'bg-secondary/15 text-secondary border border-secondary/20'
                    }`}>
                      {targetForm === 'CNF' ? 'Chomsky Normal Form' : 'Greibach Normal Form'}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 relative z-10">
                <span className="material-symbols-outlined text-5xl text-outline-variant/30 mb-3 block">psychiatry</span>
                <p className="text-on-surface-variant text-sm">Enter grammar rules and click Convert to see parameters.</p>
              </div>
            )}
          </div>

          {/* Gardener Badge */}
          <div className="bg-gradient-to-br from-surface-variant to-surface-container-high rounded-2xl p-6 border border-outline-variant/10">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <div className="relative">
                  <span className="material-symbols-outlined text-primary text-3xl">rewarded_ads</span>
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full animate-ping opacity-75"></div>
                </div>
              </div>
              <div>
                <h4 className="text-on-surface font-bold mb-1">Grammar Architect Guide</h4>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  Enter production rules, choose CNF or GNF, then click <strong className="text-primary">Convert</strong> to begin the formal transformation process.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
