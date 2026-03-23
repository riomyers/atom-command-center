"use client";

import { useAtomd } from "@/hooks/use-atomd";
import { useState, useCallback } from "react";

interface NexusStats {
  agents: Record<string, { chunks: number; types: Record<string, number> }>;
  graph: { nodes: number; edges: number; relationship_types: Record<string, number> };
}

interface NexusResult {
  content: string;
  type: string;
  relevance: number;
  agent: string;
  project?: string;
  uri?: string;
}

export default function KnowledgePage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<NexusResult[]>([]);
  const [searching, setSearching] = useState(false);

  const { data: stats } = useAtomd<NexusStats>("nexus", "stats", {}, 60000);

  const search = useCallback(async () => {
    if (!query.trim()) return;
    setSearching(true);
    try {
      const res = await fetch("/api/atomd/nexus/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: query.trim(), limit: 20 }),
      });
      const json = await res.json();
      if (json.ok) setResults(json.result || []);
    } finally {
      setSearching(false);
    }
  }, [query]);

  const graphStats = stats?.graph;
  const agents = stats?.agents || {};

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-lg font-bold">Knowledge Graph</h1>
        <p className="text-xs text-[var(--color-text-muted)]">
          Nexus federation — cross-agent memory search and graph relationships
        </p>
      </div>

      {/* Graph stats */}
      {graphStats && (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-3 text-center">
            <div className="text-[10px] uppercase tracking-wider text-[var(--color-text-muted)]">
              Nodes
            </div>
            <div className="text-xl font-bold">{graphStats.nodes}</div>
          </div>
          <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-3 text-center">
            <div className="text-[10px] uppercase tracking-wider text-[var(--color-text-muted)]">
              Edges
            </div>
            <div className="text-xl font-bold">{graphStats.edges}</div>
          </div>
          <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-3 text-center">
            <div className="text-[10px] uppercase tracking-wider text-[var(--color-text-muted)]">
              Agents
            </div>
            <div className="text-xl font-bold">{Object.keys(agents).length}</div>
          </div>
          <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-3 text-center">
            <div className="text-[10px] uppercase tracking-wider text-[var(--color-text-muted)]">
              Relationship Types
            </div>
            <div className="text-xl font-bold">
              {Object.keys(graphStats?.relationship_types || {}).length}
            </div>
          </div>
        </div>
      )}

      {/* Agent breakdown */}
      {Object.keys(agents).length > 0 && (
        <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-[var(--color-text-dim)]">
            Federated Agents
          </h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {Object.entries(agents).map(([agent, data]) => (
              <div
                key={agent}
                className="rounded border border-[var(--color-border)] p-3"
              >
                <div className="text-sm font-medium text-[var(--color-accent)]">
                  {agent}
                </div>
                <div className="text-[10px] text-[var(--color-text-muted)]">
                  {data.chunks} chunks
                </div>
                {data.types && (
                  <div className="mt-1 flex flex-wrap gap-1">
                    {Object.entries(data.types).map(([type, count]) => (
                      <span
                        key={type}
                        className="rounded bg-[var(--color-bg)] px-1.5 py-0.5 text-[10px] text-[var(--color-text-dim)]"
                      >
                        {type}: {count}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Relationship types */}
      {graphStats?.relationship_types &&
        Object.keys(graphStats.relationship_types).length > 0 && (
          <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-[var(--color-text-dim)]">
              Edge Types
            </h3>
            <div className="flex flex-wrap gap-2">
              {Object.entries(graphStats.relationship_types).map(
                ([rel, count]) => (
                  <span
                    key={rel}
                    className="flex items-center gap-1 rounded border border-[var(--color-border)] px-2 py-1 text-xs"
                  >
                    <span className="text-[var(--color-accent)]">{rel}</span>
                    <span className="text-[var(--color-text-muted)]">
                      ({count})
                    </span>
                  </span>
                )
              )}
            </div>
          </div>
        )}

      {/* Search */}
      <div className="flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && search()}
          placeholder="Search across all federated agents..."
          className="flex-1 rounded border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-accent)] focus:outline-none"
        />
        <button
          onClick={search}
          disabled={searching || !query.trim()}
          className="rounded bg-[var(--color-accent)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--color-accent-dim)] disabled:opacity-50"
        >
          {searching ? "..." : "Search"}
        </button>
      </div>

      {/* Results */}
      {results.length > 0 && (
        <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]">
          <div className="divide-y divide-[var(--color-border)]">
            {results.map((r, i) => (
              <div
                key={i}
                className="px-4 py-3 transition-colors hover:bg-[var(--color-surface-hover)]"
              >
                <div className="flex items-baseline gap-2">
                  <span
                    className="rounded px-1.5 py-0.5 text-[10px]"
                    style={{
                      backgroundColor: "rgba(99, 102, 241, 0.12)",
                      color: "var(--color-accent)",
                    }}
                  >
                    {r.agent}
                  </span>
                  <span
                    className="rounded px-1 text-[10px]"
                    style={{
                      backgroundColor: "rgba(136, 136, 160, 0.12)",
                    }}
                  >
                    {r.type}
                  </span>
                  <span className="text-[10px] text-[var(--color-text-muted)]">
                    {(r.relevance * 100).toFixed(0)}%
                  </span>
                </div>
                <p className="mt-1 text-sm text-[var(--color-text)]">
                  {r.content}
                </p>
                {r.project && (
                  <span className="mt-0.5 inline-block text-[10px] text-[var(--color-text-muted)]">
                    {r.project}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
