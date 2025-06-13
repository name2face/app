# Name2Face App - Development TODO (V1 Moon Shot)

This document tracks the development progress for the full V1 implementation of the Name2Face app, based on the [Specification Document (Draft)](link/to/your/spec/document.md), the decision to use Firebase, an expanded scope including multiple authentication methods and a web target, client-side FTS, and native-only VTT.

**Backend Technology:** Firebase (Firestore Database, Authentication, Storage).

**Current Status:** Setting up the Firebase project and planning data model, authentication flows, client-side search strategy, and native-only VTT.

---

## 🎯 Overall Goals for V1 (Moon Shot)

*   Implement **all** core features AND V2+ considerations defined in the spec (including photos, structured details, **full-text search on Memory Hooks**).
*   Implement robust **Email/Password, Google, and Apple Authentication**.
*   Store all person data securely in Firebase (Firestore & Storage), linked to authenticated users.
*   Leverage Firebase's **built-in offline persistence and sync** for reads and writes on **iOS and Android**. **The web version will be online-only.**
*   Perform **full-text search on `memoryHooks` locally** on iOS and Android using data synced from Firebase persistence. Web search will query Firestore directly (limited capabilities).
*   Implement **Voice-to-Text input for `memoryHooks` (Native Only - availability may vary offline)**.
*   Provide the specified UI/UX, adapted for **Web** as well as native.
*   Meet non-functional requirements (performance - considering local processing/sync, **offline capability on native**, persistence, basic accessibility).
*   Prepare for deployment to **Google Play, App Store, and Web hosting**.

---

## ✅ Technical Foundation

*   [x] Confirm Platform Targets: iOS, Android, **Web (via React Native Web)**
*   [x] Confirm Framework: React Native + **React Native Web**
*   [x] Confirm Development Environment: Expo (Managed Workflow)
*   [x] Confirm Language: TypeScript
*   [x] Confirm Navigation Library: React Navigation
*   [x] Confirm Styling: React Native `StyleSheet` API, potentially requiring platform-specific adjustments.
*   [x] **DECISION:** Use **Firebase** for the backend (Firestore, Storage, Auth).
    *   Leverage Firebase SDKs' **built-in offline persistence and sync** for reads and writes on **iOS and Android only**.
    *   Implement **authenticated access** using Firebase Auth.
*   [x] **DECISION:** Implement **full-text search on `memoryHooks` locally** on **iOS and Android**. Web search will be limited to Firestore capabilities.
*   [x] **DECISION:** Implement **Voice-to-Text input for `memoryHooks` as Native Only** (not available on Web). Availability may depend on device offline capabilities.
*   [ ] Choose initial State Management: Start with React's built-in state (`useState`) and Context API (`useContext`). Re-evaluate if complexity warrants a change.

---

## 🚧 Development Tasks (Grouped by Feature)

### Feature: Project Setup & Core Libraries

*   [ ] Create new Expo/React Native project with TypeScript, configuring for React Native Web.
*   [ ] Install necessary dependencies (`react-navigation`, `@react-native-firebase/*` modules for Auth, Firestore, Storage, Google/Apple sign-in libs, `react-native-image-picker`).
*   [ ] Install a client-side full-text search library (e.g., `flexsearch`) for use on **native only**.
*   [ ] Install a **native-only** Speech-to-Text library (e.g., `react-native-voice`).
*   [ ] Create a new Firebase project.
*   [ ] Enable Auth methods (Email/Password, Google, Apple). Configure OAuth URIs.
*   [ ] Enable Firestore and Storage.
*   [ ] Add iOS, Android, and Web apps to Firebase, configure credentials.
*   [ ] Configure Firebase SDK in the app. Handle platform differences.
*   [ ] Enable Firestore persistence (`enablePersistence()`) for **native platforms only**.

### Feature: User Authentication

*   [ ] Implement UI for Login/Signup screen (responsive for Web).
*   [ ] Implement Email/Password signup/login/verification (cross-platform).
*   [ ] Implement Google Sign-in flow (requires separate native/web implementations).
*   [ ] Implement Apple Sign-in flow (requires separate native/web implementations).
*   [ ] Implement Logout functionality.
*   [ ] Manage authentication state globally.
*   [ ] Implement Route Protection based on authentication state (on all platforms).
*   [ ] **Define and implement Firebase Security Rules** (Firestore and Storage) based on `request.auth.uid`.

### Feature: Data Model & Initial Structure

*   [ ] **Define Firestore Data Model:** `persons` collection with `id`, `userId`, `name`, `memoryHooks`, `tags`, `gender`, `createdAt`, `updatedAt`, `photoUrl`, `photoStoragePath`, and **Structured Details** fields.
*   [ ] **Define Firebase Storage Structure:** `/photos/{userId}/{personId}/{fileName}`.
*   [ ] Write basic data access functions using Firestore SDK, filtering by `userId`.

### Feature: Local Data Cache for Native Search

*   [ ] **Implement a mechanism to load/maintain a local cache of necessary person data (`name`, `memoryHooks`, `tags`, `gender`) for the current user on iOS/Android.**
    *   Use Firestore's `onSnapshot` with persistence enabled to keep this cache updated with local and remote changes.
    *   This cache will power the client-side search on native.
*   [ ] Store this data efficiently for quick access by the native search function.
*   [ ] **Note:** The web version will not use this local cache.

### Feature: Add Person Flow

*   [ ] Create `Home Screen` UI (responsive for Web).
*   [ ] Implement navigation.
*   [ ] Create `Add Person Screen` UI (responsive for Web).
*   [ ] Implement name input validation.
*   [ ] Implement duplicate name check: Search the **local cache (native)** or query **Firestore (web)** for the current user's persons (case-insensitive).
*   [ ] Implement `Save` button logic (Quick Add): Perform duplicate check, add document to Firestore with `userId`. **Firebase SDK handles queuing if offline on native.**
*   [ ] Implement `Add Details` button logic: Navigate to `Add/Edit Details Screen`.

### Feature: Add/Edit Details Screen

*   [ ] Create `Add/Edit Details Screen` UI (responsive for Web). Includes inputs for all person data + photo + structured details.
*   [ ] Implement image selection/preview (`react-native-image-picker` is native-only, will need web file input).
*   [ ] Implement tag input/selection.
*   [ ] Implement structured details input UI (e.g., platform-appropriate DatePicker).
*   [ ] Display `createdAt` date.
*   [ ] Conditional display of `Delete` button (only in Edit mode).
*   [ ] **Implement Voice-to-Text Integration (Native Only):**
    *   [ ] Add Microphone Button UI near `memoryHooks` input.
    *   [ ] Use `Platform.OS` to **hide this button when not on iOS or Android**.
    *   [ ] Implement logic to start/stop native STT listener.
    *   [ ] Provide visual feedback when listening.
    *   [ ] Append transcribed text to `memoryHooks`.
    *   [ ] Implement error handling for native STT (including cases where STT is unavailable offline).
*   [ ] Implement data loading for Edit mode (fetch from Firestore by ID, scoped to user).
*   [ ] Implement `Save` button logic (Add/Edit): validation, duplicate check (local cache/Firestore), photo upload/delete (Storage), add/update Firestore document. **Firebase SDK queues writes/Storage ops if offline on native.**
*   [ ] Implement `Cancel` button logic.

### Feature: Delete Person

*   [ ] Implement `Delete` button UI (Edit mode, responsive for Web).
*   [ ] Implement confirmation dialog.
*   [ ] Implement deletion logic (scoped to current user): Delete photo from Storage, delete document from Firestore. **Firebase SDK queues if offline on native.**
*   [ ] Navigate back to `Home Screen`.
*   [ ] Ensure local cache is updated after delete (native).

### Feature: Search & View Details Flow

*   [ ] Create `Search Query Screen` UI (Inputs for Name, Memory Hooks, Tags, Gender, responsive for Web).
*   [ ] Implement `Search` button logic:
    *   Show loading feedback.
    *   **On iOS/Android:**
        *   Access the local cache.
        *   Perform **Client-Side Search (FTS + Filtering):** Search the local cache using the FTS library for `memoryHooks` and client-side filtering for Name (substring), Tags, Gender.
        *   Implement client-side **Relevance Scoring**.
        *   Navigate to `Search Results Screen` passing the *sorted* local results.
    *   **On Web:**
        *   Query **Firestore directly** based on criteria.
        *   **Note Search Limitations:** Web search will *not* support full-text `memoryHooks` search. Name search will use "Starts With" range queries. Tags/Gender will use direct queries.
        *   Implement client-side filtering/relevance scoring on the results fetched from Firestore.
        *   Navigate to `Search Results Screen` passing the *sorted* results from Firestore.
*   [ ] Create `Search Results Screen` UI (responsive for Web).
    *   Display list of results (local objects on native, Firestore results on web).
    *   Card UI: Name, context snippet (showing matched criteria based on platform's search capabilities), Photo thumbnail.
    *   Handle "No Results".
    *   Implement tapping a card: **Fetch the full, latest data from Firestore by ID** before navigating to `Person Detail Screen` (ensuring consistency regardless of how search results were generated).
*   [ ] Create `Person Detail Screen` UI (responsive for Web). Display fetched full person data.

### Feature: UI/UX Refinements

*   [ ] Implement consistent loading/disabled states.
*   [ ] Implement consistent validation feedback.
*   [ ] Implement confirmation dialogs.
*   [ ] Refine layout and styling for native and Web responsiveness.
*   [ ] Implement tag styling.
*   [ ] Add basic accessibility.

### Feature: React Native Web Adjustments

*   [ ] Test and adjust UI for Web compatibility and responsiveness.
*   [ ] Implement Web-specific authentication flows.
*   [ ] Address compatibility issues with libraries on Web (e.g., FTS library is native-only).
*   [ ] Ensure navigation works correctly on Web.
*   [ ] Ensure Firebase SDK is configured for Web.
*   [ ] **Ensure all Native-Only features (VTT, client-side FTS search on memory hooks) are correctly hidden, disabled, or replaced with web-appropriate alternatives (like simplified search).**
*   [ ] Implement Web-specific file input for photos.

### Feature: Offline & Sync Testing (Native Only)

*   [ ] **Extensive testing of Firebase's built-in offline persistence on iOS and Android:**
    *   Test all CRUD operations while offline.
    *   Verify data consistency in the local cache.
    *   Verify changes sync correctly when online.
    *   Test reading data while offline (should show cached data).
    *   Test conflict resolution ("Last Write Wins").
    *   Test Storage operations (upload/delete) offline sync.
*   [ ] **Test local search functionality while offline on native:** Ensure search uses the offline cache and is performant with representative data volumes.
*   [ ] **Test Voice-to-Text functionality on native devices (offline and online):** Verify permissions, recording, transcription, text insertion, and graceful handling when offline STT is not available.

### Feature: Deployment Preparation

*   [ ] Configure `app.json` for native builds.
*   [ ] Prepare signing keys/certificates.
*   [ ] Build release versions (iOS/Android).
*   [ ] Prepare for Web deployment (`expo export:web`, static hosting).
*   [ ] Publish to stores and host web version.

---

## 🔧 Technical Notes & Decisions

*   **Data Storage:** Firebase (Firestore, Storage, Auth). Data user-scoped.
*   **Offline Sync:** **Built-in** via Firebase SDK persistence for **iOS and Android only**. Web version is online. Reads use cached data. Writes are queued. Conflict resolution (Last Write Wins).
*   **Local Cache:** Needed for client-side search on **native**. Updated via Firestore listeners.
*   **Search:**
    *   On **Native**: Combination of limited Firestore queries (Name prefix, Tags, Gender) and **client-side Full-Text Search on `memoryHooks`** using a library against the local cache. Results combined/ranked client-side.
    *   On **Web**: Queries **Firestore directly**. `memoryHooks` search is **not available** in V1. Name search uses "Starts With".
    *   Detail screen loads fresh data from Firestore regardless of platform.
*   **Voice-to-Text:** **Native Only**. Requires RN STT library. UI hidden/disabled on Web. Availability offline depends on native OS capabilities.
*   **Authentication:** Email/Password, Google, Apple Sign-in via Firebase Auth. Requires managing user state and `userId` linking. Native/Web Auth flows differ.
*   **Security Rules:** **Critical** for multi-user data separation.
*   **React Native Web:** Adds significant complexity for UI, Auth, and implementing/disabling native-only features.
*   **Complexity:** High for V1 due to comprehensive scope, multiple auth methods, RN Web, Storage, platform-specific search/VTT, and managing Firebase offline implications.

---

## ❓ Open Questions for [Friend's Name]

*   Confirming again: For the Web version, is it fully acceptable that the **Memory Hooks search field will NOT function** in V1 due to technical limitations of Firestore queries on web? (Name, Tags, Gender search will work to the extent Firestore allows).
*   Are there any **specific structured details** (Birthday, Company, Job Title, etc.) that you want to prioritize and include *exactly* in this V1 "moon shot"? What are the specific fields, labels, and input types?
*   Are the Home Screen button/icon concepts (spinning plus/question mark) something you'd like custom assets for, or can we use standard UI elements styled similarly?
*   Do you have preferred UI patterns for the authentication screens (Login, Signup, Google/Apple buttons, email verification flow)?
