/**
 * Real Firebase Firestore Database Service
 * Production-ready database operations with Firebase Firestore
 */

import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  onSnapshot,
  writeBatch,
  serverTimestamp,
  DocumentReference,
  DocumentSnapshot,
  QuerySnapshot,
  Unsubscribe,
  QueryConstraint,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../../config/firebase';
import RealAuthService from '../auth/RealAuthService';
import Logger from '../Logger';

export interface DatabaseDocument {
  id: string;
  [key: string]: any;
}

export interface CollectionReference<T = DatabaseDocument> {
  id: string;
  ref: DocumentReference<any>;
}

export interface QueryOptions {
  where?: Array<{ field: string; operator: any; value: any }>;
  orderBy?: Array<{ field: string; direction: 'asc' | 'desc' }>;
  limit?: number;
  startAfter?: DocumentSnapshot;
}

export interface DatabaseResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
}

class RealDatabaseService {
  private authService = RealAuthService;

  /**
   * Create a new document
   */
  async createDocument<T = DatabaseDocument>(
    collectionPath: string,
    data: Omit<T, 'id'>
  ): Promise<DatabaseResult<T & { id: string }>> {
    try {
      Logger.debug(`📝 Creating document in collection: ${collectionPath}`);

      // Add server timestamp for creation
      const documentData = {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        createdBy: await this.getCurrentUserId(),
      };

      const docRef = await addDoc(collection(db, collectionPath), documentData);
      const documentId = docRef.id;

      // Create the document data with ID
      const documentWithId = {
        ...data,
        id: documentId,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: await this.getCurrentUserId(),
      } as T & { id: string };

      Logger.debug(`✅ Document created with ID: ${documentId}`);

      return {
        success: true,
        data: documentWithId,
      };
    } catch (error: any) {
      Logger.error(`❌ Error creating document in ${collectionPath}:`, error);

      return {
        success: false,
        error: error.message || 'Failed to create document',
        code: error.code,
      };
    }
  }

  /**
   * Get a document by ID
   */
  async getDocument<T = DatabaseDocument>(
    collectionPath: string,
    documentId: string
  ): Promise<DatabaseResult<T & { id: string }>> {
    try {
      Logger.debug(`📖 Getting document: ${collectionPath}/${documentId}`);

      const docRef = doc(db, collectionPath, documentId);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        return {
          success: false,
          error: 'Document not found',
        };
      }

      const documentData = {
        id: docSnap.id,
        ...docSnap.data(),
      } as T & { id: string };

      // Convert Firestore timestamps to JavaScript dates
      const convertedData = this.convertTimestamps(documentData);

      Logger.debug(`✅ Document retrieved successfully`);

      return {
        success: true,
        data: convertedData,
      };
    } catch (error: any) {
      Logger.error(`❌ Error getting document ${documentId}:`, error);

      return {
        success: false,
        error: error.message || 'Failed to get document',
        code: error.code,
      };
    }
  }

  /**
   * Update a document
   */
  async updateDocument<T = DatabaseDocument>(
    collectionPath: string,
    documentId: string,
    data: Partial<T>
  ): Promise<DatabaseResult<T & { id: string }>> {
    try {
      Logger.debug(`✏️ Updating document: ${collectionPath}/${documentId}`);

      const docRef = doc(db, collectionPath, documentId);

      // Add server timestamp for update
      const updateData = {
        ...data,
        updatedAt: serverTimestamp(),
        updatedBy: await this.getCurrentUserId(),
      };

      await updateDoc(docRef, updateData);

      // Get the updated document
      const updatedDoc = await this.getDocument<T>(collectionPath, documentId);

      Logger.debug(`✅ Document updated successfully`);

      return updatedDoc;
    } catch (error: any) {
      Logger.error(`❌ Error updating document ${documentId}:`, error);

      return {
        success: false,
        error: error.message || 'Failed to update document',
        code: error.code,
      };
    }
  }

  /**
   * Delete a document
   */
  async deleteDocument(
    collectionPath: string,
    documentId: string
  ): Promise<DatabaseResult<void>> {
    try {
      Logger.debug(`🗑️ Deleting document: ${collectionPath}/${documentId}`);

      const docRef = doc(db, collectionPath, documentId);
      await deleteDoc(docRef);

      Logger.debug(`✅ Document deleted successfully`);

      return {
        success: true,
      };
    } catch (error: any) {
      Logger.error(`❌ Error deleting document ${documentId}:`, error);

      return {
        success: false,
        error: error.message || 'Failed to delete document',
        code: error.code,
      };
    }
  }

  /**
   * Get documents from a collection with query options
   */
  async getDocuments<T = DatabaseDocument>(
    collectionPath: string,
    options?: QueryOptions
  ): Promise<DatabaseResult<(T & { id: string })[]>> {
    try {
      Logger.debug(`📋 Getting documents from collection: ${collectionPath}`);

      let q = query(collection(db, collectionPath));

      // Apply query constraints
      if (options?.where) {
        options.where.forEach((whereClause) => {
          q = query(q, where(whereClause.field, whereClause.operator, whereClause.value));
        });
      }

      if (options?.orderBy) {
        options.orderBy.forEach((orderClause) => {
          q = query(q, orderBy(orderClause.field, orderClause.direction));
        });
      }

      if (options?.limit) {
        q = query(q, limit(options.limit));
      }

      if (options?.startAfter) {
        q = query(q, startAfter(options.startAfter));
      }

      const querySnapshot = await getDocs(q);
      const documents: (T & { id: string })[] = [];

      querySnapshot.forEach((docSnap) => {
        const documentData = {
          id: docSnap.id,
          ...docSnap.data(),
        } as T & { id: string };

        // Convert Firestore timestamps to JavaScript dates
        const convertedData = this.convertTimestamps(documentData);
        documents.push(convertedData);
      });

      Logger.debug(`✅ Retrieved ${documents.length} documents`);

      return {
        success: true,
        data: documents,
      };
    } catch (error: any) {
      Logger.error(`❌ Error getting documents from ${collectionPath}:`, error);

      return {
        success: false,
        error: error.message || 'Failed to get documents',
        code: error.code,
      };
    }
  }

  /**
   * Listen to real-time updates for a document
   */
  listenToDocument<T = DatabaseDocument>(
    collectionPath: string,
    documentId: string,
    callback: (data: (T & { id: string }) | null, error?: string) => void
  ): Unsubscribe {
    Logger.debug(`👂 Listening to document: ${collectionPath}/${documentId}`);

    const docRef = doc(db, collectionPath, documentId);

    return onSnapshot(
      docRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const documentData = {
            id: docSnap.id,
            ...docSnap.data(),
          } as T & { id: string };

          // Convert Firestore timestamps to JavaScript dates
          const convertedData = this.convertTimestamps(documentData);
          callback(convertedData);
        } else {
          callback(null);
        }
      },
      (error) => {
        Logger.error(`❌ Error listening to document ${documentId}:`, error);
        callback(null, error.message);
      }
    );
  }

  /**
   * Listen to real-time updates for a collection
   */
  listenToCollection<T = DatabaseDocument>(
    collectionPath: string,
    callback: (data: (T & { id: string })[], error?: string) => void,
    options?: QueryOptions
  ): Unsubscribe {
    Logger.debug(`👂 Listening to collection: ${collectionPath}`);

    let q = query(collection(db, collectionPath));

    // Apply query constraints
    if (options?.where) {
      options.where.forEach((whereClause) => {
        q = query(q, where(whereClause.field, whereClause.operator, whereClause.value));
      });
    }

    if (options?.orderBy) {
      options.orderBy.forEach((orderClause) => {
        q = query(q, orderBy(orderClause.field, orderClause.direction));
      });
    }

    if (options?.limit) {
      q = query(q, limit(options.limit));
    }

    return onSnapshot(
      q,
      (querySnapshot) => {
        const documents: (T & { id: string })[] = [];

        querySnapshot.forEach((docSnap) => {
          const documentData = {
            id: docSnap.id,
            ...docSnap.data(),
          } as T & { id: string };

          // Convert Firestore timestamps to JavaScript dates
          const convertedData = this.convertTimestamps(documentData);
          documents.push(convertedData);
        });

        callback(documents);
      },
      (error) => {
        Logger.error(`❌ Error listening to collection ${collectionPath}:`, error);
        callback([], error.message);
      }
    );
  }

  /**
   * Batch operations for multiple documents
   */
  async batchOperations(
    operations: Array<{
      type: 'create' | 'update' | 'delete';
      collection: string;
      id?: string;
      data?: any;
    }>
  ): Promise<DatabaseResult<void>> {
    try {
      Logger.debug(`📦 Executing batch operation with ${operations.length} operations`);

      const batch = writeBatch(db);

      for (const operation of operations) {
        const { type, collection: collectionPath, id, data } = operation;

        switch (type) {
          case 'create':
            if (data) {
              const docRef = doc(collection(db, collectionPath));
              batch.set(docRef, {
                ...data,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
                createdBy: await this.getCurrentUserId(),
              });
            }
            break;

          case 'update':
            if (id && data) {
              const docRef = doc(db, collectionPath, id);
              batch.update(docRef, {
                ...data,
                updatedAt: serverTimestamp(),
                updatedBy: await this.getCurrentUserId(),
              });
            }
            break;

          case 'delete':
            if (id) {
              const docRef = doc(db, collectionPath, id);
              batch.delete(docRef);
            }
            break;
        }
      }

      await batch.commit();

      Logger.debug(`✅ Batch operation completed successfully`);

      return {
        success: true,
      };
    } catch (error: any) {
      Logger.error(`❌ Error in batch operation:`, error);

      return {
        success: false,
        error: error.message || 'Failed to execute batch operation',
        code: error.code,
      };
    }
  }

  /**
   * Search documents with text search
   */
  async searchDocuments<T = DatabaseDocument>(
    collectionPath: string,
    searchField: string,
    searchTerm: string,
    options?: QueryOptions
  ): Promise<DatabaseResult<(T & { id: string })[]>> {
    try {
      Logger.debug(`🔍 Searching documents in ${collectionPath} for: ${searchTerm}`);

      // Note: Firestore doesn't support full-text search natively
      // This is a basic implementation using string contains
      // For production, consider using Algolia or Cloud Search

      const searchOptions = {
        ...options,
        where: [
          ...(options?.where || []),
          { field: searchField, operator: '>=', value: searchTerm },
          { field: searchField, operator: '<=', value: searchTerm + '\uf8ff' },
        ],
      };

      return await this.getDocuments<T>(collectionPath, searchOptions);
    } catch (error: any) {
      Logger.error(`❌ Error searching documents:`, error);

      return {
        success: false,
        error: error.message || 'Failed to search documents',
        code: error.code,
      };
    }
  }

  /**
   * Get current user ID
   */
  private async getCurrentUserId(): Promise<string | null> {
    try {
      const user = await this.authService.getCurrentUser();
      return user?.uid || null;
    } catch (error) {
      Logger.error('Error getting current user ID:', error);
      return null;
    }
  }

  /**
   * Convert Firestore timestamps to JavaScript dates
   */
  private convertTimestamps(obj: any): any {
    if (!obj || typeof obj !== 'object') {
      return obj;
    }

    const converted = { ...obj };

    for (const key in converted) {
      if (converted[key] instanceof Timestamp) {
        converted[key] = converted[key].toDate();
      } else if (typeof converted[key] === 'object') {
        converted[key] = this.convertTimestamps(converted[key]);
      }
    }

    return converted;
  }

  /**
   * Get collection reference
   */
  getCollectionReference(collectionPath: string) {
    return collection(db, collectionPath);
  }

  /**
   * Get document reference
   */
  getDocumentReference(collectionPath: string, documentId: string) {
    return doc(db, collectionPath, documentId);
  }

  /**
   * Check if feature is available (connection status)
   */
  async checkConnection(): Promise<boolean> {
    try {
      // Try to access a simple document
      const testDoc = await getDoc(doc(db, '_test', 'connection'));
      return true;
    } catch (error) {
      Logger.error('❌ Database connection failed:', error);
      return false;
    }
  }
}

// Export singleton instance
export default new RealDatabaseService();
