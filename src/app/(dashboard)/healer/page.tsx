"use client";

import { useAtomd } from "@/hooks/use-atomd";
import { useState } from "react";

interface HealerStatus {
  last_run?: string;
  issues: { check: string; severity: string; message: string; fixed: boolean }[];
  checks_run: number;
  issues_found: number;
  issues_fixed: number;
}

export default function HealerPage() {
  const [running, setRunning] = useState(false);
  const { data, loading, refetch } = useAtomd<HealerStatus>(
    "healer",
    "status",
    {},
    60000
  );

  async function runHealer(dryRun: boolean) {
    setRunning(true);
    await fetch("/api/atomd/healer/run", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dry_run: dryRun }),
    });
    setRunning(false);
    refetch();
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold">Self-Healer</h1>
          <p className="text-xs text-[var(--color-text-muted)]">
            6 health checks, 3 safety levels — auto-repair what can be fixed
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => runHealer(true)}
            disabled={running}
            className="rounded border border-[var(--color-border)] px-2 py-1 text-xs text-[var(--color-text-dim)] transition-colors hover:bg-[var(--color-surface-hover)] disabled:opacity-50"
          >
            {running ? "Running..." : "Dry Run"}
          </button>
          <button
            onClick={() => runHealer(false)}
            disabled={running}
            className="rounded bg-[var(--color-accent)] px-2 py-1 text-xs text-white transition-colors hover:bg-[var(--color-accent-dim)] disabled:opacity-50"
          >
            Heal
          </button>
        </div>
      </div>

      {/* Summary */}
      {data && (
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-3 text-center">
            <div className="text-[10px] uppercase tracking-wider text-[var(--color-text-muted)]">
              Checks Run
            </div>
            <div className="text-xl font-bold">{data.checks_run}</div>
          </div>
          <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-3 text-center">
            <div className="text-[10px] uppercase tracking-wider text-[var(--color-text-muted)]">
              Issues Found
            </div>
            <div
              className="text-xl font-bold"
              style={{
                color:
                  data.issues_found > 0
                    ? "var(--color-warning)"
                    : "var(--color-success)",
              }}
            >
              {data.issues_found}
            </div>
          </div>
          <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-3 text-center">
            <div className="text-[10px] uppercase tracking-wider text-[var(--color-text-muted)]">
              Issues Fixed
            </div>
            <div className="text-xl font-bold" style={{ color: "var(--color-success)" }}>
              {data.issues_fixed}
            </div>
          </div>
        </div>
      )}

      {/* Issues */}
      <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]">
        {loading ? (
          <div className="animate-pulse p-4 text-xs text-[var(--color-text-muted)]">
            Loading healer status...
          </div>
        ) : !data || data.issues.length === 0 ? (
          <div className="flex items-center gap-2 p-6 text-sm text-[var(--color-text-muted)]">
            <span style={{ color: "var(--color-success)" }}>✓</span>
            All systems healthy — no issues detected
          </div>
        ) : (
          <div className="divide-y divide-[var(--color-border)]">
            {data.issues.map((issue, i) => (
              <div
                key={i}
                className="flex items-start gap-3 px-4 py-3"
              >
                <span
                  className="mt-0.5 inline-block h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{
                    backgroundColor:
                      issue.severity === "critical"
                        ? "var(--color-error)"
                        : issue.severity === "warning"
                          ? "var(--color-warning)"
                          : "var(--color-info)",
                  }}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline gap-2">
                    <span className="text-sm font-medium">{issue.check}</span>
                    {issue.fixed && (
                      <span
                        className="rounded px-1 text-[10px]"
                        style={{
                          backgroundColor: "rgba(34, 197, 94, 0.12)",
                          color: "var(--color-success)",
                        }}
                      >
                        fixed
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-xs text-[var(--color-text-dim)]">
                    {issue.message}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
