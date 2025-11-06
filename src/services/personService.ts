import { getFirestoreService, getStorageService } from './firebase';
import { Person, PersonInput } from '../types';

const PERSONS_COLLECTION = 'persons';

export class PersonService {
  private getCurrentUserId(): string {
    // This should be set from auth context
    const userId = this.userId;
    if (!userId) {
      throw new Error('User not authenticated');
    }
    return userId;
  }

  private userId: string | null = null;

  setUserId(userId: string | null) {
    this.userId = userId;
  }

  /**
   * Add a new person
   */
  async addPerson(input: PersonInput): Promise<Person> {
    const firestore = getFirestoreService();
    const userId = this.getCurrentUserId();
    const now = new Date();

    const personData = {
      userId,
      name: input.name.trim(),
      memoryHooks: input.memoryHooks || '',
      tags: input.tags || [],
      gender: input.gender || null,
      photoUrl: input.photoUrl || null,
      photoStoragePath: input.photoStoragePath || null,
      createdAt: now,
      updatedAt: now,
    };

    const personsCollection = firestore.collection(PERSONS_COLLECTION);
    const docRef = await firestore.addDoc(personsCollection, personData);

    return {
      id: docRef.id,
      ...personData,
    } as Person;
  }

  /**
   * Update an existing person
   */
  async updatePerson(id: string, input: Partial<PersonInput>): Promise<void> {
    const firestore = getFirestoreService();
    const userId = this.getCurrentUserId();

    // First verify the person belongs to the current user
    const person = await this.getPersonById(id);
    if (person.userId !== userId) {
      throw new Error('Unauthorized: Cannot update another user\'s person');
    }

    const updateData: any = {
      updatedAt: new Date(),
    };

    if (input.name !== undefined) updateData.name = input.name.trim();
    if (input.memoryHooks !== undefined) updateData.memoryHooks = input.memoryHooks;
    if (input.tags !== undefined) updateData.tags = input.tags;
    if (input.gender !== undefined) updateData.gender = input.gender;
    if (input.photoUrl !== undefined) updateData.photoUrl = input.photoUrl;
    if (input.photoStoragePath !== undefined) updateData.photoStoragePath = input.photoStoragePath;

    const docRef = firestore.doc(`${PERSONS_COLLECTION}/${id}`);
    await firestore.updateDoc(docRef, updateData);
  }

  /**
   * Delete a person and their photo if exists
   */
  async deletePerson(id: string): Promise<void> {
    const firestore = getFirestoreService();
    const storage = getStorageService();
    const userId = this.getCurrentUserId();

    // First verify the person belongs to the current user
    const person = await this.getPersonById(id);
    if (person.userId !== userId) {
      throw new Error('Unauthorized: Cannot delete another user\'s person');
    }

    // Delete photo from storage if exists
    if (person.photoStoragePath) {
      try {
        const photoRef = storage.ref(person.photoStoragePath);
        await storage.deleteObject(photoRef);
      } catch (error) {
        console.error('Error deleting photo:', error);
        // Continue with person deletion even if photo deletion fails
      }
    }

    const docRef = firestore.doc(`${PERSONS_COLLECTION}/${id}`);
    await firestore.deleteDoc(docRef);
  }

  /**
   * Get a person by ID
   */
  async getPersonById(id: string): Promise<Person> {
    const firestore = getFirestoreService();
    const docRef = firestore.doc(`${PERSONS_COLLECTION}/${id}`);
    const docSnap = await firestore.getDoc(docRef);

    if (!docSnap.exists) {
      throw new Error('Person not found');
    }

    const data = docSnap.data();
    return {
      id: docSnap.id,
      ...data,
      createdAt: data.createdAt?.toDate?.() || data.createdAt,
      updatedAt: data.updatedAt?.toDate?.() || data.updatedAt,
    } as Person;
  }

  /**
   * Check if a person with the given name exists for the current user
   */
  async findPersonByName(name: string): Promise<Person | null> {
    const firestore = getFirestoreService();
    const userId = this.getCurrentUserId();

    const personsCollection = firestore.collection(PERSONS_COLLECTION);
    const q = firestore.query(
      personsCollection,
      firestore.where('userId', '==', userId),
      firestore.where('name', '==', name.trim())
    );

    const querySnapshot = await firestore.getDocs(q);

    if (querySnapshot.empty) {
      return null;
    }

    const doc = querySnapshot.docs[0];
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      createdAt: data.createdAt?.toDate?.() || data.createdAt,
      updatedAt: data.updatedAt?.toDate?.() || data.updatedAt,
    } as Person;
  }

  /**
   * Get all persons for the current user
   */
  async getAllPersons(): Promise<Person[]> {
    const firestore = getFirestoreService();
    const userId = this.getCurrentUserId();

    const personsCollection = firestore.collection(PERSONS_COLLECTION);
    const q = firestore.query(
      personsCollection,
      firestore.where('userId', '==', userId)
    );

    const querySnapshot = await firestore.getDocs(q);

    return querySnapshot.docs.map((doc: any) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.() || data.createdAt,
        updatedAt: data.updatedAt?.toDate?.() || data.updatedAt,
      } as Person;
    });
  }

  /**
   * Subscribe to changes for all persons
   */
  subscribeToPersons(callback: (persons: Person[]) => void): () => void {
    const firestore = getFirestoreService();
    const userId = this.getCurrentUserId();

    const personsCollection = firestore.collection(PERSONS_COLLECTION);
    const q = firestore.query(
      personsCollection,
      firestore.where('userId', '==', userId)
    );

    return firestore.onSnapshot(q, (snapshot: any) => {
      const persons = snapshot.docs.map((doc: any) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate?.() || data.createdAt,
          updatedAt: data.updatedAt?.toDate?.() || data.updatedAt,
        } as Person;
      });
      callback(persons);
    });
  }

  /**
   * Upload a photo to Firebase Storage
   */
  async uploadPhoto(uri: string, personId: string): Promise<{ photoUrl: string; photoStoragePath: string }> {
    const storage = getStorageService();
    const userId = this.getCurrentUserId();

    // Create a unique file name
    const fileName = `photo_${Date.now()}.jpg`;
    const storagePath = `photos/${userId}/${personId}/${fileName}`;

    // Get the file
    let blob: Blob;
    if (typeof uri === 'string' && uri.startsWith('http')) {
      // Web or remote URL
      const response = await fetch(uri);
      blob = await response.blob();
    } else {
      // Local file URI (native)
      const response = await fetch(uri);
      blob = await response.blob();
    }

    // Upload to storage
    const storageRef = storage.ref(storagePath);
    await storage.uploadBytes(storageRef, blob);

    // Get download URL
    const photoUrl = await storage.getDownloadURL(storageRef);

    return { photoUrl, photoStoragePath: storagePath };
  }
}

// Export singleton instance
export const personService = new PersonService();
