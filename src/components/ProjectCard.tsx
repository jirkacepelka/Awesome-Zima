import Link from "next/link";
import type { Project } from "@/lib/schema";
import { StatusLabel, TagList } from "./Badges";
import { ProjectIcon } from "./ProjectBits";

export function ProjectCard({ project, preview = false }: { project: Project; preview?: boolean }) {
  return (
    <article className="group relative flex h-full flex-col rounded-2xl border border-line bg-surface-strong p-6 transition-shadow duration-200 hover:shadow-card-hover">
      <div className="flex items-start justify-between gap-4">
        <ProjectIcon project={project} />
        <StatusLabel status={project.status} />
      </div>

      <h3 className="mt-5 text-lg font-semibold tracking-tight">
        <Link
          href={`/projects/${project.slug}`}
          prefetch={preview ? false : undefined}
          tabIndex={preview ? -1 : undefined}
          className="after:absolute after:inset-0 after:rounded-2xl after:content-[''] focus-visible:outline-none focus-visible:after:outline-2 focus-visible:after:outline-accent"
        >
          {project.name}
        </Link>
      </h3>
      <p className="mt-1.5 line-clamp-2 text-[15px] leading-relaxed text-fg-muted">{project.tagline}</p>

      <div className="flex-1" />
      <div className="mt-5 flex items-center justify-between gap-3 text-xs text-fg-subtle">
        <span>
          {project.category} · by {project.author.name}
        </span>
        <span className="font-medium text-accent opacity-0 transition-opacity group-hover:opacity-100">
          View →
        </span>
      </div>
    </article>
  );
}

export function ProjectRow({ project }: { project: Project }) {
  return (
    <article className="group relative flex items-center gap-4 px-5 py-4 transition-colors hover:bg-bg-alt">
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
          <StatusLabel status={project.status} />
        </div>
        <p className="truncate text-sm text-fg-muted">{project.tagline}</p>
      </div>
      <div className="hidden w-48 text-right md:block">
        <p className="text-sm text-fg-muted">{project.category}</p>
        <TagList tags={project.tags} limit={3} />
      </div>
      <span className="text-fg-subtle transition-colors group-hover:text-accent" aria-hidden="true">
        →
      </span>
    </article>
  );
}
