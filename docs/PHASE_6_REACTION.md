# Phase 6 — Reaction Speed Faculty (Three Distinct Reaction Games)

## 1. Reaction Speed Objective
Reaction Speed trains the temporal efficiency of sensory detection, discrimination, and physical motor execution.
The **Reaction Speed** faculty in OVERLOAD is structured into **three distinct cognitive reaction systems**:
1. **Target Tap (`target_tap`)**: Visual detection and rapid motor execution upon unpredictable spatial stimulus onset.
2. **Rapid Choice (`rapid_choice`)**: High-speed visual discrimination and rapid decision-making among distractors.
3. **Direction Reaction (`direction_reaction`)**: Rapid stimulus-to-action mapping from visual arrows onto a 4-way physical touch control pad.

---

## 2. Three Distinct Gameplay Mechanics

```
┌──────────────────────────┬────────────────────────────────────────────────────────────────────────┐
│ Game Mode                │ Unique Interaction & Cognitive Mechanic                                │
├──────────────────────────┼────────────────────────────────────────────────────────────────────────┤
│ 1. Target Tap            │ Detect sudden target onset in arena; tap instantly at coordinates.     │
│ 2. Rapid Choice          │ Identify designated target rule; tap matching item from choice tray.   │
│ 3. Direction Reaction    │ Observe visual direction arrow (↑ ↓ ← →); tap matching D-pad button.   │
└──────────────────────────┴────────────────────────────────────────────────────────────────────────┘
```

### Game 1: Target Tap (`target_tap`)
- **Interaction**: Arena where, after a variable randomized pre-stimulus delay (800ms–2500ms), a target appears at dynamic coordinates.
- **Motor Response**: Player taps the target instantly upon onset. Target size adapts with level while maintaining an accessible Android touch target ($\ge 64\text{px}$).
- **False-Start Detection**: Tapping before stimulus onset flags `falseStart: true`, shows `"TOO EARLY"`, docks a 50-point penalty, resets combo, and regenerates round.

### Game 2: Rapid Choice (`rapid_choice`)
- **Interaction**: A top banner designates the target rule (e.g. `TARGET: ▲ Triangle`). A choice tray of 2, 4, or 6 items appears with randomized target positioning among distractors.
- **Motor Response**: Player discriminates the target and taps it as fast as possible.
- **Evaluation**: Measures decision latency, accuracy, and wrong-choice penalties.

### Game 3: Direction Reaction (`direction_reaction`)
- **Interaction**: Top stimulus banner displays directional arrows (`↑`, `↓`, `←`, `→`). A persistent 4-way cross directional touch pad is rendered at the bottom:
```
        [ ↑ ]
[ ← ]   [ ● ]   [ → ]
        [ ↓ ]
```
- **Difficulty Progression**:
  - **Level 1**: Only UP and DOWN (`↑`, `↓`).
  - **Level 2**: LEFT and RIGHT (`←`, `→`).
  - **Level 3+**: All four directions (`↑`, `↓`, `←`, `→`).
  - **Level 4–5**: Shorter response windows (2000ms down to 1100ms) and faster delays.
- **Evaluation**: Measures stimulus-to-action mapping latency, direction accuracy, and false starts.

---

## 3. High-Resolution Timing Architecture
- The reaction timer starts at the exact millisecond the stimulus renders:
  $$\text{stimulusTimestampRef.current} = \text{Date.now()}$$
- Latency is captured on touch event:
  $$\text{Latency (ms)} = \text{Date.now()} - \text{stimulusTimestampRef.current}$$
- Zero simulated numbers or artificial delays.

---

## 4. Scoring Formula & Reflex Curves
Located in [`src/games/reaction/reactionScoring.js`](file:///d:/BCA/Project/fullStack/brain-gym-app/src/games/reaction/reactionScoring.js):
$$\text{Base Points} = 100$$
$$\text{Speed Bonus} = \max\left(0, \text{round}\left(\frac{\text{Timeout Window} - \text{Latency}}{5}\right)\right)$$
$$\text{Apex Reflex Bonus} = +80 \text{ pts if } \text{Latency} < 200\text{ms}, \quad +50 \text{ pts if } \text{Latency} < 250\text{ms}$$
$$\text{Difficulty Multiplier} = 1 + (\text{Level} - 1) \times 0.1$$
$$\text{Round Score} = \text{round}((\text{Base Points} + \text{Speed Bonus} + \text{Apex Bonus}) \times \text{Difficulty Multiplier} \times \text{Combo Multiplier})$$
- Penalties:
  - False Start: `-50` pts
  - Wrong Choice / Direction: `-40` pts
  - Timeout: `-30` pts
  - Total score cannot drop below `0`.

---

## 5. Adaptive Difficulty Management
Located in [`src/games/reaction/reactionDifficulty.js`](file:///d:/BCA/Project/fullStack/brain-gym-app/src/games/reaction/reactionDifficulty.js):
- Rolling window of the last 5 rounds:
  - **Level Up**: $\ge 80\%$ accuracy, 0 false starts, and mean latency $\le 380\text{ms}$.
  - **Level Down**: $< 60\%$ accuracy OR $\ge 2$ consecutive errors/false starts.
  - **Maintain**: Calibrated performance.

---

## 6. Local Persistence & Telemetry
Saved to `AsyncStorage` via [`src/services/storageService.js`](file:///d:/BCA/Project/fullStack/brain-gym-app/src/services/storageService.js):
- Stored under `@overload/game_sessions`:
```json
{
  "id": "session_1740000000000_dir123",
  "sessionId": "session_1740000000000_dir123",
  "gameType": "reaction",
  "category": "reaction",
  "facultyId": "reaction",
  "modeId": "direction_reaction",
  "score": 1350,
  "accuracy": 100,
  "latency": 226,
  "responseTime": 226,
  "totalRounds": 10,
  "difficulty": "adaptive",
  "result": "success",
  "completedAt": "2026-08-22T14:45:00.000Z"
}
```

---

## 7. Build Verification & Cross-Faculty Regression
- **JavaScript Strict Verification**: `0` TypeScript files (`.ts` / `.tsx`).
- **Android Dev Bundle**: `npx expo export --platform android --dev` passed with **1,146 modules and 0 errors**.
- **Coexistence**: Working Memory (4 games), Focus (2 games), and Reaction Speed (3 games) operate with dedicated decoupled engines and unified telemetry.
