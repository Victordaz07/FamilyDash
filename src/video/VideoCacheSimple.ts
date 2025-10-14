/**
 * Simple Video cache system without deprecated getInfoAsync
 * Uses only download and basic file operations
 */

import * as FileSystem from "expo-file-system/legacy";
import * as Crypto from "expo-crypto";
import AsyncStorage from "@react-native-async-storage/async-storage";

const CACHE_DIR = `${FileSystem.cacheDirectory}video-cache/`;
const INDEX_KEY = "video-cache-index";
const DEFAULT_MAX_BYTES = 200 * 1024 * 1024; // 200 MB

type CacheEntry = { uri: string; localUri: string; size: number; at: number };

const ensureDir = async () => {
  try {
    await FileSystem.makeDirectoryAsync(CACHE_DIR, { intermediates: true });
  } catch (error) {
    console.warn('Error creating cache directory:', error);
  }
};

const loadIndex = async (): Promise<Record<string, CacheEntry>> => {
  try {
    const raw = await AsyncStorage.getItem(INDEX_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (error) {
    console.warn('Error loading cache index:', error);
    return {};
  }
};

const saveIndex = async (idx: Record<string, CacheEntry>) => {
  try {
    await AsyncStorage.setItem(INDEX_KEY, JSON.stringify(idx));
  } catch (error) {
    console.warn('Error saving cache index:', error);
  }
};

const hashUri = async (uri: string): Promise<string> => {
  try {
    return await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, uri);
  } catch (error) {
    console.warn('Error hashing URI:', error);
    // Fallback to simple hash
    return uri.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0).toString();
  }
};

const getTotalSize = (idx: Record<string, CacheEntry>) =>
  Object.values(idx).reduce((acc, e) => acc + (e.size || 0), 0);

const evictIfNeeded = async (idx: Record<string, CacheEntry>, maxBytes = DEFAULT_MAX_BYTES) => {
  let total = getTotalSize(idx);
  if (total <= maxBytes) return idx;

  // LRU: ordena por "at" (last access time) ascendente
  const entries = Object.entries(idx).sort((a, b) => a[1].at - b[1].at);

  for (const [key, entry] of entries) {
    try {
      await FileSystem.deleteAsync(entry.localUri, { idempotent: true });
    } catch (deleteError) {
      console.warn('Error deleting cached file:', deleteError);
    }
    delete idx[key];
    total = getTotalSize(idx);
    if (total <= maxBytes) break;
  }
  return idx;
};

export const getCachedOrDownloadSimple = async (
  uri: string,
  maxBytes = DEFAULT_MAX_BYTES
): Promise<string> => {
  try {
    await ensureDir();
    const idx = await loadIndex();
    const key = await hashUri(uri);

    // Hit - check if file exists by trying to access it
    if (idx[key]?.localUri) {
      try {
        // Simple existence check - try to read file stats
        const testResult = await FileSystem.downloadAsync('file://' + idx[key].localUri, 'file://' + idx[key].localUri + '.test');
        // If we get here, file exists
        await FileSystem.deleteAsync(idx[key].localUri + '.test', { idempotent: true });
        
        idx[key].at = Date.now();
        await saveIndex(idx);
        return idx[key].localUri;
      } catch (error) {
        // File doesn't exist, remove from index
        delete idx[key];
        await saveIndex(idx);
      }
    }

    // Download
    const filename = `${key}.${(uri.split(".").pop() || "mp4").split("?")[0]}`;
    const localUri = CACHE_DIR + filename;

    const res = await FileSystem.downloadAsync(uri, localUri);
    
    // Estimate size from Content-Length or use default
    const size = res.headers["Content-Length"]
      ? parseInt(String(res.headers["Content-Length"]), 10)
      : 1024 * 1024; // Default 1MB estimate

    idx[key] = { uri, localUri, size, at: Date.now() };

    const fixed = await evictIfNeeded(idx, maxBytes);
    await saveIndex(fixed);
    return localUri;
  } catch (error) {
    console.error('Error in getCachedOrDownloadSimple:', error);
    // Return original URI as fallback
    return uri;
  }
};




