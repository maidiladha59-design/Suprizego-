import { ImageResponse } from "next/og";
import { Logo } from "@/components/Logo";

export const size = {
  width: 192,
  height: 192,
};

export const contentType = "image/png";
export const alt = "SuprizeGo";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: size.width,
          height: size.height,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Logo animated={false} size={160} />
      </div>
    ),
    size,
  );
}
