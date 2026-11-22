import Image from "next/image";
import Link from "next/link";

type Props = {
  href?: string;
  dark?: boolean;
  showWordmark?: boolean;
  size?: number;
  className?: string;
};

/** Planboard mark + optional wordmark */
export default function BrandMark({
  href = "/",
  dark = false,
  showWordmark = true,
  size = 36,
  className = "",
}: Props) {
  const word = dark ? "text-paper" : "text-ink";
  const content = (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <span
        className="relative shrink-0 overflow-hidden rounded-lg ring-1 ring-ink/10"
        style={{ width: size, height: size }}
      >
        <Image
          src="/brand/planboard-logo.jpg"
          alt="Planboard"
          width={size}
          height={size}
          className="h-full w-full object-cover"
          priority
        />
      </span>
      {showWordmark ? (
        <span className={`font-display text-lg font-semibold leading-none ${word}`}>
          Planboard
        </span>
      ) : null}
    </span>
  );

  if (!href) return content;
  return (
    <Link href={href} className="inline-flex">
      {content}
    </Link>
  );
}
