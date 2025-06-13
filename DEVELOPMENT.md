# Name2Face App - Development TODO (V1 Moon Shot)

This document tracks the development progress for the full V1 implementation of the Name2Face app, based on the [Specification Document (Draft)](link/to/your/spec/document.md) and the decision to use Firebase with an expanded scope including multiple authentication methods, a web target, and local full-text search on memory hooks.

**Backend Technology:** Firebase (Firestore Database, Authentication, Storage) will be used as the primary data store and backend.

**Current Status:** Setting up the Firebase project and planning the data model, authentication flows, and local search implementation strategy.

---

## 🎯 Overall Goals for V1 (Moon Shot)

*   Implement **all** core features AND V2+ considerations defined in the spec (including photos, structured details, and **full-text search on Memory Hooks**).
*   Implement robust **Email/Password, Google, and Apple Authentication**.
*   Store all person data, including photos and details, securely in Firebase (Firestore & Storage), linked to authenticated users.
*   Leverage Firebase's **built-in offline persistence and sync** for reads and writes across all platforms (iOS, Android, Web).
*   Perform **full-text search on `memoryHooks` locally** using data synced from Firebase.
*   Provide the specified UI/UX, including navigation, loading states, and visual design concepts, adapted for **Web** as well as native.
*   Meet non-functional requirements (performance, offline capability, persistence, basic accessibility).
*   Prepare for deployment to **Google Play, App Store, and Web hosting**.

---

## ✅ Technical Foundation

*   [x] Confirm Platform Targets: iOS, Android, **Web (via React Native Web)**
*   [x] Confirm Framework: React Native + **React Native Web**
*   [x] Confirm Development Environment: Expo (Managed Workflow)
*   [x] Confirm Language: TypeScript
*   [x] Confirm Navigation Library: React Navigation
*   [x] Confirm Styling: React Native `StyleSheet` API, potentially requiring platform-specific adjustments for Web.
*   [x] **DECISION:** Use **Firebase** for the backend (Firestore, Storage, Auth).
    *   Leverage Firebase SDKs' **built-in offline persistence and sync** for reads and writes.
    *   Implement **authenticated access** using Firebase Auth (Email/Password, Google, Apple).
*   [x] **DECISION:** Implement **full-text search on `memoryHooks` locally** on the client side, using data fetched from Firestore.
*   [ ] Choose initial State Management: Start with React's built-in state (`useState`) and Context API (`useContext`). Consider if a more robust solution is needed sooner due to authentication state management, global data cache for search, and data syncing complexity across features.

---

## 🚧 Development Tasks (Grouped by Feature)

### Feature: Project Setup & Core Libraries

*   [ ] Create new Expo/React Native project with TypeScript template, configuring for React Native Web.
*   [ ] Install necessary dependencies (`react-navigation`, `@react-native-firebase/app`, `@react-native-firebase/auth`, `@react-native-firebase/firestore`, `@react-native-firebase/storage`, libraries for Google/Apple sign-in, `react-native-image-picker`).
*   [ ] **Install a client-side full-text search library:** Choose and install a library suitable for JavaScript/TypeScript (e.g., `flexsearch`, `lunr.js`, or evaluate others).
*   [ ] Create a new project in the Firebase Console.
*   [ ] Enable Authentication methods (Email/Password, Google, Apple) in Firebase Console. Configure OAuth redirect URIs for web and native.
*   [ ] Enable Firestore and Storage in Firebase Console.
*   [ ] Add iOS, Android, and Web apps to the Firebase project and download/configure credentials (e.g., `firebaseConfig` for web, config files for native). Follow Expo setup steps.
*   [ ] Configure Firebase SDK in the app (initialize app). Handle potential platform differences in initialization.
*   [ ] Enable Firestore persistence (`enablePersistence()`) for native platforms. *Note: Web persistence is usually enabled by default or handled differently.*

### Feature: User Authentication

*   [ ] Implement UI for Login/Signup screen.
*   [ ] Implement Email/Password signup flow, including sending verification email.
*   [ ] Implement Email/Password login flow.
*   [ ] Implement handling for email verification.
*   [ ] Implement Google Sign-in flow (requires separate native and web implementations).
*   [ ] Implement Apple Sign-in flow (requires separate native and web implementations).
*   [ ] Implement Logout functionality.
*   [ ] Use Firebase Authentication State Listener (`onAuthStateChanged`) to manage the authenticated user globally.
*   [ ] Implement Route Protection: Ensure user is authenticated before accessing main app content.
*   [ ] **Define and implement Firebase Security Rules:**
    *   [ ] Firestore Rules: Users can only read/write *their own* data (`match /persons/{personId} { allow read, write: if request.auth.uid == resource.data.userId; }`). Ensure `userId` field is present and immutable on create.
    *   [ ] Storage Rules: Users can only upload/read/delete *their own* photos (`match /photos/{userId}/{fileName} { allow read, write: if request.auth.uid == userId; }`).

### Feature: Data Model & Initial Structure

*   [ ] **Define Firestore Data Model:**
    *   [ ] Top-level `persons` collection.
    *   [ ] Person Document Fields:
        *   `id`: Document ID (auto-generated).
        *   `userId`: `string` (ID of the authenticated user - **REQUIRED by Security Rules**).
        *   `name`: `string` (Required)
        *   `memoryHooks`: `string`
        *   `tags`: `string[]` (Array of strings)
        *   `gender`: `string | null`
        *   `createdAt`: `Timestamp` (Server timestamp)
        *   `updatedAt`: `Timestamp` (Server timestamp, update on edit)
        *   `photoUrl`: `string | null`
        *   `photoStoragePath`: `string | null`
        *   [ ] **Structured Details:** Add fields for V1 structured details (e.g., `birthday: Timestamp | null`, `company: string`, `jobTitle: string`).
*   [ ] **Define Firebase Storage Structure:** Recommend `/photos/{userId}/{personId}/{fileName}`.
*   [ ] Write basic data access functions using the Firestore SDK, ensuring all operations filter by the current user's `userId`.

### Feature: Local Data Cache for Search

*   [ ] **Implement a mechanism to load/maintain a local cache of all person data (or at least `name` and `memoryHooks`) for the current user.** This data is needed for client-side search.
    *   Option 1: Load all data for the user on app startup or after login. Subscribe to real-time updates (`onSnapshot`) to keep the local cache in sync with Firestore changes (both local persistence and remote).
    *   Option 2: Load data dynamically when the Search screen is accessed. Still need to handle updates.
*   [ ] Store this data efficiently in memory or a local state management solution for quick access by the search function.

### Feature: Add Person Flow

*   [ ] Create `Home Screen` component UI with the two primary buttons.
*   [ ] Implement navigation routes.
*   [ ] Create `Add Person Screen` component UI.
*   [ ] Implement name input validation.
*   [ ] Implement duplicate name check logic: Search the *local cache* of the current user's persons (case-insensitive) for a matching name.
*   [ ] Implement `Save` button logic (Quick Add):
    *   Show loading feedback.
    *   Perform local duplicate check.
    *   If no duplicate: Add new person document to Firestore (`userId`, `name`). **Firebase SDK automatically handles queuing this write if offline.**
    *   If duplicate: Show dialog. Handle dialog actions.
    *   On successful save: Navigate to `Home Screen`.
*   [ ] Implement `Add Details` button logic: Navigate to `Add/Edit Details Screen` passing the name (and indicating add mode).

### Feature: Add/Edit Details Screen

*   [ ] Create `Add/Edit Details Screen` component UI for all person data + photo.
*   [ ] Implement image selection/preview.
*   [ ] Implement tag input/selection.
*   [ ] Implement structured details input.
*   [ ] Implement data loading for Edit mode (fetch by ID from Firestore, scoped to user).
*   [ ] Implement `Save` button logic (handles both Add and Edit flows):
    *   Show loading feedback.
    *   Input validation.
    *   Duplicate name check: Search the *local cache* (scoped to current user, excluding current person in Edit mode).
    *   **Photo Handling:** If new photo, upload to Storage (`/photos/{userId}/{personId}/...`). Get URL/path. If photo removed, delete from Storage using path. **Firebase SDK automatically queues these Storage ops if offline.**
    *   **Firestore Save:** Add new or update existing document with all data, including `userId`, `photoUrl`, `photoStoragePath`, `updatedAt`. **Firebase SDK automatically queues this write if offline.**
    *   Navigate to `Person Detail Screen`.
*   [ ] Implement `Cancel` button logic.

### Feature: Delete Person

*   [ ] Implement `Delete` button UI (visible on Add/Edit Details Screen in Edit mode).
*   [ ] Implement confirmation dialog.
*   [ ] Implement deletion logic (scoped to current user):
    *   Delete Photo from Firebase Storage using `photoStoragePath`. **Firebase SDK queues if offline.**
    *   Delete document from `persons` collection by ID. **Firebase SDK queues if offline.**
*   [ ] Navigate back to `Home Screen` after successful deletion.
*   [ ] **Important:** Ensure the local cache is updated after a delete operation (either via the `onSnapshot` listener or manually).

### Feature: Search & View Details Flow

*   [ ] Create `Search Query Screen` component UI (Inputs for Name, Memory Hooks, Tags, Gender).
*   [ ] **Implement `Search` button logic:**
    *   Show loading feedback.
    *   Retrieve search terms from inputs.
    *   Access the local cache of all person data for the current user.
    *   **Perform Client-Side Search:** Filter the local cache based on **all** criteria:
        *   Name: Case-insensitive substring or "Starts With" match.
        *   Memory Hooks: Use the client-side FTS library to perform keyword search within `memoryHooks`.
        *   Tags: Check if the `tags` array contains any of the search tags.
        *   Gender: Filter by selected gender.
    *   Implement client-side **Relevance Scoring:** Rank results based on matches across all fields (Name > Tags > Memory Hooks > Gender).
    *   Navigate to `Search Results Screen` passing the *sorted* results.
*   [ ] Create `Search Results Screen` component UI:
    *   Display list of results (local objects, not necessarily fresh Firestore reads initially).
    *   Card UI: Name, context snippet (highlighting matches from Name, Tags, or *Memory Hooks* using the FTS library's capabilities if available), Photo thumbnail.
    *   Handle "No Results".
    *   Implement tapping a card: **Fetch the full, potentially most up-to-date person data from Firestore by ID** before navigating to `Person Detail Screen`, in case local cache is slightly stale during a sync.
*   [ ] Create `Person Detail Screen` component UI: Display fetched full person data.

### Feature: UI/UX Refinements

*   [ ] Implement consistent loading indicators and disabled button states.
*   [ ] Implement consistent validation feedback UI.
*   [ ] Implement confirmation dialogs.
*   [ ] Refine layout and styling for native and Web.
*   [ ] Implement styling for tags.
*   [ ] Add basic accessibility.

### Feature: React Native Web Adjustments

*   [ ] Test and adjust UI for Web.
*   [ ] Implement Web-specific authentication.
*   [ ] Address compatibility issues (especially the chosen local FTS library on Web).
*   [ ] Ensure navigation works on Web.
*   [ ] Ensure the local data cache mechanism works correctly with Firestore Web SDK and persistence.

### Feature: Offline & Sync Testing

*   [ ] **Extensive testing of Firebase's built-in offline persistence:**
    *   Test all CRUD operations while offline.
    *   Verify data consistency in the local cache while offline.
    *   Verify changes sync correctly when online.
    *   Test reads while offline (should show cached data from persistence).
    *   Test conflict resolution (Last Write Wins) by creating/editing same data points offline/online.
    *   Test Storage operations (upload/delete) offline sync.
*   [ ] **Test local search functionality while offline:** Ensure search uses the data available in the offline cache and is performant.

### Feature: Deployment Preparation

*   [ ] Configure `app.json` for native builds.
*   [ ] Prepare signing keys/certificates.
*   [ ] Build release versions (iOS/Android).
*   [ ] Prepare for Web deployment (`expo export:web`, static hosting).
*   [ ] Publish to stores and host web version.

---

## 🔧 Technical Notes & Decisions

*   **Data Storage:** Firebase (Firestore, Storage, Auth). Data is user-scoped.
*   **Offline Sync:** **Built-in** via Firebase SDK persistence. Data accessed while online is cached. Writes are queued and synced. Conflict resolution (Last Write Wins) is handled by Firebase.
*   **Local Cache:** A client-side mechanism is required to load and maintain a cache of user's person data for local search. This cache needs to stay updated via Firestore listeners.
*   **Search:**
    *   Firestore queries are used for Name ("Starts With"), Tags (`array-contains-any`), and Gender filtering.
    *   **Full-Text Search on `memoryHooks` is done client-side** on the local data cache using a dedicated library.
    *   Search results are combined and ranked **client-side**.
    *   Navigating from search results to detail screen should fetch the latest data from Firestore to ensure accuracy.
*   **Authentication:** Email/Password, Google, Apple Sign-in implemented via Firebase Auth. Requires managing user state and linking data via `userId`.
*   **Security Rules:** **Critical** for data privacy between users. Must be correctly implemented for Firestore and Storage.
*   **React Native Web:** Adds complexity for UI, authentication flows, and ensuring library compatibility.
*   **Complexity:** This "moon shot" V1 is complex due to combining multiple auth methods, RN Web, file storage, and client-side FTS on top of core CRUD and offline sync.

---

## ❓ Open Questions for [Friend's Name]

*   Are there any **specific structured details** (Birthday, Company, Job Title, etc.) that you want to prioritize and include *exactly* in this V1 "moon shot"? If so, what are the specific fields, labels, and input types (e.g., date picker for Birthday)?
*   Are the Home Screen button/icon concepts (spinning plus/question mark) something you'd like custom assets for, or can we use standard UI elements styled similarly?
*   Do you have preferred UI patterns for the authentication screens (Login, Signup, Google/Apple buttons, email verification flow)?
