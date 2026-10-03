"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { LayoutGrid, List, Plus, Search, SearchX, X } from "lucide-react";
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
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
        <label className="relative flex-1">
          <span className="sr-only">Search projects</span>
          <Search className="pointer-events-none absolute left-3.5 top-1/2 size-[18px] -translate-y-1/2 text-fg-subtle" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, tag or author…"
            className="input h-12 pl-11 pr-10 shadow-card"
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
              className="input h-12 w-auto cursor-pointer appearance-none pr-9 text-sm font-medium shadow-card"
            >
              <option value="newest">Newest</option>
              <option value="updated">Recently updated</option>
              <option value="name">Name (A–Z)</option>
            </select>
            <svg className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-fg-subtle" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="m4 6 4 4 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </label>
          <div className="card flex h-12 items-center gap-1 rounded-xl p-1" role="group" aria-label="Layout">
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
                className={`grid size-10 place-items-center rounded-lg transition ${
                  view === v ? "bg-accent text-accent-fg shadow-sm" : "text-fg-muted hover:bg-surface-muted hover:text-fg"
                }`}
              >
                <Icon className="size-[18px]" />
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="-mx-4 mt-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0" role="group" aria-label="Filter by category">
        {["All", ...usedCategories].map((c) => {
          const active = category === c;
          const count = c === "All" ? projects.length : counts.get(c);
          return (
            <button
              key={c}
              type="button"
              onClick={() => setCategory(c)}
              aria-pressed={active}
              className={`inline-flex h-9 shrink-0 items-center gap-2 rounded-full border px-3.5 text-sm font-medium transition ${
                active
                  ? "border-transparent bg-fg text-bg"
                  : "border-line-strong bg-surface-strong text-fg-muted hover:border-fg-subtle hover:text-fg"
              }`}
            >
              {c}
              <span className={`text-xs tabular-nums ${active ? "opacity-70" : "text-fg-subtle"}`}>{count}</span>
            </button>
          );
        })}
      </div>

      <p className="mt-6 text-sm text-fg-subtle" aria-live="polite">
        {filtered.length === projects.length
          ? `${projects.length} ${projects.length === 1 ? "project" : "projects"}`
          : `${filtered.length} of ${projects.length} projects`}
      </p>

      {filtered.length === 0 ? (
        <div className="card mt-3 flex flex-col items-center rounded-[20px] px-6 py-16 text-center">
          <span className="grid size-12 place-items-center rounded-2xl bg-accent-soft text-accent">
            <SearchX className="size-6" />
          </span>
          <h3 className="mt-4 font-semibold">No projects match your filters</h3>
          <p className="mt-1 max-w-sm text-sm text-fg-muted">
            Try a different search, or add the project you were looking for.
          </p>
          <div className="mt-5 flex gap-2">
            <button type="button" onClick={reset} className="btn btn-secondary">
              Clear filters
            </button>
            <Link href="/submit" className="btn btn-primary">
              <Plus className="size-4" /> Submit project
            </Link>
          </div>
        </div>
      ) : view === "grid" ? (
        <ul className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p, i) => (
            <li key={p.slug} className="animate-rise" style={{ animationDelay: `${Math.min(i, 8) * 40}ms` }}>
              <ProjectCard project={p} />
            </li>
          ))}
          <li>
            <Link
              href="/submit"
              className="group flex h-full min-h-48 flex-col items-center justify-center rounded-[20px] border-2 border-dashed border-line-strong p-5 text-center text-fg-muted transition hover:border-accent hover:bg-accent-soft hover:text-accent"
            >
              <span className="grid size-11 place-items-center rounded-full bg-surface-muted transition group-hover:bg-accent group-hover:text-accent-fg">
                <Plus className="size-5" />
              </span>
              <span className="mt-3 text-sm font-semibold">Built something for ZimaOS?</span>
              <span className="mt-0.5 text-xs">Add it to the directory</span>
            </Link>
          </li>
        </ul>
      ) : (
        <ul className="card mt-3 divide-y divide-line overflow-hidden rounded-[20px]">
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
