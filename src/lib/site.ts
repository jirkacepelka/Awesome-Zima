export const site = {
  name: "Awesome Zima",
  description:
    "A community-curated directory of apps, tools, guides and integrations built for ZimaOS.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://awesome-zima.vercel.app",
  repoUrl: process.env.NEXT_PUBLIC_REPO_URL || "https://github.com/jirkacepelka/awesome-zima",
  repoBranch: process.env.NEXT_PUBLIC_REPO_BRANCH || "main",
  turnstileSiteKey: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "",
};

/** Link to GitHub's web editor for proposing a change without the API. */
export function githubNewFileUrl(slug: string, json: string): string {
  const params = new URLSearchParams({ filename: `projects/${slug}.json`, value: json });
  return `${site.repoUrl}/new/${site.repoBranch}?${params}`;
}

export function githubEditFileUrl(slug: string): string {
  return `${site.repoUrl}/edit/${site.repoBranch}/projects/${slug}.json`;
}

export function githubDeleteFileUrl(slug: string): string {
  return `${site.repoUrl}/delete/${site.repoBranch}/projects/${slug}.json`;
}

export function hostname(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

