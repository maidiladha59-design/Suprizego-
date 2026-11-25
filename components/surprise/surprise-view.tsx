"use client";

import { useRef, useState, type CSSProperties } from "react";
import { getMoment } from "@/lib/moments";
import type { SurprisePage } from "@/lib/types";
import { SurpriseCover } from "./surprise-cover";
import { SurpriseContent } from "./surprise-content";

export function SurpriseView({ page }: { page: SurprisePage }) {
  const [opened, setOpened] = useState(false);
  const [musicOn, setMusicOn] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const moment = getMoment(page.moment);

  function playMusic() {
    const audio = audioRef.current;
    if (!audio) {
      return;
    }

    void audio
      .play()
      .then(() => setMusicOn(true))
      .catch(() => setMusicOn(false));
  }

  function handleOpen() {
    setOpened(true);
    window.scrollTo({ top: 0, left: 0 });
    if (page.musicUrl) {
      playMusic();
    }
  }

  function toggleMusic() {
    const audio = audioRef.current;
    if (!audio) {
      return;
    }

    if (audio.paused) {
      playMusic();
    } else {
      audio.pause();
      setMusicOn(false);
    }
  }

  const themeStyle = { "--accent": moment.accent } as CSSProperties;

  return (
    <div
      style={themeStyle}
      className="relative min-h-svh overflow-hidden bg-plum-deep text-cream"
    >
      <div aria-hidden="true" className="pointer-events-none fixed inset-0">
        <div
          className="absolute inset-0"
          style={{
            background: `radial-gradient(120% 80% at 50% -10%, ${moment.accent}38, transparent 62%), radial-gradient(90% 70% at 95% 105%, ${moment.accent}1c, transparent 58%)`,
          }}
        />
        <div className="bg-dots-dark absolute inset-0 opacity-50" />
        <div className="absolute inset-0 bg-linear-to-b from-transparent via-plum-deep/20 to-plum-deep" />
      </div>

      {page.musicUrl ? (
        <audio ref={audioRef} src={page.musicUrl} loop preload="none" />
      ) : null}

      <div className="relative">
        {opened ? (
          <SurpriseContent
            page={page}
            musicOn={musicOn}
            onToggleMusic={toggleMusic}
          />
        ) : (
          <SurpriseCover page={page} onOpen={handleOpen} />
        )}
      </div>
    </div>
  );
}
