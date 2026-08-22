# OVERLOAD — Cognitive Performance Platform

**OVERLOAD** is a premium cognitive-training mobile application built with React Native and Expo (pure JavaScript) powered by a robust Firebase Authentication and Cloud Firestore data foundation. Designed with a clean, calm, luxury editorial visual identity, OVERLOAD empowers continuous, unbounded cognitive training across 8 distinct faculties with dynamic task generation and adaptive difficulty.

---

## 🛠 Technology Stack

- **Framework**: [React Native](https://reactnative.dev/) with [Expo](https://expo.dev/) (SDK 57)
- **Language**: Pure JavaScript (`.js`, `.json` only — strictly no TypeScript)
- **Backend & Persistence**: Firebase v10+ (Firebase Authentication & Cloud Firestore) with AsyncStorage session persistence
- **Navigation**: `@react-navigation/native`, `@react-navigation/native-stack`, and `@react-navigation/bottom-tabs`
- **Design System**: Light luxury editorial tokens (`#FAF8F5` / `#F7F8FC` canvas, `#FFFFFF` surfaces, `#1B2A4A` navy, `#C5A55A` gold, `#6B8F71` sage, `#C4787A` rose)
- **State & Architecture**: Functional React components, Centralized `AuthContext`, and completely decoupled game engines

---

## 🔥 Firebase Setup Guide

Follow these steps to connect your Firebase project:

### 1. Create a Firebase Project
1. Go to the [Firebase Console](https://console.firebase.google.com/).
2. Click **Add project** and name it (e.g. `overload-cognitive`).
3. Disable or enable Google Analytics according to your preference and create the project.

### 2. Enable Authentication
1. In the Firebase Console, navigate to **Build > Authentication**.
2. Click **Get Started**.
3. Under the **Sign-in method** tab, select **Email/Password**.
4. Enable the **Email/Password** toggle and click **Save**.

### 3. Create Cloud Firestore Database
1. In the Firebase Console, navigate to **Build > Firestore Database**.
2. Click **Create database**.
3. Choose a database location close to your users (e.g. `nam5` or `asia-south1`).
4. Start in **Production mode** (security rules will be deployed).

### 4. Deploy Firestore Security Rules
Copy the contents of [`firestore.rules`](file:///d:/BCA/Project/fullStack/brain-gym-app/firestore.rules) into the **Firestore Database > Rules** tab in the Firebase Console and click **Publish**:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;

      match /{allSubcollections=**} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
  }
}
```

### 5. Register Web/App Client & Configure Environment Variables
1. In **Project Settings > General**, under *Your apps*, click the **Web icon (`</>`)** to register a web app.
2. Copy the `firebaseConfig` keys.
3. In the root of this project, create a `.env` file from `.env.example`:
   ```bash
   cp .env.example .env
   ```
4. Fill in your environment variables:
   ```ini
   EXPO_PUBLIC_FIREBASE_API_KEY=AIzaSy...
   EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=overload-cognitive.firebaseapp.com
   EXPO_PUBLIC_FIREBASE_PROJECT_ID=overload-cognitive
   EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=overload-cognitive.appspot.com
   EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=1234567890
   EXPO_PUBLIC_FIREBASE_APP_ID=1:1234567890:web:...
   ```

---

## 📂 Project Architecture

```
brain-gym-app/
├── App.js                      # Root application entry & providers
├── app.json                    # Expo configuration & app identity
├── firestore.rules             # Cloud Firestore security rules
├── .env.example                # Environment variables template
├── package.json                # Dependencies and scripts
└── src/
    ├── components/             # Reusable design system UI components
    │   ├── AppButton.js        # Multi-variant tactile button
    │   ├── AppCard.js          # Surface container card
    │   ├── GradientCard.js     # Subtle tinted gradient card
    │   ├── Badge.js            # Status/metric pill
    │   ├── CategoryCard.js     # Training category module card
    │   ├── Header.js           # Screen headers
    │   ├── ScreenContainer.js  # Safe-area aware screen container
    │   ├── StatCard.js         # Metric display card
    │   └── index.js
    ├── constants/              # Global constants & definitions
    │   ├── categories.js       # 8 core cognitive faculties
    │   └── routes.js           # Navigation route names
    ├── context/                # Context providers (AuthContext)
    ├── games/                  # Isolated, decoupled training engines
    │   └── memory/             # Working memory (engine, generator, evaluator, difficulty)
    ├── hooks/                  # Custom hooks (useAuth)
    ├── navigation/             # Navigation stacks & tab bar
    │   ├── AppNavigator.js     # Stack navigator
    │   └── AppTabs.js          # Bottom tab navigation
    ├── screens/                # UI Screens
    │   ├── SplashScreen.js     # Typography-driven light splash
    │   ├── OnboardingScreen.js # Full-bleed interactive intro
    │   ├── LoginScreen.js      # Firebase email/password login
    │   ├── RegisterScreen.js   # Firebase account creation
    │   ├── HomeScreen.js       # Live performance telemetry dashboard
    │   ├── TrainingScreen.js   # Core & Advanced cognitive catalog
    │   ├── CategoryDetailScreen.js # Faculty dashboard & modes
    │   ├── GameScreen.js       # Visually centered interactive game host
    │   ├── ResultsScreen.js    # Post-round analytics & persistence
    │   ├── ProgressScreen.js   # Longitudinal cognitive analytics
    │   ├── ProfileScreen.js    # Operator profile & account sync
    │   └── SettingsScreen.js   # Sensory & system preferences
    ├── services/               # Firebase Services Layer
    │   └── firebase/
    │       ├── firebaseConfig.js     # Singleton initialization & persistence
    │       ├── authService.js        # Auth operations & error formatting
    │       ├── userService.js        # User document management
    │       ├── settingsService.js    # User preferences synchronization
    │       ├── gameSessionService.js # Drill session recording
    │       └── progressService.js    # Aggregates, faculties & streaks
    ├── theme/                  # Centralized design system
    │   ├── colors.js           # Curated color tokens
    │   ├── spacing.js          # Radii, spacing, shadows
    │   ├── typography.js       # Font weights, scale, letter spacing
    │   └── theme.js
    └── utils/
        └── performance/        # Cognitive index & streak calculators
            ├── cognitiveIndex.js     # Deterministic performance algorithm
            └── streakCalculator.js   # Calendar-day streak evaluation
```

---

## 🚀 How to Run on a Physical Android Phone

### Prerequisites
1. Install **Node.js** (LTS) and **npm** on your computer.
2. Install the **Expo Go** app from the Google Play Store on your Android phone.

### Steps to Run
1. Start the Expo development server:
   ```bash
   npm start
   ```
2. A QR code will appear in your terminal.
3. Open the **Expo Go** app on your Android device and tap **"Scan QR code"**.
4. Scan the terminal QR code.
   - *Note*: Ensure your computer and Android phone are connected to the same Wi-Fi network (or use `npx expo start --tunnel`).

---

## 🧠 Data Architecture & Firestore Schema

- **`users/{uid}`** — Root user profile, operator ID, global statistics (cognitive index, total drills, active streaks, average latency, accuracy), and user settings.
- **`users/{uid}/sessions/{sessionId}`** — Detailed telemetry for every completed training session (score, accuracy, latency, span, timestamp).
- **`users/{uid}/faculties/{facultyId}`** — Per-faculty performance statistics, calibration levels, and rolling averages.
