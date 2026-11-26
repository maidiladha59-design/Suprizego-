const SVG_NAMESPACE = "http://www.w3.org/2000/svg";
const OUTPUT_WIDTH = 1080;

function loadSvgImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      if (image.naturalWidth === 0 || image.naturalHeight === 0) {
        reject(new Error("Svg gambar tidak memiliki ukuran."));
        return;
      }
      resolve(image);
    };
    image.onerror = () => reject(new Error("Svg kartu kenangan gagal dimuat."));
    image.src = url;
  });
}

function canvasToPng(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("Gambar PNG gagal dibuat."));
    }, "image/png");
  });
}

function downloadPng(blob: Blob) {
  const url = URL.createObjectURL(blob);

  try {
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "kartu-kenangan-bima-sekar.png";
    anchor.style.display = "none";
    document.body.appendChild(anchor);
    try {
      anchor.click();
    } finally {
      anchor.remove();
    }
  } finally {
    window.setTimeout(() => URL.revokeObjectURL(url), 30_000);
  }
}

export async function saveDemoMemoryImage(svgRef: {
  readonly current: SVGSVGElement | null;
}): Promise<void> {
  const svg = svgRef.current;
  if (!svg) throw new Error("Kartu kenangan belum siap disimpan.");

  const viewBox = svg.viewBox.baseVal;
  if (
    !Number.isFinite(viewBox.width) ||
    !Number.isFinite(viewBox.height) ||
    viewBox.width <= 0 ||
    viewBox.height <= 0
  ) {
    throw new Error("Ukuran kartu kenangan tidak valid.");
  }

  const svgCopy = svg.cloneNode(true) as SVGSVGElement;
  svgCopy.setAttribute("xmlns", SVG_NAMESPACE);
  svgCopy.setAttribute("width", String(viewBox.width));
  svgCopy.setAttribute("height", String(viewBox.height));

  const markup = new XMLSerializer().serializeToString(svgCopy);
  const svgBlob = new Blob([markup], { type: "image/svg+xml" });
  const svgUrl = URL.createObjectURL(svgBlob);

  try {
    const image = await loadSvgImage(svgUrl);
    const canvas = document.createElement("canvas");
    canvas.width = OUTPUT_WIDTH;
    canvas.height = Math.max(
      1,
      Math.round((OUTPUT_WIDTH * viewBox.height) / viewBox.width),
    );

    const context = canvas.getContext("2d");
    if (!context) throw new Error("Canvas browser tidak tersedia.");

    context.fillStyle = "#FFF4E0";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = "high";
    context.drawImage(image, 0, 0, canvas.width, canvas.height);

    const pngBlob = await canvasToPng(canvas);
    downloadPng(pngBlob);
  } finally {
    URL.revokeObjectURL(svgUrl);
  }
}
