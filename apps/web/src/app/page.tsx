import Link from "next/link";
import Header from "@/components/Header";
import ShareCardPreview from "@/components/ShareCardPreview";

export default function LandingPage() {
  return (
    <>
      <Header />
      <main className="flex flex-1 flex-col">
        {/* Hero */}
        <section className="mx-auto w-full max-w-[1200px] px-6 pb-16 pt-16 md:pb-24 md:pt-24">
          <div className="grid grid-cols-1 items-center gap-12 md:grid-cols-2">
            {/* Left: Value proposition */}
            <div>
              <h1 className="text-[36px] font-[800] leading-tight tracking-tight text-text md:text-[56px]">
                Know exactly what your AI costs{" "}
                <span className="text-brand">&mdash; and show it off.</span>
              </h1>
              <p className="mt-6 max-w-lg text-[15px] leading-relaxed text-text-secondary">
                Burnlog tracks your Claude Code and Codex usage, calculates your
                ROI, and generates shareable cards that make developers jealous.
                Like Strava, but for AI coding.
              </p>
              <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
                <Link
                  href="/dashboard"
                  className="inline-flex h-[52px] items-center justify-center rounded-[50px] bg-brand px-8 text-[15px] font-[600] text-white transition-all duration-200 hover:bg-brand-hover hover:-translate-y-[2px]"
                >
                  Start Tracking (Free)
                </Link>
                <span className="text-[13px] text-text-secondary">
                  No credit card required
                </span>
              </div>
            </div>

            {/* Right: Example share card */}
            <div className="flex justify-center md:justify-end">
              <div className="w-full max-w-[480px]">
                <ShareCardPreview variant="dark" />
              </div>
            </div>
          </div>
        </section>

        {/* Value points */}
        <section className="border-t border-border bg-white">
          <div className="mx-auto grid w-full max-w-[1200px] grid-cols-1 gap-0 md:grid-cols-3">
            <div className="border-b border-border px-6 py-12 md:border-b-0 md:border-r md:px-10 md:py-16">
              <div className="mb-4 flex h-[48px] w-[48px] items-center justify-center rounded-[14px] bg-pastel-blue">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#2563EB"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 20V10" />
                  <path d="M18 20V4" />
                  <path d="M6 20v-4" />
                </svg>
              </div>
              <h3 className="text-[20px] font-[700] text-text">Track</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-text-secondary">
                See how many tokens you burn, which models you use, and what it
                would cost at API prices. One command, zero effort.
              </p>
            </div>

            <div className="border-b border-border px-6 py-12 md:border-b-0 md:border-r md:px-10 md:py-16">
              <div className="mb-4 flex h-[48px] w-[48px] items-center justify-center rounded-[14px] bg-pastel-green">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#059669"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
                  <path d="M12 9v4" />
                  <path d="M12 17h.01" />
                </svg>
              </div>
              <h3 className="text-[20px] font-[700] text-text">Insight</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-text-secondary">
                Model preferences, usage heatmaps, spending trends, and ROI
                calculations. Know if your subscription is worth it.
              </p>
            </div>

            <div className="px-6 py-12 md:px-10 md:py-16">
              <div className="mb-4 flex h-[48px] w-[48px] items-center justify-center rounded-[14px] bg-pastel-purple">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#7C3AED"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m22 2-7 20-4-9-9-4Z" />
                  <path d="M22 2 11 13" />
                </svg>
              </div>
              <h3 className="text-[20px] font-[700] text-text">Share</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-text-secondary">
                Auto-generate beautiful share cards with your stats. Post to
                Twitter, Slack, or anywhere. Earn badges along the way.
              </p>
            </div>
          </div>
        </section>

        {/* Social proof */}
        <section className="py-16 md:py-24">
          <div className="mx-auto w-full max-w-[1200px] px-6 text-center">
            <p className="text-[15px] font-[500] text-text-secondary">
              Join{" "}
              <span className="font-[family-name:var(--font-geist-mono)] font-[600] text-brand">
                2,847
              </span>{" "}
              developers tracking their AI usage
            </p>
            <div className="mt-6 flex items-center justify-center -space-x-2">
              {[0, 1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="flex h-[36px] w-[36px] items-center justify-center rounded-full border-2 border-white bg-blue-100 text-[11px] font-[600] text-brand"
                >
                  {String.fromCharCode(65 + i)}
                </div>
              ))}
              <div className="flex h-[36px] items-center rounded-full border-2 border-white bg-card-dark px-3 text-[11px] font-[600] text-text-on-dark">
                +2.8K
              </div>
            </div>
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="border-t border-border bg-white py-16 md:py-24">
          <div className="mx-auto w-full max-w-[1200px] px-6 text-center">
            <h2 className="text-[28px] font-[700] text-text">
              One command to start
            </h2>
            <p className="mt-3 text-[15px] text-text-secondary">
              Install the CLI, sync your data, and see your AI usage in seconds.
            </p>

            {/* Code block */}
            <div className="mx-auto mt-8 max-w-md overflow-hidden rounded-[14px] bg-card-dark">
              <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3">
                <div className="h-[10px] w-[10px] rounded-full bg-[#FF5F57]" />
                <div className="h-[10px] w-[10px] rounded-full bg-[#FEBC2E]" />
                <div className="h-[10px] w-[10px] rounded-full bg-[#28C840]" />
                <span className="ml-2 text-[11px] text-text-muted">
                  Terminal
                </span>
              </div>
              <div className="px-5 py-4">
                <code className="font-[family-name:var(--font-jetbrains)] text-[13px] text-text-on-dark">
                  <span className="text-text-muted">$</span> npx burnlog sync
                </code>
              </div>
            </div>

            <div className="mt-8">
              <Link
                href="/dashboard"
                className="inline-flex h-[52px] items-center justify-center rounded-[50px] bg-brand px-8 text-[15px] font-[600] text-white transition-all duration-200 hover:bg-brand-hover hover:-translate-y-[2px]"
              >
                Create Your Account
              </Link>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-border py-8">
          <div className="mx-auto flex w-full max-w-[1200px] items-center justify-between px-6">
            <span className="text-[13px] font-[800] font-[family-name:var(--font-sora)]">
              <span className="text-text">Burn</span>
              <span className="text-brand">log</span>
            </span>
            <span className="text-[11px] text-text-muted">
              &copy; 2026 Burnlog. All rights reserved.
            </span>
          </div>
        </footer>
      </main>
    </>
  );
}
