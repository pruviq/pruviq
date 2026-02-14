---
name: "ATR Breakout"
description: "Average True Range based breakout detection. Shelved — did not outperform BB Squeeze in any tested configuration."
status: "shelved"
category: "breakout"
direction: "both"
difficulty: "intermediate"
timeframe: "1H"
dateAdded: "2026-01-18"
tags: ["atr", "breakout", "shelved"]
---

## Overview

ATR Breakout triggers trades when price moves beyond a multiple of ATR from the moving average, indicating a volatility breakout. Tested with both long and short configurations.

## Why It Was Shelved

- No configuration outperformed BB Squeeze
- Higher false signal rate in ranging markets
- Less precise squeeze detection compared to BB/KC combination

## Status: SHELVED

May be revisited as a complementary signal or in different market conditions.
