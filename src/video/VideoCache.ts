/**
 * Video cache system with LRU eviction and size control
 * Uses expo-file-system for local storage and AsyncStorage for index
 */

import * as FileSystem from "expo-file-system/legacy";
import * as Crypto from "expo-crypto";
import AsyncStorage from "@react-native-async-storage/async-storage";

const CACHE_DIR = `${FileSystem.cacheDirectory}video-cache/`;
const INDEX_KEY = "video-cache-index"; // { [hash]: { uri, localUri, size, at: number } }
const DEFAULT_MAX_BYTES = 200 * 1024 * 1024; // 200 MB

type CacheEntry = { uri: string; localUri: string; size: number; at: number };

const ensureDir = async () => {
  try {
    const info = await FileSystem.getInfoAsync(CACHE_DIR);
    if (!info.exists) {
      await FileSystem.makeDirectoryAsync(CACHE_DIR, { intermediates: true });
    }
  } catch (error) {
    console.warn('Error checking cache directory:', error);
    // Try to create directory anyway
    try {
      await FileSystem.makeDirectoryAsync(CACHE_DIR, { intermediates: true });
    } catch (createError) {
      console.error('Error creating cache directory:', createError);
    }
  }
};

const loadIndex = async (): Promise<Record<string, CacheEntry>> => {
  const raw = await AsyncStorage.getItem(INDEX_KEY);
  return raw ? JSON.parse(raw) : {};
};

const saveIndex = async (idx: Record<string, CacheEntry>) => {
  await AsyncStorage.setItem(INDEX_KEY, JSON.stringify(idx));
};

const hashUri = async (uri: string): Promise<string> => {
  return await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, uri);
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
    } catch {}
    delete idx[key];
    total = getTotalSize(idx);
    if (total <= maxBytes) break;
  }
  return idx;
};

export const getCachedOrDownload = async (
  uri: string,
  maxBytes = DEFAULT_MAX_BYTES
): Promise<string> => {
  await ensureDir();
  const idx = await loadIndex();
  const key = await hashUri(uri);

  // Hit
  if (idx[key]?.localUri) {
    idx[key].at = Date.now();
    await saveIndex(idx);
    return idx[key].localUri;
  }

  // Download con nombre estable
  const filename = `${key}.${(uri.split(".").pop() || "mp4").split("?")[0]}`;
  const localUri = CACHE_DIR + filename;

  const res = await FileSystem.downloadAsync(uri, localUri);
  let size = 0;
  
  if (res.headers["Content-Length"]) {
    size = parseInt(String(res.headers["Content-Length"]), 10);
  } else {
    try {
      const info = await FileSystem.getInfoAsync(localUri);
      size = info.size || 0;
    } catch (error) {
      console.warn('Error getting file size:', error);
      size = 0;
    }
  }

  idx[key] = { uri, localUri, size, at: Date.now() };

  const fixed = await evictIfNeeded(idx, maxBytes);
  await saveIndex(fixed);
  return localUri;
};




