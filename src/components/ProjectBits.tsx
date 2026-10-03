"use client";

import { useEffect, useRef, useState } from "react";
import type { Project } from "@/lib/schema";

const COLORS = ["#2276F3", "#0F9D8A", "#7C4DFF", "#E8710A", "#D93F87", "#0288D1"];

function hash(text: string) {
  let h = 0;
  for (const c of text) h = (h * 31 + c.charCodeAt(0)) | 0;
  return Math.abs(h);
}

export function ProjectIcon({ project, size = "md" }: { project: Pick<Project, "name" | "slug" | "icon">; size?: "sm" | "md" | "lg" }) {
  const [failed, setFailed] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  // The image may have failed before React attached onError.
  useEffect(() => {
    const img = imgRef.current;
    if (img && img.complete && img.naturalWidth === 0) setFailed(true);
  }, [project.icon]);
  const box = { sm: "size-10 rounded-xl text-sm", md: "size-12 rounded-[14px] text-base", lg: "size-20 rounded-[22px] text-2xl" }[size];
  const initials = project.name
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  if (project.icon && !failed) {
    return (
      <span className={`${box} grid shrink-0 place-items-center overflow-hidden border border-line bg-surface-strong p-1.5`}>
        {/* eslint-disable-next-line @next/next/no-img-element -- arbitrary remote icons */}
        <img
          ref={imgRef}
          src={project.icon}
          alt=""
          className="size-full object-contain"
          onError={() => setFailed(true)}
        />
      </span>
    );
  }

  return (
    <span
      className={`${box} grid shrink-0 place-items-center font-semibold text-white`}
      style={{ backgroundColor: COLORS[hash(project.slug) % COLORS.length] }}
      aria-hidden="true"
    >
      {initials}
    </span>
  );
}
