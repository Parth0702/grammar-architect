/**
 * ═══════════════════════════════════════════════════════════════
 * THE GRAMMAR ARCHITECT — Grammar Data Structure & Parser
 * ═══════════════════════════════════════════════════════════════
 * 
 * Object-Oriented Metaphor Mapping:
 * ─────────────────────────────────
 *   The Garden   = The entire Grammar (G)
 *   Seeds        = Non-terminals / Variables (V)  — Uppercase: S, A, B
 *   Flowers      = Terminals (Σ)                  — Lowercase: a, b, c
 *   Growth Rules = Productions (P)                — How seeds transform
 *   Start Seed   = Start Symbol (S)               — The root of the garden
 * 
 * Each seed can 'grow' into other seeds or 'bloom' into flowers.
 * Flowers are the final state — they stop growing.
 */

// ═══════════════════════════════════════════════════════════════
// UNIQUE ID GENERATION
// ═══════════════════════════════════════════════════════════════

let _idCounter = 0;
export function nextId(prefix = 'rule') {
  return `${prefix}_${++_idCounter}`;
}
export function resetIdCounter() {
  _idCounter = 0;
}

// ═══════════════════════════════════════════════════════════════
// GRAMMAR OBJECT FACTORY
// ═══════════════════════════════════════════════════════════════

/**
 * Create a new Garden (Grammar) object.
 * 
 * @param {Iterable<string>} seeds      - Set of non-terminals (V)
 * @param {Iterable<string>} flowers    - Set of terminals (Σ)
 * @param {Object}           growthRules - Map<string, string[][]> — productions (P)
 * @param {string}           startSeed   - Start symbol
 * @returns {Object} Grammar / "Garden"
 */
export function createGrammar(seeds, flowers, growthRules, startSeed) {
  return {
    variables: new Set(seeds),        // Seeds 🌱
    terminals: new Set(flowers),      // Flowers 🌸
    productions: structuredClone(growthRules), // Growth Rules 🌿
    startSymbol: startSeed,           // Start Seed (the root)
  };
}

/**
 * Deep-clone a Garden for immutable step history.
 * Every step gets its own snapshot so the UI can time-travel.
 */
export function cloneGrammar(g) {
  const prods = {};
  for (const [lhs, rhsList] of Object.entries(g.productions)) {
    prods[lhs] = rhsList.map(rhs => [...rhs]);
  }
  return {
    variables: new Set(g.variables),
    terminals: new Set(g.terminals),
    productions: prods,
    startSymbol: g.startSymbol,
  };
}

// ═══════════════════════════════════════════════════════════════
// GRAMMAR PARSER — Converts text to a Garden object
// ═══════════════════════════════════════════════════════════════

/**
 * Parse user input text into a Grammar (Garden) object.
 * 
 * Expected format (one growth rule per line):
 *   S -> A B | a
 *   A -> a A | ε
 *   B -> b
 * 
 * Conventions:
 *   - Uppercase letters (or multi-char starting with uppercase) = Seeds (Variables)
 *   - Lowercase letters = Flowers (Terminals)
 *   - ε or epsilon = empty/null production ("invisible growth")
 *   - | separates alternative growth paths
 *   - -> or → separates the seed (LHS) from what it grows into (RHS)
 *   - Spaces separate symbols on the RHS
 * 
 * @param {string} text - Raw grammar text input
 * @returns {Object} Grammar object
 * @throws {Error} If input is invalid
 */
export function parseGrammar(text) {
  const lines = text.trim().split('\n').filter(l => l.trim().length > 0);

  if (lines.length === 0) {
    throw new Error('🌱 No growth rules found! Please enter at least one rule like "S -> a B"');
  }

  const variables = new Set();
  const terminals = new Set();
  const productions = {};
  let startSymbol = null;

  for (const line of lines) {
    // Split on -> or →
    const arrowMatch = line.match(/^(.+?)\s*(?:->|→)\s*(.+)$/);
    if (!arrowMatch) {
      throw new Error(
        `🌿 Invalid growth rule: "${line}"\n` +
        `Expected format: "A -> B C | a"\n` +
        `Use -> or → to separate the seed from what it grows into.`
      );
    }

    const lhs = arrowMatch[1].trim();
    const rhsText = arrowMatch[2].trim();

    // Validate LHS is a valid seed name (uppercase start)
    if (!lhs || !/^[A-Z][A-Z0-9'_]*$/.test(lhs)) {
      throw new Error(
        `🌱 Invalid seed name: "${lhs}"\n` +
        `Seeds (variables) must start with an UPPERCASE letter.\n` +
        `Examples: S, A, B, S', X1`
      );
    }

    variables.add(lhs);
    if (startSymbol === null) startSymbol = lhs;

    // Parse alternatives (separated by |)
    const alternatives = rhsText.split(/\s*\|\s*/);
    if (!productions[lhs]) productions[lhs] = [];

    for (const alt of alternatives) {
      const trimmed = alt.trim();
      if (!trimmed) {
        throw new Error(`🌸 Empty alternative found in rule for ${lhs}. Each | must have something on both sides.`);
      }

      if (trimmed === 'ε' || trimmed === 'epsilon' || trimmed === "''") {
        // Epsilon production — seed turns into "nothing"
        productions[lhs].push(['ε']);
      } else {
        const symbols = trimmed.split(/\s+/);
        for (const sym of symbols) {
          if (!sym) continue;
          if (/^[A-Z]/.test(sym)) {
            variables.add(sym); // It's a seed
          } else if (/^[a-z0-9]/.test(sym)) {
            terminals.add(sym); // It's a flower
          } else {
            throw new Error(
              `🌿 Unknown symbol: "${sym}" in rule "${line}"\n` +
              `Seeds must start with uppercase (A, B, S).\n` +
              `Flowers must start with lowercase (a, b, c).`
            );
          }
        }
        productions[lhs].push(symbols);
      }
    }
  }

  // ─── VALIDATION ───

  // Check that start symbol is defined
  if (!startSymbol) {
    throw new Error('🌱 No start seed found! The first rule defines the start seed.');
  }

  // Check for undefined seeds (referenced but never on the LHS)
  const definedSeeds = new Set(Object.keys(productions));
  const allReferencedSeeds = new Set();
  for (const [, rhsList] of Object.entries(productions)) {
    for (const rhs of rhsList) {
      for (const sym of rhs) {
        if (sym !== 'ε' && /^[A-Z]/.test(sym)) {
          allReferencedSeeds.add(sym);
        }
      }
    }
  }

  const undefinedSeeds = [...allReferencedSeeds].filter(s => !definedSeeds.has(s));
  if (undefinedSeeds.length > 0) {
    // Add them as variables but warn — they're useless but valid CFG
    for (const s of undefinedSeeds) {
      variables.add(s);
      if (!productions[s]) productions[s] = [];
    }
  }

  // Check that at least one production exists
  const totalRules = Object.values(productions).reduce((sum, rhs) => sum + rhs.length, 0);
  if (totalRules === 0) {
    throw new Error('🌿 No growth rules found! Every seed needs at least one growth rule.');
  }

  // Check that we have at least one terminal (flower)
  if (terminals.size === 0) {
    throw new Error(
      '🌸 No flowers (terminals) found!\n' +
      'A grammar needs at least one flower (lowercase symbol) to be meaningful.'
    );
  }

  return createGrammar(variables, terminals, productions, startSymbol);
}

// ═══════════════════════════════════════════════════════════════
// GRAMMAR SERIALIZATION
// ═══════════════════════════════════════════════════════════════

/**
 * Convert a Garden back to human-readable text.
 */
export function grammarToString(g) {
  const lines = [];
  const ordered = [g.startSymbol, ...[...g.variables].filter(v => v !== g.startSymbol).sort()];
  for (const v of ordered) {
    if (g.productions[v] && g.productions[v].length > 0) {
      const alts = g.productions[v].map(rhs => rhs.join(' ')).join(' | ');
      lines.push(`${v} → ${alts}`);
    }
  }
  return lines.join('\n');
}

/**
 * Get a flat list of all individual growth rules as objects.
 */
export function getProductionList(g) {
  const list = [];
  const ordered = [g.startSymbol, ...[...g.variables].filter(v => v !== g.startSymbol).sort()];
  for (const v of ordered) {
    if (g.productions[v]) {
      for (const rhs of g.productions[v]) {
        list.push({ lhs: v, rhs: [...rhs], id: nextId('rule') });
      }
    }
  }
  return list;
}

// ═══════════════════════════════════════════════════════════════
// SYMBOL TYPE CHECKS
// ═══════════════════════════════════════════════════════════════

/** Is this symbol a Seed (non-terminal/variable)? */
export function isSeed(sym, g) { return g.variables.has(sym); }

/** Is this symbol a Flower (terminal)? */
export function isFlower(sym, g) { return g.terminals.has(sym); }

/** Is this a Seed name? (starts with uppercase, used without grammar context) */
export function looksLikeSeed(sym) { return /^[A-Z]/.test(sym); }

/** Is this a Flower name? (starts with lowercase, used without grammar context) */
export function looksLikeFlower(sym) { return /^[a-z0-9]/.test(sym) && sym !== 'ε'; }

// ═══════════════════════════════════════════════════════════════
// NORMAL FORM VALIDATORS
// ═══════════════════════════════════════════════════════════════

/**
 * Check if a Garden is in CNF (The "Symmetry Rule"):
 *  - Every rule is either A → BC (two seeds) or A → a (one flower)
 *  - S → ε allowed only if S never appears on any RHS
 */
export function isCNF(g) {
  for (const [lhs, rhsList] of Object.entries(g.productions)) {
    for (const rhs of rhsList) {
      if (rhs.length === 1 && rhs[0] === 'ε' && lhs === g.startSymbol) continue;
      if (rhs.length === 1 && g.terminals.has(rhs[0])) continue;        // A → a ✓ (Single Bloom)
      if (rhs.length === 2 && g.variables.has(rhs[0]) && g.variables.has(rhs[1])) continue; // A → BC ✓ (Binary Growth)
      return false;
    }
  }
  return true;
}

/**
 * Check if a Garden is in GNF (The "Instant Bloom Rule"):
 *  - Every rule is A → a α where a is a flower and α is zero or more seeds
 *  - S → ε allowed only if S never appears on any RHS
 */
export function isGNF(g) {
  for (const [lhs, rhsList] of Object.entries(g.productions)) {
    for (const rhs of rhsList) {
      if (rhs.length === 0) return false;
      if (rhs[0] === 'ε' && lhs === g.startSymbol) continue;
      if (!g.terminals.has(rhs[0])) return false;  // Must START with a flower
      for (let i = 1; i < rhs.length; i++) {
        if (!g.variables.has(rhs[i])) return false; // Everything after must be seeds
      }
    }
  }
  return true;
}

// ═══════════════════════════════════════════════════════════════
// EXAMPLE GRAMMARS (Pre-planted Gardens)
// ═══════════════════════════════════════════════════════════════

export const EXAMPLE_GRAMMARS = {
  'Simple Garden (3 Seeds)': `S -> A B | a
A -> a A | ε
B -> b B | b`,

  'With Middlemen (Unit Rules)': `S -> A B
A -> B | a
B -> C | b
C -> a`,

  'Mirror Loop (Left Recursive)': `S -> S a | A b | a
A -> S c | d`,

  'Classic Textbook': `S -> A S B | ε
A -> a A S | a
B -> S b S | A | b b`,

  'Arithmetic Expressions': `E -> E T | T
T -> T F | F
F -> a`,
};
