import React, { useEffect, useRef } from 'react';
import { observeVisibility } from './visibility.js';

/**
 * Live rate ticker — an exchange-style scrolling marquee of model/instrument
 * quotes. tone: 'dark' (ink) | 'light' (beige). Purely presentational.
 */
const DEFAULTS = [
    { symbol: 'GPT-5.5', price: '5.00 / 30.00', delta: '-2.1%', dir: 'down' },
    {
        symbol: 'CLAUDE-OPUS-4.8',
        price: '5.00 / 25.00',
        delta: '+0.0%',
        dir: 'flat',
    },
    {
        symbol: 'GEMINI-3.1-PRO',
        price: '2.00 / 12.00',
        delta: '-6.0%',
        dir: 'down',
    },
    {
        symbol: 'GEMINI-2.5-FLASH',
        price: '0.30 / 2.50',
        delta: '-3.2%',
        dir: 'down',
    },
    {
        symbol: 'LLAMA-4-MAVERICK',
        price: '0.15 / 0.60',
        delta: '+1.1%',
        dir: 'up',
    },
    {
        symbol: 'DEEPSEEK-V4-PRO',
        price: '0.44 / 0.87',
        delta: '+0.8%',
        dir: 'up',
    },
    { symbol: 'GROK-4.3', price: '1.25 / 2.50', delta: '-4.0%', dir: 'down' },
    {
        symbol: 'MISTRAL-LARGE-3',
        price: '2.00 / 6.00',
        delta: '+0.3%',
        dir: 'up',
    },
];

export function RateTicker({
    items = DEFAULTS,
    tone = 'dark',
    label = 'GRADE RATES · $/1M in·out',
    style = {},
}) {
    const canvasRef = useRef(null);
    const viewportRef = useRef(null);
    const dark = tone === 'dark';
    const bg = dark ? 'var(--ox-ink-900)' : 'var(--ox-cream)';
    const border = dark ? 'rgba(255,255,255,0.09)' : 'var(--ox-border)';
    const tickerLabel = `${label}: ${items.map((it) => `${it.symbol} ${it.price} ${it.delta}`).join(', ')}`;

    useEffect(() => {
        const canvas = canvasRef.current;
        const viewport = viewportRef.current;
        const ctx = canvas?.getContext('2d', { alpha: true });
        if (!canvas || !viewport || !ctx) return undefined;

        let frame = 0;
        let width = 0;
        let height = 0;
        let segmentWidth = 1;
        let dpr = 1;
        let start = performance.now();
        let rows = [];
        let reducedMotion = window.matchMedia(
            '(prefers-reduced-motion: reduce)',
        ).matches;
        // Declared up here so draw() never closes over a temporal-dead-zone binding.
        let visible = true;
        let pausedAt = 0;

        const resolve = (value, fallback) => {
            if (!value) return fallback;
            if (!value.startsWith('var(')) return value;
            const key = value.slice(4, -1).trim();
            return (
                getComputedStyle(document.documentElement)
                    .getPropertyValue(key)
                    .trim() || fallback
            );
        };

        const colors = () => ({
            border: resolve(border, 'rgba(255,255,255,0.09)'),
            symbol: dark ? '#e6ecea' : resolve('var(--ox-text)', '#122023'),
            price: dark
                ? 'rgba(230,236,234,0.7)'
                : resolve('var(--ox-text-muted)', '#60706d'),
            up: resolve('var(--ox-success)', '#23a531'),
            down: resolve('var(--ox-danger)', '#d84343'),
            flat: dark
                ? 'rgba(230,236,234,0.5)'
                : resolve('var(--ox-text-subtle)', '#7f8c89'),
            mono: resolve(
                'var(--ox-font-mono)',
                "'IBM Plex Mono', ui-monospace, monospace",
            ),
        });

        const measureRows = () => {
            const c = colors();
            ctx.font = `600 12px ${c.mono}`;
            rows = items.map((it) => {
                const symbolWidth = ctx.measureText(it.symbol).width;
                ctx.font = `400 12px ${c.mono}`;
                const priceWidth = ctx.measureText(it.price).width;
                ctx.font = `600 12px ${c.mono}`;
                const deltaWidth = ctx.measureText(it.delta).width;
                return {
                    item: it,
                    width: Math.ceil(
                        40 + symbolWidth + priceWidth + deltaWidth + 16,
                    ),
                    symbolWidth,
                    priceWidth,
                    deltaWidth,
                };
            });
            segmentWidth = Math.max(
                1,
                rows.reduce((sum, row) => sum + row.width, 0),
            );
        };

        const resize = () => {
            const rect = viewport.getBoundingClientRect();
            width = Math.max(1, Math.ceil(rect.width));
            height = Math.max(1, Math.ceil(rect.height));
            dpr = Math.min(window.devicePixelRatio || 1, 2);
            canvas.width = Math.round(width * dpr);
            canvas.height = Math.round(height * dpr);
            canvas.style.width = `${width}px`;
            canvas.style.height = `${height}px`;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            measureRows();
        };

        const drawItem = (row, x, y, c) => {
            const { item } = row;
            let cursor = x + 20;
            ctx.font = `600 12px ${c.mono}`;
            ctx.fillStyle = c.symbol;
            ctx.fillText(item.symbol, cursor, y);
            cursor += row.symbolWidth + 8;
            ctx.font = `400 12px ${c.mono}`;
            ctx.fillStyle = c.price;
            ctx.fillText(item.price, cursor, y);
            cursor += row.priceWidth + 8;
            ctx.font = `600 12px ${c.mono}`;
            ctx.fillStyle =
                item.dir === 'up'
                    ? c.up
                    : item.dir === 'down'
                      ? c.down
                      : c.flat;
            ctx.fillText(item.delta, cursor, y);
            ctx.strokeStyle = c.border;
            ctx.beginPath();
            ctx.moveTo(Math.round(x + row.width) + 0.5, 7);
            ctx.lineTo(Math.round(x + row.width) + 0.5, height - 7);
            ctx.stroke();
        };

        const draw = (now) => {
            // Scrolled past? Keep the loop alive but skip the repaint, and rebase `start`
            // on return so the ticker resumes rather than jumping forward.
            if (!visible) {
                if (!reducedMotion) frame = requestAnimationFrame(draw);
                return;
            }
            const c = colors();
            const speed = 30;
            const offset = reducedMotion
                ? 0
                : (((now - start) / 1000) * speed) % segmentWidth;
            ctx.clearRect(0, 0, width, height);
            ctx.textBaseline = 'middle';
            ctx.lineWidth = 1;
            if (rows.length === 0) return;

            let x = -offset;
            while (x < width + segmentWidth) {
                for (const row of rows) {
                    if (x + row.width >= -40 && x <= width + 40) {
                        drawItem(row, x, height / 2, c);
                    }
                    x += row.width;
                }
            }

            if (!reducedMotion) {
                frame = requestAnimationFrame(draw);
            }
        };

        const redraw = () => {
            cancelAnimationFrame(frame);
            resize();
            start = performance.now();
            frame = requestAnimationFrame(draw);
        };

        redraw();
        const unobserveVisibility = observeVisibility(viewport, (v) => {
            if (v && pausedAt) {
                start += performance.now() - pausedAt;
                pausedAt = 0;
            }
            if (!v) pausedAt = performance.now();
            visible = v;
        });
        const observer =
            typeof ResizeObserver !== 'undefined'
                ? new ResizeObserver(redraw)
                : null;
        observer?.observe(viewport);
        const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
        const onMotion = () => {
            reducedMotion = motion.matches;
            redraw();
        };
        motion.addEventListener?.('change', onMotion);
        document.fonts?.ready?.then(redraw).catch(() => {});
        window.addEventListener('resize', redraw, { passive: true });

        return () => {
            cancelAnimationFrame(frame);
            observer?.disconnect();
            unobserveVisibility();
            motion.removeEventListener?.('change', onMotion);
            window.removeEventListener('resize', redraw);
        };
    }, [border, dark, items]);

    return (
        <div
            style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'stretch',
                background: bg,
                borderTop: `1px solid ${border}`,
                borderBottom: `1px solid ${border}`,
                overflow: 'hidden',
                ...style,
            }}
        >
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '0 16px',
                    flexShrink: 0,
                    zIndex: 2,
                    background: dark
                        ? 'var(--ox-ink-800)'
                        : 'var(--ox-beige-200)',
                    borderRight: `1px solid ${border}`,
                    fontFamily: 'var(--ox-font-mono)',
                    fontSize: 11,
                    letterSpacing: '0.08em',
                    color: dark ? 'var(--ox-green-400)' : 'var(--ox-green-700)',
                    whiteSpace: 'nowrap',
                }}
            >
                <span
                    style={{
                        width: 6,
                        height: 6,
                        borderRadius: '50%',
                        background: 'var(--ox-green-500)',
                        boxShadow: '0 0 8px var(--ox-green-500)',
                    }}
                />
                {label}
            </div>
            <div
                ref={viewportRef}
                className="ox-ticker-viewport"
                role="img"
                aria-label={tickerLabel}
                style={{ flex: 1, '--ox-ticker-bg': bg }}
            >
                <canvas ref={canvasRef} className="ox-ticker-canvas" />
            </div>
        </div>
    );
}
