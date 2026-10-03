import type { Metadata } from "next";
import { Suspense } from "react";
import { getProjects } from "@/lib/projects";
import { SubmitForm } from "@/components/SubmitForm";

export const metadata: Metadata = {
  title: "Submit a project",
  description: "Add a ZimaOS project to Awesome Zima, suggest an edit or request a removal.",
};

export default function SubmitPage() {
  const projects = getProjects();
  return (
    <div className="relative">
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-80 bg-gradient-to-b from-accent-soft to-transparent" />
      <div className="mx-auto max-w-6xl px-4 pt-10 sm:px-6 sm:pt-14">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold text-accent">Contribute</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight sm:text-4xl">Share a project with the community</h1>
          <p className="mt-3 text-fg-muted">
            Your submission becomes a pull request on GitHub. A maintainer reviews it, and once merged it appears on the
            site automatically. No account needed.
          </p>
        </div>
        <Suspense fallback={<div className="mt-10 h-[40rem] animate-pulse rounded-[20px] bg-surface-muted" />}>
          <SubmitForm projects={projects} />
        </Suspense>
      </div>
    </div>
  );
}
