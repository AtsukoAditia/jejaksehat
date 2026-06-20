import type { Metadata, Viewport } from "next";
import { PwaRegister } from "@/src/components/pwa-register";
import "./globals.css";
import "./progress.css";
import "./phase6.css";

export const metadata: Metadata = {
  title: {
    default: "JejakSehat",
    template: "%s | JejakSehat",
  },
  description: "PWA untuk mencatat aktivitas gym, lari, perkembangan tubuh, dan target kesehatan.",
  applicationName: "JejakSehat",
  manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = {
  themeColor: "#0d9468",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id">
      <body>
        {children}
        <PwaRegister />
      </body>
    </html>
  );
}
