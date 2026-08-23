# Phase 7 — Processing Speed Faculty (Three Distinct Processing Games)

## 1. Processing Speed Objective
Processing Speed trains the cognitive efficiency of information intake, pattern extraction, visual discrimination, and rapid decision execution.
Unlike Reaction Speed (which measures raw onset-to-motor response latency), **Processing Speed** requires actual cognitive comprehension:

$$\text{SEE} \longrightarrow \text{PROCESS} \longrightarrow \text{COMPREHEND} \longrightarrow \text{ANSWER}$$

The faculty contains **three genuinely different cognitive engines**:
1. **Symbol Match (`symbol_match`)**: Rapid comparison between dual abstract symbol arrays to identify exact equivalence versus localized difference.
2. **Number Scan (`number_scan`)**: Rapid visual matrix search to detect and acquire target numbers amidst distractors.
3. **Pattern Complete (`pattern_complete`)**: Rapid visual sequence rule processing and terminal element completion.

---

## 2. Three Distinct Gameplay Mechanics

```
┌──────────────────────────┬────────────────────────────────────────────────────────────────────────┐
│ Game Mode                │ Unique Interaction & Cognitive Operation                               │
├──────────────────────────┼────────────────────────────────────────────────────────────────────────┤
│ 1. Symbol Match          │ Compare dual sets (Set A vs Set B); select [ MATCH ] or [ DIFFERENT ]. │
│ 2. Number Scan           │ Scan numerical grid (3x3 to 4x4) to locate target number instance(s).  │
│ 3. Pattern Complete      │ Process sequence rule (e.g. ● → ▲ → ● → ▲ → ?); tap correct choice.   │
└──────────────────────────┴────────────────────────────────────────────────────────────────────────┘
```

### Game 1: Symbol Match (`symbol_match`)
- **Interaction**: Central card displaying `SET A` vs `SET B`.
- **Cognitive Operation**: Simultaneous comparative inspection.
- **Difficulty Scaling**:
  - Easy: 3–4 symbols per set.
  - Medium: 5–6 symbols per set.
  - Hard: 7–8 symbols per set with single-element mutations.
- **Controls**: `[ MATCH ]` and `[ DIFFERENT ]` buttons.

### Game 2: Number Scan (`number_scan`)
- **Interaction**: Top prompt displays target number (`TARGET: 6` or `FIND ALL 2 INSTANCES`). Center grid displays numerical matrix.
- **Cognitive Operation**: Systematic saccadic search and visual filtering.
- **Difficulty Scaling**:
  - Easy: 3x3 grid (9 cells), 1 target.
  - Medium: 4x3 grid (12 cells), 1 target.
  - Hard: 4x4 grid (16 cells), 2–3 target instances.
- **Controls**: Accessible direct-tap numerical grid cells.

### Game 3: Pattern Complete (`pattern_complete`)
- **Interaction**: Sequence row displays items with `?` at the terminal position, with 4 distinct choice cards below.
- **Cognitive Operation**: Induction of underlying progression rule.
- **Pattern Families**:
  1. *Alternating*: $A \rightarrow B \rightarrow A \rightarrow B \rightarrow ?$ (Answer: $A$)
  2. *Repetition*: $A \rightarrow A \rightarrow B \rightarrow A \rightarrow A \rightarrow ?$ (Answer: $B$)
  3. *Numeric Increment*: $2 \rightarrow 3 \rightarrow 4 \rightarrow 5 \rightarrow ?$ (Answer: $6$)
  4. *Numeric Decrement*: $8 \rightarrow 7 \rightarrow 6 \rightarrow 5 \rightarrow ?$ (Answer: $4$)
  5. *Cyclic Shape Progression*: $A \rightarrow B \rightarrow C \rightarrow A \rightarrow B \rightarrow ?$ (Answer: $C$)
  6. *Interleaved*: $A \rightarrow 1 \rightarrow B \rightarrow 2 \rightarrow C \rightarrow ?$ (Answer: $3$)
- **Unambiguous Guarantee**: Every generated task has exactly one logically valid target.

---

## 3. High-Resolution Timing & Timeout Management
- High-resolution processing latency captured on touch submission:
  $$\text{Processing Latency (ms)} = \text{Date.now()} - \text{roundStartTimeRef.current}$$
- Countdown track visualizes available processing window per round.
- Timeout limits scale adaptively (5000ms down to 2200ms).

---

## 4. Deterministic Scoring & Throughput Bonus
Located in [`src/games/processing/processingScoring.js`](file:///d:/BCA/Project/fullStack/brain-gym-app/src/games/processing/processingScoring.js):
$$\text{Base Points} = 100$$
$$\text{Speed Bonus} = \max\left(0, \text{round}\left(\frac{\text{Timeout Window} - \text{Latency}}{12}\right)\right)$$
$$\text{Swift Processing Bonus} = +50 \text{ pts if } \text{Latency} < 1000\text{ms}, \quad +30 \text{ pts if } \text{Latency} < 1600\text{ms}$$
$$\text{Difficulty Multiplier} = 1 + (\text{Level} - 1) \times 0.1$$
$$\text{Round Score} = \text{round}((\text{Base Points} + \text{Speed Bonus} + \text{Swift Bonus}) \times \text{Difficulty Multiplier} \times \text{Combo Multiplier})$$
- Penalties:
  - Wrong Answer: `-35` pts
  - Timeout: `-30` pts
  - Total score cannot drop below `0`.

---

## 5. Adaptive Difficulty Management
Located in [`src/games/processing/processingDifficulty.js`](file:///d:/BCA/Project/fullStack/brain-gym-app/src/games/processing/processingDifficulty.js):
- Rolling window of the last 5 rounds:
  - **Level Up**: $\ge 80\%$ accuracy and average response time $\le 2200\text{ms}$.
  - **Level Down**: $< 60\%$ accuracy OR $\ge 2$ consecutive errors/timeouts.
  - **Maintain**: Consistent calibrated throughput.

---

## 6. Local Persistence & Telemetry
Saved to `AsyncStorage` via [`src/services/storageService.js`](file:///d:/BCA/Project/fullStack/brain-gym-app/src/services/storageService.js):
- Stored under `@overload/game_sessions`:
```json
{
  "id": "session_1740000000000_proc789",
  "sessionId": "session_1740000000000_proc789",
  "gameType": "processing",
  "category": "processing",
  "facultyId": "processing",
  "modeId": "symbol_match",
  "score": 1420,
  "accuracy": 100,
  "latency": 840,
  "responseTime": 840,
  "totalRounds": 10,
  "difficulty": "adaptive",
  "result": "success",
  "completedAt": "2026-08-22T15:10:00.000Z"
}
```

---

## 7. Build Verification & Cross-Faculty Regression
- **JavaScript Strict Verification**: `0` TypeScript files (`.ts` / `.tsx`).
- **Android Dev Bundle**: `npx expo export --platform android --dev` passed with **1,160 modules and 0 errors**.
- **Coexistence**:
  - Working Memory (4 games)
  - Focus & Attention (2 games)
  - Reaction Speed (3 games)
  - Processing Speed (3 games)
  - All faculties operate with isolated engines and unified local persistence.
