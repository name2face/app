# Local-only overhaul — verification

The former Firebase app has been replaced with the implementation described in [README.md](README.md) and [SPECIFICATION.md](SPECIFICATION.md).

Verified on 2026-09-22:

- `npm run typecheck`: passed.
- `npm test -- --runInBand`: 49 tests across 6 suites passed. Includes real SQLite rollback, encrypted backup interoperability/tampering, browser migration, search, groups, and game eligibility.
- `npx expo install --check`: dependencies up to date.
- `npx expo export --platform all --output-dir dist`: web, iOS, and Android bundles exported successfully.
- Production web app in Chromium: add names and inline groups; reload persistence; combined recall; duplicate warning; edit names; save feedback; group rename and membership changes; confirmed person/group deletion; completed matching game; encrypted export/reset/restore; dark mode; offline entry.
- Responsive home grid: checked at 320px, 390px, and 1280px with no horizontal page overflow.
- Browser walkthrough recorded no runtime errors or external requests.
- `git diff --check`: passed.

Native bundle compilation is not physical-device runtime testing. Run [SCREENS_AND_STATES.md](SCREENS_AND_STATES.md) on iOS and Android before release, particularly keyboard behavior and native file sharing/picking. Existing Firebase records require a separate migration if they contain real user data; see [migration notes](docs/MIGRATION.md).

No production deployment, app-store submission, or remote data modification was performed.
