BRAVE_API_KEY (Brave Search) — setup guide

Purpose

The research PoC and automation scripts (scripts/research_agent.py) use Brave Search's web_search API which requires an API key assigned to the BRAVE_API_KEY environment variable.

Where to set the secret

- Cloud / CI (recommended): add BRAVE_API_KEY to the CI/Gateway secrets used by the build/automation runner (e.g., Cloudflare Pages / OpenClaw Gateway / GitHub Actions). Keep it restricted (repo secrets or organization-level secret with limited access).
- Local development: add BRAVE_API_KEY to your local environment (e.g., export BRAVE_API_KEY="<your_key>") or use a .env file loaded by your local scripts (do NOT commit .env to the repo).

Files to check

- scripts/research_agent.py (PoC) — this script expects BRAVE_API_KEY. Confirmed at: (repo path: scripts/research_agent.py).
- reports/agent-research-YYYY-MM-DD.md — generated output will contain web_search results when the key is available.

Why this matters

Without BRAVE_API_KEY the automation will create a placeholder report. To run the research agent end-to-end and produce evidence-backed reports, the key must be available to the runner where the agent executes.

Security

- DO NOT commit keys to source control. Use the platform's secrets store.
- Limit scope and rotate keys periodically.

Next steps

1) Add BRAVE_API_KEY to the CI / Gateway / Cloud environment where the research runs are executed.
2) Re-run the research agent (or CI job). If you want, a maintainer can paste the run logs here and I will continue debugging.

If you want me to open a small PR that documents the environment variable in README.md or adds a sample .env.example, tell me and I will create it.
