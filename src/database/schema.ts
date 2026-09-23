export const SCHEMA_VERSION = 1;
export const SCHEMA = `
CREATE TABLE person (id TEXT PRIMARY KEY NOT NULL, full_name TEXT NOT NULL, notes TEXT NOT NULL,
  created_at TEXT NOT NULL, updated_at TEXT NOT NULL);
CREATE TABLE groups (id TEXT PRIMARY KEY NOT NULL, name TEXT NOT NULL UNIQUE COLLATE NOCASE);
CREATE TABLE tags (name TEXT PRIMARY KEY NOT NULL);
CREATE TABLE person_groups (person_id TEXT NOT NULL REFERENCES person(id) ON DELETE CASCADE,
  group_id TEXT NOT NULL REFERENCES groups(id) ON DELETE CASCADE, PRIMARY KEY(person_id, group_id));
CREATE TABLE person_tags (person_id TEXT NOT NULL REFERENCES person(id) ON DELETE CASCADE,
  tag_name TEXT NOT NULL REFERENCES tags(name) ON DELETE CASCADE, PRIMARY KEY(person_id, tag_name));
CREATE INDEX person_name ON person(full_name COLLATE NOCASE);
CREATE INDEX group_members ON person_groups(group_id);
CREATE INDEX tag_people ON person_tags(tag_name);
PRAGMA user_version = 1;
`;
