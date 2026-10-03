import "server-only";
import { Octokit } from "@octokit/rest";
import { projectSchema, type Project, type Submission } from "./schema";

export interface GitHubConfig {
  token: string;
  owner: string;
  repo: string;
  baseBranch: string;
}

export function getGitHubConfig(): GitHubConfig | null {
  const token = process.env.GITHUB_TOKEN;
  const owner = process.env.GITHUB_OWNER;
  const repo = process.env.GITHUB_REPO;
  if (!token || !owner || !repo) return null;
  return { token, owner, repo, baseBranch: process.env.GITHUB_BASE_BRANCH || "main" };
}

export class SubmissionError extends Error {
  constructor(
    message: string,
    public status = 400,
  ) {
    super(message);
  }
}

const today = () => new Date().toISOString().slice(0, 10);

export function serializeProject(project: Project): string {
  return JSON.stringify(project, null, 2) + "\n";
}

function quote(text: string): string {
  return text
    .split("\n")
    .map((line) => `> ${line}`)
    .join("\n");
}

/** Opens a pull request that adds, edits or removes `projects/<slug>.json`. */
export async function createSubmissionPullRequest(
  submission: Submission,
  config: GitHubConfig,
  octokit: Pick<Octokit, "rest"> = new Octokit({ auth: config.token, userAgent: "awesome-zima" }),
): Promise<{ url: string; number: number }> {
  const { owner, repo, baseBranch } = config;
  const slug = submission.type === "add" ? submission.project.slug : submission.slug;
  const filePath = `projects/${slug}.json`;

  const existing = await getExistingFile(octokit, config, filePath);

  let content: string | null = null;
  let project: Project | null = null;
  if (submission.type === "add") {
    if (existing) throw new SubmissionError(`A project with the slug "${slug}" already exists.`, 409);
    project = projectSchema.parse({ ...submission.project, addedAt: today(), updatedAt: today() });
    content = serializeProject(project);
  } else {
    if (!existing) throw new SubmissionError(`Project "${slug}" was not found.`, 404);
    if (submission.type === "edit") {
      const previous = projectSchema.safeParse(JSON.parse(existing.content));
      project = projectSchema.parse({
        ...submission.project,
        slug,
        addedAt: previous.success ? previous.data.addedAt : today(),
        updatedAt: today(),
      });
      content = serializeProject(project);
      if (content === existing.content) throw new SubmissionError("No changes were made.", 422);
    }
  }

  const { data: baseRef } = await octokit.rest.git.getRef({ owner, repo, ref: `heads/${baseBranch}` });
  const branch = `submission/${submission.type}-${slug}-${Date.now().toString(36)}`;
  await octokit.rest.git.createRef({ owner, repo, ref: `refs/heads/${branch}`, sha: baseRef.object.sha });

  const verb = { add: "Add", edit: "Update", remove: "Remove" }[submission.type];
  const name = project?.name ?? slug;
  const message = `${verb} ${name}`;

  if (content !== null) {
    await octokit.rest.repos.createOrUpdateFileContents({
      owner,
      repo,
      branch,
      path: filePath,
      message,
      content: Buffer.from(content, "utf8").toString("base64"),
      ...(existing ? { sha: existing.sha } : {}),
    });
  } else {
    await octokit.rest.repos.deleteFile({ owner, repo, branch, path: filePath, message, sha: existing!.sha });
  }

  const body = [
    `This pull request was submitted from the Awesome Zima website.`,
    "",
    `**Request:** ${verb} \`${filePath}\``,
    submission.note ? `\n**Note from submitter:**\n\n${quote(submission.note)}` : "",
    submission.contact ? `\n**Contact:** ${submission.contact}` : "",
    project
      ? `\n<details><summary>Project JSON</summary>\n\n\`\`\`json\n${content}\`\`\`\n</details>`
      : "",
    "",
    "---",
    "_Review the change, then merge to publish it. Vercel redeploys automatically._",
  ]
    .filter((line) => line !== "")
    .join("\n");

  const { data: pr } = await octokit.rest.pulls.create({
    owner,
    repo,
    head: branch,
    base: baseBranch,
    title: `[${verb}] ${name}`,
    body,
  });

  try {
    await octokit.rest.issues.addLabels({
      owner,
      repo,
      issue_number: pr.number,
      labels: ["submission", submission.type],
    });
  } catch {
    // Labels are a nice-to-have; ignore missing permission.
  }

  return { url: pr.html_url, number: pr.number };
}

async function getExistingFile(
  octokit: Pick<Octokit, "rest">,
  { owner, repo, baseBranch }: GitHubConfig,
  path: string,
): Promise<{ sha: string; content: string } | null> {
  try {
    const { data } = await octokit.rest.repos.getContent({ owner, repo, path, ref: baseBranch });
    if (Array.isArray(data) || data.type !== "file") return null;
    return { sha: data.sha, content: Buffer.from(data.content, "base64").toString("utf8") };
  } catch (error) {
    if ((error as { status?: number }).status === 404) return null;
    throw error;
  }
}
