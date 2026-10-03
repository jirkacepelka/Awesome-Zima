import { test } from "node:test";
import assert from "node:assert/strict";
import { createSubmissionPullRequest, SubmissionError, type GitHubConfig } from "../src/lib/github";
import { submissionSchema } from "../src/lib/schema";

const config: GitHubConfig = { token: "t", owner: "o", repo: "r", baseBranch: "main" };

const draft = {
  slug: "demo-app",
  name: "Demo App",
  tagline: "A demo application for ZimaOS.",
  description: "This is a long enough description for the demo app.",
  category: "App",
  tags: ["demo"],
  url: "https://example.com",
  author: { name: "tester" },
  status: "active",
};

function fakeOctokit(existing?: object) {
  const calls: Record<string, unknown[]> = {};
  const record = (name: string, result: unknown = {}) =>
    async (args: unknown) => {
      (calls[name] ??= []).push(args);
      return { data: result };
    };
  const octokit = {
    rest: {
      repos: {
        getContent: async () => {
          if (!existing) throw Object.assign(new Error("Not found"), { status: 404 });
          return {
            data: { type: "file", sha: "abc", content: Buffer.from(JSON.stringify(existing, null, 2) + "\n").toString("base64") },
          };
        },
        createOrUpdateFileContents: record("put"),
        deleteFile: record("delete"),
      },
      git: {
        getRef: async () => ({ data: { object: { sha: "base-sha" } } }),
        createRef: record("createRef"),
      },
      pulls: { create: record("pr", { html_url: "https://github.com/o/r/pull/7", number: 7 }) },
      issues: { addLabels: record("labels") },
    },
  };
  return { octokit: octokit as never, calls };
}

const parse = (v: unknown) => submissionSchema.parse(v);

test("add opens a PR with a new project file", async () => {
  const { octokit, calls } = fakeOctokit();
  const pr = await createSubmissionPullRequest(parse({ type: "add", project: draft, note: "Please add" }), config, octokit);
  assert.equal(pr.number, 7);
  const put = calls.put[0] as { path: string; content: string; sha?: string };
  assert.equal(put.path, "projects/demo-app.json");
  assert.equal(put.sha, undefined);
  const json = JSON.parse(Buffer.from(put.content, "base64").toString());
  assert.equal(json.name, "Demo App");
  assert.match(json.addedAt, /^\d{4}-\d{2}-\d{2}$/);
  assert.match((calls.pr[0] as { title: string }).title, /^\[Add\] Demo App$/);
});

test("add rejects an existing slug", async () => {
  const { octokit } = fakeOctokit({ ...draft, addedAt: "2026-01-01", updatedAt: "2026-01-01" });
  await assert.rejects(
    createSubmissionPullRequest(parse({ type: "add", project: draft }), config, octokit),
    (e: unknown) => e instanceof SubmissionError && e.status === 409,
  );
});

test("edit keeps addedAt and updates the file", async () => {
  const { octokit, calls } = fakeOctokit({ ...draft, addedAt: "2026-01-01", updatedAt: "2026-01-01" });
  await createSubmissionPullRequest(
    parse({ type: "edit", slug: "demo-app", project: { ...draft, tagline: "A better demo for ZimaOS." } }),
    config,
    octokit,
  );
  const put = calls.put[0] as { content: string; sha: string };
  assert.equal(put.sha, "abc");
  const json = JSON.parse(Buffer.from(put.content, "base64").toString());
  assert.equal(json.addedAt, "2026-01-01");
  assert.equal(json.tagline, "A better demo for ZimaOS.");
});

test("edit of a missing project is a 404", async () => {
  const { octokit } = fakeOctokit();
  await assert.rejects(
    createSubmissionPullRequest(parse({ type: "edit", slug: "nope", project: draft }), config, octokit),
    (e: unknown) => e instanceof SubmissionError && e.status === 404,
  );
});

test("remove deletes the file", async () => {
  const { octokit, calls } = fakeOctokit({ ...draft, addedAt: "2026-01-01", updatedAt: "2026-01-01" });
  await createSubmissionPullRequest(
    parse({ type: "remove", slug: "demo-app", note: "Project is abandoned." }),
    config,
    octokit,
  );
  assert.equal((calls.delete[0] as { path: string }).path, "projects/demo-app.json");
  assert.match((calls.pr[0] as { title: string }).title, /^\[Remove\]/);
});

test("schema rejects bad input", () => {
  assert.equal(submissionSchema.safeParse({ type: "add", project: { ...draft, url: "ftp://x" } }).success, false);
  assert.equal(submissionSchema.safeParse({ type: "remove", slug: "demo-app", note: "short" }).success, false);
});
