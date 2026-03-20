import { createServerClient } from "@supabase/ssr";
import type { UploadPayload } from "@/lib/supabase/types";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    // Auth: Bearer token -> Supabase auth
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return Response.json(
        { error: "Missing or invalid Authorization header" },
        { status: 401 }
      );
    }

    const token = authHeader.slice(7);

    // Create a Supabase client with the user's access token
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return [];
          },
          setAll() {},
        },
        global: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      }
    );

    // Verify the token by getting the user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return Response.json(
        { error: "Invalid or expired token" },
        { status: 401 }
      );
    }

    // Parse body
    const body: UploadPayload = await request.json();

    // Validate payload
    if (!body.platform || !["claude", "codex"].includes(body.platform)) {
      return Response.json(
        { error: "Invalid platform. Must be 'claude' or 'codex'" },
        { status: 400 }
      );
    }

    if (!Array.isArray(body.daily) || body.daily.length === 0) {
      return Response.json(
        { error: "Missing or empty daily usage data" },
        { status: 400 }
      );
    }

    let inserted = 0;
    let updated = 0;

    for (const day of body.daily) {
      if (!day.date || !Array.isArray(day.modelBreakdowns)) continue;

      for (const model of day.modelBreakdowns) {
        const totalTokens =
          (model.inputTokens || 0) +
          (model.outputTokens || 0) +
          (model.cacheCreationTokens || 0) +
          (model.cacheReadTokens || 0);

        // Get active hours for this date
        const activeHours = body.activeHours?.[day.date] || {};

        // Check if record already exists
        const { data: existing } = await supabase
          .from("daily_usage")
          .select("id, active_hours")
          .eq("user_id", user.id)
          .eq("date", day.date)
          .eq("platform", body.platform)
          .eq("model", model.modelName)
          .maybeSingle();

        if (existing) {
          // Merge active_hours: add new values to existing
          const mergedHours: Record<string, number> = {
            ...(existing.active_hours as Record<string, number> || {}),
          };
          for (const [hour, tokens] of Object.entries(activeHours)) {
            mergedHours[hour] = (mergedHours[hour] || 0) + (tokens as number);
          }

          const { error } = await supabase
            .from("daily_usage")
            .update({
              input_tokens: model.inputTokens || 0,
              output_tokens: model.outputTokens || 0,
              cache_creation_tokens: model.cacheCreationTokens || 0,
              cache_read_tokens: model.cacheReadTokens || 0,
              total_tokens: totalTokens,
              total_cost: model.cost || 0,
              active_hours: mergedHours,
              uploaded_at: new Date().toISOString(),
            })
            .eq("id", existing.id);

          if (error) {
            console.error("Update error:", error);
            return Response.json(
              { error: `Failed to update record for ${day.date}/${model.modelName}: ${error.message}` },
              { status: 500 }
            );
          }
          updated++;
        } else {
          // Insert new record
          const { error } = await supabase.from("daily_usage").insert({
            user_id: user.id,
            date: day.date,
            platform: body.platform,
            model: model.modelName,
            input_tokens: model.inputTokens || 0,
            output_tokens: model.outputTokens || 0,
            cache_creation_tokens: model.cacheCreationTokens || 0,
            cache_read_tokens: model.cacheReadTokens || 0,
            total_tokens: totalTokens,
            total_cost: model.cost || 0,
            active_hours: activeHours,
          });

          if (error) {
            console.error("Insert error:", error);
            return Response.json(
              { error: `Failed to insert record for ${day.date}/${model.modelName}: ${error.message}` },
              { status: 500 }
            );
          }
          inserted++;
        }
      }
    }

    return Response.json({ success: true, inserted, updated });
  } catch (error) {
    console.error("Upload error:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
