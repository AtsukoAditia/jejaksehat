"use client";

import { useEffect } from "react";

export function PwaRegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator) || process.env.NODE_ENV !== "production") return;

    let timer: number | undefined;

    navigator.serviceWorker.register("/sw.js", { scope: "/" })
      .then((registration) => {
        registration.waiting?.postMessage({ type: "SKIP_WAITING" });
        timer = window.setInterval(() => registration.update(), 60 * 60 * 1000);
      })
      .catch((error: unknown) => {
        console.error("Service worker registration failed:", error);
      });

    return () => {
      if (timer) window.clearInterval(timer);
    };
  }, []);

  return null;
}
