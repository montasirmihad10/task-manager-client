"use client";

export default function Loading() {
  return (
    <div
      className="flex items-center justify-center gap-2"
      aria-label="Loading"
    >
      <span className="h-2.5 w-2.5 animate-pulse rounded-sm bg-accent-deep" />
      <span className="h-2.5 w-2.5 animate-pulse rounded-sm bg-accent-deep [animation-delay:150ms]" />
      <span className="h-2.5 w-2.5 animate-pulse rounded-sm bg-accent-deep [animation-delay:300ms]" />
    </div>
  );
}
