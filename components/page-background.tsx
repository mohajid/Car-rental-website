"use client";

import { useEffect } from "react";

export default function PageBackground() {
  useEffect(() => {
    const updateBackgroundState = () => {
      document.body.classList.toggle("background-blurred", window.scrollY > 120);
    };

    updateBackgroundState();
    window.addEventListener("scroll", updateBackgroundState, { passive: true });

    return () => window.removeEventListener("scroll", updateBackgroundState);
  }, []);

  return (
    <div aria-hidden="true" className="page-background">
      <div className="page-background__image" />
      <div className="page-background__shade" />
    </div>
  );
}
