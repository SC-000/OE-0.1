import React, { useLayoutEffect, useRef, useState } from 'react';

/**
 * Live rate ticker — an exchange-style scrolling marquee of model/instrument
 * quotes. tone: 'dark' (ink) | 'light' (beige). Purely presentational.
 */
const DEFAULTS = [
    { symbol: 'GPT-5.5', price: '5.00 / 30.00', delta: '-2.1%', dir: 'down' },
    { symbol: 'CLAUDE-OPUS-4.8', price: '5.00 / 25.00', delta: '+0.0%', dir: 'flat' },
    { symbol: 'GEMINI-3.1-PRO', price: '2.00 / 12.00', delta: '-6.0%', dir: 'down' },
    { symbol: 'GEMINI-2.5-FLASH', price: '0.30 / 2.50', delta: '-3.2%', dir: 'down' },
    { symbol: 'LLAMA-4-MAVERICK', price: '0.15 / 0.60', delta: '+1.1%', dir: 'up' },
    { symbol: 'DEEPSEEK-V4-PRO', price: '0.44 / 0.87', delta: '+0.8%', dir: 'up' },
    { symbol: 'GROK-4.3', price: '1.25 / 2.50', delta: '-4.0%', dir: 'down' },
    { symbol: 'MISTRAL-LARGE-3', price: '2.00 / 6.00', delta: '+0.3%', dir: 'up' },
];

export function RateTicker({ items = DEFAULTS, tone = 'dark', label = 'GRADE RATES · $/1M in·out', style = {} }) {
    const segmentRef = useRef(null);
    const [distance, setDistance] = useState(0);
    const dark = tone === 'dark';
    const bg = dark ? 'var(--ox-ink-900)' : 'var(--ox-cream)';
    const border = dark ? 'rgba(255,255,255,0.09)' : 'var(--ox-border)';
    const sym = dark ? '#e6ecea' : 'var(--ox-text)';
    const price = dark ? 'rgba(230,236,234,0.7)' : 'var(--ox-text-muted)';
    const deltaColor = (d) => (d === 'up' ? 'var(--ox-success)' : d === 'down' ? 'var(--ox-danger)' : dark ? 'rgba(230,236,234,0.5)' : 'var(--ox-text-subtle)');

    useLayoutEffect(() => {
        const node = segmentRef.current;
        if (!node) return undefined;

        let frame = 0;
        const measure = () => {
            cancelAnimationFrame(frame);
            frame = requestAnimationFrame(() => {
                const next = Math.ceil(node.getBoundingClientRect().width);
                setDistance((current) => (next > 0 && Math.abs(next - current) > 1 ? next : current));
            });
        };

        measure();
        const observer = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(measure) : null;
        observer?.observe(node);
        document.fonts?.ready?.then(measure).catch(() => {});
        window.addEventListener('resize', measure, { passive: true });

        return () => {
            cancelAnimationFrame(frame);
            observer?.disconnect();
            window.removeEventListener('resize', measure);
        };
    }, [items]);

    const duration = distance ? `${Math.max(48, Math.round(distance / 26))}s` : '48s';
    const renderItem = (it, key) => (
        <span key={key} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '9px 20px', borderRight: `1px solid ${border}` }}>
            <span style={{ fontFamily: 'var(--ox-font-mono)', fontSize: 12, fontWeight: 600, color: sym }}>{it.symbol}</span>
            <span style={{ fontFamily: 'var(--ox-font-mono)', fontSize: 12, color: price }}>{it.price}</span>
            <span style={{ fontFamily: 'var(--ox-font-mono)', fontSize: 12, fontWeight: 600, color: deltaColor(it.dir) }}>{it.delta}</span>
        </span>
    );

    return (
        <div style={{
            position: 'relative', display: 'flex', alignItems: 'stretch', background: bg,
            borderTop: `1px solid ${border}`, borderBottom: `1px solid ${border}`, overflow: 'hidden', ...style,
        }}>
            <div style={{
                display: 'flex', alignItems: 'center', gap: 6, padding: '0 16px', flexShrink: 0, zIndex: 2,
                background: dark ? 'var(--ox-ink-800)' : 'var(--ox-beige-200)', borderRight: `1px solid ${border}`,
                fontFamily: 'var(--ox-font-mono)', fontSize: 11, letterSpacing: '0.08em', color: dark ? 'var(--ox-green-400)' : 'var(--ox-green-700)', whiteSpace: 'nowrap',
            }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--ox-green-500)', boxShadow: '0 0 8px var(--ox-green-500)' }} />
                {label}
            </div>
            <div className="ox-ticker-viewport" style={{ flex: 1, '--ox-ticker-bg': bg }}>
                <div className="ox-ticker-track" style={{ '--ox-ticker-distance': `${distance}px`, '--ox-ticker-duration': duration }}>
                    <div ref={segmentRef} className="ox-ticker-segment">
                        {items.map((it, i) => renderItem(it, `a-${i}`))}
                    </div>
                    <div className="ox-ticker-segment" aria-hidden="true">
                        {items.map((it, i) => renderItem(it, `b-${i}`))}
                    </div>
                </div>
            </div>
        </div>
    );
}
