import type { Badge, BadgeType, DailyUsage } from "@/lib/supabase/types";

interface BadgeDefinition {
  type: BadgeType;
  name: string;
  description: string;
  icon: string;
  check: (data: DailyUsage[], subscriptionPrice?: number) => { earned: boolean; progress: number };
}

const BADGE_DEFINITIONS: BadgeDefinition[] = [
  {
    type: "first_blood",
    name: "First Blood",
    description: "Upload your first usage data",
    icon: "\u26A1",
    check: (data) => ({
      earned: data.length > 0,
      progress: data.length > 0 ? 1 : 0,
    }),
  },
  {
    type: "token_whale",
    name: "Token Whale",
    description: "Burn 1,000,000 tokens total",
    icon: "\uD83D\uDC33",
    check: (data) => {
      const total = data.reduce((sum, d) => sum + d.total_tokens, 0);
      return {
        earned: total >= 1_000_000,
        progress: Math.min(total / 1_000_000, 1),
      };
    },
  },
  {
    type: "penny_wise",
    name: "Penny Wise",
    description: "Achieve 5x ROI in a single week",
    icon: "\uD83E\uDE99",
    check: (data, subscriptionPrice = 20) => {
      // Group by ISO week
      const weeklyGroups = groupByWeek(data);
      let maxRoi = 0;

      for (const weekData of Object.values(weeklyGroups)) {
        const weeklyCost = weekData.reduce((sum, d) => sum + d.total_cost, 0);
        if (weeklyCost > 0) {
          // Weekly subscription cost = monthly / 4.33
          const weeklySubscription = subscriptionPrice / 4.33;
          const roi = weeklyCost / weeklySubscription;
          maxRoi = Math.max(maxRoi, roi);
        }
      }

      return {
        earned: maxRoi >= 5,
        progress: Math.min(maxRoi / 5, 1),
      };
    },
  },
  {
    type: "night_owl",
    name: "Night Owl",
    description: "10+ hours of activity between midnight and 5am",
    icon: "\uD83E\uDD89",
    check: (data) => {
      let nightHoursCount = 0;

      for (const record of data) {
        const hours = record.active_hours || {};
        for (let h = 0; h <= 5; h++) {
          const key = String(h);
          if (hours[key] && hours[key] > 0) {
            nightHoursCount++;
          }
        }
      }

      return {
        earned: nightHoursCount >= 10,
        progress: Math.min(nightHoursCount / 10, 1),
      };
    },
  },
  {
    type: "polyglot",
    name: "Polyglot",
    description: "Use 3+ different AI models",
    icon: "\uD83C\uDFA8",
    check: (data) => {
      const models = new Set(data.map((d) => d.model));
      return {
        earned: models.size >= 3,
        progress: Math.min(models.size / 3, 1),
      };
    },
  },
  {
    type: "streak_master",
    name: "Streak Master",
    description: "7+ consecutive days of usage",
    icon: "\uD83D\uDD25",
    check: (data) => {
      const dates = [...new Set(data.map((d) => d.date))].sort();
      let maxStreak = 0;
      let currentStreak = 1;

      for (let i = 1; i < dates.length; i++) {
        const prev = new Date(dates[i - 1]);
        const curr = new Date(dates[i]);
        const diffMs = curr.getTime() - prev.getTime();
        const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
          currentStreak++;
        } else {
          maxStreak = Math.max(maxStreak, currentStreak);
          currentStreak = 1;
        }
      }
      maxStreak = Math.max(maxStreak, currentStreak);

      // Handle edge case: single date
      if (dates.length === 1) maxStreak = 1;
      if (dates.length === 0) maxStreak = 0;

      return {
        earned: maxStreak >= 7,
        progress: Math.min(maxStreak / 7, 1),
      };
    },
  },
  {
    type: "sharing_is_caring",
    name: "Sharing is Caring",
    description: "Share your first card",
    icon: "\u2708\uFE0F",
    check: () => ({
      earned: false,
      progress: 0,
    }),
  },
];

function groupByWeek(data: DailyUsage[]): Record<string, DailyUsage[]> {
  const groups: Record<string, DailyUsage[]> = {};

  for (const record of data) {
    const date = new Date(record.date);
    // Get ISO week: year + week number
    const year = date.getFullYear();
    const jan1 = new Date(year, 0, 1);
    const dayOfYear = Math.ceil(
      (date.getTime() - jan1.getTime()) / (1000 * 60 * 60 * 24)
    );
    const weekNum = Math.ceil((dayOfYear + jan1.getDay()) / 7);
    const weekKey = `${year}-W${weekNum}`;

    if (!groups[weekKey]) groups[weekKey] = [];
    groups[weekKey].push(record);
  }

  return groups;
}

/**
 * Calculate all badges from usage data.
 * Pure function: DailyUsage[] -> Badge[]
 */
export function calculateBadges(
  data: DailyUsage[],
  subscriptionPrice?: number
): Badge[] {
  return BADGE_DEFINITIONS.map((def) => {
    const result = def.check(data, subscriptionPrice);
    return {
      type: def.type,
      name: def.name,
      description: def.description,
      icon: def.icon,
      earned: result.earned,
      progress: result.progress,
      ...(result.earned ? { earned_at: new Date().toISOString() } : {}),
    };
  });
}
