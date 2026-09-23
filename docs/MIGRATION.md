# Transition from Firebase

The new app does not initialize Firebase or authenticate users. Removing an SDK from this repository does not delete remote Firebase accounts, contacts, images, or databases. No remote resources were changed during this overhaul.

## Browser guest data

On the same browser origin, the previous `name2face_offline_persons` localStorage value is migrated on first open. Existing category tags become groups, legacy memory-hook text becomes hook tags, and notes are joined into the new free-form field. A valid replacement is persisted before the old copy is removed. If migration fails, the original remains intact and startup shows the error. Test with a copy before a production rollout.

## Cloud records

There is no automatic import of Firebase records or native Firestore caches. Keep the old installation/export path available until any real records have been exported. A future migration utility should map user-owned records to the versioned Library schema, preserve meaningful IDs/dates, handle groups and notes, validate the graph, and produce an encrypted Name2Face backup. Do not silently discard or merge people with identical names.

Native SQLite has a new `name2face-local.db` file. Existing Firebase cache files, remote data, and service configuration must be handled separately if retiring the old service. The new reset control clears the new library only.
