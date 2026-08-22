# Phase 4 Firebase Implementation

## Authentication
- **Registration**: Email/password registration via `authService.signUp({ email, password, displayName })` creates the Firebase Auth user, assigns the display name, and provisions the initial user document at `users/{uid}` in Cloud Firestore.
- **Login**: Email/password authentication via `authService.signIn({ email, password })` signs the user in and hydrides their profile and stats from Firestore.
- **Logout**: `authService.signOut()` signs out the user and clears local state.
- **Persistence**: Managed using `onAuthStateChanged` in `AuthContext.js` backed by `@react-native-async-storage/async-storage` (`getReactNativePersistence`), persisting sessions across app restarts, reloads, and Metro reboots.
- **Guest Fallback**: Allows immediate local drill testing without blocking the user.

---

## Firestore Structure

```
users/{uid}
├── uid: string
├── email: string
├── displayName: string
├── createdAt: timestamp
├── updatedAt: timestamp
├── profile:
│   ├── level: number
│   ├── operatorId: string ("OP-XXXX")
│   ├── avatar: null
│   └── accountStatus: "active" | "guest"
├── stats:
│   ├── cognitiveIndex: number
│   ├── readiness: number
│   ├── totalDrills: number
│   ├── currentStreak: number
│   ├── bestStreak: number
│   ├── lastTrainingDate: string ("YYYY-MM-DD")
│   ├── averageAccuracy: number
│   ├── averageLatencyMs: number
│   └── peakSpan: number
├── settings:
│   ├── haptics: boolean
│   ├── sound: boolean
│   ├── difficulty: string ("adaptive")
│   └── notifications: boolean
│
├── gameSessions/{sessionId}
│   ├── sessionId: string
│   ├── gameType: "memory-span"
│   ├── category: "working-memory"
│   ├── facultyId: "memory"
│   ├── modeId: "sequence_recall"
│   ├── score: number
│   ├── accuracy: number
│   ├── span: number
│   ├── streak: number
│   ├── responseTime: number
│   ├── latency: number
│   ├── totalRounds: number
│   ├── difficulty: "adaptive"
│   ├── result: "success" | "completed"
│   ├── completedAt: timestamp
│   ├── completedAtLocal: string (ISO 8601)
│   └── metadata:
│       ├── span: number
│       ├── durationSeconds: number
│       └── isPerfect: boolean
│
└── faculties/{facultyId}
    ├── facultyId: string
    ├── level: number
    ├── metrics:
    │   ├── score: number
    │   ├── accuracy: number
    │   ├── averageLatency: number
    │   ├── bestScore: number
    │   └── peakSpan: number
    ├── totalSessions: number
    ├── lastPlayedAt: timestamp
    └── updatedAt: timestamp
```

---

## Game Session Schema

| Field | Type | Description |
|---|---|---|
| `sessionId` | `string` | Unique session identifier (`session_<timestamp>_<random>`) |
| `gameType` | `string` | `"memory-span"` |
| `category` | `string` | `"working-memory"` |
| `facultyId` | `string` | `"memory"` |
| `modeId` | `string` | `"sequence_recall"` |
| `score` | `number` | Calculated drill score (e.g. `890`) |
| `accuracy` | `number` | Mean round accuracy percentage (`0`–`100`) |
| `span` | `number` | Memory span capacity achieved (`3`–`8`) |
| `streak` | `number` | In-game consecutive round streak |
| `responseTime` | `number` | Mean response latency in milliseconds |
| `totalRounds` | `number` | Total sequence recall rounds completed |
| `difficulty` | `string` | `"adaptive"` |
| `result` | `string` | `"success"` or `"completed"` |
| `completedAt` | `FieldValue` | `serverTimestamp()` |
| `completedAtLocal`| `string` | ISO string timestamp for local timezone calculations |

---

## Data Flow

```
1. GAME
   User launches Working Memory (Sequence Recall) on GameScreen.js.
   ↓
2. ENGINE (Decoupled Pure JS)
   MemoryEngine.js generates sequence, evaluates inputs, and adapts span.
   ↓
3. RESULT
   GameScreen.js transitions to ResultsScreen.js with engine summary.
   ResultsScreen.js calculates final performance index and displays score immediately.
   ↓
4. FIREBASE PERSISTENCE
   ResultsScreen.js invokes recordSessionAndRecalculate(uid, sessionPayload).
   - Writes document to users/{uid}/gameSessions/{sessionId}.
   - Updates faculty document users/{uid}/faculties/memory.
   - Updates user document users/{uid} with totalDrills, streak, accuracy, and index.
   ↓
5. FIRESTORE SYNC & STATE HYDRATION
   refreshProfile(uid) re-hydrates userProfile in AuthContext.
   ↓
6. HOME & ANALYTICS
   HomeScreen.js and ProgressScreen.js dynamically read real session counts,
   Cognitive Index, active streaks, and latency telemetry from Firestore.
```

---

## Security Rules

Implemented in `firestore.rules`:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;

      match /gameSessions/{sessionId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }

      match /sessions/{sessionId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }

      match /faculties/{facultyId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }

      match /{allSubcollections=**} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
  }
}
```

---

## Persistence Verification

1. **User Registration / Login**:
   - Register an account with email and password on `RegisterScreen.js`.
   - Verified that `users/{uid}` is created in Firestore with `profile`, `stats`, and `settings`.
2. **Playing Game Drill**:
   - Launch Working Memory on `GameScreen.js` and complete a session.
   - `ResultsScreen.js` renders the score and asynchronously saves to `users/{uid}/gameSessions/{sessionId}`.
3. **Firestore Document Creation**:
   - Verify in Firebase Console that `users/{uid}/gameSessions/{sessionId}` document appears with actual score, span, latency, accuracy, and server timestamp.
4. **Hard Refresh / Restart**:
   - Perform a hard refresh / reload.
   - `AuthContext` restores the session via `AsyncStorage`.
   - `HomeScreen.js`, `ProgressScreen.js`, and `ProfileScreen.js` load and display the exact persisted session statistics.

---

## Remaining Work (Deferred to Future Phases)
- Implementation of remaining 7 cognitive game engines (`focus`, `reaction`, `processing`, `decision`, `spatial`, `flexibility`, `logic`).
- Achievements and badges Firestore collection.
- Historical graph chart data aggregation.
- Offline guest queue sync on later account creation.
