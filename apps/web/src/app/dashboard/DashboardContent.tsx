"use client";

import { useState, useEffect, useCallback } from "react";
import Header from "@/components/Header";
import StatCard from "@/components/StatCard";
import Heatmap from "@/components/Heatmap";
import BadgeDisplay from "@/components/BadgeDisplay";
import SkeletonLoader from "@/components/SkeletonLoader";
import type { DashboardData } from "@/lib/supabase/types";

type TimeRange = "7D" | "30D" | "90D" | "All";
type ViewState = "loading" | "empty" | "error" | "data";

function formatTokens(n: number): string {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return n.toString();
}

function formatCost(n: number): string {
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}K`;
  return `$${n.toFixed(2)}`;
}

function TrendChart({
  data,
}: {
  data: { date: string; tokens: number; cost: number }[];
}) {
  if (data.length === 0) return <div className="flex h-full items-center justify-center text-text-secondary">No trend data</div>;
  const maxTokens = Math.max(...data.map((d) => d.tokens));
  if (maxTokens === 0) return <div className="flex h-full items-center justify-center text-text-secondary">No trend data</div>;

  const points = data.map((d, i) => {
    const x = (i / Math.max(data.length - 1, 1)) * 100;
    const y = 100 - (d.tokens / maxTokens) * 100;
    return `${x},${y}`;
  });
  const linePath = `M ${points.join(" L ")}`;
  const areaPath = `${linePath} L 100,100 L 0,100 Z`;

  return (
    <div className="h-full w-full">
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="h-full w-full"
        aria-label="Usage trend over the selected period"
        role="img"
      >
        <defs>
          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2563EB" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#2563EB" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill="url(#areaGrad)" vectorEffect="non-scaling-stroke" />
        <path
          d={linePath}
          fill="none"
          stroke="#2563EB"
          strokeWidth="1.5"
          vectorEffect="non-scaling-stroke"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

function ModelDistribution({
  data,
}: {
  data: { model: string; tokens: number; cost: number; percentage: number }[];
}) {
  const colors = ["bg-blue-600", "bg-blue-500", "bg-blue-300", "bg-blue-200"];

  return (
    <div>
      <div
        className="flex h-[14px] w-full overflow-hidden rounded-full"
        role="img"
        aria-label="Model distribution"
      >
        {data.map((d, i) => (
          <div
            key={d.model}
            className={`${colors[i % colors.length]} ${i > 0 && i % 3 === 0 ? "hatched" : ""}`}
            style={{ width: `${d.percentage}%` }}
          />
        ))}
      </div>
      <div className="mt-4 flex flex-col gap-3">
        {data.map((d, i) => (
          <div key={d.model} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`h-[10px] w-[10px] rounded-[2px] ${colors[i % colors.length]}`} />
              <span className="text-[13px] font-[500] text-text-secondary">{d.model}</span>
            </div>
            <span className="font-[family-name:var(--font-geist-mono)] text-[13px] font-[600] text-text">
              {d.percentage}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function OnboardingEmpty() {
  return (
    <div className="rounded-[20px] border-2 border-dashed border-border bg-white px-8 py-16 text-center">
      <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-full bg-blue-50">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="m22 2-7 20-4-9-9-4Z" />
          <path d="M22 2 11 13" />
        </svg>
      </div>
      <h2 className="text-[28px] font-[700] text-text">Welcome to Burnlog!</h2>
      <p className="mt-2 text-[15px] text-text-secondary">Get started in 2 easy steps to see your AI usage data.</p>
      <div className="mx-auto mt-10 flex max-w-lg flex-col gap-6 text-left">
        {[
          { step: "1", title: "Sync your data", desc: "One command uploads your usage stats.", code: "npx burnlog sync" },
          { step: "2", title: "See your data", desc: "Your dashboard will light up with insights.", code: null },
        ].map((item) => (
          <div key={item.step} className="flex gap-4 rounded-[14px] border border-border bg-bg p-4">
            <div className="flex h-[32px] w-[32px] shrink-0 items-center justify-center rounded-full bg-brand text-[13px] font-[700] text-white">
              {item.step}
            </div>
            <div className="flex-1">
              <p className="text-[15px] font-[600] text-text">{item.title}</p>
              <p className="text-[13px] text-text-secondary">{item.desc}</p>
              {item.code && (
                <code className="mt-2 inline-block rounded-[8px] bg-card-dark px-3 py-1.5 font-[family-name:var(--font-jetbrains)] text-[12px] text-text-on-dark">
                  {item.code}
                </code>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ErrorBanner({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex items-center justify-between rounded-[14px] bg-error-bg px-6 py-4" role="alert">
      <div className="flex items-center gap-3">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        <span className="text-[15px] font-[500] text-error">Failed to load data. Please try again.</span>
      </div>
      <button
        onClick={onRetry}
        className="rounded-[50px] border border-error bg-white px-4 py-2 text-[13px] font-[600] text-error transition-colors duration-200 hover:bg-error hover:text-white"
      >
        Retry
      </button>
    </div>
  );
}

export default function DashboardContent() {
  const [timeRange, setTimeRange] = useState<TimeRange>("30D");
  const [viewState, setViewState] = useState<ViewState>("loading");
  const [data, setData] = useState<DashboardData | null>(null);
  const [userName, setUserName] = useState("there");
  const [userUsername, setUserUsername] = useState("me");

  const fetchDashboard = useCallback(async () => {
    setViewState("loading");
    try {
      const res = await fetch("/api/dashboard");
      if (res.status === 401) {
        window.location.href = "/login";
        return;
      }
      if (!res.ok) {
        setViewState("error");
        return;
      }
      const json: DashboardData = await res.json();
      if (json.totals.tokens === 0 && json.totals.days_active === 0) {
        setViewState("empty");
      } else {
        setData(json);
        setViewState("data");
      }
    } catch {
      setViewState("error");
    }
  }, []);

  useEffect(() => {
    fetchDashboard();

    // Get user info for greeting
    const { createBrowserClient } = require("@supabase/ssr");
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    supabase.auth.getUser().then(({ data: authData }: { data: { user: { user_metadata?: { full_name?: string; name?: string; preferred_username?: string; user_name?: string } } | null } }) => {
      const user = authData.user;
      if (user?.user_metadata) {
        setUserName(user.user_metadata.full_name || user.user_metadata.name || "there");
        setUserUsername(user.user_metadata.preferred_username || user.user_metadata.user_name || "me");
      }
    });
  }, [fetchDashboard]);

  const timeRanges: TimeRange[] = ["7D", "30D", "90D", "All"];

  const greeting = (() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  })();

  return (
    <>
      <Header />
      <main className="flex-1 px-6 py-8">
        <div className="mx-auto w-full max-w-[1200px]">
          {/* Loading state */}
          {viewState === "loading" && <SkeletonLoader />}

          {/* Empty state */}
          {viewState === "empty" && <OnboardingEmpty />}

          {/* Error state */}
          {viewState === "error" && (
            <div className="space-y-4">
              <ErrorBanner onRetry={fetchDashboard} />
              <SkeletonLoader />
            </div>
          )}

          {/* Data state */}
          {viewState === "data" && data && (
            <>
              {/* Greeting + time range */}
              <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <h1 className="text-[32px] font-[700] text-text">
                  {greeting}, {userName}
                </h1>
                <div className="flex items-center rounded-[50px] bg-white p-1 card-shadow">
                  {timeRanges.map((range) => (
                    <button
                      key={range}
                      onClick={() => setTimeRange(range)}
                      className={`rounded-[50px] px-4 py-2 text-[13px] font-[600] transition-all duration-200 ${
                        timeRange === range
                          ? "bg-brand text-white"
                          : "text-text-secondary hover:text-text"
                      }`}
                    >
                      {range}
                    </button>
                  ))}
                </div>
              </div>

              {/* Row 1: Stat Cards */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
                <StatCard
                  label="Total Tokens"
                  value={formatTokens(data.totals.tokens)}
                  variant="white"
                />
                <StatCard
                  label="API Cost"
                  value={formatCost(data.totals.cost)}
                  variant="dark"
                />
                <StatCard
                  label="ROI Multiplier"
                  value={`${data.totals.roi_multiplier}x`}
                  variant="accent"
                />
                <StatCard
                  label="Active Days"
                  value={data.totals.days_active.toString()}
                  variant="white"
                />
              </div>

              {/* Row 2: Charts */}
              <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
                <article className="card-shadow col-span-1 rounded-[20px] bg-card p-6 md:col-span-2">
                  <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-[13px] font-[600] tracking-wide text-text-secondary uppercase">
                      Usage Trend
                    </h2>
                    <span className="font-[family-name:var(--font-geist-mono)] text-[13px] font-[600] text-text">
                      Last 30 days
                    </span>
                  </div>
                  <div className="h-[200px]">
                    <TrendChart data={data.daily_trend} />
                  </div>
                </article>

                <article className="card-shadow rounded-[20px] bg-card p-6">
                  <h2 className="mb-4 text-[13px] font-[600] tracking-wide text-text-secondary uppercase">
                    Model Distribution
                  </h2>
                  <ModelDistribution data={data.model_distribution} />
                </article>
              </div>

              {/* Row 3: Heatmap + Badges + Share */}
              <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
                <article className="card-shadow col-span-1 rounded-[20px] bg-card p-6 md:col-span-2">
                  <h2 className="mb-4 text-[13px] font-[600] tracking-wide text-text-secondary uppercase">
                    365-Day Activity
                  </h2>
                  <div className="scrollbar-hide overflow-x-auto">
                    <div className="min-w-[700px]">
                      <Heatmap data={data.heatmap} />
                    </div>
                  </div>
                </article>

                <div className="flex flex-col gap-4">
                  <article className="card-shadow flex-1 rounded-[20px] bg-card p-6">
                    <h2 className="mb-4 text-[13px] font-[600] tracking-wide text-text-secondary uppercase">
                      Recent Badges
                    </h2>
                    <BadgeDisplay badges={data.badges} />
                  </article>

                  <article className="rounded-[20px] bg-card-dark p-6">
                    <h2 className="mb-3 text-[13px] font-[600] tracking-wide text-text-muted uppercase">
                      Share Your Stats
                    </h2>
                    <p className="mb-4 text-[15px] text-text-on-dark">
                      Generate a card and show off your AI usage.
                    </p>
                    <a
                      href={`/card/${userUsername}-roi_beast-month`}
                      className="inline-flex h-[44px] w-full items-center justify-center rounded-[50px] bg-brand text-[15px] font-[600] text-white transition-all duration-200 hover:bg-brand-hover hover:-translate-y-[2px]"
                    >
                      Create Share Card
                    </a>
                  </article>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </>
  );
}
