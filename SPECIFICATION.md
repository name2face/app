# Name2Face App - Specification Document (V1 Final Draft)

This document outlines the planned features, design considerations, and technical decisions for the Name2Face application's Version 1 launch. It serves as the authoritative guide for development.

**Status:** Final Draft - Sections 1-4 & 6-7 finalized. Section 5 (Technical Decisions) requires final definition of three key implementation items.

## 1. Core Purpose & Vision (Finalized)

* **Goal:** Help users easily remember names and associated details ("memory hooks") about people they meet.
* **Primary Use Case:** Quickly log key info (at least name); easily retrieve it later by searching memory hooks or tags.
* **Target Audience:** Everyone (Focus on general usability for remembering names and key details).

## 2. Data Model (Confirmed)

The V1 data model consists of seven fields stored per person:

| Field | Type | Required | Notes |
| :--- | :--- | :--- | :--- |
| `id` | INTEGER | Yes | Unique identifier (Primary Key). |
| `name` | Text | Yes | Must be non-empty after trimming. |
| `memoryHooks`| Text (long) | No | Free-form notes; used for full-text search. |
| `tags` | Array of Text | No | Stores Quick Tags and Custom Tags. **V1 Strategy:** JSON string serialization for `expo-sqlite`. |
| `gender` | Text | No | Options: "Female", "Male", "Other", or `null` ("Prefer not to specify"). |
| `createdAt` | Timestamp | Yes | Auto-set. |
| `updatedAt` | Timestamp | Yes | Auto-set. |

---

## 3. Screen-by-Screen Specification (Confirmed UX/Order)

### 3.1 Home Screen (Navigation Hub)

| CTA Button/Card | Icon Concept | Action/Navigation |
| :--- | :--- | :--- |
| **New Name to Face** | Conceptual logo with a **plus sign** (`+`). | Navigates to the **Add Person Screen** (Quick Add). |
| **Recall Name to Face** | Conceptual logo with a **question mark** (`?`). | Navigates to the **Search Query Screen**. |

### 3.2 Add Person Screen (Quick Add Flow)

* **Purpose:** Capture name quickly.
* **Validation:** Name must be non-empty after trimming.
* **Loading Feedback:** **Spinning plus sign icon** while saving.
* **Duplicate Dialog:** If name exists, prompts user with options: `Add Details`, `Save Anyway`, or `Cancel`.

### 3.3 Add Details Screen (Full Detail Entry)

**Field Order is Finalized: Name, Gender, Tags, Notes.**

| Order | Component | Label/Behavior | Rules/Details |
| :--- | :--- | :--- | :--- |
| **1st** | **Name Input** | "Name". Editable. | Must be non-empty. |
| **2nd** | **Gender Selection** | "Gender (Optional)" Picker/Dropdown. | Options: "Prefer not to specify" (default), "Female", "Male", "Other". |
| **3rd** | **Tags Section** | **Title:** "The Goal of Remembering Who Someone Is and Where You Know Them From" | **Storage:** All tags are collected into one array. |
| | **Quick Tags** | Tappable chips: **`Work`**, **`Social`**, **`Event`**, **`Service`**, **`Hobby`**. | Tapping adds/removes the tag. |
| | **Custom Tags** | Dedicated **Input Field** (e.g., "Add Custom Tag"). | User types and confirms to add the tag. |
| **4th** | **Notes Input** | "Memory Hooks / Notes for Recall". | Maps to `memoryHooks` data field. |
| **Bottom** | **Button: `Save`** | Saves record. **Loading Feedback:** **Spinning plus sign icon**. | Navigates to **Person Detail Screen**. |

### 3.4 Edit Details Screen

* **Layout:** Identical to the Add Details Screen, with pre-populated, editable fields.
* **Action:** Includes a prominent **`Delete` button** that requires confirmation.
* **Save Logic:** Saves changes to the existing record.

### 3.5 Search Query Screen

**Field Order is Finalized to Mirror the Add Details Screen.**

| Order | Field / Component | Purpose | Search Logic |
| :--- | :--- | :--- | :--- |
| **1st** | **Name Input** | Search by partial name fragment. | Partial, case-insensitive match on `name`. |
| **2nd** | **Gender Filter** | Filter by a specific gender. | Filters records by `gender`. |
| **3rd** | **Tags Input/Selector** | Search by one or more tags. | Finds records that include **any** of the selected/typed tags (Case-Insensitive). |
| **4th** | **Memory Hooks Input** | Search by keywords in notes. | Executes **Full-Text Search (FTS)** on `memoryHooks`. |
| **Button** | **`Search`** | Executes query. **Loading Feedback:** **Spinning question mark icon**. | Uses **OR logic** across all populated fields. |

### 3.6 Search Results Screen

* **Sort Order:** **By Relevance** (most relevant match first).
* **Layout:** **Card Layout**. Each card shows the **`name`** and **context about the match** (snippet from memory hook or the matching tag).

### 3.7 Person Detail Screen

* **Display:** `Name` prominently. Conditionally displays `Tags` (as chips), `Gender` (if specified), `createdAt` date, and `Memory Hooks` text.
* **Action:** Includes an **`Edit` button** in the header.

---

## 4. Non-Functional Requirements (Confirmed)

* **Offline Capability:** App must work fully offline for V1.
* **Data Persistence:** Local data persists across app restarts.
* **Performance:** Search must be responsive, even with hundreds of entries.

---

## 5. Technical Decisions (Action Items Remain for Kevin)

The framework and storage decisions are set, but the specific search implementation details below must be defined to finalize the specification.

| Decision Area | Status | **Action Required to Finalize Spec** |
| :--- | :--- | :--- |
| **Framework/Storage** | Confirmed: React Native, Expo, TypeScript, **`expo-sqlite`**. | N/A |
| **Relevance Scoring Algorithm** | Established Weighting: **Name** (Highest) > **Tags** > **Memory Hooks** (Lowest). | Define the exact mathematical logic for weighting and scoring matches. |
| **FTS Implementation Plan** | Required for `memoryHooks`. | Define how to implement fast **Full-Text Search (FTS)** using `expo-sqlite`. |
| **Tag Search Strategy** | Storage is **JSON string serialization**. | Define the most efficient SQL query method to search for a tag within the serialized JSON string. |