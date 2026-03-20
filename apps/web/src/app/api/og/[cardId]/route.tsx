import { ImageResponse } from "@vercel/og";
import { createServiceClient } from "@/lib/supabase/server";
import type { CardTemplate } from "@/lib/supabase/types";
import { SUBSCRIPTION_PRICES } from "@/lib/supabase/types";

export const dynamic = "force-dynamic";

// Card dimensions for OG images
const WIDTH = 1200;
const HEIGHT = 630;

// Design tokens from DESIGN.md
const COLORS = {
  bg: "#1A1A1A",
  textPrimary: "#F9FAFB",
  textMuted: "#9CA3AF",
  brandBlue: "#2563EB",
  brandBlueLight: "#3B82F6",
  border: "rgba(255,255,255,0.1)",
};

// Parse cardId format: "{username}-{template}-{period}"
function parseCardId(cardId: string): {
  username: string;
  template: CardTemplate;
  period: string;
} | null {
  const validTemplates: CardTemplate[] = [
    "token_counter",
    "money_saved",
    "roi_beast",
    "full_stats",
    "model_mix",
  ];
  const validPeriods = ["week", "month", "all"];

  // Try to parse from the end since username could contain hyphens.
  // Template names use underscores but are URL-encoded with hyphens,
  // so we need to try both formats.
  const parts = cardId.split("-");
  if (parts.length < 3) return null;

  const period = parts[parts.length - 1];

  // Template could be two words joined by hyphen in the URL
  // e.g. "token-counter" -> "token_counter"
  const templateCandidates = [
    parts.slice(-3, -1).join("_"), // e.g., "token_counter"
    parts[parts.length - 2],       // single-word template
  ];

  let template: CardTemplate | null = null;
  let usernameEndIdx = parts.length - 2;

  for (const candidate of templateCandidates) {
    if (validTemplates.includes(candidate as CardTemplate)) {
      template = candidate as CardTemplate;
      if (candidate.includes("_")) {
        usernameEndIdx = parts.length - 3;
      }
      break;
    }
  }

  if (!template || !validPeriods.includes(period)) return null;

  const username = parts.slice(0, usernameEndIdx).join("-");
  if (!username) return null;

  return { username, template, period };
}

function formatTokens(n: number): string {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

function formatCost(n: number): string {
  return `$${n.toFixed(2)}`;
}

function getPeriodLabel(period: string): string {
  switch (period) {
    case "week":
      return "This Week";
    case "month":
      return "This Month";
    case "all":
      return "All Time";
    default:
      return "All Time";
  }
}

function getPeriodFilter(period: string): string {
  const now = new Date();
  switch (period) {
    case "week": {
      const weekAgo = new Date(now);
      weekAgo.setDate(weekAgo.getDate() - 7);
      return weekAgo.toISOString().slice(0, 10);
    }
    case "month": {
      return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
    }
    case "all":
    default:
      return "1970-01-01";
  }
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ cardId: string }> }
) {
  try {
    const { cardId } = await params;
    const parsed = parseCardId(cardId);

    if (!parsed) {
      return Response.json(
        { error: "Invalid card ID format. Expected: {username}-{template}-{period}" },
        { status: 400 }
      );
    }

    const { username, template, period } = parsed;
    const supabase = createServiceClient();

    // Get profile
    const { data: profileRow } = await supabase
      .from("profiles")
      .select("id, avatar_url, subscription_plan")
      .eq("username", username)
      .single();

    if (!profileRow) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    // Get filtered usage data for the period
    const startDate = getPeriodFilter(period);

    const { data: periodUsage } = await supabase
      .from("daily_usage")
      .select("total_tokens, total_cost, model, date")
      .eq("user_id", profileRow.id)
      .gte("date", startDate);

    const usageData = periodUsage || [];
    const periodTokens = usageData.reduce(
      (sum, d) => sum + Number(d.total_tokens),
      0
    );
    const periodCost = usageData.reduce(
      (sum, d) => sum + Number(d.total_cost),
      0
    );

    // Model distribution for this period
    const modelMap = new Map<string, number>();
    for (const d of usageData) {
      modelMap.set(d.model, (modelMap.get(d.model) || 0) + Number(d.total_tokens));
    }
    const modelDist = [...modelMap.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    // Subscription price
    const subPrice = SUBSCRIPTION_PRICES[profileRow.subscription_plan] ?? 20;
    const periodLabel = getPeriodLabel(period);

    // Build card content based on template
    let primaryStat = "";
    let primaryLabel = "";
    let secondaryStats: { label: string; value: string }[] = [];

    switch (template) {
      case "token_counter":
        primaryStat = formatTokens(periodTokens);
        primaryLabel = "Tokens Burned";
        secondaryStats = [
          { label: "API Cost", value: formatCost(periodCost) },
          { label: "Days Active", value: String(new Set(usageData.map((d) => d.date)).size) },
        ];
        break;

      case "money_saved":
        primaryStat = formatCost(periodCost - subPrice);
        primaryLabel = "Worth of API Calls";
        secondaryStats = [
          { label: "API Equivalent", value: formatCost(periodCost) },
          { label: "You Paid", value: formatCost(subPrice) },
        ];
        break;

      case "roi_beast": {
        const roi = periodCost > 0 ? periodCost / subPrice : 0;
        primaryStat = `${roi.toFixed(1)}x`;
        primaryLabel = "ROI Multiplier";
        secondaryStats = [
          { label: "API Value", value: formatCost(periodCost) },
          { label: "Subscription", value: formatCost(subPrice) },
        ];
        break;
      }

      case "full_stats":
        primaryStat = formatTokens(periodTokens);
        primaryLabel = "Total Tokens";
        secondaryStats = [
          { label: "Cost", value: formatCost(periodCost) },
          { label: "Models", value: String(modelDist.length) },
          { label: "Days", value: String(new Set(usageData.map((d) => d.date)).size) },
        ];
        break;

      case "model_mix":
        primaryStat = String(modelDist.length);
        primaryLabel = "Models Used";
        secondaryStats = modelDist.slice(0, 3).map(([model, tokens]) => ({
          label: model,
          value: formatTokens(tokens),
        }));
        break;
    }

    // Generate OG image
    const imageResponse = new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            backgroundColor: COLORS.bg,
            padding: "48px 60px",
            fontFamily: "sans-serif",
          }}
        >
          {/* Header: Avatar + Username + Period */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              {profileRow.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={profileRow.avatar_url}
                  width={48}
                  height={48}
                  style={{ borderRadius: "50%" }}
                  alt=""
                />
              ) : (
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: "50%",
                    backgroundColor: COLORS.brandBlue,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: COLORS.textPrimary,
                    fontSize: 20,
                    fontWeight: 700,
                  }}
                >
                  {username[0]?.toUpperCase() ?? "?"}
                </div>
              )}
              <span
                style={{
                  color: COLORS.textPrimary,
                  fontSize: 20,
                  fontWeight: 600,
                }}
              >
                @{username}
              </span>
            </div>
            {/* Period badge */}
            <div
              style={{
                backgroundColor: "rgba(37,99,235,0.15)",
                color: COLORS.brandBlueLight,
                fontSize: 14,
                fontWeight: 600,
                padding: "6px 16px",
                borderRadius: 50,
              }}
            >
              {periodLabel}
            </div>
          </div>

          {/* Main stat */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              flex: 1,
              gap: "8px",
            }}
          >
            <span
              style={{
                color: COLORS.textPrimary,
                fontSize: 96,
                fontWeight: 700,
                letterSpacing: "-2px",
                lineHeight: 1,
              }}
            >
              {primaryStat}
            </span>
            <span
              style={{
                color: COLORS.textMuted,
                fontSize: 20,
                fontWeight: 500,
                textTransform: "uppercase",
                letterSpacing: "2px",
              }}
            >
              {primaryLabel}
            </span>
          </div>

          {/* Secondary stats row */}
          {secondaryStats.length > 0 && (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: "48px",
                marginBottom: "16px",
              }}
            >
              {secondaryStats.map((stat) => (
                <div
                  key={stat.label}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "4px",
                  }}
                >
                  <span
                    style={{
                      color: COLORS.textPrimary,
                      fontSize: 24,
                      fontWeight: 600,
                    }}
                  >
                    {stat.value}
                  </span>
                  <span
                    style={{
                      color: COLORS.textMuted,
                      fontSize: 13,
                      fontWeight: 500,
                      textTransform: "uppercase",
                      letterSpacing: "1px",
                    }}
                  >
                    {stat.label}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Footer: BURNLOG.DEV branding */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              borderTop: `1px solid ${COLORS.border}`,
              paddingTop: "16px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0px" }}>
              <span
                style={{
                  color: COLORS.textPrimary,
                  fontSize: 18,
                  fontWeight: 800,
                }}
              >
                BURN
              </span>
              <span
                style={{
                  color: COLORS.brandBlue,
                  fontSize: 18,
                  fontWeight: 800,
                }}
              >
                LOG
              </span>
              <span
                style={{
                  color: COLORS.textMuted,
                  fontSize: 18,
                  fontWeight: 800,
                }}
              >
                .DEV
              </span>
            </div>
            <span
              style={{
                color: COLORS.textMuted,
                fontSize: 14,
                fontWeight: 500,
              }}
            >
              burnlog.dev/u/{username}
            </span>
          </div>
        </div>
      ),
      {
        width: WIDTH,
        height: HEIGHT,
      }
    );

    // Return with CDN cache headers
    return new Response(imageResponse.body, {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control":
          "public, max-age=3600, s-maxage=86400, stale-while-revalidate=43200",
      },
    });
  } catch (error) {
    console.error("OG image error:", error);
    return Response.json(
      { error: "Failed to generate image" },
      { status: 500 }
    );
  }
}
