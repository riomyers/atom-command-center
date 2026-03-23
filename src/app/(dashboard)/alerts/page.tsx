"use client";

import { useAtomd } from "@/hooks/use-atomd";
import type { Alert } from "@/lib/atomd";
import { severityColor, timeAgo, cn } from "@/lib/utils";
import { useState } from "react";

export default function AlertsPage() {
  const [filter, setFilter] = useState<string>("all");
  const { data, loading, refetch } = useAtomd<{ count: number; items: Alert[] }>(
    "alerts",
    "list",
    { limit: 100 },
    15000
  );

  const alerts = data?.items || [];
  const filtered =
    filter === "all"
      ? alerts
      : alerts.filter((a) => a.severity === filter);

  async function dismissAlert(id: number) {
    try {
      await fetch("/api/atomd/alerts/dismiss", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
    } catch (e) {
      console.error("Failed to dismiss alert:", e);
    }
    refetch();
  }

  async function clearAll() {
    try {
      await fetch("/api/atomd/alerts/clear", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
    } catch (e) {
      console.error("Failed to clear alerts:", e);
    }
    refetch();
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold">Alerts</h1>
          <p className="text-xs text-[var(--color-text-muted)]">
            {data?.count || 0} active alerts
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={refetch}
            className="rounded border border-[var(--color-border)] px-2 py-1 text-xs text-[var(--color-text-dim)] transition-colors hover:bg-[var(--color-surface-hover)]"
          >
            Refresh
          </button>
          {alerts.length > 0 && (
            <button
              onClick={clearAll}
              className="rounded border border-[var(--color-error)] px-2 py-1 text-xs transition-colors hover:bg-[rgba(239,68,68,0.1)]"
              style={{ color: "var(--color-error)" }}
            >
              Clear All
            </button>
          )}
        </div>
      </div>

      {/* Severity filters */}
      <div className="flex gap-1">
        {["all", "critical", "warning", "info"].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={cn(
              "rounded px-2.5 py-1 text-xs transition-colors",
              filter === s
                ? "bg-[var(--color-accent-dim)] text-white"
                : "text-[var(--color-text-dim)] hover:bg-[var(--color-surface-hover)]"
            )}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Alert list */}
      <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]">
        {loading ? (
          <div className="animate-pulse p-4 text-xs text-[var(--color-text-muted)]">
            Loading alerts...
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex items-center gap-2 p-6 text-sm text-[var(--color-text-muted)]">
            <span style={{ color: "var(--color-success)" }}>✓</span>
            {filter === "all" ? "No active alerts — all clear" : `No ${filter} alerts`}
          </div>
        ) : (
          <div className="divide-y divide-[var(--color-border)]">
            {filtered.map((alert) => (
              <div
                key={alert.id}
                className="group flex items-start gap-3 px-4 py-3 transition-colors hover:bg-[var(--color-surface-hover)]"
              >
                <span
                  className="mt-1.5 inline-block h-3 w-3 shrink-0 rounded-full"
                  style={{ backgroundColor: severityColor(alert.severity) }}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="text-sm font-medium">{alert.title}</span>
                    <span className="shrink-0 text-[10px] text-[var(--color-text-muted)]">
                      {timeAgo(alert.created_at)}
                    </span>
                  </div>
                  {alert.detail && (
                    <p className="mt-0.5 text-xs text-[var(--color-text-dim)]">
                      {alert.detail}
                    </p>
                  )}
                  <div className="mt-1 flex gap-2 text-[10px] text-[var(--color-text-muted)]">
                    <span
                      className="rounded px-1"
                      style={{
                        backgroundColor: `${severityColor(alert.severity)}20`,
                        color: severityColor(alert.severity),
                      }}
                    >
                      {alert.severity}
                    </span>
                    <span>{alert.source}</span>
                    {alert.project && <span>{alert.project}</span>}
                  </div>
                </div>
                <button
                  onClick={() => dismissAlert(alert.id)}
                  className="shrink-0 rounded px-2 py-1 text-xs text-[var(--color-text-muted)] opacity-0 transition-all hover:bg-[var(--color-border)] group-hover:opacity-100"
                >
                  Dismiss
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
