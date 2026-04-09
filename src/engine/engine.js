/**
 * ═══════════════════════════════════════════════════════════════
 * THE GRAMMAR ARCHITECT — Conversion Engine
 * ═══════════════════════════════════════════════════════════════
 * 
 * Step-by-step conversion pipeline for teaching CFG normalization.
 * 
 * ┌─────────────────────────────────────────────────────────────┐
 * │  PIPELINE                                                   │
 * │                                                             │
 * │  Context-Free Grammar (CFG)                                 │
 * │    │                                                        │
 * │    ├── Phase 1: GRAMMAR CLEANING                            │
 * │    │   ├── ε-Removal     — Null production elimination      │
 * │    │   ├── Unit Removal  — Unit production elimination      │
 * │    │   └── Useless Removal — Non-generating/unreachable removal │
 * │    │                                                        │
 * │    ├── Phase 2A: CHOMSKY NORMAL FORM (CNF)                  │
 * │    │   ├── Terminal Isolation — Proxy variables for terminals │
 * │    │   └── Binary Reduction   — Breaking rules into A → BC   │
 * │    │                                                        │
 * │    └── Phase 2B: GREIBACH NORMAL FORM (GNF)                 │
 * │        ├── Variable Ranking — Indexing variables A₁...Aₙ    │
 * │        ├── Forward Substitution — Sub Aⱼ where j < i         │
 * │        ├── Left Recursion — Elimination of Aᵢ → Aᵢα         │
 * │        └── Back-Substitution — Ensuring A → aα form         │
 * │                                                             │
 * └─────────────────────────────────────────────────────────────┘
 * 
 * STEP JSON STRUCTURE:
 * ────────────────────
 * Each step in the history array has this shape:
 * 
 * {
 *   id: number,                    // Global step index (0-based)
 *   phase: string,                 // Phase identifier for UI routing
 *   grammar: Grammar,              // Deep-cloned snapshot of the garden at this point
 *   
 *   // WHAT HAPPENED (Technical)
 *   action: string,                // Formal description: "Removed ε-production: A → ε"
 *   
 *   // WHAT HAPPENED (Kid-Friendly)
 *   kidExplanation: string,        // "Seed A was growing into nothing (invisible)! We erased that empty growth."
 *   
 *   // WHAT CHANGED (for UI highlighting)
 *   highlights: {
 *     added: [{lhs, rhs, id}],     // New rules that appeared (glow GREEN 🟢)
 *     removed: [{lhs, rhs, id}],   // Rules that were deleted (glow RED 🔴, then fade)
 *     modified: [{lhs, rhs, id}],  // Rules that changed shape (glow YELLOW 🟡)
 *     focusSeed: string|null,       // Which seed to zoom into / pulse
 *   },
 *   
 *   // PHASE-SPECIFIC METADATA
 *   metadata: {
 *     phaseLabel: string,           // Human-readable phase name
 *     phaseIcon: string,            // Material symbol icon name
 *     ...                           // Phase-specific data (nullable set, ranking, etc.)
 *   },
 * }
 */

import { cloneGrammar } from './grammar.js';

// ═══════════════════════════════════════════════════════════════
// STEP FACTORY
// ═══════════════════════════════════════════════════════════════

let _stepId = 0;

function makeStep(phase, grammar, action, kidExplanation, highlights = {}, metadata = {}) {
  return {
    id: _stepId++,
    phase,
    grammar: cloneGrammar(grammar),
    action,
    kidExplanation,
    highlights: {
      added: highlights.added || [],
      removed: highlights.removed || [],
      modified: highlights.modified || [],
      focusSeed: highlights.focusSeed || null,
    },
    metadata: {
      phaseLabel: metadata.phaseLabel || phase,
      phaseIcon: metadata.phaseIcon || 'eco',
      ...metadata,
    },
  };
}

// ═══════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════

function rhsEqual(a, b) {
  return a.length === b.length && a.every((s, i) => s === b[i]);
}

function hasProduction(prods, lhs, rhs) {
  return (prods[lhs] || []).some(r => rhsEqual(r, rhs));
}

function addProduction(prods, lhs, rhs) {
  if (!prods[lhs]) prods[lhs] = [];
  if (!hasProduction(prods, lhs, rhs)) {
    prods[lhs].push([...rhs]);
    return true;
  }
  return false;
}

function ruleStr(lhs, rhs) {
  return `${lhs} → ${rhs.join(' ')}`;
}

// ═══════════════════════════════════════════════════════════════
// PHASE 1A: ε-REMOVAL (Null Production Elimination)
// ═══════════════════════════════════════════════════════════════
// Eliminated A → ε productions by expanding all rules that use 
// nullable variables. A variable is nullable if A ⇒* ε.

export function removeEpsilon(grammar) {
  const steps = [];
  const g = cloneGrammar(grammar);
  const meta = { phaseLabel: 'ε-Removal', phaseIcon: 'backspace' };

  // ── Step 1: Identify Nullable Variables ──
  // A variable is nullable if it can derive the empty string ε.
  const nullable = new Set();
  let changed = true;
  while (changed) {
    changed = false;
    for (const [lhs, rhsList] of Object.entries(g.productions)) {
      if (nullable.has(lhs)) continue;
      for (const rhs of rhsList) {
        if ((rhs.length === 1 && rhs[0] === 'ε') || rhs.every(s => nullable.has(s))) {
          nullable.add(lhs);
          changed = true;
          break;
        }
      }
    }
  }

  if (nullable.size === 0) {
    steps.push(makeStep('epsilon', g,
      'No ε-productions found. Grammar is already ε-free.',
      '🎉 Great news! None of your seeds grow into nothing. The garden has no invisible growth — it\'s already clean!',
      {}, meta
    ));
    return steps;
  }

  steps.push(makeStep('epsilon', g,
    `Identified nullable variables: {${[...nullable].join(', ')}}. These variables can derive ε.`,
    `🔍 Found that variables **${[...nullable].join(', ')}** are nullable. We must expand all productions that reference them.`,
    { focusSeed: [...nullable][0] },
    { ...meta, nullable: [...nullable] }
  ));

  // ── Step 2: Expand productions containing nullable variables ──
  const newProductions = {};
  for (const v of g.variables) {
    newProductions[v] = [];
  }

  for (const [lhs, rhsList] of Object.entries(g.productions)) {
    for (const rhs of rhsList) {
      if (rhs.length === 1 && rhs[0] === 'ε') continue; // Skip ε rules (we're removing them!)

      // Find which positions in this rule have nullable seeds
      const nullablePositions = [];
      for (let i = 0; i < rhs.length; i++) {
        if (nullable.has(rhs[i])) nullablePositions.push(i);
      }

      if (nullablePositions.length === 0) {
        addProduction(newProductions, lhs, rhs);
        continue;
      }

      // Generate all subsets — each nullable seed is either present or absent
      const subsetCount = 1 << nullablePositions.length;
      const addedForThisRule = [];

      for (let mask = 0; mask < subsetCount; mask++) {
        const newRhs = [];
        for (let i = 0; i < rhs.length; i++) {
          const npIdx = nullablePositions.indexOf(i);
          if (npIdx !== -1 && (mask & (1 << npIdx))) continue; // Skip this nullable seed
          newRhs.push(rhs[i]);
        }
        if (newRhs.length > 0) {
          if (addProduction(newProductions, lhs, newRhs)) {
            addedForThisRule.push({ lhs, rhs: [...newRhs] });
          }
        }
      }

      if (addedForThisRule.length > 0) {
        g.productions = structuredClone(newProductions);

        const nullableInRule = nullablePositions.map(i => rhs[i]);
        steps.push(makeStep('epsilon', g,
          `Expanded ${lhs} → ${rhs.join(' ')}: Added combinations for nullable variable(s) ${nullableInRule.join(', ')}.`,
          `🌱 Variable **${nullableInRule.join(', ')}** in rule "${ruleStr(lhs, rhs)}" is nullable; generated all valid non-ε combinations.`,
          { added: addedForThisRule, focusSeed: lhs },
          meta
        ));
      }
    }
  }

  // ── Step 3: Remove all remaining ε-productions ──
  const removedEpsilons = [];
  for (const [lhs, rhsList] of Object.entries(newProductions)) {
    const before = rhsList.length;
    newProductions[lhs] = rhsList.filter(rhs => !(rhs.length === 1 && rhs[0] === 'ε'));
    if (rhsList.length < before) {
      removedEpsilons.push({ lhs, rhs: ['ε'] });
    }
  }
  // Fix: re-check after filtering
  for (const [lhs, rhsList] of Object.entries(newProductions)) {
    newProductions[lhs] = rhsList.filter(rhs => !(rhs.length === 1 && rhs[0] === 'ε'));
  }

  g.productions = newProductions;

  steps.push(makeStep('epsilon', g,
    `Eliminated all A → ε productions. The grammar is now ε-free.`,
    `✨ ε-Removal complete. All null productions have been eliminated from the grammar.`,
    { removed: removedEpsilons },
    meta
  ));

  return steps;
}

// ═══════════════════════════════════════════════════════════════
// PHASE 1B: UNIT REMOVAL (Unit Production Elimination)
// ═══════════════════════════════════════════════════════════════
// Unit productions A → B where B is a variable are replaced by
// A → α for all B → α where α is not a single variable.

export function removeUnitProductions(grammar) {
  const steps = [];
  const g = cloneGrammar(grammar);
  const meta = { phaseLabel: 'Unit Removal', phaseIcon: 'content_cut' };

  // Find all unit productions (A → B where B ∈ V)
  const unitPairs = [];
  for (const [lhs, rhsList] of Object.entries(g.productions)) {
    for (const rhs of rhsList) {
      if (rhs.length === 1 && g.variables.has(rhs[0]) && lhs !== rhs[0]) {
        unitPairs.push([lhs, rhs[0]]);
      }
    }
  }

  if (unitPairs.length === 0) {
    steps.push(makeStep('unit', g,
      'No unit productions found. Grammar is already unit-free.',
      '🎉 Unit production check complete: No rules of form A → B were found.',
      {}, meta
    ));
    return steps;
  }

  steps.push(makeStep('unit', g,
    `Identified ${unitPairs.length} unit production(s): ${unitPairs.map(p => ruleStr(p[0], [p[1]])).join(', ')}`,
    `✂️ Found ${unitPairs.length} unit production(s) like ${unitPairs[0][0]} → ${unitPairs[0][1]}. We will compute the unit closure for each variable.`,
    { removed: unitPairs.map(p => ({ lhs: p[0], rhs: [p[1]] })) },
    meta
  ));

  // For each seed, compute the UNIT CLOSURE — all seeds reachable through unit chains
  for (const A of g.variables) {
    const closure = new Set([A]);
    let changed = true;
    while (changed) {
      changed = false;
      for (const B of closure) {
        for (const rhs of (g.productions[B] || [])) {
          if (rhs.length === 1 && g.variables.has(rhs[0]) && !closure.has(rhs[0])) {
            closure.add(rhs[0]);
            changed = true;
          }
        }
      }
    }

    // Give A all non-unit rules from every seed in its closure
    const addedRules = [];
    for (const B of closure) {
      if (B === A) continue;
      for (const rhs of (g.productions[B] || [])) {
        if (!(rhs.length === 1 && g.variables.has(rhs[0]))) {
          if (addProduction(g.productions, A, rhs)) {
            addedRules.push({ lhs: A, rhs: [...rhs] });
          }
        }
      }
    }

    if (addedRules.length > 0) {
      const chain = [...closure].filter(s => s !== A);
      steps.push(makeStep('unit', g,
        `Unit closure of ${A}: {${[...closure].join(', ')}}. Substituted rules from closure set.`,
        `🔗 Traced unit production chain for **${A}** through ${chain.join(' → ')} and expanded with original non-unit productions.`,
        { added: addedRules, focusSeed: A },
        { ...meta, variable: A, closure: [...closure] }
      ));
    }
  }

  // Remove all unit productions
  const removed = [];
  for (const [lhs, rhsList] of Object.entries(g.productions)) {
    const before = rhsList.length;
    g.productions[lhs] = rhsList.filter(rhs => !(rhs.length === 1 && g.variables.has(rhs[0])));
    const diff = before - g.productions[lhs].length;
    if (diff > 0) removed.push({ lhs, count: diff });
  }

  steps.push(makeStep('unit', g,
    'Eliminated all unit productions. Grammar is now unit-free.',
    `✂️✨ Unit removal complete. All A → B productions have been eliminated.`,
    { removed: removed.map(r => ({ lhs: r.lhs, rhs: ['(unit production)'] })) },
    meta
  ));

  return steps;
}

// ═══════════════════════════════════════════════════════════════
// PHASE 1C: USELESS REMOVAL (Useless Symbol Elimination)
// ═══════════════════════════════════════════════════════════════
// Elimination of variables that either do not generate a terminal 
// string or are not reachable from the start symbol.

export function removeUselessSymbols(grammar) {
  const steps = [];
  const g = cloneGrammar(grammar);
  const meta = { phaseLabel: 'Weed Puller', phaseIcon: 'compost' };

  // ── Test 1: GENERATING CHECK (bottom-up) ──
  // "Can this seed eventually produce at least one flower?"
  const generating = new Set([...g.terminals]);
  let changed = true;
  while (changed) {
    changed = false;
    for (const [lhs, rhsList] of Object.entries(g.productions)) {
      if (generating.has(lhs)) continue;
      for (const rhs of rhsList) {
        if (rhs.every(s => generating.has(s) || s === 'ε')) {
          generating.add(lhs);
          changed = true;
          break;
        }
      }
    }
  }

  const nonGenerating = [...g.variables].filter(v => !generating.has(v));
  if (nonGenerating.length > 0) {
    for (const v of nonGenerating) {
      g.variables.delete(v);
      delete g.productions[v];
    }
    for (const [lhs, rhsList] of Object.entries(g.productions)) {
      g.productions[lhs] = rhsList.filter(rhs => rhs.every(s => s === 'ε' || generating.has(s)));
    }

    steps.push(makeStep('useless', g,
      `Eliminated non-generating variable(s): {${nonGenerating.join(', ')}}.`,
      `🥀 Variable(s) **${nonGenerating.join(', ')}** cannot derive a string of terminals. Removing them and all dependent rules.`,
      { removed: nonGenerating.map(v => ({ lhs: v, rhs: ['(non-generating)'] })), focusSeed: nonGenerating[0] },
      { ...meta, nonGenerating }
    ));
  }

  // ── Test 2: REACHABLE SYMBOLS ──
  // A symbol X is reachable if S ⇒* αXβ for some α, β ∈ (V ∪ Σ)*.
  const reachable = new Set([g.startSymbol]);
  changed = true;
  while (changed) {
    changed = false;
    for (const v of reachable) {
      for (const rhs of (g.productions[v] || [])) {
        for (const s of rhs) {
          if (!reachable.has(s) && s !== 'ε') {
            reachable.add(s);
            changed = true;
          }
        }
      }
    }
  }

  const unreachable = [...g.variables].filter(v => !reachable.has(v));
  const unreachableFlowers = [...g.terminals].filter(t => !reachable.has(t));

  if (unreachable.length > 0 || unreachableFlowers.length > 0) {
    for (const v of unreachable) { g.variables.delete(v); delete g.productions[v]; }
    for (const t of unreachableFlowers) { g.terminals.delete(t); }

    const all = [...unreachable, ...unreachableFlowers];
    steps.push(makeStep('useless', g,
      `Eliminated unreachable variable(s)/terminal(s): {${all.join(', ')}}.`,
      `🏝️ Symbol(s) **${all.join(', ')}** cannot be reached from the start symbol **${g.startSymbol}**. Removing detected unreachable symbols.`,
      { removed: all.map(v => ({ lhs: v, rhs: ['(unreachable)'] })), focusSeed: unreachable[0] },
      { ...meta, unreachable: all }
    ));
  }

  if (steps.length === 0) {
    steps.push(makeStep('useless', g,
      'No useless symbols detected. All symbols are generating and reachable.',
      '🌿 Useless symbol elimination complete: All symbols in the grammar are valid and reachable.',
      {}, meta
    ));
  }

  return steps;
}

// ═══════════════════════════════════════════════════════════════
// PHASE 2A: CHOMSKY NORMAL FORM (CNF)
// ═══════════════════════════════════════════════════════════════
// A context-free grammar is in CNF if all its production rules 
// are of the form:
//   A → BC (where B, C are variables)
//   A → a  (where a is a terminal)
// ═══════════════════════════════════════════════════════════════

export function convertToCNF(grammar) {
  const steps = [];
  const g = cloneGrammar(grammar);
  let newVarCount = 1;
  const meta = { phaseLabel: 'Chomsky Normal Form', phaseIcon: 'code' };

  function freshSeed(prefix) {
    let name;
    do { name = `${prefix}${newVarCount++}`; } while (g.variables.has(name));
    return name;
  }

  // ── Step A: FLOWER ISOLATION ──
  // "If a rule mixes flowers and seeds (like A → a B c), we need to
  //  isolate each flower by creating a 'proxy seed' that blooms into it.
  //  So 'a' gets a buddy seed C_a where C_a → a."

  const flowerProxy = {}; // flower → proxy seed name

  for (const [lhs, rhsList] of Object.entries(g.productions)) {
    for (let ri = 0; ri < rhsList.length; ri++) {
      const rhs = rhsList[ri];
      if (rhs.length < 2) continue; // Single-symbol rules are fine

      let modified = false;
      const newRhs = rhs.map(sym => {
        if (g.terminals.has(sym)) {
          if (!flowerProxy[sym]) {
            const proxy = `C_${sym}`;
            flowerProxy[sym] = proxy;
            g.variables.add(proxy);
            g.productions[proxy] = [[sym]];

            steps.push(makeStep('cnf_term', g,
              `Created proxy variable ${proxy} → ${sym} for terminal '${sym}'.`,
              `🌱 Terminal **'${sym}'** is part of a non-atomic production. Introduced proxy variable **${proxy}** → ${sym} as per CNF requirements.`,
              { added: [{ lhs: proxy, rhs: [sym] }], focusSeed: proxy },
              { ...meta, terminal: sym, newVar: proxy }
            ));
          }
          modified = true;
          return flowerProxy[sym];
        }
        return sym;
      });

      if (modified) {
        const oldRhs = [...rhs];
        rhsList[ri] = newRhs;

        steps.push(makeStep('cnf_term', g,
          `Modified ${lhs} → ${oldRhs.join(' ')} to use proxy variables.`,
          `🔄 Replaced terminals in rule "${ruleStr(lhs, oldRhs)}" with corresponding proxy variables: "${ruleStr(lhs, newRhs)}".`,
          { removed: [{ lhs, rhs: oldRhs }], added: [{ lhs, rhs: [...newRhs] }], focusSeed: lhs },
          meta
        ));
      }
    }
  }

  // ── Step B: BINARY REDUCTION ──
  // Rules with more than two variables on the RHS are broken 
  // into a sequence of binary productions using new variables.

  for (const [lhs, rhsList] of Object.entries(g.productions)) {
    for (let ri = 0; ri < rhsList.length; ri++) {
      const rhs = rhsList[ri];
      if (rhs.length <= 2) continue;

      const oldRhs = [...rhs];
      const addedRules = [];
      let currentLhs = lhs;
      let remaining = [...rhs];

      while (remaining.length > 2) {
        const hybrid = freshSeed('H');
        g.variables.add(hybrid);
        const first = remaining[0];
        remaining = remaining.slice(1);

        if (currentLhs === lhs) {
          rhsList[ri] = [first, hybrid];
        } else {
          g.productions[currentLhs] = [[first, hybrid]];
        }
        addedRules.push({ lhs: currentLhs, rhs: [first, hybrid] });
        currentLhs = hybrid;
      }
      g.productions[currentLhs] = [remaining];
      addedRules.push({ lhs: currentLhs, rhs: [...remaining] });

      steps.push(makeStep('cnf_bin', g,
        `Reduced ${ruleStr(lhs, oldRhs)} to binary form.`,
        `✂️ LHS variable ${lhs} had ${oldRhs.length} RHS symbols. Decomposed into binary productions: ${addedRules.map(r => `"${ruleStr(r.lhs, r.rhs)}"`).join(', ')}.`,
        { removed: [{ lhs, rhs: oldRhs }], added: addedRules, focusSeed: lhs },
        meta
      ));
    }
  }

  if (steps.length === 0) {
    steps.push(makeStep('cnf_bin', g,
      'Grammar is already in Chomsky Normal Form.',
      '🌺 CNF Validation: All productions already adhere to the form A → BC or A → a.',
      {}, meta
    ));
  }

  return steps;
}

// ═══════════════════════════════════════════════════════════════
// PHASE 2B: GREIBACH NORMAL FORM (GNF)
// ═══════════════════════════════════════════════════════════════
// A CFG is in GNF if all productions are of form A → aα 
// (a terminal followed by zero or more variables).
// ═══════════════════════════════════════════════════════════════

export function convertToGNF(grammar) {
  const steps = [];
  const g = cloneGrammar(grammar);
  const meta = { phaseLabel: 'Greibach Normal Form', phaseIcon: 'local_florist' };

  // ── Step 1: VARIABLE RANKING ──
  // Assign indices to variables. Aim to eliminate productions 
  // Aᵢ → Aⱼγ where j ≤ i.

  const varList = [g.startSymbol, ...[...g.variables].filter(v => v !== g.startSymbol).sort()];
  const rank = {};
  varList.forEach((v, i) => rank[v] = i + 1);

  steps.push(makeStep('gnf_rank', g,
    `Assigned variable order (Ranking): ${varList.map((v, i) => `${v} = i=${i + 1}`).join(', ')}`,
    `🪜 **Variable Ranking!** Assigned numerical indices to variables:\n${varList.map((v, i) => `  Index ${i + 1}: Variable **${v}**`).join('\n')}\n\nWe must now ensure that for Aᵢ → Aⱼγ, j > i.`,
    {},
    { ...meta, phaseLabel: 'Variable Ranking', phaseIcon: 'format_list_numbered', ranking: { ...rank } }
  ));

  let newVarCount = 1;
  function freshStake() {
    let name;
    do { name = `Z${newVarCount++}`; } while (g.variables.has(name));
    return name;
  }

  // ── Step 2: FORWARD SUBSTITUTION ──
  // Systematically substitute productions to ensure that for 
  // all Aᵢ → Aⱼγ, j > i.

  for (let i = 0; i < varList.length; i++) {
    const Ai = varList[i];
    let didSubstitute = true;
    let safetyCounter = 0;

    while (didSubstitute && safetyCounter < 100) {
      didSubstitute = false;
      safetyCounter++;
      const rhsList = g.productions[Ai] || [];

      for (let ri = 0; ri < rhsList.length; ri++) {
        const rhs = rhsList[ri];
        if (rhs.length === 0 || rhs[0] === 'ε') continue;

        const firstSym = rhs[0];
        if (!g.variables.has(firstSym)) continue; // Starts with flower — already good!

        const j = varList.indexOf(firstSym);
        if (j === -1) continue;

        if (j < i) {
          // j < i: The first seed has a LOWER rank — need to substitute to climb!
          const Aj = firstSym;
          const gamma = rhs.slice(1);
          const oldRule = ruleStr(Ai, rhs);

          rhsList.splice(ri, 1);
          ri--;

          const added = [];
          for (const ajRhs of (g.productions[Aj] || [])) {
            const newRhs = [...ajRhs, ...gamma];
            if (addProduction(g.productions, Ai, newRhs)) {
              added.push({ lhs: Ai, rhs: [...newRhs] });
            }
          }

          steps.push(makeStep('gnf_substitute', g,
            `Substituted ${Aj} rules into ${Ai}. Resulted in index j > i.`,
            `🪜 Production "${oldRule}" had Index(first variable) ${j + 1} < Index(${Ai}) ${i + 1}. Applied substitution to satisfy ranking constraint.`,
            { removed: [{ lhs: Ai, rhs: [...rhs] }], added, focusSeed: Ai },
            { ...meta, phaseLabel: 'Forward Substitution', phaseIcon: 'swap_vert', from: Ai, substituted: Aj, rankI: i + 1, rankJ: j + 1 }
          ));

          didSubstitute = true;
          break;
        }
        // j === i: Left recursion — handled in next phase
        // j > i: Already correct — leave it
      }
    }
  }

  // ── Step 3: LEFT RECURSION ELIMINATION ──
  // For Aᵢ → Aᵢα (immediate left recursion), we introduce 
  // a new variable Bᵢ to convert to right recursion.
  // 
  // The Stake Method:
  //   Aᵢ → Aᵢ α₁ | Aᵢ α₂ | β₁ | β₂
  //   becomes:
  //   Aᵢ → β₁ | β₂ | β₁Z | β₂Z
  //   Z  → α₁ | α₂ | α₁Z | α₂Z

  for (let i = 0; i < varList.length; i++) {
    const Ai = varList[i];
    const rhsList = g.productions[Ai] || [];

    const leftRecursive = rhsList.filter(rhs => rhs.length > 0 && rhs[0] === Ai);
    const nonLeftRecursive = rhsList.filter(rhs => rhs.length === 0 || rhs[0] !== Ai);

    if (leftRecursive.length === 0) continue;

    const Z = freshStake(); // The "Stake" variable
    g.variables.add(Z);
    rank[Z] = varList.length + Object.keys(rank).length;

    steps.push(makeStep('gnf_left_recursion', g,
      `Detected immediate left recursion in ${Ai}. Introducing new variable ${Z}.`,
      `🔴 **Left Recursion Detected:** Rule ${Ai} → ${Ai}α found. Introducing new non-terminal **${Z}** to convert it to right recursion.`,
      { modified: leftRecursive.map(r => ({ lhs: Ai, rhs: [...r] })), focusSeed: Ai },
      { ...meta, phaseLabel: 'Left Recursion Elimination', phaseIcon: 'loop', leftRecursiveVar: Ai, newVar: Z, isLeftRecursion: true }
    ));

    const newAiProds = [];
    const newZProds = [];

    for (const beta of nonLeftRecursive) {
      newAiProds.push([...beta]);
      newAiProds.push([...beta, Z]);
    }

    for (const lr of leftRecursive) {
      const alpha = lr.slice(1); // Remove the self-reference
      newZProds.push([...alpha]);
      newZProds.push([...alpha, Z]);
    }

    g.productions[Ai] = newAiProds;
    g.productions[Z] = newZProds;

    steps.push(makeStep('gnf_left_recursion', g,
      `Left recursion removed for ${Ai} using new variable ${Z}.`,
      `🌿 Conversion complete: Variable **${Ai}** no longer derives itself immediately. Rules for **${Ai}** and **${Z}** have been updated to right-recursive forms.`,
      {
        added: [
          ...newAiProds.map(r => ({ lhs: Ai, rhs: [...r] })),
          ...newZProds.map(r => ({ lhs: Z, rhs: [...r] })),
        ],
        removed: leftRecursive.map(r => ({ lhs: Ai, rhs: [...r] })),
        focusSeed: Ai,
      },
      { ...meta, phaseLabel: 'Substitution Step', phaseIcon: 'carpenter', leftRecursiveVar: Ai, newVar: Z }
    ));
  }

  // ── Step 4: BACK-SUBSTITUTION ──
  // Substitute variables back to ensure every production rule
  // starts with a terminal symbol (A → aα).

  const allVars = [...varList, ...[...g.variables].filter(v => !varList.includes(v))];

  for (let i = allVars.length - 2; i >= 0; i--) {
    const Ai = allVars[i];
    let didSub = true;
    let safety = 0;

    while (didSub && safety < 100) {
      didSub = false;
      safety++;
      const rhsList = g.productions[Ai] || [];

      for (let ri = 0; ri < rhsList.length; ri++) {
        const rhs = rhsList[ri];
        if (rhs.length === 0 || rhs[0] === 'ε') continue;
        if (g.terminals.has(rhs[0])) continue; // Already starts with flower ✓

        const firstVar = rhs[0];
        if (!g.variables.has(firstVar)) continue;

        const gamma = rhs.slice(1);
        const oldRule = ruleStr(Ai, rhs);

        rhsList.splice(ri, 1);
        ri--;

        const added = [];
        for (const fvRhs of (g.productions[firstVar] || [])) {
          const newRhs = [...fvRhs, ...gamma];
          if (addProduction(g.productions, Ai, newRhs)) {
            added.push({ lhs: Ai, rhs: [...newRhs] });
          }
        }

        if (added.length > 0) {
          steps.push(makeStep('gnf_backsubstitute', g,
            `Back-substituted ${firstVar} rules into ${Ai}.`,
            `🌸 Every production for **${Ai}** must start with a terminal. Substituted ${firstVar} productions into "${oldRule}" to achieve GNF format.`,
            { removed: [{ lhs: Ai, rhs: [...rhs] }], added, focusSeed: Ai },
            { ...meta, phaseLabel: 'Back-Substitution', phaseIcon: 'replay', from: Ai, substituted: firstVar }
          ));
        }

        didSub = true;
        break;
      }
    }
  }

  // Also back-substitute for Stake variables (Z seeds)
  for (const v of g.variables) {
    if (!varList.includes(v)) {
      let didSub = true;
      let safety = 0;
      while (didSub && safety < 100) {
        didSub = false;
        safety++;
        const rhsList = g.productions[v] || [];
        for (let ri = 0; ri < rhsList.length; ri++) {
          const rhs = rhsList[ri];
          if (rhs.length === 0 || rhs[0] === 'ε') continue;
          if (g.terminals.has(rhs[0])) continue;
          const firstVar = rhs[0];
          if (!g.variables.has(firstVar)) continue;
          const gamma = rhs.slice(1);
          rhsList.splice(ri, 1);
          ri--;
          for (const fvRhs of (g.productions[firstVar] || [])) {
            addProduction(g.productions, v, [...fvRhs, ...gamma]);
          }
          didSub = true;

          steps.push(makeStep('gnf_backsubstitute', g,
            `Back-substituted into new variable ${v} to satisfy GNF.`,
            `🌸 Ensuring that the newly introduced variable **${v}** also starts with a terminal symbol as per Greibach Normal Form rules.`,
            { focusSeed: v },
            { ...meta, phaseLabel: 'Back-Substitution', phaseIcon: 'replay', from: v }
          ));
          break;
        }
      }
    }
  }

  return steps;
}

// ═══════════════════════════════════════════════════════════════
// FULL PIPELINE — Orchestrates all phases
// ═══════════════════════════════════════════════════════════════

export function runFullConversion(grammar, targetForm = 'CNF') {
  _stepId = 0; // Reset step counter
  let allSteps = [];
  let currentGrammar = cloneGrammar(grammar);

  // ── Initial State ──
  allSteps.push(makeStep('input', currentGrammar,
    'Original CFG loaded.',
    `🌱 Loaded Context-Free Grammar with **${currentGrammar.variables.size} Variables**, **${currentGrammar.terminals.size} Terminals**, and **${Object.values(currentGrammar.productions).reduce((s, r) => s + r.length, 0)} Productions**. Ready for normalization.`,
    {},
    { phaseLabel: 'Original Grammar', phaseIcon: 'park' }
  ));

  // ── Phase 1A: ε-Removal ──
  const epsilonSteps = removeEpsilon(currentGrammar);
  allSteps = allSteps.concat(epsilonSteps);
  if (epsilonSteps.length > 0) currentGrammar = cloneGrammar(epsilonSteps[epsilonSteps.length - 1].grammar);

  // ── Phase 1B: Unit Production Removal ──
  const unitSteps = removeUnitProductions(currentGrammar);
  allSteps = allSteps.concat(unitSteps);
  if (unitSteps.length > 0) currentGrammar = cloneGrammar(unitSteps[unitSteps.length - 1].grammar);

  // ── Phase 1C: Useless Symbol Elimination ──
  const uselessSteps = removeUselessSymbols(currentGrammar);
  allSteps = allSteps.concat(uselessSteps);
  if (uselessSteps.length > 0) currentGrammar = cloneGrammar(uselessSteps[uselessSteps.length - 1].grammar);

  // ── Phase 2A: CNF ──
  const cnfSteps = convertToCNF(currentGrammar);
  allSteps = allSteps.concat(cnfSteps);
  if (cnfSteps.length > 0) currentGrammar = cloneGrammar(cnfSteps[cnfSteps.length - 1].grammar);

  if (targetForm === 'GNF') {
    // ── Phase 2B: GNF ──
    const gnfSteps = convertToGNF(currentGrammar);
    allSteps = allSteps.concat(gnfSteps);
  }

  return allSteps;
}
