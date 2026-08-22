# Phase 5 — Focus / Selective Attention Training Engine

## 1. Focus Training Objective
Focus & Attention training expands cognitive resilience against distraction through:
- **Selective Attention**: Rapid visual scanning to identify designated target cues in dense distractor arrays.
- **Distractor Suppression**: Filtering competing chromatic and geometric noise under time constraints.
- **Inhibitory Motor Control**: Rapid reaction execution on valid target stimuli ("Go") paired with strictly withholding motor actions on non-target stimuli ("No-Go").

---

## 2. Implemented Game Modes
1. **Target Search (`target_search`)**:
   - Instructed visual target (e.g. `SELECT ▲` in Navy) appears among a dynamically scaled grid of visual distractors (2x2 up to 4x4).
   - Higher levels introduce single and dual-feature overlaps (distractors sharing either color or shape with the target) to maximize selective attention load.
2. **Inhibitory Go / No-Go (`go_no_go`)**:
   - Fast serial presentation where green target stimuli require immediate tapping ("GO"), and red distractor stimuli require strictly withholding response ("NO-GO").
   - Calibrates reaction latency and impulse inhibition.

---

## 3. Infinite Task Generation
Located in [`src/games/focus/focusGenerator.js`](file:///d:/BCA/Project/fullStack/brain-gym-app/src/games/focus/focusGenerator.js):
- Pure mathematical generation without fixed question banks.
- Computes target coordinates, feature matrices (shapes: `▲`, `■`, `●`, `◆`, `★`, `⬢`, `▼`, `✚`; luxury color tokens), and response deadlines based on the player's active difficulty tier.

---

## 4. Evaluation Logic
Located in [`src/games/focus/focusEvaluator.js`](file:///d:/BCA/Project/fullStack/brain-gym-app/src/games/focus/focusEvaluator.js):
- **Target Search**:
  - `isCorrect`: User selected exact target cell.
  - `isMissed`: Response deadline expired without input.
  - `isFalsePositive`: User selected a distractor cell.
- **Go / No-Go**:
  - `Hit` (`isCorrect`): Tapped on Go trial.
  - `Correct Rejection` (`isCorrect`): Withheld tap on No-Go trial.
  - `Miss` (`isMissed`): Failed to tap on Go trial before deadline.
  - `False Alarm` (`isFalsePositive`): Inadvertently tapped on No-Go trial.

---

## 5. Scoring Formula
Deterministic formula that strongly rewards high precision and rapid cognitive discrimination:
$$\text{Base Points} = 100$$
$$\text{Speed Bonus} = \max\left(0, \text{round}\left(\frac{\text{Deadline} - \text{Latency}}{10}\right)\right)$$
$$\text{Difficulty Multiplier} = 1 + (\text{Level} - 1) \times 0.1$$
$$\text{Round Score} = \text{round}((\text{Base Points} + \text{Speed Bonus}) \times \text{Difficulty Multiplier} \times \text{Combo Multiplier})$$
- Penalty: Incorrect taps and false alarms deduct `-50` points (total score capped at a minimum of `0`).

---

## 6. Combo System & Multipliers
- Consecutive correct responses increment combo count by `+1`.
- Any incorrect response or missed target resets combo to `0`.
- **Multiplier Breakpoints**:
  - Combo 0–2: `1.0x`
  - Combo 3–5: `1.1x`
  - Combo 6–8: `1.2x`
  - Combo 9–11: `1.3x`
  - Combo 12–14: `1.4x`
  - Combo 15+: `1.5x` (Controlled maximum cap)

---

## 7. Response-Time Calculation
- Measured with high-precision timestamp deltas:
  $$\text{Response Time (ms)} = \text{Date.now()} - \text{taskStartTime}$$
- Zero simulated or hardcoded values.

---

## 8. Adaptive Difficulty Manager
Located in [`src/games/focus/focusDifficulty.js`](file:///d:/BCA/Project/fullStack/brain-gym-app/src/games/focus/focusDifficulty.js):
- Rolling window of the last 5 evaluations:
  - **Level Up**: $\ge 80\%$ accuracy and mean latency $< 80\%$ of deadline.
  - **Level Down**: $< 60\%$ accuracy OR 2 consecutive errors.
  - **Maintain**: Consistent calibrated performance.
- Difficulty tiers scale both grid density (2x2 $\rightarrow$ 4x4), visual distractor interference, and response deadlines (3000ms $\rightarrow$ 850ms).

---

## 9. Session Architecture
- **Quick Session**: 10 rounds for rapid daily training.
- **Standard Session**: 20 rounds.
- **Endless Session**: Unlimited rounds, continues until player taps "End Session".

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
  "modeId": "target_search",
  "score": 1140,
  "accuracy": 100,
  "latency": 340,
  "responseTime": 340,
  "span": 4,
  "streak": 8,
  "totalRounds": 10,
  "difficulty": "adaptive",
  "result": "success",
  "completedAt": "2026-08-22T14:02:00.000Z",
  "completedAtLocal": "2026-08-22T14:02:00.000Z",
  "metadata": {
    "span": 4,
    "durationSeconds": 38,
    "isPerfect": true
  }
}
```

---

## 11. Analytics & Multi-Faculty Integration
- [`ProgressScreen.js`](file:///d:/BCA/Project/fullStack/brain-gym-app/src/screens/ProgressScreen.js) dynamically computes metrics across both **Working Memory** and **Focus & Attention**.
- Focus telemetry appears in Faculty Performance bars, Home sub-metrics, and the overall Cognitive Index.

---

## 12. Faculty Progression
- Stored in `@overload/faculties` under key `focus`.
- Tracks rolling accuracy, rolling latency, peak score, and faculty tier levels (Tier 1 to Tier 5).

---

## 13. Edge-Case & Backgrounding Protection
- **Single-Tap Evaluator Lock**: `isEvaluatingRef` prevents duplicate evaluations from rapid double taps.
- **Timer Cancellation**: Animations and deadline timers are halted immediately upon user touch.
- **App Pausing**: Pause modal stops elapsed time and countdown progress.

---

## 14. Testing & Verification Results
- Android bundle compiled: `1,132 modules` in `3.3s` with `0 errors`.
- Pure JavaScript verification: `0` TypeScript files.
- Memory & Focus engine coexistence verified without interference.

---

## 15. Known Limitations & Next Steps
- Cognitive faculties 3 through 8 (`reaction`, `processing`, `decision`, `spatial`, `flexibility`, `logic`) remain ready for their dedicated decoupled engines in upcoming phases.
