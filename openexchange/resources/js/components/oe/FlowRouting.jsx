import React, { useRef, useEffect, useState, useLayoutEffect } from 'react';

// useLayoutEffect warns when React renders on the server; useEffect is the SSR no-op.
const useIsomorphicLayoutEffect =
    typeof window !== 'undefined' ? useLayoutEffect : useEffect;
import { DotField } from './DotField.jsx';
import { observeVisibility } from './visibility.js';

/**
 * FlowRouting — "best execution" routing, the exchange metaphor. A request
 * enters the gateway; the gateway routes it to the model that wins on the
 * current criterion (cost / speed / quality), cycling through them.
 * Responsive: horizontal on wide containers, stacks vertically on narrow.
 */
export function FlowRouting({
    models,
    color = '#33c13e',
    height,
    animated = true,
    style = {},
}) {
    const data = models || [
        { name: 'gpt-5.4', cost: 2.5, speed: 110, quality: 97 },
        { name: 'claude-sonnet-5', cost: 3.0, speed: 96, quality: 98 },
        { name: 'gemini-3.5-flash', cost: 1.5, speed: 185, quality: 90 },
        { name: 'llama-4-maverick', cost: 0.15, speed: 230, quality: 86 },
    ];

    const criteria = [
        { key: 'cost', label: 'Lowest cost', pick: (a, b) => a.cost - b.cost },
        { key: 'speed', label: 'Fastest', pick: (a, b) => b.speed - a.speed },
        {
            key: 'quality',
            label: 'Best quality',
            pick: (a, b) => b.quality - a.quality,
        },
    ];
    const winners = criteria.map(
        (c) =>
            data.map((m, i) => ({ i, m })).sort((x, y) => c.pick(x.m, y.m))[0]
                .i,
    );

    const wrapRef = useRef(null);
    const gwRef = useRef(null);
    const cardRefs = useRef([]);
    const gwRingRef = useRef(null);
    const inPulseRef = useRef(null);
    const outPulseRef = useRef(null);
    const inPathRef = useRef(null);
    const outPathRefs = useRef([]);

    const [vertical, setVertical] = useState(false);
    const [geom, setGeom] = useState({ w: 0, h: 0, inD: '', links: [] });
    const [crit, setCrit] = useState(0);
    const active = winners[crit];

    useIsomorphicLayoutEffect(() => {
        const wrap = wrapRef.current;
        if (!wrap) return;
        function measure() {
            const wr = wrap.getBoundingClientRect();
            const isV = wr.width < 540;
            const gw = gwRef.current.getBoundingClientRect();
            const gc = {
                x: gw.left - wr.left + gw.width / 2,
                y: gw.top - wr.top + gw.height / 2,
                r: gw.width / 2,
            };
            const links = data.map((_, i) => {
                const el = cardRefs.current[i];
                if (!el) return { d: '' };
                const cr = el.getBoundingClientRect();
                if (isV) {
                    const sx = gc.x,
                        sy = gc.y + gc.r;
                    const ex = cr.left - wr.left + cr.width / 2,
                        ey = cr.top - wr.top;
                    const my = (sy + ey) / 2;
                    return {
                        d: `M ${sx} ${sy} C ${sx} ${my}, ${ex} ${my}, ${ex} ${ey}`,
                    };
                }
                const sx = gc.x + gc.r,
                    sy = gc.y;
                const ex = cr.left - wr.left,
                    ey = cr.top - wr.top + cr.height / 2;
                const mx = (sx + ex) / 2;
                return {
                    d: `M ${sx} ${sy} C ${mx} ${sy}, ${mx} ${ey}, ${ex} ${ey}`,
                };
            });
            const inD = isV
                ? `M ${gc.x} 0 L ${gc.x} ${gc.y - gc.r}`
                : `M 0 ${gc.y} L ${gc.x - gc.r} ${gc.y}`;
            setVertical(isV);
            setGeom({ w: wr.width, h: wr.height, inD, links });
        }
        measure();
        const ro = new ResizeObserver(measure);
        ro.observe(wrap);
        return () => ro.disconnect();
    }, [data.length, vertical]);

    useEffect(() => {
        if (!animated) {
            if (outPulseRef.current) outPulseRef.current.style.opacity = 0;
            return;
        }
        const reduce = window.matchMedia(
            '(prefers-reduced-motion: reduce)',
        ).matches;
        if (reduce) return;
        let raf,
            start = performance.now(),
            lastCycle = 0;
        // Every frame calls getPointAtLength(), which forces layout. Don't pay for that
        // while the diagram is scrolled off screen; resume where the cycle left off.
        let visible = true,
            pausedAt = 0;
        const unobserve = observeVisibility(wrapRef.current, (v) => {
            if (v && pausedAt) {
                start += performance.now() - pausedAt;
                pausedAt = 0;
            }
            if (!v) pausedAt = performance.now();
            visible = v;
        });
        const CYCLE = 3400,
            IN_END = 900,
            GATE_END = 1350,
            OUT_END = 2650;
        const loop = (now) => {
            if (!visible) {
                raf = requestAnimationFrame(loop);
                return;
            }
            const t = now - start;
            const cyc = Math.floor(t / CYCLE);
            if (cyc !== lastCycle) {
                lastCycle = cyc;
                setCrit((c) => (c + 1) % criteria.length);
            }
            const local = t % CYCLE;
            const inP = inPulseRef.current,
                outP = outPulseRef.current,
                ring = gwRingRef.current;
            if (inP && inPathRef.current) {
                if (local < IN_END) {
                    const p = inPathRef.current;
                    const pt = p.getPointAtLength(
                        (local / IN_END) * p.getTotalLength(),
                    );
                    inP.setAttribute('cx', pt.x);
                    inP.setAttribute('cy', pt.y);
                    inP.style.opacity =
                        local < IN_END * 0.15 ? local / (IN_END * 0.15) : 1;
                } else inP.style.opacity = 0;
            }
            if (ring) {
                const on = local >= IN_END && local < GATE_END;
                ring.style.opacity = on
                    ? 0.55 +
                      0.45 *
                          Math.sin(
                              ((local - IN_END) / (GATE_END - IN_END)) *
                                  Math.PI,
                          )
                    : 0.28;
            }
            if (outP) {
                const path = outPathRefs.current[active];
                if (path && local >= GATE_END && local < OUT_END) {
                    const q = (local - GATE_END) / (OUT_END - GATE_END);
                    const pt = path.getPointAtLength(q * path.getTotalLength());
                    outP.setAttribute('cx', pt.x);
                    outP.setAttribute('cy', pt.y);
                    const burst = q < 0.18 ? 1 + ((0.18 - q) / 0.18) * 1.1 : 1;
                    outP.setAttribute('r', (5.5 * burst).toFixed(2));
                    outP.style.opacity = q > 0.9 ? (1 - q) * 10 : 1;
                } else outP.style.opacity = 0;
            }
            raf = requestAnimationFrame(loop);
        };
        raf = requestAnimationFrame(loop);
        return () => {
            cancelAnimationFrame(raf);
            unobserve();
        };
    }, [animated, active]);

    const cardMetric = (label, value, on) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <span
                style={{
                    fontSize: 9,
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                    color: 'rgba(255,255,255,0.4)',
                    whiteSpace: 'nowrap',
                }}
            >
                {label}
            </span>
            <span
                style={{
                    fontFamily: 'var(--ox-font-mono)',
                    fontSize: 12,
                    fontWeight: 600,
                    whiteSpace: 'nowrap',
                    color: on ? color : 'rgba(255,255,255,0.82)',
                }}
            >
                {value}
            </span>
        </div>
    );

    return (
        <div
            ref={wrapRef}
            style={{
                position: 'relative',
                width: '100%',
                minHeight: height || (vertical ? 460 : 300),
                display: 'flex',
                alignItems: 'center',
                gap: vertical ? 26 : 48,
                flexDirection: vertical ? 'column' : 'row',
                justifyContent: vertical ? 'flex-start' : 'space-between',
                padding: vertical ? '20px 16px' : '18px 8px',
                boxSizing: 'border-box',
                ...style,
            }}
        >
            <svg
                aria-hidden="true"
                width={geom.w}
                height={geom.h}
                viewBox={`0 0 ${geom.w || 1} ${geom.h || 1}`}
                style={{
                    position: 'absolute',
                    inset: 0,
                    pointerEvents: 'none',
                }}
            >
                <defs>
                    <filter
                        id="oxfr-glow"
                        x="-60%"
                        y="-60%"
                        width="220%"
                        height="220%"
                    >
                        <feGaussianBlur stdDeviation="3" result="b" />
                        <feMerge>
                            <feMergeNode in="b" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>
                <path
                    ref={inPathRef}
                    d={geom.inD}
                    fill="none"
                    stroke="rgba(255,255,255,0.12)"
                    strokeWidth="1"
                    strokeDasharray="2 5"
                />
                {geom.links.map((l, i) => (
                    <path
                        key={i}
                        ref={(el) => (outPathRefs.current[i] = el)}
                        d={l.d}
                        fill="none"
                        stroke={i === active ? color : 'rgba(255,255,255,0.10)'}
                        strokeWidth={i === active ? 1.6 : 1}
                        strokeDasharray={i === active ? 'none' : '2 6'}
                        style={{
                            transition:
                                'stroke 400ms ease, stroke-width 400ms ease',
                        }}
                    />
                ))}
                <circle
                    ref={inPulseRef}
                    r="3.2"
                    fill={color}
                    filter="url(#oxfr-glow)"
                    style={{ opacity: 0 }}
                />
                <circle
                    ref={outPulseRef}
                    r="5.5"
                    fill={color}
                    filter="url(#oxfr-glow)"
                    style={{ opacity: 0 }}
                />
            </svg>

            <div
                style={{
                    position: 'relative',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 6,
                    flexShrink: 0,
                }}
            >
                <div
                    ref={gwRingRef}
                    style={{
                        position: 'absolute',
                        top: 8,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: 100,
                        height: 92,
                        borderRadius: '50%',
                        background: `radial-gradient(circle, ${color}33, transparent 68%)`,
                        filter: 'blur(6px)',
                        opacity: 0.3,
                        transition: 'opacity 120ms linear',
                        pointerEvents: 'none',
                    }}
                />
                <div
                    ref={gwRef}
                    style={{ position: 'relative', width: 122, height: 108 }}
                >
                    <DotField
                        strands={11}
                        density={0.7}
                        speed={1.75}
                        glow
                        fit={0.56}
                    />
                </div>
                <span
                    style={{
                        fontFamily: 'var(--ox-font-sans)',
                        fontSize: 11,
                        fontWeight: 700,
                        letterSpacing: '0.16em',
                        color: '#eef3f2',
                    }}
                >
                    GATEWAY
                </span>
            </div>

            <div
                style={{
                    position: vertical ? 'static' : 'absolute',
                    left: vertical ? 'auto' : '50%',
                    top: vertical ? 'auto' : 18,
                    transform: vertical ? 'none' : 'translateX(-50%)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    zIndex: 2,
                    padding: '5px 12px',
                    borderRadius: 'var(--ox-radius-full)',
                    background: 'rgba(51,193,62,0.12)',
                    border: `1px solid ${color}44`,
                }}
            >
                <span
                    style={{
                        fontSize: 10,
                        letterSpacing: '0.08em',
                        textTransform: 'uppercase',
                        color: 'rgba(255,255,255,0.55)',
                        whiteSpace: 'nowrap',
                    }}
                >
                    Routing by
                </span>
                <span
                    style={{
                        fontFamily: 'var(--ox-font-sans)',
                        fontSize: 12,
                        fontWeight: 700,
                        color,
                        whiteSpace: 'nowrap',
                    }}
                >
                    {criteria[crit].label}
                </span>
            </div>

            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 10,
                    flexShrink: 0,
                    width: vertical ? '100%' : 340,
                    maxWidth: '100%',
                }}
            >
                {data.map((m, i) => {
                    const on = i === active;
                    return (
                        <div
                            key={m.name}
                            ref={(el) => (cardRefs.current[i] = el)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                gap: 16,
                                padding: '10px 14px',
                                borderRadius: 'var(--ox-radius-md)',
                                background: on
                                    ? 'rgba(51,193,62,0.10)'
                                    : 'rgba(255,255,255,0.03)',
                                border: `1px solid ${on ? color + '99' : 'rgba(255,255,255,0.08)'}`,
                                boxShadow: on ? `0 0 22px ${color}33` : 'none',
                                transition: 'all 400ms var(--ox-ease, ease)',
                                minWidth: 0,
                            }}
                        >
                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 9,
                                }}
                            >
                                <span
                                    style={{
                                        width: 7,
                                        height: 7,
                                        borderRadius: '50%',
                                        flexShrink: 0,
                                        background: on
                                            ? color
                                            : 'rgba(255,255,255,0.3)',
                                        boxShadow: on
                                            ? `0 0 8px ${color}`
                                            : 'none',
                                    }}
                                />
                                <span
                                    style={{
                                        fontFamily: 'var(--ox-font-mono)',
                                        fontSize: 13,
                                        fontWeight: 600,
                                        color: on
                                            ? '#eef3f2'
                                            : 'rgba(255,255,255,0.62)',
                                        whiteSpace: 'nowrap',
                                    }}
                                >
                                    {m.name}
                                </span>
                            </div>
                            <div
                                style={{
                                    display: 'flex',
                                    gap: 18,
                                    flexShrink: 0,
                                }}
                            >
                                {cardMetric(
                                    'cost /1M',
                                    '$' + m.cost.toFixed(2),
                                    on && criteria[crit].key === 'cost',
                                )}
                                {cardMetric(
                                    'speed t/s',
                                    m.speed,
                                    on && criteria[crit].key === 'speed',
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
