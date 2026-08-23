# Phase 10 — Cognitive Flexibility Faculty (Sort Shift, Pattern Shift, Dual Rule)

## 1. Cognitive Flexibility Objective
Cognitive Flexibility trains the mental ability to abandon outdated strategies, rapidly adapt to shifting rules, detect mid-sequence structural transitions, and dispatch correct rules based on environmental context:

$$\text{APPLY} \longrightarrow \text{DETECT CHANGE} \longrightarrow \text{SHIFT MENTAL SET} \longrightarrow \text{ADAPT} \longrightarrow \text{APPLY NEW RULE}$$

The faculty contains **three distinct, non-overlapping cognitive flexibility games**:
1. **Sort Shift (`sort_shift`)**: Rapidly switch sorting dimensions (Color $\leftrightarrow$ Shape $\leftrightarrow$ Size) as global rules transition without warning.
2. **Pattern Shift (`pattern_shift`)**: Detect structural rule transitions mid-sequence and predict succeeding symbols following the new rule.
3. **Dual Rule (`dual_rule`)**: Evaluate contextual conditioning cues (e.g. Blue $\rightarrow$ Shape, Red $\rightarrow$ Number) and execute the appropriate rule branch.

---

## 2. Three Distinct Gameplay Mechanics

```
┌──────────────────────────┬────────────────────────────────────────────────────────────────────────┐
│ Game Mode                │ Unique Interaction & Cognitive Operation                               │
├──────────────────────────┼────────────────────────────────────────────────────────────────────────┤
│ 1. Sort Shift            │ Classify multi-attribute stimulus card by active global sorting rule.  │
│ 2. Pattern Shift         │ Detect mid-sequence rule change; select item completing new pattern.   │
│ 3. Dual Rule             │ Evaluate contextual condition (Color cue); dispatch matching rule.     │
└──────────────────────────┴────────────────────────────────────────────────────────────────────────┘
```

### Game 1: Sort Shift (`sort_shift`)
- **Interaction**:
  - Global Rule Banner displays currently active sorting dimension (e.g. `SORT BY COLOR` or `SORT BY SHAPE`).
  - Stimulus card displays multi-attribute figure (Color, Shape, Size).
  - Player taps the corresponding category option.
- **Mental Set Shifting**:
  - Rule shifts periodically (every 2–4 trials) or upon difficulty scaling.
  - The engine tracks both overall accuracy and **Rule-Switch Trial Accuracy** (performance on the immediate trial following a rule change).

### Game 2: Pattern Shift (`pattern_shift`)
- **Interaction**:
  - Sequence presentation displays an initial rule phase (e.g. `[●, ○, ●, ○]`) followed by a mid-sequence structural shift (e.g. `[■, ■, ■, ?]`).
  - Player selects the single candidate card that correctly continues the *new* pattern rule.
- **Cognitive Operation**: Transition detection, cognitive un-sticking, and predictive rule adaptation.

### Game 3: Dual Rule (`dual_rule`)
- **Interaction**:
  - Context Key: `BLUE = SHAPE | RED = NUMBER | GOLD = COLOR`.
  - Conditioned stimulus card with background tint matching the context and containing a quantity of shapes.
  - Player determines the active rule branch and selects the matching response option.
- **Cognitive Operation**: Contextual dispatching, conditional branching, and multi-rule maintenance.

---

## 3. High-Resolution Timing & Timeout Management
- Latency recorded per decision:
  $$\text{Response Latency (ms)} = \text{Date.now()} - \text{roundStartTimeRef.current}$$
- Countdown track visualizes available decision window (3200ms–8500ms).

---

## 4. Deterministic Scoring Formula
Located in [`src/games/flexibility/flexibilityScoring.js`](file:///d:/BCA/Project/fullStack/brain-gym-app/src/games/flexibility/flexibilityScoring.js):
$$\text{Base Points} = 100$$
$$\text{Speed Bonus} = \max\left(0, \text{round}\left(\frac{\text{Timeout Window} - \text{Latency}}{15}\right)\right)$$
$$\text{Rule Switch Mastery Bonus} = +40 \text{ pts if trial is a Rule Shift and correct}$$
$$\text{Difficulty Multiplier} = 1 + (\text{Level} - 1) \times 0.1$$
$$\text{Round Score} = \text{round}((\text{Base Points} + \text{Speed Bonus} + \text{Switch Bonus}) \times \text{Difficulty Multiplier} \times \text{Combo Multiplier})$$
- Penalties:
  - Incorrect Decision: `-35` pts
  - Timeout: `-30` pts
  - Total score cannot drop below `0`.

---

## 5. Adaptive Difficulty Management
Located in [`src/games/flexibility/flexibilityDifficulty.js`](file:///d:/BCA/Project/fullStack/brain-gym-app/src/games/flexibility/flexibilityDifficulty.js):
- Rolling window of the last 5 rounds:
  - **Level Up**: $\ge 80\%$ accuracy and consistent rule-switch performance.
  - **Level Down**: $< 60\%$ accuracy OR $\ge 2$ consecutive errors/timeouts.
  - **Maintain**: Calibrated performance.

---

## 6. Local Persistence & Telemetry
Saved to `AsyncStorage` via [`src/services/storageService.js`](file:///d:/BCA/Project/fullStack/brain-gym-app/src/services/storageService.js):
- Stored under `@overload/game_sessions`:
```json
{
  "id": "session_1740000000000_flex012",
  "sessionId": "session_1740000000000_flex012",
  "gameType": "flexibility",
  "category": "flexibility",
  "facultyId": "flexibility",
  "modeId": "sort_shift",
  "score": 1590,
  "accuracy": 100,
  "ruleSwitchAccuracy": 100,
  "latency": 980,
  "responseTime": 980,
  "totalRounds": 10,
  "difficulty": "adaptive",
  "result": "success",
  "completedAt": "2026-08-22T16:30:00.000Z"
}
```

---

## 7. Build Verification & Cross-Faculty Regression
- **JavaScript Strict Verification**: `0` TypeScript files (`.ts` / `.tsx`).
- **Android Dev Bundle**: Clean build with 0 errors.
- **Coexistence across 7 Faculties**:
  1. **Working Memory** (4 games): Sequence Recall, Grid Memory, Object Recall, Order Recall.
  2. **Focus & Attention** (2 games): Target Search, Visual Tracking.
  3. **Reaction Speed** (3 games): Target Tap, Rapid Choice, Direction Reaction.
  4. **Processing Speed** (3 games): Symbol Match, Number Scan, Pattern Complete.
  5. **Decision Making** (3 games): Priority Sort, Best Choice, Rule Switch.
  6. **Spatial Reasoning** (3 games): Mental Rotation, Spatial Navigation, Mirror Map.
  7. **Cognitive Flexibility** (3 games): Sort Shift, Pattern Shift, Dual Rule.
