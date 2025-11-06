/**
 * Person data model types based on SPECIFICATION.md
 */

export interface Person {
  id: string;
  userId: string;
  name: string;
  memoryHooks?: string;
  tags: string[];
  gender?: 'Female' | 'Male' | 'Other' | null;
  createdAt: Date;
  updatedAt: Date;
  photoUrl?: string;
  photoStoragePath?: string;
}

export interface PersonInput {
  name: string;
  memoryHooks?: string;
  tags?: string[];
  gender?: 'Female' | 'Male' | 'Other' | null;
  photoUrl?: string;
  photoStoragePath?: string;
}

export interface SearchQuery {
  name?: string;
  memoryHooks?: string;
  tags?: string[];
  gender?: 'Female' | 'Male' | 'Other' | null;
}

export interface SearchResult extends Person {
  relevanceScore: number;
  matchContext?: string;
}
