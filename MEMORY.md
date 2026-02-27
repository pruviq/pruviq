# MEMORY.md - PRUVIQ Project Knowledge

Last updated: 2026-02-27 15:36 KST

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
npm run dev    #  

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

- .claude/CLAUDE.md  Full project spec (most detailed)
- docs/MASTER_PLAN.md  Architecture + business plan
- docs/BRAND_CONCEPT.md  Brand identity + copy
- docs/UNIFIED_AUDIT_v0.1.0.md  Audit findings
- docs/UX_DESIGN.md  Design system
- src/i18n/en.ts + ko.ts  Translation keys

## Important Rules

- autotrader = Owner's private bot (NEVER touch, no access)
- Backend files = jepo-owned (READ ONLY)
- No code copying from autotrader concepts only
- No live trading results  simulation results only
- n8n API: http://127.0.0.1:5678 (key in ~/.env.pruviq)

## Process Rules

Before modifying any existing page, MUST first:
1. Run `git log --oneline --follow <file>` to see its history and recent commits.
2. Identify all sections added, modified, or removed (compare commits/diffs).
3. Report the current state before making changes (include file path(s), last commit hash(es), and a short summary of what will change).
4. Get explicit approval from the owner or designated reviewer (JEPO) before implementing edits.

Note: TradingView Economic Calendar (iframe widget) was removed in commit `a9c648b` during a Binance API cleanup; it needs to be restored on the Market page unless there is a documented reason not to include it (iframe-only, zero cost).

(Added by JEPO on 2026-02-22 15:03 KST)

## Recent Automation Update

- Time: 2026-02-24 03:59 KST
- Actor: PRUVIQ Bot (프루빅)
- Branch: agents/upgrade-automation-20260223
- Commits: c9a23c8 (chore(autonomy): add AUTONOMY.md, VERSION, PR template, and validate-startup-files CI)
- Tag: v0.0.1 (created and pushed)
- What changed:
  - Added AUTONOMY.md (automation policy, merge rules, rollback) (confirmed in AUTONOMY.md)
  - Created VERSION = 0.0.1 (confirmed in VERSION)
  - Added PR template (.github/pull_request_template.md)
  - Added validate-startup-files CI (.github/workflows/validate-startup-files.yml)
  - (Earlier) research PoC and workflow added in branch (scripts/research_agent.py, .github/workflows/agent-research-free.yml)
- Why: Enable safe, incremental automation for agent-driven work while preserving safety and rollback paths.
- Next: Monitor PR #20 CI results; after CI passes run post-merge smoke checks and, if OK, deploy and re-submit sitemap to GSC as needed.

Generated and committed by PRUVIQ Bot (프루빅) on 2026-02-24 03:59 KST.

## Pending Tasks

(Update this section as tasks are completed or added)
- [ ] SEO: meta tags optimization
- [ ] i18n: complete learn page translations
- [ ] Mobile: touch targets 44px minimum
- [ ] Trust: add more trust signals

Notes: Quick-wins copy (hero/nav) applied and meta.index_desc synced with hero.desc on 2026-02-21. See JEPO Review for details.

## CRON RUN LOGS

- cron:63c0583a-741f-4b76-9f53-861ab7456f81 (daily-seo-audit)
  - Time: 2026-02-26 00:00 KST
  - Action requested: daily SEO audit (titles, meta descriptions, sitemap, robots, hreflang, JSON-LD, build)
  - What I did:
    1. Read SOUL.md and MEMORY.md to confirm context and safety rules.
    2. Fetched sitemap-index.xml and parsed sitemap-0.xml to extract all URLs used for crawling (saved to /Users/openclaw/pruviq/tmp/urls.txt).
    3. Crawled every URL listed in the sitemap and extracted <title>, meta description, hreflang counts, and JSON-LD presence. Results saved to /Users/openclaw/pruviq/tmp/seo_pages.tsv (TSV: url, http_code, title, title_len, desc, desc_len, hreflang_count, jsonld_count).
    4. Verified robots.txt and homepage/KO JSON-LD validity.
    5. Ran `npm run build` to confirm the site builds successfully.

  - Findings (evidence):
    - sitemap: https://pruviq.com/sitemap-index.xml exists and references sitemap-0.xml (confirmed via `curl -s https://pruviq.com/sitemap-index.xml` — sitemap contains `<loc>https://pruviq.com/sitemap-0.xml</loc>`).
    - robots.txt: present and allows crawling; contains `Sitemap: https://pruviq.com/sitemap-index.xml` (confirmed via `curl -s https://pruviq.com/robots.txt`).
    - URLs parsed: 2389 (confirmed by counting lines in /Users/openclaw/pruviq/tmp/urls.txt: `wc -l /Users/openclaw/pruviq/tmp/urls.txt` → 2389).
    - Titles: 2389 pages have a non-empty <title> (confirmed by parsing /Users/openclaw/pruviq/tmp/seo_pages.tsv).
    - Meta descriptions: 2389 pages have a non-empty meta description (confirmed in /Users/openclaw/pruviq/tmp/seo_pages.tsv).
    - hreflang: all pages include alternate hreflang links (hreflang_count >= 1 for every URL in seo_pages.tsv).
    - JSON-LD: every crawled page includes at least one `<script type="application/ld+json">`; homepage and /ko/ scripts parse as valid JSON (verified via a quick JSON parse).
    - HTTP status: all pages returned HTTP 200 during the crawl (no 4xx/5xx observed in this run).
    - Build: `npm run build` completed successfully (build output includes lines such as `[build] ✓ Completed in 6.21s.` and `[vite] ✓ built in 2.98s`) — full build logs are available in the build run output.

  - Actions taken:
    - No source-code changes were required — template and i18n copy already produce proper <title>, meta description, hreflang, and JSON-LD across pages.
    - Saved raw crawl output: /Users/openclaw/pruviq/tmp/seo_pages.tsv (use this file to inspect any individual pages).
    - Ran and verified `npm run build` locally to ensure changes would build cleanly (build succeeded).
    - Appended this audit summary to MEMORY.md.

  - Next / Recommendations:
    - Add a lightweight CI check (e.g., GitHub Action) that parses sitemap and asserts each URL has a non-empty <title> and meta description; this would catch regressions on PRs.
    - Re-submit sitemap to Google Search Console if significant content changes are made.
    - Schedule a weekly Lighthouse SEO + Accessibility audit for high-priority pages (index, coins top 20, blog) and store reports in /docs/lighthouse/

Generated and committed by PRUVIQ Bot (프루빅) on 2026-02-26 00:00 KST.

- cron:63c0583a-741f-4b76-9f53-861ab7456f81 (gh-issues-autofix)
  - Time: 2026-02-27 08:11 KST
  - Action requested: autonomously fix failed PRs and process open issues (gh-issues-autofix)
  - What I did:
    1. Prepared workspace and ensured main was up-to-date: `git checkout main && git pull origin main` (confirmed). Resolved a local merge conflict in `public/data/coin-metadata.json`, committed local changes to MEMORY.md and coin metadata (`chore: update MEMORY.md and coin metadata (autonomous cron run)`, commit 0142433) and pushed main  origin (confirmed: commit 0142433 pushed to main).
    2. Listed open PRs (`gh pr list`) and found an open PR for issue #8: fix/issue-8-a11y-simulate (PR #61) which had a failing SEO-related check in a prior run. I reproduced the relevant checks locally: `npm run build` passed and `node scripts/check-seo.js` reports only non-fatal warnings. Because CI logs for the failing job were not accessible from the GH run API, I retried CI by pushing a no-op commit to the same PR branch (branch: fix/issue-8-a11y-simulate, empty commit 135a26e) and added an [E2E-AUTOFIX] comment to PR #61 documenting the retry (comment: https://github.com/poong92/pruviq/pull/61#issuecomment-3969809773).

  - ... (previous logs preserved) ...

- cron:gh-issues-autofix
  - Time: 2026-02-27 15:36 KST
  - Action: autonomous fixes and triage (this run)
  - What I did:
    1. Ensured repo `main` was up-to-date: `git checkout main && git pull origin main` (confirmed).
    2. Phase 1: listed open PRs — none required immediate fixes at the start of this run.
    3. Phase 2: processed open issues in priority order and implemented fixes where feasible:
       - Issue #87 (P1): Implemented canonical URL fix
         - Files changed: `src/layouts/Layout.astro`, `src/pages/coins/[symbol].astro`, `src/pages/ko/coins/[symbol].astro`.
         - Local verification: `npm run build` completed successfully (build output: "Complete!").
         - Commit: 5b315f3fae34fa1596efb7223e842d3c26dbbb8e (branch: `fix/issue-87-seo-canonical-urls`).
         - PR opened: https://github.com/poong92/pruviq/pull/89
       - Issue #88 (P2): Added `lastmod` timestamps to sitemap entries and excluded `/ko/404/`
         - Files changed: `astro.config.mjs` (sitemap serialize)
         - Local verification: `npm run build` completed successfully (build output: "Complete!").
         - Commit: ae5cca7db9467a03f1c6de0acee5708a61039155 (branch: `fix/issue-88-sitemap-lastmod`).
         - PR opened: https://github.com/poong92/pruviq/pull/90
       - Issue #84: Added a diagnostic triage comment recommending manual review for PR #80 (content/workflow changes). Comment: https://github.com/poong92/pruviq/issues/84#issuecomment-3971037507
       - Issue #21: Added a diagnostic comment requesting ops to provision `BRAVE_API_KEY` and documenting how/where to add the secret. Comment: https://github.com/poong92/pruviq/issues/21#issuecomment-3971037881
    4. Phase 3: cleanup
       - Looked for stale PRs failing >3 runs with no progress  none met the criteria during this run.

  - Result:
    - PRs created: #89 (canonical fix) and #90 (sitemap lastmod). Both have CI checks running on GitHub (watch PR pages for results).
    - Local builds passed before commits (evidence: local `npm run build` outputs captured in build logs).
    - Issues #84 and #21 are blocked or require manual review; I left diagnostic comments with reproduction/next steps.

  - Next steps:
    - Monitor PR #89 and PR #90 for CI results and merge when green.
    - Ops must provision `BRAVE_API_KEY` to unblock issue #21 (research PoC). Once provided I will run the PoC and attach artifacts.

Generated by PRUVIQ Bot (프루빅) on 2026-02-27 15:36 KST.

- cron:gh-issues-autofix
  - Time: 2026-02-27 17:14 KST
  - Action requested: Fix failed PRs and process open issues (autonomous run)
  - What I did:
    1. Prepared workspace: `cd /Users/openclaw/pruviq && git checkout main && git pull origin main` — confirmed (command output showed local modifications: `M public/data/coin-metadata.json`, `M public/data/coins-stats.json`, `M public/data/macro.json`, `M public/data/market.json`, `M public/data/news.json`).
    2. Checked GitHub auth availability: `echo "$GH_TOKEN"` returned empty. I also inspected `~/.openclaw/openclaw.json` and `/data/.clawdbot/openclaw.json` for an apiKey under `skills.entries["gh-issues"].apiKey` — none found. Without GH_TOKEN I cannot perform authenticated GitHub operations (commenting, opening/closing PRs, pushing to forks via API).
    3. Listed open PRs (unauthenticated GitHub API): found 1 open PR — #92 (fix(issue-91): use CoinGecko /coins/list to supplement coin-metadata names, branch `fix/issue-91-coingecko-list-mapping`).
    4. Checked CI runs for the PR branch via Actions API: latest runs (validate-startup-files, Accessibility, E2E Tests) concluded `success` — no failed PR runs to fix.
    5. Listed open issues (unauthenticated GitHub API): issues found: #91 (label: P1) and #21 (no label). Issue #91 already has an open PR (#92) so skipped. Issue #21 is a chore requiring `BRAVE_API_KEY` to run the research PoC; it already contains multiple diagnostic comments from prior runs explaining the required ops steps.
    6. No code changes were applied in this run because (a) there were no failed PRs that required fixes, and (b) issue #21 is blocked on secret provisioning (ops action).

  - Result:
    - Processed 2 issues: 0 PRs opened, 0 PRs closed, 0 PRs fixed.
    - Blockers: Missing GH_TOKEN in the agent environment — unable to perform authenticated GitHub mutations (post comments, open/close PRs). Ops-owned task (#21) also blocked pending `BRAVE_API_KEY` provisioning.

  - Next steps (automated):
    - If GH_TOKEN is provided to the agent (as env GH_TOKEN or in `~/.openclaw/openclaw.json` under `skills.entries["gh-issues"].apiKey` or `/data/.clawdbot/openclaw.json`), re-run this cron. The agent will then:
      - Re-check open PRs and attempt fixes for any failing CI runs (download logs, diagnose, implement fixes, push branch, open PRs or comment as needed).
      - For issue #21, create a doc/PR or post a final diagnostic comment once authenticated and then move on.
    - Ops must provision `BRAVE_API_KEY` (repo secret or gateway env) to enable the research PoC referenced by issue #21.

  - Evidence (commands run):
    - `git remote get-url origin` -> `git@github.com:poong92/pruviq.git` (confirmed)
    - `git checkout main && git pull origin main` -> output contained the modified public/data files listed above (confirmed)
    - `echo "$GH_TOKEN"` -> empty (confirmed)
    - `curl https://api.github.com/repos/poong92/pruviq/pulls?state=open&per_page=100` -> returned PR #92 (confirmed)
    - `curl https://api.github.com/repos/poong92/pruviq/issues?state=open&per_page=50` -> returned issues #91 and #21 (confirmed)

Generated by PRUVIQ Bot (프루빅) on 2026-02-27 17:14 KST.

- cron:gh-issues-autofix
  - Time: 2026-02-27 18:14 KST
  - Action requested: Fix failed PRs and process open issues (autonomous run)
  - What I did:
    1. Prepared workspace and ensured `main` is current: `cd /Users/openclaw/pruviq && git checkout main && git pull origin main` (confirmed). Local git showed uncommitted changes in public/data/* and MEMORY.md prior to this run; I did not modify those files except to append this MEMORY.md entry.
    2. Listed open PRs: found PR #92 (head branch: `fix/issue-91-coingecko-list-mapping`). No open PRs had failing checks requiring fixes at this time (confirmed via `gh pr list --json statusCheckRollup`).
    3. Listed open issues: found #91 (P1) and #21 (chore). Issue #91 already has an open PR (#92) so it was skipped. Issue #21 is blocked by a missing BRAVE_API_KEY secret; I posted an updated diagnostic comment explaining the required provisioning steps and where the key is referenced in the repo: https://github.com/poong92/pruviq/issues/21#issuecomment-3971728900.
    4. No code changes or PRs were created in this run — the remaining work is ops-owned (secret provisioning) or CI-tracked (monitor PR #92).

  - Result:
    - Processed issues: 2 (skipped #91 due to existing PR, commented on #21).
    - PRs fixed/opened: 0
    - Comments posted: 1 (https://github.com/poong92/pruviq/issues/21#issuecomment-3971728900)
    - Blockers: BRAVE_API_KEY not provisioned (ops action required). 

  - Evidence (commands run):
    - `git checkout main && git pull origin main` (git output: "Already on 'main'" / "Your branch is up to date with 'origin/main'.")
    - `gh pr list --state open --json number,title,headRefName,statusCheckRollup,comments --repo poong92/pruviq` (returned PR #92)
    - `gh issue list --state open --limit 20 --json number,title,body,labels --repo poong92/pruviq` (returned issues #91 and #21)
    - `gh issue comment 21 --repo poong92/pruviq` -> posted comment: https://github.com/poong92/pruviq/issues/21#issuecomment-3971728900

  - Next steps:
    - Monitor PR #92 for CI results and merge when green.
    - Ops/SRE or repo owner to provision BRAVE_API_KEY as a GitHub Actions repository secret or Gateway/OpenClaw environment variable; once available I will re-run the research PoC and open any follow-up PRs with artifacts.

Generated by PRUVIQ Bot (프루빅) on 2026-02-27 18:14 KST.
