import Link from "next/link";
import type { ReactNode } from "react";

function Icon({ size = 14, children }: { size?: number; children: ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

export function ChevronLeft({ size }: { size?: number }) {
  return (
    <Icon size={size}>
      <path d="M15 18l-6-6 6-6" />
    </Icon>
  );
}

export function ChevronRight({ size }: { size?: number }) {
  return (
    <Icon size={size}>
      <path d="M9 18l6-6-6-6" />
    </Icon>
  );
}

export function ChevronUp({ size }: { size?: number }) {
  return (
    <Icon size={size}>
      <path d="M6 15l6-6 6 6" />
    </Icon>
  );
}

export function CloseIcon({ size }: { size?: number }) {
  return (
    <Icon size={size}>
      <line x1="6" y1="6" x2="18" y2="18" />
      <line x1="18" y1="6" x2="6" y2="18" />
    </Icon>
  );
}

export function ListIcon({ size = 15 }: { size?: number }) {
  return (
    <Icon size={size}>
      <line x1="8" y1="6" x2="20" y2="6" />
      <line x1="8" y1="12" x2="20" y2="12" />
      <line x1="8" y1="18" x2="20" y2="18" />
      <line x1="3.5" y1="6" x2="3.6" y2="6" />
      <line x1="3.5" y1="12" x2="3.6" y2="12" />
      <line x1="3.5" y1="18" x2="3.6" y2="18" />
    </Icon>
  );
}

export default function BackLink({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <Link href={href} className="btn-back">
      <ChevronLeft />
      <span className="truncate">{children}</span>
    </Link>
  );
}
