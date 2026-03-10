"use client";

interface StatusCardProps {
  label: string;
  value: string;
  color?: string;
  detail?: string;
  pulse?: boolean;
}

export function StatusCard({
  label,
  value,
  color,
  detail,
  pulse,
}: StatusCardProps) {
  return (
    <div className="flex flex-col gap-1 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4 transition-colors hover:border-[var(--color-border-bright)]">
      <span className="text-xs uppercase tracking-wider text-[var(--color-text-muted)]">
        {label}
      </span>
      <div className="flex items-center gap-2">
        {pulse && (
          <span
            className="inline-block h-2 w-2 animate-pulse rounded-full"
            style={{ backgroundColor: color || "var(--color-accent)" }}
          />
        )}
        <span
          className="text-2xl font-bold"
          style={{ color: color || "var(--color-text)" }}
        >
          {value}
        </span>
      </div>
      {detail && (
        <span className="text-xs text-[var(--color-text-dim)]">{detail}</span>
      )}
    </div>
  );
}
