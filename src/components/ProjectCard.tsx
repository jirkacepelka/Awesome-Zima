import Link from "next/link";
import { ArrowUpRight, ExternalLink } from "lucide-react";
import type { Project } from "@/lib/schema";
import { hostname } from "@/lib/site";
import { CategoryBadge, StatusPill, Tag } from "./Badges";
import { GitHubIcon } from "./icons";
import { ProjectIcon } from "./ProjectBits";

export function ProjectCard({ project, preview = false }: { project: Project; preview?: boolean }) {
  return (
    <article className="card group relative flex h-full flex-col rounded-[20px] p-5 transition duration-200 hover:-translate-y-0.5 hover:border-line-strong hover:shadow-card-hover">
      <div className="flex items-start gap-4">
        <ProjectIcon project={project} />
        <div className="min-w-0 flex-1">
          <h3 className="flex items-center gap-1 text-base font-semibold tracking-tight">
            <Link
              href={`/projects/${project.slug}`}
              prefetch={preview ? false : undefined}
              tabIndex={preview ? -1 : undefined}
              className="truncate after:absolute after:inset-0 after:rounded-[20px] after:content-[''] focus-visible:outline-none focus-visible:after:outline-2 focus-visible:after:outline-accent"
            >
              {project.name}
            </Link>
            <ArrowUpRight className="size-4 shrink-0 text-fg-subtle opacity-0 transition group-hover:opacity-100" aria-hidden="true" />
          </h3>
          <p className="mt-0.5 truncate text-xs text-fg-subtle">by {project.author.name}</p>
        </div>
        <CategoryBadge category={project.category} />
      </div>

      <p className="mt-4 line-clamp-2 text-sm leading-relaxed text-fg-muted">{project.tagline}</p>

      {project.tags.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {project.tags.slice(0, 4).map((t) => (
            <Tag key={t}>{t}</Tag>
          ))}
        </div>
      )}

      <div className="flex-1" />
      <div className="mt-5 flex items-center gap-3 border-t border-line pt-4">
        <StatusPill status={project.status} />
        <div className="relative z-10 ml-auto flex items-center gap-1">
          {project.repo && (
            <a
              href={project.repo}
              target="_blank"
              rel="noreferrer"
              className="grid size-8 place-items-center rounded-lg text-fg-muted transition hover:bg-surface-muted hover:text-fg"
              aria-label={`${project.name} source code`}
              title="Source code"
            >
              <GitHubIcon className="size-4" />
            </a>
          )}
          <a
            href={project.url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-8 items-center gap-1.5 rounded-lg px-2 text-xs font-medium text-fg-muted transition hover:bg-surface-muted hover:text-fg"
            title={project.url}
          >
            {hostname(project.url)}
            <ExternalLink className="size-3.5" />
          </a>
        </div>
      </div>
    </article>
  );
}

export function ProjectRow({ project }: { project: Project }) {
  return (
    <article className="group relative flex items-center gap-4 px-4 py-3.5 transition hover:bg-surface-muted/60 sm:px-5">
      <ProjectIcon project={project} size="sm" />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h3 className="truncate font-semibold tracking-tight">
            <Link
              href={`/projects/${project.slug}`}
              className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none focus-visible:after:outline-2 focus-visible:after:-outline-offset-2 focus-visible:after:outline-accent"
            >
              {project.name}
            </Link>
          </h3>
          <span className="hidden sm:inline-flex">
            <CategoryBadge category={project.category} />
          </span>
        </div>
        <p className="truncate text-sm text-fg-muted">{project.tagline}</p>
      </div>
      <div className="hidden w-24 md:block">
        <StatusPill status={project.status} />
      </div>
      <div className="relative z-10 flex items-center gap-1">
        {project.repo && (
          <a
            href={project.repo}
            target="_blank"
            rel="noreferrer"
            className="grid size-8 place-items-center rounded-lg text-fg-muted transition hover:bg-surface-strong hover:text-fg"
            aria-label={`${project.name} source code`}
          >
            <GitHubIcon className="size-4" />
          </a>
        )}
        <a
          href={project.url}
          target="_blank"
          rel="noreferrer"
          className="grid size-8 place-items-center rounded-lg text-fg-muted transition hover:bg-surface-strong hover:text-fg"
          aria-label={`${project.name} website`}
        >
          <ExternalLink className="size-4" />
        </a>
      </div>
    </article>
  );
}
