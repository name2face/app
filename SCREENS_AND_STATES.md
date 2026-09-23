# Device verification checklist

Run these on an iPhone and Android device before release. Web browser checks and bundle exports do not replace native runtime testing.

- First install opens Home without login or network access.
- Four tiles fit on small screens and at large text settings; Name Game is easy to reach. Light/dark mode follows the OS.
- Name-only save works; whitespace-only save is disabled. Pending hook text saves. Comma/Enter creates a hook. Notes allow line breaks.
- Keyboard appears only when tapped. Name, hooks, notes, and Save remain reachable by scrolling above the keyboard.
- Duplicate warning allows edit, save separately, and cancel. Editing keeps ID and creation date.
- Closing/reopening retains names, empty groups, tags, and assignments.
- Recall matches name fragments, multiple hooks, group plus note, and Unicode; no matches has helpful text. None excludes grouped people.
- Group create/rename rejects case-insensitive duplicates. Assign/unassign works. Group deletion preserves names and other memberships.
- Game handles 0/1/2/5 eligible entries, notes-only entries, repeated clues, incorrect guesses, completion, and replay. Long text is readable by scrolling.
- File share sheet exports a password-encrypted backup; cancelled share/pick is handled. Restore with the right password preserves all relations; wrong password/damaged data leaves existing data untouched.
- Cancelling restore changes nothing. Confirming restore replaces data. Reset requires DELETE plus confirmation, and does not resurrect migrated guest records.
- Storage failure displays an error rather than reporting success or silently clearing the library.
- No Firebase initialization, account prompts, camera/photo access, or contact transmission occurs.

The SQLite file itself uses the app sandbox, not separate database encryption. Review native OS backup settings and actual hardware file-sharing behavior before store submission.
