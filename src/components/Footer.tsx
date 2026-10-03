import Link from "next/link";
import { Info } from "lucide-react";
import { GitHubIcon, LogoMark } from "./icons";
import { site } from "@/lib/site";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-line bg-bg-elevated/60">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="flex flex-col gap-10 md:flex-row md:justify-between">
          <div className="max-w-sm">
            <Link href="/" className="flex items-center gap-2.5">
              <LogoMark className="size-7" />
              <span className="font-semibold tracking-tight">
                Awesome <span className="text-accent">Zima</span>
              </span>
            </Link>
            <p className="mt-3 text-sm leading-relaxed text-fg-muted">{site.description}</p>
          </div>
          <div className="grid grid-cols-2 gap-10 text-sm sm:gap-16">
            <div>
              <h2 className="font-semibold">Directory</h2>
              <ul className="mt-3 space-y-2 text-fg-muted">
                <li><Link href="/#projects" className="hover:text-fg">Browse projects</Link></li>
                <li><Link href="/submit" className="hover:text-fg">Submit a project</Link></li>
                <li><a href={`${site.repoUrl}/blob/${site.repoBranch}/CONTRIBUTING.md`} className="hover:text-fg">Contributing</a></li>
              </ul>
            </div>
            <div>
              <h2 className="font-semibold">Links</h2>
              <ul className="mt-3 space-y-2 text-fg-muted">
                <li>
                  <a href={site.repoUrl} className="inline-flex items-center gap-1.5 hover:text-fg">
                    <GitHubIcon className="size-3.5" /> Source code
                  </a>
                </li>
                <li><a href="https://www.zimaspace.com/zimaos" className="hover:text-fg">About ZimaOS</a></li>
                <li><a href="https://community.zimaspace.com/" className="hover:text-fg">ZimaOS community</a></li>
              </ul>
            </div>
          </div>
        </div>

        <div
          role="note"
          className="mt-10 flex gap-3 rounded-2xl border border-line bg-surface-muted/70 p-4 text-sm leading-relaxed text-fg-muted"
        >
          <Info className="mt-0.5 size-4 shrink-0 text-accent" />
          <p>
            <strong className="font-semibold text-fg">Unofficial community project.</strong> Awesome Zima is not
            an official project and is not operated, affiliated with, sponsored or endorsed by IceWhale Technology.
            ZimaOS, ZimaBoard, ZimaCube and related names are trademarks of their respective owners. Listed projects
            are maintained by their own authors.
          </p>
        </div>

        <p className="mt-6 text-xs text-fg-subtle">
          © {new Date().getFullYear()} Awesome Zima contributors · Project data is community-submitted and stored as JSON on GitHub.
        </p>
      </div>
    </footer>
  );
}
