# Contributing

The easiest way to add, edit or remove a project is the form on the website: it opens a pull request for you.

## Editing JSON directly

1. Fork the repository and add or edit `projects/<slug>.json`. The file name must match the `slug`.
2. Run `npm run validate` to check the file.
3. Open a pull request. CI validates every project file.

```json
{
  "slug": "my-app",
  "name": "My App",
  "tagline": "One sentence, at most 120 characters.",
  "description": "Plain text. Separate paragraphs with a blank line (\\n\\n).",
  "category": "App",
  "tags": ["media", "docker"],
  "url": "https://example.com",
  "repo": "https://github.com/me/my-app",
  "docs": "https://example.com/docs",
  "icon": "https://example.com/icon.svg",
  "screenshots": ["https://example.com/screenshot.png"],
  "author": { "name": "me", "url": "https://github.com/me" },
  "license": "MIT",
  "zimaosVersion": "1.4+",
  "status": "active",
  "addedAt": "2026-10-03",
  "updatedAt": "2026-10-03"
}
```

- `category`: `App`, `App Store`, `Tool`, `Integration`, `Guide`, `Hardware`, `Theme` or `Other`.
- `status`: `active`, `beta` or `archived`.
- `tags`: up to 8, lowercase with dashes.
- Optional fields: `repo`, `docs`, `icon`, `screenshots`, `author.url`, `license`, `zimaosVersion`.

The full schema is in [`schema/project.schema.json`](schema/project.schema.json); VS Code picks it up automatically for files in `projects/`.

## Guidelines

- The project must run on, or integrate with, ZimaOS.
- Write in English and keep descriptions factual.
- One project per pull request.
