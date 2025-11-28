
import { Target, ScanResult, ProxyConfig } from "../types";

const DB_NAME = "NetSentryDB";
const DB_VERSION = 2; // Incremented version for Proxy store
const STORE_TARGETS = "targets";
const STORE_RESULTS = "results";
const STORE_PROXIES = "proxies";

export const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject("Error opening database");

    request.onsuccess = (event) => {
      resolve((event.target as IDBOpenDBRequest).result);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      
      if (!db.objectStoreNames.contains(STORE_TARGETS)) {
        db.createObjectStore(STORE_TARGETS, { keyPath: "id" });
      }
      
      if (!db.objectStoreNames.contains(STORE_RESULTS)) {
        const resultStore = db.createObjectStore(STORE_RESULTS, { keyPath: "id" });
        resultStore.createIndex("timestamp", "timestamp", { unique: false });
      }

      if (!db.objectStoreNames.contains(STORE_PROXIES)) {
        db.createObjectStore(STORE_PROXIES, { keyPath: "id" });
      }
    };
  });
};

// --- Target Operations ---

export const saveTarget = async (target: Target): Promise<void> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_TARGETS], "readwrite");
    const store = transaction.objectStore(STORE_TARGETS);
    const request = store.put(target);
    
    request.onsuccess = () => resolve();
    request.onerror = () => reject("Failed to save target");
  });
};

export const getTargets = async (): Promise<Target[]> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_TARGETS], "readonly");
    const store = transaction.objectStore(STORE_TARGETS);
    const request = store.getAll();
    
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject("Failed to fetch targets");
  });
};

export const deleteTarget = async (id: string): Promise<void> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_TARGETS], "readwrite");
    const store = transaction.objectStore(STORE_TARGETS);
    const request = store.delete(id);
    
    request.onsuccess = () => resolve();
    request.onerror = () => reject("Failed to delete target");
  });
};

// --- Result Operations ---

export const saveResult = async (result: ScanResult): Promise<void> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_RESULTS], "readwrite");
    const store = transaction.objectStore(STORE_RESULTS);
    const request = store.put(result);
    
    request.onsuccess = () => resolve();
    request.onerror = () => reject("Failed to save result");
  });
};

export const getResults = async (): Promise<ScanResult[]> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_RESULTS], "readonly");
    const store = transaction.objectStore(STORE_RESULTS);
    const request = store.getAll();
    
    request.onsuccess = () => {
        // Sort by timestamp desc in memory for simplicity
        const sorted = (request.result as ScanResult[]).sort((a, b) => 
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
        resolve(sorted);
    };
    request.onerror = () => reject("Failed to fetch results");
  });
};

export const clearResults = async (): Promise<void> => {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_RESULTS], "readwrite");
      const store = transaction.objectStore(STORE_RESULTS);
      const request = store.clear();
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject("Failed to clear results");
    });
};

// --- Proxy Operations ---

export const saveProxy = async (proxy: ProxyConfig): Promise<void> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_PROXIES], "readwrite");
    const store = transaction.objectStore(STORE_PROXIES);
    const request = store.put(proxy);
    
    request.onsuccess = () => resolve();
    request.onerror = () => reject("Failed to save proxy");
  });
};

export const getProxies = async (): Promise<ProxyConfig[]> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_PROXIES], "readonly");
    const store = transaction.objectStore(STORE_PROXIES);
    const request = store.getAll();
    
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject("Failed to fetch proxies");
  });
};

export const deleteProxy = async (id: string): Promise<void> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_PROXIES], "readwrite");
    const store = transaction.objectStore(STORE_PROXIES);
    const request = store.delete(id);
    
    request.onsuccess = () => resolve();
    request.onerror = () => reject("Failed to delete proxy");
  });
};
