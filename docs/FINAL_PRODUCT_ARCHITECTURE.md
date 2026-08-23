# OVERLOAD — Final Product Architecture Documentation

---

## 1. Product Overview
**OVERLOAD** is a premium, local-first mobile cognitive training application built with **React Native + Expo**. The application provides 27 scientifically grounded, adaptive cognitive drills organized across 8 core cognitive faculties and an arcade mode called **Mind Rush**.

- **Design System**: Luxury editorial light theme (`#FAF8F5` background, `#FFFFFF` cards, `#1B2A4A` navy primary, `#C5A55A` gold accents, `#6B8F71` sage, `#10B981` emerald, and `#EF4444` rose).
- **Runtime**: Pure JavaScript (`.js`), zero TypeScript (`0 .ts / .tsx`).
- **Data Persistence**: Offline-first local storage via `@react-native-async-storage/async-storage`. Zero mandatory cloud or authentication barriers.
- **Haptics**: Tactile micro-impulses using `expo-haptics`.

---

## 2. Global Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    REACT NAVIGATION SYSTEM                  │
│  Splash → Onboarding → AppNavigator → AppTabs → Screens     │
└──────────────────────────────┬──────────────────────────────┘
                               │
       ┌───────────────────────┴───────────────────────┐
       ▼                                               ▼
┌──────────────────────────────┐        ┌──────────────────────────────┐
│     COGNITIVE FACULTIES      │        │      MIND RUSH ARCADE        │
│  8 Faculties / 24 Game Modes │        │    3 High-Energy Modes       │
│   (Pure JS Game Engines)     │        │   (Pure JS Arcade Suite)     │
└──────────────┬───────────────┘        └──────────────┬───────────────┘
               │                                       │
               └───────────────────────┬───────────────┘
                                       │
                                       ▼
                        ┌──────────────────────────────┐
                        │      LOCAL STORAGE LAYER     │
                        │    (AsyncStorage Service)    │
                        │ Sessions, Stats, Faculties   │
                        └──────────────┬───────────────┘
                                       │
                                       ▼
                        ┌──────────────────────────────┐
                        │     ANALYTICS ENGINE         │
                        │   Cognitive Index, Readiness │
                        └──────────────────────────────┘
```

---

## 3. Navigation System
All routing is managed through [`src/constants/routes.js`](file:///d:/BCA/Project/fullStack/brain-gym-app/src/constants/routes.js) and [`src/navigation/AppNavigator.js`](file:///d:/BCA/Project/fullStack/brain-gym-app/src/navigation/AppNavigator.js):

- **Core Flows**:
  - `ROUTES.SPLASH` $\rightarrow$ `ROUTES.ONBOARDING` $\rightarrow$ `ROUTES.MAIN_TABS`
  - `ROUTES.MAIN_TABS`:
    - `HomeTab` (`HomeScreen.js`)
    - `TrainingTab` (`TrainingScreen.js`)
    - `ProgressTab` (`ProgressScreen.js`)
    - `ProfileTab` (`ProfileScreen.js`)
- **Faculty & Game Routing**:
  - `ROUTES.CATEGORY_DETAIL` (`CategoryDetailScreen.js`)
  - `ROUTES.GAME` (`GameScreen.js` for Working Memory)
  - `ROUTES.FOCUS_GAME` (`FocusGameScreen.js`)
  - `ROUTES.REACTION_GAME` (`ReactionGameScreen.js`)
  - `ROUTES.PROCESSING_GAME` (`ProcessingGameScreen.js`)
  - `ROUTES.DECISION_GAME` (`DecisionGameScreen.js`)
  - `ROUTES.SPATIAL_GAME` (`SpatialGameScreen.js`)
  - `ROUTES.FLEXIBILITY_GAME` (`FlexibilityGameScreen.js`)
  - `ROUTES.LOGIC_GAME` (`LogicGameScreen.js`)
  - `ROUTES.MIND_RUSH_GAME` (`MindRushGameScreen.js`)
  - `ROUTES.RESULTS` (`ResultsScreen.js`)
  - `ROUTES.SETTINGS` (`SettingsScreen.js`)

---

## 4. Game Engine Suite (27 Distinct Modes)

| Faculty | Mode ID | Game Name | Core Mental Operation |
|---|---|---|---|
| **1. Working Memory** | `sequence_recall` | Sequence Recall | Serial order reproduction on a 3x3 grid |
| | `grid_memory` | Grid Memory | Simultaneous spatial matrix retention |
| | `object_recall` | Object Recall | Visual symbol feature discrimination |
| | `order_recall` | Order Recall | Temporal sequence reconstruction |
| **2. Focus & Attention** | `target_search` | Target Search | Rapid visual search amid feature distractors |
| | `visual_tracking` | Visual Tracking | Dynamic token position tracking across swaps |
| **3. Reaction Speed** | `target_tap` | Target Tap | Millisecond motor latency to visual onset |
| | `rapid_choice` | Rapid Choice | Instant stimulus discrimination |
| | `direction_reaction`| Direction Reaction| Translating directional visual cues to inputs |
| **4. Processing Speed** | `symbol_match` | Symbol Match | High-speed comparison of dual symbol arrays |
| | `number_scan` | Number Scan | Fast matrix search for target numerals |
| | `pattern_complete` | Pattern Complete | Sequence rule discovery and missing item prediction |
| **5. Decision Making** | `priority_sort` | Priority Sort | Multi-attribute triage under deadlines and impact |
| | `best_choice` | Best Choice | Constrained multi-criteria optimization |
| | `rule_switch` | Rule Switch | Dynamic conditional rule adherence |
| **6. Spatial Reasoning** | `mental_rotation` | Mental Rotation | 2D/3D angular orientation matching |
| | `spatial_navigation`| Spatial Navigation| Shortest route planning across labyrinthine grids |
| | `mirror_map` | Mirror Map | Coordinate reflection across axes |
| **7. Cognitive Flexibility** | `sort_shift` | Sort Shift | Shifting mental sets across changing dimensions |
| | `pattern_shift` | Pattern Shift | Detecting mid-sequence structural transformations |
| | `dual_rule` | Dual Rule | Branching execution based on contextual flags |
| **8. Logic & Reasoning** | `deduction_grid` | Deduction Grid | Constraint-based variable elimination |
| | `sequence_logic` | Sequence Logic | Mathematical transformation rule induction |
| | `constraint_solver` | Constraint Solver | Multi-condition constraint satisfaction |
| **9. Mind Rush Arcade** | `blast_logic` | Blast Logic | Rapid multi-rule target detonation |
| | `chain_reaction` | Chain Reaction | Sequential root prediction with staged propagation |
| | `boss_breaker` | Boss Breaker | 5-phase cyber-boss shield combat |

---

## 5. Storage Architecture & Persistence
Storage is centralized in [`src/services/storageService.js`](file:///d:/BCA/Project/fullStack/brain-gym-app/src/services/storageService.js):
- Storage Keys:
  - `@overload/player_id`: Persistent anonymous operator identity (e.g. `OP-8492`).
  - `@overload/player_profile`: Local operator metadata.
  - `@overload/game_sessions`: Array of completed drill records with full telemetry.
  - `@overload/player_stats`: Aggregated lifetime statistics, streak, readiness, and cognitive index.
  - `@overload/faculties`: Per-faculty level, best score, rolling accuracy, and latency.
  - `@overload/settings`: Haptics, sound, and difficulty preferences.

---

## 6. Analytics Integrity
- **Cognitive Index**: Composite score derived from average accuracy ($40\%$), mean latency ($35\%$), peak span ($15\%$), and session frequency ($10\%$).
- **Cognitive Readiness**: Calculated from recent session accuracy, active calendar streak, and historical drill count.
- **Streak Calculation**: Continuous daily streak calculated using calendar-day boundaries in [`src/utils/performance/streakCalculator.js`](file:///d:/BCA/Project/fullStack/brain-gym-app/src/utils/performance/streakCalculator.js).
- **Zero-State Handling**: Clean empty states rendered across `HomeScreen` and `ProgressScreen` with no fake mock numbers.

---

## 7. Quality Assurance & Offline Isolation
- **100% Offline-First**: Zero required internet connectivity or authentication. All gameplay, progression, and settings persist locally via AsyncStorage.
- **Strict Invariants**: All procedural challenge generators validate tasks before presentation.
- **Timer and Lifecycle Safety**: All `setTimeout`, `setInterval`, and animation loops are tracked and cleaned up on unmount.
- **Android Dev Bundle**: Clean Metro bundling with 0 errors across 1,232 modules.
