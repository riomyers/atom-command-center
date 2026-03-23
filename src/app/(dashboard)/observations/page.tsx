"use client";

import { useAtomd } from "@/hooks/use-atomd";
import type { Observation } from "@/lib/atomd";
import { outcomeColor, outcomeIcon, timeAgo, cn } from "@/lib/utils";
import { useState } from "react";

const OUTCOME_FILTERS = ["all", "success", "failure", "partial", "skipped"] as const;

export default function ObservationsPage() {
  const [outcomeFilter, setOutcomeFilter] = useState<string>("all");
  const { data, loading, refetch } = useAtomd<Observation[]>(
    "observations",
    "tail",
    { count: 100 },
    30000
  );

  const observations = data || [];
  const filtered =
    outcomeFilter === "all"
      ? observations
      : observations.filter((o) => o.outcome === outcomeFilter);

  const counts = {
    all: observations.length,
    success: observations.filter((o) => o.outcome === "success").length,
    failure: observations.filter((o) => o.outcome === "failure").length,
    partial: observations.filter((o) => o.outcome === "partial").length,
    skipped: observations.filter((o) => o.outcome === "skipped").length,
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold">Observations</h1>
          <p className="text-xs text-[var(--color-text-muted)]">
            Action log with outcomes, signal levels, and causal chains
          </p>
        </div>
        <button
          onClick={refetch}
          className="rounded border border-[var(--color-border)] px-2 py-1 text-xs text-[var(--color-text-dim)] transition-colors hover:bg-[var(--color-surface-hover)]"
        >
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-1">
        {OUTCOME_FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setOutcomeFilter(f)}
            className={cn(
              "rounded px-2.5 py-1 text-xs transition-colors",
              outcomeFilter === f
                ? "bg-[var(--color-accent-dim)] text-white"
                : "text-[var(--color-text-dim)] hover:bg-[var(--color-surface-hover)]"
            )}
          >
            {f} {counts[f as keyof typeof counts] > 0 && `(${counts[f as keyof typeof counts]})`}
          </button>
        ))}
      </div>

      {/* Timeline */}
      <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]">
        {loading ? (
          <div className="animate-pulse p-4 text-xs text-[var(--color-text-muted)]">
            Loading observations...
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-4 text-xs text-[var(--color-text-muted)]">
            No observations matching filter
          </div>
        ) : (
          <div className="divide-y divide-[var(--color-border)]">
            {filtered.map((obs, i) => (
              <div
                key={`${obs.timestamp}-${i}`}
                className="flex items-start gap-3 px-4 py-3 transition-colors hover:bg-[var(--color-surface-hover)]"
              >
                <span
                  className="mt-0.5 text-base font-bold"
                  style={{ color: outcomeColor(obs.outcome) }}
                >
                  {outcomeIcon(obs.outcome)}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="text-sm font-medium text-[var(--color-text)]">
                      {obs.action}
                    </span>
                    <span className="shrink-0 text-[10px] text-[var(--color-text-muted)]">
                      {timeAgo(obs.timestamp)}
                    </span>
                  </div>
                  {obs.detail && (
                    <p className="mt-0.5 text-xs text-[var(--color-text-dim)]">
                      {obs.detail}
                    </p>
                  )}
                  {obs.error && (
                    <p
                      className="mt-0.5 text-xs"
                      style={{ color: "var(--color-error)" }}
                    >
                      {obs.error}
                    </p>
                  )}
                  {obs.lesson && (
                    <p className="mt-0.5 text-xs text-[var(--color-info)]">
                      Lesson: {obs.lesson}
                    </p>
                  )}
                  <div className="mt-1 flex gap-2 text-[10px] text-[var(--color-text-muted)]">
                    {obs.project && <span>{obs.project}</span>}
                    {obs.signal_level && (
                      <span
                        className="rounded px-1"
                        style={{
                          backgroundColor:
                            obs.signal_level === "high"
                              ? "rgba(239, 68, 68, 0.15)"
                              : obs.signal_level === "medium"
                                ? "rgba(245, 158, 11, 0.15)"
                                : "rgba(59, 130, 246, 0.1)",
                        }}
                      >
                        {obs.signal_level}
                      </span>
                    )}
                    {obs.tags && <span>{obs.tags}</span>}
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
