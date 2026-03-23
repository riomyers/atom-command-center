"use client";

import { useAtomd } from "@/hooks/use-atomd";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface Experiment {
  id: string;
  directive_id: string;
  status: string;
  holdout_pct: number;
  min_sessions: number;
  sessions_control: number;
  sessions_treatment: number;
  created: string;
  results?: {
    treatment_rate: number;
    control_rate: number;
    lift: number;
    p_value: number;
    significant: boolean;
  };
}

export default function ExperimentsPage() {
  const [filter, setFilter] = useState<string>("all");
  const { data, loading, refetch } = useAtomd<Experiment[]>(
    "experiments",
    "list",
    {},
    60000
  );

  const experiments = data || [];
  const filtered =
    filter === "all"
      ? experiments
      : experiments.filter((e) => e.status === filter);

  async function concludeExperiment(id: string, action: string) {
    try {
      await fetch("/api/atomd/experiments/conclude", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ experiment_id: id, action }),
      });
    } catch (e) {
      console.error("Failed to conclude experiment:", e);
    }
    refetch();
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold">Experiments</h1>
          <p className="text-xs text-[var(--color-text-muted)]">
            A/B testing for behavioral directives — chi-squared significance
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
        {["all", "running", "concluded", "promoted", "retired"].map((s) => (
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

      {/* Experiment list */}
      <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]">
        {loading ? (
          <div className="animate-pulse p-4 text-xs text-[var(--color-text-muted)]">
            Loading experiments...
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-6 text-center text-xs text-[var(--color-text-muted)]">
            No experiments {filter === "all" ? "created" : `with status "${filter}"`}
          </div>
        ) : (
          <div className="divide-y divide-[var(--color-border)]">
            {filtered.map((exp) => (
              <div
                key={exp.id}
                className="group px-4 py-3 transition-colors hover:bg-[var(--color-surface-hover)]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline gap-2">
                      <span className="text-sm font-mono">
                        {exp.directive_id.slice(0, 8)}
                      </span>
                      <span
                        className="rounded px-1 text-[10px]"
                        style={{
                          backgroundColor:
                            exp.status === "running"
                              ? "rgba(99, 102, 241, 0.12)"
                              : exp.status === "promoted"
                                ? "rgba(34, 197, 94, 0.12)"
                                : "rgba(136, 136, 160, 0.12)",
                          color:
                            exp.status === "running"
                              ? "var(--color-accent)"
                              : exp.status === "promoted"
                                ? "var(--color-success)"
                                : "var(--color-text-dim)",
                        }}
                      >
                        {exp.status}
                      </span>
                    </div>
                    <div className="mt-1 flex flex-wrap gap-3 text-[10px] text-[var(--color-text-muted)]">
                      <span>
                        {exp.holdout_pct}% holdout
                      </span>
                      <span>
                        T: {exp.sessions_treatment} / C: {exp.sessions_control} sessions
                      </span>
                      <span>min {exp.min_sessions}</span>
                    </div>
                    {exp.results && (
                      <div className="mt-2 flex flex-wrap gap-3 text-xs">
                        <span>
                          Lift:{" "}
                          <span
                            style={{
                              color:
                                exp.results.lift > 0
                                  ? "var(--color-success)"
                                  : "var(--color-error)",
                            }}
                          >
                            {exp.results.lift > 0 ? "+" : ""}
                            {(exp.results.lift * 100).toFixed(1)}%
                          </span>
                        </span>
                        <span>
                          p={exp.results.p_value.toFixed(4)}
                          {exp.results.significant && (
                            <span style={{ color: "var(--color-success)" }}>
                              {" "}*
                            </span>
                          )}
                        </span>
                        <span>
                          T: {(exp.results.treatment_rate * 100).toFixed(0)}% vs C:{" "}
                          {(exp.results.control_rate * 100).toFixed(0)}%
                        </span>
                      </div>
                    )}
                  </div>
                  {exp.status === "running" && (
                    <div className="flex shrink-0 gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                      <button
                        onClick={() => concludeExperiment(exp.id, "promote")}
                        className="rounded px-1.5 py-0.5 text-[10px] text-[var(--color-success)] transition-colors hover:bg-[rgba(34,197,94,0.15)]"
                      >
                        Promote
                      </button>
                      <button
                        onClick={() => concludeExperiment(exp.id, "retire")}
                        className="rounded px-1.5 py-0.5 text-[10px] text-[var(--color-error)] transition-colors hover:bg-[rgba(239,68,68,0.15)]"
                      >
                        Retire
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
