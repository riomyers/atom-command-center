"use client";

import { useAtomd } from "@/hooks/use-atomd";
import { useState, useCallback } from "react";
import { cn } from "@/lib/utils";

interface MemoryResult {
  content: string;
  type: string;
  relevance: number;
  metadata?: Record<string, string>;
  project?: string;
}

interface MemoryStats {
  chunk_count: number;
  embedding_dim: number;
  types?: Record<string, number>;
}

export default function MemoryPage() {
  const [query, setQuery] = useState("");
  const [project, setProject] = useState("");
  const [results, setResults] = useState<MemoryResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [storeMode, setStoreMode] = useState(false);
  const [storeType, setStoreType] = useState("lesson");
  const [storeContent, setStoreContent] = useState("");
  const [storeStatus, setStoreStatus] = useState("");

  const { data: stats } = useAtomd<Record<string, MemoryStats>>(
    "memory",
    "stats",
    { project: project || "atom" },
    60000
  );

  const search = useCallback(async () => {
    if (!query.trim()) return;
    setSearching(true);
    try {
      const res = await fetch("/api/atomd/memory/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          project: project || "atom",
          query: query.trim(),
          limit: 20,
        }),
      });
      const json = await res.json();
      if (json.ok) {
        setResults(json.result || []);
      }
    } finally {
      setSearching(false);
    }
  }, [query, project]);

  async function storeMemory() {
    if (!storeContent.trim()) return;
    setStoreStatus("storing...");
    const res = await fetch("/api/atomd/memory/store", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        project: project || "atom",
        type: storeType,
        content: storeContent.trim(),
      }),
    });
    const json = await res.json();
    setStoreStatus(json.ok ? "Stored!" : json.error || "Failed");
    if (json.ok) {
      setStoreContent("");
      setTimeout(() => setStoreStatus(""), 2000);
    }
  }

  const statEntry = stats ? Object.values(stats)[0] : null;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold">Memory Explorer</h1>
          <p className="text-xs text-[var(--color-text-muted)]">
            Semantic search across vector memory (768-dim nomic-embed-text)
          </p>
        </div>
        <button
          onClick={() => setStoreMode(!storeMode)}
          className={cn(
            "rounded border px-2 py-1 text-xs transition-colors",
            storeMode
              ? "border-[var(--color-accent)] text-[var(--color-accent)]"
              : "border-[var(--color-border)] text-[var(--color-text-dim)] hover:bg-[var(--color-surface-hover)]"
          )}
        >
          {storeMode ? "Cancel" : "+ Store"}
        </button>
      </div>

      {/* Stats bar */}
      {statEntry && (
        <div className="flex gap-4 text-xs text-[var(--color-text-muted)]">
          <span>{statEntry.chunk_count} chunks</span>
          <span>{statEntry.embedding_dim}d embeddings</span>
        </div>
      )}

      {/* Search */}
      <div className="flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && search()}
          placeholder="Search memories semantically..."
          className="flex-1 rounded border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-accent)] focus:outline-none"
        />
        <input
          type="text"
          value={project}
          onChange={(e) => setProject(e.target.value)}
          placeholder="project"
          className="w-28 rounded border border-[var(--color-border)] bg-[var(--color-bg)] px-2 py-2 text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-accent)] focus:outline-none"
        />
        <button
          onClick={search}
          disabled={searching || !query.trim()}
          className="rounded bg-[var(--color-accent)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--color-accent-dim)] disabled:opacity-50"
        >
          {searching ? "..." : "Search"}
        </button>
      </div>

      {/* Store form */}
      {storeMode && (
        <div className="rounded-lg border border-[var(--color-accent)] bg-[var(--color-surface)] p-4">
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-[var(--color-accent)]">
            Store New Memory
          </h3>
          <div className="flex gap-2">
            <select
              value={storeType}
              onChange={(e) => setStoreType(e.target.value)}
              className="rounded border border-[var(--color-border)] bg-[var(--color-bg)] px-2 py-1 text-xs text-[var(--color-text)]"
            >
              <option value="lesson">lesson</option>
              <option value="pattern">pattern</option>
              <option value="decision">decision</option>
              <option value="preference">preference</option>
              <option value="context">context</option>
            </select>
            <input
              type="text"
              value={storeContent}
              onChange={(e) => setStoreContent(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && storeMemory()}
              placeholder="Memory content..."
              className="flex-1 rounded border border-[var(--color-border)] bg-[var(--color-bg)] px-2 py-1 text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:outline-none"
            />
            <button
              onClick={storeMemory}
              disabled={!storeContent.trim()}
              className="rounded bg-[var(--color-accent)] px-3 py-1 text-xs text-white disabled:opacity-50"
            >
              Store
            </button>
          </div>
          {storeStatus && (
            <div className="mt-2 text-xs text-[var(--color-text-dim)]">
              {storeStatus}
            </div>
          )}
        </div>
      )}

      {/* Results */}
      <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]">
        {results.length === 0 ? (
          <div className="p-6 text-center text-xs text-[var(--color-text-muted)]">
            {query ? "No results found" : "Enter a query to search vector memory"}
          </div>
        ) : (
          <div className="divide-y divide-[var(--color-border)]">
            {results.map((result, i) => (
              <div
                key={i}
                className="px-4 py-3 transition-colors hover:bg-[var(--color-surface-hover)]"
              >
                <div className="flex items-baseline justify-between gap-2">
                  <span
                    className="rounded px-1.5 py-0.5 text-[10px] font-medium"
                    style={{
                      backgroundColor: "rgba(99, 102, 241, 0.12)",
                      color: "var(--color-accent)",
                    }}
                  >
                    {result.type}
                  </span>
                  <span className="text-[10px] text-[var(--color-text-muted)]">
                    {(result.relevance * 100).toFixed(0)}% match
                  </span>
                </div>
                <p className="mt-1 text-sm text-[var(--color-text)]">
                  {result.content}
                </p>
                {result.project && (
                  <span className="mt-1 inline-block text-[10px] text-[var(--color-text-muted)]">
                    {result.project}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
