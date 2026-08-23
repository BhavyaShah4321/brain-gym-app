# Phase 12 — Mind Rush: Cognitive Arcade Experience (Blast Logic, Chain Reaction, Boss Breaker)

## 1. Mind Rush Product Positioning
**Mind Rush** provides a fast-paced, high-octane cognitive arcade experience within the OVERLOAD ecosystem without replacing the core training faculties:

$$\text{"Fast-paced cognitive challenges designed to keep your mind engaged."}$$

```
OBSERVE → THINK → CHOOSE → ATTACK → EXPLOSION / CASCADE → REWARD → NEXT CHALLENGE
```

---

## 2. Three Distinct Arcade Combat Modes

```
┌──────────────────────────┬────────────────────────────────────────────────────────────────────────┐
│ Arcade Mode              │ Gameplay Interaction & Cognitive Mechanism                             │
├──────────────────────────┼────────────────────────────────────────────────────────────────────────┤
│ 1. Blast Logic           │ Multi-target arena; tap targets matching active rule to detonate them. │
│ 2. Chain Reaction        │ Network of nodes; tap the root node to trigger cascading explosions.   │
│ 3. Boss Breaker          │ Flagship boss fight; solve cognitive shield locks to launch attacks.   │
└──────────────────────────┴────────────────────────────────────────────────────────────────────────┘
```

### Game 1: Blast Logic (`blast_logic`)
- **Interaction**: Floating targets in the arena containing numbers, colors, and shapes.
- **Rule Banner**: Dynamic multi-attribute rules (`BLAST NUMBERS DIVISIBLE BY 3`, `EVEN NUMBERS`, `RED TARGETS > 30`, `TRIANGLE SHAPES`).
- **Explosion Feedback**: Tapping a valid target detonates it 💥, escalating the combo multiplier and charging the energy meter.

### Game 2: Chain Reaction (`chain_reaction`)
- **Interaction**: Interconnected network of energy nodes ($A \rightarrow B \rightarrow C \rightarrow D$).
- **Rule Prompt**: "START CHAIN WITH THE SMALLEST EVEN NODE" or "TRIGGER FROM PRIME NODE".
- **Cascading Detonation**: Tapping the correct root node initiates a chain reaction across all connected nodes in sequence, awarding `CHAIN x4` or `CHAIN x5` combo bonuses.

### Game 3: Boss Breaker (`boss_breaker`)
- **Flagship Boss Encounter**: Fight against **Cyber-Titan Core** ($500$ Boss HP across 5 shield barriers).
- **Player Health**: $100$ HP (failed attacks / timeouts result in $-20$ HP counter-attacks).
- **Phased Shield Challenges**:
  - Phase 1: Parity & Divisibility strike.
  - Phase 2: Sequence Logic transformation.
  - Phase 3: Spatial / Symbol Odd-one-out vulnerability.
  - Phase 4: Multi-Constraint solver strike.
  - Phase 5: Core Overload final strike.
- **Energy & Special Attack**: Reaching $100\%$ energy unlocks the **SPECIAL ATTACK** dealing critical damage ($200$ HP) to break shields instantly.

---

## 3. High-Resolution Timing & Timeout Management
- Latency recorded per decision:
  $$\text{Response Latency (ms)} = \text{Date.now()} - \text{roundStartTimeRef.current}$$
- Countdown track visualizes available strike window (3600ms–12000ms).

---

## 4. Deterministic Arcade Scoring Formula
Located in [`src/games/mindRush/mindRushScoring.js`](file:///d:/BCA/Project/fullStack/brain-gym-app/src/games/mindRush/mindRushScoring.js):
$$\text{Base Points} = 150$$
$$\text{Speed Bonus} = \max\left(0, \text{round}\left(\frac{\text{Timeout Window} - \text{Latency}}{12}\right)\right)$$
$$\text{Combat Killstreak Bonus} = +50 \text{ pts on combo } \ge 5, \quad +100 \text{ pts on combo } \ge 10$$
$$\text{Difficulty Multiplier} = 1 + (\text{Level} - 1) \times 0.15$$
$$\text{Combo Multiplier} = 1.0\text{x} \text{ up to } 2.0\text{x}$$
$$\text{Round Score} = \text{round}((\text{Base Points} + \text{Speed Bonus} + \text{Killstreak Bonus}) \times \text{Difficulty Multiplier} \times \text{Combo Multiplier})$$

---

## 5. Local Persistence & Telemetry
Saved to `AsyncStorage` via [`src/services/storageService.js`](file:///d:/BCA/Project/fullStack/brain-gym-app/src/services/storageService.js):
- Stored under `@overload/game_sessions`:
```json
{
  "id": "session_1740000000000_rush012",
  "sessionId": "session_1740000000000_rush012",
  "gameType": "mind-rush",
  "category": "mind_rush",
  "facultyId": "mind-rush",
  "modeId": "boss_breaker",
  "score": 2450,
  "accuracy": 100,
  "latency": 1420,
  "responseTime": 1420,
  "streak": 8,
  "totalRounds": 5,
  "difficulty": "adaptive",
  "result": "success",
  "completedAt": "2026-08-22T17:15:00.000Z"
}
```

---

## 6. Build Verification & Cross-Faculty Regression
- **JavaScript Strict Verification**: `0` TypeScript files (`.ts` / `.tsx`).
- **Android Dev Bundle**: Clean build with 0 errors.
- **Coexistence of Core Faculties + Mind Rush**:
  1. **Working Memory** (4 games): Sequence Recall, Grid Memory, Object Recall, Order Recall.
  2. **Focus & Attention** (2 games): Target Search, Visual Tracking.
  3. **Reaction Speed** (3 games): Target Tap, Rapid Choice, Direction Reaction.
  4. **Processing Speed** (3 games): Symbol Match, Number Scan, Pattern Complete.
  5. **Decision Making** (3 games): Priority Sort, Best Choice, Rule Switch.
  6. **Spatial Reasoning** (3 games): Mental Rotation, Spatial Navigation, Mirror Map.
  7. **Cognitive Flexibility** (3 games): Sort Shift, Pattern Shift, Dual Rule.
  8. **Logic & Reasoning** (3 games): Deduction Grid, Sequence Logic, Constraint Solver.
  9. **Mind Rush Arcade** (3 games): Blast Logic, Chain Reaction, Boss Breaker.
