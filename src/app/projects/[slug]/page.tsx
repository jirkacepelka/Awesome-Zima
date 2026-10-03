import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, BookOpen, Calendar, ExternalLink, Pencil, Scale, Server, Trash2, User } from "lucide-react";
import { getProject, getProjects } from "@/lib/projects";
import { CategoryBadge, StatusPill, Tag } from "@/components/Badges";
import { ProjectIcon } from "@/components/ProjectBits";
import { GitHubIcon } from "@/components/icons";
import { githubEditFileUrl, hostname } from "@/lib/site";

export const dynamicParams = false;

export function generateStaticParams() {
  return getProjects().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/projects/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) return {};
  return { title: project.name, description: project.tagline };
}

const formatDate = (d: string) =>
  new Date(`${d}T00:00:00Z`).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric", timeZone: "UTC" });

export default async function ProjectPage({ params }: PageProps<"/projects/[slug]">) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();

  const meta = [
    { icon: User, label: "Author", value: project.author.url ? <a href={project.author.url} className="hover:text-accent">{project.author.name}</a> : project.author.name },
    project.license && { icon: Scale, label: "License", value: project.license },
    project.zimaosVersion && { icon: Server, label: "ZimaOS", value: project.zimaosVersion },
    { icon: Calendar, label: "Added", value: formatDate(project.addedAt) },
    { icon: Calendar, label: "Updated", value: formatDate(project.updatedAt) },
  ].filter(Boolean) as { icon: typeof User; label: string; value: React.ReactNode }[];

  return (
    <div className="relative">
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-72 bg-gradient-to-b from-accent-soft to-transparent" />
      <div className="mx-auto max-w-6xl px-4 pt-8 sm:px-6 sm:pt-10">
        <Link href="/#projects" className="inline-flex items-center gap-1.5 text-sm font-medium text-fg-muted hover:text-fg">
          <ArrowLeft className="size-4" /> All projects
        </Link>

        <header className="mt-6 flex flex-col gap-6 sm:flex-row sm:items-center">
          <ProjectIcon project={project} size="lg" />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{project.name}</h1>
              <CategoryBadge category={project.category} />
              <StatusPill status={project.status} />
            </div>
            <p className="mt-2 text-lg text-fg-muted">{project.tagline}</p>
          </div>
        </header>

        <div className="mt-6 flex flex-wrap gap-2">
          <a href={project.url} target="_blank" rel="noreferrer" className="btn btn-primary">
            Visit {hostname(project.url)} <ExternalLink className="size-4" />
          </a>
          {project.repo && project.repo !== project.url && (
            <a href={project.repo} target="_blank" rel="noreferrer" className="btn btn-secondary">
              <GitHubIcon className="size-4" /> Source code
            </a>
          )}
          {project.docs && (
            <a href={project.docs} target="_blank" rel="noreferrer" className="btn btn-secondary">
              <BookOpen className="size-4" /> Documentation
            </a>
          )}
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_320px]">
          <div className="min-w-0 space-y-8">
            <section className="card rounded-[20px] p-6 sm:p-8">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-fg-subtle">About</h2>
              <div className="mt-4 space-y-4 leading-relaxed text-fg/90">
                {project.description.split(/\n{2,}/).map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
              </div>
              {project.tags.length > 0 && (
                <div className="mt-6 flex flex-wrap gap-1.5">
                  {project.tags.map((t) => (
                    <Link key={t} href={`/?q=${encodeURIComponent(t)}#projects`} className="hover:opacity-80">
                      <Tag>{t}</Tag>
                    </Link>
                  ))}
                </div>
              )}
            </section>

            {project.screenshots && project.screenshots.length > 0 && (
              <section>
                <h2 className="text-sm font-semibold uppercase tracking-wider text-fg-subtle">Screenshots</h2>
                <div className="mt-4 grid gap-4">
                  {project.screenshots.map((src) => (
                    <a key={src} href={src} target="_blank" rel="noreferrer" className="card block overflow-hidden rounded-[20px]">
                      {/* eslint-disable-next-line @next/next/no-img-element -- arbitrary remote screenshots */}
                      <img src={src} alt={`${project.name} screenshot`} loading="lazy" className="w-full" />
                    </a>
                  ))}
                </div>
              </section>
            )}
          </div>

          <aside className="space-y-4">
            <section className="card rounded-[20px] p-5">
              <h2 className="text-sm font-semibold">Details</h2>
              <dl className="mt-4 space-y-3 text-sm">
                {meta.map((m) => (
                  <div key={m.label} className="flex items-center gap-3">
                    <m.icon className="size-4 shrink-0 text-fg-subtle" />
                    <dt className="w-20 shrink-0 text-fg-muted">{m.label}</dt>
                    <dd className="min-w-0 truncate font-medium">{m.value}</dd>
                  </div>
                ))}
              </dl>
            </section>

            <section className="card rounded-[20px] p-5">
              <h2 className="text-sm font-semibold">Something out of date?</h2>
              <p className="mt-1 text-sm text-fg-muted">Changes are reviewed as pull requests before going live.</p>
              <div className="mt-4 grid gap-2">
                <Link href={`/submit?edit=${project.slug}`} className="btn btn-secondary justify-start">
                  <Pencil className="size-4" /> Suggest an edit
                </Link>
                <Link href={`/submit?remove=${project.slug}`} className="btn btn-ghost justify-start text-danger hover:text-danger">
                  <Trash2 className="size-4" /> Request removal
                </Link>
              </div>
              <a href={githubEditFileUrl(project.slug)} className="mt-3 block text-xs text-fg-subtle hover:text-fg">
                Or edit <code className="font-mono">projects/{project.slug}.json</code> on GitHub →
              </a>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
}
