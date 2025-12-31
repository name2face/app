import { Platform } from 'react-native';
import { Person, SearchQuery, SearchResult } from '../types';
import { getFirestoreService } from './firebase';

// Import flexsearch only for native platforms
let FlexSearch: any = null;
if (Platform.OS !== 'web') {
  FlexSearch = require('flexsearch');
}

export class SearchService {
  private index: any = null;
  private persons: Person[] = [];
  private userId: string | null = null;

  setUserId(userId: string | null) {
    this.userId = userId;
  }

  /**
   * Initialize the search index for native platforms
   */
  initializeIndex(persons: Person[]) {
    if (Platform.OS === 'web') {
      // Web doesn't use local index
      this.persons = persons;
      return;
    }

    // Create a new FlexSearch index for native
    this.index = new FlexSearch.Document({
      document: {
        id: 'id',
        index: ['name', 'memoryHooks', 'notes'],
        store: true,
      },
      tokenize: 'forward',
    });

    // Index all persons
    this.persons = persons;
    persons.forEach(person => {
      this.index.add({
        id: person.id,
        name: person.name,
        memoryHooks: person.memoryHooks || '',
        notes: person.notes ? person.notes.map(n => n.content).join(' ') : '',
      });
    });
  }

  /**
   * Update the index when persons change
   */
  updateIndex(persons: Person[]) {
    this.initializeIndex(persons);
  }

  /**
   * Search persons (client-side for native, Firestore for web)
   */
  async search(query: SearchQuery): Promise<SearchResult[]> {
    if (Platform.OS === 'web') {
      return this.searchWeb(query);
    } else {
      return this.searchNative(query);
    }
  }

  /**
   * Native search using local cache and FlexSearch
   */
  private searchNative(query: SearchQuery): SearchResult[] {
    const results: Map<string, SearchResult> = new Map();

    // Start with all persons if no filters
    let filteredPersons = [...this.persons];

    // Filter by gender if specified
    if (query.gender) {
      filteredPersons = filteredPersons.filter(p => p.gender === query.gender);
    }

    // Filter by tags if specified (OR logic - person has any of the tags)
    if (query.tags && query.tags.length > 0) {
      const searchTags = query.tags.map(t => t.toLowerCase());
      filteredPersons = filteredPersons.filter(p => {
        const personTags = p.tags.map(t => t.toLowerCase());
        return searchTags.some(st => personTags.includes(st));
      });
    }

    // Now apply name and memory hooks search
    filteredPersons.forEach(person => {
      let score = 0;
      let matchContext = '';

      // Name matching (highest weight)
      if (query.name && query.name.trim()) {
        const nameQuery = query.name.toLowerCase();
        const personName = person.name.toLowerCase();
        if (personName.includes(nameQuery)) {
          score += 100;
          const exactMatch = personName === nameQuery;
          const startsWithMatch = personName.startsWith(nameQuery);
          if (exactMatch) score += 50;
          else if (startsWithMatch) score += 25;
          matchContext = `Name: ${person.name}`;
        }
      }

      // Memory hooks search using FlexSearch
      if (query.memoryHooks && query.memoryHooks.trim() && this.index) {
        const searchResults = this.index.search(query.memoryHooks, { limit: 100 });
        const foundInMemory = searchResults.some((result: any) => 
          result.result.includes(person.id)
        );
        if (foundInMemory) {
          score += 30;
          // Get snippet from memory hooks
          const hooks = person.memoryHooks || '';
          const queryWords = query.memoryHooks.toLowerCase().split(/\s+/);
          const hooksLower = hooks.toLowerCase();
          const matchWord = queryWords.find(word => hooksLower.includes(word));
          if (matchWord) {
            const index = hooksLower.indexOf(matchWord);
            const start = Math.max(0, index - 30);
            const end = Math.min(hooks.length, index + 70);
            const snippet = (start > 0 ? '...' : '') + 
                          hooks.substring(start, end) + 
                          (end < hooks.length ? '...' : '');
            matchContext = matchContext ? `${matchContext}; Memory: ${snippet}` : `Memory: ${snippet}`;
          }
        }
      }

      // Notes search using FlexSearch
      if (query.notes && query.notes.trim() && this.index) {
        const searchResults = this.index.search(query.notes, { limit: 100, field: 'notes' });
        const foundInNotes = searchResults.some((result: any) => 
          result.result.includes(person.id)
        );
        if (foundInNotes) {
          score += 30;
          // Get snippet from notes
          const allNotes = person.notes ? person.notes.map(n => n.content).join(' ') : '';
          const queryWords = query.notes.toLowerCase().split(/\s+/);
          const notesLower = allNotes.toLowerCase();
          const matchWord = queryWords.find(word => notesLower.includes(word));
          if (matchWord) {
            const index = notesLower.indexOf(matchWord);
            const start = Math.max(0, index - 30);
            const end = Math.min(allNotes.length, index + 70);
            const snippet = (start > 0 ? '...' : '') + 
                          allNotes.substring(start, end) + 
                          (end < allNotes.length ? '...' : '');
            matchContext = matchContext ? `${matchContext}; Notes: ${snippet}` : `Notes: ${snippet}`;
          }
        }
      }

      // Tags match (already filtered above, but add to score)
      if (query.tags && query.tags.length > 0) {
        score += 20;
        const matchedTags = person.tags.filter(t => 
          query.tags!.some(qt => qt.toLowerCase() === t.toLowerCase())
        );
        if (matchedTags.length > 0 && !matchContext) {
          matchContext = `Tags: ${matchedTags.join(', ')}`;
        }
      }

      // Gender match (already filtered, add to score)
      if (query.gender) {
        score += 10;
      }

      // Only include if there's a match
      if (score > 0) {
        results.set(person.id, {
          ...person,
          relevanceScore: score,
          matchContext: matchContext || `Name: ${person.name}`,
        });
      }
    });

    // If no specific query criteria, return all filtered persons
    if (!query.name && !query.memoryHooks && (!query.tags || query.tags.length === 0) && !query.gender) {
      return filteredPersons.map(person => ({
        ...person,
        relevanceScore: 1,
        matchContext: `Name: ${person.name}`,
      })).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    }

    // Sort by relevance score
    return Array.from(results.values()).sort((a, b) => b.relevanceScore - a.relevanceScore);
  }

  /**
   * Web search using Firestore queries (limited capabilities)
   */
  private async searchWeb(query: SearchQuery): Promise<SearchResult[]> {
    if (!this.userId) {
      throw new Error('User not authenticated');
    }

    const firestore = getFirestoreService();
    const personsCollection = firestore.collection('persons');
    
    // Web search has limitations - can't do full-text search on memoryHooks
    // We'll query based on available fields and filter client-side
    
    let persons: Person[] = [];

    // Basic query for user's persons
    const q = firestore.query(
      personsCollection,
      firestore.where('userId', '==', this.userId)
    );

    const querySnapshot = await firestore.getDocs(q);
    persons = querySnapshot.docs.map((doc: any) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.() || data.createdAt,
        updatedAt: data.updatedAt?.toDate?.() || data.updatedAt,
      } as Person;
    });

    // Client-side filtering and scoring for web
    const results: SearchResult[] = [];

    persons.forEach(person => {
      let score = 0;
      let matchContext = '';
      let matches = false;

      // Name search (starts with or contains)
      if (query.name && query.name.trim()) {
        const nameQuery = query.name.toLowerCase();
        const personName = person.name.toLowerCase();
        if (personName.includes(nameQuery)) {
          matches = true;
          score += 100;
          if (personName === nameQuery) score += 50;
          else if (personName.startsWith(nameQuery)) score += 25;
          matchContext = `Name: ${person.name}`;
        }
      }

      // Note: memoryHooks full-text search not available on web in V1
      // Basic keyword matching as fallback
      if (query.memoryHooks && query.memoryHooks.trim()) {
        const keywords = query.memoryHooks.toLowerCase().split(/\s+/);
        const hooksLower = (person.memoryHooks || '').toLowerCase();
        if (keywords.some(keyword => hooksLower.includes(keyword))) {
          matches = true;
          score += 30;
          const matchWord = keywords.find(word => hooksLower.includes(word));
          if (matchWord) {
            const hooks = person.memoryHooks || '';
            const index = hooksLower.indexOf(matchWord);
            const start = Math.max(0, index - 30);
            const end = Math.min(hooks.length, index + 70);
            const snippet = (start > 0 ? '...' : '') + 
                          hooks.substring(start, end) + 
                          (end < hooks.length ? '...' : '');
            matchContext = matchContext ? `${matchContext}; Memory: ${snippet}` : `Memory: ${snippet}`;
          }
        }
      }

      // Notes search for web
      if (query.notes && query.notes.trim()) {
        const keywords = query.notes.toLowerCase().split(/\s+/);
        const allNotes = person.notes ? person.notes.map(n => n.content).join(' ') : '';
        const notesLower = allNotes.toLowerCase();
        if (keywords.some(keyword => notesLower.includes(keyword))) {
          matches = true;
          score += 30;
          const matchWord = keywords.find(word => notesLower.includes(word));
          if (matchWord) {
            const index = notesLower.indexOf(matchWord);
            const start = Math.max(0, index - 30);
            const end = Math.min(allNotes.length, index + 70);
            const snippet = (start > 0 ? '...' : '') + 
                          allNotes.substring(start, end) + 
                          (end < allNotes.length ? '...' : '');
            matchContext = matchContext ? `${matchContext}; Notes: ${snippet}` : `Notes: ${snippet}`;
          }
        }
      }

      // Tags search
      if (query.tags && query.tags.length > 0) {
        const searchTags = query.tags.map(t => t.toLowerCase());
        const personTags = person.tags.map(t => t.toLowerCase());
        if (searchTags.some(st => personTags.includes(st))) {
          matches = true;
          score += 20;
          const matchedTags = person.tags.filter(t => 
            searchTags.includes(t.toLowerCase())
          );
          if (!matchContext) {
            matchContext = `Tags: ${matchedTags.join(', ')}`;
          }
        }
      }

      // Gender filter
      if (query.gender) {
        if (person.gender === query.gender) {
          matches = true;
          score += 10;
        } else {
          matches = false; // Gender is a hard filter
        }
      }

      if (matches) {
        results.push({
          ...person,
          relevanceScore: score,
          matchContext: matchContext || `Name: ${person.name}`,
        });
      }
    });

    // If no query criteria, return all persons
    if (!query.name && !query.memoryHooks && (!query.tags || query.tags.length === 0) && !query.gender) {
      return persons.map(person => ({
        ...person,
        relevanceScore: 1,
        matchContext: `Name: ${person.name}`,
      })).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    }

    return results.sort((a, b) => b.relevanceScore - a.relevanceScore);
  }
}

export const searchService = new SearchService();
