import { Suspense } from "react";
import Link from "next/link";
import { Directory } from "@/components/Directory";
import { getProjects } from "@/lib/projects";
import { site } from "@/lib/site";

export default function Home() {
  const projects = getProjects();

  return (
    <>
      <section className="bg-bg-alt">
        <div className="mx-auto max-w-4xl px-4 pb-16 pt-20 text-center sm:px-6 sm:pb-20 sm:pt-28">
          <p className="text-sm font-medium text-accent">Community directory</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-fg sm:text-6xl">
            Projects built for ZimaOS
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-fg-muted sm:text-xl">
            An open list of apps, tools and guides made by ZimaOS users. Anyone can add a project or suggest a change.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="#projects" className="btn btn-primary h-11 px-6 text-[15px]">
              Browse projects
            </Link>
            <Link href="/submit" className="btn btn-secondary h-11 px-6 text-[15px]">
              Submit a project
            </Link>
          </div>
        </div>
      </section>

      <section id="projects" className="mx-auto max-w-6xl scroll-mt-16 px-4 pt-14 sm:px-6">
        <Suspense fallback={<div className="h-96 rounded-2xl bg-bg-alt" />}>
          <Directory projects={projects} />
        </Suspense>
      </section>

      <section className="mx-auto mt-24 max-w-6xl px-4 sm:px-6">
        <div className="rounded-3xl bg-invert px-6 py-12 text-invert-fg sm:px-12 sm:py-16">
          <div className="grid gap-10 md:grid-cols-[1.2fr_1fr] md:items-end">
            <div>
              <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Built something for ZimaOS?</h2>
              <p className="mt-4 max-w-lg leading-relaxed text-invert-fg/70">
                Fill in a short form and we open a pull request for you. Every project is a JSON file in a public
                GitHub repository, so all changes are reviewed and versioned.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 md:justify-end">
              <Link href="/submit" className="btn h-11 bg-accent px-6 text-[15px] text-white hover:bg-accent-hover">
                Submit a project
              </Link>
              <a
                href={site.repoUrl}
                target="_blank"
                rel="noreferrer"
                className="btn h-11 border border-white/25 px-6 text-[15px] text-white hover:bg-white/10"
              >
                View on GitHub
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
