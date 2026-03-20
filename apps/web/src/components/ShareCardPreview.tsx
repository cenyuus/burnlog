interface ShareCardPreviewProps {
  variant?: "dark" | "brand" | "gradient";
  username?: string;
  primaryStat?: string;
  primaryLabel?: string;
  secondaryStats?: { label: string; value: string }[];
  sparklineData?: number[];
}

function Sparkline({ data }: { data: number[] }) {
  const max = Math.max(...data);
  const barWidth = 6;
  const gap = 3;
  const height = 40;
  const totalWidth = data.length * (barWidth + gap) - gap;

  return (
    <svg
      width={totalWidth}
      height={height}
      viewBox={`0 0 ${totalWidth} ${height}`}
      aria-hidden="true"
    >
      {data.map((val, i) => {
        const barHeight = Math.max((val / max) * height, 2);
        return (
          <rect
            key={i}
            x={i * (barWidth + gap)}
            y={height - barHeight}
            width={barWidth}
            height={barHeight}
            rx={2}
            fill="currentColor"
            opacity={0.6 + (val / max) * 0.4}
          />
        );
      })}
    </svg>
  );
}

export default function ShareCardPreview({
  variant = "dark",
  username = "williamchan",
  primaryStat = "9.6x",
  primaryLabel = "ROI Multiplier",
  secondaryStats = [
    { label: "Tokens", value: "12.8M" },
    { label: "Saved", value: "$1,734" },
    { label: "Days", value: "87" },
  ],
  sparklineData = [30, 45, 60, 55, 70, 80, 75, 90, 85, 95, 88, 92],
}: ShareCardPreviewProps) {
  const bgClass =
    variant === "dark"
      ? "bg-card-dark text-text-on-dark"
      : variant === "brand"
        ? "bg-brand text-white"
        : "bg-gradient-to-br from-blue-100 to-blue-200 text-text";

  const mutedClass =
    variant === "dark"
      ? "text-text-muted"
      : variant === "brand"
        ? "text-white/70"
        : "text-text-secondary";

  const sparklineColor =
    variant === "dark"
      ? "text-blue-300"
      : variant === "brand"
        ? "text-white/50"
        : "text-brand/40";

  return (
    <article
      className={`${bgClass} relative overflow-hidden rounded-[20px]`}
      style={{ aspectRatio: "1200/630" }}
      aria-label={`Share card: ${primaryLabel} ${primaryStat}`}
    >
      <div className="flex h-full flex-col justify-between p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <span
            className={`${mutedClass} font-[family-name:var(--font-geist-mono)] text-[11px] font-[600] tracking-widest uppercase`}
          >
            BURNLOG.DEV
          </span>
          <span className={`${mutedClass} text-[11px] font-[500]`}>
            @{username}
          </span>
        </div>

        {/* Main stat */}
        <div className="flex items-end justify-between">
          <div>
            <p
              className="font-[family-name:var(--font-geist-mono)] text-[48px] font-[600] leading-none"
            >
              {primaryStat}
            </p>
            <p className={`${mutedClass} mt-1 text-[13px] font-[500]`}>
              {primaryLabel}
            </p>
          </div>
          <div className={sparklineColor}>
            <Sparkline data={sparklineData} />
          </div>
        </div>

        {/* Bottom stats + branding */}
        <div className="flex items-end justify-between">
          <div className="flex gap-6">
            {secondaryStats.map((stat) => (
              <div key={stat.label}>
                <p className="font-[family-name:var(--font-geist-mono)] text-[16px] font-[600]">
                  {stat.value}
                </p>
                <p className={`${mutedClass} text-[10px] font-[500]`}>
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
          <div className="text-right">
            <span className="text-[13px] font-[800] font-[family-name:var(--font-sora)]">
              <span className={variant === "dark" || variant === "brand" ? "text-text-on-dark" : "text-text"}>
                Burn
              </span>
              <span className={variant === "brand" ? "text-white/80" : "text-brand"}>
                log
              </span>
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}
