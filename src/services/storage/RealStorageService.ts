/**
 * Real Firebase Storage Service
 * Production-ready file storage with Firebase Storage
 */

import {
  ref,
  uploadBytes,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
  listAll,
  getMetadata,
  updateMetadata,
} from 'firebase/storage';
import { storage } from '@/config/firebase';
import { RealAuthService } from '../auth/RealAuthService';
import Logger from '../Logger';

export interface StorageFile {
  url: string;
  path: string;
  name: string;
  size: number;
  contentType: string;
  metadata: any;
}

export interface UploadProgress {
  bytesTransferred: number;
  totalBytes: number;
  percentage: number;
}

export interface StorageResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  progress?: UploadProgress;
}

export interface StorageOptions {
  metadata?: {
    contentType?: string;
    [key: string]: any;
  };
  onProgress?: (progress: UploadProgress) => void;
}

class RealStorageService {
  private authService = RealAuthService;

  /**
   * Upload a file to storage
   */
  async uploadFile(
    file: File | Blob,
    path: string,
    options?: StorageOptions
  ): Promise<StorageResult<StorageFile>> {
    try {
      Logger.debug(`📤 Uploading file to: ${path}`);

      // Create storage reference
      const storageRef = ref(storage, path);

      // Set metadata
      const metadata = {
        ...options?.metadata,
        uploadedAt: new Date().toISOString(),
        uploadedBy: await this.getCurrentUserId(),
      };

      let uploadTask;
      
      if (options?.onProgress) {
        // Use resumable upload for progress tracking
        uploadTask = uploadBytesResumable(storageRef, file, metadata);
        
        uploadTask.on('state_changed', 
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            const uploadProgress: UploadProgress = {
              bytesTransferred: snapshot.bytesTransferred,
              totalBytes: snapshot.totalBytes,
              percentage: progress,
            };
            
            if (options?.onProgress) {
              options.onProgress(uploadProgress);
            }
          },
          (error) => {
            Logger.error('❌ Upload error:', error);
          },
          async () => {
            // Upload completed
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            
            const storageFile: StorageFile = {
              url: downloadURL,
              path,
              name: path.split('/').pop() || 'unknown',
              size: file.size || 0,
              contentType: file.type || 'application/octet-stream',
              metadata: uploadTask.snapshot.metadata,
            };

            Logger.debug(`✅ File uploaded successfully: ${path}`);
            
            return {
              success: true,
              data: storageFile,
            };
          }
        );
        
        // Wait for upload completion
        return await new Promise<StorageResult<StorageFile>>((resolve, reject) => {
          uploadTask.on('error', (error) => {
            reject({
              success: false,
              error: error.message,
            });
          });
          
          uploadTask.on('complete', async () => {
            try {
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
              
              const storageFile: StorageFile = {
                url: downloadURL,
                path,
                name: path.split('/').pop() || 'unknown',
                size: file.size || 0,
                contentType: file.type || 'application/octet-stream',
                metadata: uploadTask.snapshot.metadata,
              };

              resolve({
                success: true,
                data: storageFile,
              });
            } catch (error: any) {
              reject({
                success: false,
                error: error.message,
              });
            }
          });
        });
      } else {
        // Simple upload without progress tracking
        const snapshot = await uploadBytes(storageRef, file, metadata);
        const downloadURL = await getDownloadURL(snapshot.ref);
        
        const storageFile: StorageFile = {
          url: downloadURL,
          path,
          name: path.split('/').pop() || 'unknown',
          size: file.size || 0,
          contentType: file.type || 'application/octet-stream',
          metadata: snapshot.metadata,
        };

        Logger.debug(`✅ File uploaded successfully: ${path}`);

        return {
          success: true,
          data: storageFile,
        };
      }
    } catch (error: any) {
      Logger.error(`❌ Error uploading file to ${path}:`, error);
      
      return {
        success: false,
        error: error.message || 'Failed to upload file',
      };
    }
  }

  /**
   * Get download URL for a file
   */
  async getDownloadURL(path: string): Promise<StorageResult<string>> {
    try {
      Logger.debug(`📥 Getting download URL for: ${path}`);

      const storageRef = ref(storage, path);
      const downloadURL = await getDownloadURL(storageRef);

      Logger.debug(`✅ Download URL retrieved successfully`);

      return {
        success: true,
        data: downloadURL,
      };
    } catch (error: any) {
      Logger.error(`❌ Error getting download URL for ${path}:`, error);
      
      return {
        success: false,
        error: error.message || 'Failed to get download URL',
      };
    }
  }

  /**
   * Delete a file from storage
   */
  async deleteFile(path: string): Promise<StorageResult<void>> {
    try {
      Logger.debug(`🗑️ Deleting file: ${path}`);

      const storageRef = ref(storage, path);
      await deleteObject(storageRef);

      Logger.debug(`✅ File deleted successfully`);

      return {
        success: true,
      };
    } catch (error: any) {
      Logger.error(`❌ Error deleting file ${path}:`, error);
      
      return {
        success: false,
        error: error.message || 'Failed to delete file',
      };
    }
  }

  /**
   * List all files in a storage folder
   */
  async listFiles(folderPath: string): Promise<StorageResult<StorageFile[]>> {
    try {
      Logger.debug(`📋 Listing files in folder: ${folderPath}`);

      const folderRef = ref(storage, folderPath);
      const listResult = await listAll(folderRef);

      const files: StorageFile[] = [];

      // Process files
      for (const itemRef of listResult.items) {
        try {
          const metadata = await getMetadata(itemRef);
          const downloadURL = await getDownloadURL(itemRef);

          const file: StorageFile = {
            url: downloadURL,
            path: itemRef.fullPath,
            name: itemRef.name,
            size: metadata.size,
            contentType: metadata.contentType || 'application/octet-stream',
            metadata: metadata,
          };

          files.push(file);
        } catch (error) {
          console.warn(`⚠️ Could not get metadata for ${itemRef.fullPath}`, error);
        }
      }

      Logger.debug(`✅ Listed ${files.length} files`);

      return {
        success: true,
        data: files,
      };
    } catch (error: any) {
      Logger.error(`❌ Error listing files in ${folderPath}:`, error);
      
      return {
        success: false,
        error: error.message || 'Failed to list files',
      };
    }
  }

  /**
   * Get file metadata
   */
  async getFileMetadata(path: string): Promise<StorageResult<any>> {
    try {
      Logger.debug(`📝 Getting metadata for: ${path}`);

      const storageRef = ref(storage, path);
      const metadata = await getMetadata(storageRef);

      Logger.debug(`✅ Metadata retrieved successfully`);

      return {
        success: true,
        data: metadata,
      };
    } catch (error: any) {
      Logger.error(`❌ Error getting metadata for ${path}:`, error);
      
      return {
        success: false,
        error: error.message || 'Failed to get metadata',
      };
    }
  }

  /**
   * Update file metadata
   */
  async updateFileMetadata(
    path: string,
    newMetadata: any
  ): Promise<StorageResult<any>> {
    try {
      Logger.debug(`✏️ Updating metadata for: ${path}`);

      const storageRef = ref(storage, path);
      const updatedMetadata = {
        ...newMetadata,
        updatedAt: new Date().toISOString(),
        updatedBy: await this.getCurrentUserId(),
      };

      await updateMetadata(storageRef, updatedMetadata);

      Logger.debug(`✅ Metadata updated successfully`);

      return {
        success: true,
        data: updatedMetadata,
      };
    } catch (error: any) {
      Logger.error(`❌ Error updating metadata for ${path}:`, error);
      
      return {
        success: false,
        error: error.message || 'Failed to update metadata',
      };
    }
  }

  /**
   * Upload profile image for user
   */
  async uploadProfileImage(
    userId: string,
    imageFile: File | Blob,
    options?: StorageOptions
  ): Promise<StorageResult<StorageFile>> {
    try {
      const timestamp = new Date().getTime();
      const path = `users/${userId}/profile/images/${timestamp}`;
      
      return await this.uploadFile(imageFile, path, options);
    } catch (error: any) {
      Logger.error(`❌ Error uploading profile image for user ${userId}:`, error);
      
      return {
        success: false,
        error: error.message || 'Failed to upload profile image',
      };
    }
  }

  /**
   * Upload family document/images
   */
  async uploadFamilyDocument(
    familyId: string,
    documentFile: File | Blob,
    documentType: string,
    options?: StorageOptions
  ): Promise<StorageResult<StorageFile>> {
    try {
      const timestamp = new Date().getTime();
      const path = `families/${familyId}/documents/${documentType}/${timestamp}`;
      
      return await this.uploadFile(documentFile, path, options);
    } catch (error: any) {
      Logger.error(`❌ Error uploading family document:`, error);
      
      return {
        success: false,
        error: error.message || 'Failed to upload family document',
      };
    }
  }

  /**
   * Upload task attachment
   */
  async uploadTaskAttachment(
    taskId: string,
    attachmentFile: File | Blob,
    options?: StorageOptions
  ): Promise<StorageResult<StorageFile>> {
    try {
      const timestamp = new Date().getTime();
      const path = `tasks/${taskId}/attachments/${timestamp}`;
      
      return await this.uploadFile(attachmentFile, path, options);
    } catch (error: any) {
      Logger.error(`❌ Error uploading task attachment:`, error);
      
      return {
        success: false,
        error: error.message || 'Failed to upload task attachment',
      };
    }
  }

  /**
   * Upload calendar event attachment
   */
  async uploadEventAttachment(
    eventId: string,
    attachmentFile: File | Blob,
    options?: StorageOptions
  ): Promise<StorageResult<StorageFile>> {
    try {
      const timestamp = new Date().getTime();
      const path = `events/${eventId}/attachments/${timestamp}`;
      
      return await this.uploadFile(attachmentFile, path, options);
    } catch (error: any) {
      Logger.error(`❌ Error uploading event attachment:`, error);
      
      return {
        success: false,
        error: error.message || 'Failed to upload event attachment',
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
   * Check if storage is available
   */
  async checkStorage(): Promise<boolean> {
    try {
      // Try to access storage root
      const rootRef = ref(storage, '.');
      await listAll(rootRef);
      return true;
    } catch (error) {
      Logger.error('❌ Storage connection failed:', error);
      return false;
    }
  }

  /**
   * Get storage usage statistics
   */
  async getStorageUsage(userId?: string): Promise<StorageResult<{bytesUsed: number; filesCount: number}>> {
    try {
      const folderPath = userId ? `users/${userId}` : '';
      const listResult = await this.listFiles(folderPath);
      
      if (!listResult.success || !listResult.data) {
        return {
          success: false,
          error: 'Failed to get file list',
        };
      }

      let bytesUsed = 0;
      const filesCount = listResult.data.length;

      for (const file of listResult.data) {
        bytesUsed += file.size;
      }

      return {
        success: true,
        data: {
          bytesUsed,
          filesCount,
        },
      };
    } catch (error: any) {
      Logger.error('❌ Error getting storage usage:', error);
      
      return {
        success: false,
        error: error.message || 'Failed to get storage usage',
      };
    }
  }
}

// Export singleton instance
export default new RealStorageService();




