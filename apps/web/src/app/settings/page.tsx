import Link from "next/link";

export const metadata = {
  title: "Settings | Burnlog",
};

export default function SettingsPage() {
  return (
    <main className="mx-auto max-w-[1200px] px-4 pt-24 pb-12">
      <h1 className="mb-2 font-[700] text-[32px] text-text">Settings</h1>
      <p className="mb-8 text-[15px] text-text-secondary">
        Manage your account, data sources, and notifications.
      </p>

      <div className="grid gap-4 md:grid-cols-2">
        <article className="rounded-[20px] bg-card p-6 card-shadow">
          <h2 className="mb-1 text-[13px] font-[600] tracking-wide text-text-secondary uppercase">
            Subscription
          </h2>
          <p className="mb-4 font-mono text-[24px] font-[600] text-text">
            Pro — $20/mo
          </p>
          <p className="text-[13px] text-text-secondary">
            Change your subscription plan to adjust ROI calculations.
          </p>
        </article>

        <article className="rounded-[20px] bg-card p-6 card-shadow">
          <h2 className="mb-1 text-[13px] font-[600] tracking-wide text-text-secondary uppercase">
            Data Sources
          </h2>
          <p className="mb-4 font-mono text-[24px] font-[600] text-text">
            Claude Code
          </p>
          <p className="text-[13px] text-text-secondary">
            Run <code className="rounded bg-bg px-1.5 py-0.5 font-mono text-[13px]">npx burnlog sync</code> to upload new data.
          </p>
        </article>

        <article className="rounded-[20px] bg-card p-6 card-shadow">
          <h2 className="mb-1 text-[13px] font-[600] tracking-wide text-text-secondary uppercase">
            Profile
          </h2>
          <p className="mb-2 text-[15px] text-text">Username: <span className="font-[600]">—</span></p>
          <p className="text-[13px] text-text-secondary">
            <Link href="/login" className="text-brand hover:underline">Sign in</Link> to configure your profile.
          </p>
        </article>

        <article className="rounded-[20px] bg-card p-6 card-shadow">
          <h2 className="mb-1 text-[13px] font-[600] tracking-wide text-text-secondary uppercase">
            Notifications
          </h2>
          <p className="mb-2 text-[15px] text-text">Weekly email digest: <span className="font-[600]">On</span></p>
          <p className="text-[13px] text-text-secondary">
            Receive a weekly summary of your AI usage.
          </p>
        </article>
      </div>
    </main>
  );
}
