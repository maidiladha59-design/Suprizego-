const MAX_EDGE = 1600;
const TARGET_BYTES = 300 * 1024;
const QUALITIES = [0.82, 0.72, 0.62, 0.5];

type Drawable = ImageBitmap | HTMLImageElement;

async function loadDrawable(file: File): Promise<Drawable> {
  if (typeof createImageBitmap === "function") {
    try {
      return await createImageBitmap(file, { imageOrientation: "from-image" });
    } catch {
      // Browser lama atau format khusus (mis. HEIC) bisa gagal di sini.
    }
  }
  const url = URL.createObjectURL(file);
  try {
    const image = new Image();
    image.src = url;
    await image.decode();
    return image;
  } finally {
    URL.revokeObjectURL(url);
  }
}

function drawToCanvas(source: Drawable, scale: number) {
  const width = Math.max(1, Math.round(source.width * scale));
  const height = Math.max(1, Math.round(source.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("canvas-unavailable");
  context.imageSmoothingQuality = "high";
  context.drawImage(source, 0, 0, width, height);
  return canvas;
}

function toBlob(canvas: HTMLCanvasElement, quality: number, type = "image/webp"): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("encode-failed"))),
      type,
      quality,
    );
  });
}

async function encode(canvas: HTMLCanvasElement, quality: number): Promise<Blob> {
  const blob = await toBlob(canvas, quality);
  if (blob.type === "image/webp") return blob;
  return toBlob(canvas, 0.85, "image/jpeg");
}

export async function compressPhoto(file: File): Promise<Blob> {
  const source = await loadDrawable(file);
  try {
    let scale = Math.min(1, MAX_EDGE / Math.max(source.width, source.height));
    let canvas = drawToCanvas(source, scale);
    let blob = await encode(canvas, QUALITIES[0] ?? 0.8);

    for (const quality of QUALITIES.slice(1)) {
      if (blob.size <= TARGET_BYTES) break;
      blob = await encode(canvas, quality);
    }

    while (blob.size > TARGET_BYTES && Math.max(canvas.width, canvas.height) > 640) {
      scale *= 0.8;
      canvas = drawToCanvas(source, scale);
      blob = await encode(canvas, QUALITIES[2] ?? 0.62);
    }

    return blob;
  } finally {
    if ("close" in source) source.close();
  }
}
