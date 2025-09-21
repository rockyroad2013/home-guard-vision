import { useState, useEffect } from 'react';

interface StoredFile {
  id: string;
  name: string;
  type: 'recording' | 'screenshot';
  blob: Blob;
  timestamp: Date;
  size: number;
}

const DB_NAME = 'SecurityCameraDB';
const DB_VERSION = 1;
const STORE_NAME = 'files';

class LocalStorageManager {
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };
      
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
          store.createIndex('type', 'type', { unique: false });
          store.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };
    });
  }

  async saveFile(file: Omit<StoredFile, 'id'>): Promise<string> {
    if (!this.db) await this.init();
    
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    const storedFile: StoredFile = { ...file, id };
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.add(storedFile);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(id);
    });
  }

  async getFiles(type?: 'recording' | 'screenshot'): Promise<StoredFile[]> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = type ? store.index('type').getAll(type) : store.getAll();
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const files = request.result.sort((a, b) => 
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
        resolve(files);
      };
    });
  }

  async deleteFile(id: string): Promise<void> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(id);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async clearAll(): Promise<void> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.clear();
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async getStorageSize(): Promise<{ used: number; total: number }> {
    const files = await this.getFiles();
    const used = files.reduce((total, file) => total + file.size, 0);
    
    // Estimate available storage (most browsers allow ~10GB for IndexedDB)
    const total = 10 * 1024 * 1024 * 1024; // 10GB in bytes
    
    return { used, total };
  }
}

const storageManager = new LocalStorageManager();

export const useLocalStorage = () => {
  const [files, setFiles] = useState<StoredFile[]>([]);
  const [storageInfo, setStorageInfo] = useState({ used: 0, total: 0 });

  const refreshFiles = async () => {
    try {
      const allFiles = await storageManager.getFiles();
      setFiles(allFiles);
      
      const info = await storageManager.getStorageSize();
      setStorageInfo(info);
    } catch (error) {
      console.error('Error refreshing files:', error);
    }
  };

  const saveRecording = async (blob: Blob, name?: string) => {
    try {
      const fileName = name || `recording_${new Date().toISOString().replace(/[:.]/g, '-')}.webm`;
      await storageManager.saveFile({
        name: fileName,
        type: 'recording',
        blob,
        timestamp: new Date(),
        size: blob.size
      });
      await refreshFiles();
    } catch (error) {
      console.error('Error saving recording:', error);
    }
  };

  const saveScreenshot = async (blob: Blob, name?: string) => {
    try {
      const fileName = name || `screenshot_${new Date().toISOString().replace(/[:.]/g, '-')}.png`;
      await storageManager.saveFile({
        name: fileName,
        type: 'screenshot',
        blob,
        timestamp: new Date(),
        size: blob.size
      });
      await refreshFiles();
    } catch (error) {
      console.error('Error saving screenshot:', error);
    }
  };

  const deleteFile = async (id: string) => {
    try {
      await storageManager.deleteFile(id);
      await refreshFiles();
    } catch (error) {
      console.error('Error deleting file:', error);
    }
  };

  const clearAllFiles = async () => {
    try {
      await storageManager.clearAll();
      await refreshFiles();
    } catch (error) {
      console.error('Error clearing files:', error);
    }
  };

  const downloadFile = (file: StoredFile) => {
    const url = URL.createObjectURL(file.blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    refreshFiles();
  }, []);

  return {
    files,
    storageInfo,
    saveRecording,
    saveScreenshot,
    deleteFile,
    clearAllFiles,
    downloadFile,
    refreshFiles
  };
};

export type { StoredFile };