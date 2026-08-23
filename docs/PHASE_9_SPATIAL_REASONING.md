# Phase 9 — Spatial Reasoning Faculty (Mental Rotation, Spatial Navigation, Mirror Map)

## 1. Spatial Reasoning Objective
Spatial Reasoning trains visual manipulation, mental coordinate transformations, and real-time environmental route navigation.
Unlike simple reactive tapping or sequence memorization, **Spatial Reasoning** requires deliberate spatial modeling and problem-solving:

$$\text{OBSERVE ENVIRONMENT} \longrightarrow \text{PLAN ROUTE / TRANSFORM} \longrightarrow \text{NAVIGATE} \longrightarrow \text{ANSWER}$$

The faculty contains **three distinct, non-overlapping spatial games**:
1. **Mental Rotation (`mental_rotation`)**: Mentally rotate 2D geometric polyomino figures and identify the true rigid rotation among chiral/mutated distractors.
2. **Spatial Navigation (`spatial_navigation`)**: Plan and navigate optimal routes in real-time through procedural labyrinth environments without crossing obstacles.
3. **Mirror Map (`mirror_map`)**: Apply horizontal and vertical reflection symmetry transformations to coordinate maps.

---

## 2. Three Distinct Gameplay Mechanics

```
┌──────────────────────────┬────────────────────────────────────────────────────────────────────────┐
│ Game Mode                │ Unique Interaction & Cognitive Operation                               │
├──────────────────────────┼────────────────────────────────────────────────────────────────────────┤
│ 1. Mental Rotation       │ Mentally rotate target figure; select valid 90°/180°/270° orientation. │
│ 2. Spatial Navigation    │ Real-time grid movement from Start to Target avoiding obstacles.       │
│ 3. Mirror Map            │ Observe source layout; tap transformed destination cell after mirror.  │
└──────────────────────────┴────────────────────────────────────────────────────────────────────────┘
```

### Game 1: Mental Rotation (`mental_rotation`)
- **Interaction**: Target figure displayed on a structured $3 \times 3$ polyomino grid + 3 to 4 candidate cards.
- **Mathematical Transformation Engine**:
  - $0^\circ$: $M[r][c]$
  - $90^\circ$ clockwise: $M'[r][c] = M[N-1-c][r]$
  - $180^\circ$: $M'[r][c] = M[N-1-r][N-1-c]$
  - $270^\circ$ clockwise: $M'[r][c] = M[c][N-1-r]$
  - Reflection (Chiral Inversion): $M_{mirror}[r][c] = M[r][N-1-c]$
- **Ambiguity Prevention Guard**:
  - Validates candidates against $\{R_{90}, R_{180}, R_{270}\}$ and ensures distractors (mirrored shapes and structural mutations) cannot be produced by any 2D rotation.
  - Confirms $\text{validMatches} = 1$.

### Game 2: Spatial Navigation (`spatial_navigation`)
- **Interaction**: Clean visible grid environment ($3 \times 3$ to $5 \times 5$) containing:
  - Start cell ($S$), Target cell ($T$), and obstacles ($■$).
  - Player interacts directly in real time by tapping adjacent cells (UP, DOWN, LEFT, RIGHT).
  - Environment remains continuously visible (NOT a memory sequence game).
- **BFS Pathfinder & Connectivity Validation**:
  - `src/games/spatial/spatialNavigation/spatialNavigationPathfinder.js` executes Breadth-First Search (BFS) to confirm $T$ is reachable from $S$ without crossing obstacles and calculates the exact shortest path length ($\text{optimalMoves}$).
- **Route Efficiency Telemetry**:
  $$\text{Route Efficiency} = \min\left(100, \text{round}\left(\frac{\text{optimalMoves}}{\text{playerMoves}} \times 100\right)\right)$$

### Game 3: Mirror Map (`mirror_map`)
- **Interaction**:
  - Source map ($3 \times 3$ or $4 \times 4$) displaying Target beacon (`★`) and landmarks/obstacles (`■`).
  - Transformation banner: `HORIZONTAL REFLECTION (FLIP LEFT ⇄ RIGHT)` or `VERTICAL REFLECTION (FLIP TOP ⇅ BOTTOM)`.
  - Destination grid: Player taps the single cell where the target beacon lands.
- **Coordinate Transformation Formulas**:
  - Horizontal Flip: $(r', c') = (r, \text{gridSize} - 1 - c)$
  - Vertical Flip: $(r', c') = (\text{gridSize} - 1 - r, c)$

---

## 3. High-Resolution Timing & Timeout Management
- Latency recorded per decision:
  $$\text{Response Latency (ms)} = \text{Date.now()} - \text{roundStartTimeRef.current}$$
- Countdown track visualizes available decision window (4000ms–16000ms).

---

## 4. Deterministic Scoring Formula
Located in [`src/games/spatial/spatialScoring.js`](file:///d:/BCA/Project/fullStack/brain-gym-app/src/games/spatial/spatialScoring.js):
$$\text{Base Points} = 100$$
$$\text{Speed Bonus} = \max\left(0, \text{round}\left(\frac{\text{Timeout Window} - \text{Latency}}{15}\right)\right)$$
$$\text{Fast Reasoning Bonus} = +35 \text{ pts if } \text{Latency} < 1800\text{ms}, \quad +20 \text{ pts if } \text{Latency} < 2800\text{ms}$$
$$\text{Difficulty Multiplier} = 1 + (\text{Level} - 1) \times 0.1$$
$$\text{Round Score} = \text{round}((\text{Base Points} + \text{Speed Bonus} + \text{Fast Bonus}) \times \text{Difficulty Multiplier} \times \text{Combo Multiplier})$$
- Penalties:
  - Incorrect Decision: `-35` pts
  - Timeout: `-30` pts
  - Total score cannot drop below `0`.

---

## 5. Adaptive Difficulty Management
Located in [`src/games/spatial/spatialDifficulty.js`](file:///d:/BCA/Project/fullStack/brain-gym-app/src/games/spatial/spatialDifficulty.js):
- Rolling window of the last 5 rounds:
  - **Level Up**: $\ge 80\%$ accuracy / route efficiency.
  - **Level Down**: $< 60\%$ accuracy OR $\ge 2$ consecutive errors/timeouts.
  - **Maintain**: Calibrated performance.

---

## 6. Local Persistence & Telemetry
Saved to `AsyncStorage` via [`src/services/storageService.js`](file:///d:/BCA/Project/fullStack/brain-gym-app/src/services/storageService.js):
- Stored under `@overload/game_sessions`:
```json
{
  "id": "session_1740000000000_nav012",
  "sessionId": "session_1740000000000_nav012",
  "gameType": "spatial",
  "category": "spatial",
  "facultyId": "spatial",
  "modeId": "spatial_navigation",
  "score": 1640,
  "accuracy": 100,
  "latency": 2340,
  "responseTime": 2340,
  "totalRounds": 10,
  "difficulty": "adaptive",
  "result": "success",
  "completedAt": "2026-08-22T16:15:00.000Z"
}
```

---

## 7. Build Verification & Cross-Faculty Regression
- **JavaScript Strict Verification**: `0` TypeScript files (`.ts` / `.tsx`).
- **Android Dev Bundle**: `npx expo export --platform android --dev` passed with **1,189 modules and 0 errors**.
- **Coexistence across 6 Faculties**:
  1. **Working Memory** (4 games): Sequence Recall, Grid Memory, Object Recall, Order Recall.
  2. **Focus & Attention** (2 games): Target Search, Visual Tracking.
  3. **Reaction Speed** (3 games): Target Tap, Rapid Choice, Direction Reaction.
  4. **Processing Speed** (3 games): Symbol Match, Number Scan, Pattern Complete.
  5. **Decision Making** (3 games): Priority Sort, Best Choice, Rule Switch.
  6. **Spatial Reasoning** (3 games): Mental Rotation, Spatial Navigation, Mirror Map.
