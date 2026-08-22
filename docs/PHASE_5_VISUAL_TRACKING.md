# Phase 5 — Focus / Visual Tracking Training Engine

## 1. Focus Training Objective
Focus & Attention training expands spatial vigilance and sustained visual attention through two specialized paradigms:
- **Target Search**: Selective visual scanning to locate designated target stimuli amidst dense feature-competing distractors.
- **Visual Tracking**: Multi-object dynamic tracking of a target cue through continuous, procedural spatial swaps across an arena.

---

## 2. Implemented Focus Modes
1. **Target Search (`target_search`)**:
   - Instructed visual target (e.g. `SELECT ▲` in Navy) appears among a dynamically scaled grid of visual distractors (2x2 up to 4x4).
   - Higher tiers introduce single- and dual-feature overlaps (distractors sharing either color or shape with the target) to maximize selective attention load.
2. **Visual Tracking (`visual_tracking`)**:
   - Multiple sleek tokens appear on a radial arena.
   - At the beginning of the round, one token is highlighted as the **Target** (`"FOCUS ON TARGET"`).
   - Target highlight fades into uniform neutral token appearance, and tokens perform a series of trackable coordinate swaps.
   - Upon movement completion, the prompt asks: `"WHERE IS THE TARGET?"`.
   - The user selects the token's final position.

---

## 3. Visual Tracking Task & Movement Generation
Located in [`src/games/focus/focusGenerator.js`](file:///d:/BCA/Project/fullStack/brain-gym-app/src/games/focus/focusGenerator.js):
- **Object Count**: Scales from 3 to 8 objects based on difficulty level.
- **Spatial Geometry**: 8 precomputed angular slots on a circular arena ($R = \text{centerCoord} - (\text{tokenSize}/2 + 10)$).
- **Movement Steps**:
  - Procedural swap steps (2 to 9 swaps).
  - Target object is guaranteed to participate in a high percentage of swaps, moving actively across the field.
  - Coordinate interpolation ensures zero teleportation, zero off-screen positions, and non-overlapping trajectories.
- **Step Durations**: Scales smoothly from 700ms down to 320ms per swap step.

---

## 4. Evaluation Logic
Located in [`src/games/focus/focusEvaluator.js`](file:///d:/BCA/Project/fullStack/brain-gym-app/src/games/focus/focusEvaluator.js):
- Pure evaluation function determining:
  - `isCorrect`: User selected the true final target object / slot.
  - `isMissed`: Decision response deadline expired without touch input.
  - `isFalsePositive`: User selected a distractor token.
  - `responseTimeMs`: Precise timestamp elapsed between movement completion (`query` phase) and user touch.

---

## 5. Scoring Formula
Deterministic formula that strongly rewards high precision and rapid cognitive discrimination:
$$\text{Base Points} = 100$$
$$\text{Speed Bonus} = \max\left(0, \text{round}\left(\frac{\text{Deadline} - \text{Latency}}{10}\right)\right)$$
$$\text{Difficulty Multiplier} = 1 + (\text{Level} - 1) \times 0.1$$
$$\text{Round Score} = \text{round}((\text{Base Points} + \text{Speed Bonus}) \times \text{Difficulty Multiplier} \times \text{Combo Multiplier})$$
- Penalty: Incorrect taps deduct `-40` points (total score minimum capped at `0`).

---

## 6. Combo System & Multipliers
- Consecutive correct responses increment combo count by `+1`.
- Incorrect responses or timeouts reset combo to `0`.
- **Multiplier Breakpoints**:
  - Combo 0–2: `1.0x`
  - Combo 3–5: `1.1x`
  - Combo 6–8: `1.2x`
  - Combo 9–11: `1.3x`
  - Combo 12–14: `1.4x`
  - Combo 15+: `1.5x` (Maximum cap)

---

## 7. Response-Time Calculation
- Measured with millisecond timestamp deltas:
  $$\text{Response Time (ms)} = \text{Date.now()} - \text{taskFinishedAt}$$
- Computed only during the interactive decision phase. Zero hardcoded values.

---

## 8. Adaptive Difficulty Manager
Located in [`src/games/focus/focusDifficulty.js`](file:///d:/BCA/Project/fullStack/brain-gym-app/src/games/focus/focusDifficulty.js):
- Rolling window of the last 5 evaluations:
  - **Level Up**: $\ge 80\%$ accuracy and mean latency $< 80\%$ of deadline.
  - **Level Down**: $< 60\%$ accuracy OR 2 consecutive errors.
  - **Maintain**: Consistent calibrated performance.
- Difficulty tiers scale object counts (3 $\rightarrow$ 8), movement step counts (2 $\rightarrow$ 9), transition speeds (700ms $\rightarrow$ 320ms), and decision deadlines.

---

## 9. Session Architecture
- **Quick Session**: 10 rounds for swift daily cognitive training.
- **Standard Session**: 20 rounds.
- **Endless Session**: Unlimited rounds, continuously generating procedural tasks until the user taps "End Session".

---

## 10. Local Storage Schema
Saved into `@overload/game_sessions` in `AsyncStorage` via [`src/services/storageService.js`](file:///d:/BCA/Project/fullStack/brain-gym-app/src/services/storageService.js):

```json
{
  "id": "session_1740000000000_abc123",
  "sessionId": "session_1740000000000_abc123",
  "gameType": "focus",
  "category": "focus",
  "facultyId": "focus",
  "modeId": "visual_tracking",
  "score": 1180,
  "accuracy": 100,
  "latency": 320,
  "responseTime": 320,
  "span": 4,
  "streak": 7,
  "totalRounds": 10,
  "difficulty": "adaptive",
  "result": "success",
  "completedAt": "2026-08-22T14:15:00.000Z",
  "completedAtLocal": "2026-08-22T14:15:00.000Z",
  "metadata": {
    "span": 4,
    "durationSeconds": 45,
    "isPerfect": true
  }
}
```

---

## 11. Analytics & Multi-Faculty Integration
- [`ProgressScreen.js`](file:///d:/BCA/Project/fullStack/brain-gym-app/src/screens/ProgressScreen.js) displays live telemetry for both **Working Memory** and **Focus & Attention**.
- Focus telemetry updates the Faculty Performance bars, Home sub-metrics, and the composite Cognitive Index (0–1000).

---

## 12. Faculty Progression
- Stored in `@overload/faculties` under key `focus`.
- Derives rolling accuracy, rolling latency, peak score, and faculty tier levels from actual sessions.

---

## 13. Error Handling & Edge-Case Protection
- **Single-Tap Evaluator Lock**: `isEvaluatingRef` prevents duplicate evaluations from rapid double taps.
- **Interactive Guarding**: Tokens cannot be tapped during the `highlight` or `moving` phases.
- **Timer & Animation Cleanup**: Timers and `Animated.timing` animations are safely cleared upon screen unmount.
- **App Pausing**: Pause modal stops elapsed timers and cancels active countdown lines.

---

## 14. Testing & Verification Results
- Android bundle compiled: `1,132 modules` in `2.8s` with `0 errors`.
- Pure JavaScript verification: `0` TypeScript files.
- Go/No-Go completely removed from navigation, UI, and categories.
- Memory & Focus coexistence verified without interference.

---

## 15. Known Limitations
- Subsequent cognitive faculties (`reaction`, `processing`, `decision`, `spatial`, `flexibility`, `logic`) remain available for future phases.
