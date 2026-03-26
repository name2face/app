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
  private isLoggedOutMode = false;

  setUserId(userId: string | null) {
    this.userId = userId;
  }

  setLoggedOutMode(isLoggedOut: boolean) {
    this.isLoggedOutMode = isLoggedOut;
    console.log('🔍 SearchService.setLoggedOutMode:', isLoggedOut);
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
   * Search persons (client-side for native, Firestore for web, local for logged out mode)
   */
  async search(query: SearchQuery): Promise<SearchResult[]> {
    // If in logged out mode, use local search with stored persons
    if (this.isLoggedOutMode || Platform.OS === 'web' && !this.userId) {
      console.log('🔍 Using local search (logged out mode or no user)');
      return this.searchLocal(query);
    }

    if (Platform.OS === 'web') {
      return this.searchWeb(query);
    } else {
      return this.searchNative(query);
    }
  }

  /**
   * Local search using in-memory persons array
   */
  private searchLocal(query: SearchQuery): SearchResult[] {
    console.log('🔍 searchLocal called with query:', JSON.stringify(query));
    console.log('   Available persons:', this.persons.length);
    console.log('   Available genders:', Array.from(new Set(this.persons.map(p => p.gender))));
    console.log('   Available tags:', Array.from(new Set(this.persons.flatMap(p => p.tags))));
    
    const results: Map<string, SearchResult> = new Map();

    // Filter by gender if specified (hard filter - must match)
    let filteredPersons = [...this.persons];
    if (query.genders && query.genders.length > 0) {
      console.log('   🔍 Gender filter requested:', query.genders);
      console.log('   📊 Persons before gender filter:', filteredPersons.length);
      filteredPersons.forEach(p => {
        const isMatch = query.genders!.includes(p.gender!);
        console.log(`     ${isMatch ? '✓' : '✗'} "${p.name}" gender="${p.gender}" vs query=[${query.genders!.join(',')}]`);
      });
      filteredPersons = filteredPersons.filter(p => query.genders!.includes(p.gender!));
      console.log('   📊 Persons after gender filter:', filteredPersons.length);
    }

    // Filter by tags if specified (OR logic - person has any of the tags)
    if (query.tags && query.tags.length > 0) {
      console.log('   🔍 Tags filter requested:', query.tags);
      console.log('   📊 Persons before tag filter:', filteredPersons.length);
      console.log('   📋 All available tags in database:', 
        Array.from(new Set(this.persons.flatMap(p => p.tags))).join(', '));
      const searchTags = query.tags.map(t => t.toLowerCase());
      console.log('   Lowercased search tags:', searchTags);
      filteredPersons.forEach(p => {
        const personTags = p.tags.map(t => t.toLowerCase());
        const hasMatch = searchTags.some(st => personTags.includes(st));
        console.log(`     ${hasMatch ? '✓' : '✗'} "${p.name}" tags [${p.tags.join(',')}] vs query [${query.tags.join(',')}]`);
      });
      filteredPersons = filteredPersons.filter(p => {
        const personTags = p.tags.map(t => t.toLowerCase());
        return searchTags.some(st => personTags.includes(st));
      });
      console.log('   After tag filter:', filteredPersons.length);
    }

    // Now apply name and memory hooks search with scoring
    filteredPersons.forEach(person => {
      let score = 0;
      let matchContext = '';
      let hasMatch = false;

      // Name matching (highest weight)
      if (query.name && query.name.trim()) {
        const nameQuery = query.name.toLowerCase();
        const personName = person.name.toLowerCase();
        if (personName.includes(nameQuery)) {
          hasMatch = true;
          score += 100;
          const exactMatch = personName === nameQuery;
          const startsWithMatch = personName.startsWith(nameQuery);
          if (exactMatch) score += 50;
          else if (startsWithMatch) score += 25;
          matchContext = `Name: ${person.name}`;
        }
      }

      // Memory hooks search
      if (query.memoryHooks && query.memoryHooks.trim()) {
        console.log(`   Searching memory hooks for "${query.memoryHooks}" in "${person.name}"`);
        const hooksQuery = query.memoryHooks.toLowerCase();
        const hooks = person.memoryHooks?.toLowerCase() || '';
        if (hooks.includes(hooksQuery)) {
          hasMatch = true;
          score += 30;
          console.log(`     ✓ MATCH in memory hooks`);
          const index = hooks.indexOf(hooksQuery);
          const start = Math.max(0, index - 30);
          const end = Math.min(hooks.length, index + 70);
          const snippet = (start > 0 ? '...' : '') + 
                        (person.memoryHooks || '').substring(start, end) + 
                        (end < hooks.length ? '...' : '');
          matchContext = matchContext ? `${matchContext}; Memory: ${snippet}` : `Memory: ${snippet}`;
        } else {
          console.log(`     ✗ NO MATCH`);
        }
      }

      // Notes search
      if (query.notes && query.notes.trim()) {
        console.log(`   Searching notes for "${query.notes}" in "${person.name}"`);
        const notesQuery = query.notes.toLowerCase();
        const allNotes = person.notes ? person.notes.map(n => n.content).join(' ') : '';
        const notesLower = allNotes.toLowerCase();
        if (notesLower.includes(notesQuery)) {
          hasMatch = true;
          score += 30;
          console.log(`     ✓ MATCH in notes`);
          const index = notesLower.indexOf(notesQuery);
          const start = Math.max(0, index - 30);
          const end = Math.min(allNotes.length, index + 70);
          const snippet = (start > 0 ? '...' : '') + 
                        allNotes.substring(start, end) + 
                        (end < allNotes.length ? '...' : '');
          matchContext = matchContext ? `${matchContext}; Notes: ${snippet}` : `Notes: ${snippet}`;
        } else {
          console.log(`     ✗ NO MATCH (notes available: ${allNotes.length > 0})`);
        }
      }

      // If text search criteria provided but no match, skip this person
      if ((query.name || query.memoryHooks || query.notes) && !hasMatch) {
        console.log(`   Skipping "${person.name}" - text search provided but no match`);
        return;
      }

      // Person matched filters (tags and/or gender), with optional text search match
      // Tags match
      if (query.tags && query.tags.length > 0) {
        score += 20;
        const matchedTags = person.tags.filter(t => 
          query.tags!.some(qt => qt.toLowerCase() === t.toLowerCase())
        );
        if (matchedTags.length > 0 && !matchContext) {
          matchContext = `Tags: ${matchedTags.join(', ')}`;
        }
      }

      // Gender match adds to score
      if (query.genders && query.genders.length > 0) {
        score += 10;
      }

      // Add result if has text match OR only filters provided
      if (hasMatch || (!query.name && !query.memoryHooks && !query.notes)) {
        console.log(`   ✓ Adding "${person.name}" to results (score: ${score})`);
        results.set(person.id, {
          ...person,
          relevanceScore: score,
          matchContext: matchContext || `Name: ${person.name}`,
        });
      }
    });

    const finalResults = Array.from(results.values()).sort((a, b) => b.relevanceScore - a.relevanceScore);
    console.log(`🔍 searchLocal returning ${finalResults.length} results`);
    return finalResults;
  }

  /**
   * Native search using local cache and FlexSearch
   */
  private searchNative(query: SearchQuery): SearchResult[] {
    const results: Map<string, SearchResult> = new Map();

    console.log('🔍 searchNative called with query:', JSON.stringify(query));
    console.log('   Persons in memory:', this.persons.length);
    console.log('   Available genders:', Array.from(new Set(this.persons.map(p => p.gender))));

    // Filter by gender (hard filter)
    let filteredPersons = [...this.persons];
    if (query.genders && query.genders.length > 0) {
      console.log('   🔍 Gender filter requested:', query.genders);
      console.log('   📊 Persons before gender filter:', filteredPersons.length);
      filteredPersons.forEach(p => {
        const isMatch = query.genders!.includes(p.gender!);
        console.log(`     ${isMatch ? '✓' : '✗'} "${p.name}" gender="${p.gender}" vs query=[${query.genders!.join(',')}]`);
      });
      filteredPersons = filteredPersons.filter(p => query.genders!.includes(p.gender!));
      console.log('   📊 Persons after gender filter:', filteredPersons.length);
    }

    // Filter by tags (hard filter - OR logic)
    if (query.tags && query.tags.length > 0) {
      console.log('   🔍 Tags filter requested:', query.tags);
      console.log('   📊 Persons before tag filter:', filteredPersons.length);
      console.log('   📋 All available tags in database:', 
        Array.from(new Set(this.persons.flatMap(p => p.tags))).join(', '));
      const searchTags = query.tags.map(t => t.toLowerCase());
      console.log('   Lowercased search tags:', searchTags);
      filteredPersons.forEach(p => {
        const personTags = p.tags.map(t => t.toLowerCase());
        const hasMatch = searchTags.some(st => personTags.includes(st));
        console.log(`     ${hasMatch ? '✓' : '✗'} "${p.name}" tags [${p.tags.join(',')}] vs query [${query.tags.join(',')}]`);
      });
      filteredPersons = filteredPersons.filter(p => {
        const personTags = p.tags.map(t => t.toLowerCase());
        return searchTags.some(st => personTags.includes(st));
      });
      console.log('   📊 Persons after tag filter:', filteredPersons.length);
    }

    // Now apply name and memory hooks search with scoring
    filteredPersons.forEach(person => {
      let score = 0;
      let matchContext = '';
      let hasMatch = false;

      // Name matching (highest weight)
      if (query.name && query.name.trim()) {
        const nameQuery = query.name.toLowerCase();
        const personName = person.name.toLowerCase();
        if (personName.includes(nameQuery)) {
          hasMatch = true;
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
          hasMatch = true;
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
          hasMatch = true;
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

      // If text search criteria provided but no match, skip this person
      if ((query.name || query.memoryHooks || query.notes) && !hasMatch) {
        return;
      }

      // Add score for tags (already filtered above)
      if (query.tags && query.tags.length > 0) {
        score += 20;
        const matchedTags = person.tags.filter(t => 
          query.tags!.some(qt => qt.toLowerCase() === t.toLowerCase())
        );
        if (matchedTags.length > 0 && !matchContext) {
          matchContext = `Tags: ${matchedTags.join(', ')}`;
        }
      }

      // Add score for gender (already filtered above)
      if (query.genders && query.genders.length > 0) {
        score += 10;
      }

      // Add result if has text match OR only filters provided
      if (hasMatch || (!query.name && !query.memoryHooks && !query.notes)) {
        results.set(person.id, {
          ...person,
          relevanceScore: score,
          matchContext: matchContext || `Name: ${person.name}`,
        });
      }
    });

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

    console.log('🔍 searchWeb called with query:', JSON.stringify(query));
    console.log('   Persons from Firestore:', persons.length);
    console.log('   Available genders:', Array.from(new Set(persons.map(p => p.gender))));

    // Apply gender filter (hard filter)
    if (query.genders && query.genders.length > 0) {
      console.log('   🔍 Gender filter requested:', query.genders);
      console.log('   📊 Persons before gender filter:', persons.length);
      persons.forEach(p => {
        const isMatch = query.genders!.includes(p.gender!);
        console.log(`     ${isMatch ? '✓' : '✗'} "${p.name}" gender="${p.gender}" vs query=[${query.genders!.join(',')}]`);
      });
      persons = persons.filter(p => query.genders!.includes(p.gender!));
      console.log('   📊 Persons after gender filter:', persons.length);
    }

    // Apply tags filter (hard filter - OR logic)
    if (query.tags && query.tags.length > 0) {
      console.log('   🔍 Tags filter requested:', query.tags);
      console.log('   📊 Persons before tag filter:', persons.length);
      console.log('   📋 All available tags in database:', 
        Array.from(new Set(this.persons.flatMap(p => p.tags))).join(', '));
      const searchTags = query.tags.map(t => t.toLowerCase());
      console.log('   Lowercased search tags:', searchTags);
      persons.forEach(p => {
        const personTags = p.tags.map(t => t.toLowerCase());
        const hasMatch = searchTags.some(st => personTags.includes(st));
        console.log(`     ${hasMatch ? '✓' : '✗'} "${p.name}" tags [${p.tags.join(',')}] vs query [${query.tags.join(',')}]`);
      });
      persons = persons.filter(p => {
        const personTags = p.tags.map(t => t.toLowerCase());
        return searchTags.some(st => personTags.includes(st));
      });
      console.log('   📊 Persons after tag filter:', persons.length);
    }

    // Client-side filtering and scoring for remaining criteria
    const results: SearchResult[] = [];

    persons.forEach(person => {
      let score = 0;
      let matchContext = '';
      let hasMatch = false;

      // Name search (starts with or contains)
      if (query.name && query.name.trim()) {
        const nameQuery = query.name.toLowerCase();
        const personName = person.name.toLowerCase();
        if (personName.includes(nameQuery)) {
          hasMatch = true;
          score += 100;
          if (personName === nameQuery) score += 50;
          else if (personName.startsWith(nameQuery)) score += 25;
          matchContext = `Name: ${person.name}`;
        }
      }

      // Memory hooks search
      if (query.memoryHooks && query.memoryHooks.trim()) {
        const keywords = query.memoryHooks.toLowerCase().split(/\s+/);
        const hooksLower = (person.memoryHooks || '').toLowerCase();
        if (keywords.some(keyword => hooksLower.includes(keyword))) {
          hasMatch = true;
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
          hasMatch = true;
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

      // If text search criteria provided but no match, skip this person
      if ((query.name || query.memoryHooks || query.notes) && !hasMatch) {
        return;
      }

      // Add score for tags (already filtered above)
      if (query.tags && query.tags.length > 0) {
        score += 20;
        const searchTags = query.tags.map(t => t.toLowerCase());
        const matchedTags = person.tags.filter(t => 
          searchTags.includes(t.toLowerCase())
        );
        if (matchedTags.length > 0 && !matchContext) {
          matchContext = `Tags: ${matchedTags.join(', ')}`;
        }
      }

      // Add score for gender (already filtered above)
      if (query.genders && query.genders.length > 0) {
        score += 10;
      }

      // Add result if has text match OR only filters provided
      if (hasMatch || (!query.name && !query.memoryHooks && !query.notes)) {
        results.push({
          ...person,
          relevanceScore: score,
          matchContext: matchContext || `Name: ${person.name}`,
        });
      }
    });

    return results.sort((a, b) => b.relevanceScore - a.relevanceScore);
  }
}

export const searchService = new SearchService();
