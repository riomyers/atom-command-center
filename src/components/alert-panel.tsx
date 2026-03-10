"use client";

import { useAtomd } from "@/hooks/use-atomd";
import type { Alert } from "@/lib/atomd";
import { severityColor, timeAgo } from "@/lib/utils";

export function AlertPanel() {
  const { data, loading, refetch } = useAtomd<{ count: number; items: Alert[] }>(
    "alerts",
    "list",
    { limit: 20 },
    15000
  );

  async function dismissAlert(id: number) {
    await fetch("/api/atomd/alerts/dismiss", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    refetch();
  }

  const alerts = data?.items || [];

  return (
    <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--color-text-dim)]">
          Alerts
        </h3>
        {alerts.length > 0 && (
          <span
            className="rounded-full px-2 py-0.5 text-[10px] font-bold"
            style={{
              backgroundColor: "var(--color-error)",
              color: "var(--color-bg)",
            }}
          >
            {alerts.length}
          </span>
        )}
      </div>

      {loading ? (
        <div className="animate-pulse text-xs text-[var(--color-text-muted)]">
          Loading...
        </div>
      ) : alerts.length === 0 ? (
        <div className="flex items-center gap-2 text-xs text-[var(--color-text-muted)]">
          <span style={{ color: "var(--color-success)" }}>✓</span>
          All clear
        </div>
      ) : (
        <div className="flex flex-col gap-1.5 overflow-y-auto" style={{ maxHeight: "200px" }}>
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className="group flex items-start gap-2 rounded px-2 py-1.5 transition-colors hover:bg-[var(--color-surface-hover)]"
            >
              <span
                className="mt-1 inline-block h-2 w-2 shrink-0 rounded-full"
                style={{ backgroundColor: severityColor(alert.severity) }}
              />
              <div className="min-w-0 flex-1">
                <div className="text-xs font-medium">{alert.title}</div>
                {alert.detail && (
                  <div className="text-[10px] text-[var(--color-text-dim)]">
                    {alert.detail}
                  </div>
                )}
                <div className="text-[10px] text-[var(--color-text-muted)]">
                  {alert.source} · {timeAgo(alert.created_at)}
                </div>
              </div>
              <button
                onClick={() => dismissAlert(alert.id)}
                className="shrink-0 rounded px-1.5 py-0.5 text-[10px] text-[var(--color-text-muted)] opacity-0 transition-opacity hover:bg-[var(--color-border)] group-hover:opacity-100"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
