import { useRef, useCallback } from 'preact/hooks';

interface DiscreteSliderProps {
  label: string;
  values: number[];
  value: number;
  defaultValue: number;
  unit?: string;
  onChange: (value: number) => void;
}

export default function DiscreteSlider({
  label,
  values,
  value,
  defaultValue,
  unit = '%',
  onChange,
}: DiscreteSliderProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const currentIndex = values.indexOf(value);
  const fillPct = (currentIndex / (values.length - 1)) * 100;

  const handleClick = useCallback(
    (e: MouseEvent | TouchEvent) => {
      const track = trackRef.current;
      if (!track) return;

      const rect = track.getBoundingClientRect();
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const pct = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      const idx = Math.round(pct * (values.length - 1));
      onChange(values[idx]);
    },
    [values, onChange]
  );

  const handlePointerDown = useCallback(
    (e: PointerEvent) => {
      e.preventDefault();
      const track = trackRef.current;
      if (!track) return;

      const move = (ev: PointerEvent) => {
        const rect = track.getBoundingClientRect();
        const pct = Math.max(0, Math.min(1, (ev.clientX - rect.left) / rect.width));
        const idx = Math.round(pct * (values.length - 1));
        onChange(values[idx]);
      };

      const up = () => {
        document.removeEventListener('pointermove', move);
        document.removeEventListener('pointerup', up);
      };

      document.addEventListener('pointermove', move);
      document.addEventListener('pointerup', up);
      handleClick(e);
    },
    [values, onChange, handleClick]
  );

  return (
    <div style={{ marginBottom: '1.25rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
          {label}
        </span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '1.125rem', fontWeight: 700, color: 'var(--color-accent)' }}>
          {value}{unit}
        </span>
      </div>

      {/* Track */}
      <div
        ref={trackRef}
        onPointerDown={handlePointerDown}
        style={{
          position: 'relative',
          height: '2.5rem',
          cursor: 'pointer',
          touchAction: 'none',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        {/* Background */}
        <div style={{
          position: 'absolute',
          left: 0, right: 0,
          height: '4px',
          backgroundColor: 'var(--color-border)',
          borderRadius: '2px',
        }} />

        {/* Fill */}
        <div style={{
          position: 'absolute',
          left: 0,
          width: `${fillPct}%`,
          height: '4px',
          backgroundColor: 'var(--color-accent)',
          borderRadius: '2px',
          transition: 'width 0.1s ease',
        }} />

        {/* Snap points */}
        {values.map((v, i) => {
          const left = (i / (values.length - 1)) * 100;
          const isDefault = v === defaultValue;
          const isActive = i <= currentIndex;
          return (
            <div
              key={v}
              style={{
                position: 'absolute',
                left: `${left}%`,
                transform: 'translateX(-50%)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.25rem',
              }}
            >
              <div style={{
                width: isDefault ? '10px' : '8px',
                height: isDefault ? '10px' : '8px',
                borderRadius: '50%',
                backgroundColor: isActive ? 'var(--color-accent)' : 'var(--color-border)',
                border: isDefault ? '2px solid var(--color-accent)' : 'none',
                transition: 'background-color 0.1s ease',
              }} />
              <span style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.625rem',
                color: isDefault ? 'var(--color-accent)' : 'var(--color-text-muted)',
                marginTop: '0.125rem',
                whiteSpace: 'nowrap',
              }}>
                {v}{isDefault ? '*' : ''}
              </span>
            </div>
          );
        })}

        {/* Thumb */}
        <div style={{
          position: 'absolute',
          left: `${fillPct}%`,
          transform: 'translateX(-50%)',
          width: '20px',
          height: '20px',
          borderRadius: '50%',
          backgroundColor: 'var(--color-accent)',
          boxShadow: '0 0 8px rgba(0, 255, 136, 0.4)',
          transition: 'left 0.1s ease',
          zIndex: 2,
        }} />
      </div>
    </div>
  );
}
