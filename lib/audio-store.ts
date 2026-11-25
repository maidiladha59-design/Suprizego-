import { AUDIO_STORE, openAppDatabase } from "@/lib/local-db";

export type StoredAudio = {
  id: string;
  momentId: string;
  blob: Blob;
  mime: string;
  duration: number;
  name: string;
  createdAt: number;
};

export type UploadedAudio = {
  id: string;
  url: string;
};

export interface AudioStore {
  get(momentId: string): Promise<StoredAudio | null>;
  add(momentId: string, audio: StoredAudio): Promise<void>;
  remove(momentId: string): Promise<void>;
  getUrl(audio: StoredAudio): string;
  uploadAll(momentId: string, audio: StoredAudio): Promise<UploadedAudio>;
  clear(momentId: string): Promise<void>;
}

type AudioRow = StoredAudio & { key: string };

const voiceKey = (momentId: string) => `${momentId}:voice`;

class LocalAudioStore implements AudioStore {
  private dbPromise: Promise<IDBDatabase | null> | null = null;
  private memory = new Map<string, AudioRow>();
  private urls = new Map<string, { url: string; id: string }>();

  private db() {
    this.dbPromise ??= openAppDatabase();
    return this.dbPromise;
  }

  private toStored(row: AudioRow): StoredAudio {
    return {
      id: row.id,
      momentId: row.momentId,
      blob: row.blob,
      mime: row.mime,
      duration: row.duration,
      name: row.name,
      createdAt: row.createdAt,
    };
  }

  async get(momentId: string): Promise<StoredAudio | null> {
    const key = voiceKey(momentId);
    const cached = this.memory.get(key);
    if (cached) return this.toStored(cached);
    const db = await this.db();
    if (!db) return null;
    const row = await new Promise<AudioRow | null>((resolve) => {
      try {
        const tx = db.transaction(AUDIO_STORE, "readonly");
        const request = tx.objectStore(AUDIO_STORE).get(key);
        request.onsuccess = () => resolve((request.result as AudioRow | undefined) ?? null);
        request.onerror = () => resolve(null);
      } catch {
        resolve(null);
      }
    });
    return row ? this.toStored(row) : null;
  }

  async add(momentId: string, audio: StoredAudio): Promise<void> {
    const key = voiceKey(momentId);
    const cachedUrl = this.urls.get(momentId);
    if (cachedUrl && cachedUrl.id !== audio.id) {
      URL.revokeObjectURL(cachedUrl.url);
      this.urls.delete(momentId);
    }
    const row: AudioRow = { ...audio, momentId, key };
    this.memory.set(key, row);
    const db = await this.db();
    if (!db) return;
    await new Promise<void>((resolve) => {
      try {
        const tx = db.transaction(AUDIO_STORE, "readwrite");
        tx.objectStore(AUDIO_STORE).put(row);
        tx.oncomplete = () => resolve();
        tx.onerror = () => resolve();
        tx.onabort = () => resolve();
      } catch {
        resolve();
      }
    });
  }

  async remove(momentId: string): Promise<void> {
    const key = voiceKey(momentId);
    this.memory.delete(key);
    this.revoke(momentId);
    const db = await this.db();
    if (!db) return;
    await new Promise<void>((resolve) => {
      try {
        const tx = db.transaction(AUDIO_STORE, "readwrite");
        tx.objectStore(AUDIO_STORE).delete(key);
        tx.oncomplete = () => resolve();
        tx.onerror = () => resolve();
        tx.onabort = () => resolve();
      } catch {
        resolve();
      }
    });
  }

  getUrl(audio: StoredAudio): string {
    const cached = this.urls.get(audio.momentId);
    if (cached && cached.id === audio.id) return cached.url;
    if (cached) URL.revokeObjectURL(cached.url);
    const url = URL.createObjectURL(audio.blob);
    this.urls.set(audio.momentId, { url, id: audio.id });
    return url;
  }

  private revoke(momentId: string) {
    const cached = this.urls.get(momentId);
    if (!cached) return;
    URL.revokeObjectURL(cached.url);
    this.urls.delete(momentId);
  }

  async uploadAll(momentId: string, audio: StoredAudio): Promise<UploadedAudio> {
    // Implementasi lokal: nanti diganti unggahan Supabase Storage (bucket privat).
    return { id: audio.id, url: this.getUrl({ ...audio, momentId }) };
  }

  async clear(momentId: string): Promise<void> {
    this.revoke(momentId);
    this.memory.delete(voiceKey(momentId));
    const db = await this.db();
    if (!db) return;
    await new Promise<void>((resolve) => {
      try {
        const tx = db.transaction(AUDIO_STORE, "readwrite");
        tx.objectStore(AUDIO_STORE).delete(voiceKey(momentId));
        tx.oncomplete = () => resolve();
        tx.onerror = () => resolve();
        tx.onabort = () => resolve();
      } catch {
        resolve();
      }
    });
  }
}

export const audioStore: AudioStore = new LocalAudioStore();
