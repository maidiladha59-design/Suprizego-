import fs from "node:fs";

const dir = "C:/Users/User/Documents/SuprizeGo/.tmp";

function wav({ seconds, sampleRate, bits, label }) {
  const channels = 1;
  const bytesPerSample = bits / 8;
  const dataSize = Math.round(seconds * sampleRate) * channels * bytesPerSample;
  const buffer = Buffer.alloc(44 + dataSize);
  buffer.write("RIFF", 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write("WAVE", 8);
  buffer.write("fmt ", 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(channels, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(sampleRate * channels * bytesPerSample, 28);
  buffer.writeUInt16LE(channels * bytesPerSample, 32);
  buffer.writeUInt16LE(bits, 34);
  buffer.write("data", 36);
  buffer.writeUInt32LE(dataSize, 40);
  const frames = Math.round(seconds * sampleRate);
  for (let i = 0; i < frames; i += 1) {
    const value = Math.sin((2 * Math.PI * 440 * i) / sampleRate) * 0.25;
    const offset = 44 + i * bytesPerSample;
    if (bits === 16) buffer.writeInt16LE(Math.round(value * 32767), offset);
    else buffer.writeUInt8(Math.round((value + 1) * 127.5), offset);
  }
  const path = `${dir}/${label}`;
  fs.writeFileSync(path, buffer);
  return { path, size: buffer.length };
}

const ok = wav({ seconds: 2, sampleRate: 8000, bits: 16, label: "test-voice-ok.wav" });
const long = wav({ seconds: 65, sampleRate: 8000, bits: 8, label: "test-voice-long.wav" });
fs.writeFileSync(`${dir}/test-voice.txt`, "bukan audio");
fs.writeFileSync(`${dir}/test-voice-big.wav`, Buffer.alloc(6 * 1024 * 1024, 0));
console.log({ ok, long, big: 6 * 1024 * 1024 });
