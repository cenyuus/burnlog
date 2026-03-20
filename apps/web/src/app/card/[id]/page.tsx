import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import ShareCardPreview from "@/components/ShareCardPreview";
import { MOCK_SHARE_CARD } from "@/lib/mock-data";

export async function generateMetadata(
  props: PageProps<"/card/[id]">
): Promise<Metadata> {
  const { id } = await props.params;
  const card = MOCK_SHARE_CARD;
  return {
    title: `${card.primary_stat} ${card.primary_label} — @${card.username}`,
    description: `${card.username}'s AI usage card on Burnlog: ${card.primary_stat} ${card.primary_label}`,
    openGraph: {
      title: `${card.primary_stat} ${card.primary_label} — @${card.username}`,
      description: `See ${card.username}'s AI usage stats on Burnlog.`,
      type: "article",
      url: `https://burnlog.dev/card/${id}`,
      images: [`https://burnlog.dev/api/og/${id}`],
    },
    twitter: {
      card: "summary_large_image",
      title: `${card.primary_stat} ${card.primary_label} — @${card.username}`,
      description: `See ${card.username}'s AI usage stats on Burnlog.`,
      images: [`https://burnlog.dev/api/og/${id}`],
    },
  };
}

export default async function ShareCardPage(
  props: PageProps<"/card/[id]">
) {
  const { id } = await props.params;
  const card = MOCK_SHARE_CARD;

  return (
    <>
      <Header />
      <main className="flex-1 px-6 py-8">
        <div className="mx-auto w-full max-w-[800px]">
          {/* Card preview (large) */}
          <section className="mb-8">
            <ShareCardPreview
              variant="dark"
              username={card.username}
              primaryStat={card.primary_stat}
              primaryLabel={card.primary_label}
              secondaryStats={card.secondary_stats}
              sparklineData={card.sparkline_data}
            />
          </section>

          {/* Card info */}
          <section className="mb-8 text-center">
            <h1 className="text-[28px] font-[700] text-text">
              {card.primary_stat}{" "}
              <span className="text-text-secondary">{card.primary_label}</span>
            </h1>
            <p className="mt-2 text-[15px] text-text-secondary">
              Shared by{" "}
              <Link
                href={`/u/${card.username}`}
                className="font-[600] text-brand hover:underline"
              >
                @{card.username}
              </Link>{" "}
              &middot; {card.period}
            </p>
          </section>

          {/* Actions */}
          <section className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <button
              className="inline-flex h-[44px] items-center gap-2 rounded-[50px] border border-border bg-white px-6 text-[15px] font-[600] text-text transition-all duration-200 hover:bg-bg"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
              </svg>
              Copy Link
            </button>
            <button
              className="inline-flex h-[44px] items-center gap-2 rounded-[50px] bg-[#1DA1F2] px-6 text-[15px] font-[600] text-white transition-all duration-200 hover:bg-[#1a8cd8] hover:-translate-y-[2px]"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
              Share on X
            </button>
          </section>

          {/* CTA */}
          <section className="mt-16 rounded-[20px] bg-card-dark p-8 text-center">
            <h2 className="text-[20px] font-[700] text-text-on-dark">
              Create your own Burnlog card
            </h2>
            <p className="mt-2 text-[15px] text-text-muted">
              Track your AI usage and share beautiful stats cards.
            </p>
            <Link
              href="/dashboard"
              className="mt-6 inline-flex h-[48px] items-center rounded-[50px] bg-brand px-8 text-[15px] font-[600] text-white transition-all duration-200 hover:bg-brand-hover hover:-translate-y-[2px]"
            >
              Get Started (Free)
            </Link>
          </section>
        </div>
      </main>
    </>
  );
}
