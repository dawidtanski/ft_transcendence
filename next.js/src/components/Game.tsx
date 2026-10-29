"use client";
import { useEffect, useRef } from "react";

export default function Game() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let game: import("phaser").Game | undefined;
    let cancelled = false;

    (async () => {
      // Imported here, so they only load in the browser
      const Phaser = (await import("phaser")).default;
      const TutorialScene = (await import("@/game/scenes/TutorialScene")).default;

      if (cancelled || !ref.current) return;
	
	  // config
      game = new Phaser.Game({
        type: Phaser.AUTO,
        parent: ref.current,
        width: 800,
        height: 600,
        scene: TutorialScene,
        physics: {
          default: "arcade",
          arcade: { gravity: { x: 0, y: 300 }, debug: false },
        },
        scale: {
          mode: Phaser.Scale.FIT,
          autoCenter: Phaser.Scale.CENTER_BOTH,
        },
      });
    })();

    return () => {
      cancelled = true;
      game?.destroy(true);
    };
  }, []);

  return <div ref={ref} className="w-full h-full" />;
}