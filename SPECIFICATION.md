# Name2Face App - Specification Document (Draft)

This document outlines the planned features, design considerations, and technical decisions for the Name2Face application. It serves as a guide during development.

**Status:** Initial Draft - Requires detailed input.

## 1. Core Purpose & Vision

*   **Goal:** Help users easily remember names and associated details about people they meet.
*   **Primary Use Case:** Quickly log key info after meeting someone; easily retrieve it later.
*   **Target Audience:** [Decision Needed: Who specifically is this for? Professionals? Social networkers? Everyone?]

## 2. Core Features

*   **Add Person:**
    *   Mechanism: [Decision Needed: Button on main screen? Floating Action Button? Menu item?]
    *   Required Fields: [Decision Needed: Just Name? Or more initially?]
*   **View Person List:**
    *   Layout: [Decision Needed: Simple list? Cards? Include photo thumbnails?]
    *   Sort Order: [Decision Needed: Alphabetical by name? Date added? Last viewed?]
*   **View Person Details:**
    *   Layout: [Decision Needed: What info is displayed prominently? How are notes shown?]
*   **Add/Edit Notes:**
    *   Association: Notes are linked to a specific person.
    *   Editor: [Decision Needed: Simple multi-line text input? Rich text? Markdown?]
*   **Search/Filter:**
    *   Searchable Fields: [Decision Needed: Name only? Notes? Categories? All text?]
    *   Filter Options: [Decision Needed: By Category? By Date Met? Other criteria?]
    *   UI: [Decision Needed: Search bar always visible? Separate search screen?]
*   **Categorization:**
    *   Purpose: [Decision Needed: How will categories be used? Filtering? Organization?]
    *   Management: [Decision Needed: Predefined list? User-creatable categories? Both?]
    *   Assignment: [Decision Needed: One category per person? Multiple?]

## 3. Data Model (Information Stored)

*   **Per Person:**
    *   `id`: Unique identifier (likely generated automatically)
    *   `name`: [Type: Text, Required: Yes]
    *   `notes`: [Type: Text (potentially long), Required: No]
    *   `category`: [Type: Text or Link to Category ID, Required: No]
    *   `createdAt`: [Type: Date/Timestamp, Auto-set]
    *   `updatedAt`: [Type: Date/Timestamp, Auto-set]
    *   `photoUri`: [Decision Needed: Store path to local image? Type: Text, Required: No]
    *   `metContext`: [Decision Needed: Where/When met? Type: Text, Required: No]
    *   `otherField1`: [Decision Needed: Any other specific fields needed? E.g., Company, Phone?]
    *   `otherField2`: [...]
*   **Categories (If applicable):**
    *   `id`: Unique identifier
    *   `name`: [Type: Text, Required: Yes]

## 4. User Interface (UI) & User Experience (UX)

*   **Navigation:** [Decision Needed: Tab-based? Stack navigation (back button)? Combination?]
*   **Key Screens:**
    *   Main List Screen
    *   Person Detail Screen
    *   Add/Edit Person Screen
    *   Add/Edit Note Screen (Could be part of Person screen?)
    *   Search/Filter Screen (If separate)
    *   Settings Screen? [Decision Needed]
*   **Visual Design:** [Decision Needed: High-level thoughts on look and feel? Minimalist? Colorful? Follow platform conventions strictly?]
*   **Key Interactions:** [Describe important user flows, e.g., How does editing work? How is search triggered?]

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

## 7. Non-Functional Requirements

*   **Performance:** [Specify goals if needed, e.g., App loads quickly, scrolling is smooth]
*   **Security:** [Specify if handling sensitive data - data encrypted at rest?]
*   **Offline Capability:** [App should work fully offline if data is local]