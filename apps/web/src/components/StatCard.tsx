interface StatCardProps {
  label: string;
  value: string;
  trend?: {
    value: string;
    positive: boolean;
  };
  variant?: "white" | "dark" | "accent";
}

export default function StatCard({
  label,
  value,
  trend,
  variant = "white",
}: StatCardProps) {
  const bgClass =
    variant === "dark"
      ? "bg-card-dark"
      : variant === "accent"
        ? "bg-blue-100"
        : "bg-card card-shadow";

  const textClass =
    variant === "dark" ? "text-text-on-dark" : "text-text";

  const labelClass =
    variant === "dark" ? "text-text-muted" : "text-text-secondary";

  const arrowBgClass =
    variant === "dark"
      ? "bg-white/10"
      : "bg-[rgba(37,99,235,0.1)]";

  const arrowColorClass =
    variant === "dark" ? "text-white" : "text-brand";

  return (
    <article
      className={`${bgClass} flex flex-col justify-between rounded-[20px] p-6`}
    >
      <div className="flex items-start justify-between">
        <span
          className={`${labelClass} text-[12px] font-[600] tracking-wide uppercase`}
        >
          {label}
        </span>
        <div
          className={`${arrowBgClass} flex h-[32px] w-[32px] items-center justify-center rounded-full`}
          aria-hidden="true"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            className={arrowColorClass}
          >
            <path
              d="M3 11L11 3M11 3H5M11 3V9"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>
      <div className="mt-4">
        <p
          className={`${textClass} font-[family-name:var(--font-geist-mono)] text-[36px] font-[600] leading-tight`}
        >
          {value}
        </p>
        {trend && (
          <p
            className={`mt-1 text-[13px] font-[500] ${trend.positive ? "text-success" : "text-error"}`}
          >
            {trend.positive ? "+" : ""}
            {trend.value} vs last period
          </p>
        )}
      </div>
    </article>
  );
}
