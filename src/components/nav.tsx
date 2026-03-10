"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/", label: "Overview", icon: "◉" },
  { href: "/brain", label: "Brain", icon: "🧠" },
  { href: "/observations", label: "Observations", icon: "◎" },
  { href: "/memory", label: "Memory", icon: "◈" },
  { href: "/directives", label: "Directives", icon: "⟐" },
  { href: "/alerts", label: "Alerts", icon: "△" },
  { href: "/causal", label: "Causal", icon: "⤳" },
];

export function Nav() {
  const pathname = usePathname();

  return (
    <nav className="flex w-48 shrink-0 flex-col gap-0.5 border-r border-[var(--color-border)] bg-[var(--color-surface)] p-3">
      <div className="mb-4 px-2 py-1">
        <div className="text-sm font-bold text-[var(--color-accent)]">
          ⚛ Atom
        </div>
        <div className="text-[10px] text-[var(--color-text-muted)]">
          Command Center
        </div>
      </div>
      {NAV_ITEMS.map((item) => {
        const active = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-2 rounded-md px-2 py-1.5 text-xs transition-colors",
              active
                ? "bg-[var(--color-accent-dim)] text-white"
                : "text-[var(--color-text-dim)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text)]"
            )}
          >
            <span className="w-4 text-center">{item.icon}</span>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
