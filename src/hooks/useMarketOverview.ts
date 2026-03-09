import { useState, useEffect, useRef } from "preact/hooks";
import { STATIC_DATA, fetchWithFallback } from "../config/api";

type MarketData = {
  btc_price: number;
  btc_change_24h: number;
  eth_price: number;
  eth_change_24h: number;
  fear_greed_index: number;
  fear_greed_label: string;
  total_market_cap_b: number;
  btc_dominance: number;
  total_volume_24h_b: number;
  top_gainers?: any[];
  top_losers?: any[];
  generated: string;
};

const POLL_MS = 300_000; // 5 minutes
const STALE_POLL_MS = 60_000; // 1 minute when data is stale

export function useMarketOverview() {
  const [market, setMarket] = useState<MarketData | null>(null);
  const [error, setError] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchMarket = () => {
    fetchWithFallback("/market", STATIC_DATA.market)
      .then((d: MarketData) => {
        setMarket(d);
        setError(false);
      })
      .catch(() => setError(true));
  };

  useEffect(() => {
    fetchMarket();
    intervalRef.current = setInterval(fetchMarket, POLL_MS);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  // Poll faster when data is stale (>30min old)
  useEffect(() => {
    if (!market?.generated) return;
    const ageMs = Date.now() - new Date(market.generated).getTime();
    const isStale = ageMs > 30 * 60 * 1000;
    const desiredInterval = isStale ? STALE_POLL_MS : POLL_MS;
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(fetchMarket, desiredInterval);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [market?.generated]);

  return { market, error, retry: fetchMarket };
}
