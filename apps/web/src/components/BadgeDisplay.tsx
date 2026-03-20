import type { Badge } from "@/lib/supabase/types";

interface BadgeDisplayProps {
  badges: Badge[];
}

const BADGE_STYLES: Record<string, { bg: string; text: string; icon: string }> =
  {
    first_blood: {
      bg: "bg-pastel-orange",
      text: "text-[#92400E]",
      icon: "zap",
    },
    token_whale: {
      bg: "bg-pastel-blue",
      text: "text-[#1E40AF]",
      icon: "fish",
    },
    penny_wise: {
      bg: "bg-pastel-green",
      text: "text-[#065F46]",
      icon: "coins",
    },
    night_owl: {
      bg: "bg-pastel-purple",
      text: "text-[#5B21B6]",
      icon: "moon",
    },
    polyglot: {
      bg: "bg-pastel-pink",
      text: "text-[#9D174D]",
      icon: "palette",
    },
    streak_master: {
      bg: "bg-pastel-orange",
      text: "text-[#92400E]",
      icon: "flame",
    },
    sharing_is_caring: {
      bg: "bg-pastel-blue",
      text: "text-[#1E40AF]",
      icon: "send",
    },
  };

const BADGE_ICONS: Record<string, React.ReactNode> = {
  zap: (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  ),
  fish: (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6.5 12c.94-3.46 4.94-6 8.5-6 3.56 0 6.06 2.54 7 6-.94 3.46-3.44 6-7 6-3.56 0-7.56-2.54-8.5-6Z" />
      <path d="M18 12v.5" />
      <path d="M16 17.93a9.77 9.77 0 0 1 0-11.86" />
      <path d="M7 10.67C7 8 5.58 5.97 2.73 5.5c-1 1.5-1 5 .23 6.5-1.24 1.5-1.24 5 .23 6.5C5.58 18.03 7 16 7 13.33" />
    </svg>
  ),
  coins: (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="8" cy="8" r="6" />
      <path d="M18.09 10.37A6 6 0 1 1 10.34 18" />
      <path d="M7 6h1v4" />
    </svg>
  ),
  moon: (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
    </svg>
  ),
  palette: (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="13.5" cy="6.5" r=".5" fill="currentColor" />
      <circle cx="17.5" cy="10.5" r=".5" fill="currentColor" />
      <circle cx="8.5" cy="7.5" r=".5" fill="currentColor" />
      <circle cx="6.5" cy="12.5" r=".5" fill="currentColor" />
      <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2Z" />
    </svg>
  ),
  flame: (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
    </svg>
  ),
  send: (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m22 2-7 20-4-9-9-4Z" />
      <path d="M22 2 11 13" />
    </svg>
  ),
};

export default function BadgeDisplay({ badges }: BadgeDisplayProps) {
  return (
    <div className="flex flex-wrap gap-2" role="list" aria-label="Achievement badges">
      {badges.map((badge) => {
        const style = BADGE_STYLES[badge.type] || {
          bg: "bg-pastel-blue",
          text: "text-[#1E40AF]",
          icon: "zap",
        };

        if (!badge.earned) {
          return (
            <div
              key={badge.type}
              className="flex items-center gap-1.5 rounded-[50px] border border-border bg-white/50 px-[14px] py-[6px]"
              role="listitem"
              aria-label={`${badge.name} - not yet earned`}
            >
              <span className="text-text-muted" aria-hidden="true">
                {BADGE_ICONS[style.icon]}
              </span>
              <span className="text-[12px] font-[600] text-text-muted blur-[3px] select-none">
                {badge.name}
              </span>
            </div>
          );
        }

        return (
          <div
            key={badge.type}
            className={`flex items-center gap-1.5 rounded-[50px] ${style.bg} px-[14px] py-[6px]`}
            role="listitem"
            aria-label={`${badge.name} - earned`}
          >
            <span className={style.text} aria-hidden="true">
              {BADGE_ICONS[style.icon]}
            </span>
            <span className={`text-[12px] font-[600] ${style.text}`}>
              {badge.name}
            </span>
          </div>
        );
      })}
    </div>
  );
}
