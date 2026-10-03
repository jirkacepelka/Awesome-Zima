import type { Project } from "@/lib/schema";

/** Only non-default states are worth a label; "active" stays quiet. */
export function StatusLabel({ status }: { status: Project["status"] }) {
  if (status === "active") return null;
  const style =
    status === "beta" ? "bg-warning/12 text-warning" : "bg-surface-muted text-fg-muted";
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${style}`}>
      {status === "beta" ? "Beta" : "Archived"}
    </span>
  );
}

export function TagList({ tags, limit }: { tags: string[]; limit?: number }) {
  const shown = limit ? tags.slice(0, limit) : tags;
  if (shown.length === 0) return null;
  return <p className="text-xs text-fg-subtle">{shown.join(" · ")}</p>;
}
