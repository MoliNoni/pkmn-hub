import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const CACHE_ROOT = path.join(process.cwd(), ".cache", "pokeapi");
const memoryCache = new Map<string, unknown>();

function getMemoryKey(namespace: string, key: string): string {
  return `${namespace}:${key}`;
}

function sanitizeCacheKey(key: string): string {
  return key.replace(/[^a-z0-9-_.]/gi, "_").toLowerCase();
}

function getCacheFilePath(namespace: string, key: string): string {
  return path.join(CACHE_ROOT, namespace, `${sanitizeCacheKey(key)}.json`);
}

async function readDiskCache<T>(
  namespace: string,
  key: string,
): Promise<T | null> {
  try {
    const fileContents = await readFile(getCacheFilePath(namespace, key), "utf8");
    return JSON.parse(fileContents) as T;
  } catch {
    return null;
  }
}

async function writeDiskCache(
  namespace: string,
  key: string,
  value: unknown,
): Promise<void> {
  const filePath = getCacheFilePath(namespace, key);

  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, JSON.stringify(value), "utf8");
}

export async function getCachedJson<T>(
  namespace: string,
  key: string,
  url: string,
): Promise<T | null> {
  const memoryKey = getMemoryKey(namespace, key);

  if (memoryCache.has(memoryKey)) {
    return memoryCache.get(memoryKey) as T | null;
  }

  const diskValue = await readDiskCache<T>(namespace, key);

  if (diskValue !== null) {
    memoryCache.set(memoryKey, diskValue);
    return diskValue;
  }

  try {
    const response = await fetch(url, {
      next: { revalidate: 60 * 60 * 24 },
    });

    if (!response.ok) {
      return null;
    }

    const data = (await response.json()) as T;

    memoryCache.set(memoryKey, data);
    await writeDiskCache(namespace, key, data);
    return data;
  } catch {
    return null;
  }
}
