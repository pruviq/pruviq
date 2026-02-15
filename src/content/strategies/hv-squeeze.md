---
name: "Historical Volatility Squeeze"
description: "Uses Historical Volatility instead of Bollinger Bands to detect squeeze. Shelved — no significant edge over BB Squeeze."
status: "shelved"
category: "volatility"
direction: "short"
difficulty: "advanced"
timeframe: "1H"
dateAdded: "2026-01-15"
tags: ["historical-volatility", "squeeze", "shelved"]
---

## Overview

HV Squeeze replaces Bollinger Bands with Historical Volatility (HV) percentile to detect compression. When HV drops below its 20th percentile and then expands, a trade is triggered.

## Why It Was Shelved

After extensive testing, HV Squeeze showed no statistically significant improvement over BB Squeeze:

- Similar signal timing (85% overlap)
- Marginally different entries (< 0.3% difference in average entry price)
- No improvement in win rate or profit factor

Given that BB Squeeze is already validated with 2+ years of historical data across 500+ coins, adding a redundant signal source added complexity without edge.

## Potential Revisit

HV Squeeze could become relevant if:
- Market microstructure changes significantly
- BB Squeeze edge degrades below profitability
- Combining both signals shows diversification benefit

For now, simplicity wins.

## Status: SHELVED

Not actively traded or tested. May be revisited in future regime changes.
