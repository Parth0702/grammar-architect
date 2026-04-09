/**
 * Production Display — Renders grammar rules with Variable 🟢 / Terminal 💠 badges
 * Shows the visual mapping: Variables → primary circles, Terminals → secondary diamonds
 */

export default function ProductionDisplay({ grammar, highlights = {}, compact = false }) {
  if (!grammar) return null;

  const ordered = [grammar.startSymbol, ...[...grammar.variables].filter(v => v !== grammar.startSymbol).sort()];

  const addedSet = new Set((highlights.added || []).map(p => `${p.lhs}→${p.rhs.join(' ')}`));
  const removedSet = new Set((highlights.removed || []).map(p => `${p.lhs}→${p.rhs.join(' ')}`));
  const modifiedSet = new Set((highlights.modified || []).map(p => `${p.lhs}→${p.rhs.join(' ')}`));

  return (
    <div className={`space-y-2.5 ${compact ? 'text-sm' : ''}`}>
      {ordered.map(variable => {
        const rhsList = grammar.productions[variable];
        if (!rhsList || rhsList.length === 0) return null;

        const isFocused = highlights.focusSeed === variable;

        return (
          <div key={variable} className={`flex flex-wrap items-start gap-2 p-2 rounded-xl transition-all ${
            isFocused ? 'bg-primary/5 ring-1 ring-primary/20' : ''
          }`}>
            <div className={`variable-node flex-shrink-0 ${isFocused ? '!shadow-[0_0_20px_rgba(195,255,156,0.5)] scale-110' : ''}`}
              title={`Variable (Non-terminal): ${variable}`}>
              {variable}
            </div>
            <span className="text-on-surface-variant font-bold self-center text-lg">→</span>
            <div className="flex flex-wrap gap-1.5 items-center flex-1">
              {rhsList.map((rhs, idx) => {
                const key = `${variable}→${rhs.join(' ')}`;
                const isAdded = addedSet.has(key);
                const isRemoved = removedSet.has(key);
                const isModified = modifiedSet.has(key);

                return (
                  <span key={idx} className="contents">
                    {idx > 0 && <span className="text-outline font-bold mx-1">|</span>}
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all duration-300
                      ${isAdded ? 'step-added bg-primary/15 border border-primary/30 ring-1 ring-primary/20' :
                        isRemoved ? 'step-removed bg-error/15 border border-error/30' :
                        isModified ? 'step-modified bg-tertiary/15 border border-tertiary/30' :
                        'bg-surface-container border border-outline-variant/10'
                      }`}
                      title={isAdded ? '✨ NEW — this rule was just added!' :
                             isRemoved ? '🗑️ REMOVED — this rule was just deleted!' :
                             isModified ? '🔄 MODIFIED — this rule just changed!' : ''}
                    >
                      {rhs.map((sym, si) => (
                        <span key={si}>
                          {sym === 'ε' ? (
                            <span className="text-outline-variant italic" title="Epsilon — empty string">ε</span>
                          ) : grammar.variables.has(sym) ? (
                            <span className="text-primary font-bold" title={`Variable: ${sym}`}>{sym}</span>
                          ) : (
                            <span className="text-secondary font-bold" title={`Terminal: ${sym}`}>{sym}</span>
                          )}
                        </span>
                      ))}
                    </span>
                  </span>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
