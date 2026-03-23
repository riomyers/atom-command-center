"use client";

import { useBrainStream, useAtomd } from "@/hooks/use-atomd";
import type { BriefingPacket } from "@/lib/atomd";
import { gradeColor, timeAgo } from "@/lib/utils";
import { PHASE_ORDER } from "@/lib/constants";

const PHASE_DESCRIPTIONS: Record<string, string> = {
  project_scan: "Discover new git repos and active projects",
  harvest: "Extract patterns from observation logs via LLM",
  reindex: "Rebuild vector memory indices for changed files",
  assess: "Grade brain performance (S/A/B/C/D)",
  synthesize: "Correlate events + observations into insights",
  directives: "Generate behavioral rules from patterns",
  auto_experiment: "Create A/B experiments for new directives",
  decay: "Garbage collect old memories + expired directives",
  weave: "Discover relationships between memories (KG)",
  consensus: "Cross-agent federated consensus via Nexus",
  audit: "Adversarial tests + staleness checks on directives",
  suggest: "Generate proactive suggestions from patterns",
  heal: "Run self-healing health checks + auto-repair",
  l1_refresh: "Regenerate MEMORY.md from L2/L3 layers",
};

export default function BrainPage() {
  const { phases, cycleActive, connected } = useBrainStream();
  const { data: briefing } = useAtomd<BriefingPacket>(
    "briefing",
    "get",
    {},
    30000
  );

  const grade =
    briefing?.brain?.last_assessment?.grade || briefing?.brain?.grade || "?";
  const successRate = briefing?.brain?.success_rate;
  const lastAssessment = briefing?.brain?.last_assessment;
  const insights = briefing?.brain?.last_insights || [];
  const completedCount = phases.filter((p) => p.status === "complete").length;
  const errorCount = phases.filter((p) => p.status === "error").length;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-lg font-bold">Brain Cycle</h1>
        <p className="text-xs text-[var(--color-text-muted)]">
          14-phase learning loop — observe, learn, adapt
        </p>
      </div>

      {/* Grade + Status */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <div className="flex flex-col items-center gap-1 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
          <span className="text-xs uppercase tracking-wider text-[var(--color-text-muted)]">
            Grade
          </span>
          <span
            className="text-4xl font-black"
            style={{ color: gradeColor(grade) }}
          >
            {grade}
          </span>
          {successRate != null && (
            <span className="text-xs text-[var(--color-text-dim)]">
              {(successRate * 100).toFixed(1)}% success
            </span>
          )}
        </div>

        <div className="flex flex-col items-center gap-1 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
          <span className="text-xs uppercase tracking-wider text-[var(--color-text-muted)]">
            SSE
          </span>
          <span
            className="text-2xl font-bold"
            style={{
              color: connected
                ? "var(--color-success)"
                : "var(--color-error)",
            }}
          >
            {connected ? "Live" : "Off"}
          </span>
          <span className="text-xs text-[var(--color-text-dim)]">
            {cycleActive ? "Cycle running" : "Idle"}
          </span>
        </div>

        <div className="flex flex-col items-center gap-1 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
          <span className="text-xs uppercase tracking-wider text-[var(--color-text-muted)]">
            Phases
          </span>
          <span className="text-2xl font-bold">
            {completedCount}/{PHASE_ORDER.length}
          </span>
          {errorCount > 0 && (
            <span
              className="text-xs"
              style={{ color: "var(--color-error)" }}
            >
              {errorCount} errors
            </span>
          )}
        </div>

        <div className="flex flex-col items-center gap-1 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
          <span className="text-xs uppercase tracking-wider text-[var(--color-text-muted)]">
            Last Assessment
          </span>
          <span className="text-sm font-bold text-[var(--color-text)]">
            {lastAssessment?.timestamp
              ? timeAgo(lastAssessment.timestamp)
              : "—"}
          </span>
        </div>
      </div>

      {/* Phase Progress Bar */}
      <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-[var(--color-text-dim)]">
          Cycle Progress
        </h3>
        <div className="mb-4 h-3 overflow-hidden rounded-full bg-[var(--color-bg)]">
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

        {/* Phase Detail Grid */}
        <div className="grid gap-1.5 sm:grid-cols-2">
          {PHASE_ORDER.map((name) => {
            const phase = phases.find((p) => p.phase === name);
            const status = phase?.status;
            const borderColor =
              status === "complete"
                ? "var(--color-success)"
                : status === "error"
                  ? "var(--color-error)"
                  : status === "running"
                    ? "var(--color-accent)"
                    : "var(--color-border)";
            return (
              <div
                key={name}
                className="flex items-center gap-2 rounded border px-3 py-2 transition-colors"
                style={{
                  borderColor,
                  opacity: status ? 1 : 0.4,
                  backgroundColor:
                    status === "running"
                      ? "rgba(99, 102, 241, 0.08)"
                      : "transparent",
                }}
              >
                <span
                  className="inline-block h-2 w-2 shrink-0 rounded-full"
                  style={{
                    backgroundColor:
                      status === "complete"
                        ? "var(--color-success)"
                        : status === "error"
                          ? "var(--color-error)"
                          : status === "running"
                            ? "var(--color-accent)"
                            : "var(--color-border)",
                  }}
                />
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-medium">
                    {name.replace(/_/g, " ")}
                  </div>
                  <div className="text-[10px] text-[var(--color-text-muted)]">
                    {PHASE_DESCRIPTIONS[name] || ""}
                  </div>
                </div>
                {status === "running" && (
                  <span className="animate-pulse text-[10px] text-[var(--color-accent)]">
                    running
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Insights */}
      {insights.length > 0 && (
        <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-[var(--color-text-dim)]">
            Recent Insights
          </h3>
          <div className="flex flex-col gap-2">
            {insights.map((insight, i) => (
              <div
                key={i}
                className="flex items-start gap-2 rounded px-2 py-1.5"
              >
                <span
                  className="mt-0.5 inline-block h-2 w-2 shrink-0 rounded-full"
                  style={{
                    backgroundColor:
                      insight.severity === "critical"
                        ? "var(--color-error)"
                        : insight.severity === "warning"
                          ? "var(--color-warning)"
                          : "var(--color-info)",
                  }}
                />
                <div className="min-w-0 flex-1">
                  <span className="text-xs">{insight.message}</span>
                  <div className="text-[10px] text-[var(--color-text-muted)]">
                    {insight.type} · {insight.project}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
