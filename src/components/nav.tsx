"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAtomd } from "@/hooks/use-atomd";
import type { DaemonStatus } from "@/lib/atomd";

const NAV_ITEMS = [
  { href: "/", label: "Overview", icon: "◉" },
  { href: "/brain", label: "Brain", icon: "⚡" },
  { href: "/observations", label: "Observations", icon: "◎" },
  { href: "/memory", label: "Memory", icon: "◈" },
  { href: "/directives", label: "Directives", icon: "⟐" },
  { href: "/alerts", label: "Alerts", icon: "△" },
  { href: "/causal", label: "Causal", icon: "⤳" },
  { href: "/activity", label: "Activity", icon: "▦" },
  { href: "/suggestions", label: "Suggestions", icon: "✦" },
  { href: "/ollama", label: "Ollama", icon: "◬" },
  { href: "/healer", label: "Healer", icon: "✚" },
  { href: "/experiments", label: "Experiments", icon: "⚗" },
  { href: "/knowledge", label: "Knowledge", icon: "◇" },
];

export function Nav() {
  const pathname = usePathname();
  const { data: daemon } = useAtomd<DaemonStatus>(
    "daemon",
    "status",
    {},
    10000
  );

  const activeProject = daemon?.activity?.project || "none";
  const isIdle = daemon?.activity?.is_idle ?? true;
  const isOnline = daemon?.status === "running";

  return (
    <nav className="flex w-48 shrink-0 flex-col gap-0.5 border-r border-[var(--color-border)] bg-[var(--color-surface)] p-3">
      <div className="mb-2 px-2 py-1">
        <div className="text-sm font-bold text-[var(--color-accent)]">
          Atom
        </div>
        <div className="text-[10px] text-[var(--color-text-muted)]">
          Command Center
        </div>
      </div>

      {/* Connection + Active Project */}
      <div className="mb-3 rounded border border-[var(--color-border)] px-2 py-1.5">
        <div className="flex items-center gap-1.5 text-[10px]">
          <span
            className="inline-block h-1.5 w-1.5 rounded-full"
            style={{
              backgroundColor: isOnline
                ? "var(--color-success)"
                : "var(--color-error)",
            }}
          />
          <span className="text-[var(--color-text-muted)]">
            {isOnline ? "connected" : "offline"}
          </span>
        </div>
        {isOnline && (
          <div className="mt-0.5 flex items-center gap-1 text-[10px]">
            <span
              className="inline-block h-1.5 w-1.5 rounded-full"
              style={{
                backgroundColor: isIdle
                  ? "var(--color-text-muted)"
                  : "var(--color-success)",
              }}
            />
            <span className="truncate text-[var(--color-text-dim)]">
              {activeProject !== "none" ? activeProject : "idle"}
            </span>
          </div>
        )}
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

      {/* Footer */}
      {isOnline && daemon && (
        <div className="mt-auto border-t border-[var(--color-border)] pt-2 text-[10px] text-[var(--color-text-muted)]">
          <div>pid {daemon.pid}</div>
          <div>{daemon.requests_served} requests</div>
        </div>
      )}
    </nav>
  );
}
