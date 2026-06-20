"use client";

import { useEffect, useState } from "react";

interface InstallEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const DISMISS_KEY = "jejaksehat-install-dismissed";

export function PwaInstallPrompt() {
  const [installEvent, setInstallEvent] = useState<InstallEvent | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(display-mode: standalone)").matches) return;
    const dismissedAt = Number(localStorage.getItem(DISMISS_KEY) ?? 0);
    const recentlyDismissed = Date.now() - dismissedAt < 604800000;

    function capture(event: Event) {
      event.preventDefault();
      setInstallEvent(event as InstallEvent);
      if (!recentlyDismissed) setVisible(true);
    }

    function installed() {
      setInstallEvent(null);
      setVisible(false);
      localStorage.removeItem(DISMISS_KEY);
    }

    window.addEventListener("beforeinstallprompt", capture);
    window.addEventListener("appinstalled", installed);
    return () => {
      window.removeEventListener("beforeinstallprompt", capture);
      window.removeEventListener("appinstalled", installed);
    };
  }, []);

  async function install() {
    if (!installEvent) return;
    await installEvent.prompt();
    const choice = await installEvent.userChoice;
    if (choice.outcome === "dismissed") {
      localStorage.setItem(DISMISS_KEY, String(Date.now()));
    }
    setInstallEvent(null);
    setVisible(false);
  }

  function dismiss() {
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
    setVisible(false);
  }

  if (!visible || !installEvent) return null;

  return (
    <aside className="install-card" aria-label="Instal JejakSehat">
      <div className="install-mark" aria-hidden="true">J+</div>
      <div className="min-w-0 flex-1">
        <strong>Pasang JejakSehat</strong>
        <p>Akses latihan dan progress lebih cepat dari layar utama perangkatmu.</p>
        <div className="mt-3 flex gap-2">
          <button type="button" className="install-primary" onClick={install}>Pasang</button>
          <button type="button" className="install-secondary" onClick={dismiss}>Nanti</button>
        </div>
      </div>
      <button type="button" className="install-close" onClick={dismiss} aria-label="Tutup saran instalasi">×</button>
    </aside>
  );
}
