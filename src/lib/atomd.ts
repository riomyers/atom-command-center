const ATOMD_URL = process.env.ATOMD_URL || "http://localhost:7420";
const ATOMD_TOKEN = process.env.ATOMD_TOKEN || "";

export interface AtomdResponse<T = unknown> {
  ok: boolean;
  result?: T;
  error?: string;
}

export async function atomdCall<T = unknown>(
  module: string,
  command: string,
  args: Record<string, unknown> = {}
): Promise<AtomdResponse<T>> {
  const res = await fetch(`${ATOMD_URL}/api/v1/${module}/${command}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${ATOMD_TOKEN}`,
    },
    body: JSON.stringify(args),
    next: { revalidate: 0 },
  });

  if (!res.ok) {
    return { ok: false, error: `HTTP ${res.status}: ${res.statusText}` };
  }

  return res.json();
}

export async function atomdHealth(): Promise<{
  status: string;
  pid?: number;
}> {
  try {
    const res = await fetch(`${ATOMD_URL}/health`, {
      next: { revalidate: 0 },
    });
    if (!res.ok) return { status: "offline" };
    return res.json();
  } catch {
    return { status: "offline" };
  }
}

export function atomdStreamUrl(): string {
  return `${ATOMD_URL}/api/v1/brain/stream`;
}

export function atomdToken(): string {
  return ATOMD_TOKEN;
}

// Type definitions for atomd data

export interface DaemonStatus {
  status: string;
  pid: number;
  uptime_seconds: number;
  requests_served: number;
  modules: string[];
  brain_pending_events: number;
  active_alerts: number;
  activity?: {
    app: string;
    project: string;
    is_idle: boolean;
    idle_seconds: number;
  };
  http_api?: { enabled: boolean; port: number };
}

export interface BriefingPacket {
  infrastructure: {
    brain_daemon: string;
    memory_engine: string;
    activity_monitor: string;
    ollama_pool: string;
  };
  brain: {
    grade: string;
    success_rate: number;
    last_assessment?: {
      timestamp: string;
      grade: string;
      success_rate: number;
    };
    last_insights: Insight[];
  };
  memory: {
    projects: Record<
      string,
      { chunk_count: number; embedding_dim: number; last_indexed: string }
    >;
  };
  directives: {
    count: number;
    by_status: Record<string, number>;
  };
  alerts: {
    count: number;
    items: Alert[];
  };
  scratchpad?: {
    has_data: boolean;
    updated_at: string;
  };
}

export interface Alert {
  id: number;
  severity: "info" | "warning" | "critical";
  source: string;
  project: string;
  title: string;
  detail?: string;
  created_at: string;
}

export interface Observation {
  action: string;
  project: string;
  outcome: "success" | "failure" | "partial" | "skipped";
  detail?: string;
  error?: string;
  lesson?: string;
  timestamp: string;
  signal_level?: string;
  tags?: string;
}

export interface Insight {
  type: string;
  severity: string;
  message: string;
  project: string;
}

export interface Directive {
  id: string;
  pattern: string;
  pattern_analyzer: string;
  confidence: number;
  status: string;
  created: string;
  used_count: number;
  success_rate: number;
}

export interface OllamaStatus {
  hosts: { url: string; status: string; models: string[] }[];
  pool: string;
  health: string;
}
