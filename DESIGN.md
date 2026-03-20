# Design System — Burnlog

## Product Context
- **What this is:** AI developer usage tracking + social sharing platform ("Strava for AI Developers")
- **Who it's for:** Developers using AI coding tools (Claude Code, Codex, etc.)
- **Space/industry:** Developer tools, analytics, social/gamification
- **Project type:** Web app (dashboard + public profiles + shareable cards + landing page)
- **Tech stack:** Next.js + Vercel + Supabase

## Brand Identity
- **Name:** Burnlog
- **Logo:** "Burn" in primary text color + "log" in #2563EB (Royal Blue)
- **Logo font:** Sora, weight 800
- **Tagline:** "Know what you burn."
- **Domain:** burnlog.dev

## Aesthetic Direction
- **Direction:** Clean SaaS with warm touches — "Snow" theme
- **Decoration level:** Intentional — subtle shadows, hatched chart patterns, pastel icon backgrounds
- **Mood:** Professional but approachable. Data-dense but never cold. Like a well-organized workspace that makes you feel productive.
- **Anti-patterns:** No AI slop (no purple gradients, no 3-column icon grids, no generic hero sections). No mascots/characters.

## Typography

### Font Stack
- **Display/Headlines:** Sora (Google Fonts) — geometric sans-serif with rounded terminals, modern and confident
- **Body/UI:** Sora — same family for consistency, lighter weights (400-500)
- **Data/Numbers:** Geist Mono (Vercel CDN) — tabular numerals, clean alignment for dashboards
- **Code:** JetBrains Mono (Google Fonts) — ligatures, developer-standard

### Loading
```html
<link href="https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
```
```css
@font-face {
  font-family: 'Geist Mono';
  src: url('https://cdn.jsdelivr.net/npm/geist@1.3.1/dist/fonts/geist-mono/GeistMono-Regular.woff2') format('woff2');
  font-weight: 400;
}
@font-face {
  font-family: 'Geist Mono';
  src: url('https://cdn.jsdelivr.net/npm/geist@1.3.1/dist/fonts/geist-mono/GeistMono-SemiBold.woff2') format('woff2');
  font-weight: 600;
}
```

### Type Scale
| Level | Size | Weight | Use |
|-------|------|--------|-----|
| Hero | 56px | 800 | Landing page hero title |
| H1 | 32px | 700 | Section greetings ("Good morning, William") |
| H2 | 28px | 700 | Section titles |
| H3 | 20px | 700 | Card titles, share card headings |
| Body | 15px | 400 | Paragraphs, descriptions |
| Body SM | 13px | 500 | Card subtitles, activity text |
| Label | 12px | 600 | Card labels, uppercase tracking |
| Caption | 11px | 500 | Timestamps, metadata |
| Data XL | 36px | 600 | Primary stat numbers (Geist Mono) |
| Data LG | 24px | 600 | Secondary stat numbers (Geist Mono) |
| Code | 13px | 400 | CLI commands, API keys (JetBrains Mono) |

## Color

### Approach: Restrained — monochrome base + strategic blue

### Brand
- **Primary:** `#2563EB` — Royal Blue. Used for: logo "log", primary buttons, active states, key data highlights
- **Primary hover:** `#1D4ED8`
- **Primary light:** `#3B82F6` — lighter blue for secondary elements

### Blue Scale (data visualization + accents)
| Token | Hex | Use |
|-------|-----|-----|
| blue-50 | `#EFF6FF` | Subtle background tint |
| blue-100 | `#DBEAFE` | Accent card backgrounds, heatmap level 1 |
| blue-200 | `#BFDBFE` | Medium accent backgrounds, heatmap level 2 |
| blue-300 | `#93C5FD` | Chart bars (light), heatmap level 3 |
| blue-500 | `#3B82F6` | Chart bars (medium), secondary brand |
| blue-600 | `#2563EB` | Primary brand, chart bars (dark), heatmap level 4 |
| blue-700 | `#1D4ED8` | Hover states |

### Neutrals (warm gray)
| Token | Hex | Use |
|-------|-----|-----|
| bg | `#FAFAFA` | Page background |
| card | `#FFFFFF` | Card surfaces |
| card-dark | `#1A1A1A` | Dark cards |
| border | `#E5E7EB` | Borders, dividers |
| text | `#111827` | Primary text |
| text-secondary | `#6B7280` | Secondary text, labels |
| text-muted | `#9CA3AF` | Muted text on dark cards |
| text-on-dark | `#F9FAFB` | Text on dark surfaces |

### Semantic
| Token | Hex | Background | Use |
|-------|-----|------------|-----|
| success | `#059669` | `#D1FAE5` | Positive trends, sync success |
| warning | `#D97706` | `#FEF3C7` | Budget alerts, thresholds |
| error | `#DC2626` | `#FEE2E2` | Sync failures, errors |
| info | `#2563EB` | `#DBEAFE` | Informational messages |

### Pastel Accent Backgrounds (for stat icons, badges)
| Token | Hex | Paired with |
|-------|-----|-------------|
| pastel-blue | `#DBEAFE` | Blue icons/badges |
| pastel-green | `#D1FAE5` | Green icons/badges |
| pastel-purple | `#EDE9FE` | Purple icons/badges |
| pastel-orange | `#FEF3C7` | Orange icons/badges |
| pastel-pink | `#FCE7F3` | Pink icons/badges |

### Dark Mode Strategy
- Not in V1. Default light theme.
- Dark cards (#1A1A1A) within the light layout provide contrast variety.

## Spacing
- **Base unit:** 4px
- **Density:** Comfortable

| Token | Value | Use |
|-------|-------|-----|
| 2xs | 2px | Hairline gaps |
| xs | 4px | Tight gaps within components |
| sm | 8px | Intra-component spacing |
| md | 16px | Grid gaps, card inner padding start |
| lg | 24px | Section padding, card content |
| xl | 32px | Section titles to content |
| 2xl | 48px | Between major sections |
| 3xl | 60px | Section vertical padding |

## Layout
- **Approach:** Bento grid — mixed card sizes for visual rhythm
- **Grid:** 4-column base for dashboard bento, 3-column for share cards and components
- **Gap:** 16px (bento), 20px (share cards), 24px (components)
- **Max content width:** 1200px
- **Card border-radius:** 20px (all cards uniform)
- **Button border-radius:** 50px (full pill shape)
- **Input border-radius:** 12px
- **Alert border-radius:** 14px

### Responsive Breakpoints
| Breakpoint | Behavior |
|------------|----------|
| > 768px | Full grid layout |
| ≤ 768px | Single column, all cards span 1, hide nav, hero font 36px |

## Cards
- **White card:** `background: #FFFFFF`, `box-shadow: 0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04)`, `border-radius: 20px`
- **Dark card:** `background: #1A1A1A`, text `#F9FAFB`, muted text `#9CA3AF`
- **Accent card:** `background: #DBEAFE` (light blue)
- **Accent-mid card:** `background: #BFDBFE` (medium blue)
- **Arrow icon:** 32px circle, `rgba(37,99,235,0.1)` background, `#2563EB` text. On dark: `rgba(255,255,255,0.1)` background, white text.
- **Hatched pattern:** `repeating-linear-gradient(45deg, transparent, transparent 3px, rgba(0,0,0,0.07) 3px, rgba(0,0,0,0.07) 4px)` — used on alternating chart bars

## Header
- **Sticky:** `position: sticky; top: 0; z-index: 100`
- **Frosted glass:** `background: rgba(250,250,250,0.75); backdrop-filter: blur(16px)`
- **Border:** `1px solid rgba(229,231,235,0.5)`
- **CTA button:** Brand blue pill, 50px radius

## Motion
- **Approach:** Minimal-functional
- **Transitions:** `all 0.2s ease` on buttons and interactive elements
- **Hover lift:** `transform: translateY(-2px)` + shadow increase on CTAs
- **No:** page transitions, scroll animations, bouncing effects, decorative motion

## Data Visualization
- **Heatmap:** 12-column grid, 4px gap, 4px border-radius cells. Colors: #F3F4F6 (empty) → #DBEAFE → #93C5FD → #3B82F6 → #2563EB (max)
- **Bar charts:** 8px gap, 6px top border-radius. Alternating blue shades (#2563EB, #3B82F6, #93C5FD). Every 3rd bar gets hatched pattern.
- **Model distribution:** Single horizontal bar (14px height, full radius), segmented by color intensity.
- **Sparklines:** Minimal bars in share cards, 3px gap, 2px radius.

## Share Cards
- **Layout:** 3-column grid, 20px gap
- **Variants:** Dark (#1A1A1A), Brand (#2563EB), Gradient (linear-gradient #DBEAFE→#BFDBFE)
- **OG size:** 1200×630 for social sharing
- **Content:** Branded header (BURNLOG.DEV mono text), big stat number, description, Burnlog logo + URL footer

## Badges
- **Shape:** Pill (50px radius), 6px vertical / 14px horizontal padding
- **Font:** 12px, weight 600
- **Colors:** Each badge gets a unique pastel background + darker text from the pastel accent palette

## Decisions Log
| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-03-20 | Brand name: Burnlog | burn(token consumption) + log(tracking). No trademark conflicts, domains available. |
| 2026-03-20 | Brand color: #2563EB Royal Blue | Differentiates from Tokscale(electric blue), BurnRate(orange). Professional, trustworthy. |
| 2026-03-20 | Logo font: Sora | Geometric, modern, rounded terminals. Selected from 9-font comparison. |
| 2026-03-20 | Logo coloring: Burn(black) + log(blue) | "log" carries the brand color. Selected over "Burn(blue) + log(black)" variant. |
| 2026-03-20 | Theme: Snow (light #FAFAFA) | Selected from 6 theme explorations (Dark Industrial, Playful Light, Bento Sage, Clean SaaS, Warm Gradient, Cream Pastel). |
| 2026-03-20 | No mascots/characters | Initially explored, decided to remove for cleaner professional feel. |
| 2026-03-20 | Bento card layout | Mixed dark + white + blue accent cards for visual rhythm. Inspired by Design C (Bento Sage). |
| 2026-03-20 | Frosted glass header | Sticky + backdrop-filter blur. Inspired by Design B (Mist). |
| 2026-03-20 | Design system created | /design-consultation with competitive research (Tokscale, Linear, Strava, BurnRate, GitHub). |
