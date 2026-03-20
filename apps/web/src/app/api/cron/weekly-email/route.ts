import { createServiceClient } from "@/lib/supabase/server";
import { sendWeeklyEmail } from "@/lib/email";
import { SUBSCRIPTION_PRICES } from "@/lib/supabase/types";

export const dynamic = "force-dynamic";
export const maxDuration = 300; // 5 minutes for processing all users

export async function POST(request: Request) {
  try {
    // Verify CRON_SECRET
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      return Response.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const supabase = createServiceClient();

    // Find users with data in the last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const sevenDaysAgoStr = sevenDaysAgo.toISOString().slice(0, 10);

    // Get distinct user IDs with recent activity
    const { data: activeUserIds, error: userError } = await supabase
      .from("daily_usage")
      .select("user_id")
      .gte("date", sevenDaysAgoStr);

    if (userError) {
      console.error("Failed to query active users:", userError);
      return Response.json(
        { error: "Failed to query active users" },
        { status: 500 }
      );
    }

    // Deduplicate user IDs
    const uniqueUserIds = [...new Set((activeUserIds || []).map((r) => r.user_id))];

    if (uniqueUserIds.length === 0) {
      return Response.json({
        success: true,
        message: "No active users in the last 7 days",
        sent: 0,
      });
    }

    let sent = 0;
    let failed = 0;
    const errors: string[] = [];

    for (const userId of uniqueUserIds) {
      try {
        // Get profile info
        const { data: profile } = await supabase
          .from("profiles")
          .select("username, display_name, subscription_plan, subscription_price")
          .eq("id", userId)
          .single();

        if (!profile) continue;

        // Get user's email from auth
        const {
          data: { user },
        } = await supabase.auth.admin.getUserById(userId);

        if (!user?.email) continue;

        // Get weekly usage data
        const { data: weeklyUsage } = await supabase
          .from("daily_usage")
          .select("total_tokens, total_cost, model, date")
          .eq("user_id", userId)
          .gte("date", sevenDaysAgoStr);

        if (!weeklyUsage || weeklyUsage.length === 0) continue;

        const totalTokens = weeklyUsage.reduce(
          (sum, d) => sum + Number(d.total_tokens),
          0
        );
        const totalCost = weeklyUsage.reduce(
          (sum, d) => sum + Number(d.total_cost),
          0
        );
        const daysActive = new Set(weeklyUsage.map((d) => d.date)).size;

        // Find top model
        const modelCounts = new Map<string, number>();
        for (const d of weeklyUsage) {
          modelCounts.set(
            d.model,
            (modelCounts.get(d.model) || 0) + Number(d.total_tokens)
          );
        }
        const topModel =
          modelCounts.size > 0
            ? [...modelCounts.entries()].sort((a, b) => b[1] - a[1])[0][0]
            : null;

        const subscriptionPrice =
          profile.subscription_price ??
          SUBSCRIPTION_PRICES[profile.subscription_plan ?? "pro"] ??
          20;

        // Weekly subscription cost = monthly / 4.33
        const weeklySubCost = Number(subscriptionPrice) / 4.33;
        const roiMultiplier =
          weeklySubCost > 0 ? totalCost / weeklySubCost : 0;

        await sendWeeklyEmail({
          to: user.email,
          username: profile.username,
          displayName: profile.display_name,
          totalTokens,
          totalCost,
          daysActive,
          topModel,
          roiMultiplier,
          subscriptionPrice: Number(subscriptionPrice),
        });

        sent++;
      } catch (err) {
        failed++;
        const message = err instanceof Error ? err.message : String(err);
        errors.push(`User ${userId}: ${message}`);
        console.error(`Failed to process user ${userId}:`, err);
      }
    }

    return Response.json({
      success: true,
      total_users: uniqueUserIds.length,
      sent,
      failed,
      ...(errors.length > 0 ? { errors } : {}),
    });
  } catch (error) {
    console.error("Cron job error:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
