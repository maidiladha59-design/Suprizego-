export type MemoryCardInput = {
  recipientName: string;
  senderName: string;
  momentLabel: string;
  pageUrl: string;
  background: string;
  accent: string;
  accentSoft: string;
  surface: string;
};

const WIDTH = 1080;
const HEIGHT = 1350;
const INK = "#111111";

function roundedRect(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) {
  const r = Math.min(radius, width / 2, height / 2);
  context.beginPath();
  context.moveTo(x + r, y);
  context.lineTo(x + width - r, y);
  context.quadraticCurveTo(x + width, y, x + width, y + r);
  context.lineTo(x + width, y + height - r);
  context.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
  context.lineTo(x + r, y + height);
  context.quadraticCurveTo(x, y + height, x, y + height - r);
  context.lineTo(x, y + r);
  context.quadraticCurveTo(x, y, x + r, y);
  context.closePath();
}

function splitLongWord(context: CanvasRenderingContext2D, word: string, maxWidth: number) {
  const parts: string[] = [];
  let current = "";
  for (const character of word) {
    const next = current + character;
    if (current && context.measureText(next).width > maxWidth) {
      parts.push(current);
      current = character;
    } else {
      current = next;
    }
  }
  if (current) parts.push(current);
  return parts;
}

function wrapLines(context: CanvasRenderingContext2D, text: string, maxWidth: number) {
  const lines: string[] = [];
  for (const paragraph of text.split(/\n+/)) {
    const words = paragraph.trim().split(/\s+/).filter(Boolean);
    if (words.length === 0) continue;
    let current = "";
    for (const word of words.flatMap((item) => splitLongWord(context, item, maxWidth))) {
      const next = current ? `${current} ${word}` : word;
      if (current && context.measureText(next).width > maxWidth) {
        lines.push(current);
        current = word;
      } else {
        current = next;
      }
    }
    if (current) lines.push(current);
  }
  return lines;
}

function drawWrappedText(
  context: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  maxLines: number,
) {
  const lines = wrapLines(context, text, maxWidth).slice(0, maxLines);
  lines.forEach((line, index) => context.fillText(line, x, y + index * lineHeight));
  return y + lines.length * lineHeight;
}

function displayUrl(value: string) {
  try {
    const url = new URL(value);
    return `${url.host}${url.pathname}`;
  } catch {
    return "suprizego.vercel.app";
  }
}

function drawEnvelope(context: CanvasRenderingContext2D, input: MemoryCardInput) {
  context.save();
  context.translate(WIDTH / 2, 382);
  context.lineJoin = "round";
  context.lineWidth = 8;
  context.strokeStyle = INK;
  context.fillStyle = input.accent;
  roundedRect(context, -168, -104, 336, 216, 26);
  context.fill();
  context.stroke();

  context.fillStyle = input.accentSoft;
  context.beginPath();
  context.moveTo(-164, -96);
  context.lineTo(0, 18);
  context.lineTo(164, -96);
  context.closePath();
  context.fill();
  context.stroke();

  context.fillStyle = input.surface;
  context.beginPath();
  context.moveTo(-164, 104);
  context.lineTo(-38, 8);
  context.lineTo(0, 40);
  context.lineTo(38, 8);
  context.lineTo(164, 104);
  context.closePath();
  context.fill();
  context.stroke();

  context.fillStyle = INK;
  context.beginPath();
  context.arc(-45, -14, 5, 0, Math.PI * 2);
  context.arc(45, -14, 5, 0, Math.PI * 2);
  context.fill();
  context.lineWidth = 6;
  context.lineCap = "round";
  context.beginPath();
  context.arc(0, 8, 34, 0.15 * Math.PI, 0.85 * Math.PI);
  context.stroke();
  context.restore();
}

function drawCard(context: CanvasRenderingContext2D, input: MemoryCardInput) {
  context.fillStyle = input.background;
  context.fillRect(0, 0, WIDTH, HEIGHT);

  context.save();
  context.globalAlpha = 0.22;
  context.fillStyle = input.accentSoft;
  for (let x = 36; x < WIDTH; x += 92) {
    for (let y = 36; y < HEIGHT; y += 92) {
      context.beginPath();
      context.arc(x, y, 9, 0, Math.PI * 2);
      context.fill();
    }
  }
  context.restore();

  context.save();
  context.shadowColor = INK;
  context.shadowOffsetX = 16;
  context.shadowOffsetY = 18;
  context.fillStyle = input.surface;
  roundedRect(context, 62, 58, WIDTH - 124, HEIGHT - 116, 46);
  context.fill();
  context.restore();
  context.lineWidth = 7;
  context.strokeStyle = INK;
  roundedRect(context, 62, 58, WIDTH - 124, HEIGHT - 116, 46);
  context.stroke();

  context.textAlign = "center";
  context.fillStyle = INK;
  context.font = "800 25px Arial, sans-serif";
  context.fillText("SUPRIZEGO", WIDTH / 2, 128);
  context.font = "700 20px Arial, sans-serif";
  context.fillText(input.momentLabel.toUpperCase(), WIDTH / 2, 166);

  drawEnvelope(context, input);

  context.fillStyle = INK;
  context.font = "900 70px Arial, sans-serif";
  const titleBottom = drawWrappedText(
    context,
    `Untuk ${input.recipientName}`,
    WIDTH / 2,
    614,
    WIDTH - 240,
    78,
    2,
  );

  context.fillStyle = input.accent;
  roundedRect(context, WIDTH / 2 - 112, titleBottom + 22, 224, 12, 6);
  context.fill();

  context.fillStyle = INK;
  context.font = "700 32px Arial, sans-serif";
  drawWrappedText(
    context,
    "Terima kasih sudah menjadi bagian dari cerita ini. Semoga hal-hal baik terus menemukan kalian.",
    WIDTH / 2,
    titleBottom + 110,
    WIDTH - 280,
    48,
    4,
  );

  context.font = "900 34px Arial, sans-serif";
  context.fillText(`— ${input.senderName}`, WIDTH / 2, HEIGHT - 280);

  context.strokeStyle = INK;
  context.lineWidth = 3;
  context.setLineDash([12, 10]);
  context.beginPath();
  context.moveTo(128, HEIGHT - 222);
  context.lineTo(WIDTH - 128, HEIGHT - 222);
  context.stroke();
  context.setLineDash([]);

  context.fillStyle = INK;
  context.font = "700 23px Arial, sans-serif";
  drawWrappedText(
    context,
    displayUrl(input.pageUrl),
    WIDTH / 2,
    HEIGHT - 166,
    WIDTH - 220,
    32,
    2,
  );
  context.font = "700 18px Arial, sans-serif";
  context.fillText("Dibuat dengan SuprizeGo", WIDTH / 2, HEIGHT - 92);
}

function canvasToBlob(canvas: HTMLCanvasElement) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("Kartu PNG gagal dibuat."));
    }, "image/png");
  });
}

function safeFileName(value: string) {
  const slug = value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
  return slug || "kenangan";
}

function downloadBlob(blob: Blob, recipientName: string) {
  const url = URL.createObjectURL(blob);
  try {
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `kartu-${safeFileName(recipientName)}.png`;
    anchor.style.display = "none";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
  } finally {
    window.setTimeout(() => URL.revokeObjectURL(url), 30_000);
  }
}

export async function saveMemoryCard(input: MemoryCardInput): Promise<void> {
  const canvas = document.createElement("canvas");
  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas browser tidak tersedia.");
  drawCard(context, input);
  const blob = await canvasToBlob(canvas);
  downloadBlob(blob, input.recipientName);
}
