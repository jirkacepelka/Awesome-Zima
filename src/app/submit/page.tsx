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
    <>
      <section className="bg-bg-alt">
        <div className="mx-auto max-w-6xl px-4 pb-12 pt-14 sm:px-6 sm:pt-20">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-5xl">Submit a project</h1>
          <p className="mt-4 max-w-2xl text-lg text-fg-muted">
            Your request becomes a pull request on GitHub. A maintainer reviews it, and once it is merged the site
            updates automatically. You don&apos;t need a GitHub account.
          </p>
        </div>
      </section>
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Suspense fallback={<div className="mt-10 h-[40rem] rounded-2xl bg-bg-alt" />}>
          <SubmitForm projects={projects} />
        </Suspense>
      </div>
    </>
  );
}
