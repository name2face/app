# Name2Face App - Specification Document (Draft)

This document outlines the planned features, design considerations, and technical decisions for the Name2Face application. It serves as a guide during development.

**Status:** Draft - Sections 1-4 refined. Technical Decisions (Section 5) pending detailed review.

## 1. Core Purpose & Vision

*   **Goal:** Help users easily remember names and associated details ("memory hooks") about people they meet.
*   **Primary Use Case:** Quickly log key info (at least name) after meeting someone; easily retrieve it later by searching memory hooks or tags.
*   **Target Audience:** Everyone (Focus on general usability for remembering names and key details).

## 2. Core Features

*   **Add Person:**
    *   Mechanism: Tapping the primary `New Name to Face` button/card on the `Home Screen`. This action will navigate the user to the `Add Person Screen`.
    *   **`Add Person Screen` Flow:**
        1.  The screen prominently displays a text input field labeled "Person's Name". Input should be trimmed of leading/trailing whitespace.
        2.  As the user types a name (must be non-empty after trimming), two buttons become active below the input field: `Save` and `Add Details`.
        3.  **Tapping `Save`:**
            *   Perform a case-insensitive check if a person with the entered name already exists in the database.
            *   **If the name does NOT exist:** Create a new person record saving *only* the trimmed name. Navigate back to the `Home Screen`. (`memoryHooks`, `tags`, `gender` will be null/empty).
            *   **If the name DOES exist:**
                *   Display a confirmation dialog:
                    *   **Title:** "Duplicate Name"
                    *   **Message:** "A person named '[Entered Name]' already exists. Do you want to add this person again?"
                    *   **Buttons:**
                        *   **`Add Details` (Recommended):** Navigates the user to the `Add Details Screen`, passing the entered name along (does *not* save yet). This encourages adding differentiating information.
                        *   **`Save Anyway`:** Creates a new person record saving *only* the trimmed name (allowing the duplicate). Navigates back to the `Home Screen`.
                        *   **`Cancel`:** Dismisses the dialog, returning the user to the `Add Person Screen` with the name still in the input field.
        4.  **Tapping `Add Details`:**
            *   Does *not* save yet.
            *   Navigates the user to the `Add Details Screen`, passing the entered name along. The duplicate check will happen later if the user saves from the `Add Details Screen`.

*   **Add Details Screen:** *(Used when adding details for a new person)*
    *   **Purpose (Add Flow):** Allows the user to add `memoryHooks`, `tags`, and `gender` for a *new* person *after* entering the name on the `Add Person Screen`.
    *   **Accessed From:** `Add Person Screen` (via the `Add Details` button or the `Add Details` option in the duplicate name dialog).
    *   **Visible Title:** "Add Details" or "Add Details for [Name]".
    *   **Layout & Components (Add Flow):**
        *   **Name Input:** A text input field at the top, labeled "Name". It will be **pre-filled** with the name passed from the `Add Person Screen` and **remains editable**. Input should be trimmed of leading/trailing whitespace before saving.
        *   **Free Form Input:** A large, multi-line text input field below the Name.
            *   **Label:** "Memory Hooks / Notes for Recall".
            *   **Purpose:** For free-form notes, anecdotes, conversation points, dates, physical descriptions, etc. Data entered here maps to the `memoryHooks` field in the data model. This text is intended for search recall.
        *   **Quick Tags:** A section below the free-form input with tappable buttons/chips for common associations.
            *   **Label:** "Quick Tags".
            *   **Suggested Tags:** `Work`, `Social`, `Acquaintance`, `Service Provider`, `Hobby / Interest`.
            *   **Interaction:** Tapping a tag adds it to the person's tag list. Tapping again removes it.
        *   **Custom Tags:** UI elements for adding user-defined tags:
            *   An area displaying currently added tags (both Quick Tags and custom ones, e.g., as chips/badges). Tapping an added tag removes it.
            *   A text input field (labeled e.g., "Add Custom Tag") with an 'Add' button (or uses Enter key) to add user-defined tags.
            *   *(Data Model Note: Selected Quick Tags and Custom Tags are stored together in the `tags` array field.)*
        *   **Gender Selection (Optional):** Placed towards the bottom.
            *   **Label:** "Gender (Optional)".
            *   **UI:** Picker/Dropdown menu.
            *   **Options:** "Prefer not to specify" (default, saves `null`), "Female", "Male", "Other".
        *   **Action Buttons (Bottom - Add Flow):**
            *   **`Save` Button:**
                1.  Validate input (e.g., Name field should not be empty after trimming).
                2.  Perform a case-insensitive check if a person with the name currently in the *editable Name input field* (after trimming) already exists in the database.
                3.  **If the name does NOT exist:** Save the complete new person record (trimmed name, `memoryHooks` text, selected `tags`, and `gender`) to the database. Navigate to the `Person Detail Screen` for the newly added person.
                4.  **If the name DOES exist:**
                    *   Display a confirmation dialog:
                        *   **Title:** "Duplicate Name"
                        *   **Message:** "A person named '[Entered Name]' already exists. Save this new entry anyway?"
                        *   **Buttons:**
                            *   **`Save Anyway`:** Saves the complete new person record (allowing the duplicate). Navigates to the `Person Detail Screen` for the *newly added* person.
                            *   **`Cancel`:** Dismisses the dialog, returning the user to the `Add Details Screen` with all entered information intact.
            *   **`Cancel` Button:** Discards all input from this screen *and* the preceding `Add Person Screen`. Prompts user for confirmation (e.g., "Discard this new entry?"). If confirmed, navigates back to the `Home Screen`.
    *   **Note:** The `Delete` button is **not present or is disabled** when accessing this screen via the `Add Details` flow for a new person.

*   **Edit Person Details:**
    *   **Accessed From:** `Person Detail Screen` (via the `Edit` button).
    *   **Navigation:** Navigates to the **`Edit Details Screen`** (which may reuse the same component as the `Add Details Screen`, but in an "Edit" mode).
    *   **`Edit Details Screen`:**
        *   **Purpose (Edit Flow):** Allows editing *all* details (`name`, `memoryHooks`, `tags`, `gender`) of an *existing* person.
        *   **Visible Title:** "Edit Details" or "Edit [Original Name]".
        *   **Layout & Components (Edit Flow):** Similar layout to the `Add Details Screen`, but pre-populated with all existing data for that person. All fields are editable (Name, Memory Hooks, Tags management, Gender). The `name` input should have leading/trailing whitespace trimmed before saving.
        *   **Action Buttons (Bottom - Edit Flow):**
            *   **`Save` Button:**
                1.  Validate input (e.g., Name field should not be empty after trimming).
                2.  Get the potentially modified `name`, `memoryHooks`, `tags`, and `gender` from the input fields. Trim leading/trailing whitespace from the `name`.
                3.  **Duplicate Name Check:**
                    *   Let `editedPersonId` be the ID of the person being edited.
                    *   Let `newName` be the trimmed name entered by the user.
                    *   Perform a case-insensitive check to see if *another* person (i.e., a record with an ID different from `editedPersonId`) already exists with `newName`.
                    *   **If a different person with `newName` exists:**
                        *   Display a confirmation dialog:
                            *   **Title:** "Name Already Exists"
                            *   **Message:** "A different person named '[newName]' already exists. Save changes anyway?"
                            *   **Buttons:**
                                *   **`Save Anyway`:** Proceed to the next step (save the changes).
                                *   **`Cancel`:** Dismisses the dialog, returning the user to the `Edit Details Screen` with the changes still in the input fields.
                    *   **If no different person with `newName` exists OR the user tapped `Save Anyway`:**
                        *   Save *all* the changes (potentially including the duplicated `newName`, updated `memoryHooks`, `tags`, `gender`, and `updatedAt` timestamp) to the existing record identified by `editedPersonId`.
                        *   Navigate back to the `Person Detail Screen` for the edited person.
            *   **`Cancel` Button:** Discards any changes made since entering the `Edit Details Screen`. Navigates back to the `Person Detail Screen`.
            *   **`Delete` Button:** **Present and active**. Initiates the delete confirmation flow described below.

*   **Delete Person:**
    *   **Trigger:** The `Delete` button on the **`Edit Details Screen`**.
    *   **Confirmation:** Standard confirmation dialog ("Delete [Person's Name]? This action cannot be undone.").
    *   **Action:** If confirmed, permanently removes the person's record from the database.
    *   **Navigation after Deletion:** Upon successful deletion, the user should be navigated back to the **Home Screen**.

*   **Search & View Results:**
    *   Recall Trigger: Tapping `Recall Name to Face` on the home screen navigates to the `Search Query Screen`.
    *   Search Query Screen: Presents input fields corresponding to searchable data (`Name` fragment, `memoryHooks` keywords, `Tags`). Users fill in any known details. Gender could also be a search criterion here. (Layout detailed in Section 4).
    *   Search Execution: A button triggers the search based on the query screen inputs.
    *   Search Results Screen: Displays a list of people matching the search criteria.
        *   Layout: **Cards**. Each card should display the person's `name` prominently. Below the name, display **context about the match**, such as the specific `tag`(s) that matched the query or a short snippet from the `memoryHooks` containing the matched keyword(s). [Implementation detail: Show best match context first].
        *   Sort Order: **By Relevance** (most relevant matches first, based on the relevance factors defined below).
        *   Interaction: Tapping a card navigates to the `Person Detail Screen` for that individual.
        *   Handle "No Results" state gracefully (e.g., display a message "No matches found").

*   **View Person Details:**
    *   Accessed by tapping a card on the `Search Results Screen`.
    *   Layout: Information should be presented clearly, generally in this order. Sections for Tags, Gender, and Memory Hooks should only be displayed if they contain data.
        *   Display `Name` prominently at the top.
        *   **If `tags` exist:** Display `Tags` below the name (e.g., as chips/badges). If no tags are associated, this section is hidden.
        *   **If `gender` was specified** (i.e., value is not `null` and not "Prefer not to specify"): Display it below the tags (or name if no tags) using standard, non-emphasized text (e.g., "Gender: Female"). If gender is `null` or "Prefer not to specify", this line is hidden.
        *   Display the `createdAt` date below the gender (or tags/name if gender is hidden). Use a clear, readable format (e.g., "Date Added: July 24, 2024").
        *   **If `memoryHooks` text exists:** Display the full `Memory Hooks` text below the date added (potentially in a scrollable area if long). If `memoryHooks` is null or empty, this section is hidden.
        *   Include an **`Edit` button located in the screen header** (e.g., top-right corner). Tapping this navigates to the `Edit Details Screen`.

*   **Search/Filter:** (Mechanism Description)
    *   Searchable Fields: `name`, `memoryHooks` content (full text search recommended), `tags` (search for presence of specific tags), `gender`. Searches on `name`, `memoryHooks`, and `tags` should be **case-insensitive**.
    *   Filter Options & Logic: Filtering happens implicitly via the `Search Query Screen` inputs. The search finds results matching **any** of the specified criteria. Results are then **ranked by relevance**.
    *   Relevance Factors: Relevance is primarily determined by the **number and type** of criteria matched. Matching more criteria increases relevance. Matches are generally weighted with `name` matches being most important, followed by `tags`, then `memoryHooks`. (Exact scoring algorithm TBD).
    *   UI: The primary search UI is the dedicated `Search Query Screen`.

## 3. Data Model (Information Stored)

*   **Per Person:**
    *   `id`: Unique identifier (auto-generated, likely INTEGER PRIMARY KEY in SQLite)
    *   `name`: [Type: Text, Required: Yes]
    *   `memoryHooks`: [Type: Text (potentially long), Required: No] - General free-form notes entered in the main text area.
    *   `tags`: [Type: Array of Text, Required: No] - Stores both selected Quick Tags and custom tags. (Will need serialization for SQLite, e.g., JSON string or separate table)
    *   `gender`: [Type: Text (e.g., "Female", "Male", "Other", or null), Required: No]
    *   `createdAt`: [Type: Date/Timestamp, Auto-set]
    *   `updatedAt`: [Type: Date/Timestamp, Auto-set]
    *   `photoUri`: [Deferred to V2 - Not included in V1]

## 4. User Interface (UI) & User Experience (UX)

*   **Navigation:** **Stack Navigation** using **React Navigation**. Key flows updated below.
*   **Key Screens:**
    *   **Home Screen:** Displays two prominent, distinct calls to action.
        *   **Initial Design Concept for Buttons:**
            *   Both buttons are envisioned as variations of a conceptual app logo: a square with rounded corners, a blue background, and the silhouette of a light gray, forward-facing bald person's head.
            *   **`Recall Name to Face` Button:** The silhouette contains a question mark that is the same blue as the background. Text label: "Recall Name to Face" (or similar, placed appropriately with the icon).
            *   **`New Name to Face` Button:** Similar design, but the silhouette contains a plus sign (same blue as the background) instead of a question mark. Text label: "New Name to Face" (or similar, placed appropriately with the icon).
        *   These buttons/cards initiate the respective flows:
            *   `New Name to Face`: Initiates the flow for adding a new person.
            *   `Recall Name to Face`: Navigates to the `Search Query Screen`.
    *   **`Add Person Screen`:** (Name input + `Save` [to Home] and `Add Details` [to Add Details Screen] buttons)
    *   **`Add Details Screen`:** (Accessed from `Add Person`. Contains editable Name, Memory Hooks, Quick Tags, Custom Tags, Gender. Save -> Person Detail, Cancel -> Home)
    *   **`Edit Details Screen`:** (Accessed from `Person Detail`. Pre-populated, fully editable. Save -> Person Detail, Cancel -> Person Detail, Delete -> Confirmation -> Home)
    *   **`Search Query Screen`:** Presents input fields corresponding to searchable data. Users fill in any known details to initiate a search.
        *   **Name Input:** A standard text input field for partial name matching.
        *   **Memory Hooks Input:** A text input field for keywords to search within memory hooks.
        *   **Tags Input:** A text input field where users can type one or more tags to search for (e.g., comma-separated).
        *   **Gender Filter:** Include a Picker/Dropdown labeled "Gender" to filter by. Options: "Any" (default), "Female", "Male", "Other", "Not Specified".
    *   **`Search Results Screen`:** (Card layout, display context for match, handle "No Results" state). Each card should display the person's `name` prominently. Below the name, display **context about the match**, such as the specific `tag`(s) that matched the query or a short snippet (e.g., max 1-2 lines or ~100 characters) from the `memoryHooks` containing the matched keyword(s).
    *   **`Person Detail Screen`:** (Full view of saved info, Edit button in header)
    *   **Settings Screen?** [Decision: Defer for V1]
*   **Visual Design:** **Initial focus on functionality**. Aim for a clean, minimalist look following basic platform conventions (e.g., standard fonts, simple color palette with one accent color). Emphasize clear visual hierarchy, adequate spacing, and aim for good default accessibility (e.g., sufficient contrast, reasonable tap target sizes). Detailed styling TBD (with specific concepts like the Home Screen buttons noted above).
*   **Key Interactions:**
    *   **Adding a Person (Quick Add):** Home -> `Add Person Screen` -> Enter Name -> Tap `Save` -> [Duplicate Check Dialog?] -> Back to Home.
    *   **Adding a Person (With Details):** Home -> `Add Person Screen` -> Enter Name -> Tap `Add Details` -> `Add Details Screen` -> (Optionally edit name), Fill Details (Hooks, Tags, Gender) -> Tap `Save` -> [Duplicate Check Dialog?] -> Navigate to `Person Detail Screen`.
    *   **Recalling a Person:** Home -> `Search Query Screen` -> Enter Hooks/Tags/Name/Gender -> Tap `Search` -> `Search Results Screen` -> Tap Result -> `Person Detail Screen`.
    *   **Editing a Person:** (Find person via search) -> `Search Results Screen` -> Tap Result -> `Person Detail Screen` -> Tap `Edit` button -> `Edit Details Screen` -> Modify Details -> Tap `Save` -> [Duplicate Check Dialog?] -> Back to `Person Detail Screen`.
    *   **Deleting a Person:** (Find person) -> `Person Detail Screen` -> Tap `Edit` button -> `Edit Details Screen` -> Tap `Delete` button -> Confirm Dialog -> Tap `Confirm Delete` -> Navigate to `Home Screen`.

## 5. Technical Decisions

*   **Platform Targets:** iOS, Android (Confirmed)
*   **Framework:** React Native (Confirmed)
*   **Development Environment:** Expo (Managed Workflow) (Confirmed)
*   **Language:** TypeScript (Confirmed)
*   **State Management:** **Start with React's built-in state (`useState`) and Context API (`useContext`)** as needed for V1. More advanced solutions (Zustand, RTK) can be adopted later if complexity warrants.
*   **Data Storage:** **Local device only using `expo-sqlite`** for V1. This allows structured relational data storage and querying suitable for the search requirements. (Ensure FTS - Full-Text Search - is considered for `memoryHooks` searching).
*   **Styling:** **React Native `StyleSheet` API** for V1. Provides basic styling capabilities integrated with React Native.
*   **Navigation Library:** **React Navigation** (Confirmed).
*   **Tag Storage Strategy:** [Decision: Use **JSON string** serialization in Person table for V1 simplicity. Revisit for V2 if advanced tag querying is needed].

## 6. Future Considerations / Version 2+

*   [Idea: Add Photos (`photoUri` field already reserved)]
*   [Idea: Import/Export data?]
*   [Idea: Reminders/Follow-ups?]
*   [Idea: Sync across devices?]
*   [Idea: Grouping/Events?]
*   [Idea: Advanced Search/Filter options on Results screen?]
*   [Idea: Settings Screen (Deferred from V1)]
*   [Idea: Data Backup/Restore mechanism]
*   [Idea: Dedicated input fields for specific details like structured Birthdays, Anniversaries, Company, etc. with appropriate UI (e.g., Date Pickers)]
*   [Idea: Dedicated search filters for specific fields added in V2+]

## 7. Non-Functional Requirements

*   **Performance:** App should load quickly, search should be responsive even with hundreds of entries (especially `memoryHooks` search).
*   **Security:** Data is stored unencrypted locally in V1 (No highly sensitive data anticipated initially). Encryption could be added if requirements change.
*   **Offline Capability:** App *must* work fully offline for V1 (core requirement).
*   **Data Persistence:** Data stored locally persists across app restarts but may be lost on app uninstall or device loss (no cloud backup in V1).