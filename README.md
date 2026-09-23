# Name2Face

A small, local-only app for remembering people. Save a name with memory hooks, groups, and notes; recall it later using whatever clue comes to mind.

## Features

- Four home tiles: Add a Name, Recall a Name, All Names, All Groups, plus Name Game.
- Single-page entry and editing. Only a name is required.
- Removable, normalized memory-hook tags and free-form searchable notes.
- Live recall: case-insensitive partial names, hooks, notes, and group filters. All entered clues must match.
- Multiple groups per person; create, rename, assign members, and delete groups without deleting people.
- Alphabetical and recently added directory views.
- Two-to-five-pair matching game using distinct names and hooks or notes.
- Password-encrypted backup export, validated restore, and confirmed local reset.
- System light/dark mode. No account, Firebase, photos, sync, analytics, or external contact database.

## Run

Use Node 24 (24.21.0 in the build configuration).

```sh
npm ci
npm start
# Or:
npm run web
npm run ios
npm run android
```

No environment variables or Firebase credentials are required. Rebuild any older native development client after installing the new native modules.

```sh
npm run typecheck
npm test -- --runInBand
npm run build
```

## Storage and privacy

Native apps store a relational SQLite database in the app sandbox. The web version uses browser localStorage, so it does not require a contact backend or special SQLite web headers. Web hosting still serves the app itself. Clearing browser storage removes that browser's library; browser storage is not shared between devices or origins. Native device backups may include app data according to the user's OS settings.

The database is not separately password-encrypted at rest. Exported backups are encrypted with AES-256-GCM and a password-derived key (PBKDF2-SHA256, 600,000 iterations, fresh salt and nonce). Users choose their own backup destinations. There is no password recovery. These are concrete storage properties, not guarantees of zero legal liability or absolute privacy.

## Existing data

Previous web guest-mode entries migrate automatically on first open. Old category tags become groups, legacy memory hooks become hook chips, and note text is retained. The old browser copy is removed only after the replacement has been saved successfully. Failed migration preserves the original data and displays an error.

Previous Firebase accounts and records are **not downloaded, modified, or deleted**. This version does not sign into Firebase. If you have real cloud records, export and plan their migration before replacing your installed app. See [migration notes](docs/MIGRATION.md).

## Implementation

See [the product specification](SPECIFICATION.md), [development guide](DEVELOPMENT.md), and [manual device checks](SCREENS_AND_STATES.md).
