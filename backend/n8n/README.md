# PRUVIQ n8n Workflows

Automated content generation for PRUVIQ blog.

## Architecture

```
Schedule → Data Collection → Ollama Generation → Fact Check → Human Review → Git Deploy
```

## Workflows

### 1. Weekly Review (`weekly-review-workflow.json`)
- **Schedule**: Monday 03:00 UTC
- **Data**: BTC price (Binance API) + PRUVIQ simulation stats (local API)
- **Generation**: Ollama qwen2.5:32b on Mac Mini
- **Fact Check**: Automated price/stats verification
- **Output**: Markdown file for human review

### 2. Strategy Update (planned)
- Triggered by new backtest results
- Compares current vs historical performance
- Generates strategy status update

### 3. Quant Education (planned)
- Bi-weekly educational content
- Topics from PRUVIQ methodology

## Setup

### Prerequisites
- n8n running on Mac Mini (port 5678)
- Ollama with qwen2.5:32b model (port 11434)
- PRUVIQ API running (port 8080)
- Telegram bot for notifications

### Import Workflow
1. Open n8n at http://localhost:5678
2. Settings → Import from file
3. Select `weekly-review-workflow.json`
4. Update Telegram chat ID in notification nodes
5. Activate workflow

## Hallucination Prevention Rules

1. **Data-only claims**: All numbers must come from API responses, not LLM generation
2. **No price predictions**: LLM must not forecast future prices
3. **Source citation**: Every stat must reference its data source
4. **Fact check gate**: Content blocked if fact check fails
5. **Human review**: All content requires manual approval before publishing
6. **Disclaimer required**: Every post must include "Not financial advice" disclaimer
