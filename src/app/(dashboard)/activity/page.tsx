"use client";

import { useAtomd } from "@/hooks/use-atomd";

interface TrendsData {
  daily: { date: string; total: number; success: number; failure: number }[];
  by_project: Record<string, number>;
  by_type: Record<string, number>;
}

export default function ActivityPage() {
  const { data: trends, loading } = useAtomd<TrendsData>(
    "synthesizer",
    "trends",
    { days: 30 },
    120000
  );

  const daily = trends?.daily || [];
  const byProject = trends?.by_project || {};
  const byType = trends?.by_type || {};
  const maxTotal = Math.max(...daily.map((d) => d.total), 1);
  const maxProject = Math.max(...Object.values(byProject), 1);
  const maxType = Math.max(...Object.values(byType), 1);

  function intensityColor(count: number): string {
    if (count === 0) return "var(--color-bg)";
    const ratio = count / maxTotal;
    if (ratio > 0.75) return "var(--color-success)";
    if (ratio > 0.5) return "rgba(34, 197, 94, 0.6)";
    if (ratio > 0.25) return "rgba(34, 197, 94, 0.35)";
    return "rgba(34, 197, 94, 0.15)";
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-lg font-bold">Activity</h1>
        <p className="text-xs text-[var(--color-text-muted)]">
          30-day activity heatmap from observation trends
        </p>
      </div>

      {loading ? (
        <div className="animate-pulse text-xs text-[var(--color-text-muted)]">
          Loading activity data...
        </div>
      ) : (
        <>
          {/* Heatmap grid */}
          <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-[var(--color-text-dim)]">
              Daily Activity
            </h3>
            <div className="flex flex-wrap gap-1">
              {daily.map((day) => (
                <div
                  key={day.date}
                  className="h-4 w-4 rounded-sm transition-colors"
                  style={{ backgroundColor: intensityColor(day.total) }}
                  title={`${day.date}: ${day.total} observations (${day.success} success, ${day.failure} failure)`}
                />
              ))}
            </div>
            <div className="mt-2 flex items-center gap-2 text-[10px] text-[var(--color-text-muted)]">
              <span>Less</span>
              {[0, 0.15, 0.35, 0.6, 1].map((v, i) => (
                <div
                  key={i}
                  className="h-3 w-3 rounded-sm"
                  style={{
                    backgroundColor:
                      v === 0
                        ? "var(--color-bg)"
                        : v === 1
                          ? "var(--color-success)"
                          : `rgba(34, 197, 94, ${v})`,
                  }}
                />
              ))}
              <span>More</span>
            </div>
          </div>

          {/* By Project */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-[var(--color-text-dim)]">
                By Project
              </h3>
              <div className="flex flex-col gap-1.5">
                {Object.entries(byProject)
                  .sort(([, a], [, b]) => b - a)
                  .map(([project, count]) => {

                    return (
                      <div key={project} className="flex items-center gap-2">
                        <span className="w-24 truncate text-xs text-[var(--color-text)]">
                          {project}
                        </span>
                        <div className="h-2 flex-1 overflow-hidden rounded-full bg-[var(--color-bg)]">
                          <div
                            className="h-full rounded-full bg-[var(--color-accent)]"
                            style={{
                              width: `${(count / maxProject) * 100}%`,
                            }}
                          />
                        </div>
                        <span className="w-8 text-right text-[10px] text-[var(--color-text-muted)]">
                          {count}
                        </span>
                      </div>
                    );
                  })}
              </div>
            </div>

            <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-[var(--color-text-dim)]">
                By Type
              </h3>
              <div className="flex flex-col gap-1.5">
                {Object.entries(byType)
                  .sort(([, a], [, b]) => b - a)
                  .map(([type, count]) => {

                    return (
                      <div key={type} className="flex items-center gap-2">
                        <span className="w-24 truncate text-xs text-[var(--color-text)]">
                          {type}
                        </span>
                        <div className="h-2 flex-1 overflow-hidden rounded-full bg-[var(--color-bg)]">
                          <div
                            className="h-full rounded-full bg-[var(--color-info)]"
                            style={{
                              width: `${(count / maxType) * 100}%`,
                            }}
                          />
                        </div>
                        <span className="w-8 text-right text-[10px] text-[var(--color-text-muted)]">
                          {count}
                        </span>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
