# Name2Face App - Specification Document (Draft)

This document outlines the planned features, design considerations, and technical decisions for the Name2Face application. It serves as a guide during development.

**Status:** Draft - Initial decisions made, further details pending.

## 1. Core Purpose & Vision

*   **Goal:** Help users easily remember names and associated details ("memory hooks") about people they meet.
*   **Primary Use Case:** Quickly log key info (at least name) after meeting someone; easily retrieve it later by searching memory hooks.
*   **Target Audience:** Everyone (Focus on general usability for remembering names and key details).

## 2. Core Features

*   **Add Person:**
    *   Mechanism: Tapping the primary `New Name to Face` button/card on the initial "Home Screen". This action will navigate the user to the "Add Person" screen.
    *   Required Fields: Name (Only the name is required to initially save a person).
    *   Add Person Screen Flow: This screen will primarily feature an input field for the **Person's Name**. After entering the name, the user can save immediately. Optionally, this screen must provide a clear way (e.g., a button like "Add Details") to navigate to the "Add/Edit Details Screen" to input additional information *before* saving, or allow saving just the name and adding details later.

*   **Add/Edit Memory Hooks & Tags:**
    *   Association: Hooks, Tags, and Gender are linked to a specific person.
    *   Editor ("Add/Edit Details Screen"): Provides inputs for optional details:
        *   `memoryHooks`: A simple multi-line text input for free-form notes, anecdotes, conversation points, etc.
        *   `tags`: UI elements for adding structured tags:
            *   Buttons for suggested common tags (e.g., `Work`, `Social`, `Location`, `Group`, `Hobby`, `Service Provider`). Tapping adds the tag.
            *   (Optional V1) A small text input to add custom tags (e.g., user types `#ProjectX`).
        *   `gender`: Simple selection control (e.g., buttons: Female / Male / Other) allowing selection of zero or one option.

*   **Search & View Results:**
    *   Recall Trigger: Tapping `Recall Name to Face` on the home screen navigates to the `Search Query Screen`.
    *   Search Query Screen: Presents input fields corresponding to searchable data (`Name` fragment, `memoryHooks` keywords, `Tags`). Users fill in any known details. Gender could also be a search criterion here.
    *   Search Execution: A button triggers the search based on the query screen inputs.
    *   Search Results Screen: Displays a list of people matching the search criteria.
        *   Layout: **Cards**. Each card should display the person's `name` and ideally some context about the match (e.g., the `tag` or `memoryHook` keyword that matched).
        *   Sort Order: **By Relevance** (most relevant matches first, based on the query inputs).

*   **View Person Details:**
    *   Accessed by tapping a card on the `Search Results Screen`.
    *   Layout: [Decision Needed: What info is displayed prominently? How are notes shown?] *(Need to revisit this - Likely Name, Gender, Tags, and the full Memory Hooks)*

*   **Search/Filter:** (Mechanism Description)
    *   Searchable Fields: `name`, `memoryHooks` content, `tags`, `gender`.
    *   Filter Options: Filtering happens *implicitly* via the `Search Query Screen` inputs.
    *   UI: The primary search UI is the dedicated `Search Query Screen`.

## 3. Data Model (Information Stored)

*   **Per Person:**
    *   `id`: Unique identifier (auto-generated)
    *   `name`: [Type: Text, Required: Yes]
    *   `memoryHooks`: [Type: Text (potentially long), Required: No]
    *   `tags`: [Type: Array of Text, Required: No]
    *   `gender`: [Type: Text (e.g., "Female", "Male", "Other", or null), Required: No]
    *   `createdAt`: [Type: Date/Timestamp, Auto-set]
    *   `updatedAt`: [Type: Date/Timestamp, Auto-set]
    *   `photoUri`: [Decision Needed: Store path to local image? Type: Text, Required: No]
*   **(Categories section removed)**

## 4. User Interface (UI) & User Experience (UX)

*   **Navigation:** [Decision Needed: Tab-based? Stack navigation (back button)? Combination?] *(Likely Stack Navigation: Home -> Add/Search -> Results -> Details)*
*   **Key Screens:**
    *   Home Screen (with `New Name to Face` / `Recall Name to Face` buttons)
    *   Add Person Screen (Name input + option to Add Details)
    *   Add/Edit Details Screen (Memory Hooks text area, Tag buttons/input, Gender selection)
    *   Search Query Screen
    *   Search Results Screen (Card layout)
    *   Person Detail Screen (Full view of saved info)
    *   Settings Screen? [Decision Needed]
*   **Visual Design:** [Decision Needed: High-level thoughts on look and feel? Minimalist? Colorful? Follow platform conventions strictly?]
*   **Key Interactions:**
    *   Adding a Person (Home -> Add Person -> [Optional Add Details] -> Save)
    *   Recalling a Person (Home -> Search Query -> Enter Hooks/Tags -> Search -> View Results -> View Details)
    *   Editing a Person (Find person via search -> View Details -> Edit button -> Add/Edit Details Screen -> Save)

## 5. Technical Decisions

*   **Platform Targets:** iOS, Android (Confirmed)
*   **Framework:** React Native (Confirmed)
*   **Development Environment:** Expo (Managed Workflow) (Confirmed)
*   **Language:** TypeScript (Confirmed)
*   **State Management:** [Decision Needed: Start with basic React state? Context API? Zustand? Redux Toolkit? Choose later?]
*   **Data Storage:** [Decision Needed: Local device only (using AsyncStorage, SQLite, WatermelonDB)? Cloud sync (requires backend/service)? Start local, plan for sync?]
*   **Styling:** [Decision Needed: StyleSheet API? Styled Components? Tailwind variant?]
*   **Navigation Library:** [Decision Needed: React Navigation (most common)?]

## 6. Future Considerations / Version 2+

*   [Idea: Import/Export data?]
*   [Idea: Reminders/Follow-ups?]
*   [Idea: Sync across devices?]
*   [Idea: Grouping/Events?]
*   [Idea: Add Photos (if not in V1)]
*   [Idea: Advanced Search/Filter options on Results screen?]

## 7. Non-Functional Requirements

*   **Performance:** [Specify goals if needed, e.g., App loads quickly, search is responsive]
*   **Security:** [Specify if handling sensitive data - data encrypted at rest?] *(If storing photos or very personal notes, consider encryption)*
*   **Offline Capability:** App should work fully offline (Data stored locally).