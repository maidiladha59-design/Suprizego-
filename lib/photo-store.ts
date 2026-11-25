import { PHOTO_STORE, openAppDatabase } from "@/lib/local-db";

export type StoredPhoto = {
  id: string;
  momentId: string;
  caption: string;
  blob: Blob;
  order: number;
  createdAt: number;
};

export type UploadedPhoto = {
  id: string;
  url: string;
};

export interface PhotoStore {
  list(momentId: string): Promise<StoredPhoto[]>;
  add(momentId: string, photo: StoredPhoto): Promise<void>;
  remove(momentId: string, id: string): Promise<void>;
  reorder(momentId: string, ids: string[]): Promise<void>;
  updateCaption(momentId: string, id: string, caption: string): Promise<void>;
  getUrl(photo: StoredPhoto): string;
  uploadAll(momentId: string, photos: StoredPhoto[]): Promise<UploadedPhoto[]>;
  clear(momentId: string): Promise<void>;
}

const STORE_NAME = PHOTO_STORE;

type PhotoRow = StoredPhoto & { key: string };

const keyOf = (momentId: string, id: string) => `${momentId}:${id}`;

function openDatabase(): Promise<IDBDatabase | null> {
  return openAppDatabase();
}

function runTransaction(db: IDBDatabase, mode: IDBTransactionMode, work: (store: IDBObjectStore) => void) {
  return new Promise<void>((resolve) => {
    try {
      const tx = db.transaction(STORE_NAME, mode);
      work(tx.objectStore(STORE_NAME));
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
      tx.onabort = () => resolve();
    } catch {
      resolve();
    }
  });
}

class LocalPhotoStore implements PhotoStore {
  private dbPromise: Promise<IDBDatabase | null> | null = null;
  private memory = new Map<string, PhotoRow>();
  private urls = new Map<string, { url: string; momentId: string }>();

  private db() {
    this.dbPromise ??= openDatabase();
    return this.dbPromise;
  }

  private toStored(row: PhotoRow): StoredPhoto {
    return {
      id: row.id,
      momentId: row.momentId,
      caption: row.caption,
      blob: row.blob,
      order: row.order,
      createdAt: row.createdAt,
    };
  }

  async list(momentId: string): Promise<StoredPhoto[]> {
    const db = await this.db();
    if (!db) {
      return [...this.memory.values()]
        .filter((row) => row.momentId === momentId)
        .sort((a, b) => a.order - b.order || a.createdAt - b.createdAt)
        .map((row) => this.toStored(row));
    }
    const rows = await new Promise<PhotoRow[]>((resolve) => {
      try {
        const tx = db.transaction(STORE_NAME, "readonly");
        const request = tx.objectStore(STORE_NAME).index("momentId").getAll(momentId);
        request.onsuccess = () => resolve(request.result as PhotoRow[]);
        request.onerror = () => resolve([]);
      } catch {
        resolve([]);
      }
    });
    return rows
      .sort((a, b) => a.order - b.order || a.createdAt - b.createdAt)
      .map((row) => this.toStored(row));
  }

  async add(momentId: string, photo: StoredPhoto): Promise<void> {
    const row: PhotoRow = { ...photo, momentId, key: keyOf(momentId, photo.id) };
    const db = await this.db();
    if (!db) {
      this.memory.set(row.key, row);
      return;
    }
    await runTransaction(db, "readwrite", (store) => store.put(row));
  }

  async remove(momentId: string, id: string): Promise<void> {
    const key = keyOf(momentId, id);
    this.memory.delete(key);
    this.revoke(id);
    const db = await this.db();
    if (!db) return;
    await runTransaction(db, "readwrite", (store) => store.delete(key));
  }

  async reorder(momentId: string, ids: string[]): Promise<void> {
    for (const [index, id] of ids.entries()) {
      const key = keyOf(momentId, id);
      const cached = this.memory.get(key);
      if (cached) cached.order = index;
    }
    const db = await this.db();
    if (!db) return;
    await runTransaction(db, "readwrite", (store) => {
      ids.forEach((id, index) => {
        const request = store.get(keyOf(momentId, id));
        request.onsuccess = () => {
          const row = request.result as PhotoRow | undefined;
          if (row) store.put({ ...row, order: index });
        };
      });
    });
  }

  async updateCaption(momentId: string, id: string, caption: string): Promise<void> {
    const key = keyOf(momentId, id);
    const cached = this.memory.get(key);
    if (cached) cached.caption = caption;
    const db = await this.db();
    if (!db) return;
    await runTransaction(db, "readwrite", (store) => {
      const request = store.get(key);
      request.onsuccess = () => {
        const row = request.result as PhotoRow | undefined;
        if (row) store.put({ ...row, caption });
      };
    });
  }

  getUrl(photo: StoredPhoto): string {
    const key = keyOf(photo.momentId, photo.id);
    const cached = this.urls.get(key);
    if (cached) return cached.url;
    const url = URL.createObjectURL(photo.blob);
    this.urls.set(key, { url, momentId: photo.momentId });
    return url;
  }

  private revoke(id: string) {
    for (const [key, entry] of this.urls) {
      if (key.endsWith(`:${id}`)) {
        URL.revokeObjectURL(entry.url);
        this.urls.delete(key);
      }
    }
  }

  async uploadAll(momentId: string, photos: StoredPhoto[]): Promise<UploadedPhoto[]> {
    // Implementasi lokal: belum ada unggahan nyata. Versi Supabase nanti
    // mengunggah blob ke bucket privat dan mengembalikan URL bertanda tangan.
    return photos.map((photo) => ({ id: photo.id, url: this.getUrl({ ...photo, momentId }) }));
  }

  async clear(momentId: string): Promise<void> {
    for (const [key, entry] of this.urls) {
      if (entry.momentId === momentId) {
        URL.revokeObjectURL(entry.url);
        this.urls.delete(key);
      }
    }
    for (const key of [...this.memory.keys()]) {
      if (key.startsWith(`${momentId}:`)) this.memory.delete(key);
    }
    const db = await this.db();
    if (!db) return;
    await runTransaction(db, "readwrite", (store) => {
      const request = store.index("momentId").openKeyCursor(momentId);
      request.onsuccess = () => {
        const cursor = request.result;
        if (!cursor) return;
        store.delete(cursor.primaryKey);
        cursor.continue();
      };
    });
  }
}

export const photoStore: PhotoStore = new LocalPhotoStore();
