# Development

Use Node 24, `npm ci`, then `npm start`. Native builds require the standard Expo iOS/Android toolchains. No server credentials are needed.

## Modules

- `src/types`: library, person, group, and search types.
- `src/database/schema.ts`: version 1 relational schema; foreign keys, indexes, `user_version`.
- `src/database/storage.ts`: native SQLite initialization and transactional snapshots.
- `src/database/storage.web.ts`: browser persistence and one-time guest-data migration.
- `src/contexts/LibraryContext.tsx`: serialized mutations, error-aware initialization, shared reactive state.
- `src/services/library.ts`: search, normalization, graph validation, group removal, game eligibility/shuffle.
- `src/services/backupCodec.ts`: authenticated encryption and strict backup validation.
- `src/services/backupFiles(.web).ts`: native sharing/picking or browser download/upload.
- `src/components`: themed controls, confirmations, cards, group/tag inputs.
- `src/screens`: the product flows. `src/navigation`: native-stack navigation.

## Persistence

The provider serializes mutations so one write cannot race another. Native saves validate a snapshot and replace the relational contents in an exclusive SQLite transaction. An exception rolls back the entire write. This is deliberately simple for personal libraries; very large libraries may benefit from incremental writes and SQL-driven filtering in a future performance pass. Search currently filters the already-loaded library in memory for consistent native/browser substring behavior, including Unicode.

Database initialization enables foreign keys and WAL before migration. Version 0 initializes version 1 inside a transaction; a newer unsupported schema is rejected without erasing data. Future schemas must add migrations that retain records.

Browser `setItem` persists one complete snapshot; write errors propagate and state remains unchanged. The old guest-data key is retired only after a successful replacement. This is a single-window app; concurrent editing in multiple browser tabs is not synchronized.

## Backups

Envelope: format `name2face.encrypted-backup`, version 1, AES-256-GCM, PBKDF2-SHA256, fixed 600,000 iterations, 16-byte salt, 12-byte nonce, hex ciphertext with authentication tag. Randomness comes from Expo Crypto `getRandomValues`; encryption uses Noble libraries. Key byte buffers are cleared after use. Only the encrypted envelope is written to a temporary native file, which is cleaned up after sharing. Imported files are picked as cache copies and removed after reading.

Wrong passwords, tampering, unsupported formats, duplicate IDs/groups, missing foreign keys, and invalid values are rejected before replacement. Empty groups and timestamps round-trip. Restore is explicitly replace-only; no automatic cloud migration or name-based merging.

## Verification

```sh
npm run typecheck
npm test -- --runInBand
npm run build
npx expo export --platform ios --platform android --output-dir /tmp/name2face-native-export
```

Tests cover combined recall, literal wildcard characters, normalization, group deletion, game ambiguity, backup validation, cryptographic interoperability/tampering, browser migration/quota failure, and SQLite transaction rollback using Node's actual SQLite engine. Native hardware behaviors need the checklist in SCREENS_AND_STATES.md.

Expo SQLite reference: https://docs.expo.dev/versions/latest/sdk/sqlite/
