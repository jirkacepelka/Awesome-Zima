"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { LayoutGrid, List, Search, X } from "lucide-react";
import { CATEGORIES, type Project } from "@/lib/schema";
import { ProjectCard, ProjectRow } from "./ProjectCard";

type View = "grid" | "list";
type Sort = "newest" | "name" | "updated";

export function Directory({ projects }: { projects: Project[] }) {
  const params = useSearchParams();
  const [query, setQuery] = useState(params.get("q") ?? "");
  const [category, setCategory] = useState(params.get("category") ?? "All");
  const [sort, setSort] = useState<Sort>((params.get("sort") as Sort) || "newest");
  const [view, setView] = useState<View>("grid");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("view");
      // eslint-disable-next-line react-hooks/set-state-in-effect -- restore per-visitor preference after hydration
      if (saved === "grid" || saved === "list") setView(saved);
    } catch {}
  }, []);

  // Mirror filters into the URL so a filtered view can be shared.
  useEffect(() => {
    const next = new URLSearchParams();
    if (query) next.set("q", query);
    if (category !== "All") next.set("category", category);
    if (sort !== "newest") next.set("sort", sort);
    const qs = next.toString();
    window.history.replaceState(null, "", `${window.location.pathname}${qs ? `?${qs}` : ""}${window.location.hash}`);
  }, [query, category, sort]);

  function changeView(v: View) {
    setView(v);
    try {
      localStorage.setItem("view", v);
    } catch {}
  }

  const counts = useMemo(() => {
    const map = new Map<string, number>();
    for (const p of projects) map.set(p.category, (map.get(p.category) ?? 0) + 1);
    return map;
  }, [projects]);

  const usedCategories = CATEGORIES.filter((c) => counts.has(c));

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = projects.filter((p) => {
      if (category !== "All" && p.category !== category) return false;
      if (!q) return true;
      return [p.name, p.tagline, p.description, p.author.name, p.category, ...p.tags].some((f) =>
        f.toLowerCase().includes(q),
      );
    });
    return list.sort((a, b) => {
      if (sort === "name") return a.name.localeCompare(b.name);
      if (sort === "updated") return b.updatedAt.localeCompare(a.updatedAt);
      return b.addedAt.localeCompare(a.addedAt);
    });
  }, [projects, query, category, sort]);

  const reset = () => {
    setQuery("");
    setCategory("All");
  };

  return (
    <div>
      <div className="mb-8 flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
        <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">All projects</h2>
        <p className="text-sm text-fg-muted" aria-live="polite">
          {filtered.length === projects.length
            ? `${projects.length} ${projects.length === 1 ? "project" : "projects"}`
            : `${filtered.length} of ${projects.length} projects`}
        </p>
      </div>
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <label className="relative flex-1">
          <span className="sr-only">Search projects</span>
          <Search className="pointer-events-none absolute left-3.5 top-1/2 size-[18px] -translate-y-1/2 text-fg-subtle" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, tag or author…"
            className="input h-11 rounded-full bg-bg-alt pl-11 pr-10 border-transparent"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="absolute right-2.5 top-1/2 grid size-7 -translate-y-1/2 place-items-center rounded-md text-fg-subtle hover:bg-surface-muted hover:text-fg"
              aria-label="Clear search"
            >
              <X className="size-4" />
            </button>
          )}
        </label>
        <div className="flex items-center gap-2">
          <label className="relative">
            <span className="sr-only">Sort by</span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as Sort)}
              className="input h-11 w-auto cursor-pointer appearance-none rounded-full border-transparent bg-bg-alt pl-4 pr-9 text-sm"
            >
              <option value="newest">Newest</option>
              <option value="updated">Recently updated</option>
              <option value="name">Name (A–Z)</option>
            </select>
            <svg className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-fg-subtle" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="m4 6 4 4 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </label>
          <div className="flex h-11 items-center gap-0.5 rounded-full bg-bg-alt p-1" role="group" aria-label="Layout">
            {(
              [
                ["grid", LayoutGrid, "Grid view"],
                ["list", List, "List view"],
              ] as const
            ).map(([v, Icon, label]) => (
              <button
                key={v}
                type="button"
                onClick={() => changeView(v)}
                aria-pressed={view === v}
                aria-label={label}
                title={label}
                className={`grid size-9 place-items-center rounded-full transition ${
                  view === v ? "bg-surface-strong text-fg shadow-sm" : "text-fg-muted hover:text-fg"
                }`}
              >
                <Icon className="size-4" />
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="-mx-4 mt-4 flex gap-1 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0" role="group" aria-label="Filter by category">
        {["All", ...usedCategories].map((c) => {
          const active = category === c;
          const count = c === "All" ? projects.length : counts.get(c);
          return (
            <button
              key={c}
              type="button"
              onClick={() => setCategory(c)}
              aria-pressed={active}
              className={`inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full px-3.5 text-sm transition ${
                active ? "bg-fg text-bg" : "text-fg-muted hover:bg-bg-alt hover:text-fg"
              }`}
            >
              {c}
              <span className={`text-xs tabular-nums ${active ? "opacity-60" : "text-fg-subtle"}`}>{count}</span>
            </button>
          );
        })}
      </div>


      {filtered.length === 0 ? (
        <div className="mt-6 rounded-2xl bg-bg-alt px-6 py-16 text-center">
          <h3 className="font-semibold">No projects match your search</h3>
          <p className="mx-auto mt-1 max-w-sm text-sm text-fg-muted">
            Try another term, or <Link href="/submit" className="text-accent hover:underline">submit the project</Link> you were looking for.
          </p>
          <button type="button" onClick={reset} className="btn btn-secondary mt-5">
            Clear filters
          </button>
        </div>
      ) : view === "grid" ? (
        <ul className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => (
            <li key={p.slug}>
              <ProjectCard project={p} />
            </li>
          ))}

        </ul>
      ) : (
        <ul className="mt-6 divide-y divide-line overflow-hidden rounded-2xl border border-line">
          {filtered.map((p) => (
            <li key={p.slug}>
              <ProjectRow project={p} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
