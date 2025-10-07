/**
 * Universal Database Service
 * FamilyDash v1.4.0-pre - Centralized Firebase CRUD Operations
 */

import {
    collection,
    doc,
    addDoc,
    getDocs,
    getDoc,
    updateDoc,
    deleteDoc,
    onSnapshot,
    query,
    where,
    orderBy,
    limit,
    serverTimestamp,
    Timestamp,
    QueryConstraint,
    DocumentData,
    QuerySnapshot,
    DocumentSnapshot,
    writeBatch
} from 'firebase/firestore';
import { db } from '../config/firebase';

export interface DatabaseDocument {
    id: string;
    [key: string]: any;
}

export interface DatabaseResult<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    code?: string;
}

export interface ListenOptions {
    where?: { field: string; operator: any; value: any }[];
    orderBy?: { field: string; direction?: 'asc' | 'desc' }[];
    limit?: number;
}

/**
 * Universal Database Service for all Firebase operations
 */
export const DatabaseService = {
    /**
     * Add a new document to a collection
     */
    async add<T = any>(collectionName: string, data: T): Promise<DatabaseResult<T & { id: string }>> {
        try {
            console.log(`📝 Adding document to ${collectionName}:`, data);

            const docData = {
                ...data,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            };

            const docRef = await addDoc(collection(db, collectionName), docData);
            const newDoc = { id: docRef.id, ...data };

            console.log(`✅ Document added to ${collectionName} with ID: ${docRef.id}`);
            return { success: true, data: newDoc };
        } catch (error: any) {
            console.error(`❌ Error adding document to ${collectionName}:`, error);
            return {
                success: false,
                error: error.message || 'Failed to add document',
                code: error.code
            };
        }
    },

    /**
     * Get all documents from a collection
     */
    async getAll<T = any>(collectionName: string, options?: ListenOptions): Promise<DatabaseResult<T[]>> {
        try {
            console.log(`📖 Getting all documents from ${collectionName}`);

            let q = collection(db, collectionName);

            // Apply query constraints if provided
            if (options) {
                const constraints: QueryConstraint[] = [];

                if (options.where) {
                    options.where.forEach(condition => {
                        constraints.push(where(condition.field, condition.operator, condition.value));
                    });
                }

                if (options.orderBy) {
                    options.orderBy.forEach(order => {
                        constraints.push(orderBy(order.field, order.direction || 'asc'));
                    });
                }

                if (options.limit) {
                    constraints.push(limit(options.limit));
                }

                q = query(q, ...constraints);
            }

            const snapshot = await getDocs(q);
            const documents = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as T[];

            console.log(`✅ Retrieved ${documents.length} documents from ${collectionName}`);
            return { success: true, data: documents };
        } catch (error: any) {
            console.error(`❌ Error getting documents from ${collectionName}:`, error);
            return {
                success: false,
                error: error.message || 'Failed to get documents',
                code: error.code
            };
        }
    },

    /**
     * Get a single document by ID
     */
    async getById<T = any>(collectionName: string, id: string): Promise<DatabaseResult<T>> {
        try {
            console.log(`📖 Getting document ${id} from ${collectionName}`);

            const docRef = doc(db, collectionName, id);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const document = { id: docSnap.id, ...docSnap.data() } as T;
                console.log(`✅ Document ${id} retrieved from ${collectionName}`);
                return { success: true, data: document };
            } else {
                console.log(`⚠️ Document ${id} not found in ${collectionName}`);
                return { success: false, error: 'Document not found' };
            }
        } catch (error: any) {
            console.error(`❌ Error getting document ${id} from ${collectionName}:`, error);
            return {
                success: false,
                error: error.message || 'Failed to get document',
                code: error.code
            };
        }
    },

    /**
     * Update a document by ID
     */
    async update<T = any>(collectionName: string, id: string, data: Partial<T>): Promise<DatabaseResult<T>> {
        try {
            console.log(`📝 Updating document ${id} in ${collectionName}:`, data);

            const docRef = doc(db, collectionName, id);
            const updateData = {
                ...data,
                updatedAt: serverTimestamp()
            };

            await updateDoc(docRef, updateData);

            console.log(`✅ Document ${id} updated in ${collectionName}`);
            return { success: true, data: data as T };
        } catch (error: any) {
            console.error(`❌ Error updating document ${id} in ${collectionName}:`, error);
            return {
                success: false,
                error: error.message || 'Failed to update document',
                code: error.code
            };
        }
    },

    /**
     * Delete a document by ID
     */
    async remove(collectionName: string, id: string): Promise<DatabaseResult> {
        try {
            console.log(`🗑️ Deleting document ${id} from ${collectionName}`);

            const docRef = doc(db, collectionName, id);
            await deleteDoc(docRef);

            console.log(`✅ Document ${id} deleted from ${collectionName}`);
            return { success: true };
        } catch (error: any) {
            console.error(`❌ Error deleting document ${id} from ${collectionName}:`, error);
            return {
                success: false,
                error: error.message || 'Failed to delete document',
                code: error.code
            };
        }
    },

    /**
     * Listen to real-time changes in a collection
     */
    listen<T = any>(
        collectionName: string,
        callback: (data: T[]) => void,
        options?: ListenOptions
    ): () => void {
        console.log(`👂 Setting up real-time listener for ${collectionName}`);

        let q = collection(db, collectionName);

        // Apply query constraints if provided
        if (options) {
            const constraints: QueryConstraint[] = [];

            if (options.where) {
                options.where.forEach(condition => {
                    constraints.push(where(condition.field, condition.operator, condition.value));
                });
            }

            if (options.orderBy) {
                options.orderBy.forEach(order => {
                    constraints.push(orderBy(order.field, order.direction || 'asc'));
                });
            }

            if (options.limit) {
                constraints.push(limit(options.limit));
            }

            q = query(q, ...constraints);
        }

        const unsubscribe = onSnapshot(
            q,
            (snapshot: QuerySnapshot<DocumentData>) => {
                const documents = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                })) as T[];

                console.log(`📡 Real-time update for ${collectionName}: ${documents.length} documents`);
                callback(documents);
            },
            (error) => {
                console.error(`❌ Real-time listener error for ${collectionName}:`, error);
                callback([]);
            }
        );

        return unsubscribe;
    },

    /**
     * Listen to a single document
     */
    listenToDocument<T = any>(
        collectionName: string,
        id: string,
        callback: (data: T | null) => void
    ): () => void {
        console.log(`👂 Setting up real-time listener for document ${id} in ${collectionName}`);

        const docRef = doc(db, collectionName, id);

        const unsubscribe = onSnapshot(
            docRef,
            (snapshot: DocumentSnapshot<DocumentData>) => {
                if (snapshot.exists()) {
                    const document = { id: snapshot.id, ...snapshot.data() } as T;
                    console.log(`📡 Real-time update for document ${id}`);
                    callback(document);
                } else {
                    console.log(`⚠️ Document ${id} no longer exists`);
                    callback(null);
                }
            },
            (error) => {
                console.error(`❌ Real-time listener error for document ${id}:`, error);
                callback(null);
            }
        );

        return unsubscribe;
    },

    /**
     * Batch operations for multiple documents
     */
    async batch<T = any>(operations: {
        type: 'add' | 'update' | 'delete';
        collection: string;
        id?: string;
        data?: T;
    }[]): Promise<DatabaseResult> {
        try {
            console.log(`📦 Executing batch operation with ${operations.length} operations`);

            const batch = writeBatch(db);

            for (const operation of operations) {
                const docRef = operation.id
                    ? doc(db, operation.collection, operation.id)
                    : doc(collection(db, operation.collection));

                switch (operation.type) {
                    case 'add':
                        if (operation.data) {
                            batch.set(docRef, {
                                ...operation.data,
                                createdAt: serverTimestamp(),
                                updatedAt: serverTimestamp()
                            });
                        }
                        break;
                    case 'update':
                        if (operation.data) {
                            batch.update(docRef, {
                                ...operation.data,
                                updatedAt: serverTimestamp()
                            });
                        }
                        break;
                    case 'delete':
                        batch.delete(docRef);
                        break;
                }
            }

            await batch.commit();
            console.log(`✅ Batch operation completed successfully`);
            return { success: true };
        } catch (error: any) {
            console.error(`❌ Batch operation failed:`, error);
            return {
                success: false,
                error: error.message || 'Failed to execute batch operation',
                code: error.code
            };
        }
    }
};

export default DatabaseService;
