import { promises as fs } from 'fs';
import path from 'path';

const CACHE_DIR = path.resolve('.cache');
const TAGS_MANIFEST = path.join(CACHE_DIR, 'tags-manifest.json');

// ensure cache dir exists
(async () => {
  try {
    await fs.mkdir(CACHE_DIR, { recursive: true });
    // eslint-disable-next-line no-console
    console.log('Cache directory ready at', CACHE_DIR);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Failed to create cache dir', err);
  }
})();

async function loadTagsManifest() {
  try {
    const data = await fs.readFile(TAGS_MANIFEST, 'utf8');
    return JSON.parse(data);
  } catch (err: any) {
    if (err.code === 'ENOENT') {
      return { items: {} };
    }
    throw err;
  }
}

async function updateTagsManifest(tag: string, revalidatedAt: number) {
  const manifest = await loadTagsManifest();
  manifest.items[tag] = { revalidatedAt };
  await fs.writeFile(TAGS_MANIFEST, JSON.stringify(manifest));
}

export default class CacheHandler {
  cacheDir: string;

  constructor() {
    this.cacheDir = CACHE_DIR;
  }

  getFilePath(key: string) {
    const sanitizedKey = key.trim();
    const fileName = encodeURIComponent(sanitizedKey);
    return path.join(this.cacheDir, fileName + '.json');
  }

  async get(key: string) {
    const filePath = this.getFilePath(key);
    try {
      const data = await fs.readFile(filePath, 'utf8');
      const entry = JSON.parse(data);
      const { value, lastModified } = entry;

      let cacheTags = entry.tags;

      if (
        (!cacheTags || cacheTags.length === 0) &&
        value &&
        value.headers &&
        value.headers['x-next-cache-tags']
      ) {
        cacheTags = value.headers['x-next-cache-tags'].split(',');
      }

      const tagsManifest = await loadTagsManifest();

      // Check if any tags have been revalidated after the cache entry
      let isStale = false;
      for (const tag of cacheTags || []) {
        const tagData = tagsManifest.items[tag];
        if (tagData && tagData.revalidatedAt > lastModified) {
          isStale = true;
          // eslint-disable-next-line no-console
          console.log(`Cache key ${key} is stale due to tag ${tag}`);
          break;
        }
      }

      if (isStale) return null;

      return { lastModified, value };
    } catch (err) {
      return null;
    }
  }

  async set(key: string, data: any, ctx: { tags?: string[] } = {}) {
    let tags = ctx.tags || [];

    if (data && data.headers && data.headers['x-next-cache-tags']) {
      const headerTags = data.headers['x-next-cache-tags'].split(',');
      tags = [...new Set([...tags, ...headerTags])];
    }

    const entry = {
      value: data,
      lastModified: Date.now(),
      tags,
    };

    const filePath = this.getFilePath(key);
    try {
      await fs.writeFile(filePath, JSON.stringify(entry));
      // eslint-disable-next-line no-console
      console.log(`Cached key: ${key}`);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Failed to write cache entry for', key, err);
    }
  }

  async revalidateTag(tags: string | string[]) {
    const tagsArray = Array.isArray(tags) ? tags : [tags];
    const now = Date.now();
    for (const tag of tagsArray) {
      await updateTagsManifest(tag, now);
      // eslint-disable-next-line no-console
      console.log(`Tag revalidated: ${tag} at ${new Date(now).toISOString()}`);
    }
  }
}
