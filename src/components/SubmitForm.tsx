"use client";

import { cloneElement, isValidElement, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Script from "next/script";
import { useSearchParams } from "next/navigation";
import { AlertCircle, ArrowRight, CircleCheck, GitPullRequest, LoaderCircle, Pencil, Plus, Trash2 } from "lucide-react";
import {
  CATEGORIES,
  STATUSES,
  projectDraftSchema,
  slugify,
  type Project,
  type ProjectDraft,
} from "@/lib/schema";
import { githubDeleteFileUrl, githubEditFileUrl, githubNewFileUrl, site } from "@/lib/site";
import { ProjectCard } from "./ProjectCard";
import { GitHubIcon } from "./icons";

type Mode = "add" | "edit" | "remove";

interface FormState {
  name: string;
  slug: string;
  tagline: string;
  description: string;
  category: string;
  status: string;
  tags: string;
  url: string;
  repo: string;
  docs: string;
  icon: string;
  screenshots: string;
  authorName: string;
  authorUrl: string;
  license: string;
  zimaosVersion: string;
}

const EMPTY: FormState = {
  name: "",
  slug: "",
  tagline: "",
  description: "",
  category: "App",
  status: "active",
  tags: "",
  url: "",
  repo: "",
  docs: "",
  icon: "",
  screenshots: "",
  authorName: "",
  authorUrl: "",
  license: "",
  zimaosVersion: "",
};

function fromProject(p: Project): FormState {
  return {
    name: p.name,
    slug: p.slug,
    tagline: p.tagline,
    description: p.description,
    category: p.category,
    status: p.status,
    tags: p.tags.join(", "),
    url: p.url,
    repo: p.repo ?? "",
    docs: p.docs ?? "",
    icon: p.icon ?? "",
    screenshots: (p.screenshots ?? []).join("\n"),
    authorName: p.author.name,
    authorUrl: p.author.url ?? "",
    license: p.license ?? "",
    zimaosVersion: p.zimaosVersion ?? "",
  };
}

function toDraft(f: FormState) {
  const screenshots = f.screenshots.split(/\s+/).filter(Boolean);
  return {
    slug: f.slug,
    name: f.name,
    tagline: f.tagline,
    description: f.description,
    category: f.category,
    status: f.status,
    tags: f.tags
      .split(",")
      .map((t) => slugify(t))
      .filter(Boolean),
    url: f.url,
    repo: f.repo,
    docs: f.docs,
    icon: f.icon,
    screenshots: screenshots.length ? screenshots : undefined,
    author: { name: f.authorName, url: f.authorUrl },
    license: f.license,
    zimaosVersion: f.zimaosVersion,
  };
}

function without(errors: Record<string, string>, key: string) {
  const next = { ...errors };
  delete next[key];
  return next;
}

/** Maps zod issue paths to form field names. */
function fieldFor(path: string): keyof FormState | "note" {
  if (path.startsWith("author.name")) return "authorName";
  if (path.startsWith("author.url")) return "authorUrl";
  if (path.startsWith("project.")) return fieldFor(path.slice(8));
  const key = path.split(".")[0];
  return key as keyof FormState;
}

type Result =
  | { kind: "success"; url?: string; number?: number }
  | { kind: "fallback"; href: string }
  | { kind: "error"; message: string };

declare global {
  interface Window {
    turnstile?: {
      render: (el: HTMLElement, opts: { sitekey: string; callback: (token: string) => void; "expired-callback"?: () => void; theme?: string }) => string;
      reset: (id?: string) => void;
    };
  }
}

export function SubmitForm({ projects }: { projects: Project[] }) {
  const params = useSearchParams();
  const initialSlug = params.get("edit") ?? params.get("remove") ?? "";
  const initialMode: Mode = params.get("edit") ? "edit" : params.get("remove") ? "remove" : "add";
  const initialProject = projects.find((p) => p.slug === initialSlug);

  const [mode, setMode] = useState<Mode>(initialProject ? initialMode : "add");
  const [target, setTarget] = useState(initialProject?.slug ?? projects[0]?.slug ?? "");
  const [form, setForm] = useState<FormState>(
    initialProject && initialMode === "edit" ? fromProject(initialProject) : EMPTY,
  );
  const [slugTouched, setSlugTouched] = useState(false);
  const [note, setNote] = useState("");
  const [contact, setContact] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [token, setToken] = useState("");
  const turnstileRef = useRef<HTMLDivElement>(null);
  const turnstileId = useRef<string | null>(null);
  const noticeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (result && result.kind !== "success") noticeRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [result]);

  const targetProject = projects.find((p) => p.slug === target);

  function switchMode(next: Mode) {
    setMode(next);
    setErrors({});
    setResult(null);
    if (next === "edit" && targetProject) setForm(fromProject(targetProject));
    if (next === "add") {
      setForm(EMPTY);
      setSlugTouched(false);
    }
  }

  function pickTarget(slug: string) {
    setTarget(slug);
    const p = projects.find((x) => x.slug === slug);
    if (mode === "edit" && p) setForm(fromProject(p));
  }

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => {
      const next = { ...f, [key]: value };
      if (key === "name" && mode === "add" && !slugTouched) next.slug = slugify(value);
      return next;
    });
    if (errors[key]) setErrors((e) => without(e, key));
  }

  const renderTurnstile = () => {
    if (!site.turnstileSiteKey || !window.turnstile || !turnstileRef.current || turnstileId.current) return;
    turnstileId.current = window.turnstile.render(turnstileRef.current, {
      sitekey: site.turnstileSiteKey,
      callback: setToken,
      "expired-callback": () => setToken(""),
      theme: "auto",
    });
  };
  useEffect(renderTurnstile, []);

  const preview: Project | null = useMemo(() => {
    if (mode === "remove") return null;
    const d = toDraft(form);
    return {
      ...d,
      name: d.name || "Your project",
      slug: d.slug || "your-project",
      tagline: d.tagline || "A short, catchy one-line description of what it does.",
      category: (CATEGORIES as readonly string[]).includes(d.category) ? (d.category as Project["category"]) : "Other",
      status: d.status as Project["status"],
      url: d.url || "https://example.com",
      repo: d.repo || undefined,
      icon: d.icon || undefined,
      docs: undefined,
      license: undefined,
      zimaosVersion: undefined,
      author: { name: d.author.name || "you" },
      addedAt: "",
      updatedAt: "",
    };
  }, [form, mode]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setResult(null);

    let payload: Record<string, unknown>;
    let fallbackHref: string;
    if (mode === "remove") {
      if (note.trim().length < 10) {
        setErrors({ note: "Please explain why (min. 10 characters)" });
        return;
      }
      payload = { type: "remove", slug: target, note, contact };
      fallbackHref = githubDeleteFileUrl(target);
    } else {
      const draft = mode === "edit" ? { ...toDraft(form), slug: target } : toDraft(form);
      const parsed = projectDraftSchema.safeParse(draft);
      if (!parsed.success) {
        const errs: Record<string, string> = {};
        for (const issue of parsed.error.issues) {
          const key = fieldFor(issue.path.join("."));
          errs[key] ??= issue.message;
        }
        setErrors(errs);
        document.querySelector<HTMLElement>(`[name="${Object.keys(errs)[0]}"]`)?.focus();
        return;
      }
      if (mode === "add" && projects.some((p) => p.slug === parsed.data.slug)) {
        setErrors({ slug: "This slug is already taken" });
        return;
      }
      payload = { type: mode, ...(mode === "edit" ? { slug: target } : {}), project: parsed.data, note, contact };
      const today = new Date().toISOString().slice(0, 10);
      const json = JSON.stringify(
        { ...parsed.data, addedAt: targetProject && mode === "edit" ? targetProject.addedAt : today, updatedAt: today } satisfies ProjectDraft & { addedAt: string; updatedAt: string },
        null,
        2,
      );
      fallbackHref = mode === "edit" ? githubEditFileUrl(target) : githubNewFileUrl(parsed.data.slug, json);
    }

    if (site.turnstileSiteKey && !token) {
      setResult({ kind: "error", message: "Please complete the captcha first." });
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, website: honeypot, turnstileToken: token || undefined }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setResult({ kind: "success", url: data.pullRequest?.url, number: data.pullRequest?.number });
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else if (res.status === 503 || (res.status === 404 && !data.error)) {
        setResult({ kind: "fallback", href: fallbackHref });
      } else {
        if (Array.isArray(data.issues)) {
          const errs: Record<string, string> = {};
          for (const i of data.issues) errs[fieldFor(i.path)] ??= i.message;
          setErrors(errs);
        }
        setResult({ kind: "error", message: data.error ?? "Something went wrong. Please try again." });
      }
    } catch {
      setResult({ kind: "fallback", href: fallbackHref });
    } finally {
      setSubmitting(false);
      if (turnstileId.current) window.turnstile?.reset(turnstileId.current);
      setToken("");
    }
  }

  if (result?.kind === "success") {
    return (
      <div className="card mt-10 flex flex-col items-center rounded-[24px] px-6 py-14 text-center animate-rise">
        <span className="grid size-14 place-items-center rounded-2xl bg-success/15 text-success">
          <CircleCheck className="size-7" />
        </span>
        <h2 className="mt-5 text-2xl font-semibold tracking-tight">Thanks, your request is in!</h2>
        <p className="mt-2 max-w-md text-fg-muted">
          We opened a pull request for it. A maintainer will review it soon; once merged, the site updates automatically.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          {result.url && (
            <a href={result.url} target="_blank" rel="noreferrer" className="btn btn-primary">
              <GitPullRequest className="size-4" /> View pull request{result.number ? ` #${result.number}` : ""}
            </a>
          )}
          <Link href="/" className="btn btn-secondary">
            Back to directory
          </Link>
        </div>
      </div>
    );
  }

  const tabs: { id: Mode; label: string; icon: typeof Plus; disabled?: boolean }[] = [
    { id: "add", label: "Add new", icon: Plus },
    { id: "edit", label: "Suggest edit", icon: Pencil, disabled: projects.length === 0 },
    { id: "remove", label: "Request removal", icon: Trash2, disabled: projects.length === 0 },
  ];

  return (
    <form onSubmit={onSubmit} noValidate className="mt-10 grid gap-8 lg:grid-cols-[1fr_340px]">
      {site.turnstileSiteKey && (
        <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit" onReady={renderTurnstile} />
      )}
      <div className="min-w-0 space-y-6">
        <div className="card inline-flex w-full gap-1 rounded-2xl p-1 sm:w-auto" role="tablist" aria-label="Request type">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={mode === t.id}
              disabled={t.disabled}
              onClick={() => switchMode(t.id)}
              className={`inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-xl px-3 text-sm font-semibold transition sm:flex-none sm:px-4 ${
                mode === t.id ? "bg-accent text-accent-fg shadow-sm" : "text-fg-muted hover:bg-surface-muted hover:text-fg"
              } disabled:opacity-40`}
            >
              <t.icon className="size-4" />
              <span className="max-sm:text-xs">{t.label}</span>
            </button>
          ))}
        </div>

        <div ref={noticeRef} className="scroll-mt-24" />
        {result?.kind === "error" && (
          <div role="alert" className="flex gap-3 rounded-2xl border border-danger/30 bg-danger/10 p-4 text-sm">
            <AlertCircle className="mt-0.5 size-4 shrink-0 text-danger" />
            <p>{result.message}</p>
          </div>
        )}
        {result?.kind === "fallback" && (
          <div role="alert" className="flex flex-col gap-3 rounded-2xl border border-warning/30 bg-warning/10 p-4 text-sm sm:flex-row sm:items-center">
            <AlertCircle className="size-4 shrink-0 text-warning" />
            <p className="flex-1">
              Automatic submissions aren&apos;t available right now. You can propose the same change directly on GitHub,
              your data is prefilled.
            </p>
            <a href={result.href} target="_blank" rel="noreferrer" className="btn btn-secondary">
              <GitHubIcon className="size-4" /> Continue on GitHub
            </a>
          </div>
        )}

        {mode !== "add" && (
          <Fieldset title={mode === "edit" ? "Which project needs an update?" : "Which project should be removed?"}>
            <Field label="Project" name="target">
              <select name="target" value={target} onChange={(e) => pickTarget(e.target.value)} className="input">
                {projects.map((p) => (
                  <option key={p.slug} value={p.slug}>
                    {p.name}
                  </option>
                ))}
              </select>
            </Field>
          </Fieldset>
        )}

        {mode !== "remove" && (
          <>
            <Fieldset title="Basics" description="What is it, and what does it do?">
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Name" name="name" error={errors.name} required>
                  <input name="name" className="input" value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="ZimaMC" maxLength={60} aria-invalid={!!errors.name} />
                </Field>
                <Field
                  label="Slug"
                  name="slug"
                  error={errors.slug}
                  hint={mode === "edit" ? "Slugs can't be changed." : `File: projects/${form.slug || "…"}.json`}
                  required
                >
                  <input
                    name="slug"
                    className="input font-mono text-sm"
                    value={mode === "edit" ? target : form.slug}
                    readOnly={mode === "edit"}
                    onChange={(e) => {
                      setSlugTouched(true);
                      update("slug", slugify(e.target.value));
                    }}
                    placeholder="zimamc"
                    aria-invalid={!!errors.slug}
                  />
                </Field>
              </div>
              <Field label="Tagline" name="tagline" error={errors.tagline} hint={`${form.tagline.length}/120`} required>
                <input name="tagline" className="input" value={form.tagline} onChange={(e) => update("tagline", e.target.value)} placeholder="One sentence that sells it." maxLength={120} aria-invalid={!!errors.tagline} />
              </Field>
              <Field label="Description" name="description" error={errors.description} hint="Plain text. Separate paragraphs with a blank line." required>
                <textarea name="description" rows={6} className="input" value={form.description} onChange={(e) => update("description", e.target.value)} placeholder="What does it do, who is it for, how do you install it on ZimaOS?" maxLength={3000} aria-invalid={!!errors.description} />
              </Field>
              <div className="grid gap-5 sm:grid-cols-3">
                <Field label="Category" name="category" error={errors.category} required>
                  <select name="category" className="input" value={form.category} onChange={(e) => update("category", e.target.value)}>
                    {CATEGORIES.map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Status" name="status" error={errors.status}>
                  <select name="status" className="input capitalize" value={form.status} onChange={(e) => update("status", e.target.value)}>
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s[0].toUpperCase() + s.slice(1)}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="ZimaOS version" name="zimaosVersion" error={errors.zimaosVersion} hint="Optional">
                  <input name="zimaosVersion" className="input" value={form.zimaosVersion} onChange={(e) => update("zimaosVersion", e.target.value)} placeholder="1.4+" />
                </Field>
              </div>
              <Field label="Tags" name="tags" error={errors.tags} hint="Comma separated, up to 8.">
                <input name="tags" className="input" value={form.tags} onChange={(e) => update("tags", e.target.value)} placeholder="media, docker, backup" />
              </Field>
            </Fieldset>

            <Fieldset title="Links" description="Where can people find it?">
              <Field label="Website" name="url" error={errors.url} required>
                <input name="url" type="url" className="input" value={form.url} onChange={(e) => update("url", e.target.value)} placeholder="https://" aria-invalid={!!errors.url} />
              </Field>
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Source repository" name="repo" error={errors.repo}>
                  <input name="repo" type="url" className="input" value={form.repo} onChange={(e) => update("repo", e.target.value)} placeholder="https://github.com/…" aria-invalid={!!errors.repo} />
                </Field>
                <Field label="Documentation" name="docs" error={errors.docs}>
                  <input name="docs" type="url" className="input" value={form.docs} onChange={(e) => update("docs", e.target.value)} placeholder="https://" aria-invalid={!!errors.docs} />
                </Field>
              </div>
              <Field label="Icon URL" name="icon" error={errors.icon} hint="Square SVG or PNG. Shown in the live preview.">
                <input name="icon" type="url" className="input" value={form.icon} onChange={(e) => update("icon", e.target.value)} placeholder="https://…/icon.svg" aria-invalid={!!errors.icon} />
              </Field>
              <Field label="Screenshot URLs" name="screenshots" error={errors.screenshots} hint="One per line, up to 6.">
                <textarea name="screenshots" rows={2} className="input font-mono text-sm" value={form.screenshots} onChange={(e) => update("screenshots", e.target.value)} placeholder="https://…/screenshot.png" />
              </Field>
            </Fieldset>

            <Fieldset title="Maker">
              <div className="grid gap-5 sm:grid-cols-3">
                <Field label="Author" name="authorName" error={errors.authorName} required>
                  <input name="authorName" className="input" value={form.authorName} onChange={(e) => update("authorName", e.target.value)} placeholder="Name or handle" aria-invalid={!!errors.authorName} />
                </Field>
                <Field label="Author URL" name="authorUrl" error={errors.authorUrl}>
                  <input name="authorUrl" type="url" className="input" value={form.authorUrl} onChange={(e) => update("authorUrl", e.target.value)} placeholder="https://github.com/…" aria-invalid={!!errors.authorUrl} />
                </Field>
                <Field label="License" name="license" error={errors.license}>
                  <input name="license" className="input" value={form.license} onChange={(e) => update("license", e.target.value)} placeholder="MIT" />
                </Field>
              </div>
            </Fieldset>
          </>
        )}

        <Fieldset title={mode === "remove" ? "Reason" : "Anything else?"} description="Visible in the public pull request.">
          <Field
            label={mode === "remove" ? "Why should it be removed?" : "Note for reviewers"}
            name="note"
            error={errors.note}
            required={mode === "remove"}
          >
            <textarea
              name="note"
              rows={3}
              className="input"
              value={note}
              onChange={(e) => {
                setNote(e.target.value);
                if (errors.note) setErrors((e) => without(e, "note"));
              }}
              placeholder={mode === "remove" ? "e.g. The project is abandoned and the website is offline." : "Optional"}
              maxLength={1000}
              aria-invalid={!!errors.note}
            />
          </Field>
          <Field label="Contact" name="contact" hint="Optional. GitHub handle or email, published in the PR.">
            <input name="contact" className="input" value={contact} onChange={(e) => setContact(e.target.value)} placeholder="@your-github" maxLength={120} />
          </Field>
          {/* Honeypot: hidden from people, tempting for bots. */}
          <div aria-hidden="true" className="absolute -left-[9999px] h-0 overflow-hidden">
            <label>
              Website
              <input tabIndex={-1} autoComplete="off" name="website" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} />
            </label>
          </div>
          {site.turnstileSiteKey && <div ref={turnstileRef} />}
        </Fieldset>

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-fg-subtle">
            By submitting you agree that the data will be published under the repository&apos;s license.
          </p>
          <button type="submit" disabled={submitting} className={`btn h-11 px-6 ${mode === "remove" ? "btn-danger" : "btn-primary"}`}>
            {submitting ? <LoaderCircle className="size-4 animate-spin" /> : <GitPullRequest className="size-4" />}
            {submitting ? "Opening pull request…" : mode === "add" ? "Submit project" : mode === "edit" ? "Propose changes" : "Request removal"}
            {!submitting && <ArrowRight className="size-4" />}
          </button>
        </div>
      </div>

      <aside className="lg:sticky lg:top-24 lg:self-start">
        {preview ? (
          <>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-fg-subtle">Live preview</p>
            <div className="pointer-events-none">
              <ProjectCard project={preview} preview />
            </div>
          </>
        ) : (
          targetProject && (
            <>
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-fg-subtle">Requesting removal of</p>
              <div className="pointer-events-none opacity-70 grayscale">
                <ProjectCard project={targetProject} preview />
              </div>
            </>
          )
        )}
        <div className="mt-4 rounded-2xl border border-line bg-surface-muted/60 p-4 text-sm text-fg-muted">
          <p className="font-semibold text-fg">Guidelines</p>
          <ul className="mt-2 list-disc space-y-1 pl-4">
            <li>The project must run on or integrate with ZimaOS.</li>
            <li>Use English and keep it factual, no marketing fluff.</li>
            <li>One project per submission.</li>
          </ul>
        </div>
      </aside>
    </form>
  );
}

function Fieldset({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <fieldset className="card space-y-5 rounded-[20px] p-5 sm:p-6">
      <legend className="float-left w-full">
        <span className="block font-semibold">{title}</span>
        {description && <span className="mt-0.5 block text-sm text-fg-muted">{description}</span>}
      </legend>
      <div className="clear-both space-y-5">{children}</div>
    </fieldset>
  );
}

function Field({
  label,
  name,
  error,
  hint,
  required,
  children,
}: {
  label: string;
  name: string;
  error?: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={name} className="mb-1.5 flex items-baseline justify-between gap-2 text-sm font-medium">
        <span>
          {label}
          {required && <span className="ml-0.5 text-danger" aria-hidden="true">*</span>}
        </span>
        {hint && !error && <span className="truncate text-xs font-normal text-fg-subtle">{hint}</span>}
      </label>
      <IdProvider id={name}>{children}</IdProvider>
      {error && (
        <p className="mt-1.5 flex items-center gap-1 text-xs font-medium text-danger">
          <AlertCircle className="size-3.5" /> {error}
        </p>
      )}
    </div>
  );
}

/** Gives the single child control an id matching its label. */
function IdProvider({ id, children }: { id: string; children: React.ReactNode }) {
  if (isValidElement<{ id?: string }>(children)) return cloneElement(children, { id: children.props.id ?? id });
  return <>{children}</>;
}
