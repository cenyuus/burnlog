import { createClient } from "@/lib/supabase/server";
import { calculateBadges } from "@/lib/badges";
import type { DailyUsage, PublicProfileData } from "@/lib/supabase/types";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await params;

    if (!username || username.length > 50) {
      return Response.json(
        { error: "Invalid username" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Call the public profile stats function (SECURITY DEFINER, bypasses RLS)
    const { data: stats, error: statsError } = await supabase.rpc(
      "get_public_profile_stats",
      { target_username: username }
    );

    if (statsError) {
      console.error("Profile stats error:", statsError);
      return Response.json(
        { error: "Failed to fetch profile" },
        { status: 500 }
      );
    }

    if (!stats) {
      return Response.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Call the public heatmap function
    const { data: heatmapData, error: heatmapError } = await supabase.rpc(
      "get_public_heatmap",
      { target_username: username, days_back: 365 }
    );

    if (heatmapError) {
      console.error("Heatmap error:", heatmapError);
      return Response.json(
        { error: "Failed to fetch heatmap data" },
        { status: 500 }
      );
    }

    const heatmap: { date: string; tokens: number }[] = Array.isArray(heatmapData)
      ? heatmapData
      : [];

    // Build minimal DailyUsage-like records from heatmap for badge calculation.
    // We don't have full model/active_hours info from the public functions,
    // so badges that depend on models or active_hours will be approximate.
    const pseudoUsage: DailyUsage[] = heatmap.map((h) => ({
      id: "",
      user_id: "",
      date: h.date,
      platform: "claude" as const,
      model: "unknown",
      input_tokens: 0,
      output_tokens: 0,
      cache_creation_tokens: 0,
      cache_read_tokens: 0,
      total_tokens: h.tokens,
      total_cost: 0,
      active_hours: {},
      uploaded_at: "",
    }));

    // For more accurate badges, use stats data to enrich
    // models_used gives us polyglot info
    const modelsUsed: string[] = stats.models_used || [];
    if (modelsUsed.length > 0 && pseudoUsage.length > 0) {
      // Distribute models across records for badge calculation
      modelsUsed.forEach((model, i) => {
        const idx = i % pseudoUsage.length;
        pseudoUsage[idx].model = model;
      });
    }

    const badges = calculateBadges(pseudoUsage);

    const profileData: PublicProfileData = {
      username: stats.username,
      display_name: stats.display_name,
      avatar_url: stats.avatar_url,
      total_tokens: Number(stats.total_tokens) || 0,
      total_cost: Number(stats.total_cost) || 0,
      days_active: Number(stats.days_active) || 0,
      platforms_used: stats.platforms_used || [],
      models_used: modelsUsed,
      first_date: stats.first_date || null,
      last_date: stats.last_date || null,
      heatmap,
      badges,
    };

    return Response.json(profileData);
  } catch (error) {
    console.error("Profile error:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
