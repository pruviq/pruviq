Research agent (PoC) — BRAVE_API_KEY provisioning

Why
---
The research agent PoC can use the Brave Search API for broader web_search coverage. In this environment the key is optional; the PoC also works with public endpoints (Hacker News Algolia, arXiv, GitHub search).

How to provision
---
Choose one of the following (team-preferred option: add to the deployment/agent environment where the agent runs):

1) OpenClaw / Gateway environment
   - Add BRAVE_API_KEY as an environment variable to the OpenClaw gateway or the host running the agent.
   - Keep the key out of the repository.

2) CI / GitHub Actions (for scheduled reports)
   - Add a repository secret named BRAVE_API_KEY (Settings → Secrets → Actions).
   - Update the CI job to export BRAVE_API_KEY into the runner environment before running the research script.

3) Local development
   - Export locally while testing: export BRAVE_API_KEY="<your-key>"

Security
---
- Never commit API keys to the repo.
- Use repository secrets or the deployment host's secret store (recommended).

Next steps
---
- Ops/SRE or the repo owner should provision the secret in the appropriate place and confirm with the team. After provisioning, the research script and automated cron can run with the additional Brave results.

References
---
- scripts/research_agent.py (PoC that uses public endpoints; does not require the key)
- reports/agent-research-2026-02-23.md (current PoC report; mentions BRAVE_API_KEY)
