import { ImageResponse } from "next/og";
import { Logo } from "@/components/Logo";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";
export const alt = "SuprizeGo — satu link untuk kejutan personal";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          overflow: "hidden",
          backgroundColor: "#FFF4E0",
          padding: "58px 64px 70px",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -120,
            right: -70,
            width: 420,
            height: 420,
            display: "flex",
            borderRadius: "50%",
            backgroundColor: "#FFCA3A",
            border: "8px solid #111111",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -150,
            left: -90,
            width: 360,
            height: 360,
            display: "flex",
            borderRadius: "50%",
            backgroundColor: "#B6F22E",
            border: "8px solid #111111",
          }}
        />
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            position: "relative",
            backgroundColor: "#FF8FB8",
            border: "8px solid #111111",
            borderRadius: "34px",
            boxShadow: "16px 16px 0 #111111",
            padding: "46px 52px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "22px" }}>
            <Logo animated={false} size={132} />
            <div
              style={{
                display: "flex",
                color: "#111111",
                fontSize: "58px",
                fontWeight: 900,
                letterSpacing: "-3px",
              }}
            >
              SUPRIZEGO
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div
                style={{
                  display: "flex",
                  color: "#111111",
                  fontSize: "72px",
                  fontWeight: 900,
                  lineHeight: 1.02,
                  letterSpacing: "-3px",
                }}
              >
                SATU LINK.
              </div>
              <div
                style={{
                  display: "flex",
                  color: "#111111",
                  fontSize: "72px",
                  fontWeight: 900,
                  lineHeight: 1.02,
                  letterSpacing: "-3px",
                }}
              >
                BANYAK KEJUTAN.
              </div>
            </div>
            <div
              style={{
                display: "flex",
                color: "#111111",
                fontSize: "25px",
                fontWeight: 700,
              }}
            >
              Cerita, foto, musik, dan surat dalam satu halaman personal.
            </div>
          </div>
        </div>
      </div>
    ),
    size,
  );
}
