import React, { useRef, useEffect } from 'react';

/**
 * DotField — the Open Exchange signature motif: a flowing ribbon of green
 * particles that loops and pinches like the logo swirl. Renders to a canvas
 * that fills its positioned parent. Purely decorative (aria-hidden).
 */
export function DotField({
    color = '#33c13e',
    density = 1,
    speed = 1,
    strands = 22,
    variant = 'loop', // 'loop' | 'wave'
    glow = true,
    fit = 1, // shrink (<1) so the whole swirl fits a small container without clipping
    style = {},
    className = '',
}) {
    const ref = useRef(null);

    useEffect(() => {
        const canvas = ref.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        let raf, t = 0, w = 0, h = 0, dpr = 1;

        function resize() {
            const r = canvas.getBoundingClientRect();
            dpr = Math.min(window.devicePixelRatio || 1, 2);
            w = r.width; h = r.height;
            canvas.width = Math.max(1, Math.floor(w * dpr));
            canvas.height = Math.max(1, Math.floor(h * dpr));
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        }

        function centre(s) {
            if (variant === 'wave') {
                return [(s / (Math.PI * 2)) * 2 - 1, 0.55 * Math.sin(s * 1.3)];
            }
            const x = Math.cos(s) + 0.18 * Math.cos(2 * s);
            const y = Math.sin(s) + 0.34 * Math.sin(2 * s);
            return [x, y];
        }
        function halfWidth(s) {
            if (variant === 'wave') return 0.34;
            return 0.06 + 0.44 * (0.5 - 0.5 * Math.cos(s));
        }

        function frame() {
            ctx.clearRect(0, 0, w, h);
            const cx = w * (variant === 'wave' ? 0.5 : 0.46);
            const cy = h * 0.5;
            const scale = Math.min(w, h) * (variant === 'wave' ? 0.42 : 0.46) * fit;
            const rot = variant === 'wave' ? 0 : -0.35;
            const cosR = Math.cos(rot), sinR = Math.sin(rot);

            const step = 0.012 / Math.max(0.35, density);
            const flow = t * 0.6 * speed;

            ctx.fillStyle = color;
            if (glow) { ctx.shadowColor = color; ctx.shadowBlur = 6; }

            for (let s = 0; s < Math.PI * 2; s += step) {
                const [px, py] = centre(s);
                const [nx, ny] = centre(s + 0.001);
                let tx = nx - px, ty = ny - py;
                const tl = Math.hypot(tx, ty) || 1; tx /= tl; ty /= tl;
                const normx = -ty, normy = tx;
                const hw = halfWidth(s);
                const twist = Math.cos(s * 2 + flow);

                for (let j = 0; j < strands; j++) {
                    const u = strands === 1 ? 0 : (j / (strands - 1)) * 2 - 1;
                    const off = u * hw * (0.55 + 0.45 * twist);
                    let X = px + normx * off;
                    let Y = py + normy * off;
                    const rx = X * cosR - Y * sinR;
                    const ry = X * sinR + Y * cosR;
                    const sx = cx + rx * scale;
                    const sy = cy + ry * scale;
                    const depth = 0.5 + 0.5 * Math.sin(s * 3 - flow * 1.4 + u * 2.2);
                    const edge = 1 - Math.abs(u) * 0.35;
                    const a = Math.max(0, Math.min(1, depth * edge));
                    const rad = (0.7 + 0.9 * depth) * (0.85 - 0.3 * Math.abs(u));
                    ctx.globalAlpha = a * 0.9;
                    ctx.beginPath();
                    ctx.arc(sx, sy, rad, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
            ctx.globalAlpha = 1;
            ctx.shadowBlur = 0;
        }

        resize();
        frame();
        const ro = new ResizeObserver(() => { resize(); frame(); });
        ro.observe(canvas);

        if (!reduce) {
            const loop = () => { t += 0.016; frame(); raf = requestAnimationFrame(loop); };
            raf = requestAnimationFrame(loop);
        }
        return () => { cancelAnimationFrame(raf); ro.disconnect(); };
    }, [color, density, speed, strands, variant, glow, fit]);

    return (
        <canvas
            ref={ref}
            aria-hidden="true"
            className={className}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', display: 'block', pointerEvents: 'none', ...style }}
        />
    );
}
