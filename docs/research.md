# Research Agent — Brave Search API (BRAVE_API_KEY)

This document explains how to enable optional Brave Search integration for the research PoC (scripts/research_agent.py).

Why this matters
- The research PoC aggregates signals from public sources. Brave Search can provide additional web search coverage but requires an API key (BRAVE_API_KEY).

How to enable

1) Local development

Export the key in your shell before running the script:

```bash
export BRAVE_API_KEY="your_brave_api_key_here"
python3 scripts/research_agent.py --out reports/agent-research.md
```

2) GitHub Actions (CI)

Add `BRAVE_API_KEY` to your repository Secrets (Settings → Secrets → Actions). Then expose it in your workflow step:

```yaml
jobs:
  research:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run research agent
        env:
          BRAVE_API_KEY: ${{ secrets.BRAVE_API_KEY }}
        run: |
          python3 scripts/research_agent.py --out reports/agent-research-$(date +%F).md
```

3) OpenClaw / Gateway environments

If you run agents inside OpenClaw or a managed Gateway, ask your ops/SRE team to provision the BRAVE_API_KEY in the environment used by the job. Do NOT commit secrets to the repository. If you need help, assign the issue to ops-sre or JEPO.

Non-breaking default

- The research PoC runs with no API keys by default using public sources (Hacker News Algolia, arXiv, GitHub). If `BRAVE_API_KEY` is not set, Brave Search results are skipped and a clear message is included in the generated report.

Security

- Treat API keys as sensitive. Use CI secrets or a secrets manager.
- Avoid printing full secret values in logs. The research agent only detects presence/absence.

Notes

- This repository does not store or manage the Brave API key. Provisioning the key is an ops action.
- For now, Brave Search integration is optional and not required for the PoC to run.
