import { useState, useEffect, useRef } from 'preact/hooks';

interface DailyEntry {
  date: string;
  pnl: number;
  trades: number;
  cum_pnl: number;
  wins: number;
  losses: number;
}

interface RecentTrade {
  symbol: string;
  entry_price: number;
  exit_price: number;
  pnl_pct: number;
  pnl_usd: number;
  reason: string;
  closed_at: string;
}

interface RawPerformanceData {
  generated: string;
  strategy: string;
  period: { from: string; to: string };
  summary: {
    total_trades: number;
    win_rate: number;
    profit_factor: number;
    total_pnl: number;
    starting_balance: number;
    current_balance: number;
    max_drawdown_pct: number;
    avg_trade_pnl: number;
    best_day_pnl: number;
    worst_day_pnl: number;
    tp_count: number;
    sl_count: number;
    timeout_count: number;
    other_count: number;
  };
  daily: DailyEntry[];
  recent_trades: RecentTrade[];
}

const labels = {
  en: {
    tag: 'LIVE PERFORMANCE',
    title: 'Real Money. Real Results.',
    desc: 'Every trade from our live account, delayed by 15 minutes. Including the losses.',
    trades: 'Total Trades',
    winRate: 'Win Rate',
    pnl: 'Total PnL',
    pf: 'Profit Factor',
    mdd: 'Max Drawdown',
    bestDay: 'Best Day',
    worstDay: 'Worst Day',
    avgTrade: 'Avg Trade',
    dailyChart: 'CUMULATIVE PnL',
    exitBreakdown: 'EXIT BREAKDOWN',
    recentTrades: 'RECENT TRADES',
    tp: 'Take Profit',
    sl: 'Stop Loss',
    to: 'Timeout',
    other: 'Other',
    loading: 'Loading performance data...',
    error: 'Failed to load performance data.',
    disclaimer: 'Data delayed 15 minutes. Past performance does not guarantee future results. Not financial advice.',
    noResults: 'Performance data not available.',
    strategy: 'Strategy',
    period: 'Period',
    symbol: 'Symbol',
    exitPrice: 'Exit Price',
    pnlPct: 'PnL %',
    pnlUsd: 'PnL $',
    result: 'Result',
    date: 'Date',
    balance: 'Balance',
    startBal: 'Starting',
    curBal: 'Current',
  },
  ko: {
    tag: '실거래 성과',
    title: '실제 자금. 실제 결과.',
    desc: '실거래 계좌의 모든 거래 내역, 15분 지연. 손실 포함.',
    trades: '총 거래',
    winRate: '승률',
    pnl: '총 손익',
    pf: '수익 팩터',
    mdd: '최대 낙폭',
    bestDay: '최고 수익일',
    worstDay: '최대 손실일',
    avgTrade: '평균 거래',
    dailyChart: '누적 손익',
    exitBreakdown: '청산 유형',
    recentTrades: '최근 거래',
    tp: '이익 실현',
    sl: '손절',
    to: '타임아웃',
    other: '기타',
    loading: '성과 데이터 로딩 중...',
    error: '성과 데이터 로딩 실패.',
    disclaimer: '15분 지연 데이터. 과거 성과가 미래 수익을 보장하지 않습니다. 투자 조언이 아닙니다.',
    noResults: '성과 데이터를 사용할 수 없습니다.',
    strategy: '전략',
    period: '기간',
    symbol: '종목',
    exitPrice: '청산가',
    pnlPct: 'PnL %',
    pnlUsd: 'PnL $',
    result: '결과',
    date: '날짜',
    balance: '잔고',
    startBal: '시작',
    curBal: '현재',
  },
};

function formatUsd(v: number): string {
  const sign = v >= 0 ? '+' : '';
  return `${sign}$${Math.abs(v).toFixed(2)}`;
}

function formatPrice(p: number): string {
  if (p >= 10000) return p.toLocaleString(undefined, { maximumFractionDigits: 1 });
  if (p >= 1000) return p.toLocaleString(undefined, { maximumFractionDigits: 2 });
  if (p >= 1) return p.toFixed(3);
  if (p >= 0.01) return p.toFixed(5);
  return p.toFixed(7);
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[d.getMonth()]} ${d.getDate()}`;
}

function formatDateFull(dateStr: string): string {
  const d = new Date(dateStr);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

function formatReasonLabel(reason: string): string {
  if (reason === 'TP') return 'TP';
  if (reason === 'SL') return 'SL';
  if (reason === 'TIMEOUT') return 'TO';
  return reason;
}

// KPI Metric card
function MetricCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div style={{
      padding: '1rem',
      borderRadius: '0.5rem',
      backgroundColor: 'var(--color-bg-card)',
      border: '1px solid var(--color-border)',
      textAlign: 'center',
      minWidth: '0',
    }}>
      <div style={{
        fontFamily: 'var(--font-mono)',
        fontSize: '0.625rem',
        color: 'var(--color-text-muted)',
        textTransform: 'uppercase' as const,
        letterSpacing: '0.05em',
        marginBottom: '0.375rem',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
      }}>{label}</div>
      <div style={{
        fontFamily: 'var(--font-mono)',
        fontSize: '1.125rem',
        fontWeight: 700,
        color,
      }}>{value}</div>
    </div>
  );
}

export default function PerformanceDashboard({ lang = 'en' }: { lang?: 'en' | 'ko' }) {
  const t = labels[lang] || labels.en;

  const [data, setData] = useState<RawPerformanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showTrades, setShowTrades] = useState(false);

  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<any>(null);

  // Fetch performance data
  useEffect(() => {
    fetch('/data/performance.json')
      .then(res => {
        if (!res.ok) throw new Error('Failed');
        return res.json();
      })
      .then((json: RawPerformanceData) => {
        setData(json);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  // Initialize cumulative PnL chart
  useEffect(() => {
    if (!data || !chartContainerRef.current) return;
    let disposed = false;

    // Use cum_pnl from daily data
    const cumulativeData = data.daily
      .filter(d => d.trades > 0 || d.cum_pnl !== 0)
      .map(d => ({
        time: d.date,
        value: parseFloat(d.cum_pnl.toFixed(2)),
      }));

    import('lightweight-charts').then(({ createChart, AreaSeries }) => {
      if (disposed || !chartContainerRef.current) return;

      const chart = createChart(chartContainerRef.current, {
        width: chartContainerRef.current.clientWidth,
        height: 320,
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
          scaleMargins: { top: 0.1, bottom: 0.1 },
        },
        timeScale: {
          borderColor: '#1a1a1a',
          rightOffset: 3,
          barSpacing: 12,
        },
        crosshair: {
          mode: 0,
          vertLine: { color: '#00ff8833', width: 1, style: 2, labelBackgroundColor: '#111' },
          horzLine: { color: '#00ff8833', width: 1, style: 2, labelBackgroundColor: '#111' },
        },
        watermark: {
          visible: true,
          text: 'PRUVIQ',
          fontSize: 48,
          color: 'rgba(255,255,255,0.02)',
        },
      });

      // Determine colors based on final PnL
      const finalValue = cumulativeData.length > 0 ? cumulativeData[cumulativeData.length - 1].value : 0;
      const lineColor = finalValue >= 0 ? '#00ff88' : '#ff4444';
      const topColor = finalValue >= 0 ? 'rgba(0, 255, 136, 0.3)' : 'rgba(255, 68, 68, 0.3)';
      const bottomColor = finalValue >= 0 ? 'rgba(0, 255, 136, 0.0)' : 'rgba(255, 68, 68, 0.0)';

      const areaSeries = chart.addSeries(AreaSeries, {
        lineColor,
        topColor,
        bottomColor,
        lineWidth: 2,
        priceFormat: {
          type: 'custom',
          formatter: (price: number) => `$${price.toFixed(0)}`,
        },
        crosshairMarkerRadius: 5,
        crosshairMarkerBackgroundColor: lineColor,
        crosshairMarkerBorderColor: '#0a0a0a',
        crosshairMarkerBorderWidth: 2,
      });

      areaSeries.setData(cumulativeData as any);

      // Add baseline at $0
      areaSeries.createPriceLine({
        price: 0,
        color: '#444444',
        lineWidth: 1,
        lineStyle: 2,
        axisLabelVisible: true,
        title: '',
      });

      chart.timeScale().fitContent();
      chartRef.current = chart;

      // Responsive
      const ro = new ResizeObserver(entries => {
        for (const entry of entries) {
          chart.applyOptions({ width: entry.contentRect.width });
        }
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
  }, [data]);

  // Loading state
  if (loading) {
    return (
      <div style={{
        padding: '4rem 0',
        textAlign: 'center',
        fontFamily: 'var(--font-mono)',
        color: 'var(--color-text-muted)',
        fontSize: '0.875rem',
      }}>
        <div style={{
          width: '24px',
          height: '24px',
          border: '2px solid var(--color-border)',
          borderTop: '2px solid var(--color-accent)',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '0 auto 1rem',
        }} />
        {t.loading}
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // Error state
  if (error || !data) {
    return (
      <div style={{
        padding: '3rem',
        textAlign: 'center',
        fontFamily: 'var(--font-mono)',
        color: 'var(--color-text-muted)',
        fontSize: '0.875rem',
        backgroundColor: 'var(--color-bg-card)',
        border: '1px solid var(--color-border)',
        borderRadius: '0.75rem',
      }}>
        <div style={{ fontSize: '2rem', marginBottom: '1rem', opacity: 0.3 }}>!</div>
        {t.error}
      </div>
    );
  }

  const s = data.summary;
  const totalExits = s.tp_count + s.sl_count + s.timeout_count + s.other_count;
  const tpPct = totalExits > 0 ? (s.tp_count / totalExits) * 100 : 0;
  const slPct = totalExits > 0 ? (s.sl_count / totalExits) * 100 : 0;
  const toPct = totalExits > 0 ? (s.timeout_count / totalExits) * 100 : 0;
  const otherPct = totalExits > 0 ? (s.other_count / totalExits) * 100 : 0;

  const pnlColor = s.total_pnl >= 0 ? '#00ff88' : '#ff4444';
  const pfColor = s.profit_factor >= 1.5 ? '#00ff88' : s.profit_factor >= 1.0 ? 'var(--color-yellow)' : '#ff4444';
  const wrColor = s.win_rate >= 55 ? '#00ff88' : s.win_rate >= 50 ? 'var(--color-yellow)' : '#ff4444';

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.6875rem',
          color: 'var(--color-accent)',
          letterSpacing: '0.15em',
          textTransform: 'uppercase' as const,
          marginBottom: '0.75rem',
        }}>
          {t.tag}
        </div>
        <h1 style={{
          fontSize: 'clamp(1.5rem, 4vw, 2.25rem)',
          fontWeight: 700,
          lineHeight: 1.2,
          marginBottom: '0.75rem',
        }}>
          {t.title}
        </h1>
        <p style={{
          color: 'var(--color-text-muted)',
          fontSize: '1rem',
          lineHeight: 1.6,
          maxWidth: '600px',
          marginBottom: '1rem',
        }}>
          {t.desc}
        </p>
        <div style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.75rem',
          color: 'var(--color-text-muted)',
          display: 'flex',
          gap: '1.5rem',
          flexWrap: 'wrap',
        }}>
          <span>{t.strategy}: <span style={{ color: 'var(--color-text)' }}>{data.strategy}</span></span>
          <span>{t.period}: <span style={{ color: 'var(--color-text)' }}>{formatDateFull(data.period.from)} &mdash; {formatDateFull(data.period.to)}</span></span>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
        gap: '0.75rem',
        marginBottom: '1.5rem',
      }}>
        <MetricCard label={t.trades} value={s.total_trades.toLocaleString()} color="var(--color-text)" />
        <MetricCard label={t.winRate} value={`${s.win_rate}%`} color={wrColor} />
        <MetricCard label={t.pnl} value={formatUsd(s.total_pnl)} color={pnlColor} />
        <MetricCard label={t.pf} value={s.profit_factor.toFixed(2)} color={pfColor} />
        <MetricCard label={t.mdd} value={`${s.max_drawdown_pct.toFixed(1)}%`} color="#ff4444" />
      </div>

      {/* Cumulative PnL Chart */}
      <div style={{
        backgroundColor: '#0a0a0a',
        border: '1px solid var(--color-border)',
        borderRadius: '0.75rem',
        overflow: 'hidden',
        marginBottom: '1.5rem',
      }}>
        <div style={{
          padding: '0.75rem 1rem',
          borderBottom: '1px solid var(--color-border)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.6875rem',
            color: 'var(--color-accent)',
            letterSpacing: '0.1em',
            textTransform: 'uppercase' as const,
            fontWeight: 600,
          }}>
            {t.dailyChart}
          </span>
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.75rem',
            color: pnlColor,
            fontWeight: 600,
          }}>
            {formatUsd(s.total_pnl)}
          </span>
        </div>
        <div ref={chartContainerRef} style={{ width: '100%', height: '320px' }} />
        {/* TradingView Attribution */}
        <div style={{
          padding: '0.25rem 0.75rem 0.5rem',
          textAlign: 'right',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.5625rem',
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

      {/* Daily Stats + Exit Breakdown row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
        gap: '1rem',
        marginBottom: '1.5rem',
      }}>
        {/* Daily Stats */}
        <div style={{
          padding: '1.25rem',
          backgroundColor: 'var(--color-bg-card)',
          border: '1px solid var(--color-border)',
          borderRadius: '0.75rem',
        }}>
          <div style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.625rem',
            color: 'var(--color-text-muted)',
            letterSpacing: '0.1em',
            textTransform: 'uppercase' as const,
            marginBottom: '1rem',
          }}>
            DAILY STATS
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>{t.bestDay}</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '1rem', fontWeight: 700, color: '#00ff88' }}>{formatUsd(s.best_day_pnl)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>{t.worstDay}</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '1rem', fontWeight: 700, color: '#ff4444' }}>{formatUsd(s.worst_day_pnl)}</span>
            </div>
            <div style={{ height: '1px', backgroundColor: 'var(--color-border)' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>{t.avgTrade}</span>
              <span style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '1rem',
                fontWeight: 700,
                color: s.avg_trade_pnl >= 0 ? '#00ff88' : '#ff4444',
              }}>{formatUsd(s.avg_trade_pnl)}</span>
            </div>
            <div style={{ height: '1px', backgroundColor: 'var(--color-border)' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>{t.balance}</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
                ${s.starting_balance.toLocaleString()} &rarr; <span style={{ color: s.current_balance >= s.starting_balance ? '#00ff88' : '#ff4444', fontWeight: 600 }}>${s.current_balance.toLocaleString()}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Exit Breakdown */}
        <div style={{
          padding: '1.25rem',
          backgroundColor: 'var(--color-bg-card)',
          border: '1px solid var(--color-border)',
          borderRadius: '0.75rem',
        }}>
          <div style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.625rem',
            color: 'var(--color-text-muted)',
            letterSpacing: '0.1em',
            textTransform: 'uppercase' as const,
            marginBottom: '1rem',
          }}>
            {t.exitBreakdown}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {/* TP bar */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#00ff88' }}>{t.tp} ({s.tp_count})</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#00ff88', fontWeight: 600 }}>{tpPct.toFixed(1)}%</span>
              </div>
              <div style={{ height: '6px', borderRadius: '3px', backgroundColor: 'var(--color-border)', overflow: 'hidden' }}>
                <div style={{ width: `${tpPct}%`, height: '100%', backgroundColor: '#00ff88', borderRadius: '3px', transition: 'width 0.5s' }} />
              </div>
            </div>
            {/* SL bar */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#ff4444' }}>{t.sl} ({s.sl_count})</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#ff4444', fontWeight: 600 }}>{slPct.toFixed(1)}%</span>
              </div>
              <div style={{ height: '6px', borderRadius: '3px', backgroundColor: 'var(--color-border)', overflow: 'hidden' }}>
                <div style={{ width: `${slPct}%`, height: '100%', backgroundColor: '#ff4444', borderRadius: '3px', transition: 'width 0.5s' }} />
              </div>
            </div>
            {/* TO bar */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{t.to} ({s.timeout_count})</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>{toPct.toFixed(1)}%</span>
              </div>
              <div style={{ height: '6px', borderRadius: '3px', backgroundColor: 'var(--color-border)', overflow: 'hidden' }}>
                <div style={{ width: `${toPct}%`, height: '100%', backgroundColor: '#888888', borderRadius: '3px', transition: 'width 0.5s' }} />
              </div>
            </div>
            {/* Other bar */}
            {s.other_count > 0 && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--color-yellow)' }}>{t.other} ({s.other_count})</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--color-yellow)', fontWeight: 600 }}>{otherPct.toFixed(1)}%</span>
                </div>
                <div style={{ height: '6px', borderRadius: '3px', backgroundColor: 'var(--color-border)', overflow: 'hidden' }}>
                  <div style={{ width: `${otherPct}%`, height: '100%', backgroundColor: 'var(--color-yellow)', borderRadius: '3px', transition: 'width 0.5s' }} />
                </div>
              </div>
            )}
          </div>
          {/* Combined bar */}
          <div style={{ display: 'flex', height: '4px', borderRadius: '2px', overflow: 'hidden', marginTop: '0.75rem' }}>
            <div style={{ width: `${tpPct}%`, backgroundColor: '#00ff88' }} />
            <div style={{ width: `${slPct}%`, backgroundColor: '#ff4444' }} />
            <div style={{ width: `${toPct}%`, backgroundColor: '#888888' }} />
            {s.other_count > 0 && <div style={{ width: `${otherPct}%`, backgroundColor: 'var(--color-yellow)' }} />}
          </div>
        </div>
      </div>

      {/* Recent Trades */}
      {data.recent_trades && data.recent_trades.length > 0 && (
        <div style={{
          backgroundColor: 'var(--color-bg-card)',
          border: '1px solid var(--color-border)',
          borderRadius: '0.75rem',
          overflow: 'hidden',
          marginBottom: '1.5rem',
        }}>
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
            <span>{showTrades ? '\u25BC' : '\u25B6'} {t.recentTrades} ({data.recent_trades.length})</span>
          </button>
          {showTrades && (
            <div style={{ overflowX: 'auto' }}>
              <table style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.75rem',
              }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <th style={{ padding: '0.5rem 0.75rem', textAlign: 'left', color: 'var(--color-text-muted)', fontSize: '0.625rem', fontWeight: 600 }}>{t.symbol}</th>
                    <th style={{ padding: '0.5rem 0.75rem', textAlign: 'right', color: 'var(--color-text-muted)', fontSize: '0.625rem', fontWeight: 600 }}>{t.exitPrice}</th>
                    <th style={{ padding: '0.5rem 0.75rem', textAlign: 'right', color: 'var(--color-text-muted)', fontSize: '0.625rem', fontWeight: 600 }}>{t.pnlPct}</th>
                    <th style={{ padding: '0.5rem 0.75rem', textAlign: 'right', color: 'var(--color-text-muted)', fontSize: '0.625rem', fontWeight: 600 }}>{t.pnlUsd}</th>
                    <th style={{ padding: '0.5rem 0.75rem', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.625rem', fontWeight: 600 }}>{t.result}</th>
                    <th style={{ padding: '0.5rem 0.75rem', textAlign: 'right', color: 'var(--color-text-muted)', fontSize: '0.625rem', fontWeight: 600 }}>{t.date}</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recent_trades.map((trade, i) => {
                    const resultColor = trade.reason === 'TP' ? '#00ff88'
                      : trade.reason === 'SL' ? '#ff4444'
                      : 'var(--color-text-muted)';
                    const tradePnlColor = trade.pnl_pct >= 0 ? '#00ff88' : '#ff4444';
                    return (
                      <tr
                        key={i}
                        style={{ borderBottom: '1px solid var(--color-border)' }}
                        onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(0,255,136,0.03)')}
                        onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.backgroundColor = 'transparent')}
                      >
                        <td style={{ padding: '0.5rem 0.75rem', fontWeight: 600, color: 'var(--color-text)' }}>
                          {trade.symbol.replace('USDT', '')}
                        </td>
                        <td style={{ padding: '0.5rem 0.75rem', textAlign: 'right', color: 'var(--color-text-muted)' }}>
                          ${formatPrice(trade.exit_price)}
                        </td>
                        <td style={{ padding: '0.5rem 0.75rem', textAlign: 'right', color: tradePnlColor, fontWeight: 600 }}>
                          {trade.pnl_pct > 0 ? '+' : ''}{trade.pnl_pct.toFixed(2)}%
                        </td>
                        <td style={{ padding: '0.5rem 0.75rem', textAlign: 'right', color: tradePnlColor }}>
                          {formatUsd(trade.pnl_usd)}
                        </td>
                        <td style={{ padding: '0.5rem 0.75rem', textAlign: 'center', color: resultColor, fontWeight: 600 }}>
                          {formatReasonLabel(trade.reason)}
                        </td>
                        <td style={{ padding: '0.5rem 0.75rem', textAlign: 'right', color: 'var(--color-text-muted)' }}>
                          {formatDate(trade.closed_at)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Disclaimer */}
      <p style={{
        fontFamily: 'var(--font-mono)',
        fontSize: '0.625rem',
        color: '#555',
        lineHeight: 1.6,
        padding: '0.75rem 1rem',
        backgroundColor: 'rgba(255,255,255,0.02)',
        border: '1px solid var(--color-border)',
        borderRadius: '0.5rem',
      }}>
        * {t.disclaimer}
      </p>
    </div>
  );
}
