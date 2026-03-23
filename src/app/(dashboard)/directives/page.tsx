"use client";

import { useAtomd } from "@/hooks/use-atomd";
import type { Directive } from "@/lib/atomd";
import { cn } from "@/lib/utils";
import { useState } from "react";

export default function DirectivesPage() {
  const [sortBy, setSortBy] = useState<"confidence" | "used_count" | "success_rate">("confidence");
  const { data, loading, refetch } = useAtomd<Directive[]>(
    "directives",
    "list",
    {},
    60000
  );

  const directives = data || [];
  const sorted = [...directives].sort((a, b) => {
    if (sortBy === "confidence") return b.confidence - a.confidence;
    if (sortBy === "used_count") return b.used_count - a.used_count;
    return b.success_rate - a.success_rate;
  });

  const statusCounts = directives.reduce(
    (acc, d) => {
      acc[d.status] = (acc[d.status] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  async function validateDirective(id: string, outcome: string) {
    try {
      await fetch("/api/atomd/directives/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ directive_id: id, outcome }),
      });
    } catch (e) {
      console.error("Failed to validate directive:", e);
    }
    refetch();
  }

  function confidenceBar(confidence: number) {
    const pct = Math.min(confidence * 10, 100);
    const color =
      confidence >= 8
        ? "var(--color-success)"
        : confidence >= 5
          ? "var(--color-warning)"
          : "var(--color-error)";
    return (
      <div className="flex items-center gap-2">
        <div className="h-1.5 w-16 overflow-hidden rounded-full bg-[var(--color-bg)]">
          <div
            className="h-full rounded-full"
            style={{ width: `${pct}%`, backgroundColor: color }}
          />
        </div>
        <span className="text-[10px] text-[var(--color-text-muted)]">
          {confidence.toFixed(1)}
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold">Directives</h1>
          <p className="text-xs text-[var(--color-text-muted)]">
            {directives.length} behavioral rules generated from observation patterns
          </p>
        </div>
        <button
          onClick={refetch}
          className="rounded border border-[var(--color-border)] px-2 py-1 text-xs text-[var(--color-text-dim)] transition-colors hover:bg-[var(--color-surface-hover)]"
        >
          Refresh
        </button>
      </div>

      {/* Status summary */}
      <div className="flex gap-3 text-xs text-[var(--color-text-muted)]">
        {Object.entries(statusCounts).map(([status, count]) => (
          <span key={status}>
            {count} {status}
          </span>
        ))}
      </div>

      {/* Sort controls */}
      <div className="flex gap-1">
        {(["confidence", "used_count", "success_rate"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setSortBy(s)}
            className={cn(
              "rounded px-2.5 py-1 text-xs transition-colors",
              sortBy === s
                ? "bg-[var(--color-accent-dim)] text-white"
                : "text-[var(--color-text-dim)] hover:bg-[var(--color-surface-hover)]"
            )}
          >
            {s.replace("_", " ")}
          </button>
        ))}
      </div>

      {/* Directive table */}
      <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]">
        {loading ? (
          <div className="animate-pulse p-4 text-xs text-[var(--color-text-muted)]">
            Loading directives...
          </div>
        ) : sorted.length === 0 ? (
          <div className="p-6 text-center text-xs text-[var(--color-text-muted)]">
            No directives generated yet
          </div>
        ) : (
          <div className="divide-y divide-[var(--color-border)]">
            {sorted.map((d) => (
              <div
                key={d.id}
                className="group px-4 py-3 transition-colors hover:bg-[var(--color-surface-hover)]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-[var(--color-text)]">
                      {d.pattern}
                    </p>
                    <div className="mt-1 flex flex-wrap items-center gap-3 text-[10px] text-[var(--color-text-muted)]">
                      <span
                        className="rounded px-1"
                        style={{
                          backgroundColor:
                            d.status === "active"
                              ? "rgba(34, 197, 94, 0.12)"
                              : d.status === "experimental"
                                ? "rgba(99, 102, 241, 0.12)"
                                : "rgba(136, 136, 160, 0.12)",
                          color:
                            d.status === "active"
                              ? "var(--color-success)"
                              : d.status === "experimental"
                                ? "var(--color-accent)"
                                : "var(--color-text-dim)",
                        }}
                      >
                        {d.status}
                      </span>
                      <span>{d.pattern_analyzer}</span>
                      <span>used {d.used_count}x</span>
                      <span>
                        {(d.success_rate * 100).toFixed(0)}% success
                      </span>
                      {confidenceBar(d.confidence)}
                    </div>
                  </div>
                  <div className="flex shrink-0 gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    <button
                      onClick={() => validateDirective(d.id, "success")}
                      className="rounded px-1.5 py-0.5 text-[10px] transition-colors hover:bg-[rgba(34,197,94,0.15)]"
                      style={{ color: "var(--color-success)" }}
                    >
                      ✓
                    </button>
                    <button
                      onClick={() => validateDirective(d.id, "failure")}
                      className="rounded px-1.5 py-0.5 text-[10px] transition-colors hover:bg-[rgba(239,68,68,0.15)]"
                      style={{ color: "var(--color-error)" }}
                    >
                      ✗
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
