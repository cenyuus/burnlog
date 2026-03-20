import type { Metadata } from "next";
import Header from "@/components/Header";
import Heatmap from "@/components/Heatmap";
import BadgeDisplay from "@/components/BadgeDisplay";
import ShareCardPreview from "@/components/ShareCardPreview";
import type { PublicProfileData } from "@/lib/supabase/types";

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

async function getProfileData(username: string): Promise<PublicProfileData | null> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://web-one-lac-12.vercel.app";
  try {
    const res = await fetch(`${appUrl}/api/profile/${username}`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function generateMetadata(
  props: PageProps<"/u/[username]">
): Promise<Metadata> {
  const { username } = await props.params;
  return {
    title: `@${username} — Burnlog`,
    description: `See ${username}'s AI coding usage stats, heatmap, and badges on Burnlog.`,
    openGraph: {
      title: `@${username} — Burnlog`,
      description: `See ${username}'s AI coding usage stats on Burnlog.`,
      type: "profile",
      url: `https://burnlog.dev/u/${username}`,
    },
    twitter: {
      card: "summary_large_image",
      title: `@${username} — Burnlog`,
      description: `See ${username}'s AI coding usage stats on Burnlog.`,
    },
  };
}

export default async function ProfilePage(
  props: PageProps<"/u/[username]">
) {
  const { username } = await props.params;
  const data = await getProfileData(username);

  if (!data) {
    return (
      <>
        <Header />
        <main className="flex min-h-[60vh] items-center justify-center px-6 py-8">
          <div className="text-center">
            <h1 className="text-[28px] font-[700] text-text">User not found</h1>
            <p className="mt-2 text-[15px] text-text-secondary">
              @{username} hasn&apos;t joined Burnlog yet.
            </p>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="flex-1 px-6 py-8">
        <div className="mx-auto w-full max-w-[1200px]">
          {/* Profile header */}
          <section className="mb-8">
            <div className="flex flex-col items-center gap-6 md:flex-row md:items-start">
              {data.avatar_url ? (
                <img
                  src={data.avatar_url}
                  alt=""
                  className="h-[80px] w-[80px] shrink-0 rounded-full"
                />
              ) : (
                <div className="flex h-[80px] w-[80px] shrink-0 items-center justify-center rounded-full bg-blue-100 text-[32px] font-[700] text-brand">
                  {(data.display_name || username).charAt(0).toUpperCase()}
                </div>
              )}

              <div className="flex-1 text-center md:text-left">
                <h1 className="text-[32px] font-[700] text-text">
                  {data.display_name || username}
                </h1>
                <p className="text-[15px] text-text-secondary">@{username}</p>

                <div className="mt-4 flex flex-wrap justify-center gap-8 md:justify-start">
                  <div>
                    <p className="font-[family-name:var(--font-geist-mono)] text-[24px] font-[600] text-text">
                      {formatTokens(data.total_tokens)}
                    </p>
                    <p className="text-[12px] font-[600] tracking-wide text-text-secondary uppercase">
                      Total Tokens
                    </p>
                  </div>
                  <div>
                    <p className="font-[family-name:var(--font-geist-mono)] text-[24px] font-[600] text-text">
                      {formatCost(data.total_cost)}
                    </p>
                    <p className="text-[12px] font-[600] tracking-wide text-text-secondary uppercase">
                      API Cost
                    </p>
                  </div>
                  <div>
                    <p className="font-[family-name:var(--font-geist-mono)] text-[24px] font-[600] text-text">
                      {data.days_active}
                    </p>
                    <p className="text-[12px] font-[600] tracking-wide text-text-secondary uppercase">
                      Active Days
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Heatmap */}
          {data.heatmap && data.heatmap.length > 0 && (
            <section className="mb-4">
              <article className="card-shadow rounded-[20px] bg-card p-6">
                <h2 className="mb-4 text-[13px] font-[600] tracking-wide text-text-secondary uppercase">
                  Activity
                </h2>
                <div className="scrollbar-hide overflow-x-auto">
                  <div className="min-w-[700px]">
                    <Heatmap data={data.heatmap} />
                  </div>
                </div>
              </article>
            </section>
          )}

          {/* Badges + Share cards */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <section className="md:col-span-2">
              <article className="card-shadow rounded-[20px] bg-card p-6">
                <h2 className="mb-4 text-[13px] font-[600] tracking-wide text-text-secondary uppercase">
                  Badges
                </h2>
                <BadgeDisplay badges={data.badges} />
              </article>
            </section>

            <section>
              <article className="rounded-[20px] bg-card p-4 card-shadow">
                <h2 className="mb-3 px-2 text-[13px] font-[600] tracking-wide text-text-secondary uppercase">
                  Latest Card
                </h2>
                <ShareCardPreview variant="dark" username={username} />
              </article>
            </section>
          </div>

          {/* Platforms & models */}
          {((data.platforms_used && data.platforms_used.length > 0) || (data.models_used && data.models_used.length > 0)) && (
            <section className="mt-4">
              <article className="card-shadow rounded-[20px] bg-card p-6">
                <h2 className="mb-4 text-[13px] font-[600] tracking-wide text-text-secondary uppercase">
                  Tools Used
                </h2>
                <div className="flex flex-wrap gap-2">
                  {data.platforms_used.map((platform) => (
                    <span
                      key={platform}
                      className="rounded-[50px] bg-blue-100 px-[14px] py-[6px] text-[12px] font-[600] text-brand"
                    >
                      {platform}
                    </span>
                  ))}
                  {data.models_used.map((model) => (
                    <span
                      key={model}
                      className="rounded-[50px] bg-bg px-[14px] py-[6px] text-[12px] font-[600] text-text-secondary"
                    >
                      {model}
                    </span>
                  ))}
                </div>
              </article>
            </section>
          )}
        </div>
      </main>
    </>
  );
}
