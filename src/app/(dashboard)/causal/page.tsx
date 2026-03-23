"use client";

import { useAtomd } from "@/hooks/use-atomd";
import { useState, useCallback } from "react";
import { cn } from "@/lib/utils";

interface CausalChain {
  root_step_id: string;
  root_action: string;
  depth: number;
  nodes: { step_id: string; action: string; outcome: string; parent_id?: string }[];
}

interface CausalStats {
  total_nodes: number;
  total_edges: number;
  failure_chains: number;
  max_depth: number;
}

export default function CausalPage() {
  const [mermaidCode, setMermaidCode] = useState("");
  const [viewMode, setViewMode] = useState<"chains" | "mermaid">("chains");

  const { data: chains, loading: chainsLoading } = useAtomd<CausalChain[]>(
    "causal",
    "chains",
    { days: 30, min_depth: 2 },
    60000
  );

  const { data: stats } = useAtomd<CausalStats>(
    "causal",
    "stats",
    { days: 30 },
    60000
  );

  const exportMermaid = useCallback(async () => {
    const res = await fetch("/api/atomd/causal/export", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ days: 30, format: "mermaid" }),
    });
    const json = await res.json();
    if (json.ok && json.result?.diagram) {
      setMermaidCode(json.result.diagram);
      setViewMode("mermaid");
    }
  }, []);

  function outcomeStyle(outcome: string) {
    switch (outcome) {
      case "success":
        return { bg: "rgba(34, 197, 94, 0.12)", color: "var(--color-success)", icon: "✓" };
      case "failure":
        return { bg: "rgba(239, 68, 68, 0.12)", color: "var(--color-error)", icon: "✗" };
      case "partial":
        return { bg: "rgba(245, 158, 11, 0.12)", color: "var(--color-warning)", icon: "◐" };
      default:
        return { bg: "rgba(136, 136, 160, 0.12)", color: "var(--color-text-dim)", icon: "○" };
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold">Causal Chains</h1>
          <p className="text-xs text-[var(--color-text-muted)]">
            Failure chain analysis — trace cascading errors back to root causes
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode("chains")}
            className={cn(
              "rounded border px-2 py-1 text-xs transition-colors",
              viewMode === "chains"
                ? "border-[var(--color-accent)] text-[var(--color-accent)]"
                : "border-[var(--color-border)] text-[var(--color-text-dim)]"
            )}
          >
            Chains
          </button>
          <button
            onClick={exportMermaid}
            className={cn(
              "rounded border px-2 py-1 text-xs transition-colors",
              viewMode === "mermaid"
                ? "border-[var(--color-accent)] text-[var(--color-accent)]"
                : "border-[var(--color-border)] text-[var(--color-text-dim)]"
            )}
          >
            Mermaid
          </button>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {[
            { label: "Nodes", value: stats.total_nodes },
            { label: "Edges", value: stats.total_edges },
            { label: "Failure Chains", value: stats.failure_chains },
            { label: "Max Depth", value: stats.max_depth },
          ].map((s) => (
            <div
              key={s.label}
              className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-3 text-center"
            >
              <div className="text-[10px] uppercase tracking-wider text-[var(--color-text-muted)]">
                {s.label}
              </div>
              <div className="text-xl font-bold">{s.value}</div>
            </div>
          ))}
        </div>
      )}

      {/* Content */}
      {viewMode === "mermaid" && mermaidCode ? (
        <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-[var(--color-text-dim)]">
            Mermaid Diagram (copy to mermaid.live)
          </h3>
          <pre className="overflow-x-auto rounded bg-[var(--color-bg)] p-3 text-xs text-[var(--color-text-dim)]">
            {mermaidCode}
          </pre>
        </div>
      ) : (
        <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]">
          {chainsLoading ? (
            <div className="animate-pulse p-4 text-xs text-[var(--color-text-muted)]">
              Analyzing causal chains...
            </div>
          ) : !chains || chains.length === 0 ? (
            <div className="p-6 text-center text-xs text-[var(--color-text-muted)]">
              No failure chains detected in the last 30 days
            </div>
          ) : (
            <div className="divide-y divide-[var(--color-border)]">
              {chains.map((chain, ci) => (
                <div key={ci} className="px-4 py-3">
                  <div className="mb-2 flex items-baseline justify-between">
                    <span className="text-sm font-medium">
                      {chain.root_action}
                    </span>
                    <span className="text-[10px] text-[var(--color-text-muted)]">
                      depth {chain.depth}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1 pl-2">
                    {chain.nodes.map((node, ni) => {
                      const style = outcomeStyle(node.outcome);
                      return (
                        <div key={ni} className="flex items-center gap-2">
                          {ni > 0 && (
                            <span className="text-[var(--color-text-muted)]">
                              └─
                            </span>
                          )}
                          <span
                            className="rounded px-1.5 py-0.5 text-[10px]"
                            style={{
                              backgroundColor: style.bg,
                              color: style.color,
                            }}
                          >
                            {style.icon} {node.action}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
