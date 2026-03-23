"use client";

import { useAtomd } from "@/hooks/use-atomd";
import { timeAgo } from "@/lib/utils";

interface Suggestion {
  id: string;
  type: string;
  title: string;
  detail: string;
  confidence: number;
  created: string;
  expires?: string;
  snoozed_until?: string;
}

export default function SuggestionsPage() {
  const { data, loading, refetch } = useAtomd<Suggestion[]>(
    "suggestions",
    "list",
    { all: true },
    30000
  );

  const suggestions = data || [];

  async function dismiss(id: string) {
    try {
      await fetch("/api/atomd/suggestions/dismiss", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
    } catch (e) {
      console.error("Failed to dismiss suggestion:", e);
    }
    refetch();
  }

  async function snooze(id: string) {
    try {
      await fetch("/api/atomd/suggestions/snooze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, hours: 24 }),
      });
    } catch (e) {
      console.error("Failed to snooze suggestion:", e);
    }
    refetch();
  }

  async function feedback(id: string, outcome: string) {
    try {
      await fetch("/api/atomd/suggestions/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, outcome }),
      });
    } catch (e) {
      console.error("Failed to send feedback:", e);
    }
    refetch();
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-lg font-bold">Suggestions</h1>
        <p className="text-xs text-[var(--color-text-muted)]">
          Proactive recommendations from pattern analysis (max 5 active)
        </p>
      </div>

      <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]">
        {loading ? (
          <div className="animate-pulse p-4 text-xs text-[var(--color-text-muted)]">
            Loading suggestions...
          </div>
        ) : suggestions.length === 0 ? (
          <div className="p-6 text-center text-xs text-[var(--color-text-muted)]">
            No active suggestions
          </div>
        ) : (
          <div className="divide-y divide-[var(--color-border)]">
            {suggestions.map((s) => (
              <div
                key={s.id}
                className="group px-4 py-3 transition-colors hover:bg-[var(--color-surface-hover)]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline gap-2">
                      <span className="text-sm font-medium">{s.title}</span>
                      <span
                        className="rounded px-1 text-[10px]"
                        style={{
                          backgroundColor: "rgba(99, 102, 241, 0.12)",
                          color: "var(--color-accent)",
                        }}
                      >
                        {s.type}
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-[var(--color-text-dim)]">
                      {s.detail}
                    </p>
                    <div className="mt-1 flex gap-2 text-[10px] text-[var(--color-text-muted)]">
                      <span>{timeAgo(s.created)}</span>
                      <span>{(s.confidence * 100).toFixed(0)}% confidence</span>
                      {s.snoozed_until && <span>snoozed until {s.snoozed_until}</span>}
                    </div>
                  </div>
                  <div className="flex shrink-0 gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    <button
                      onClick={() => feedback(s.id, "helpful")}
                      className="rounded px-1.5 py-0.5 text-[10px] text-[var(--color-success)] transition-colors hover:bg-[rgba(34,197,94,0.15)]"
                    >
                      Helpful
                    </button>
                    <button
                      onClick={() => snooze(s.id)}
                      className="rounded px-1.5 py-0.5 text-[10px] text-[var(--color-warning)] transition-colors hover:bg-[rgba(245,158,11,0.15)]"
                    >
                      Snooze
                    </button>
                    <button
                      onClick={() => dismiss(s.id)}
                      className="rounded px-1.5 py-0.5 text-[10px] text-[var(--color-text-muted)] transition-colors hover:bg-[var(--color-border)]"
                    >
                      Dismiss
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
