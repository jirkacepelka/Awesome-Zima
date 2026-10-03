# Awesome Zima

A community-curated directory of apps, tools, guides and integrations built for [ZimaOS](https://www.zimaspace.com/zimaos).

> **Unofficial.** Awesome Zima is a community project. It is not operated, affiliated with, sponsored or endorsed by IceWhale Technology.

- Every project is one JSON file in [`projects/`](projects/).
- Visitors can **submit**, **suggest edits** or **request removal** directly on the website. Each request becomes a pull request in this repository.
- When a pull request is merged, Vercel rebuilds the site and the change goes live.

## Tech stack

Next.js (App Router) · TypeScript · Tailwind CSS v4 · Zod · Octokit. All pages are statically generated from the JSON files at build time; the only server code is the `/api/submit` route.

```
projects/<slug>.json        project data (source of truth)
schema/project.schema.json  JSON Schema for editors (generated: npm run schema)
src/lib/schema.ts           Zod schema shared by the build, the API and the form
src/lib/github.ts           creates the branch, commit and pull request
src/app/api/submit/route.ts submission endpoint (rate limit, honeypot, optional Turnstile)
```

## Development

```bash
npm install
npm run dev        # http://localhost:3000
npm run validate   # check all projects/*.json
npm test           # unit tests for the submission logic
npm run lint && npm run typecheck
```

Without GitHub credentials the site works fully; the submit form then offers to continue on GitHub with the data prefilled.

## Deploying to Vercel

1. Import the repository in Vercel (framework preset: **Next.js**, no other build settings needed).
2. Create a **fine-grained personal access token** (GitHub → Settings → Developer settings) scoped to *this repository only* with:
   - Contents: **Read and write**
   - Pull requests: **Read and write**
   - Issues: **Read and write** (optional, used to label PRs)
3. Add the environment variables in Vercel → Project → Settings → Environment Variables (see [`.env.example`](.env.example)):

   | Variable | Required | Description |
   | --- | --- | --- |
   | `GITHUB_TOKEN` | yes | Token from step 2 |
   | `GITHUB_OWNER` | yes | e.g. `jirkacepelka` |
   | `GITHUB_REPO` | yes | e.g. `awesome-zima` |
   | `GITHUB_BASE_BRANCH` | no | Branch PRs target, default `main` |
   | `NEXT_PUBLIC_SITE_URL` | no | Canonical URL for metadata |
   | `NEXT_PUBLIC_REPO_URL` | no | Repository URL used for links |
   | `NEXT_PUBLIC_REPO_BRANCH` | no | Branch used for "edit on GitHub" links |
   | `TURNSTILE_SECRET_KEY` + `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | no | Enable a [Cloudflare Turnstile](https://www.cloudflare.com/products/turnstile/) captcha on the form |

4. Deploy. Every merge to the production branch triggers a new deployment.

### Spam protection

Submissions never publish anything directly: they only open pull requests that a maintainer must merge. On top of that the endpoint has a honeypot field, a per-IP rate limit (5 per hour per instance) and an optional Turnstile captcha.

## Adding a project manually

See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

Code: MIT. Project descriptions belong to their respective authors.
