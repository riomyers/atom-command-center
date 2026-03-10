"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export function useAtomd<T>(
  module: string,
  command: string,
  args: Record<string, unknown> = {},
  intervalMs = 0
) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const argsRef = useRef(JSON.stringify(args));
  argsRef.current = JSON.stringify(args);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch(`/api/atomd/${module}/${command}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: argsRef.current,
      });
      const json = await res.json();
      if (json.ok) {
        setData(json.result);
        setError(null);
      } else {
        setError(json.error || "Unknown error");
      }
    } catch (e) {
      setError(`${e}`);
    } finally {
      setLoading(false);
    }
  }, [module, command]);

  useEffect(() => {
    fetchData();
    if (intervalMs > 0) {
      const id = setInterval(fetchData, intervalMs);
      return () => clearInterval(id);
    }
  }, [fetchData, intervalMs]);

  return { data, error, loading, refetch: fetchData };
}

export function useBrainStream() {
  const [phases, setPhases] = useState<
    { phase: string; status: "running" | "complete" | "error" }[]
  >([]);
  const [cycleActive, setCycleActive] = useState(false);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    let es: EventSource | null = null;
    let retryTimeout: NodeJS.Timeout;

    function connect() {
      es = new EventSource("/api/stream");

      es.addEventListener("connected", () => setConnected(true));

      es.addEventListener("cycle_start", () => {
        setCycleActive(true);
        setPhases([]);
      });

      es.addEventListener("phase_start", (e) => {
        const { phase } = JSON.parse(e.data);
        setPhases((prev) => [...prev, { phase, status: "running" }]);
      });

      es.addEventListener("phase_complete", (e) => {
        const { phase } = JSON.parse(e.data);
        setPhases((prev) =>
          prev.map((p) => (p.phase === phase ? { ...p, status: "complete" } : p))
        );
      });

      es.addEventListener("phase_error", (e) => {
        const { phase } = JSON.parse(e.data);
        setPhases((prev) =>
          prev.map((p) => (p.phase === phase ? { ...p, status: "error" } : p))
        );
      });

      es.addEventListener("cycle_complete", () => setCycleActive(false));

      es.onerror = () => {
        setConnected(false);
        es?.close();
        retryTimeout = setTimeout(connect, 5000);
      };
    }

    connect();

    const handleVisibility = () => {
      if (document.visibilityState === "visible" && !connected) {
        es?.close();
        connect();
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      es?.close();
      clearTimeout(retryTimeout);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [connected]);

  return { phases, cycleActive, connected };
}
