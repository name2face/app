export interface Person {
  id: string;
  fullName: string;
  notes: string;
  tags: string[];
  groupIds: string[];
  createdAt: string;
  updatedAt: string;
}
export interface Group {
  id: string;
  name: string;
}
export interface Library {
  version: 1;
  people: Person[];
  groups: Group[];
}
export interface RecallFilter {
  name: string;
  group: string;
  tags: string[];
  notes: string;
}
export const emptyLibrary = (): Library => ({
  version: 1,
  people: [],
  groups: [],
});
