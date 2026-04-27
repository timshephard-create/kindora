# Kindora — Brand & Product Spec

**Version:** 1.1 (locked, April 2026)
**Source of truth:** v5 design deck + this document. Where they conflict, this document wins.
**Owner:** Tim Shephard / Creative Mind Ventures LLC
**Purpose:** Single source of truth for Claude Code and any future engineering / design work.

---

## 1. Identity

**Product name:** Kindora
**Publisher (Google Play, app stores, legal-ish):** Kindora World
**Domain:** `kindora.world` (canonical: `www.kindora.world`)
**Wordmark:** lowercase `kindora` followed by a full stop in apricot
**Legal entity:** Creative Mind Ventures LLC (D-U-N-S 133318897)
**Trademark posture:** "Famly" retired due to Danish trademark conflict. DBA "Kindora" filing in Johnson County TX precedes any Kindora-branded financial account creation. USPTO Class 9 + 42 filing post-launch when cash allows.

**One-line product:** Kindora is an AI-powered family navigation platform that turns four broken systems (childcare, health insurance, kids' media, nutrition) into four clear decisions.

**Three-stage brand arc:**
1. **Navigate** — the four tools today
2. **Build freedom** — Premium tier (saved profiles, history, family presets)
3. **Advocate change** — future, not on the roadmap

---

## 2. Voice

**Stance:** Subtly angry at broken systems + warm + lightly humorous. Always decisive — Kindora answers the question, then explains. Never dark, never aggressive, never preachy.

**Privacy stance (load-bearing):** *"We never sell your data. Ever. Not to insurance, not to childcare referrers, not to anyone."* This appears on signup and is a brand-level commitment, not just a marketing line.

**Hallmarks:**
- "This shouldn't need a PhD."
- "Four decisions, one less tab."
- "Decisions, not decision fatigue."
- "Parenting, one less tab."

**Do**
- Lead with the answer, then the reasoning.
- Name the broken thing plainly ("subsidies are gated behind ten forms").
- Use light humor as relief, not as the joke.
- Cite sources when stakes are high (CMS, AAP, Common Sense Media, USDA).

**Don't**
- Hedge or over-caveat. ("It depends" is a last resort.)
- Use scare copy or fear-based language.
- Talk down to parents.
- Generate medical, legal, or financial advice without the in-context disclaimer.

**Forbidden phrasing (do not ship):** "Empower," "Transform your family," "Revolutionize parenting," "Mom hack," "Game-changer."

---

## 3. Logo

- Wordmark: `kindora.` — lowercase, DM Sans Bold (700) at hero size, Semibold (600) for inline UI sizes. Letter-spacing `-0.04em` at hero, `-0.02em` elsewhere.
- The full stop is the brand element. **It is sized as a normal DM Sans full stop, color apricot `#EE9A6A`.** It is *not* enlarged, *not* detached, *not* a separate disc. *(The earlier 1.3× o-height rule is retired — see Section 10.)*
- Minimum size: 64px wide on screen, 12mm wide in print. Below this, suppress the period and use only the wordmark in apricot.
- Clear space: equal to the cap-height of the lowercase `k` on all sides.
- Reversed wordmark: white wordmark + apricot period on Clover surfaces.

**Sizing reference (from v5 deck):**
| Use | Size | Weight |
|---|---|---|
| Splash hero | 56px | 700 |
| Top nav | 32px | 600 |
| Small nav / sheet headers | 24px | 600 |
| Inline body | 18px | 600 |

**App icon — undecided, two directions in play:**
- **A:** lowercase `k` + apricot period, on Clover background
- **B:** apricot period alone, on Clover background

Both ship at 1024 / 512 / adaptive 432 (108 safe area) / favicon 32 / favicon 16. **Pick one before icon export.** Old rounded-square + "n" arch icon is retired.

---

## 4. Color

| Token | Hex | Use |
|---|---|---|
| `--color-clover` | `#0E6B43` | **Primary brand.** Headers, primary buttons, navigation, brand surfaces. |
| `--color-clover-dark` | `#085132` | Hover/pressed states, dark surfaces. |
| `--color-clover-soft` | `#DFEEE4` | Tints, badges, soft fills (tool-card backgrounds). |
| `--color-apricot` | `#EE9A6A` | **Accent only.** The period, single CTAs on Clover, single-use highlights. |
| `--color-shell` | `#FBF8F2` | Page background — warm off-white. Never pure white for marketing. |
| `--color-surface` | `#FFFFFF` | App surfaces, cards, modals, sheets. |
| `--color-ink` | `#1A2321` | Primary text on light backgrounds. |
| `--color-mute` | `#5C6664` | Muted text, captions, helper copy. |
| `--color-line` | `#EAE5DA` | Borders, dividers. |

**Retired:** Forest green, Plus Jakarta Sans. Do not reintroduce.

**Distribution:** Clover dominates (50–60%), neutrals carry weight (35–45%), Apricot is rare and earned (≤5%). If apricot is showing up everywhere, something is off.

**Accessibility:** Clover on Shell passes AA at all sizes. Apricot on Clover passes AA Large only — use only for ≥18px or bold ≥14px copy.

---

## 5. Typography

- **Display:** DM Sans (Variable). Weights 500 / 600 / 700. Used for headlines, hero copy, eyebrows, the wordmark.
- **Body / UI:** Inter (Variable). Weights 400 / 500 / 600. Used for body, labels, inputs, buttons.
- **Mono:** JetBrains Mono. Used for stamps (page numbers, file names in handoffs, error codes).

**Type scale (matches v5 deck specimens):**
| Use | Token | Size / line-height / weight |
|---|---|---|
| Splash hero | `text-display-hero` | 54px / 1.0 / 700 / -4% tracking |
| Section heading | `text-heading` | 26px / 1.2 / 600 |
| Inline body | `text-lg` | 18px |
| Body | `text-base` | 16px / 1.55 / 400 |
| UI labels | `text-ui` | 14px / 1.3 / 600 |
| Caption | `text-caption` | 12px / 1.4 / 500 |

**Inter font features `'ss01', 'cv11'` enabled** for friendlier digits and the single-storey `a`.
**Long-form reading width:** max 64ch.
**All-caps reserved for eyebrows** at 11–12px, tracking `+0.04em`.

---

## 6. Layout & components

- **Grid:** 12-column on desktop, 4-column on mobile. Gutter 24px desktop / 16px mobile.
- **Container max:** 1280px (`max-w-content-max`).
- **Vertical rhythm:** 8px base. Section spacing 64–96px on marketing, 32–48px in app.
- **Radius:** 8px on inputs, 12px on cards/sheets, 999px (pill) on CTAs and toasts.
- **Shadows:** soft, warm — biased toward Ink at low alpha, never gray.
- **Motion:** default 220ms `ease-standard`. `prefers-reduced-motion` respected. No bounce except on success states.

**Buttons:**
- **Primary** · Clover background, Shell text, pill radius. Hover: Clover-dark.
- **Secondary (soft)** · Clover-soft background, Clover text, pill radius. (Tool-card-style.)
- **Ghost (outline)** · Clover outline, Clover text, transparent background.
- **Accent CTA** · Apricot background, Clover-dark text. Used only on Clover surfaces, max one per screen.

**Forms:**
- Inputs 44px tall minimum (mobile-friendly tap target).
- Focus ring: 3px Clover at 25% alpha (`shadow-focus`).
- Error state: status-error border + helper text in status-error.
- Password strength meter shows under the password field on signup ("Strong. Good." per v5).

**Tool card (at rest):** Clover-soft background, sprout/tool icon in Clover, title in Ink at heading weight, two-line meta in Mute, optional Clover badge top-right (e.g. "$432/mo" for Sprout).

---

## 7. Splash hero (homepage)

```
[wordmark]   kindora.

[h1]         This shouldn't need a PhD.

[subhead]    Four decisions, one less tab.
[caption]    Four things families are expected to just figure out:

[problem list — numbered apricot, white text on Clover]
             01  Childcare that fits your budget.
             02  A health plan that won't wreck you.
             03  Screen time without the guilt.
             04  Dinner — figured out by Tuesday.

[CTA]        Start free  →    (Apricot pill on Clover)
```

Single-promise, single-action. The hero is intentionally singular.

---

## 8. Onboarding quiz

Step 1 lives on the homepage as the hero of the logged-in state. Step 2 routes to the right tool.

**Step 1 of 2 — "What's on your plate today?"**
Three primary options + secondary jump-in:
- **Childcare math** — Costs, waitlists, subsidies
- **Insurance decisions** — Plan choice, deductibles
- **Screen time and food** — The daily stuff

Plus: `Or jump in →` for users who already know what they want, with a `See all` to view all four tool cards.

**Step 2 of 2 (per-route) — "Childcare math, got it. Where do we start?"**
Four sub-routes (example for Childcare):
- **Costs and budget** — How much will this actually be?
- **Subsidies and credits** — What am I leaving on the table?
- **Finding licensed centers** — By ZIP, with real reviews
- **Waitlists and timing** — Where to apply, and when

CTA: `Open Sprout →` (or relevant tool).

**Storage:** Anonymous answer → localStorage. On signup, written to user record. On return, prefills the relevant tool.

---

## 9. Auth (Supabase)

**Platform:** Supabase Auth (chosen over Clerk on cost — free to 50k MAU vs Clerk's 10k — plus first-class Row-Level Security and Capacitor SDK fit).

**Providers at launch:**
- Google OAuth
- Email + password

**Apple Sign In:** *Not* at launch (Android-first via Google Play). Becomes required by App Store rules when iOS ships — re-evaluate then. Capacitor URL scheme for Google: `com.kindora.app://auth/callback` — must be registered in the Capacitor config from day one.

**Sign-up screen copy (v5 deck):**
- H1: "Make an account."
- H1 (Clover accent): "Takes a minute."
- Privacy line: "We never sell your data. Ever. Not to insurance, not to childcare referrers, not to anyone."

**Sign-in screen copy:**
- H1: "Welcome back."
- Sub: "Pick up where you left off — Sprout has 2 new licensed centers since last week." (Dynamic; falls back to a generic line if no relevant update.)

---

## 10. Tools (one paragraph each)

- **Sprout** — childcare finder + subsidy calculator. Math is deterministic in code; LLM only explains. Output cites the subsidy program by name. Model: **Haiku 4.5**.
- **HealthGuide** — pulls plan data from the CMS Marketplace API. LLM rewrites the plan in plain English. No speculation; if the data isn't there, it says so. Model: **Sonnet 4.6** at temperature 0.2–0.3. Card design: 3-plan compare with Clover-bordered "Our pick" card and plain-English trade-off written under the recommendation.
- **BrightWatch** — brain-health-scored media recommendations for ages 0–8. Pulls from a curated content database with age-rules enforced as code filters. Never freelances a recommendation. Model: **Haiku 4.5** (Sonnet fallback if eval quality drops).
- **Nourish** — AI meal planning with local grocery integration. Allergen cross-check happens in code before any plan reaches the user. Plans cached by family-profile signature. Model: **Sonnet 4.6** at temperature 0.2–0.3.

Each tool ends with: *"Not medical/financial advice — see your doctor / advisor for decisions that matter."* (Tone-tuned per tool — copy library in §13.)

---

## 11. Monetization (day-1)

**Required free account from launch.** Supabase email/password + Google OAuth.

**Metered freemium caps — universal 2/month across all four tools:**
- Sprout: 2 / month
- HealthGuide: 2 / month
- BrightWatch: 2 / month
- Nourish: 2 / month

Universal caps keep marketing copy clean ("2 free per tool, per month") and protect Sonnet inference costs. If a specific tool's usage data later shows the cap is too tight (likely candidate: BrightWatch — cheap to serve, daily-use case), bump that one tool — don't loosen across the board.

**Premium:** $6.99 / month or $49 / year (~30% annual discount). Unlimited use across all four tools + saved profiles + history + family presets.

**Optional launch lever:** First 500 signups get 50% off for life. Creates urgency, costs nothing until conversion.

**Cap warning toast** — shown on the action *before* the cap is hit:
> *"1 meal plan left this month. Free plan resets [date]. Go unlimited for $6.99/mo — no nag screens after."*

**Paywall sheet** — shown after cap is hit:
> Eyebrow: "YOU'VE HIT THE FREE CAP"
> H1: "Nourish is free for 2 meal plans a month."
> H1 (Clover accent): "Premium is built for the rest."
> Price: "$6.99/mo or $49/year"
> Sub: "Cancel anytime, no sales pitch."
> Bullet list: Unlimited plans across all four tools · Saved profiles + history · Family presets

**Upgrade success:**
> Eyebrow: "YOU'RE IN"
> H1: "Welcome to Premium, [name]."
> Sub: "Caps lifted across all four tools. We'll send one email — your receipt — and that's it. No upsell loops, no 'are you sure?' surveys."
> Receipt card: kindora Premium · monthly $6.99 · Next charge [date] · Card ···· [last4]

---

## 12. System states (universal)

**Empty state pattern:**
- Tool icon in Clover-soft circle
- Headline: *"No saved [thing] yet."*
- Sub: 1–2 lines explaining what shows up here
- Single primary CTA

Example (Sprout): *"No saved centers yet. Drop in a ZIP and we'll surface licensed, vetted options — with subsidy math baked in. No referral fees, no sponsored lies."* CTA: *Start with a ZIP*

**Loading state pattern:**
- Skeleton rows in Clover-soft (not gray)
- Headline: *"Pulling [thing] for [context]…"*
- Sub: an honest line about why it might take a beat — *"The insurance marketplace is slow on purpose. We'll cache this so you don't wait again."*

**Error state pattern (warm, not panicked):**
- Triangle alert icon in apricot
- Headline blames the system, not the user
- Two CTAs: retry + degrade-gracefully fallback

Example (Nourish): *"Can't reach your grocery yet. Wegmans' feed is down — not you, them. Try again in a minute, or plan from your pantry for now."* CTAs: *Try again* / *Plan from pantry*. Error code shown small in Mute: `err.net.WEGMANS_TIMEOUT · 504`

---

## 13. Copy library

**Disclaimers (per tool):**
- HealthGuide: *"This isn't medical or insurance advice. Confirm coverage with the carrier before making decisions."*
- Sprout: *"Subsidy estimates pull from current program rules. Final eligibility is decided by the program."*
- BrightWatch: *"Recommendations are guidance, not gospel. You know your kid better than we do."*
- Nourish: *"Allergens are checked against your family profile. Always read the label."*

**Empty states (general):** *"Nothing here yet — that's the goal."* · *"You're caught up. Go outside."*

**Error (general):** *"Something's off on our end. Try again in a sec — we'll be here."*

**Success:** *"Done. One less tab."*

**Privacy line (signup):** *"We never sell your data. Ever. Not to insurance, not to childcare referrers, not to anyone."*

---

## 14. Forbidden / retired

- ❌ "Famly" name (anywhere — code, copy, repo, alt text, env vars)
- ❌ Forest green
- ❌ Plus Jakarta Sans
- ❌ The 1.3× o-height detached period (use a normal DM Sans full stop in apricot)
- ❌ Old rounded-square icon with the "n" arch
- ❌ Apple Sign In at launch (re-evaluate when iOS ships)
- ❌ Pure white (`#FFFFFF`) on marketing pages — use Shell `#FBF8F2`
- ❌ Purple gradients of any kind
- ❌ Decorative emoji in product copy (functional only — checkmarks, alerts)
- ❌ Stock photography of "happy diverse families"

---

## 15. Engineering handoff — files this spec governs

- `tokens.css` — CSS variables. Single source of truth for all values. If a value isn't here, it doesn't exist.
- `tailwind.config.ts` — maps tokens into Tailwind utility classes.
- `app/globals.css` — imports `tokens.css`, sets base typography per §5.
- `components/ui/*` — Button, Input, Card, Modal, Toast, Sheet — all read from tokens.
- `lib/copy/*.ts` — strings live in code, not JSX, so they're translatable later.
- `/handoff/icons/` — both icon directions (A and B) at 1024 / 512 / 432 / 32 / 16. Pick one before final export.

If a value isn't in `tokens.css`, it doesn't exist. Add it there first.
