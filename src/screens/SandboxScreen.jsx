/**
 * Sandbox Screen — CYK String Tester
 * Verifies if a string belongs to the language defined by the grammar.
 */
import { useState, useCallback } from 'react';
import { runCYK } from '../engine/cyk.js';
import ProductionDisplay from '../components/ProductionDisplay.jsx';

export default function SandboxScreen({ cnfGrammar, finalGrammar, grammar }) {
  const [testString, setTestString] = useState('');
  const [cykResult, setCykResult] = useState(null);
  const [cykStepIndex, setCykStepIndex] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  const handleTest = useCallback(() => {
    if (!cnfGrammar || !testString.trim()) return;
    setIsRunning(true);
    const result = runCYK(cnfGrammar, testString.trim());
    setCykResult(result);
    setCykStepIndex(result.steps.length - 1); // Jump to result
    setIsRunning(false);
  }, [cnfGrammar, testString]);

  const currentCykStep = cykResult?.steps[cykStepIndex];

  if (!grammar) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <span className="material-symbols-outlined text-7xl text-outline-variant/20 mb-4">fluorescent</span>
        <h2 className="text-2xl font-bold text-on-surface mb-2">Tester Empty</h2>
        <p className="text-on-surface-variant">Convert a grammar in the Input tab first to test strings.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-2">
        <h2 className="text-4xl md:text-5xl font-extrabold tracking-tighter text-on-surface mb-2">
          String <span className="text-transparent bg-clip-text bg-gradient-to-r from-tertiary to-tertiary-dim">Tester</span>
        </h2>
        <p className="text-on-surface-variant text-lg leading-relaxed max-w-2xl">
          Test if a string belongs to your grammar's language using the CYK algorithm.
        </p>
      </div>

      {/* Input Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8">
          {/* String Input */}
          <div className="bg-surface-container rounded-2xl p-6 border border-outline-variant/5 mb-6">
            <label className="text-xs font-bold text-tertiary-dim uppercase tracking-widest mb-3 flex items-center gap-2 block">
              <span className="material-symbols-outlined text-sm">text_fields</span>
              Test String
            </label>
            <div className="flex gap-3">
              <input
                type="text"
                value={testString}
                onChange={(e) => setTestString(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleTest()}
                placeholder="Enter a string to test (e.g., aabb or a b a b)"
                className="flex-1 bg-surface-container-low border-none rounded-xl px-4 py-3 text-on-surface placeholder:text-outline/40 font-mono text-lg focus:ring-2 focus:ring-primary/30 focus:outline-none"
              />
              <button
                onClick={handleTest}
                disabled={!testString.trim() || isRunning}
                className="bg-gradient-to-br from-tertiary to-tertiary-dim text-on-tertiary-container px-6 py-3 rounded-xl font-bold hover:scale-105 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-40"
              >
                <span className="material-symbols-outlined">science</span>
                Test
              </button>
            </div>
            <p className="text-xs text-on-surface-variant mt-2">
              Separate multi-character terminals with spaces. Single characters can be entered without spaces.
            </p>
          </div>

          {/* CYK Result */}
          {cykResult && (
            <div className="space-y-4">
              {/* Result Banner */}
              <div className={`rounded-2xl p-6 border-2 flex items-center gap-5 ${
                cykResult.accepted
                  ? 'bg-primary/8 border-primary/30 success-fade'
                  : 'bg-error/8 border-error/30 error-shake'
              }`}>
                <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                  cykResult.accepted ? 'bg-primary/20' : 'bg-error/20'
                }`}>
                  <span className={`material-symbols-outlined text-5xl ${
                    cykResult.accepted ? 'text-primary' : 'text-error'
                  }`} style={{ fontVariationSettings: "'FILL' 1" }}>
                    {cykResult.accepted ? 'check_circle' : 'cancel'}
                  </span>
                </div>
                <div>
                  <h3 className={`text-2xl font-extrabold ${cykResult.accepted ? 'text-primary' : 'text-error'}`}>
                    {cykResult.accepted ? 'String Accepted ✓' : 'String Rejected ✗'}
                  </h3>
                  <p className="text-on-surface-variant text-sm mt-1">
                    String "<span className="font-mono font-bold text-on-surface">{cykResult.inputSymbols.join('')}</span>"{' '}
                    {cykResult.accepted ? 'is accepted by the grammar.' : 'is NOT in the language.'}
                  </p>
                </div>
              </div>

              {/* CYK Table */}
              <div className="bg-surface-container rounded-2xl p-6 border border-outline-variant/5 overflow-x-auto">
                <h3 className="text-sm font-bold text-tertiary uppercase tracking-widest mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm">grid_on</span>
                  CYK Recognition Table
                </h3>

                <div className="min-w-fit">
                  {/* Header row with input symbols */}
                  <div className="flex gap-1 mb-2 ml-[60px]">
                    {cykResult.inputSymbols.map((sym, i) => (
                      <div key={i} className="cyk-cell bg-surface-container-high justify-center min-w-[70px]">
                        <div className="terminal-node !w-6 !h-6 !text-[10px]">
                          <span>{sym}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Table body */}
                  {cykResult.table.map((row, i) => (
                    <div key={i} className="flex gap-1 mb-1">
                      <div className="w-[56px] flex items-center justify-center text-xs text-outline font-bold">
                        len={i + 1}
                      </div>
                      {row.map((cell, j) => {
                        if (j < i) return <div key={j} className="min-w-[70px]" />;
                        
                        const isTopRight = i === 0 && j === cykResult.inputSymbols.length - 1;
                        const hasStart = cell.includes(cnfGrammar?.startSymbol);

                        return (
                          <div
                            key={j}
                            className={`cyk-cell min-w-[70px] ${
                              cell.length > 0 ? 'filled' : ''
                            } ${isTopRight && cykResult.accepted ? 'accepted' : ''
                            } ${isTopRight && !cykResult.accepted ? 'rejected' : ''}`}
                          >
                            <span className={`text-xs font-bold ${
                              hasStart ? 'text-primary' : 'text-on-surface-variant'
                            }`}>
                              {cell.length > 0 ? `{${cell.join(',')}}` : '∅'}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>

              {/* CYK Step Log */}
              <div className="bg-surface-container rounded-2xl p-6 border border-outline-variant/5">
                <h3 className="text-sm font-bold text-on-surface-variant uppercase tracking-widest mb-4">
                  CYK Steps ({cykResult.steps.length})
                </h3>
                <div className="space-y-1.5 max-h-[300px] overflow-y-auto">
                  {cykResult.steps.map((step, i) => (
                    <button
                      key={i}
                      onClick={() => setCykStepIndex(i)}
                      className={`w-full text-left p-2.5 rounded-lg text-xs transition-all ${
                        cykStepIndex === i
                          ? step.type === 'result'
                            ? cykResult.accepted ? 'bg-primary/10 border border-primary/20' : 'bg-error/10 border border-error/20'
                            : 'bg-primary/10 border border-primary/20'
                          : 'hover:bg-surface-container-high'
                      }`}
                    >
                      <span className={`font-medium ${
                        step.type === 'result'
                          ? cykResult.accepted ? 'text-primary' : 'text-error'
                          : 'text-on-surface-variant'
                      }`}>
                        {step.formalDescription || step.gardenDescription}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right: Grammar Reference */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-surface-container-high rounded-2xl p-5 border border-outline-variant/5">
            <h4 className="text-sm font-bold text-on-surface-variant uppercase tracking-widest mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-sm text-primary">account_tree</span>
              CNF Grammar (Reference)
            </h4>
            <ProductionDisplay grammar={cnfGrammar} compact />
          </div>

          {finalGrammar && finalGrammar !== cnfGrammar && (
            <div className="bg-surface-container-high rounded-2xl p-5 border border-outline-variant/5">
              <h4 className="text-sm font-bold text-on-surface-variant uppercase tracking-widest mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-sm text-secondary">terminal</span>
                Final Grammar
              </h4>
              <ProductionDisplay grammar={finalGrammar} compact />
            </div>
          )}

          {/* How CYK Works */}
          <div className="bg-gradient-to-br from-surface-variant to-surface-container-high rounded-2xl p-5 border border-outline-variant/10">
            <h4 className="font-bold text-on-surface mb-3 flex items-center gap-2">
              <span className="material-symbols-outlined text-tertiary">help</span>
              How CYK Works
            </h4>
            <ol className="text-xs text-on-surface-variant space-y-2 list-decimal list-inside leading-relaxed">
              <li><strong className="text-on-surface">Base case:</strong> For each terminal aᵢ, find which variables produce it.</li>
              <li><strong className="text-on-surface">Induction:</strong> For longer substrings, try all splits and see which A → BC matches.</li>
              <li><strong className="text-on-surface">Accept:</strong> If the start symbol is in the top-right cell, the string is in the language!</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
