# PRUVIQ Content Strategy v1.0

## Branding Foundation (Confirmed 2026-02-14)

| Element | Value | Purpose |
|---------|-------|---------|
| Philosophy | "Don't Believe. Verify." | Core identity |
| Education CTA | "Raise Your Trading IQ" | Traffic driver (blog/articles) |
| Conversion CTA | "See Live Trades" | Telegram funnel |
| Brand Closer | "Pruv It." | Memorable sign-off |
| Section Name | "Trading IQ" | Blog/education section |

## 2-Pillar Content Architecture

### Pillar 1: Broad Traffic (SEO)
- **Target**: Crypto traders searching for education
- **Content**: Beginner guides, strategy explainers, fee comparisons
- **Frequency**: 2-3 posts/week
- **Goal**: Organic search traffic -> email/Telegram conversion

### Pillar 2: Niche Authority (AI Search + Expert)
- **Target**: Quant traders, strategy builders
- **Content**: Strategy library, backtest methodology, live performance data
- **Frequency**: Weekly strategy updates
- **Goal**: Position PRUVIQ as the "Quantpedia of transparency"

## Content Types

### Blog (Trading IQ)
- Education articles (beginner to advanced)
- Market analysis
- Strategy updates
- Weekly reviews
- Quant concepts

### Strategy Library
- Every tested strategy with full backtest data
- Live/killed/shelved status with honest analysis
- Code examples where appropriate
- Failure analysis (Graveyard integration)

### Telegram Channel
- Real-time trade alerts (automated)
- Daily market summaries (planned)
- Strategy change announcements

### Social Media (Planned)
- **Twitter/X** (60%): Daily insights, thread strategies, backtest charts
- **Telegram** (20%): Live trades + community
- **Instagram** (15%): Chart visuals, key stats
- **YouTube** (5%): Monthly deep dives

## Automation Pipeline (Planned)

```
RSS Feeds (CoinDesk, CoinTelegraph, Binance)
    ↓
n8n (Mac Mini) - Schedule + Orchestration
    ↓
Claude API - Analysis + Content Generation
    ↓
Draft Queue (Git branch)
    ↓
Human Review + Publish
    ↓
Auto-share to Social
```

### Estimated Cost: ~$30/month
- Claude API: ~$20/month
- n8n: Self-hosted (free)
- Infrastructure: Mac Mini (already owned)

## Monetization Roadmap

### Phase 1: Foundation (Month 0-3)
- Bybit referral (50% commission)
- Binance referral (20% fee discount)
- Content volume: 50+ articles, 10+ strategies documented

### Phase 2: Growth (Month 3-6)
- Add OKX, MEXC referrals
- Twitter/X to 1K followers
- Telegram to 500 subscribers

### Phase 3: Premium (Month 6+)
- Basic tier: $29/month (priority alerts, weekly reports)
- Pro tier: $99/month (full backtest data, strategy parameters)
- Gate: 5K followers before launching premium

## Current State (2026-02-15)

- **Blog articles**: 9 published
- **Strategies documented**: 5 (1 live, 2 killed, 2 shelved)
- **Pages**: 20 total (including strategy library)
- **SEO**: sitemap, robots.txt, llms.txt, JSON-LD, OG tags
- **Deploy**: Cloudflare Pages (auto from main branch)

## Next Steps

1. [ ] Set up n8n on Mac Mini for content automation
2. [ ] Create Twitter/X account (@PRUVIQ)
3. [ ] First automated daily market summary
4. [ ] Expand strategy library to 10 documented strategies
5. [ ] Add strategy performance charts/visualizations
6. [ ] Weekly content cadence: 2 blog + 1 strategy update
