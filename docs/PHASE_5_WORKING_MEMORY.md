# Phase 5 — Complete Working Memory Faculty (Four Distinct Memory Training Games)

## 1. Working Memory Objective
Working Memory is temporary cognitive buffer storage that holds and manipulates information during complex mental operations.
The **Working Memory** faculty in OVERLOAD is structured into **four distinct cognitive gameplay systems**:
1. **Sequence Recall (`sequence_recall`)**: Serial/temporal sequence buffering.
2. **Grid Memory (`grid_memory`)**: Simultaneous 2D spatial coordinate retention.
3. **Object Recall (`object_recall`)**: Visual feature recognition and distractor suppression.
4. **Order Recall (`order_recall`)**: Sequential temporal order reconstruction.

---

## 2. Four Distinct Gameplay Mechanics

```
┌───────────────────────┬────────────────────────────────────────────────────────────────────────┐
│ Game Mode             │ Unique Interaction & Cognitive Mechanic                                │
├───────────────────────┼────────────────────────────────────────────────────────────────────────┤
│ 1. Sequence Recall    │ Serial path: cells illuminate one by one; player reproduces the order. │
│ 2. Grid Memory        │ Spatial matrix: target cells illuminate simultaneously; player recalls.│
│ 3. Object Recall      │ Visual recognition: symbols displayed, then identified amidst noise.   │
│ 4. Order Recall       │ Temporal reconstruction: ordered objects shuffled; player reconstructs.│
└───────────────────────┴────────────────────────────────────────────────────────────────────────┘
```

### Game 1: Sequence Recall (`sequence_recall`)
- **Interaction**: 3x3 grid where cells flash sequentially ($A \rightarrow B \rightarrow C \dots$).
- **Recall**: Player taps the cells in the exact serial order.
- **Mental Operation**: Serial information retention, acoustic/visuospatial loop rehearsal.

### Game 2: Grid Memory (`grid_memory`)
- **Interaction**: Spatial matrix (3x3 or 4x4) where $N$ cells illuminate simultaneously with a smooth countdown bar.
- **Recall**: All cells return to neutral; player selects all cells that were illuminated.
- **Mental Operation**: Visuospatial pattern encoding and simultaneous location binding.

### Game 3: Object Recall (`object_recall`)
- **Interaction**: A collection of $N$ visual symbols (`▲`, `★`, `◆`, `●`, `■`, `⬢`, `✚`, `▼`) with distinct luxury colors is shown for 1.5s–2.5s.
- **Recall**: Target tray is hidden; a shuffled tray containing the targets mixed with $M$ distractor items appears. Player selects the original items.
- **Mental Operation**: Feature binding, visual memory recognition, and distractor rejection.

### Game 4: Order Recall (`order_recall`)
- **Interaction**: A horizontal sequence of $N$ items ($1 \rightarrow 2 \rightarrow 3 \dots$) is displayed for a limited duration.
- **Recall**: Target banner is hidden. A reconstructed slot row is displayed alongside a shuffled choice pool. Player taps items into the sequential slots with tap-to-undo capability.
- **Mental Operation**: Temporal ordering, sequence reconstruction, and order binding.

---

## 3. Infinite Procedural Task Generation
Located in [`src/games/memory/memoryGenerator.js`](file:///d:/BCA/Project/fullStack/brain-gym-app/src/games/memory/memoryGenerator.js):
- Generates procedural tasks dynamically across all 4 modes.
- Never uses static question banks.
- Supports 10, 50, 100, or 500+ rounds with controlled randomization.

---

## 4. Evaluation & Scoring Logic
Located in [`src/games/memory/memoryEvaluator.js`](file:///d:/BCA/Project/fullStack/brain-gym-app/src/games/memory/memoryEvaluator.js):
- Pure evaluation function computing:
  - `accuracy`: $0\%$ to $100\%$.
  - `isPerfect`: Complete flawless recall without false alarms.
  - `correctItemsCount`, `missedItemsCount`, `extraWrongCount`.
- **Scoring Formula**:
  $$\text{Base Score} = \text{Accuracy} \times 6$$
  $$\text{Span Multiplier} = \text{Span} \times 25$$
  $$\text{Speed Bonus} = \max\left(0, \text{round}\left(\frac{4000 - \text{Latency}}{30}\right)\right)$$
  $$\text{Round Points} = \text{round}((\text{Base Score} + \text{Span Bonus} + \text{Speed Bonus}) \times \text{Combo Multiplier})$$
  $$\text{Penalty Points (on 0 accuracy)} = -30 \text{ pts}$$

---

## 5. Adaptive Difficulty Management
Located in [`src/games/memory/memoryDifficulty.js`](file:///d:/BCA/Project/fullStack/brain-gym-app/src/games/memory/memoryDifficulty.js):
- **Span Range**: Minimum span = 2, Maximum span = 9.
- **Progression**:
  - 2 consecutive perfect rounds at current span $\rightarrow$ Span $+1$.
  - Rolling window of last 5 rounds: $\ge 85\%$ accuracy $\rightarrow$ Span $+1$.
  - 2 consecutive failed rounds ($< 60\%$ accuracy) $\rightarrow$ Span $-1$.
  - Stable progression avoiding oscillations.

---

## 6. Local Persistence & Telemetry
Saved to `AsyncStorage` via [`src/services/storageService.js`](file:///d:/BCA/Project/fullStack/brain-gym-app/src/services/storageService.js):
- Stored under `@overload/game_sessions`:
```json
{
  "id": "session_1740000000000_abc123",
  "sessionId": "session_1740000000000_abc123",
  "gameType": "memory",
  "category": "working-memory",
  "facultyId": "memory",
  "modeId": "grid_memory",
  "score": 980,
  "accuracy": 100,
  "span": 5,
  "streak": 3,
  "latency": 520,
  "responseTime": 520,
  "totalRounds": 10,
  "difficulty": "adaptive",
  "result": "success",
  "completedAt": "2026-08-22T14:35:00.000Z"
}
```

---

## 7. Build Verification & Cross-Faculty Regression
- **JavaScript Strict Verification**: `0` TypeScript files (`.ts` / `.tsx`).
- **Android Dev Bundle**: `npx expo export --platform android --dev` passed cleanly with **1,139 modules and 0 errors**.
- **Coexistence**: Working Memory (4 games), Focus (2 games), and Reaction (2 games) operate with dedicated decoupled engines and unified telemetry.
