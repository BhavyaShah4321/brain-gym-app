# Phase 11 — Logic & Reasoning Faculty (Deduction Grid, Sequence Logic, Constraint Solver)

## 1. Logic & Reasoning Objective
Logic & Reasoning trains deductive inference, inductive rule discovery, and multi-condition constraint satisfaction:

$$\text{ANALYZE} \longrightarrow \text{CONNECT INFORMATION} \longrightarrow \text{ELIMINATE IMPOSSIBILITIES} \longrightarrow \text{DEDUCE} \longrightarrow \text{ANSWER}$$

The faculty contains **three distinct, non-overlapping logic games**:
1. **Deduction Grid (`deduction_grid`)**: Analyze persistent logical clues to deduce the single valid mapping of attributes to entities with mathematical certainty.
2. **Sequence Logic (`sequence_logic`)**: Discover arithmetic, multiplicative, alternating, and recurrence transformation rules across numerical sequences.
3. **Constraint Solver (`constraint_solver`)**: Identify the only candidate satisfying multiple simultaneous interacting bounds, parity, divisibility, and digit conditions.

---

## 2. Three Distinct Gameplay Mechanics

```
┌──────────────────────────┬────────────────────────────────────────────────────────────────────────┐
│ Game Mode                │ Unique Interaction & Cognitive Operation                               │
├──────────────────────────┼────────────────────────────────────────────────────────────────────────┤
│ 1. Deduction Grid        │ Read persistent logic clues; deduce entity-attribute assignment.       │
│ 2. Sequence Logic        │ Observe numerical transformation sequence; infer rule and next value. │
│ 3. Constraint Solver     │ Review multi-constraint checklist; pick option satisfying all rules.   │
└──────────────────────────┴────────────────────────────────────────────────────────────────────────┘
```

### Game 1: Deduction Grid (`deduction_grid`)
- **Interaction**:
  - Persistent Clues Card lists 3 to 6 clues (e.g. `• Alex is assigned the Red color.`, `• Ben does NOT have Green.`).
  - Target Question prompts for a specific entity attribute (e.g. `What color is assigned to Ben?`).
  - Player chooses from 3 to 4 candidate options.
- **Deterministic Solver Validation**:
  - `src/games/logic/deductionGrid/deductionGridGenerator.js` tests all permutations of entity-attribute assignments against the clue set before displaying.
  - Guarantees **exactly 1 unique valid solution** ($\text{solutions.length} === 1$).

### Game 2: Sequence Logic (`sequence_logic`)
- **Interaction**:
  - Sequence Ribbon displays the visible progression (e.g. `2 → 4 → 8 → 16 → ?`).
  - 4 candidate numeric options.
  - Player identifies the underlying rule ($\times 2$) and selects the next term ($32$).
- **Rule Archetypes**:
  - Arithmetic ($+d$)
  - Geometric ($\times r$)
  - Second-order difference ($+2, +4, +6$)
  - Alternating ($+a, \times b$)
  - Recurrence / Fibonacci ($a_n = a_{n-1} + a_{n-2}$)

### Game 3: Constraint Solver (`constraint_solver`)
- **Interaction**:
  - Required Constraints Card lists 3 to 5 simultaneous conditions (e.g. `✓ Greater than 20`, `✓ Less than 40`, `✓ Must be even`, `✓ Divisible by 3`).
  - 4 candidate numbers.
  - Player evaluates the options and selects the single option ($24$) satisfying all constraints simultaneously.

---

## 3. High-Resolution Timing & Timeout Management
- Latency recorded per decision:
  $$\text{Response Latency (ms)} = \text{Date.now()} - \text{roundStartTimeRef.current}$$
- Countdown track visualizes available decision window (4800ms–18000ms).

---

## 4. Deterministic Scoring Formula
Located in [`src/games/logic/logicScoring.js`](file:///d:/BCA/Project/fullStack/brain-gym-app/src/games/logic/logicScoring.js):
$$\text{Base Points} = 100$$
$$\text{Speed Bonus} = \max\left(0, \text{round}\left(\frac{\text{Timeout Window} - \text{Latency}}{15}\right)\right)$$
$$\text{Swift Deduction Bonus} = +30 \text{ pts if } \text{Latency} < 2200\text{ms}, \quad +15 \text{ pts if } \text{Latency} < 3800\text{ms}$$
$$\text{Difficulty Multiplier} = 1 + (\text{Level} - 1) \times 0.1$$
$$\text{Round Score} = \text{round}((\text{Base Points} + \text{Speed Bonus} + \text{Deduction Bonus}) \times \text{Difficulty Multiplier} \times \text{Combo Multiplier})$$
- Penalties:
  - Incorrect Decision: `-35` pts
  - Timeout: `-30` pts
  - Total score cannot drop below `0`.

---

## 5. Adaptive Difficulty Management
Located in [`src/games/logic/logicDifficulty.js`](file:///d:/BCA/Project/fullStack/brain-gym-app/src/games/logic/logicDifficulty.js):
- Rolling window of the last 5 rounds:
  - **Level Up**: $\ge 80\%$ accuracy.
  - **Level Down**: $< 60\%$ accuracy OR $\ge 2$ consecutive errors/timeouts.
  - **Maintain**: Calibrated performance.

---

## 6. Local Persistence & Telemetry
Saved to `AsyncStorage` via [`src/services/storageService.js`](file:///d:/BCA/Project/fullStack/brain-gym-app/src/services/storageService.js):
- Stored under `@overload/game_sessions`:
```json
{
  "id": "session_1740000000000_logic012",
  "sessionId": "session_1740000000000_logic012",
  "gameType": "logic",
  "category": "logic",
  "facultyId": "logic",
  "modeId": "deduction_grid",
  "score": 1620,
  "accuracy": 100,
  "latency": 2100,
  "responseTime": 2100,
  "totalRounds": 10,
  "difficulty": "adaptive",
  "result": "success",
  "completedAt": "2026-08-22T16:45:00.000Z"
}
```

---

## 7. Build Verification & Cross-Faculty Regression
- **JavaScript Strict Verification**: `0` TypeScript files (`.ts` / `.tsx`).
- **Android Dev Bundle**: Clean build with 0 errors.
- **Coexistence across 8 Faculties**:
  1. **Working Memory** (4 games): Sequence Recall, Grid Memory, Object Recall, Order Recall.
  2. **Focus & Attention** (2 games): Target Search, Visual Tracking.
  3. **Reaction Speed** (3 games): Target Tap, Rapid Choice, Direction Reaction.
  4. **Processing Speed** (3 games): Symbol Match, Number Scan, Pattern Complete.
  5. **Decision Making** (3 games): Priority Sort, Best Choice, Rule Switch.
  6. **Spatial Reasoning** (3 games): Mental Rotation, Spatial Navigation, Mirror Map.
  7. **Cognitive Flexibility** (3 games): Sort Shift, Pattern Shift, Dual Rule.
  8. **Logic & Reasoning** (3 games): Deduction Grid, Sequence Logic, Constraint Solver.
