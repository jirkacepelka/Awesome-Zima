import Link from "next/link";
import { LogoMark } from "./icons";
import { site } from "@/lib/site";

export function Footer() {
  return (
    <footer className="mt-24 bg-bg-alt text-sm">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="flex flex-col gap-10 md:flex-row md:justify-between">
          <div className="max-w-xs">
            <Link href="/" className="flex items-center gap-2">
              <LogoMark className="size-6" />
              <span className="font-semibold tracking-tight">Awesome Zima</span>
            </Link>
            <p className="mt-3 leading-relaxed text-fg-muted">{site.description}</p>
          </div>
          <div className="grid grid-cols-2 gap-10 sm:gap-20">
            <div>
              <h2 className="font-medium">Directory</h2>
              <ul className="mt-3 space-y-2 text-fg-muted">
                <li><Link href="/#projects" className="hover:text-fg">Browse projects</Link></li>
                <li><Link href="/submit" className="hover:text-fg">Submit a project</Link></li>
                <li><a href={`${site.repoUrl}/blob/${site.repoBranch}/CONTRIBUTING.md`} className="hover:text-fg">Contributing</a></li>
              </ul>
            </div>
            <div>
              <h2 className="font-medium">Resources</h2>
              <ul className="mt-3 space-y-2 text-fg-muted">
                <li><a href={site.repoUrl} className="hover:text-fg">Source code</a></li>
                <li><a href="https://www.zimaspace.com/zimaos" className="hover:text-fg">About ZimaOS</a></li>
                <li><a href="https://community.zimaspace.com/" className="hover:text-fg">ZimaOS community</a></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-line-strong pt-6 text-xs leading-relaxed text-fg-muted">
          <p>
            <strong className="font-medium text-fg">Unofficial community project.</strong> Awesome Zima is not an
            official project and is not operated, affiliated with, sponsored or endorsed by IceWhale Technology.
            ZimaOS, ZimaBoard, ZimaCube and related names are trademarks of their respective owners. Listed projects
            are maintained by their own authors.
          </p>
          <p className="mt-3 text-fg-subtle">© {new Date().getFullYear()} Awesome Zima contributors</p>
        </div>
      </div>
    </footer>
  );
}
