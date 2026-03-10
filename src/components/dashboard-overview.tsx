"use client";

import { useAtomd } from "@/hooks/use-atomd";
import type { BriefingPacket, DaemonStatus } from "@/lib/atomd";
import { formatDuration, gradeColor } from "@/lib/utils";
import { StatusCard } from "./status-card";
import { BrainVisualizer } from "./brain-visualizer";
import { ObservationFeed } from "./observation-feed";
import { AlertPanel } from "./alert-panel";

export function DashboardOverview() {
  const { data: daemon } = useAtomd<DaemonStatus>(
    "daemon",
    "status",
    {},
    10000
  );
  const { data: briefing } = useAtomd<BriefingPacket>(
    "briefing",
    "get",
    {},
    30000
  );

  const grade = briefing?.brain?.last_assessment?.grade || briefing?.brain?.grade || "?";
  const successRate = briefing?.brain?.success_rate
    ? `${(briefing.brain.success_rate * 100).toFixed(0)}%`
    : "—";
  const infraStatus = briefing?.infrastructure;
  const alertCount = briefing?.alerts?.count || 0;
  const uptime = daemon?.uptime_seconds
    ? formatDuration(daemon.uptime_seconds)
    : "—";
  const activeProject = daemon?.activity?.project || "none";
  const isIdle = daemon?.activity?.is_idle ?? true;

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold">System Overview</h1>
          <p className="text-xs text-[var(--color-text-muted)]">
            {daemon?.status === "running" ? (
              <>
                atomd running · pid {daemon.pid} · {daemon.requests_served}{" "}
                requests served
              </>
            ) : (
              <span style={{ color: "var(--color-error)" }}>
                atomd offline
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-[var(--color-text-dim)]">
          <span
            className="inline-block h-2 w-2 rounded-full"
            style={{
              backgroundColor: isIdle
                ? "var(--color-text-muted)"
                : "var(--color-success)",
            }}
          />
          {activeProject !== "none" ? activeProject : "idle"}
        </div>
      </div>

      {/* Status cards */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatusCard
          label="Brain Grade"
          value={grade}
          color={gradeColor(grade)}
          detail={`${successRate} success rate`}
          pulse={grade === "S"}
        />
        <StatusCard
          label="Uptime"
          value={uptime}
          detail={`${daemon?.brain_pending_events || 0} pending events`}
        />
        <StatusCard
          label="Alerts"
          value={String(alertCount)}
          color={alertCount > 0 ? "var(--color-error)" : "var(--color-success)"}
          detail={alertCount === 0 ? "All clear" : "Active alerts"}
          pulse={alertCount > 0}
        />
        <StatusCard
          label="Infrastructure"
          value={
            infraStatus
              ? Object.values(infraStatus).filter(
                  (v) => v === "running" || v === "online" || v === "healthy"
                ).length +
                "/" +
                Object.values(infraStatus).length
              : "—"
          }
          color={
            infraStatus &&
            Object.values(infraStatus).every(
              (v) => v === "running" || v === "online" || v === "healthy"
            )
              ? "var(--color-success)"
              : "var(--color-warning)"
          }
          detail={
            infraStatus
              ? Object.entries(infraStatus)
                  .filter(
                    ([, v]) =>
                      v !== "running" && v !== "online" && v !== "healthy"
                  )
                  .map(([k]) => k)
                  .join(", ") || "All systems operational"
              : "Loading..."
          }
        />
      </div>

      {/* Brain + Observations + Alerts */}
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="flex flex-col gap-4">
          <BrainVisualizer />
          <AlertPanel />
        </div>
        <ObservationFeed />
      </div>

      {/* Footer */}
      <div className="text-[10px] text-[var(--color-text-muted)]">
        atomd: {daemon?.status || "unknown"} · uptime: {uptime} · requests:{" "}
        {daemon?.requests_served || 0}
      </div>
    </div>
  );
}
