import Link from "next/link";

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
}

export default function EmptyState({
  title,
  description,
  actionLabel,
  actionHref,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-[20px] border-2 border-dashed border-border bg-white px-8 py-16 text-center">
      {/* Illustration placeholder */}
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-blue-50">
        <svg
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-brand"
        >
          <path d="M12 5v14M5 12h14" />
        </svg>
      </div>

      <h3 className="text-[20px] font-[700] text-text">{title}</h3>
      <p className="mt-2 max-w-sm text-[15px] text-text-secondary">
        {description}
      </p>

      {actionLabel && actionHref && (
        <Link
          href={actionHref}
          className="mt-6 inline-flex h-[44px] items-center rounded-[50px] bg-brand px-8 text-[15px] font-[600] text-white transition-all duration-200 hover:bg-brand-hover hover:-translate-y-[2px]"
        >
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
