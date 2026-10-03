import type { SVGProps } from "react";

export function GitHubIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M12 .5C5.73.5.75 5.48.75 11.75c0 4.97 3.22 9.18 7.69 10.67.56.1.77-.24.77-.54v-1.9c-3.13.68-3.79-1.51-3.79-1.51-.51-1.3-1.25-1.65-1.25-1.65-1.02-.7.08-.69.08-.69 1.13.08 1.72 1.16 1.72 1.16 1 1.72 2.63 1.22 3.27.93.1-.73.39-1.22.71-1.5-2.5-.28-5.13-1.25-5.13-5.57 0-1.23.44-2.24 1.16-3.03-.12-.28-.5-1.43.11-2.98 0 0 .95-.3 3.1 1.16a10.8 10.8 0 0 1 5.64 0c2.15-1.46 3.1-1.16 3.1-1.16.61 1.55.23 2.7.11 2.98.72.79 1.16 1.8 1.16 3.03 0 4.33-2.64 5.28-5.15 5.56.4.35.76 1.03.76 2.08v3.08c0 .3.2.65.78.54 4.46-1.49 7.68-5.7 7.68-10.67C23.25 5.48 18.27.5 12 .5Z" />
    </svg>
  );
}

/** Wordmark glyph: stacked rounded tiles, a nod to a dashboard of apps. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="lm-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#3b86ff" />
          <stop offset="1" stopColor="#0b4fd6" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="9" fill="url(#lm-bg)" />
      <rect x="7.5" y="7.5" width="7.5" height="7.5" rx="2.2" fill="#fff" />
      <rect x="17" y="7.5" width="7.5" height="7.5" rx="2.2" fill="#fff" fillOpacity=".55" />
      <rect x="7.5" y="17" width="7.5" height="7.5" rx="2.2" fill="#fff" fillOpacity=".55" />
      <rect x="17" y="17" width="7.5" height="7.5" rx="3.75" fill="#fff" fillOpacity=".85" />
    </svg>
  );
}
