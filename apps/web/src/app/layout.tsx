import type { Metadata } from "next";
import { Sora, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const sora = Sora({
  variable: "--font-sora-var",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-var",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Burnlog — Know what you burn.",
    template: "%s | Burnlog",
  },
  description:
    "Track your AI coding usage, see insights, and share your stats. Strava for AI developers.",
  metadataBase: new URL("https://burnlog.dev"),
  openGraph: {
    title: "Burnlog — Know what you burn.",
    description:
      "Track your AI coding usage, see insights, and share your stats.",
    siteName: "Burnlog",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Burnlog — Know what you burn.",
    description:
      "Track your AI coding usage, see insights, and share your stats.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${sora.variable} ${jetbrainsMono.variable} h-full`}
    >
      <body className="min-h-full flex flex-col antialiased">{children}</body>
    </html>
  );
}
