import type {
  Badge,
  DashboardData,
  PublicProfileData,
  ShareCardData,
} from "@/lib/supabase/types";

// Generate heatmap data for last 365 days
function generateHeatmapData(): { date: string; tokens: number }[] {
  const data: { date: string; tokens: number }[] = [];
  const today = new Date();
  for (let i = 364; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split("T")[0];
    // Weighted random: ~30% chance of no activity
    const rand = Math.random();
    let tokens = 0;
    if (rand > 0.3) {
      if (rand > 0.95) tokens = Math.floor(Math.random() * 500000) + 500000;
      else if (rand > 0.8)
        tokens = Math.floor(Math.random() * 300000) + 200000;
      else if (rand > 0.5)
        tokens = Math.floor(Math.random() * 150000) + 50000;
      else tokens = Math.floor(Math.random() * 50000) + 5000;
    }
    data.push({ date: dateStr, tokens });
  }
  return data;
}

// Generate daily trend for last 30 days
function generateDailyTrend(): {
  date: string;
  tokens: number;
  cost: number;
}[] {
  const data: { date: string; tokens: number; cost: number }[] = [];
  const today = new Date();
  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split("T")[0];
    const tokens = Math.floor(Math.random() * 400000) + 100000;
    const cost = tokens * 0.000015;
    data.push({ date: dateStr, tokens, cost });
  }
  return data;
}

export const MOCK_BADGES: Badge[] = [
  {
    type: "first_blood",
    name: "First Blood",
    description: "Upload your first data",
    icon: "zap",
    earned: true,
    earned_at: "2026-01-15T10:00:00Z",
  },
  {
    type: "token_whale",
    name: "Token Whale",
    description: "Reach 1M total tokens",
    icon: "fish",
    earned: true,
    earned_at: "2026-02-20T14:30:00Z",
  },
  {
    type: "penny_wise",
    name: "Penny Wise",
    description: "Achieve 5x ROI in a week",
    icon: "coins",
    earned: true,
    earned_at: "2026-03-01T09:00:00Z",
  },
  {
    type: "night_owl",
    name: "Night Owl",
    description: "Code with AI past midnight 10 times",
    icon: "moon",
    earned: false,
    progress: 0.6,
  },
  {
    type: "polyglot",
    name: "Polyglot",
    description: "Use 3+ different models",
    icon: "palette",
    earned: true,
    earned_at: "2026-02-28T16:00:00Z",
  },
  {
    type: "streak_master",
    name: "Streak Master",
    description: "Use AI for 7 consecutive days",
    icon: "flame",
    earned: true,
    earned_at: "2026-03-10T12:00:00Z",
  },
  {
    type: "sharing_is_caring",
    name: "Sharing is Caring",
    description: "Share your first card",
    icon: "send",
    earned: false,
    progress: 0,
  },
];

export const MOCK_DASHBOARD_DATA: DashboardData = {
  totals: {
    tokens: 12_847_293,
    cost: 192.71,
    days_active: 87,
    api_equivalent_cost: 1927.09,
    subscription_cost: 200,
    roi_multiplier: 9.6,
  },
  model_distribution: [
    { model: "Claude Sonnet 4", tokens: 6_423_647, cost: 96.35, percentage: 50 },
    {
      model: "Claude Opus 4",
      tokens: 3_854_188,
      cost: 57.81,
      percentage: 30,
    },
    {
      model: "Claude Haiku 3.5",
      tokens: 1_284_729,
      cost: 19.27,
      percentage: 10,
    },
    {
      model: "GPT-4o",
      tokens: 1_284_729,
      cost: 19.28,
      percentage: 10,
    },
  ],
  platform_distribution: [
    { platform: "Claude Code", tokens: 11_562_564, cost: 173.44 },
    { platform: "Codex", tokens: 1_284_729, cost: 19.27 },
  ],
  daily_trend: generateDailyTrend(),
  heatmap: generateHeatmapData(),
  active_hours_distribution: {
    "0": 1200,
    "1": 800,
    "2": 300,
    "3": 100,
    "4": 50,
    "5": 100,
    "6": 500,
    "7": 2000,
    "8": 5000,
    "9": 8000,
    "10": 12000,
    "11": 15000,
    "12": 10000,
    "13": 14000,
    "14": 16000,
    "15": 13000,
    "16": 11000,
    "17": 9000,
    "18": 7000,
    "19": 5000,
    "20": 4000,
    "21": 3000,
    "22": 2500,
    "23": 2000,
  },
  badges: MOCK_BADGES,
};

export const MOCK_PROFILE_DATA: PublicProfileData = {
  username: "williamchan",
  display_name: "William Chan",
  avatar_url: null,
  total_tokens: 12_847_293,
  total_cost: 192.71,
  days_active: 87,
  platforms_used: ["Claude Code", "Codex"],
  models_used: ["Claude Sonnet 4", "Claude Opus 4", "Claude Haiku 3.5", "GPT-4o"],
  first_date: "2025-12-20",
  last_date: "2026-03-20",
  heatmap: generateHeatmapData(),
  badges: MOCK_BADGES,
};

export const MOCK_SHARE_CARD: ShareCardData = {
  template: "roi_beast",
  username: "williamchan",
  period: "This Month",
  primary_stat: "9.6x",
  primary_label: "ROI Multiplier",
  secondary_stats: [
    { label: "Tokens Used", value: "12.8M" },
    { label: "API Cost Saved", value: "$1,734" },
    { label: "Active Days", value: "87" },
  ],
  sparkline_data: [30, 45, 60, 55, 70, 80, 75, 90, 85, 95, 88, 92],
  badges: MOCK_BADGES.filter((b) => b.earned),
};

export function formatTokens(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
}

export function formatCost(n: number): string {
  return `$${n.toFixed(2)}`;
}
