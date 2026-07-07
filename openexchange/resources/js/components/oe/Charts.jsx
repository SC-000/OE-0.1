import React from 'react';

/**
 * Open Exchange chart kit — clean, brand-aligned SVG figures.
 * Method per the dataviz procedure: one axis, recessive grid, thin 2px marks,
 * value/identity in ink tokens (never the series color), a legend for >=2 series.
 * Categorical order (validated, CVD-safe): green, blue, gold, violet.
 * Charts render on LIGHT surfaces (cream/beige); labels use ink tokens.
 */
export const CAT_PALETTE = ['#33c13e', '#2a7de1', '#c9992e', '#7c5cff'];

const AXIS = 'var(--ox-text-subtle)';
const GRID = 'var(--ox-border)';
const INK = 'var(--ox-text)';
const MONO = 'var(--ox-font-mono)';
const SANS = 'var(--ox-font-sans)';

/* ------------------------------- Line / Area ------------------------------- */
export function LineArea({
    series, xLabels, height = 260, area = true, yMax, yTicks = 4,
    valueFmt = (v) => v, yUnit = '', legend, style = {},
}) {
    const W = 720, padL = 52, padR = 18, padT = 16, padB = 34;
    const plotW = W - padL - padR, plotH = height - padT - padB;
    const n = xLabels.length;
    const max = yMax ?? Math.max(...series.flatMap((s) => s.values)) * 1.08;
    const x = (i) => padL + (n <= 1 ? 0 : (i / (n - 1)) * plotW);
    const y = (v) => padT + plotH - (v / (max || 1)) * plotH;
    const ticks = Array.from({ length: yTicks + 1 }, (_, k) => (k / yTicks) * max);
    const multi = series.length > 1;
    const showLegend = legend ?? multi;

    return (
        <div style={style}>
            <svg viewBox={`0 0 ${W} ${height}`} width="100%" style={{ display: 'block', overflow: 'visible' }} preserveAspectRatio="xMidYMid meet">
                <defs>
                    {series.map((s, i) => (
                        <linearGradient key={i} id={`oxla-${i}-${s.name}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0" stopColor={s.color || CAT_PALETTE[i]} stopOpacity="0.18" />
                            <stop offset="1" stopColor={s.color || CAT_PALETTE[i]} stopOpacity="0" />
                        </linearGradient>
                    ))}
                </defs>
                {/* grid + y labels */}
                {ticks.map((t, i) => (
                    <g key={i}>
                        <line x1={padL} x2={W - padR} y1={y(t)} y2={y(t)} stroke={GRID} strokeWidth="1" vectorEffect="non-scaling-stroke" opacity={i === 0 ? 0.9 : 0.55} />
                        <text x={padL - 8} y={y(t) + 3.5} textAnchor="end" fontFamily={MONO} fontSize="11" fill={AXIS}>{valueFmt(t)}{yUnit}</text>
                    </g>
                ))}
                {/* x labels */}
                {xLabels.map((lbl, i) => (
                    <text key={i} x={x(i)} y={height - 12} textAnchor="middle" fontFamily={SANS} fontSize="11" fill={AXIS}>{lbl}</text>
                ))}
                {/* series */}
                {series.map((s, si) => {
                    const col = s.color || CAT_PALETTE[si];
                    const line = s.values.map((v, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join(' ');
                    const areaD = `${line} L${x(n - 1).toFixed(1)} ${y(0)} L${x(0).toFixed(1)} ${y(0)} Z`;
                    const last = s.values.length - 1;
                    return (
                        <g key={si}>
                            {area && !multi && <path d={areaD} fill={`url(#oxla-${si}-${s.name})`} />}
                            <path d={line} fill="none" stroke={col} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
                            <circle cx={x(last)} cy={y(s.values[last])} r="3.4" fill={col} stroke="var(--ox-cream)" strokeWidth="1.5" />
                        </g>
                    );
                })}
            </svg>
            {showLegend && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 18px', marginTop: 10, paddingLeft: 8 }}>
                    {series.map((s, i) => (
                        <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontFamily: SANS, fontSize: 12.5, color: INK }}>
                            <span style={{ width: 11, height: 3, borderRadius: 2, background: s.color || CAT_PALETTE[i] }} />{s.name}
                        </span>
                    ))}
                </div>
            )}
        </div>
    );
}

/* --------------------------------- Bars --------------------------------- */
export function Bars({ data, height = 260, color = '#33c13e', yMax, valueFmt = (v) => v, unit = '', projectedFrom, style = {} }) {
    const W = 720, padL = 52, padR = 18, padT = 24, padB = 34;
    const plotW = W - padL - padR, plotH = height - padT - padB;
    const n = data.length;
    const max = yMax ?? Math.max(...data.map((d) => d.value)) * 1.12;
    const bw = (plotW / n) * 0.58;
    const cx = (i) => padL + (i + 0.5) * (plotW / n);
    const y = (v) => padT + plotH - (v / (max || 1)) * plotH;
    const ticks = Array.from({ length: 5 }, (_, k) => (k / 4) * max);
    return (
        <div style={style}>
            <svg viewBox={`0 0 ${W} ${height}`} width="100%" style={{ display: 'block', overflow: 'visible' }} preserveAspectRatio="xMidYMid meet">
                <defs>
                    <pattern id="oxbar-hatch" width="6" height="6" patternTransform="rotate(45)" patternUnits="userSpaceOnUse">
                        <rect width="6" height="6" fill={color} opacity="0.14" />
                        <line x1="0" y1="0" x2="0" y2="6" stroke={color} strokeWidth="2.4" opacity="0.55" />
                    </pattern>
                </defs>
                {ticks.map((t, i) => (
                    <g key={i}>
                        <line x1={padL} x2={W - padR} y1={y(t)} y2={y(t)} stroke={GRID} strokeWidth="1" vectorEffect="non-scaling-stroke" opacity={i === 0 ? 0.9 : 0.5} />
                        <text x={padL - 8} y={y(t) + 3.5} textAnchor="end" fontFamily={MONO} fontSize="11" fill={AXIS}>{valueFmt(t)}</text>
                    </g>
                ))}
                {data.map((d, i) => {
                    const proj = projectedFrom != null && i >= projectedFrom;
                    const top = y(d.value);
                    return (
                        <g key={i}>
                            <rect x={cx(i) - bw / 2} y={top} width={bw} height={padT + plotH - top} rx="4"
                                fill={proj ? 'url(#oxbar-hatch)' : color} stroke={proj ? color : 'none'} strokeWidth={proj ? 1 : 0} strokeDasharray={proj ? '3 3' : 'none'} opacity={proj ? 1 : 0.92} />
                            <text x={cx(i)} y={top - 8} textAnchor="middle" fontFamily={MONO} fontSize="11.5" fontWeight="600" fill={INK}>{valueFmt(d.value)}{unit}</text>
                            <text x={cx(i)} y={height - 12} textAnchor="middle" fontFamily={SANS} fontSize="11" fill={AXIS}>{d.label}</text>
                        </g>
                    );
                })}
            </svg>
            {projectedFrom != null && (
                <div style={{ display: 'flex', gap: 16, marginTop: 8, paddingLeft: 8, fontFamily: SANS, fontSize: 12, color: AXIS }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><span style={{ width: 11, height: 11, borderRadius: 3, background: color }} />Actual</span>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><span style={{ width: 11, height: 11, borderRadius: 3, background: 'url(#oxbar-hatch)', border: `1px dashed ${color}` }} />Projected</span>
                </div>
            )}
        </div>
    );
}

/* ------------------------------ Rank (H bars) ------------------------------ */
export function RankBars({ items, color = '#33c13e', valueFmt = (v) => v, unit = '%', style = {} }) {
    const max = Math.max(...items.map((i) => i.value));
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, ...style }}>
            {items.map((it) => (
                <div key={it.label} style={{ display: 'grid', gridTemplateColumns: '170px 1fr 52px', alignItems: 'center', gap: 12 }}>
                    <span style={{ fontFamily: SANS, fontSize: 13.5, color: INK, fontWeight: 500 }}>{it.label}</span>
                    <span style={{ height: 12, borderRadius: 6, background: 'var(--ox-beige-200)', overflow: 'hidden' }}>
                        <span style={{ display: 'block', height: '100%', width: `${(it.value / max) * 100}%`, background: color, borderRadius: 6 }} />
                    </span>
                    <span style={{ fontFamily: MONO, fontSize: 12.5, color: INK, textAlign: 'right', fontWeight: 600 }}>{valueFmt(it.value)}{unit}</span>
                </div>
            ))}
        </div>
    );
}

/* --------------------------------- Donut --------------------------------- */
export function Donut({ segments, size = 200, thickness = 26, centerValue, centerLabel, style = {} }) {
    const total = segments.reduce((a, s) => a + s.value, 0);
    const r = (size - thickness) / 2;
    const C = 2 * Math.PI * r;
    let acc = 0;
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap', ...style }}>
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ flexShrink: 0 }}>
                <g transform={`rotate(-90 ${size / 2} ${size / 2})`}>
                    <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--ox-beige-200)" strokeWidth={thickness} />
                    {segments.map((s, i) => {
                        const len = (s.value / total) * C;
                        const off = acc; acc += len;
                        return (
                            <circle key={i} cx={size / 2} cy={size / 2} r={r} fill="none"
                                stroke={s.color || CAT_PALETTE[i]} strokeWidth={thickness}
                                strokeDasharray={`${len - 2} ${C - len + 2}`} strokeDashoffset={-off} strokeLinecap="butt" />
                        );
                    })}
                </g>
                {centerValue && <text x={size / 2} y={size / 2 - 2} textAnchor="middle" fontFamily={MONO} fontSize="26" fontWeight="600" fill={INK}>{centerValue}</text>}
                {centerLabel && <text x={size / 2} y={size / 2 + 18} textAnchor="middle" fontFamily={SANS} fontSize="11.5" fill={AXIS}>{centerLabel}</text>}
            </svg>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {segments.map((s, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ width: 11, height: 11, borderRadius: 3, background: s.color || CAT_PALETTE[i], flexShrink: 0 }} />
                        <span style={{ fontFamily: SANS, fontSize: 13, color: INK, minWidth: 130 }}>{s.label}</span>
                        <span style={{ fontFamily: MONO, fontSize: 12.5, color: 'var(--ox-text-muted)', marginLeft: 'auto' }}>{Math.round((s.value / total) * 100)}%</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
