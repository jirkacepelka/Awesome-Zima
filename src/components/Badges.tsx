import type { Project } from "@/lib/schema";

export function CategoryBadge({ category }: { category: Project["category"] }) {
  return (
    <span className="inline-flex items-center rounded-full bg-accent-soft px-2.5 py-0.5 text-xs font-semibold text-accent">
      {category}
    </span>
  );
}

const STATUS_STYLE: Record<Project["status"], { label: string; dot: string }> = {
  active: { label: "Active", dot: "bg-success" },
  beta: { label: "Beta", dot: "bg-warning" },
  archived: { label: "Archived", dot: "bg-fg-subtle" },
};

export function StatusPill({ status }: { status: Project["status"] }) {
  const s = STATUS_STYLE[status];
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-fg-muted">
      <span className={`size-1.5 rounded-full ${s.dot}`} aria-hidden="true" />
      {s.label}
    </span>
  );
}

export function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-md border border-line bg-surface-muted px-1.5 py-0.5 font-mono text-[11px] text-fg-muted">
      #{children}
    </span>
  );
}
