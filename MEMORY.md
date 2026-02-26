# MEMORY.md - PRUVIQ Project Knowledge

Last updated: 2026-02-26 00:00 KST

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

Generated and committed by PRUVIQ Bot on 2026-02-24 03:59 KST.

## Pending Tasks

(Update this section as tasks are completed or added)
- [ ] SEO: meta tags optimization
- [ ] i18n: complete learn page translations
- [ ] Mobile: touch targets 44px minimum
- [ ] Trust: add more trust signals

Notes: Quick-wins copy (hero/nav) applied and meta.index_desc synced with hero.desc on 2026-02-21. See JEPO Review for details.

## CRON RUN LOGS

- cron:63c0583a-741f-4b76-9f53-861ab7456f81 (gh-issues-autofix)
  - Time: 2026-02-26 10:30 KST
  - Actor: PRUVIQ Bot (프루빅)
  - Goal: Process open GitHub issues and apply low-risk fixes / triage blocked items

  - What I did (summary):
    1. git pull origin main (local workspace updated)
    2. Fetched open issues via GitHub API and processed them in priority order (P0 → P1 → P2)
    3. For each issue I either implemented a safe fix, created a small tooling/docs change, or left a detailed triage comment requesting artifacts (logs, Lighthouse traces, or secrets) when external access was required.

  - Fixes / PRs opened (evidence: created PRs listed on the repository):
    - #55 fix(40): mark inline client scripts as module (defer) to reduce main-thread blocking
      - Branch: fix/issue-40-minimize-main-thread
      - Files changed (confirmed): src/pages/coins/index.astro, src/pages/ko/coins/index.astro, src/pages/ko/market/index.astro, src/pages/ko/simulate/index.astro, src/pages/ko/strategies/compare.astro, src/pages/market/index.astro, src/pages/simulate/index.astro, src/pages/strategies/compare.astro
      - PR: https://github.com/poong92/pruviq/pull/55 (confirmed via GitHub API)
      - Build: npm run build passed (confirmed in build output during the branch test)

    - #56 test(repro): add manifest validator + npm script
      - Branch: fix/issue-12-repro-manifest-tests
      - Files changed (confirmed): scripts/validate_repro.cjs
      - PR: https://github.com/poong92/pruviq/pull/56
      - Test: npm run validate:repro passed locally (script verified manifests under public/data/reproducible)

    - #57 docs: document BRAVE_API_KEY provisioning and usage
      - Branch: fix/issue-51-document-brave-api-key
      - Files changed: docs/BRAVE_API_KEY.md
      - PR: https://github.com/poong92/pruviq/pull/57

    - #58 i18n: add i18n sync helper + auto-fill missing ko translations
      - Branch: fix/issue-10-i18n-learn
      - Files changed: scripts/i18n_sync.cjs (tooling to detect and auto-fill missing keys)
      - PR: https://github.com/poong92/pruviq/pull/58
      - Note: the script found 0 missing keys at this time (no auto-fill applied)

    - #59 docs(11): document mobile touch-target rule (global.css)
      - Branch: fix/issue-11-touch-targets
      - Files changed: docs/MOBILE_TOUCH_TARGETS.md
      - PR: https://github.com/poong92/pruviq/pull/59
      - Diagnosis: global CSS already contains min-height:44px rules (confirmed in src/styles/global.css)

    - #60 docs(seo): add SEO audit checklist + sitemap/meta checks
      - Branch: fix/issue-9-seo-audit-doc
      - Files changed: docs/SEO_AUDIT.md
      - PR: https://github.com/poong92/pruviq/pull/60
      - Diagnosis: astro.config.mjs already includes @astrojs/sitemap and sitemap-index.xml is published (confirmed via curl https://pruviq.com/sitemap-index.xml)

    - #61 a11y: improve contrast on /simulate loading text
      - Branch: fix/issue-8-a11y-simulate
      - Files changed: src/pages/simulate/index.astro (changed loading caption from --color-text-muted to --color-text)
      - PR: https://github.com/poong92/pruviq/pull/61
      - Build: npm run build passed (confirmed in build output)

  - Blocked / triaged items (require external artifacts or ops access):
    - #7 (P0) OPS: /coins/stats returning 503 — needs origin logs and Cloudflare edge logs
      - Bot comment: https://github.com/poong92/pruviq/issues/7#issuecomment-3963328580
      - What I requested: Cloudflare edge logs, origin app logs, Sentry traces, recent deploy hashes, and reproducer curl outputs

    - #19 OPS: api.pruviq.com returning 502/503 — needs origin logs and traces
      - Bot comment: https://github.com/poong92/pruviq/issues/19#issuecomment-3963347357

    - #21 chore(research): enable BRAVE_API_KEY for automated agent research — requires secret provisioning
      - Bot comment: https://github.com/poong92/pruviq/issues/21#issuecomment-3963346600
      - Action taken: added docs/BRAVE_API_KEY.md (PR #57) explaining where to set the secret

    - Auto-discovered Lighthouse/audit issues (#39, #45, #46, #52, #53, #54)
      - For each I left a triage comment requesting Lighthouse trace.json / HAR outputs and which page(s) to prioritize. Example comment posted on #54: https://github.com/poong92/pruviq/issues/54#issuecomment-3963362789
      - Rationale: targeted performance fixes require trace analysis (long tasks, script filenames/stack traces). I performed low-risk changes already (defer module scripts: PR #55) but need traces to propose surgical fixes.

  - Next steps / recommendations:
    1. Ops: provide Cloudflare/origin logs or Sentry traces for #7 and #19 so I can root-cause the 5xxs and propose a fix.
    2. Owner/maintainer: approve or review the small PRs (55–61). I ran npm run build on branches and builds passed; once merged we should re-run the Lighthouse audits.
    3. For performance issues: collect Lighthouse trace.json artifacts (DevTools > Performance > Save trace) for the pages with low scores and attach them to the issue; I will analyze and implement targeted code-splits / lazy-loads.
    4. Optional: add the SEO audit script to CI (daily) to detect regressions early (I added docs/SEO_AUDIT.md with the quick commands).

  - Evidence sources / confirmations:
    - Created PRs and branches (confirmed via GitHub API): PRs #55, #56, #57, #58, #59, #60, #61 (see PR URLs above)
    - File edits confirmed in repository (examples): src/pages/simulate/index.astro (changed loading caption), scripts/validate_repro.cjs (new validator), docs/BRAVE_API_KEY.md (new docs) — (confirmed by reading files in the workspace)
    - Build confirmations: observed successful npm run build output for branches during testing (build logs show Vite build success and generated dist files)

Generated and recorded by PRUVIQ Bot (프루빅) on 2026-02-26 10:30 KST.


## Recent Automation Update (legacy)

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

Generated and committed by PRUVIQ Bot on 2026-02-24 03:59 KST.
