import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import ShareCardPreview from "@/components/ShareCardPreview";
import CardActions from "../CardActions";
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
          <CardActions shareUrl={`https://burnlog.dev/card/${id}`} />

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
