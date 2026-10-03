import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProject, getProjects } from "@/lib/projects";
import { StatusLabel } from "@/components/Badges";
import { ProjectIcon } from "@/components/ProjectBits";
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
  new Date(`${d}T00:00:00Z`).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" });

export default async function ProjectPage({ params }: PageProps<"/projects/[slug]">) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();

  const details: [string, React.ReactNode][] = [
    ["Category", project.category],
    [
      "Author",
      project.author.url ? (
        <a href={project.author.url} className="text-accent hover:underline">
          {project.author.name}
        </a>
      ) : (
        project.author.name
      ),
    ],
  ];
  if (project.license) details.push(["License", project.license]);
  if (project.zimaosVersion) details.push(["ZimaOS", project.zimaosVersion]);
  details.push(["Added", formatDate(project.addedAt)]);
  if (project.updatedAt !== project.addedAt) details.push(["Updated", formatDate(project.updatedAt)]);

  const links: [string, string][] = [["Website", project.url]];
  if (project.repo && project.repo !== project.url) links.push(["Source code", project.repo]);
  if (project.docs) links.push(["Documentation", project.docs]);

  return (
    <>
      <section className="bg-bg-alt">
        <div className="mx-auto max-w-6xl px-4 pb-12 pt-8 sm:px-6 sm:pb-16">
          <Link href="/#projects" className="text-sm text-fg-muted hover:text-fg">
            ← All projects
          </Link>
          <div className="mt-8 flex flex-col gap-6 sm:flex-row sm:items-center">
            <ProjectIcon project={project} size="lg" />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-3xl font-semibold tracking-tight sm:text-5xl">{project.name}</h1>
                <StatusLabel status={project.status} />
              </div>
              <p className="mt-3 max-w-2xl text-lg text-fg-muted sm:text-xl">{project.tagline}</p>
            </div>
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href={project.url} target="_blank" rel="noreferrer" className="btn btn-primary h-11 px-6 text-[15px]">
              Visit {hostname(project.url)}
            </a>
            {project.repo && project.repo !== project.url && (
              <a href={project.repo} target="_blank" rel="noreferrer" className="btn btn-secondary h-11 px-6 text-[15px]">
                Source code
              </a>
            )}
          </div>
        </div>
      </section>

      <div className="mx-auto grid max-w-6xl gap-12 px-4 pt-12 sm:px-6 lg:grid-cols-[1fr_300px]">
        <div className="min-w-0">
          <h2 className="text-xl font-semibold tracking-tight">About</h2>
          <div className="mt-4 max-w-3xl space-y-4 text-[17px] leading-relaxed text-fg/85">
            {project.description.split(/\n{2,}/).map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>
          {project.tags.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-2">
              {project.tags.map((t) => (
                <Link
                  key={t}
                  href={`/?q=${encodeURIComponent(t)}#projects`}
                  className="rounded-full bg-bg-alt px-3 py-1 text-sm text-fg-muted hover:text-fg"
                >
                  {t}
                </Link>
              ))}
            </div>
          )}

          {project.screenshots && project.screenshots.length > 0 && (
            <div className="mt-12 space-y-4">
              {project.screenshots.map((src) => (
                <a key={src} href={src} target="_blank" rel="noreferrer" className="block overflow-hidden rounded-2xl border border-line">
                  {/* eslint-disable-next-line @next/next/no-img-element -- arbitrary remote screenshots */}
                  <img src={src} alt={`${project.name} screenshot`} loading="lazy" className="w-full" />
                </a>
              ))}
            </div>
          )}
        </div>

        <aside className="space-y-10 text-sm">
          <dl className="divide-y divide-line border-y border-line">
            {details.map(([label, value]) => (
              <div key={label} className="flex justify-between gap-4 py-3">
                <dt className="text-fg-muted">{label}</dt>
                <dd className="truncate text-right">{value}</dd>
              </div>
            ))}
          </dl>

          <div>
            <h2 className="font-medium">Links</h2>
            <ul className="mt-3 space-y-2">
              {links.map(([label, href]) => (
                <li key={label}>
                  <a href={href} target="_blank" rel="noreferrer" className="text-accent hover:underline">
                    {label} ↗
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="font-medium">Something out of date?</h2>
            <p className="mt-1 text-fg-muted">Changes are reviewed as pull requests before they go live.</p>
            <ul className="mt-3 space-y-2">
              <li>
                <Link href={`/submit?edit=${project.slug}`} className="text-accent hover:underline">
                  Suggest an edit
                </Link>
              </li>
              <li>
                <Link href={`/submit?remove=${project.slug}`} className="text-fg-muted hover:text-danger">
                  Request removal
                </Link>
              </li>
              <li>
                <a href={githubEditFileUrl(project.slug)} className="text-fg-muted hover:text-fg">
                  Edit the JSON on GitHub
                </a>
              </li>
            </ul>
          </div>
        </aside>
      </div>
    </>
  );
}
