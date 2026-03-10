"use client";

import { useBrainStream } from "@/hooks/use-atomd";

const PHASE_ORDER = [
  "project_scan",
  "harvest",
  "reindex",
  "assess",
  "synthesize",
  "directives",
  "auto_experiment",
  "decay",
  "weave",
  "consensus",
  "audit",
  "suggest",
  "heal",
  "l1_refresh",
];

export function BrainVisualizer() {
  const { phases, cycleActive, connected } = useBrainStream();

  const completedCount = phases.filter((p) => p.status === "complete").length;
  const errorCount = phases.filter((p) => p.status === "error").length;
  const runningPhase = phases.find((p) => p.status === "running");

  return (
    <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--color-text-dim)]">
          Brain Cycle
        </h3>
        <div className="flex items-center gap-2">
          <span
            className="inline-block h-2 w-2 rounded-full"
            style={{
              backgroundColor: connected
                ? cycleActive
                  ? "var(--color-warning)"
                  : "var(--color-success)"
                : "var(--color-error)",
            }}
          />
          <span className="text-xs text-[var(--color-text-muted)]">
            {!connected
              ? "Disconnected"
              : cycleActive
                ? `Phase: ${runningPhase?.phase || "..."}`
                : "Idle"}
          </span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-2 h-2 overflow-hidden rounded-full bg-[var(--color-bg)]">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: cycleActive
              ? `${(completedCount / PHASE_ORDER.length) * 100}%`
              : phases.length > 0
                ? "100%"
                : "0%",
            backgroundColor:
              errorCount > 0
                ? "var(--color-error)"
                : cycleActive
                  ? "var(--color-accent)"
                  : "var(--color-success)",
          }}
        />
      </div>

      <div className="flex items-center justify-between text-xs text-[var(--color-text-muted)]">
        <span>
          {completedCount}/{PHASE_ORDER.length} phases
          {errorCount > 0 && (
            <span style={{ color: "var(--color-error)" }}>
              {" "}
              ({errorCount} errors)
            </span>
          )}
        </span>
      </div>

      {/* Phase grid */}
      {cycleActive && (
        <div className="mt-3 flex flex-wrap gap-1">
          {PHASE_ORDER.map((name) => {
            const phase = phases.find((p) => p.phase === name);
            const bg = !phase
              ? "var(--color-bg)"
              : phase.status === "complete"
                ? "var(--color-success)"
                : phase.status === "error"
                  ? "var(--color-error)"
                  : "var(--color-accent)";
            return (
              <div
                key={name}
                className="rounded px-1.5 py-0.5 text-[10px]"
                style={{ backgroundColor: bg, opacity: phase ? 1 : 0.3 }}
                title={name}
              >
                {name.replace("_", " ")}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
