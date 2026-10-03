import { Suspense } from "react";
import Link from "next/link";
import { ArrowRight, Cloud, FileJson, Film, FolderOpen, GitPullRequest, HardDrive, Image as ImageIcon, Rocket, ShieldCheck } from "lucide-react";
import { ProjectIcon } from "@/components/ProjectBits";
import type { Project } from "@/lib/schema";
import { Directory } from "@/components/Directory";
import { getProjects } from "@/lib/projects";
import { GitHubIcon } from "@/components/icons";
import { site } from "@/lib/site";

export default function Home() {
  const projects = getProjects();
  const authors = new Set(projects.map((p) => p.author.name)).size;
  const categories = new Set(projects.map((p) => p.category)).size;

  return (
    <>
      <Hero projects={projects} stats={[
        { label: "Projects", value: projects.length },
        { label: "Makers", value: authors },
        { label: "Categories", value: categories },
      ]} />

      <section id="projects" className="mx-auto max-w-6xl scroll-mt-20 px-4 pt-14 sm:px-6">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-accent">Directory</p>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">Browse projects</h2>
          </div>
        </div>
        <Suspense fallback={<div className="h-96 animate-pulse rounded-[20px] bg-surface-muted" />}>
          <Directory projects={projects} />
        </Suspense>
      </section>

      <HowItWorks />
    </>
  );
}

function Hero({ projects, stats }: { projects: Project[]; stats: { label: string; value: number }[] }) {
  return (
    <section className="relative isolate overflow-hidden bg-gradient-to-br from-[var(--hero-from)] via-[var(--hero-via)] to-[var(--hero-to)] text-white">
      {/* Soft light blobs evoke the blurred ZimaOS desktop wallpaper. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="animate-float absolute -left-24 -top-24 size-[28rem] rounded-full bg-[#3b86ff] opacity-40 blur-3xl" />
        <div className="animate-float absolute -bottom-40 right-[-6rem] size-[32rem] rounded-full bg-[#22d3ee] opacity-25 blur-3xl [animation-delay:-6s]" />
        <div className="absolute left-1/2 top-1/3 size-72 -translate-x-1/2 rounded-full bg-[#8b5cf6] opacity-20 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:22px_22px] [mask-image:linear-gradient(to_bottom,black,transparent)]" />
      </div>

      <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 pb-20 pt-16 sm:px-6 sm:pb-24 sm:pt-24 lg:grid-cols-[1fr_400px]">
        <div>
        <div className="max-w-3xl animate-rise">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-medium text-white/85 backdrop-blur">
            <span className="size-1.5 rounded-full bg-[#4ade80]" />
            Community-curated · Open source
          </span>
          <h1 className="mt-5 text-4xl font-semibold leading-[1.08] tracking-tight sm:text-6xl">
            The best things built
            <br className="hidden sm:block" /> for{" "}
            <span className="bg-gradient-to-r from-white via-[#bcd6ff] to-[#7dd3fc] bg-clip-text text-transparent">ZimaOS</span>.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-white/75 sm:text-lg">
            Apps, tools, guides and integrations made by the community for your personal cloud. Discover
            something new, or share what you built.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="#projects" className="btn h-11 bg-white px-5 text-[#0b1a3a] shadow-lg shadow-black/10 hover:bg-white/90">
              Explore projects <ArrowRight className="size-4" />
            </Link>
            <Link href="/submit" className="btn h-11 border border-white/20 bg-white/10 px-5 text-white backdrop-blur hover:bg-white/20">
              Submit yours
            </Link>
          </div>
        </div>

        <dl className="mt-14 grid max-w-lg grid-cols-3 overflow-hidden rounded-2xl border border-white/15 bg-white/10 backdrop-blur-xl">
          {stats.map((s, i) => (
            <div key={s.label} className={`px-5 py-4 ${i > 0 ? "border-l border-white/10" : ""}`}>
              <dt className="text-xs font-medium text-white/65">{s.label}</dt>
              <dd className="mt-1 text-2xl font-semibold tabular-nums">{s.value}</dd>
            </div>
          ))}
        </dl>
        </div>
        <DashboardPreview projects={projects} />
      </div>
    </section>
  );
}

const SYSTEM_APPS = [
  { name: "Files", icon: FolderOpen, color: "from-[#60a5fa] to-[#2563eb]" },
  { name: "Photos", icon: ImageIcon, color: "from-[#f472b6] to-[#db2777]" },
  { name: "Media", icon: Film, color: "from-[#a78bfa] to-[#7c3aed]" },
  { name: "Backup", icon: ShieldCheck, color: "from-[#34d399] to-[#059669]" },
  { name: "Sync", icon: Cloud, color: "from-[#38bdf8] to-[#0284c7]" },
];

/** A stylised personal-cloud dashboard: community apps sit next to everyday ones. */
function DashboardPreview({ projects }: { projects: Project[] }) {
  const featured = projects.slice(0, 3);
  return (
    <div aria-hidden="true" className="relative hidden lg:block">
      <div className="absolute -inset-6 -z-10 rounded-[40px] bg-[#3b86ff] opacity-20 blur-3xl" />
      <div className="relative rounded-[28px] border border-white/15 bg-white/10 p-5 shadow-2xl shadow-black/30 backdrop-blur-2xl">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-white/60">Dashboard</p>
            <p className="text-lg font-semibold">My personal cloud</p>
          </div>
          <span className="rounded-full bg-white/10 px-2.5 py-1 font-mono text-[11px] text-white/70">zima.local</span>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-white/10 p-3.5">
            <div className="flex items-center gap-2 text-xs text-white/70">
              <HardDrive className="size-3.5" /> Storage
            </div>
            <p className="mt-2 text-xl font-semibold tabular-nums">
              3.2 <span className="text-sm font-medium text-white/60">/ 8 TB</span>
            </p>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/15">
              <div className="h-full w-2/5 rounded-full bg-gradient-to-r from-[#7dd3fc] to-white" />
            </div>
          </div>
          <div className="rounded-2xl bg-white/10 p-3.5">
            <p className="text-xs text-white/70">CPU · RAM</p>
            <div className="mt-2 flex h-9 items-end gap-1">
              {[40, 65, 30, 80, 55, 45, 70, 35, 60, 50].map((h, i) => (
                <span key={i} className="flex-1 rounded-sm bg-white/50" style={{ height: `${h}%` }} />
              ))}
            </div>
          </div>
        </div>

        <p className="mt-5 text-xs font-medium uppercase tracking-wider text-white/55">Apps</p>
        <div className="mt-3 grid grid-cols-4 gap-x-3 gap-y-4">
          {featured.map((p) => (
            <div key={p.slug} className="flex flex-col items-center gap-1.5">
              <ProjectIcon project={p} />
              <span className="w-full truncate text-center text-[11px] text-white/85">{p.name}</span>
            </div>
          ))}
          {SYSTEM_APPS.slice(0, 8 - featured.length - 1).map((a) => (
            <div key={a.name} className="flex flex-col items-center gap-1.5">
              <span className={`grid size-12 place-items-center rounded-[14px] bg-gradient-to-br text-white shadow-sm ${a.color}`}>
                <a.icon className="size-6" />
              </span>
              <span className="text-[11px] text-white/85">{a.name}</span>
            </div>
          ))}
          <div className="flex flex-col items-center gap-1.5">
            <span className="grid size-12 place-items-center rounded-[14px] border-2 border-dashed border-white/30 text-xl text-white/60">+</span>
            <span className="text-[11px] text-white/60">Yours?</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function HowItWorks() {
  const steps = [
    {
      icon: FileJson,
      title: "Fill in a short form",
      text: "Submit a new project, suggest an edit or request a removal right here, no GitHub account needed.",
    },
    {
      icon: GitPullRequest,
      title: "A pull request opens",
      text: "Every change becomes a reviewable pull request against a JSON file in the public repository.",
    },
    {
      icon: Rocket,
      title: "Merged and live",
      text: "Once a maintainer merges it, the site rebuilds automatically and the change is live in a minute.",
    },
  ];
  return (
    <section className="mx-auto mt-24 max-w-6xl px-4 sm:px-6">
      <div className="card relative overflow-hidden rounded-[28px] p-6 sm:p-10">
        <div aria-hidden="true" className="pointer-events-none absolute -right-24 -top-24 size-72 rounded-full bg-accent opacity-10 blur-3xl" />
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div className="max-w-xl">
            <p className="text-sm font-semibold text-accent">How it works</p>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">Open by design, stored in git</h2>
            <p className="mt-3 text-fg-muted">
              Every project is a plain JSON file on GitHub. Anyone can propose changes, and everything is transparent and versioned.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <a href={site.repoUrl} target="_blank" rel="noreferrer" className="btn btn-secondary">
              <GitHubIcon className="size-4" /> View repository
            </a>
            <Link href="/submit" className="btn btn-primary">
              Submit a project
            </Link>
          </div>
        </div>
        <ol className="mt-10 grid gap-4 md:grid-cols-3">
          {steps.map((s, i) => (
            <li key={s.title} className="rounded-2xl border border-line bg-surface-muted/60 p-5">
              <div className="flex items-center gap-3">
                <span className="grid size-10 place-items-center rounded-xl bg-accent text-accent-fg shadow-sm">
                  <s.icon className="size-5" />
                </span>
                <span className="font-mono text-xs text-fg-subtle">0{i + 1}</span>
              </div>
              <h3 className="mt-4 font-semibold">{s.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-fg-muted">{s.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
