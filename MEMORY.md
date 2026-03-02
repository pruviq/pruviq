# MEMORY.md - PRUVIQ Project Knowledge

Last updated: 2026-02-26 06:35 KST

## Project Overview

PRUVIQ (pruviq.com) = "Don't Believe. Verify."
Free crypto strategy simulation + market context platform.

### Business Model
- 100% FREE (no paywalls, no tiers)
- Revenue: Exchange referral commissions (Binance 20-41%, Bybit 30-50%, OKX up to 50%)
- User journey: Simulate -> Conviction -> "Which exchange?" -> Referral signup
- Transparent: Value first, referral second. Disclosure on every link.

## Tech Stack

- Frontend: Astro 5 (SSG) + Preact islands + Tailwind CSS 4 + lightweight-charts v5
- Backend: Python FastAPI on Mac Mini (api.pruviq.com:8400) — READ ONLY for you
- Deploy: Cloudflare Pages (git push -> auto deploy, ~2 min)
- i18n: English (root /) + Korean (/ko/)
- Tests: Playwright E2E (tests/full-site-qa.spec.ts)

## Directory Structure

```
/Users/openclaw/pruviq/
  src/
    components/     -- 10 Preact Islands (.tsx files)
    pages/          -- 39 Astro pages (EN at root, KO under /ko/)
    content/        -- Blog (17x2 lang) + Strategies (5x2 lang)
    i18n/           -- en.ts, ko.ts translation keys
    layouts/        -- Layout.astro (meta, hreflang, JSON-LD)
    config/         -- api.ts (API URL single source of truth)
    styles/
  backend/          -- READ-ONLY (runs as jepo user)
  public/data/      -- Pre-computed demo JSON
  docs/             -- Design docs, audit reports
  tests/            -- Playwright E2E tests
  dist/             -- Build output
```

## Key Commands

```bash
# Always start with
cd /Users/openclaw/pruviq && git pull

# Build (MUST pass before commit)
npm run build

# Local dev server
npm run dev    # → http://localhost:4321

# Run E2E tests
npx playwright test

# Check site health
curl -s -o /dev/null -w '%{http_code}' https://pruviq.com         # expect 200
curl -s -o /dev/null -w '%{http_code}' https://api.pruviq.com/market  # expect 200

# Check all APIs
curl -s https://api.pruviq.com/market | head -c 200
curl -s https://api.pruviq.com/news | head -c 200
curl -s https://api.pruviq.com/macro | head -c 200
curl -s https://api.pruviq.com/coins/stats | head -c 200
curl -s https://api.pruviq.com/builder/presets | head -c 200

# Check specific pages
curl -s -o /dev/null -w '%{http_code}' https://pruviq.com/simulate/
curl -s -o /dev/null -w '%{http_code}' https://pruviq.com/coins/
curl -s -o /dev/null -w '%{http_code}' https://pruviq.com/market/
curl -s -o /dev/null -w '%{http_code}' https://pruviq.com/strategies/
curl -s -o /dev/null -w '%{http_code}' https://pruviq.com/fees/
curl -s -o /dev/null -w '%{http_code}' https://pruviq.com/ko/

# SEO checks
curl -s https://pruviq.com/sitemap-index.xml | head -c 500
curl -s https://pruviq.com/robots.txt
curl -s https://pruviq.com/ | grep -E '<title|<meta|canonical|hreflang'

# Git workflow
git add <specific-files>
git commit -m "feat: description"
git push origin main
# Wait ~2 min for Cloudflare deploy

# Troubleshooting
npm run build 2>&1 | tail -30           # build errors
rm -rf node_modules && npm install       # npm issues
npx playwright test --debug              # test debug
```

## Current State (v0.2.0)

### Audit Results (2026-02-18, 6-agent audit)
| Item | Score | Status |
|------|-------|--------|
| Trust signals | 4/10 | needs work |
| SEO/indexing | 6/10 | GSC registered, awaiting |
| i18n completeness | 5/10 | P1 |
| Frontend code | 6/10 | P1 |
| UI/UX | 6/10 | P1 |
| Content quality | 8/10 | OK |
| Korean quality | 8.5/10 | OK |
| Data accuracy | 9.5/10 | OK |

### Current Sprint Focus
- SEO optimization (meta tags, structured data)
- i18n completion (learn pages, missing translations)
- Mobile UX (touch targets 44px, loading states)
- Trust signals improvement

### All P0 issues RESOLVED
See docs/UNIFIED_AUDIT_v0.1.0.md for details.

## Strategy Data (from autotrader v1.7.0)

| Strategy | Direction | Status | Win Rate | PF |
|----------|-----------|--------|----------|-----|
| BB Squeeze SHORT | short | verified | 68.6% | 2.22 |
| BB Squeeze LONG | long | killed | 51.0% | <1 |
| Momentum LONG | long | killed | 37.5% | <1 |
| ATR Breakout | long | shelved | - | - |
| HV Squeeze | short | shelved | - | - |

## Quality Standards

- All pages: load < 5 seconds
- No JS console errors
- Mobile-responsive (1280px desktop, 390px mobile)
- Korean translations must match English 1:1
- Build MUST pass before commit
- Lighthouse: Performance 90+, SEO 95+, Accessibility 90%

## Key Documents (read when needed)

- .claude/CLAUDE.md — Full project spec (most detailed)
- docs/MASTER_PLAN.md — Architecture + business plan
- docs/BRAND_CONCEPT.md — Brand identity + copy
- docs/UNIFIED_AUDIT_v0.1.0.md — Audit findings
- docs/UX_DESIGN.md — Design system
- src/i18n/en.ts + ko.ts — Translation keys

## Important Rules

- autotrader = Owner's private bot (NEVER touch, no access)
- Backend files = jepo-owned (READ ONLY)
- No code copying from autotrader — concepts only
- No live trading results — simulation results only
- n8n API: http://127.0.0.1:5678 (key in ~/.env.pruviq)

## Process Rules

Before modifying any existing page, MUST first:
1. Run `git log --oneline --follow <file>` to see its history and recent commits.
2. Identify all sections added, modified, or removed (compare commits/diffs).
3. Report the current state before making changes (include file path(s), last commit hash(es), and a short summary of what will change).
4. Get explicit approval from the owner or designated reviewer (JEPO) before implementing edits.

Note: TradingView Economic Calendar (iframe widget) was removed in commit `a9c648b` during a Binance API cleanup; it needs to be restored on the Market page unless there is a documented reason not to include it (iframe-only, zero cost).

(Added by JEPO on 2026-02-22 15:03 KST)

## Autonomous Decision Making (CRITICAL)

### OpenClaw Cron Jobs (9 total)
| Job | Schedule | Purpose |
|-----|----------|---------|
| health-check | every 30min | Site + API 200 check → Telegram |
| daily-seo-audit | 00:00 KST daily | 2389 URL crawl, SEO audit, auto-fix |
| build-deploy-check | every 6h | git pull → build → deploy verify → auto-fix |
| i18n-fix | 15:00 KST daily | Korean translation completeness check |
| weekly-comprehensive-audit | Mon 10:00 KST | Full audit + Playwright + report |
| gh-issues-autofix | every 4h | Read GitHub issues → auto-fix → PR |
| **content-creation** | Tue+Fri 03:00 KST | NEW blog posts (EN+KO), 1500-2500 words |
| **performance-lighthouse** | 04:00 KST daily | Core Web Vitals, image optimization, UX |
| **jepo-strategic-review** | 22:00 KST daily | BRAIN: analyze → prioritize → create issues |

### Recent gh-issues-autofix run (2026-03-02 18:19 KST)
- Actor: PRUVIQ Bot (프루빅) — autonomous cron run (gh-issues-autofix)
- What I ran (commands & evidence):
  1. git checkout main && git pull origin main  (resolved local divergence)
     - Evidence: `git log --oneline -n 6` showed recent commits after merge (see local git history).
  2. Resolved merge conflicts on generated data files in public/data/ by accepting the remote version (origin/main) and committing the resolution.
     - Commit present in history: `2a159ea chore: resolve merge conflicts (accept remote for generated public/data files)` (confirmed via `git log --grep "resolve merge conflicts"`).
  3. Listed open PRs with GH CLI: `gh pr list --state open --json number,title,headRefName,statusCheckRollup,comments` — no open PRs with failing checks at the time of this run (all statusCheckRollup conclusions: SUCCESS).
     - Output: PRs open at time of run: #143 (fix/issue-132-prefer-webp), #142 (i18n-check/2026-03-02), #141 (perf/lighthouse-2026-03-02), #138 (feat/trust-badges-2026-03-01), #145 (docs/BRAVE_API) — all checks green (confirmed via `gh pr list` output).
  4. Inspected ISSUE #137 (Cloudflare Workers builds failing for closed PRs #136/#135):
     - I fetched the referenced PR branches and ran local builds for the branches mentioned in the issue:
       - fix/issue-132-convert-og-image (PR #136): `npm run build` → "2446 page(s) built in 41.14s" (local build succeeded). (confirmed in build output)
       - fix/issue-21-enable-brave-key (PR #135): `npm run build` → "2446 page(s) built in 38.19s" (local build succeeded). (confirmed in build output)
     - Conclusion: local builds succeed on both branches; failing CI logs referenced in the issue are hosted on Cloudflare Pages/Workers dashboard and require Cloudflare account access to view and debug.
     - Action: added a comment to ISSUE #137 with the above diagnosis and recommended next steps for maintainers with Cloudflare access.
       - Comment URL (evidence): https://github.com/pruviq/pruviq/issues/137#issuecomment-3983144084
  5. Worked ISSUE #21 (BRAVE_API_KEY required for research PoC):
     - Implemented a small docs change to document how/where to add BRAVE_API_KEY (no secrets added to repo): created branch `fix/issue-21-document-brave-api`, added `docs/BRAVE_API.md`, ran `npm run build` locally (build succeeded: "2438 page(s) built in 37.25s"), committed and pushed the change, and opened PR #145.
       - Commit: `f398887 docs: document BRAVE_API_KEY setup (fix #21)` (confirmed in `git log`)
       - PR created: https://github.com/pruviq/pruviq/pull/145
     - Rationale: cannot provision secrets here; documenting required secret location and steps reduces friction for Ops/SRE to add the key safely.
  6. Triage: scanned open issues and triaged items that require ops access (5xx issues), design decisions (trust signals), or artifacts (Lighthouse/axe JSON) before creating deeper fixes.

- Results (what I fixed / opened / blocked):
  - Fixed / created:
    - docs/BRAVE_API.md added and pushed (branch: fix/issue-21-document-brave-api) → PR #145 opened. (confirmed via `git log` and `gh pr create` output)
    - Resolved local merge conflicts on main (accepted remote for generated data files) and committed resolution (commit: 2a159ea). Local main is updated and clean.
  - Verified / tested (local builds):
    - fix/issue-132-convert-og-image (PR #136): local build succeeded — "2446 page(s) built in 41.14s" (build output).
    - fix/issue-21-enable-brave-key (PR #135): local build succeeded — "2446 page(s) built in 38.19s" (build output).
    - fix/issue-21-document-brave-api (PR #145): local build succeeded — "2438 page(s) built in 37.25s" (build output).
  - Blocked / needs access:
    - ISSUE #137: Cloudflare Pages/Workers build logs required to diagnose failing runs (I don’t have Cloudflare account access). I added a comment to the issue and requested the run log or access. (comment: https://github.com/pruviq/pruviq/issues/137#issuecomment-3983144084)
    - Production 5xx issues (#7, #19): Ops logs / Sentry trace IDs required for RCA — left triage comments requesting logs.

### Next recommended actions
1. Ops / JEPO: please provide Cloudflare Pages/Workers run logs for the failing builds referenced in ISSUE #137 (or grant read access to the Cloudflare dashboard) so I can continue debugging the worker failure.
2. Ops / SRE: provision BRAVE_API_KEY in the deployment environment (CI/Gateway/Cloudflare/Secrets) as documented in PR #145, then re-run the research agent/CI to produce Brave-backed outputs.
3. For performance / a11y issues: upload Lighthouse trace JSON and axe artifacts and I will open focused PRs with small, safe fixes.

## Pending Tasks (updated)
- P0 — Critical (act now)
  - [ ] Resolve production API 5xx (/coins/stats) — ISSUE #7 (label: P0-critical)
        • What: Gather Cloudflare/origin logs, Sentry trace IDs; reproduce and remediate.
        • Why: User-facing endpoint returning 5xx blocks Market/Coins pages and harms conversions.
        • Owner: ops-sre + JEPO

- P1 — High
  - [ ] Performance: Reduce main-thread work / Lighthouse uplift — ISSUE #40 (label: P1-high)
  - [x] Document BRAVE_API_KEY setup (fix #21) — PR #145 opened (docs-only).  
  - [ ] Trust signals: Verified strategies & reproducible package PoC — ISSUE #12 (label: P1-high)

- P2 — Medium
  - [ ] Mobile touch-targets audit & fixes — ISSUE #11 (label: P2-medium)


(Entry appended by PRUVIQ Bot (프루빅) on 2026-03-02 18:30 KST)
