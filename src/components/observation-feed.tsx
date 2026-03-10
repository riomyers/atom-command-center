"use client";

import { useAtomd } from "@/hooks/use-atomd";
import type { Observation } from "@/lib/atomd";
import { outcomeColor, outcomeIcon, timeAgo } from "@/lib/utils";

export function ObservationFeed() {
  const { data, loading } = useAtomd<Observation[]>(
    "observations",
    "tail",
    { count: 20 },
    30000
  );

  if (loading) {
    return (
      <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-[var(--color-text-dim)]">
          Recent Observations
        </h3>
        <div className="animate-pulse text-xs text-[var(--color-text-muted)]">
          Loading...
        </div>
      </div>
    );
  }

  const observations = data || [];

  return (
    <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
      <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-[var(--color-text-dim)]">
        Recent Observations
      </h3>
      <div className="flex flex-col gap-1 overflow-y-auto" style={{ maxHeight: "320px" }}>
        {observations.length === 0 ? (
          <span className="text-xs text-[var(--color-text-muted)]">
            No observations yet
          </span>
        ) : (
          observations.map((obs, i) => (
            <div
              key={`${obs.timestamp}-${i}`}
              className="flex items-start gap-2 rounded px-2 py-1.5 transition-colors hover:bg-[var(--color-surface-hover)]"
            >
              <span
                className="mt-0.5 text-sm font-bold"
                style={{ color: outcomeColor(obs.outcome) }}
              >
                {outcomeIcon(obs.outcome)}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="truncate text-xs font-medium text-[var(--color-text)]">
                    {obs.action}
                  </span>
                  <span className="shrink-0 text-[10px] text-[var(--color-text-muted)]">
                    {timeAgo(obs.timestamp)}
                  </span>
                </div>
                {obs.detail && (
                  <span className="line-clamp-1 text-[10px] text-[var(--color-text-dim)]">
                    {obs.detail}
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
