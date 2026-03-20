export interface Profile {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  subscription_plan: "pro" | "max_5x" | "max_20x";
  subscription_price: number;
  created_at: string;
  updated_at: string;
}

export interface DailyUsage {
  id: string;
  user_id: string;
  date: string;
  platform: "claude" | "codex";
  model: string;
  input_tokens: number;
  output_tokens: number;
  cache_creation_tokens: number;
  cache_read_tokens: number;
  total_tokens: number;
  total_cost: number;
  active_hours: Record<string, number>; // {"0": 0, "1": 500, ..., "23": 0}
  uploaded_at: string;
}

// Badge types
export type BadgeType =
  | "first_blood"
  | "token_whale"
  | "penny_wise"
  | "night_owl"
  | "polyglot"
  | "streak_master"
  | "sharing_is_caring";

export interface Badge {
  type: BadgeType;
  name: string;
  description: string;
  icon: string;
  earned: boolean;
  earned_at?: string;
  progress?: number; // 0-1, for partially earned badges
}

// CLI upload payload
export interface UploadPayload {
  platform: "claude" | "codex";
  daily: {
    date: string;
    modelBreakdowns: {
      modelName: string;
      inputTokens: number;
      outputTokens: number;
      cacheCreationTokens: number;
      cacheReadTokens: number;
      cost: number;
    }[];
  }[];
  activeHours: Record<string, Record<string, number>>; // {"2026-03-20": {"7": 5000, "8": 3000}}
}

// Dashboard aggregated data
export interface DashboardData {
  totals: {
    tokens: number;
    cost: number;
    days_active: number;
    api_equivalent_cost: number;
    subscription_cost: number;
    roi_multiplier: number;
  };
  model_distribution: { model: string; tokens: number; cost: number; percentage: number }[];
  platform_distribution: { platform: string; tokens: number; cost: number }[];
  daily_trend: { date: string; tokens: number; cost: number }[];
  heatmap: { date: string; tokens: number }[];
  active_hours_distribution: Record<string, number>; // aggregated across all days
  badges: Badge[];
}

// Public profile data
export interface PublicProfileData {
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  total_tokens: number;
  total_cost: number;
  days_active: number;
  platforms_used: string[];
  models_used: string[];
  first_date: string | null;
  last_date: string | null;
  heatmap: { date: string; tokens: number }[];
  badges: Badge[];
}

// Share card types
export type CardTemplate =
  | "token_counter"
  | "money_saved"
  | "roi_beast"
  | "full_stats"
  | "model_mix";

export interface ShareCardData {
  template: CardTemplate;
  username: string;
  avatar_url?: string;
  period: string; // "This Week" | "This Month" | "All Time"
  primary_stat: string; // The big number
  primary_label: string;
  secondary_stats?: { label: string; value: string }[];
  sparkline_data?: number[];
  model_distribution?: { model: string; percentage: number; color: string }[];
  badges?: Badge[];
}

// Subscription pricing for ROI calculation
export const SUBSCRIPTION_PRICES: Record<string, number> = {
  pro: 20,
  max_5x: 100,
  max_20x: 200,
};
