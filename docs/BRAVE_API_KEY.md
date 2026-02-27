BRAVE_API_KEY — provisioning instructions

Why this secret is needed

- The research PoC and certain automated agent tasks may call the Brave Search API for evidence-backed web searches. The service requires an API key provided via the environment variable BRAVE_API_KEY.

Where to add the secret

Option A — GitHub Actions repository secret (recommended)
1. Go to the repository on GitHub: https://github.com/poong92/pruviq
2. Settings → Secrets and variables → Actions → New repository secret
3. Name: BRAVE_API_KEY
4. Value: (paste the API key)
5. Save

Notes:
- This will make the secret available to GitHub Actions workflows as ${{ secrets.BRAVE_API_KEY }}.
- Do NOT commit the key to the repo or any public file.

Option B — OpenClaw / Gateway environment (if using the agent runtime)
- If you prefer the agent runtime to have the key directly (so jobs spawned by OpenClaw can read it), add it to the OpenClaw credentials store or gateway environment.
- Two common locations used by the agent tooling:
  - ~/.openclaw/openclaw.json → under skills.entries["gh-issues"].apiKey (only if the deployment expects it there)
  - /data/.clawdbot/openclaw.json → same structure (used for system-wide secrets on the gateway host)

Example (do NOT paste actual secret into repo):
{
  "skills": {
    "entries": {
      "gh-issues": {
        "apiKey": "<REDACTED_BRAVE_API_KEY>"
      }
    }
  }
}

Option C — Vault / external secret manager
- You may prefer to store the key in an external vault (HashiCorp Vault, AWS Secrets Manager, etc.) and inject it into the runtime via your CI or deployment pipeline. Ensure the runtime exposes BRAVE_API_KEY to the job/container that runs the research PoC.

Testing & Validation

- After adding the secret to GitHub Actions, re-run the research PoC job or trigger the workflow that uses the key. The job should detect the variable ${{ secrets.BRAVE_API_KEY }} and succeed when the key is valid.
- Locally (for ops/dev use), you can test with:
  - export BRAVE_API_KEY="<your-key>"
  - python3 scripts/research_agent.py --out reports/agent-research-test.md

Security notes

- Treat BRAVE_API_KEY as sensitive. Rotate the key if it is accidentally exposed.
- Limit secret access via fine-grained GitHub Teams/Permissions where possible.

If you want me to add a CI check that fails early when BRAVE_API_KEY is missing, I can open a follow-up PR that adds a lightweight workflow step to fail fast and provide a clear error message for maintainers.
