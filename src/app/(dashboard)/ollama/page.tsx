"use client";

import { useAtomd } from "@/hooks/use-atomd";
import type { OllamaStatus } from "@/lib/atomd";

export default function OllamaPage() {
  const { data, loading, refetch } = useAtomd<OllamaStatus>(
    "ollama",
    "status",
    {},
    30000
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold">Ollama Pool</h1>
          <p className="text-xs text-[var(--color-text-muted)]">
            Multi-host model pool with health checks and failover
          </p>
        </div>
        <button
          onClick={refetch}
          className="rounded border border-[var(--color-border)] px-2 py-1 text-xs text-[var(--color-text-dim)] transition-colors hover:bg-[var(--color-surface-hover)]"
        >
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="animate-pulse text-xs text-[var(--color-text-muted)]">
          Loading Ollama status...
        </div>
      ) : !data ? (
        <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-6 text-center text-xs text-[var(--color-text-muted)]">
          Ollama pool unreachable
        </div>
      ) : (
        <>
          {/* Pool summary */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4 text-center">
              <div className="text-[10px] uppercase tracking-wider text-[var(--color-text-muted)]">
                Pool
              </div>
              <div className="text-xl font-bold">{data.pool || "default"}</div>
            </div>
            <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4 text-center">
              <div className="text-[10px] uppercase tracking-wider text-[var(--color-text-muted)]">
                Health
              </div>
              <div
                className="text-xl font-bold"
                style={{
                  color:
                    data.health === "healthy"
                      ? "var(--color-success)"
                      : data.health === "degraded"
                        ? "var(--color-warning)"
                        : "var(--color-error)",
                }}
              >
                {data.health}
              </div>
            </div>
          </div>

          {/* Hosts */}
          <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]">
            <div className="border-b border-[var(--color-border)] px-4 py-2">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-dim)]">
                Hosts ({data.hosts?.length || 0})
              </h3>
            </div>
            {data.hosts?.map((host, i) => (
              <div
                key={i}
                className="flex items-start gap-3 border-b border-[var(--color-border)] px-4 py-3 last:border-b-0"
              >
                <span
                  className="mt-1 inline-block h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{
                    backgroundColor:
                      host.status === "healthy" || host.status === "online"
                        ? "var(--color-success)"
                        : host.status === "degraded"
                          ? "var(--color-warning)"
                          : "var(--color-error)",
                  }}
                />
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium">{host.url}</div>
                  <div className="mt-0.5 text-[10px] text-[var(--color-text-muted)]">
                    {host.status}
                  </div>
                  {host.models && host.models.length > 0 && (
                    <div className="mt-1 flex flex-wrap gap-1">
                      {host.models.map((model) => (
                        <span
                          key={model}
                          className="rounded bg-[var(--color-bg)] px-1.5 py-0.5 text-[10px] text-[var(--color-text-dim)]"
                        >
                          {model}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
