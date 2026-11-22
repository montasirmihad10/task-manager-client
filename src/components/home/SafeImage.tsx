"use client";

import Image, { type ImageProps } from "next/image";

type Props = Omit<ImageProps, "src"> & {
  src?: string | null;
  fallbackClassName?: string;
};

/**
 * Renders remote images (Cloudinary / Unsplash / any https).
 * Uses unoptimized so admin-uploaded Cloudinary URLs always work without
 * needing every host pre-listed — Next still serves correctly.
 */
export default function SafeImage({
  src,
  alt,
  className,
  fallbackClassName,
  ...rest
}: Props) {
  if (!src) {
    return (
      <div
        className={
          fallbackClassName ||
          `bg-ink/10 ${typeof className === "string" ? className : ""}`
        }
        aria-hidden
      />
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      className={className}
      unoptimized
      {...rest}
    />
  );
}
