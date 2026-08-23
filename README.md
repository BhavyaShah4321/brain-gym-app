# OVERLOAD — Mobile Cognitive Performance Platform

**OVERLOAD** is a premium, local-first mobile cognitive training application built with **React Native and Expo (pure JavaScript)**. Designed with a luxury editorial aesthetic, OVERLOAD delivers 27 scientifically grounded, adaptive cognitive drills organized across 8 core cognitive faculties and a high-energy **Mind Rush** arcade suite.

---

## 🛠 Technology Stack

- **Framework**: [React Native](https://reactnative.dev/) with [Expo](https://expo.dev/) (SDK 57)
- **Language**: Pure JavaScript (`.js` only — strictly 0 TypeScript)
- **Persistence**: Local-first offline storage via `@react-native-async-storage/async-storage`
- **Navigation**: `@react-navigation/native`, `@react-navigation/native-stack`, and `@react-navigation/bottom-tabs`
- **Design System**: Luxury editorial light theme (`#FAF8F5` canvas, `#FFFFFF` surfaces, `#1B2A4A` navy, `#C5A55A` gold, `#6B8F71` sage, `#10B981` emerald, `#EF4444` rose)
- **Sensory & Haptics**: `expo-haptics` tactile micro-impulses

---

## 🧠 Cognitive Faculties & Game Modes (27 Total)

### 1. Working Memory (4 Modes)
- **Sequence Recall**: Reconstruct sequential active positions across a 3x3 matrix.
- **Grid Memory**: Retain simultaneous spatial coordinate layouts.
- **Object Recall**: Feature recognition and target discrimination amidst visual distractors.
- **Order Recall**: Temporal sequence reconstruction from shuffled items.

### 2. Focus & Attention (2 Modes)
- **Target Search**: Rapid visual feature search under visual noise.
- **Visual Tracking**: Continuous tracking of moving and swapping target tokens.

### 3. Reaction Speed (3 Modes)
- **Target Tap**: Millisecond visual onset detection and motor execution.
- **Rapid Choice**: High-speed visual discrimination and choice selection.
- **Direction Reaction**: Directional cue stimulus-to-motor translation.

### 4. Processing Speed (3 Modes)
- **Symbol Match**: High-speed comparison of dual symbol sets.
- **Number Scan**: Fast numerical matrix search.
- **Pattern Complete**: Sequence rule induction and missing terminal prediction.

### 5. Decision Making (3 Modes)
- **Priority Sort**: Multi-attribute task triage under deadlines, impact, and urgency.
- **Best Choice**: Constrained multi-criteria optimization.
- **Rule Switch**: Dynamic conditional decision rule adaptation.

### 6. Spatial Reasoning (3 Modes)
- **Mental Rotation**: Angular geometric orientation matching.
- **Spatial Navigation**: Shortest-path navigation across grid labyrinths.
- **Mirror Map**: Axis reflection and coordinate mapping.

### 7. Cognitive Flexibility (3 Modes)
- **Sort Shift**: Mental set shifting across changing visual dimensions.
- **Pattern Shift**: Mid-sequence transformation detection and rule adaptation.
- **Dual Rule**: Branching execution based on contextual flags.

### 8. Logic & Reasoning (3 Modes)
- **Deduction Grid**: Variable elimination and relationship deduction.
- **Sequence Logic**: Mathematical sequence rule discovery.
- **Constraint Solver**: Multi-constraint satisfaction.

### 9. Mind Rush Arcade (3 Modes)
- **Blast Logic**: Fast multi-rule target detonation.
- **Chain Reaction**: Sequential network root planning and staggered propagation.
- **Boss Breaker**: 5-phase cyber-boss shield combat.

---

## 🚀 Running the Application

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Expo Development Server
```bash
npm start
# or
npx expo start
```

### 3. Run on Android Device / Emulator
```bash
npm run android
```

### 4. Verify Android Build
```bash
npx expo export --platform android --dev
```

---

## 📂 Architecture Overview

```
brain-gym-app/
├── App.js                      # Root application entry
├── src/
│   ├── components/             # Design system components
│   ├── constants/              # Categories & route definitions
│   ├── games/                  # 9 decoupled cognitive game engines
│   │   ├── memory/             # Working Memory engine
│   │   ├── focus/              # Focus & Attention engine
│   │   ├── reaction/           # Reaction Speed engine
│   │   ├── processing/         # Processing Speed engine
│   │   ├── decision/           # Decision Making engine
│   │   ├── spatial/            # Spatial Reasoning engine
│   │   ├── flexibility/        # Cognitive Flexibility engine
│   │   ├── logic/              # Logic & Reasoning engine
│   │   └── mindRush/           # Mind Rush Arcade suite
│   ├── navigation/             # AppNavigator & Bottom Tabs
│   ├── screens/                # All application screens
│   ├── services/               # storageService.js (AsyncStorage layer)
│   ├── theme/                  # Colors, typography, spacing
│   └── utils/                  # Haptics, performance metrics, streak
└── docs/
    └── FINAL_PRODUCT_ARCHITECTURE.md
```

---

## 🔒 Local-First Privacy & Offline Operation

- OVERLOAD is **100% offline-first**.
- All game sessions, telemetry, personal best scores, daily streaks, and cognitive indices are persisted securely on the device via `AsyncStorage`.
- No mandatory login, account creation, or internet connection is required for normal gameplay.
