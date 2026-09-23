# Name2Face — local V1

## Product

Quickly enter a person's name and a few details, then reverse the process to recall the name from those details. No photos or account are needed.

## Screens

1. **Home:** 2×2 Add a Name / Recall a Name / All Names / All Groups grid, full-width Name Game, settings gear.
2. **Add / Edit:** Full name (required), optional multiple groups, hook chips, free-form Notes & Reminders. Comma, Enter, or Add hook commits a chip; saving also commits pending hook text. Keyboard opens on tap. Duplicate names offer editing an existing entry, saving separately, or cancelling.
3. **Recall:** Same field order; live results under the form. Partial, case-insensitive matching. Every entered field and hook narrows the result (AND); each hook may match a substring of any saved hook. All groups means everyone; None means ungrouped. Specific group means membership in that group. Clear clues restores the initial state.
4. **All Names:** Total count, text filter, A–Z sections or newest first. Tap a card for details, editing, or confirmed deletion.
5. **All Groups:** Counts, group member directories, create/rename, membership editing, confirmed deletion. Deleting a group removes only that membership.
6. **Name Game:** Choose all, none, or a specific group. Randomly select up to five eligible entries; tap a name and clue in either order. Correct pairs lock and show a checkmark; mistakes permit retry. Show attempts, completion, replay, and home. At least two entries with distinct names and clues are required; duplicate names/clues and empty clues are excluded to avoid ambiguous answers. Hooks are used when available, otherwise notes.
7. **Settings:** Encrypted JSON export, file-picker restore, and reset. Export requires a matching password of at least ten characters. Restore decrypts and validates the entire graph, then asks before replacing. Reset requires typing DELETE and a second confirmation. Device/browser storage behavior is explained.

## Design

System light/dark themes, warm neutral surfaces, green actions, and a muted orange game banner. Clearly labeled fields, touch-friendly controls, flexible text wrapping, accessible buttons, scrollable forms, and helpful empty/error states. No fabricated sample people.

## Data rules

People have stable IDs, full name, notes, hook strings, group IDs, creation/update dates. Groups have stable IDs and names. Names are trimmed; hook strings are trimmed, lowercased, and deduplicated. Groups are unique ignoring case. Names can duplicate with a warning. Limits: 200-character names, 100-character hooks/group names, 10,000-character notes, 100 hooks per person, 50,000 people and 5,000 groups per import. Backup files are capped at 20 MB.

Native SQLite uses person/groups/tags and membership tables with foreign keys and schema versioning. Writes and restores are atomic. Web uses a single validated localStorage snapshot. Changes publish to React state only after successful persistence. Read errors never silently reset the library.

## Intentional interpretations of the Gemini discussion

- All/None are search concepts. During entry, None clears assignments and individual group chips assign memberships; All is not a stored group.
- Five-pair matching is the chosen game; multiple choice was a suggestion, not a required second mode.
- Encrypted backups use a real password and authenticated encryption rather than labeling plain JSON encrypted.
- Notes remain free-form and searchable. They are not calendar reminders or notifications.
- Fast live search is implemented without claiming a universal sub-5ms performance guarantee.
- Local storage removes the contact backend; it does not establish a legal liability guarantee.
