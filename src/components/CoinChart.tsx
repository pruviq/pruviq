import { useState, useEffect, useRef } from 'preact/hooks';
import DiscreteSlider from './DiscreteSlider';

interface OhlcvBar {
  t: number;
  o: number;
  h: number;
  l: number;
  c: number;
  v: number;
  bb_upper: number | null;
  bb_lower: number | null;
  bb_mid: number | null;
  ema20: number | null;
  ema50: number | null;
  vol_ratio: number | null;
}

interface TradeDetail {
  entry_time: number;
  entry_price: number;
  exit_time: number;
  exit_price: number;
  pnl_pct: number;
  exit_reason: string;
  bars_held: number;
}

interface SimResult {
  symbol: string;
  total_trades: number;
  win_rate: number;
  profit_factor: number;
  total_return_pct: number;
  max_drawdown_pct: number;
  tp_count: number;
  sl_count: number;
  timeout_count: number;
  trades: TradeDetail[];
}

const SL_VALUES = [5, 7, 8, 10, 12];
const TP_VALUES = [4, 6, 8, 10, 12];
const DEFAULT_SL = 10;
const DEFAULT_TP = 8;
const API_URL = import.meta.env.PUBLIC_PRUVIQ_API_URL || '';

const labels = {
  en: {
    apply: 'Apply Strategy',
    resim: 'Re-simulate',
    bbBands: 'BB Bands',
    ema: 'EMA 20/50',
    volume: 'Volume',
    sl: 'STOP LOSS',
    tp: 'TAKE PROFIT',
    strategy: 'BB Squeeze SHORT',
    loading: 'Loading chart data...',
    simLoading: 'Simulating...',
    error: 'Failed to load data.',
    noTrades: 'Apply a strategy to see trade signals on the chart.',
    trades: 'Trade History',
    entry: 'Entry',
    exit: 'Exit',
    result: 'Result',
    pnl: 'PnL',
    bars: 'Bars',
    winRate: 'Win Rate',
    pf: 'Profit Factor',
    totalReturn: 'Total Return',
    maxDD: 'Max Drawdown',
    tradesLabel: 'trades',
    live: 'CURRENT LIVE SETTINGS',
    h24high: '24h High',
    h24low: '24h Low',
    h24vol: '24h Volume',
    resetZoom: 'Reset',
    open: 'O',
    high: 'H',
    low: 'L',
    close: 'C',
    vol: 'Vol',
    change: 'Chg',
    dataRange: 'Data Range',
    disclaimer: 'Simulation includes 0.04% fees + 0.02% slippage. Past performance does not guarantee future results.',
  },
  ko: {
    apply: '전략 적용',
    resim: '재시뮬레이션',
    bbBands: 'BB 밴드',
    ema: 'EMA 20/50',
    volume: '거래량',
    sl: '손절 (STOP LOSS)',
    tp: '익절 (TAKE PROFIT)',
    strategy: 'BB Squeeze SHORT',
    loading: '차트 데이터 로딩 중...',
    simLoading: '시뮬레이션 중...',
    error: '데이터 로딩 실패.',
    noTrades: '전략을 적용하면 차트에 매매 신호가 표시됩니다.',
    trades: '거래 내역',
    entry: '진입',
    exit: '청산',
    result: '결과',
    pnl: 'PnL',
    bars: '봉',
    winRate: '승률',
    pf: '수익 팩터',
    totalReturn: '총 수익률',
    maxDD: '최대 드로다운',
    tradesLabel: '건',
    live: '현재 라이브 설정',
    h24high: '24h 고가',
    h24low: '24h 저가',
    h24vol: '24h 거래량',
    resetZoom: '초기화',
    open: '시',
    high: '고',
    low: '저',
    close: '종',
    vol: '거래량',
    change: '변동',
    dataRange: '데이터 범위',
    disclaimer: '시뮬레이션은 0.04% 수수료 + 0.02% 슬리피지를 포함합니다. 과거 성과는 미래 결과를 보장하지 않습니다.',
  },
};

function formatPrice(p: number): string {
  if (p >= 10000) return p.toLocaleString(undefined, { maximumFractionDigits: 1 });
  if (p >= 1000) return p.toLocaleString(undefined, { maximumFractionDigits: 2 });
  if (p >= 1) return p.toFixed(3);
  if (p >= 0.01) return p.toFixed(5);
  return p.toFixed(7);
}

function formatVol(v: number): string {
  if (v >= 1e9) return `${(v / 1e9).toFixed(2)}B`;
  if (v >= 1e6) return `${(v / 1e6).toFixed(2)}M`;
  if (v >= 1e3) return `${(v / 1e3).toFixed(1)}K`;
  return v.toFixed(1);
}

function formatTime(unix: number): string {
  const d = new Date(unix * 1000);
  return `${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getDate().toString().padStart(2, '0')} ${d.getHours().toString().padStart(2, '0')}:00`;
}

function formatDateRange(startUnix: number, endUnix: number): string {
  const s = new Date(startUnix * 1000);
  const e = new Date(endUnix * 1000);
  const fmt = (d: Date) => `${d.getFullYear()}-${(d.getMonth()+1).toString().padStart(2,'0')}-${d.getDate().toString().padStart(2,'0')}`;
  return `${fmt(s)} ~ ${fmt(e)}`;
}

function MetricBox({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div style={{
      padding: '0.625rem',
      borderRadius: '0.375rem',
      backgroundColor: 'rgba(17, 17, 17, 0.8)',
      border: '1px solid var(--color-border)',
    }}>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.5625rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' as const, letterSpacing: '0.05em', marginBottom: '0.125rem' }}>{label}</div>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1rem', fontWeight: 700, color }}>{value}</div>
    </div>
  );
}

// Toggle button component
function ToggleBtn({ active, activeColor, label, onClick }: { active: boolean; activeColor: string; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '0.3rem 0.625rem',
        borderRadius: '0.25rem',
        border: `1px solid ${active ? activeColor : 'var(--color-border)'}`,
        backgroundColor: active ? `${activeColor}15` : 'transparent',
        color: active ? activeColor : 'var(--color-text-muted)',
        fontFamily: 'var(--font-mono)',
        fontSize: '0.6875rem',
        cursor: 'pointer',
        transition: 'all 0.15s',
      }}
    >
      {label}
    </button>
  );
}

export default function CoinChart({ symbol, lang = 'en' }: { symbol: string; lang?: 'en' | 'ko' }) {
  const t = labels[lang] || labels.en;
  const SYMBOL = symbol.toUpperCase();

  const [ohlcv, setOhlcv] = useState<OhlcvBar[] | null>(null);
  const [simResult, setSimResult] = useState<SimResult | null>(null);
  const [sl, setSl] = useState(DEFAULT_SL);
  const [tp, setTp] = useState(DEFAULT_TP);
  const [showBB, setShowBB] = useState(true);
  const [showEMA, setShowEMA] = useState(false);
  const [showVol, setShowVol] = useState(true);
  const [loading, setLoading] = useState(true);
  const [simLoading, setSimLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showTrades, setShowTrades] = useState(false);
  const [crosshairData, setCrosshairData] = useState<OhlcvBar | null>(null);

  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<any>(null);
  const candleSeriesRef = useRef<any>(null);
  const bbUpperRef = useRef<any>(null);
  const bbMidRef = useRef<any>(null);
  const bbLowerRef = useRef<any>(null);
  const ema20Ref = useRef<any>(null);
  const ema50Ref = useRef<any>(null);
  const volumeSeriesRef = useRef<any>(null);
  const ohlcvMapRef = useRef<Map<number, OhlcvBar>>(new Map());
  const autoSimDoneRef = useRef(false);

  // Load OHLCV data
  useEffect(() => {
    const url = API_URL ? `${API_URL}/ohlcv/${SYMBOL}?limit=3000` : `/ohlcv/${SYMBOL}?limit=3000`;
    fetch(url)
      .then(res => {
        if (!res.ok) throw new Error('Failed');
        return res.json();
      })
      .then(json => {
        setOhlcv(json.data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [SYMBOL]);

  // Initialize chart
  useEffect(() => {
    if (!ohlcv || !chartContainerRef.current) return;
    let disposed = false;

    // Build lookup map for crosshair
    const map = new Map<number, OhlcvBar>();
    for (const bar of ohlcv) map.set(bar.t, bar);
    ohlcvMapRef.current = map;

    import('lightweight-charts').then(({ createChart, CandlestickSeries, LineSeries, HistogramSeries }) => {
      if (disposed || !chartContainerRef.current) return;

      const chart = createChart(chartContainerRef.current, {
        width: chartContainerRef.current.clientWidth,
        height: 480,
        layout: {
          background: { color: '#0a0a0a' },
          textColor: '#666666',
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 11,
        },
        grid: {
          vertLines: { color: '#131313' },
          horzLines: { color: '#131313' },
        },
        rightPriceScale: {
          borderColor: '#1a1a1a',
          scaleMargins: { top: 0.05, bottom: 0.25 },
        },
        timeScale: {
          borderColor: '#1a1a1a',
          timeVisible: true,
          secondsVisible: false,
          rightOffset: 5,
          barSpacing: 6,
        },
        crosshair: {
          mode: 0,
          vertLine: { color: '#00ff8833', width: 1, style: 2, labelBackgroundColor: '#111' },
          horzLine: { color: '#00ff8833', width: 1, style: 2, labelBackgroundColor: '#111' },
        },
        watermark: {
          visible: true,
          text: `${SYMBOL.replace('USDT', '')}/USDT`,
          fontSize: 48,
          color: 'rgba(255,255,255,0.03)',
        },
      });

      // Candles
      const candleSeries = chart.addSeries(CandlestickSeries, {
        upColor: '#00ff88',
        downColor: '#ff4444',
        wickUpColor: '#00ff88',
        wickDownColor: '#ff4444',
        borderVisible: false,
        priceFormat: { type: 'price', minMove: ohlcv[0]?.c < 0.01 ? 0.0000001 : ohlcv[0]?.c < 1 ? 0.00001 : 0.01 },
      });
      candleSeries.setData(ohlcv.map(b => ({ time: b.t as any, open: b.o, high: b.h, low: b.l, close: b.c })));
      candleSeriesRef.current = candleSeries;

      // BB Bands
      const bbUpper = chart.addSeries(LineSeries, { color: 'rgba(100,150,255,0.5)', lineWidth: 1, priceLineVisible: false, lastValueVisible: false, crosshairMarkerVisible: false });
      const bbMid = chart.addSeries(LineSeries, { color: 'rgba(100,150,255,0.25)', lineWidth: 1, lineStyle: 2, priceLineVisible: false, lastValueVisible: false, crosshairMarkerVisible: false });
      const bbLower = chart.addSeries(LineSeries, { color: 'rgba(100,150,255,0.5)', lineWidth: 1, priceLineVisible: false, lastValueVisible: false, crosshairMarkerVisible: false });

      const bbUpperData = ohlcv.filter(b => b.bb_upper != null).map(b => ({ time: b.t as any, value: b.bb_upper! }));
      const bbMidData = ohlcv.filter(b => b.bb_mid != null).map(b => ({ time: b.t as any, value: b.bb_mid! }));
      const bbLowerData = ohlcv.filter(b => b.bb_lower != null).map(b => ({ time: b.t as any, value: b.bb_lower! }));
      bbUpper.setData(bbUpperData);
      bbMid.setData(bbMidData);
      bbLower.setData(bbLowerData);
      bbUpperRef.current = bbUpper;
      bbMidRef.current = bbMid;
      bbLowerRef.current = bbLower;

      // EMA
      const ema20 = chart.addSeries(LineSeries, { color: '#ffaa00', lineWidth: 1, priceLineVisible: false, lastValueVisible: false, visible: false, crosshairMarkerVisible: false });
      const ema50 = chart.addSeries(LineSeries, { color: '#aa66ff', lineWidth: 1, priceLineVisible: false, lastValueVisible: false, visible: false, crosshairMarkerVisible: false });
      const ema20Data = ohlcv.filter(b => b.ema20 != null).map(b => ({ time: b.t as any, value: b.ema20! }));
      const ema50Data = ohlcv.filter(b => b.ema50 != null).map(b => ({ time: b.t as any, value: b.ema50! }));
      ema20.setData(ema20Data);
      ema50.setData(ema50Data);
      ema20Ref.current = ema20;
      ema50Ref.current = ema50;

      // Volume
      const volumeSeries = chart.addSeries(HistogramSeries, {
        priceFormat: { type: 'volume' },
        priceScaleId: 'volume',
      });
      chart.priceScale('volume').applyOptions({
        scaleMargins: { top: 0.82, bottom: 0 },
      });
      volumeSeries.setData(ohlcv.map(b => ({
        time: b.t as any,
        value: b.v,
        color: b.c >= b.o ? 'rgba(0,255,136,0.25)' : 'rgba(255,68,68,0.25)',
      })));
      volumeSeriesRef.current = volumeSeries;

      // Crosshair move handler
      chart.subscribeCrosshairMove((param: any) => {
        if (!param || !param.time) {
          setCrosshairData(null);
          return;
        }
        const bar = ohlcvMapRef.current.get(param.time as number);
        if (bar) setCrosshairData(bar);
      });

      chartRef.current = chart;
      chart.timeScale().fitContent();

      // Responsive
      const ro = new ResizeObserver(entries => {
        for (const entry of entries) chart.applyOptions({ width: entry.contentRect.width });
      });
      ro.observe(chartContainerRef.current);

      return () => ro.disconnect();
    });

    return () => {
      disposed = true;
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
      }
    };
  }, [ohlcv]);

  // Toggle BB bands visibility
  useEffect(() => {
    if (bbUpperRef.current) {
      bbUpperRef.current.applyOptions({ visible: showBB });
      bbMidRef.current?.applyOptions({ visible: showBB });
      bbLowerRef.current?.applyOptions({ visible: showBB });
    }
  }, [showBB]);

  // Toggle EMA visibility
  useEffect(() => {
    if (ema20Ref.current) {
      ema20Ref.current.applyOptions({ visible: showEMA });
      ema50Ref.current?.applyOptions({ visible: showEMA });
    }
  }, [showEMA]);

  // Toggle Volume visibility
  useEffect(() => {
    if (volumeSeriesRef.current) {
      volumeSeriesRef.current.applyOptions({ visible: showVol });
    }
  }, [showVol]);

  // Apply strategy simulation
  const runSimulation = async () => {
    setSimLoading(true);
    try {
      const url = API_URL ? `${API_URL}/simulate/coin` : '/simulate/coin';
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbol: SYMBOL, sl_pct: sl, tp_pct: tp }),
      });
      if (!res.ok) throw new Error('Simulation failed');
      const result: SimResult = await res.json();
      setSimResult(result);

      // Add markers to chart
      if (candleSeriesRef.current && result.trades.length > 0) {
        const markers: any[] = [];
        for (const trade of result.trades) {
          markers.push({
            time: trade.entry_time as any,
            position: 'aboveBar',
            shape: 'arrowDown',
            color: '#ff6666',
            text: 'S',
          });
          const exitColor = trade.exit_reason === 'tp' ? '#00ff88' : trade.exit_reason === 'sl' ? '#ff4444' : '#888888';
          const exitText = trade.exit_reason === 'tp' ? `TP` : trade.exit_reason === 'sl' ? `SL` : `TO`;
          markers.push({
            time: trade.exit_time as any,
            position: 'belowBar',
            shape: 'arrowUp',
            color: exitColor,
            text: exitText,
          });
        }
        markers.sort((a, b) => a.time - b.time);
        candleSeriesRef.current.setMarkers(markers);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSimLoading(false);
    }
  };

  // Auto-run simulation on first load
  useEffect(() => {
    if (ohlcv && !autoSimDoneRef.current && chartRef.current) {
      autoSimDoneRef.current = true;
      // Small delay to let chart render first
      setTimeout(() => runSimulation(), 300);
    }
  }, [ohlcv, chartRef.current]);

  if (loading) {
    return <div style={{ padding: '3rem 0', textAlign: 'center', fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>{t.loading}</div>;
  }
  if (error || !ohlcv) {
    return <div style={{ padding: '2rem', textAlign: 'center', fontFamily: 'var(--font-mono)', color: 'var(--color-red)', fontSize: '0.875rem' }}>{t.error}</div>;
  }

  const lastBar = ohlcv[ohlcv.length - 1];
  const prevBar = ohlcv.length >= 2 ? ohlcv[ohlcv.length - 2] : lastBar;
  const change = prevBar.c ? ((lastBar.c - prevBar.c) / prevBar.c * 100) : 0;
  const isDefault = sl === DEFAULT_SL && tp === DEFAULT_TP;

  // 24h stats (last 24 bars)
  const last24 = ohlcv.slice(-24);
  const high24 = Math.max(...last24.map(b => b.h));
  const low24 = Math.min(...last24.map(b => b.l));
  const vol24 = last24.reduce((s, b) => s + b.v, 0);

  // Data for crosshair overlay
  const displayBar = crosshairData || lastBar;
  const displayChange = crosshairData && ohlcv.length > 1
    ? ((crosshairData.c - crosshairData.o) / crosshairData.o * 100)
    : change;

  return (
    <div>
      {/* Header — Price + 24h Stats */}
      <div style={{ marginBottom: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
          <h1 style={{ fontSize: '1.375rem', fontWeight: 700, fontFamily: 'var(--font-mono)', margin: 0 }}>
            {SYMBOL.replace('USDT', '')}<span style={{ color: 'var(--color-text-muted)', fontWeight: 400 }}>/USDT</span>
          </h1>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '1.25rem', fontWeight: 600 }}>
            ${formatPrice(lastBar.c)}
          </span>
          <span style={{
            fontFamily: 'var(--font-mono)', fontSize: '0.8125rem', fontWeight: 600,
            color: change >= 0 ? 'var(--color-accent)' : 'var(--color-red)',
            backgroundColor: change >= 0 ? 'rgba(0,255,136,0.1)' : 'rgba(255,68,68,0.1)',
            padding: '0.125rem 0.5rem', borderRadius: '0.25rem',
          }}>
            {change > 0 ? '+' : ''}{change.toFixed(2)}%
          </span>
        </div>
        {/* 24h stats row */}
        <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--color-text-muted)' }}>
          <span>{t.h24high}: <span style={{ color: 'var(--color-accent)' }}>${formatPrice(high24)}</span></span>
          <span>{t.h24low}: <span style={{ color: 'var(--color-red)' }}>${formatPrice(low24)}</span></span>
          <span>{t.h24vol}: <span style={{ color: 'var(--color-text)' }}>{formatVol(vol24)}</span></span>
          <span>{t.dataRange}: {formatDateRange(ohlcv[0].t, lastBar.t)}</span>
        </div>
      </div>

      {/* Chart Container */}
      <div style={{
        backgroundColor: '#0a0a0a',
        border: '1px solid var(--color-border)',
        borderRadius: '0.75rem',
        overflow: 'hidden',
        marginBottom: '0.75rem',
        position: 'relative',
      }}>
        {/* OHLCV Overlay — top left */}
        <div style={{
          position: 'absolute',
          top: '0.5rem',
          left: '0.75rem',
          zIndex: 10,
          fontFamily: 'var(--font-mono)',
          fontSize: '0.6875rem',
          display: 'flex',
          gap: '0.625rem',
          flexWrap: 'wrap',
          pointerEvents: 'none',
        }}>
          <span style={{ color: '#666' }}>{t.open} <span style={{ color: 'var(--color-text)' }}>{formatPrice(displayBar.o)}</span></span>
          <span style={{ color: '#666' }}>{t.high} <span style={{ color: 'var(--color-accent)' }}>{formatPrice(displayBar.h)}</span></span>
          <span style={{ color: '#666' }}>{t.low} <span style={{ color: 'var(--color-red)' }}>{formatPrice(displayBar.l)}</span></span>
          <span style={{ color: '#666' }}>{t.close} <span style={{ color: displayBar.c >= displayBar.o ? 'var(--color-accent)' : 'var(--color-red)' }}>{formatPrice(displayBar.c)}</span></span>
          <span style={{ color: '#666' }}>{t.vol} <span style={{ color: 'var(--color-text-muted)' }}>{formatVol(displayBar.v)}</span></span>
          <span style={{
            color: displayChange >= 0 ? 'var(--color-accent)' : 'var(--color-red)',
            fontWeight: 600,
          }}>
            {displayChange > 0 ? '+' : ''}{displayChange.toFixed(2)}%
          </span>
        </div>

        {/* Indicator toggles + zoom reset — top right */}
        <div style={{
          position: 'absolute',
          top: '0.5rem',
          right: '0.75rem',
          zIndex: 10,
          display: 'flex',
          gap: '0.375rem',
        }}>
          <ToggleBtn active={showBB} activeColor="rgba(100,150,255,0.8)" label={t.bbBands} onClick={() => setShowBB(!showBB)} />
          <ToggleBtn active={showEMA} activeColor="#ffaa00" label={t.ema} onClick={() => setShowEMA(!showEMA)} />
          <ToggleBtn active={showVol} activeColor="rgba(0,255,136,0.6)" label={t.volume} onClick={() => setShowVol(!showVol)} />
          <button
            onClick={() => chartRef.current?.timeScale().fitContent()}
            style={{
              padding: '0.3rem 0.5rem',
              borderRadius: '0.25rem',
              border: '1px solid var(--color-border)',
              backgroundColor: 'rgba(17,17,17,0.8)',
              color: 'var(--color-text-muted)',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.6875rem',
              cursor: 'pointer',
            }}
          >
            {t.resetZoom}
          </button>
        </div>

        {/* Chart */}
        <div ref={chartContainerRef} style={{ width: '100%', height: '480px' }} />

        {/* TradingView Attribution — bottom right */}
        <div style={{
          position: 'absolute',
          bottom: '0.375rem',
          right: '0.75rem',
          zIndex: 10,
          fontFamily: 'var(--font-mono)',
          fontSize: '0.5625rem',
          pointerEvents: 'auto',
        }}>
          <a
            href="https://www.tradingview.com/"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: '#444', textDecoration: 'none' }}
          >
            Powered by TradingView
          </a>
        </div>
      </div>

      {/* Strategy Controls */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '0.75rem',
        alignItems: 'center',
        marginBottom: '1rem',
        padding: '0.75rem 1rem',
        backgroundColor: 'var(--color-bg-card)',
        border: '1px solid var(--color-border)',
        borderRadius: '0.75rem',
      }}>
        <span style={{
          fontFamily: 'var(--font-mono)', fontSize: '0.625rem', color: 'var(--color-accent)',
          letterSpacing: '0.1em', textTransform: 'uppercase' as const, fontWeight: 600,
        }}>
          {t.strategy}
        </span>
        <div style={{ flex: 1 }} />
        <button
          onClick={runSimulation}
          disabled={simLoading}
          style={{
            padding: '0.5rem 1.5rem',
            borderRadius: '0.375rem',
            border: 'none',
            backgroundColor: 'var(--color-accent)',
            color: 'var(--color-bg)',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.8125rem',
            fontWeight: 600,
            cursor: simLoading ? 'wait' : 'pointer',
            opacity: simLoading ? 0.7 : 1,
            transition: 'opacity 0.15s',
          }}
        >
          {simLoading ? t.simLoading : (simResult ? t.resim : t.apply)}
        </button>
      </div>

      {/* SL/TP Sliders + Results */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
        {/* Sliders */}
        <div style={{ padding: '1.25rem', backgroundColor: 'var(--color-bg-card)', border: '1px solid var(--color-border)', borderRadius: '0.75rem' }}>
          <DiscreteSlider label={t.sl} values={SL_VALUES} value={sl} defaultValue={DEFAULT_SL} onChange={setSl} />
          <DiscreteSlider label={t.tp} values={TP_VALUES} value={tp} defaultValue={DEFAULT_TP} onChange={setTp} />
        </div>

        {/* Results */}
        <div style={{ padding: '1.25rem', backgroundColor: 'var(--color-bg-card)', border: '1px solid var(--color-border)', borderRadius: '0.75rem' }}>
          {simResult ? (
            <div>
              {isDefault && (
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.625rem', color: 'var(--color-accent)', letterSpacing: '0.1em', marginBottom: '0.75rem', textTransform: 'uppercase' as const }}>{t.live}</div>
              )}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <MetricBox label={t.winRate} value={`${simResult.win_rate}%`} color={simResult.win_rate >= 55 ? 'var(--color-accent)' : simResult.win_rate >= 50 ? 'var(--color-yellow)' : 'var(--color-red)'} />
                <MetricBox label={t.pf} value={`${simResult.profit_factor}`} color={simResult.profit_factor >= 1.5 ? 'var(--color-accent)' : simResult.profit_factor >= 1.0 ? 'var(--color-yellow)' : 'var(--color-red)'} />
                <MetricBox label={t.totalReturn} value={`${simResult.total_return_pct > 0 ? '+' : ''}${simResult.total_return_pct}%`} color={simResult.total_return_pct >= 0 ? 'var(--color-accent)' : 'var(--color-red)'} />
                <MetricBox label={t.maxDD} value={`${simResult.max_drawdown_pct}%`} color="var(--color-red)" />
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>
                {simResult.total_trades} {t.tradesLabel} &middot; TP:{simResult.tp_count} SL:{simResult.sl_count} TO:{simResult.timeout_count}
              </div>
              {/* Exit distribution bar */}
              <div style={{ display: 'flex', height: '4px', borderRadius: '2px', overflow: 'hidden', backgroundColor: 'var(--color-border)' }}>
                {simResult.total_trades > 0 && (<>
                  <div style={{ width: `${(simResult.tp_count / simResult.total_trades) * 100}%`, backgroundColor: 'var(--color-accent)' }} title={`TP: ${simResult.tp_count}`} />
                  <div style={{ width: `${(simResult.sl_count / simResult.total_trades) * 100}%`, backgroundColor: 'var(--color-red)' }} title={`SL: ${simResult.sl_count}`} />
                  <div style={{ width: `${(simResult.timeout_count / simResult.total_trades) * 100}%`, backgroundColor: 'var(--color-text-muted)' }} title={`TO: ${simResult.timeout_count}`} />
                </>)}
              </div>
            </div>
          ) : (
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem', color: 'var(--color-text-muted)', padding: '1rem 0' }}>{t.noTrades}</div>
          )}
        </div>
      </div>

      {/* Disclaimer */}
      <p style={{
        fontFamily: 'var(--font-mono)',
        fontSize: '0.5625rem',
        color: '#444',
        marginBottom: '1rem',
        lineHeight: 1.5,
      }}>
        * {t.disclaimer}
      </p>

      {/* Trade History */}
      {simResult && simResult.trades.length > 0 && (
        <div style={{ backgroundColor: 'var(--color-bg-card)', border: '1px solid var(--color-border)', borderRadius: '0.75rem', overflow: 'hidden' }}>
          <button
            onClick={() => setShowTrades(!showTrades)}
            style={{
              width: '100%',
              padding: '0.75rem 1rem',
              backgroundColor: 'transparent',
              border: 'none',
              borderBottom: showTrades ? '1px solid var(--color-border)' : 'none',
              color: 'var(--color-text)',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.8125rem',
              fontWeight: 600,
              cursor: 'pointer',
              textAlign: 'left',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span>{showTrades ? '▼' : '▶'} {t.trades} ({simResult.trades.length})</span>
          </button>
          {showTrades && (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <th style={{ padding: '0.5rem 0.75rem', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.625rem' }}>#</th>
                    <th style={{ padding: '0.5rem 0.75rem', textAlign: 'left', color: 'var(--color-text-muted)', fontSize: '0.625rem' }}>{t.entry}</th>
                    <th style={{ padding: '0.5rem 0.75rem', textAlign: 'left', color: 'var(--color-text-muted)', fontSize: '0.625rem' }}>{t.exit}</th>
                    <th style={{ padding: '0.5rem 0.75rem', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.625rem' }}>{t.result}</th>
                    <th style={{ padding: '0.5rem 0.75rem', textAlign: 'right', color: 'var(--color-text-muted)', fontSize: '0.625rem' }}>{t.pnl}</th>
                    <th style={{ padding: '0.5rem 0.75rem', textAlign: 'right', color: 'var(--color-text-muted)', fontSize: '0.625rem' }}>{t.bars}</th>
                  </tr>
                </thead>
                <tbody>
                  {simResult.trades.map((trade, i) => {
                    const color = trade.exit_reason === 'tp' ? 'var(--color-accent)' : trade.exit_reason === 'sl' ? 'var(--color-red)' : 'var(--color-text-muted)';
                    const label = trade.exit_reason.toUpperCase();
                    return (
                      <tr
                        key={i}
                        style={{ borderBottom: '1px solid var(--color-border)', cursor: 'pointer' }}
                        onClick={() => {
                          if (chartRef.current) {
                            chartRef.current.timeScale().setVisibleRange({
                              from: (trade.entry_time - 3600 * 24) as any,
                              to: (trade.exit_time + 3600 * 24) as any,
                            });
                          }
                        }}
                        onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(0,255,136,0.03)'}
                        onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'}
                      >
                        <td style={{ padding: '0.5rem 0.75rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>{i + 1}</td>
                        <td style={{ padding: '0.5rem 0.75rem' }}>{formatTime(trade.entry_time)}</td>
                        <td style={{ padding: '0.5rem 0.75rem' }}>{formatTime(trade.exit_time)}</td>
                        <td style={{ padding: '0.5rem 0.75rem', textAlign: 'center', color, fontWeight: 600 }}>{label}</td>
                        <td style={{ padding: '0.5rem 0.75rem', textAlign: 'right', color: trade.pnl_pct >= 0 ? 'var(--color-accent)' : 'var(--color-red)' }}>
                          {trade.pnl_pct > 0 ? '+' : ''}{trade.pnl_pct.toFixed(2)}%
                        </td>
                        <td style={{ padding: '0.5rem 0.75rem', textAlign: 'right', color: 'var(--color-text-muted)' }}>{trade.bars_held}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
