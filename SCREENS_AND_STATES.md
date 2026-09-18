# Screens and States Documentation

## Global App States

### Authentication States
- **Not Logged In**: No user, `isLoggedOutMode: false`
- **Logged In**: User exists, Firebase auth active
- **Logged Out Mode**: User deliberately using app without login, `isLoggedOutMode: true`

### Network States
- **Online**: `isNetworkOffline: false`
- **Offline**: `isNetworkOffline: true` (detected via `navigator.onLine`)

---

## Screen Inventory

### 1. **LoginScreen** (`src/screens/LoginScreen.tsx`)
**Route**: `Login`
**Access**: When not logged in AND not in logged out mode

**States**:
- [ ] Not Signed Up (initial)
- [ ] Sign In Mode (default)
- [ ] Sign Up Mode (toggle)
- [ ] Loading (during auth)
- [ ] Error (auth failed)
- [ ] Logged Out Mode Preview (showing Add/Search/List options)
- [x] Forgot Password Mode (IMPLEMENTED - ForgotPasswordScreen)

**Current Capabilities**:
- ✅ Email/password sign in
- ✅ Email/password sign up
- ✅ Toggle between sign in/up
- ✅ Try app in logged out mode (Add/Search/List buttons)
- ✅ Forgot password link and flow
- ❌ OAuth (Google/Apple - noted for future)

---

### 2. **HomeScreen** (`src/screens/HomeScreen.tsx`)
**Route**: `Home` (first screen when logged in or in logged out mode)
**Access**: When user is logged in OR in logged out mode

**States**:
- [ ] Logged In Mode (user email shown, Sign Out button visible)
- [ ] Logged Out Mode (logged out mode indicator shown, "Back to Login" button)
- [ ] Sync Status (when syncing logged out data to Firebase - FUTURE)
- [ ] Network Offline (show indicator when no internet)
- [ ] Data Loading (initial load from Firebase or localStorage)

**Current Capabilities**:
- ✅ Display user email (if logged in)
- ✅ Show logged out mode indicator
- ✅ Action cards: Add Person, Search, View Contacts
- ✅ Sign Out button (logged in only)
- ✅ Back to Login button (logged out mode only)
- ✅ Try Logged Out Mode button (logged in, not in logged out mode)
- ❌ Offline/Online status banner
- ❌ Sync status display
- ❌ Data conflict resolution UI

---

### 3. **AddPersonScreen** (`src/screens/AddPersonScreen.tsx`)
**Route**: `AddPerson`
**Access**: When logged in or in logged out mode

**States**:
- [ ] Quick Add Mode (just name, check for duplicates)
- [ ] Duplicate Found (show options: edit or create new)
- [ ] Loading (checking for duplicates)
- [ ] Error (duplicate check failed)

**Current Capabilities**:
- ✅ Quick add with name only
- ✅ Duplicate detection
- ✅ Navigate to AddDetails after adding
- ❌ Photo capture/upload (UI missing)
- ❌ Tag suggestions

---

### 4. **AddDetailsScreen** (`src/screens/AddDetailsScreen.tsx`)
**Route**: `AddDetails` with params `{ personId?: string; name?: string }`
**Access**: After quick add or from person detail

**States**:
- [ ] New Person (no personId, name provided)
- [ ] Edit Mode (personId provided)
- [ ] Loading Details
- [ ] Error (save failed)
- [ ] Photo Uploading
- [ ] Syncing to Cloud (if logged in - FUTURE)

**Current Capabilities**:
- ✅ Gender selection
- ✅ Memory hooks input
- ✅ Tags input
- ✅ Save/Update person
- ❌ Photo upload from camera/gallery
- ❌ Voice-to-text for memory hooks
- ❌ Real-time sync indicator

---

### 5. **EditDetailsScreen** (`src/screens/EditDetailsScreen.tsx`)
**Route**: `EditDetails` with params `{ personId: string }`
**Access**: From person detail screen

**States**:
- [ ] Loading Person Data
- [ ] Editing
- [ ] Saving
- [ ] Error (save failed)
- [ ] Success (saved, ready to navigate back)

**Current Capabilities**:
- ✅ Load person data
- ✅ Edit all fields
- ✅ Save changes
- ❌ Photo update
- ❌ Conflict resolution (if offline during edit)

---

### 6. **SearchQueryScreen** (`src/screens/SearchQueryScreen.tsx`)
**Route**: `SearchQuery`
**Access**: From Home screen "Search" button

**States**:
- [ ] Empty Query (no filters selected)
- [ ] Query Building (user entering search criteria)
- [ ] Searching (in progress)
- [ ] No Results Found
- [ ] Results Ready
- [ ] Error (search failed)
- [ ] Logged Out Mode (searching local storage)
- [ ] Online Mode (searching Firestore)

**Current Capabilities**:
- ✅ Search by name
- ✅ Filter by gender
- ✅ Filter by tags
- ✅ Search by memory hooks (logged out mode only)
- ✅ Search by notes
- ❌ Recent searches
- ❌ Saved searches
- ❌ Search suggestions

---

### 7. **SearchResultsScreen** (`src/screens/SearchResultsScreen.tsx`)
**Route**: `SearchResults` with params `{ results: SearchResult[] }`
**Access**: After search query

**States**:
- [ ] Results Displayed
- [ ] No Results
- [ ] Loading (if results need processing)
- [ ] Empty Results (valid search with no matches)

**Current Capabilities**:
- ✅ Display search results
- ✅ Show relevance score
- ✅ Navigate to person detail
- ❌ Filter results by type (person/tag/memory)
- ❌ Sort options
- ❌ Save results

---

### 8. **PersonDetailScreen** (`src/screens/PersonDetailScreen.tsx`)
**Route**: `PersonDetail` with params `{ personId: string }`
**Access**: From search results, contacts list, or direct navigation

**States**:
- [ ] Loading Person Data
- [ ] Displaying Details
- [ ] No Photo
- [ ] Photo Loading
- [ ] Error (person not found)
- [ ] Delete Confirmation
- [ ] Deleting
- [ ] Related Contacts (if any)

**Current Capabilities**:
- ✅ Display person data (name, gender, tags, memory hooks, notes, photo)
- ✅ Edit button (navigate to EditDetails)
- ✅ Delete button
- ❌ Photo lightbox/zoom
- ❌ Related contacts list
- ❌ Tag click (navigate to other people with same tag)
- ❌ Share contact
- ❌ Export data

---

### 9. **ContactsListScreen** (`src/screens/ContactsListScreen.tsx`)
**Route**: `ContactsList`
**Access**: From Home screen "View Contacts" button

**States**:
- [ ] Loading Contacts
- [ ] Displaying List (sorted by date)
- [ ] Empty (no contacts yet)
- [ ] Filtering by Tag (FUTURE)
- [ ] Sorting (by name, date, tags)
- [ ] Searching Within List (quick search)
- [ ] Syncing (if new contacts from cloud)

**Current Capabilities**:
- ✅ Load and display all contacts (logged in or logged out mode)
- ✅ Show contact count
- ✅ Display name, memory hooks, tags
- ✅ Navigate to person detail on tap
- ❌ Search within contacts
- ❌ Filter by tag with count
- ❌ Sorting options
- ❌ Batch operations (select multiple)
- ❌ Export contacts

---

## State Machine Summary

### Global Navigation Flow

```
┌─────────────┐
│  LoginScreen│
└──────┬──────┘
       │
       ├─► Sign In ──► HomeScreen (logged in)
       │
       ├─► Sign Up ──► HomeScreen (logged in)
       │
       └─► Try Logged Out Mode ──► HomeScreen (logged out mode)
                                   │
                                   ├─► AddPerson ──► AddDetails
                                   │
                                   ├─► SearchQuery ──► SearchResults ──► PersonDetail
                                   │
                                   ├─► ContactsList ──► PersonDetail
                                   │
                                   ├─► PersonDetail ──► EditDetails
                                   │
                                   └─► Back to Login ──► LoginScreen
```

---

## Priority Implementation Order

### Phase 1: Authentication (In Progress)
- [x] Sign In / Sign Up
- [x] Logout
- [x] Logged Out Mode
- [x] Forgot Password (IMPLEMENTED)
- [ ] Email Verification
- [ ] OAuth Integration

### Phase 2: Core Features (Core complete, needs refinement)
- [x] Add Person (Quick add)
- [x] Add/Edit Details
- [x] Search (local and Firebase)
- [x] View Contacts List
- [x] View Person Details
- [ ] Edit Person Details (UI refinement)
- [ ] Delete Person with confirmation

### Phase 3: Offline & Sync
- [x] Logged Out Mode with localStorage
- [ ] Detect network changes (foundation laid)
- [ ] Queue operations while offline
- [ ] Sync on reconnect
- [ ] Conflict resolution
- [ ] Data persistence across sessions

### Phase 4: UI/UX Polish
- [ ] Error messages (user-friendly)
- [ ] Loading states and spinners
- [ ] Empty states with helpful messages
- [ ] Tag buttons with counts (ContactsList)
- [ ] Image upload/camera
- [ ] Voice-to-text memo

### Phase 5: Advanced Features
- [ ] Recent searches
- [ ] Saved searches
- [ ] Batch operations
- [ ] Data export/import
- [ ] Image gallery
- [ ] Backup/restore

---

## Known Issues & TODOs

1. ~~**LoginScreen**: No forgot password feature~~ ✅ DONE
2. **All Screens**: Limited error handling / user feedback
3. **PersonDetailScreen**: No photo lightbox or zoom
4. **ContactsListScreen**: No tag filtering or sorting
5. **Navigation**: All screens now have back buttons for navigation
6. **Network**: Online/offline detection foundation exists but not fully utilized
7. **Sync**: No offline→online sync mechanism yet
8. **Mobile**: Native features (STT, camera) not yet implemented
