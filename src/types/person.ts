/**
 * Person data model types based on SPECIFICATION.md
 */

export interface Note {
  id: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Person {
  id: string;
  userId: string;
  name: string;
  notes: Note[];
  tags: string[];
  gender?: 'Female' | 'Male' | 'Other' | null;
  createdAt: Date;
  updatedAt: Date;
  photoUrl?: string;
  photoStoragePath?: string;
  // Legacy field support
  memoryHooks?: string;
}

export interface PersonInput {
  name: string;
  notes?: Note[];
  tags?: string[];
  gender?: 'Female' | 'Male' | 'Other' | null;
  photoUrl?: string;
  photoStoragePath?: string;
  // Legacy field support
  memoryHooks?: string;
}

export interface SearchQuery {
  name?: string;
  notes?: string; // Search text for notes
  tags?: string[];
  gender?: 'Female' | 'Male' | 'Other' | null;
  // Legacy field support
  memoryHooks?: string;
}

export interface SearchResult extends Person {
  relevanceScore: number;
  matchContext?: string;
}
