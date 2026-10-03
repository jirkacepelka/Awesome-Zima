import Link from "next/link";
import { Plus } from "lucide-react";
import { GitHubIcon, LogoMark } from "./icons";
import { ThemeToggle } from "./ThemeToggle";
import { site } from "@/lib/site";

export function Header() {
  return (
    <header className="glass sticky top-0 z-40 border-x-0 border-t-0">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4 sm:px-6">
        <Link href="/" className="group flex items-center gap-2.5 rounded-lg" aria-label={`${site.name} home`}>
          <LogoMark className="size-8 transition-transform group-hover:scale-105" />
          <span className="text-[15px] font-semibold tracking-tight">
            Awesome <span className="text-accent">Zima</span>
          </span>
        </Link>
        <nav className="ml-auto flex items-center gap-1" aria-label="Main">
          <Link href="/#projects" className="btn btn-ghost hidden sm:inline-flex">
            Projects
          </Link>
          <a
            href={site.repoUrl}
            target="_blank"
            rel="noreferrer"
            className="btn btn-ghost px-2.5"
            aria-label="Source on GitHub"
            title="Source on GitHub"
          >
            <GitHubIcon className="size-[18px]" />
          </a>
          <ThemeToggle />
          <Link href="/submit" className="btn btn-primary ml-1">
            <Plus className="size-4" strokeWidth={2.5} />
            <span className="hidden sm:inline">Submit project</span>
            <span className="sm:hidden">Submit</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}
