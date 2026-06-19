import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "JejakSehat",
    template: "%s | JejakSehat",
  },
  description:
    "PWA untuk mencatat aktivitas gym, lari, perkembangan tubuh, dan target kesehatan.",
  applicationName: "JejakSehat",
  manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = {
  themeColor: "#1f7a4c",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
