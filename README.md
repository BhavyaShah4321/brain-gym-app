# OVERLOAD

OVERLOAD is a premium, local-first cognitive training mobile app built with React Native and Expo. The project focuses on short-form brain-training sessions, performance tracking, and adaptive daily practice across multiple cognitive domains.

The application is designed around a luxury editorial visual language, offline-first persistence, and a modular game system that includes nine training categories and a high-energy Mind Rush arcade experience.

---

## Project overview

This app delivers a structured cognitive training experience built for mobile users who want to improve:

- working memory
- visual attention and focus
- reaction speed
- processing speed
- decision quality under pressure
- spatial reasoning
- cognitive flexibility
- logical reasoning
- arcade-style rapid response performance

The system stores results locally on-device, tracks trends over time, and presents a simple readiness view for the user.

---

## Key features

- 9 training categories with adaptive drills
- 27 cognitive game modes in total
- local-only storage using AsyncStorage
- premium light theme with custom UI components
- haptic feedback for interaction and game events
- splash, onboarding, home, training, progress, profile, settings flows
- navigation via React Navigation
- cognitive metrics such as streaks, readiness, accuracy, and index
- offline-first behavior with no required login

---

## Tech stack

- React Native
- Expo
- JavaScript only
- React Navigation
- AsyncStorage
- Expo Haptics
- Expo Linear Gradient
- React Native Safe Area Context

---

## App flow

The app is organized around a standard mobile journey:

1. Splash screen
2. Onboarding flow
3. Main tabs
   - Home
   - Training
   - Progress
   - Profile
4. Category detail screens
5. Game screen / drill execution
6. Results summary
7. Local persistence of session data

---

## Cognitive categories included

### 1. Working Memory
- Sequence Recall
- Grid Memory
- Object Recall
- Order Recall

### 2. Focus & Attention
- Target Search
- Visual Tracking

### 3. Reaction Speed
- Target Tap
- Rapid Choice
- Direction Reaction

### 4. Processing Speed
- Symbol Match
- Number Scan
- Pattern Complete

### 5. Decision Making
- Priority Sort
- Best Choice
- Rule Switch

### 6. Spatial Reasoning
- Mental Rotation
- Spatial Navigation
- Mirror Map

### 7. Cognitive Flexibility
- Sort Shift
- Pattern Shift
- Dual Rule

### 8. Logic & Reasoning
- Deduction Grid
- Sequence Logic
- Constraint Solver

### 9. Mind Rush Arcade
- Blast Logic
- Chain Reaction
- Boss Breaker

---

## Repository structure

```bash
brain-gym-app/
├── App.js
├── app.json
├── index.js
├── package.json
├── README.md
├── LICENSE
├── assets/
├── docs/
│   ├── FINAL_PRODUCT_ARCHITECTURE.md
│   ├── PHASE_4_LOCAL_FIRST_ARCHITECTURE.md
│   ├── PHASE_5_FOCUS_ENGINE.md
│   ├── PHASE_5_VISUAL_TRACKING.md
│   ├── PHASE_5_WORKING_MEMORY.md
│   ├── PHASE_6_REACTION.md
│   ├── PHASE_7_PROCESSING_SPEED.md
│   ├── PHASE_8_DECISION_MAKING.md
│   ├── PHASE_9_SPATIAL_REASONING.md
│   ├── PHASE_10_COGNITIVE_FLEXIBILITY.md
│   ├── PHASE_11_LOGIC_REASONING.md
│   └── PHASE_12_MIND_RUSH.md
├── scripts/
├── src/
│   ├── components/
│   ├── constants/
│   ├── context/
│   ├── games/
│   │   ├── decision/
│   │   ├── flexibility/
│   │   ├── focus/
│   │   ├── logic/
│   │   ├── memory/
│   │   ├── mindRush/
│   │   ├── processing/
│   │   ├── reaction/
│   │   └── spatial/
│   ├── hooks/
│   ├── navigation/
│   ├── screens/
│   ├── services/
│   ├── theme/
│   └── utils/
└──
```

---

## Main application entry points

- `App.js` — root app entry point and provider setup
- `src/navigation/AppNavigator.js` — navigation tree and screen registration
- `src/navigation/AppTabs.js` — bottom tab navigation
- `src/constants/categories.js` — training categories and mode definitions
- `src/services/storageService.js` — local persistence layer
- `src/screens/` — app screens and gameplay flows
- `src/games/` — domain-specific cognitive game engine logic

---

## Local-first architecture

The product is intentionally designed to work without cloud login or remote API dependency. User progress is stored locally on the device, including:

- profile information
- cognitive sessions
- scores and accuracy
- streak tracking
- readiness measures
- category-level performance records

This keeps the app usable in offline scenarios and makes it straightforward to run as a private personal trainer experience.

---

## Getting started

### Prerequisites

- Node.js 18+
- npm or yarn
- Expo CLI
- Android emulator or physical Android device, or iOS simulator

### Install dependencies

```bash
npm install
```

### Start the development server

```bash
npm start
```

or

```bash
npx expo start
```

### Run on Android

```bash
npm run android
```

### Run on iOS

```bash
npm run ios
```

### Run in browser (web)

```bash
npm run web
```

### Export for Android preview build

```bash
npx expo export --platform android --dev
```

---

## Project status

This repository is a front-end mobile app project focused on gameplay, UX, and local cognitive-tracking flows. It is structured as an Expo-based app and is intended for further iteration, feature expansion, and polishing.

The project currently includes the core app flow, category system, navigation, and multiple cognitive games, but does not appear to include an automated test suite or CI pipeline at this time.

---

## Documentation

Additional project planning and architecture notes are available in the `docs/` folder, including:

- `FINAL_PRODUCT_ARCHITECTURE.md`
- phase-by-phase design documents for individual cognitive faculties and game systems

These files are useful if you want to understand the design intent for each training module.

---

## Privacy and usage notes

- No login is required for the core experience.
- Data is stored locally on the device.
- The app is suitable for personal training and offline practice.
- Progress is meant to be self-contained and device-local, rather than cloud-synced.

---

## License

This project includes a license file in the repository root. Please review the license before commercial use or redistribution.

---

## Suggested next improvements

- add automated tests for navigation and core logic
- add a proper CI pipeline
- add analytics export or sync options
- implement stronger game balance tuning and progression systems
- add app store metadata and screenshots
- expand accessibility and onboarding polish

If you want, I can also help turn this into a more production-grade GitHub README with badges, screenshots placeholders, and a cleaner contributor section.
