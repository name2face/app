# Contributing

Use Node 24 and install dependencies with `npm ci`. Run `npm start` for Expo or `npm run web` for the browser. No account or Firebase configuration is needed.

Keep the app focused on fast name entry and recall. Contact data must stay in local storage unless the user explicitly exports a backup. Do not add tracking, remote contact storage, or photos to this V1.

Before submitting changes:

```sh
npm run typecheck
npm test -- --runInBand
npm run build
```

For storage changes, preserve schema migration paths and test failure/rollback behavior. For backups, reject invalid data before replacement and keep encrypted files compatible. For mobile changes, run the applicable checks in SCREENS_AND_STATES.md on iOS and Android.

Use descriptive commits and explain the user-visible behavior and validation in pull requests. See DEVELOPMENT.md for architecture details.
