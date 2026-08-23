# Phase 8 — Decision Making Faculty (Priority Sort, Best Choice, Rule Switch)

## 1. Decision Making Objective
Decision Making trains high-order executive cognitive function: multi-criteria priority evaluation, constraint satisfaction, and dynamic set-shifting rules.
Unlike Reaction Speed (which measures raw motor onset response) and Processing Speed (which measures intake throughput), **Decision Making** requires deliberate value-based selection:

$$\text{EVALUATE} \longrightarrow \text{COMPARE} \longrightarrow \text{WEIGH TRADEOFFS} \longrightarrow \text{DECIDE}$$

The faculty contains **three distinct cognitive decision games**:
1. **Priority Sort (`priority_sort`)**: Evaluate competing real-world task priorities across urgency, importance, deadlines, impacts, and dependencies.
2. **Best Choice (`best_choice`)**: Goal-directed multi-attribute optimization under strict single-solution ambiguity prevention.
3. **Rule Switch (`rule_switch`)**: High-flexibility conditional decision-making under dynamic, shifting rules.

---

## 2. Three Distinct Gameplay Mechanics

```
┌──────────────────────────┬────────────────────────────────────────────────────────────────────────┐
│ Game Mode                │ Unique Interaction & Cognitive Operation                               │
├──────────────────────────┼────────────────────────────────────────────────────────────────────────┤
│ 1. Priority Sort         │ Evaluate competing task cards; determine highest-priority task.        │
│ 2. Best Choice           │ Analyze multi-attribute cards (Value, Cost, Risk); satisfy objective.  │
│ 3. Rule Switch           │ Apply active color-coded conditional rule to numerical options.        │
└──────────────────────────┴────────────────────────────────────────────────────────────────────────┘
```

### Game 1: Priority Sort (`priority_sort`)
- **Interaction**: 3 to 5 task cards displaying realistic actionable items with multi-dimensional criteria:
  - Importance: `CRITICAL` / `HIGH` / `MEDIUM` / `LOW`
  - Urgency: `IMMEDIATE` / `HIGH` / `MEDIUM` / `LOW`
  - Deadline: `10 min` / `15 min` / `45 min` / `3 hours` / `Tomorrow`
  - Impact: `CRITICAL` / `HIGH` / `MEDIUM` / `LOW`
  - Blocking Dependency: `Blocks other tasks`
- **Deterministic Priority Evaluation Algorithm**:
  $$\text{Score} = w_{imp} \cdot I + w_{urg} \cdot U + w_{dl} \cdot D + w_{impct} \cdot M + w_{dep} \cdot B$$
  - Importance Weight ($w_{imp} = 35$): CRITICAL (140), HIGH (105), MEDIUM (70), LOW (35)
  - Urgency Weight ($w_{urg} = 30$): IMMEDIATE (120), HIGH (90), MEDIUM (60), LOW (30)
  - Deadline Weight ($w_{dl} = 25$): $\le 15$m (100), 20–30m (85–95), 45m–1h (70–75), 3h (50), Tomorrow (25)
  - Impact Weight ($w_{impct} = 20$): CRITICAL (80), HIGH (60), MEDIUM (40), LOW (20)
  - Dependency Weight ($w_{dep} = 15$): Blocking ($+45$), Non-blocking ($0$)
- **Strict Ambiguity Prevention**: The scenario is certified valid only when exactly one task achieves the unique maximum priority score.

### Game 2: Best Choice (`best_choice`)
- **Interaction**: Objective banner (e.g. `HIGHEST VALUE WITH COST UNDER 80` or `LOWEST COST WITH VALUE >= 70`) + 3 to 4 multi-attribute option cards.
- **Strict Ambiguity Prevention**: Candidate options are evaluated against the constraint. If `validWinners.length !== 1`, the task is regenerated until exactly one unambiguous optimal choice exists.

### Game 3: Rule Switch (`rule_switch`)
- **Interaction**: Dynamic active rule banner with color-coded conditional modifiers (Navy, Gold, Sage Green, Rose) + numerical option cards.
- **Cognitive Operation**: Set-shifting, task switching, and conditional rule execution:
  - Level 1–3: Simple dynamic rule switches (`LARGER NUMBER` vs `SMALLER NUMBER`).
  - Level 4–6: Color conditional modifiers (`NAVY: LARGER` | `GOLD: SMALLER`).
  - Level 7–10: Multi-conditional modifiers (`SAGE: CLOSEST TO 50` | `ROSE: EVEN NUMBER`).

---

## 3. High-Resolution Timing & Timeout Management
- High-resolution decision latency captured on touch submission:
  $$\text{Decision Latency (ms)} = \text{Date.now()} - \text{roundStartTimeRef.current}$$
- Countdown track visualizes available decision window per round (8500ms down to 2700ms).

---

## 4. Deterministic Scoring Formula
Located in [`src/games/decision/decisionScoring.js`](file:///d:/BCA/Project/fullStack/brain-gym-app/src/games/decision/decisionScoring.js):
$$\text{Base Points} = 100$$
$$\text{Speed Bonus} = \max\left(0, \text{round}\left(\frac{\text{Timeout Window} - \text{Latency}}{15}\right)\right)$$
$$\text{Swift Decision Bonus} = +40 \text{ pts if } \text{Latency} < 1600\text{ms}, \quad +20 \text{ pts if } \text{Latency} < 2500\text{ms}$$
$$\text{Difficulty Multiplier} = 1 + (\text{Level} - 1) \times 0.1$$
$$\text{Round Score} = \text{round}((\text{Base Points} + \text{Speed Bonus} + \text{Swift Bonus}) \times \text{Difficulty Multiplier} \times \text{Combo Multiplier})$$
- Penalties:
  - Incorrect Decision: `-35` pts
  - Timeout: `-30` pts
  - Total score cannot drop below `0`.

---

## 5. Adaptive Difficulty Management
Located in [`src/games/decision/decisionDifficulty.js`](file:///d:/BCA/Project/fullStack/brain-gym-app/src/games/decision/decisionDifficulty.js):
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
  "id": "session_1740000000000_prio123",
  "sessionId": "session_1740000000000_prio123",
  "gameType": "decision",
  "category": "decision",
  "facultyId": "decision",
  "modeId": "priority_sort",
  "score": 1460,
  "accuracy": 100,
  "latency": 1340,
  "responseTime": 1340,
  "totalRounds": 10,
  "difficulty": "adaptive",
  "result": "success",
  "completedAt": "2026-08-22T15:45:00.000Z"
}
```

---

## 7. Build Verification & Cross-Faculty Regression
- **JavaScript Strict Verification**: `0` TypeScript files (`.ts` / `.tsx`).
- **Android Dev Bundle**: `npx expo export --platform android --dev` passed with **1,174 modules and 0 errors**.
- **Coexistence**:
  - Working Memory (4 games)
  - Focus & Attention (2 games)
  - Reaction Speed (3 games)
  - Processing Speed (3 games)
  - Decision Making (3 games)
  - All faculties operate with isolated engines and unified local persistence.
