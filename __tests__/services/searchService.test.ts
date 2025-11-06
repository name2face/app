import { SearchService } from '../../src/services/searchService';
import { Person } from '../../src/types';

describe('SearchService', () => {
  let searchService: SearchService;

  beforeEach(() => {
    searchService = new SearchService();
    searchService.setUserId('test-user-id');
  });

  describe('Client-side search logic', () => {
    const mockPersons: Person[] = [
      {
        id: '1',
        userId: 'test-user-id',
        name: 'John Doe',
        memoryHooks: 'Met at conference, works in software engineering',
        tags: ['Work', 'Conference'],
        gender: 'Male',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      },
      {
        id: '2',
        userId: 'test-user-id',
        name: 'Jane Smith',
        memoryHooks: 'Friend from college, loves hiking',
        tags: ['Social', 'Hobby'],
        gender: 'Female',
        createdAt: new Date('2024-01-02'),
        updatedAt: new Date('2024-01-02'),
      },
      {
        id: '3',
        userId: 'test-user-id',
        name: 'Bob Johnson',
        memoryHooks: 'Plumber who fixed my sink',
        tags: ['Service'],
        gender: 'Male',
        createdAt: new Date('2024-01-03'),
        updatedAt: new Date('2024-01-03'),
      },
    ];

    it('should initialize index with persons', () => {
      searchService.initializeIndex(mockPersons);
      expect(searchService['persons']).toHaveLength(3);
    });

    it('should update index when persons change', () => {
      searchService.initializeIndex(mockPersons);
      const updatedPersons = mockPersons.slice(0, 2);
      searchService.updateIndex(updatedPersons);
      expect(searchService['persons']).toHaveLength(2);
    });
  });

  describe('Search query handling', () => {
    it('should handle empty query', async () => {
      const mockPersons: Person[] = [
        {
          id: '1',
          userId: 'test-user-id',
          name: 'Test Person',
          tags: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      searchService.initializeIndex(mockPersons);
      const results = await searchService['searchNative']({});
      
      // Empty query should return all persons
      expect(results).toHaveLength(1);
    });
  });
});
