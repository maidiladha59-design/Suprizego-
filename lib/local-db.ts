export const PHOTO_STORE = "photos";
export const AUDIO_STORE = "audios";

const DB_NAME = "suprizego";
const DB_VERSION = 2;

export function openAppDatabase(): Promise<IDBDatabase | null> {
  if (typeof indexedDB === "undefined") return Promise.resolve(null);
  return new Promise((resolve) => {
    let request: IDBOpenDBRequest;
    try {
      request = indexedDB.open(DB_NAME, DB_VERSION);
    } catch {
      resolve(null);
      return;
    }
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(PHOTO_STORE)) {
        const photos = db.createObjectStore(PHOTO_STORE, { keyPath: "key" });
        photos.createIndex("momentId", "momentId", { unique: false });
      }
      if (!db.objectStoreNames.contains(AUDIO_STORE)) {
        const audios = db.createObjectStore(AUDIO_STORE, { keyPath: "key" });
        audios.createIndex("momentId", "momentId", { unique: false });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => resolve(null);
    request.onblocked = () => resolve(null);
  });
}
