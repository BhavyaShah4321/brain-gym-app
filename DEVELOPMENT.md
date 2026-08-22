# OVERLOAD — Development Workflow & Guidelines

This document provides developer guidelines for maintaining code quality, testing on physical Android devices, and scaling OVERLOAD.

---

## 📋 Development Rules & Standards

1. **JavaScript Only**:
   - Strictly `.js` and `.json` files.
   - Do NOT introduce TypeScript, `.ts`, or `.tsx` files.
2. **Decoupled Architecture**:
   - Game logic belongs in `src/games/<category>/`.
   - Never import React, React Native, or Firebase inside game engine files (`Generator`, `Evaluator`, `Difficulty`, `Engine`).
   - Game engines must remain 100% testable in pure JavaScript runtime.
3. **Design System Adherence**:
   - Import all colors, typography, and spacing from `src/theme`.
   - Never hardcode random hex codes or inline dimensions across screens.
4. **Android-First & Physical Testing**:
   - The primary development target is physical Android phones running **Expo Go**.

---

## 📱 Testing on Physical Android Phone

### Standard LAN Connection
1. Ensure your computer and Android phone are on the same local Wi-Fi.
2. Run:
   ```bash
   npx expo start
   ```
3. Open **Expo Go** on Android and scan the QR code.

### Tunnel Mode (For Different Networks / Hotspots)
If your phone is on cellular data or your router blocks LAN peer discovery:
```bash
npx expo start --tunnel
```

### Useful Metro Shortcuts in Terminal
- Press `r` — Reload the app
- Press `m` — Toggle developer menu on connected device
- Press `j` — Open debugger

---

## 🏗 Build & Release Pipeline (Upcoming Phases)

### Phase 19: EAS Development / Preview APK
When ready to test standalone APKs on physical Android devices:
1. Install EAS CLI: `npm install -g eas-cli`
2. Configure EAS: `eas build:configure`
3. Generate standalone Android APK for local testing:
   ```bash
   eas build --platform android --profile preview
   ```
4. Download and install the `.apk` on your Android phone.

---

## 🗺 Roadmap Phases

- [x] **Phase 1**: Environment, Expo JS setup, Design System, Navigation, Initial Splash & Home UI.
- [ ] **Phase 2-7**: Category UIs, Onboarding, and Theme Refinements.
- [ ] **Phase 8-10**: Full Interactive Memory Drill, Task Generators, and Results Flow.
- [ ] **Phase 11**: Local Statistics Engine and Performance Charts.
- [ ] **Phase 12-14**: Firebase Auth & Firestore Persistence Layer.
- [ ] **Phase 15-18**: Remaining 7 Training Faculty Engines and Polish.
- [ ] **Phase 19-20**: EAS Build and Production APK/AAB generation.
