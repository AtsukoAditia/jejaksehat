"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/dashboard", label: "Ringkasan", symbol: "⌂", exact: true },
  { href: "/dashboard/activities", label: "Aktivitas", symbol: "↗", exact: false },
  { href: "/dashboard/progress", label: "Progress", symbol: "◎", exact: false },
  { href: "/dashboard/profile", label: "Profile", symbol: "◐", exact: false },
];

export function DesktopNavigation() {
  const pathname = usePathname();

  return (
    <nav className="space-y-2" aria-label="Navigasi utama">
      {items.map((item) => {
        const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`nav-item ${active ? "nav-item-active" : ""}`}
          >
            <span className="nav-symbol" aria-hidden="true">{item.symbol}</span>
            <span>{item.label}</span>
          </Link>
        );
      })}
      <Link href="/dashboard/activities/new" className="primary-action mt-5">
        <span aria-hidden="true">＋</span>
        Catat aktivitas
      </Link>
    </nav>
  );
}

export function MobileNavigation() {
  const pathname = usePathname();

  const leftItems = items.slice(0, 2);
  const rightItems = items.slice(2);

  return (
    <nav className="mobile-nav" aria-label="Navigasi bawah">
      {leftItems.map((item) => {
        const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`mobile-nav-item ${active ? "mobile-nav-item-active" : ""}`}
          >
            <span className="text-xl" aria-hidden="true">{item.symbol}</span>
            <span>{item.label}</span>
          </Link>
        );
      })}
      <Link href="/dashboard/activities/new" className="mobile-add" aria-label="Catat aktivitas baru">
        ＋
      </Link>
      {rightItems.map((item) => {
        const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`mobile-nav-item ${active ? "mobile-nav-item-active" : ""}`}
          >
            <span className="text-xl" aria-hidden="true">{item.symbol}</span>
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
