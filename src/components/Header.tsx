import Link from "next/link";
import { GitHubIcon, LogoMark } from "./icons";
import { ThemeToggle } from "./ThemeToggle";
import { site } from "@/lib/site";

export function Header() {
  return (
    <header className="glass sticky top-0 z-40 border-b border-line">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-6 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2" aria-label={`${site.name} home`}>
          <LogoMark className="size-7" />
          <span className="text-[15px] font-semibold tracking-tight">Awesome Zima</span>
        </Link>
        <nav className="hidden items-center gap-6 text-sm text-fg-muted sm:flex" aria-label="Main">
          <Link href="/#projects" className="hover:text-fg">
            Projects
          </Link>
          <Link href="/submit" className="hover:text-fg">
            Contribute
          </Link>
          <a href={site.repoUrl} target="_blank" rel="noreferrer" className="hover:text-fg">
            GitHub
          </a>
        </nav>
        <div className="ml-auto flex items-center gap-1">
          <a
            href={site.repoUrl}
            target="_blank"
            rel="noreferrer"
            className="btn btn-ghost px-2.5 sm:hidden"
            aria-label="Source on GitHub"
          >
            <GitHubIcon className="size-[18px]" />
          </a>
          <ThemeToggle />
          <Link href="/submit" className="btn btn-primary ml-1 h-8 px-4 text-[13px]">
            Submit
          </Link>
        </div>
      </div>
    </header>
  );
}
