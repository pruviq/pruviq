interface ResultsData {
  win_rate: number;
  profit_factor: number;
  total_return_pct: number;
  max_drawdown_pct: number;
  total_trades: number;
  tp_count: number;
  sl_count: number;
  timeout_count: number;
}

interface ResultsCardProps {
  data: ResultsData;
  isDefault: boolean;
  lang?: 'en' | 'ko';
}

const labels = {
  en: {
    live: 'CURRENT LIVE SETTINGS',
    winRate: 'Win Rate',
    pf: 'Profit Factor',
    totalReturn: 'Total Return',
    maxDD: 'Max Drawdown',
    trades: 'trades simulated',
  },
  ko: {
    live: '현재 라이브 설정',
    winRate: '승률',
    pf: '수익 팩터',
    totalReturn: '총 수익률',
    maxDD: '최대 드로다운',
    trades: '건 시뮬레이션됨',
  },
};

function MetricBox({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div style={{
      padding: '0.75rem',
      borderRadius: '0.5rem',
      backgroundColor: 'rgba(17, 17, 17, 0.8)',
      border: '1px solid var(--color-border)',
    }}>
      <div style={{
        fontFamily: 'var(--font-mono)',
        fontSize: '0.625rem',
        color: 'var(--color-text-muted)',
        textTransform: 'uppercase' as const,
        letterSpacing: '0.05em',
        marginBottom: '0.25rem',
      }}>
        {label}
      </div>
      <div style={{
        fontFamily: 'var(--font-mono)',
        fontSize: '1.25rem',
        fontWeight: 700,
        color,
      }}>
        {value}
      </div>
    </div>
  );
}

export default function ResultsCard({ data, isDefault, lang = 'en' }: ResultsCardProps) {
  const t = labels[lang] || labels.en;
  const total = data.tp_count + data.sl_count + data.timeout_count;
  const tpPct = total > 0 ? (data.tp_count / total) * 100 : 0;
  const slPct = total > 0 ? (data.sl_count / total) * 100 : 0;
  const toPct = total > 0 ? (data.timeout_count / total) * 100 : 0;

  const wrColor = data.win_rate >= 55 ? 'var(--color-accent)' : data.win_rate >= 50 ? 'var(--color-yellow)' : 'var(--color-red)';
  const pfColor = data.profit_factor >= 1.5 ? 'var(--color-accent)' : data.profit_factor >= 1.0 ? 'var(--color-yellow)' : 'var(--color-red)';
  const retColor = data.total_return_pct >= 0 ? 'var(--color-accent)' : 'var(--color-red)';

  return (
    <div>
      {/* Badge */}
      {isDefault && (
        <div style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.625rem',
          color: 'var(--color-accent)',
          letterSpacing: '0.1em',
          marginBottom: '0.75rem',
          textTransform: 'uppercase' as const,
        }}>
          {t.live}
        </div>
      )}

      {/* Main metrics grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '0.5rem',
        marginBottom: '1rem',
      }}>
        <MetricBox label={t.winRate} value={`${data.win_rate}%`} color={wrColor} />
        <MetricBox label={t.pf} value={`${data.profit_factor}`} color={pfColor} />
        <MetricBox label={t.totalReturn} value={`${data.total_return_pct > 0 ? '+' : ''}${data.total_return_pct}%`} color={retColor} />
        <MetricBox label={t.maxDD} value={`${data.max_drawdown_pct}%`} color="var(--color-red)" />
      </div>

      {/* Trade count */}
      <div style={{
        fontFamily: 'var(--font-mono)',
        fontSize: '0.75rem',
        color: 'var(--color-text-muted)',
        marginBottom: '0.75rem',
      }}>
        {data.total_trades.toLocaleString()} {t.trades}
      </div>

      {/* Exit reason bar */}
      <div style={{ marginBottom: '0.25rem' }}>
        <div style={{
          display: 'flex',
          height: '6px',
          borderRadius: '3px',
          overflow: 'hidden',
          backgroundColor: 'var(--color-border)',
        }}>
          <div style={{ width: `${tpPct}%`, backgroundColor: 'var(--color-accent)', transition: 'width 0.3s ease' }} />
          <div style={{ width: `${slPct}%`, backgroundColor: 'var(--color-red)', transition: 'width 0.3s ease' }} />
          <div style={{ width: `${toPct}%`, backgroundColor: 'var(--color-text-muted)', transition: 'width 0.3s ease' }} />
        </div>
      </div>

      {/* Exit reason legend */}
      <div style={{
        display: 'flex',
        gap: '1rem',
        fontFamily: 'var(--font-mono)',
        fontSize: '0.625rem',
      }}>
        <span style={{ color: 'var(--color-accent)' }}>TP {tpPct.toFixed(0)}%</span>
        <span style={{ color: 'var(--color-red)' }}>SL {slPct.toFixed(0)}%</span>
        <span style={{ color: 'var(--color-text-muted)' }}>TO {toPct.toFixed(0)}%</span>
      </div>
    </div>
  );
}
