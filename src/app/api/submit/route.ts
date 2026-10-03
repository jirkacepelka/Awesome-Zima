import { NextResponse, type NextRequest } from "next/server";
import { submissionSchema } from "@/lib/schema";
import { createSubmissionPullRequest, getGitHubConfig, SubmissionError } from "@/lib/github";

const WINDOW_MS = 60 * 60 * 1000;
const MAX_PER_WINDOW = 5;
const hits = new Map<string, number[]>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= MAX_PER_WINDOW) {
    hits.set(ip, recent);
    return true;
  }
  recent.push(now);
  hits.set(ip, recent);
  return false;
}

async function verifyTurnstile(token: string | undefined, ip: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return true;
  if (!token) return false;
  const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    body: new URLSearchParams({ secret, response: token, remoteip: ip }),
  });
  const data = (await res.json()) as { success?: boolean };
  return data.success === true;
}

const error = (message: string, status: number, extra?: object) =>
  NextResponse.json({ ok: false, error: message, ...extra }, { status });

export async function POST(request: NextRequest) {
  const config = getGitHubConfig();
  if (!config) {
    return error("Submissions are not configured on this deployment.", 503, { code: "not_configured" });
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return error("Invalid JSON body.", 400);
  }

  // Honeypot: bots fill every field. Pretend success, do nothing.
  if (payload && typeof payload === "object" && "website" in payload && (payload as { website?: unknown }).website) {
    return NextResponse.json({ ok: true });
  }

  const parsed = submissionSchema.safeParse(payload);
  if (!parsed.success) {
    return error("Some fields are invalid.", 400, {
      issues: parsed.error.issues.map((i) => ({ path: i.path.join("."), message: i.message })),
    });
  }

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (rateLimited(ip)) return error("Too many submissions. Please try again later.", 429);
  if (!(await verifyTurnstile(parsed.data.turnstileToken, ip))) {
    return error("Captcha verification failed. Please try again.", 400);
  }

  try {
    const pr = await createSubmissionPullRequest(parsed.data, config);
    return NextResponse.json({ ok: true, pullRequest: pr });
  } catch (e) {
    if (e instanceof SubmissionError) return error(e.message, e.status);
    console.error("Submission failed", e);
    return error("Could not open a pull request. Please try again later.", 502);
  }
}
