export function timeAgo(timestamp: string): string {
  const now = Date.now();
  const then = new Date(timestamp).getTime();
  const diff = Math.floor((now - then) / 1000);

  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return `${h}h ${m}m`;
}

export function gradeColor(grade: string): string {
  const colors: Record<string, string> = {
    S: "var(--color-grade-s)",
    A: "var(--color-grade-a)",
    B: "var(--color-grade-b)",
    C: "var(--color-grade-c)",
    D: "var(--color-grade-d)",
  };
  return colors[grade] || "var(--color-text-dim)";
}

export function severityColor(severity: string): string {
  const colors: Record<string, string> = {
    critical: "var(--color-error)",
    warning: "var(--color-warning)",
    info: "var(--color-info)",
  };
  return colors[severity] || "var(--color-text-dim)";
}

export function outcomeIcon(outcome: string): string {
  const icons: Record<string, string> = {
    success: "✓",
    failure: "✗",
    partial: "◐",
    skipped: "○",
  };
  return icons[outcome] || "?";
}

export function outcomeColor(outcome: string): string {
  const colors: Record<string, string> = {
    success: "var(--color-success)",
    failure: "var(--color-error)",
    partial: "var(--color-warning)",
    skipped: "var(--color-text-dim)",
  };
  return colors[outcome] || "var(--color-text-dim)";
}

export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}
