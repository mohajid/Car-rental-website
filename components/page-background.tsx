"use client";

import { useEffect, useRef } from "react";

export default function PageBackground() {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const updateBackgroundState = () => {
      const isBlurred = window.scrollY > 120;
      const video = videoRef.current;

      document.body.classList.toggle("background-blurred", isBlurred);

      if (!video) return;

      if (isBlurred) {
        video.pause();
        return;
      }

      if (video.paused) {
        void video.play().catch(() => {
          // Muted autoplay is expected to work, but browsers can still defer it.
        });
      }
    };

    updateBackgroundState();
    window.addEventListener("scroll", updateBackgroundState, { passive: true });
    window.addEventListener("focus", updateBackgroundState);
    document.addEventListener("visibilitychange", updateBackgroundState);

    return () => {
      window.removeEventListener("scroll", updateBackgroundState);
      window.removeEventListener("focus", updateBackgroundState);
      document.removeEventListener("visibilitychange", updateBackgroundState);
    };
  }, []);

  return (
    <div aria-hidden="true" className="page-background">
      <video
        ref={videoRef}
        className="page-background__video"
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
      >
        <source
          src="/background%20video/WhatsApp%20Video%202026-07-02%20at%201.54.57%20PM.mp4"
          type="video/mp4"
        />
      </video>
      <div className="page-background__shade" />
    </div>
  );
}
