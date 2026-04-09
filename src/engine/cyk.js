/**
 * CYK Algorithm (Cocke-Younger-Kasami)
 * The membership validator — tests if a string belongs to the language.
 * 
 * Requires grammar in CNF form.
 * Returns step-by-step table filling for visualization.
 */

/**
 * Run CYK algorithm on a CNF grammar
 * @param {Object} grammar - Grammar in CNF
 * @param {string} input - Input string (space-separated terminals or individual chars)
 * @returns {Object} { accepted, table, steps, inputSymbols }
 */
export function runCYK(grammar, input) {
  // Parse input — if space-separated use as-is, otherwise split each char
  const inputSymbols = input.includes(' ')
    ? input.trim().split(/\s+/)
    : input.trim().split('');

  const n = inputSymbols.length;

  if (n === 0) {
    // Check if start symbol derives ε
    const derivesEpsilon = (grammar.productions[grammar.startSymbol] || [])
      .some(rhs => rhs.length === 1 && rhs[0] === 'ε');
    return {
      accepted: derivesEpsilon,
      table: [],
      steps: [],
      inputSymbols: [],
    };
  }

  // Initialize the triangular table: table[i][j] = Set of variables
  // table[i][j] represents which variables can derive the substring from position i to j
  const table = Array.from({ length: n }, () =>
    Array.from({ length: n }, () => new Set())
  );

  const steps = [];

  // Base case: fill diagonal — table[i][i] for each single terminal
  for (let i = 0; i < n; i++) {
    const terminal = inputSymbols[i];
    for (const [lhs, rhsList] of Object.entries(grammar.productions)) {
      for (const rhs of rhsList) {
        if (rhs.length === 1 && rhs[0] === terminal) {
          table[i][i].add(lhs);
        }
      }
    }

    steps.push({
      type: 'base',
      cell: [i, i],
      terminal,
      variables: [...table[i][i]],
      description: `Cell [${i + 1},${i + 1}]: '${terminal}' → {${[...table[i][i]].join(', ') || '∅'}}`,
      gardenDescription: table[i][i].size > 0
        ? `Terminal '${terminal}' recognized by variable(s): {${[...table[i][i]].join(', ')}}`
        : `Terminal '${terminal}' not derived by any variable`,
      tableSnapshot: snapshotTable(table, n),
    });
  }

  // Fill table for substrings of increasing length
  for (let len = 2; len <= n; len++) {
    for (let i = 0; i <= n - len; i++) {
      const j = i + len - 1;

      for (let k = i; k < j; k++) {
        // Try to combine table[i][k] and table[k+1][j]
        for (const B of table[i][k]) {
          for (const C of table[k + 1][j]) {
            // Find all A where A -> B C
            for (const [A, rhsList] of Object.entries(grammar.productions)) {
              for (const rhs of rhsList) {
                if (rhs.length === 2 && rhs[0] === B && rhs[1] === C) {
                  const isNew = !table[i][j].has(A);
                  table[i][j].add(A);

                  if (isNew) {
                    steps.push({
                      type: 'fill',
                      cell: [i, j],
                      split: k,
                      rule: `${A} → ${B} ${C}`,
                      from: [[i, k, B], [k + 1, j, C]],
                      variables: [...table[i][j]],
                      description: `Cell [${i + 1},${j + 1}]: ${A} → ${B}·${C} (split at ${k + 1})`,
                      gardenDescription: `Variable ${A} derives ${B} and ${C} split at index ${k + 1}`,
                      tableSnapshot: snapshotTable(table, n),
                    });
                  }
                }
              }
            }
          }
        }
      }

      if (table[i][j].size === 0 && len <= n) {
        steps.push({
          type: 'empty',
          cell: [i, j],
          variables: [],
          description: `Cell [${i + 1},${j + 1}]: ∅ (no derivation found)`,
          gardenDescription: `No variable derives substring "${inputSymbols.slice(i, j + 1).join('')}"`,
          tableSnapshot: snapshotTable(table, n),
        });
      }
    }
  }

  const accepted = table[0][n - 1].has(grammar.startSymbol);

  steps.push({
    type: 'result',
    accepted,
    cell: [0, n - 1],
    variables: [...table[0][n - 1]],
    description: accepted
      ? `✅ ACCEPTED! ${grammar.startSymbol} ∈ T[1,${n}] — string "${inputSymbols.join('')}" is in the language.`
      : `❌ REJECTED! ${grammar.startSymbol} ∉ T[1,${n}] — string "${inputSymbols.join('')}" is NOT in the language.`,
    gardenDescription: accepted
      ? `ACCEPTED: String "${inputSymbols.join('')}" is derived from the start symbol ${grammar.startSymbol}!`
      : `REJECTED: String "${inputSymbols.join('')}" cannot be derived by this grammar.`,
    tableSnapshot: snapshotTable(table, n),
  });

  return {
    accepted,
    table: snapshotTable(table, n),
    steps,
    inputSymbols,
  };
}

/**
 * Create a serializable snapshot of the CYK table
 */
function snapshotTable(table, n) {
  return table.map(row =>
    row.map(cell => [...cell])
  );
}
