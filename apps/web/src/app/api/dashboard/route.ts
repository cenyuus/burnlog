import { createClient } from "@/lib/supabase/server";
import { calculateBadges } from "@/lib/badges";
import type { DailyUsage, DashboardData } from "@/lib/supabase/types";
import { SUBSCRIPTION_PRICES } from "@/lib/supabase/types";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = await createClient();

    // Verify auth
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user profile for subscription info
    const { data: profile } = await supabase
      .from("profiles")
      .select("subscription_plan, subscription_price")
      .eq("id", user.id)
      .single();

    const subscriptionPrice =
      profile?.subscription_price ??
      SUBSCRIPTION_PRICES[profile?.subscription_plan ?? "pro"] ??
      20;

    // Fetch all usage data for the user
    const { data: allUsage, error: usageError } = await supabase
      .from("daily_usage")
      .select("*")
      .eq("user_id", user.id)
      .order("date", { ascending: true });

    if (usageError) {
      console.error("Usage query error:", usageError);
      return Response.json(
        { error: "Failed to fetch usage data" },
        { status: 500 }
      );
    }

    const usage: DailyUsage[] = (allUsage || []) as DailyUsage[];

    // --- Aggregate totals ---
    const totalTokens = usage.reduce((sum, d) => sum + d.total_tokens, 0);
    const totalCost = usage.reduce((sum, d) => sum + d.total_cost, 0);
    const uniqueDates = new Set(usage.map((d) => d.date));
    const daysActive = uniqueDates.size;

    // Current month cost for ROI
    const now = new Date();
    const currentMonthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
    const currentMonthCost = usage
      .filter((d) => d.date >= currentMonthStart)
      .reduce((sum, d) => sum + d.total_cost, 0);
    const roiMultiplier =
      currentMonthCost > 0
        ? Math.round((currentMonthCost / subscriptionPrice) * 100) / 100
        : 0;

    // --- Model distribution ---
    const modelMap = new Map<string, { tokens: number; cost: number }>();
    for (const d of usage) {
      const existing = modelMap.get(d.model) || { tokens: 0, cost: 0 };
      existing.tokens += d.total_tokens;
      existing.cost += d.total_cost;
      modelMap.set(d.model, existing);
    }
    const modelDistribution = [...modelMap.entries()]
      .map(([model, stats]) => ({
        model,
        tokens: stats.tokens,
        cost: stats.cost,
        percentage: totalTokens > 0 ? Math.round((stats.tokens / totalTokens) * 10000) / 100 : 0,
      }))
      .sort((a, b) => b.tokens - a.tokens);

    // --- Platform distribution ---
    const platformMap = new Map<string, { tokens: number; cost: number }>();
    for (const d of usage) {
      const existing = platformMap.get(d.platform) || { tokens: 0, cost: 0 };
      existing.tokens += d.total_tokens;
      existing.cost += d.total_cost;
      platformMap.set(d.platform, existing);
    }
    const platformDistribution = [...platformMap.entries()].map(
      ([platform, stats]) => ({
        platform,
        tokens: stats.tokens,
        cost: stats.cost,
      })
    );

    // --- Daily trend (last 30 days) ---
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().slice(0, 10);

    const dailyTrendMap = new Map<string, { tokens: number; cost: number }>();
    for (const d of usage) {
      if (d.date >= thirtyDaysAgoStr) {
        const existing = dailyTrendMap.get(d.date) || { tokens: 0, cost: 0 };
        existing.tokens += d.total_tokens;
        existing.cost += d.total_cost;
        dailyTrendMap.set(d.date, existing);
      }
    }
    const dailyTrend = [...dailyTrendMap.entries()]
      .map(([date, stats]) => ({ date, tokens: stats.tokens, cost: stats.cost }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // --- Heatmap (365 days) ---
    const oneYearAgo = new Date();
    oneYearAgo.setDate(oneYearAgo.getDate() - 365);
    const oneYearAgoStr = oneYearAgo.toISOString().slice(0, 10);

    const heatmapMap = new Map<string, number>();
    for (const d of usage) {
      if (d.date >= oneYearAgoStr) {
        heatmapMap.set(d.date, (heatmapMap.get(d.date) || 0) + d.total_tokens);
      }
    }
    const heatmap = [...heatmapMap.entries()]
      .map(([date, tokens]) => ({ date, tokens }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // --- Active hours distribution (aggregated across all days) ---
    const activeHoursDistribution: Record<string, number> = {};
    for (const d of usage) {
      const hours = d.active_hours || {};
      for (const [hour, count] of Object.entries(hours)) {
        activeHoursDistribution[hour] =
          (activeHoursDistribution[hour] || 0) + (count as number);
      }
    }

    // --- Badges ---
    const badges = calculateBadges(usage, subscriptionPrice);

    const dashboardData: DashboardData = {
      totals: {
        tokens: totalTokens,
        cost: totalCost,
        days_active: daysActive,
        api_equivalent_cost: totalCost,
        subscription_cost: subscriptionPrice,
        roi_multiplier: roiMultiplier,
      },
      model_distribution: modelDistribution,
      platform_distribution: platformDistribution,
      daily_trend: dailyTrend,
      heatmap,
      active_hours_distribution: activeHoursDistribution,
      badges,
    };

    return Response.json(dashboardData);
  } catch (error) {
    console.error("Dashboard error:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
