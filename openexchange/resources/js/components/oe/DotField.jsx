import React, { useRef, useEffect } from 'react';
import { observeVisibility } from './visibility.js';

/**
 * DotField — the Open Exchange signature motif: a flowing ribbon of green
 * particles that loops and pinches like the logo swirl. Renders to a canvas
 * that fills its positioned parent. Purely decorative (aria-hidden).
 *
 * PERFORMANCE. This used to draw every particle with `beginPath + arc + fill`
 * while `ctx.shadowBlur` was set, which forces the browser into a separate blur
 * pass per fill. On the landing page that was ~15.5k particles/frame, ~930k
 * blurred fills/second — enough to peg a low-end laptop. It now:
 *
 *   1. blits a pre-rendered glow sprite (one drawImage per particle, no blur pass),
 *   2. caps at 30fps and advances on real elapsed time, so motion speed is the
 *      same whether the machine hits 120fps or 20fps,
 *   3. pauses entirely when scrolled out of view,
 *   4. caps devicePixelRatio at 1.5 — invisible on a blurry dot field,
 *   5. measures its own frame cost and drops particle count on slow devices.
 *
 * `prefers-reduced-motion` still renders exactly one static frame.
 */

/** Glow sprites are pure functions of (color, glow) — build each at most once. */
const SPRITES = new Map();

/** Sprite geometry, in sprite-space pixels. CORE is the solid dot; HALO is the glow. */
const CORE = 8;
const HALO = 10;

function hexToRgb(hex) {
    const h = hex.replace('#', '');
    const n = parseInt(
        h.length === 3
            ? h
                  .split('')
                  .map((c) => c + c)
                  .join('')
            : h,
        16,
    );
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function glowSprite(color, glow) {
    const key = `${color}|${glow}`;
    if (SPRITES.has(key)) return SPRITES.get(key);

    const radius = glow ? CORE + HALO : CORE;
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = radius * 2;
    const ctx = canvas.getContext('2d');
    const [r, g, b] = hexToRgb(color);

    if (glow) {
        const grad = ctx.createRadialGradient(
            radius,
            radius,
            0,
            radius,
            radius,
            radius,
        );
        grad.addColorStop(0, `rgba(${r},${g},${b},1)`);
        grad.addColorStop(CORE / radius, `rgba(${r},${g},${b},0.55)`);
        grad.addColorStop(1, `rgba(${r},${g},${b},0)`);
        ctx.fillStyle = grad;
    } else {
        ctx.fillStyle = `rgb(${r},${g},${b})`;
    }

    ctx.beginPath();
    ctx.arc(radius, radius, radius, 0, Math.PI * 2);
    ctx.fill();

    const sprite = { canvas, radius };
    SPRITES.set(key, sprite);
    return sprite;
}

/**
 * Quality tiers. Particle count scales with q^2 (fewer strands AND coarser steps),
 * so tier 2 costs a quarter of tier 0 while keeping the same silhouette.
 */
const TIERS = [1, 0.72, 0.5];

/** A cheap guess before we've measured anything — avoids one janky second on weak hardware. */
function initialTier() {
    if (typeof navigator === 'undefined') return 0;
    const cores = navigator.hardwareConcurrency || 4;
    if (cores <= 2) return 2;
    if (cores <= 4) return 1;
    return 0;
}

export function DotField({
    color = '#33c13e',
    density = 1,
    speed = 1,
    strands = 22,
    variant = 'loop', // 'loop' | 'wave'
    glow = true,
    fit = 1, // shrink (<1) so the whole swirl fits a small container without clipping
    fps = 30, // decorative drift; 30 is indistinguishable from 60 here and halves the cost
    style = {},
    className = '',
}) {
    const ref = useRef(null);

    useEffect(() => {
        const canvas = ref.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const reduce = window.matchMedia(
            '(prefers-reduced-motion: reduce)',
        ).matches;
        const sprite = glowSprite(color, glow);

        let raf = 0;
        let t = 0;
        let w = 0;
        let h = 0;
        let visible = true;
        let last = 0;
        let tier = initialTier();
        let slowFrames = 0;

        const frameBudgetMs = 1000 / fps;
        // Decoration gets a hard slice of the main thread, not "whatever fits the frame".
        // 8ms leaves the rest of the page room to breathe even at 60fps.
        const costCeilingMs = Math.min(8, frameBudgetMs * 0.5);

        function resize() {
            const r = canvas.getBoundingClientRect();
            // A blurred particle field gains nothing from a 3x backing store.
            const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
            w = r.width;
            h = r.height;
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
            const q = TIERS[tier];
            const nStrands = Math.max(5, Math.round(strands * q));
            const step = 0.012 / Math.max(0.35, density) / q;

            ctx.clearRect(0, 0, w, h);
            const cx = w * (variant === 'wave' ? 0.5 : 0.46);
            const cy = h * 0.5;
            // On narrow (mobile) widths, scale the loop up off the width so it fills
            // the screen rather than shrinking to a short hero's height.
            const baseMul = variant === 'wave' ? 0.42 : 0.46;
            const scale =
                (w <= 700
                    ? Math.max(Math.min(w, h) * baseMul, w * 0.5)
                    : Math.min(w, h) * baseMul) * fit;
            const rot = variant === 'wave' ? 0 : -0.35;
            const cosR = Math.cos(rot);
            const sinR = Math.sin(rot);
            const flow = t * 0.6 * speed;

            for (let s = 0; s < Math.PI * 2; s += step) {
                const [px, py] = centre(s);
                const [nx, ny] = centre(s + 0.001);
                let tx = nx - px;
                let ty = ny - py;
                const tl = Math.hypot(tx, ty) || 1;
                tx /= tl;
                ty /= tl;
                const normx = -ty;
                const normy = tx;
                const hw = halfWidth(s);
                const twist = Math.cos(s * 2 + flow);

                for (let j = 0; j < nStrands; j++) {
                    const u = nStrands === 1 ? 0 : (j / (nStrands - 1)) * 2 - 1;
                    const off = u * hw * (0.55 + 0.45 * twist);
                    const X = px + normx * off;
                    const Y = py + normy * off;
                    const rx = X * cosR - Y * sinR;
                    const ry = X * sinR + Y * cosR;
                    const sx = cx + rx * scale;
                    const sy = cy + ry * scale;
                    const depth =
                        0.5 + 0.5 * Math.sin(s * 3 - flow * 1.4 + u * 2.2);
                    const edge = 1 - Math.abs(u) * 0.35;
                    const a = depth * edge;
                    if (a <= 0.02) continue; // invisible: skip the blit entirely
                    const rad =
                        (0.7 + 0.9 * depth) * (0.85 - 0.3 * Math.abs(u));

                    // One sprite blit, scaled so its solid core matches `rad`.
                    const size = (rad / CORE) * sprite.radius * 2;
                    const half = size / 2;
                    ctx.globalAlpha = Math.min(1, a) * 0.9;
                    ctx.drawImage(
                        sprite.canvas,
                        sx - half,
                        sy - half,
                        size,
                        size,
                    );
                }
            }
            ctx.globalAlpha = 1;
        }

        /** Downgrade (never upgrade) so quality can't oscillate on a marginal device. */
        function measure(cost) {
            if (tier >= TIERS.length - 1) return;
            if (cost > costCeilingMs) {
                if (++slowFrames >= 12) {
                    tier++;
                    slowFrames = 0;
                }
            } else if (slowFrames > 0) {
                slowFrames--;
            }
        }

        function loop(now) {
            raf = requestAnimationFrame(loop);
            if (!visible) return;

            const elapsed = now - last;
            if (elapsed < frameBudgetMs) return;
            // Time-based, so the swirl drifts at one speed on every machine (it used to
            // run in slow motion on anything that couldn't hit 60fps). 0.96 = the old
            // per-frame 0.016 x 60fps, so the motion is unchanged.
            // Clamp: a backgrounded tab must not fast-forward the swirl on return.
            t += (Math.min(elapsed, 100) / 1000) * 0.96;
            last = now;

            const started = performance.now();
            frame();
            measure(performance.now() - started);
        }

        resize();
        frame();

        const ro = new ResizeObserver(() => {
            resize();
            frame();
        });
        ro.observe(canvas);

        // Offscreen decoration must not cost anything.
        const unobserve = observeVisibility(canvas, (v) => {
            visible = v;
            if (v) last = performance.now();
        });

        if (!reduce) {
            last = performance.now();
            raf = requestAnimationFrame(loop);
        }

        return () => {
            cancelAnimationFrame(raf);
            ro.disconnect();
            unobserve();
        };
    }, [color, density, speed, strands, variant, glow, fit, fps]);

    return (
        <canvas
            ref={ref}
            aria-hidden="true"
            className={className}
            style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                display: 'block',
                pointerEvents: 'none',
                ...style,
            }}
        />
    );
}
