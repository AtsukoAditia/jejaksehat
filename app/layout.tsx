import type { Metadata, Viewport } from "next";
import { NetworkStatus } from "@/src/components/network-status";
import { PwaInstallPrompt } from "@/src/components/pwa-install-prompt";
import { PwaRegister } from "@/src/components/pwa-register";
import "./globals.css";
import "./progress.css";
import "./phase6.css";
import "./pwa.css";

export const metadata: Metadata = {
  title: {
    default: "JejakSehat",
    template: "%s | JejakSehat",
  },
  description: "PWA untuk mencatat aktivitas gym, lari, perkembangan tubuh, dan target kesehatan.",
  applicationName: "JejakSehat",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  appleWebApp: {
    capable: true,
    title: "JejakSehat",
    statusBarStyle: "black-translucent",
  },
};

export const viewport: Viewport = {
  themeColor: "#0d9468",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id">
      <body>
        {children}
        <NetworkStatus />
        <PwaInstallPrompt />
        <PwaRegister />
      </body>
    </html>
  );
}
