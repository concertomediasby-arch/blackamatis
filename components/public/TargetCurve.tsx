/**
 * Target curve chart frame, 20 Hz – 20 kHz on a log axis. The curve itself is a
 * placeholder until the measured/target data is entered; no values are invented.
 */
const W = 760;
const H = 300;
const PAD = { l: 48, r: 16, t: 16, b: 36 };
const FMIN = 20;
const FMAX = 20000;
const DB = [-12, -6, 0, 6, 12];

const fx = (f: number) => PAD.l + ((Math.log10(f) - Math.log10(FMIN)) / (Math.log10(FMAX) - Math.log10(FMIN))) * (W - PAD.l - PAD.r);
const dy = (db: number) => PAD.t + ((12 - db) / 24) * (H - PAD.t - PAD.b);

const TICKS = [20, 50, 100, 200, 500, 1000, 2000, 5000, 10000, 20000];
const label = (f: number) => (f >= 1000 ? `${f / 1000}k` : String(f));

export function TargetCurve() {
  return (
    <figure className="m-0 flex flex-col gap-3">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Target curve chart, 20 Hz to 20 kHz. Curve not entered yet." className="h-auto w-full">
        {DB.map((d) => (
          <g key={d}>
            <line x1={PAD.l} x2={W - PAD.r} y1={dy(d)} y2={dy(d)} stroke="rgba(255,255,255,0.12)" />
            <text x={PAD.l - 8} y={dy(d) + 4} textAnchor="end" fontSize="11" fill="#BFBDC8" fontFamily="var(--font-mono)">
              {d > 0 ? `+${d}` : d}
            </text>
          </g>
        ))}
        {TICKS.map((f) => (
          <g key={f}>
            <line x1={fx(f)} x2={fx(f)} y1={PAD.t} y2={H - PAD.b} stroke="rgba(255,255,255,0.08)" />
            <text x={fx(f)} y={H - PAD.b + 18} textAnchor="middle" fontSize="11" fill="#BFBDC8" fontFamily="var(--font-mono)">
              {label(f)}
            </text>
          </g>
        ))}
        <line x1={PAD.l} x2={W - PAD.r} y1={dy(0)} y2={dy(0)} stroke="#E5A90A" strokeWidth="2" strokeDasharray="8 6" />
        <text x={(PAD.l + W - PAD.r) / 2} y={dy(0) - 12} textAnchor="middle" fontSize="12" fill="#E5A90A" fontFamily="var(--font-mono)" letterSpacing="1.5">
          [TARGET CURVE — ENTER FROM MEASUREMENT]
        </text>
      </svg>
      <figcaption className="font-mono text-[11px] tracking-[0.1em] text-muted-2">dB (relative) · Frequency (Hz, log)</figcaption>
    </figure>
  );
}
