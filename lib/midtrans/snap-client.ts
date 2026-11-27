type SnapCallbacks = {
  onSuccess?: () => void;
  onPending?: () => void;
  onError?: () => void;
  onClose?: () => void;
};

type SnapInstance = {
  pay: (token: string, callbacks?: SnapCallbacks) => void;
};

declare global {
  interface Window {
    snap?: SnapInstance;
  }
}

let loading: Promise<SnapInstance> | null = null;

export function loadSnap(scriptUrl: string): Promise<SnapInstance> {
  if (window.snap) return Promise.resolve(window.snap);
  if (loading) return loading;

  const url = new URL(scriptUrl);
  const allowed =
    (url.origin === "https://app.sandbox.midtrans.com" && url.pathname === "/snap/snap.js") ||
    (url.origin === "https://app.midtrans.com" && url.pathname === "/snap/snap.js");
  if (!allowed) return Promise.reject(new Error("URL Snap tidak valid."));

  loading = new Promise((resolve, reject) => {
    document.querySelector('script[data-midtrans-snap="true"]')?.remove();
    const script = document.createElement("script");
    const timer = window.setTimeout(() => {
      loading = null;
      script.remove();
      reject(new Error("Snap terlalu lama dimuat."));
    }, 20_000);

    const cleanup = () => {
      window.clearTimeout(timer);
      script.onload = null;
      script.onerror = null;
    };

    script.onload = () => {
      cleanup();
      if (window.snap) {
        loading = null;
        resolve(window.snap);
      } else {
        loading = null;
        reject(new Error("Snap tidak tersedia."));
      }
    };
    script.onerror = () => {
      cleanup();
      script.remove();
      loading = null;
      reject(new Error("Snap gagal dimuat."));
    };

    script.src = url.toString();
    script.async = true;
    script.dataset.midtransSnap = "true";
    document.head.appendChild(script);
  });

  return loading;
}

export async function openSnap(
  scriptUrl: string,
  clientKey: string,
  token: string,
  callbacks: SnapCallbacks,
) {
  const snap = await loadSnap(scriptUrl);
  snap.pay(token, callbacks);
}
