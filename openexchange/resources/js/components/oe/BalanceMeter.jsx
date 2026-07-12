import React from 'react';
import { DotField } from './DotField.jsx';

/**
 * Prepaid balance meter — shows a client's live credit balance against their
 * minimum-balance threshold and the auto-top-up amount that fires when it's
 * crossed. The core of the advanced billing portal, in one glanceable tile.
 *
 * `swirl` promotes the tile to the same object family as the PaymentCard: an ink
 * gradient with the signature particle swirl drifting behind it. The swirl only
 * reads on ink, so it implies the dark palette — passing `swirl` on a light page
 * still gives you a dark card, by design.
 *
 * NOTE. This component styles itself inline, which media queries cannot reach.
 * Anything that must change across breakpoints (the swirl's box, the balance
 * figure) is therefore owned by `oe.css` as `.oe-balance*` and must NOT be
 * re-declared here, or the inline value wins and the breakpoint does nothing.
 */
export function BalanceMeter({ balance = 42.5, min = 10, topUp = 50, currency = '$', currencyCode = 'GBP', tone = 'light', hasCard = true, autoTopup = true, topping = false, swirl = false, style = {} }) {
    // The swirl is invisible on cream — it carries the ink palette with it.
    const dark = tone === 'dark' || swirl;
    const max = Math.max(balance, min + topUp) * 1.12;
    const pct = Math.max(2, Math.min(100, (balance / max) * 100));
    const minPct = Math.min(100, (min / max) * 100);
    // "low" is strictly below the minimum — a balance sitting exactly at the
    // minimum is healthy. "Topping up" only shows when a top-up is genuinely
    // in progress (a pending TopUp), never merely because the balance is low.
    const low = balance < min;
    const alert = low || topping;
    const statusLabel = topping ? 'Topping up' : low ? (hasCard ? 'Low balance' : 'Add a card') : 'Healthy';
    // A two-stop fill reads as a lit object rather than a flat bar.
    const fill = low
        ? 'linear-gradient(90deg, #c0820c, var(--ox-warning))'
        : 'linear-gradient(90deg, var(--ox-green-600), var(--ox-green-400))';
    // The ink card is dark even when the page around it is the light theme, so the
    // dark chip/track values are literal here — the `.dark` theme vars won't apply.
    const surface = swirl
        ? 'linear-gradient(140deg, var(--ox-ink-800) 0%, var(--ox-ink-900) 46%, var(--ox-ink-950) 100%)'
        : dark ? 'var(--ox-ink-800)' : 'var(--ox-surface)';
    const border = dark ? 'rgba(255,255,255,0.1)' : 'var(--ox-border)';
    const text = dark ? '#eef3f2' : 'var(--ox-text)';
    const muted = dark ? 'rgba(238,243,242,0.62)' : 'var(--ox-text-muted)';
    const track = dark ? 'rgba(255,255,255,0.08)' : 'var(--ox-beige-200)';
    const chipBg = dark
        ? (alert ? 'rgba(217,149,17,0.18)' : 'rgba(35,165,49,0.18)')
        : (alert ? 'var(--ox-warning-surface)' : 'var(--ox-success-surface)');
    const chipText = dark
        ? (alert ? 'var(--ox-gold-400)' : 'var(--ox-green-300)')
        : (alert ? 'var(--ox-warning)' : 'var(--ox-success)');
    const fmt = (n) => n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return (
        <div className={swirl ? 'oe-balance oe-balance--ink' : 'oe-balance'} style={{ background: surface, border: `1px solid ${border}`, borderRadius: 'var(--ox-radius-lg)', boxShadow: swirl ? 'inset 0 1px 0 rgba(255,255,255,0.07), var(--ox-shadow-lg)' : dark ? 'none' : 'var(--ox-shadow-sm)', ...style }}>
            {swirl && (
                <>
                    {/* Decorative, aria-hidden inside DotField. The wrapper owns the box so
                        oe.css can re-anchor the swirl per breakpoint; DotField fills it.

                        PERFORMANCE. This is a small tile, not a hero, and it sits at 0.4
                        opacity behind text — so it runs on a deliberately thin particle
                        budget: ~3.1k particles/frame at 24fps, against the hero swirl's
                        ~11.5k at 30fps. Dots overlap heavily at this size, so the strand
                        and density cuts are invisible while costing ~4.5x less per second.
                        `fit` shrinks the loop so it tucks behind the right edge instead of
                        bisecting the card — DotField's own scaling assumes a hero-sized
                        canvas and blows the swirl up inside a container this small. */}
                    <div className="oe-balance-swirl">
                        <DotField strands={10} density={0.6} fit={0.6} fps={24} />
                    </div>
                    {/* Depth only: a soft light from the top-left, deepening into the
                        bottom-right corner. Sits above the swirl, below the content. */}
                    <div className="oe-balance-vignette" />
                </>
            )}

            <div className="oe-balance-body">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18, gap: 12, flexWrap: 'wrap' }}>
                    <div>
                        <div style={{ fontFamily: 'var(--ox-font-sans)', fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: dark ? 'rgba(238,243,242,0.5)' : 'var(--ox-text-subtle)' }}>Prepaid balance</div>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 6 }}>
                            <span className="oe-balance-figure" style={{ fontFamily: 'var(--ox-font-mono)', fontWeight: 500, color: text, lineHeight: 1, letterSpacing: '-0.02em' }}>{currency}{fmt(balance)}</span>
                            <span style={{ fontFamily: 'var(--ox-font-sans)', fontSize: 13, color: muted }}>{currencyCode}</span>
                        </div>
                    </div>
                    <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 'var(--ox-radius-full)',
                        fontFamily: 'var(--ox-font-sans)', fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap',
                        background: chipBg, color: chipText,
                    }}>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor' }} />
                        {statusLabel}
                    </span>
                </div>

                <div style={{ position: 'relative', height: 12, borderRadius: 999, background: track, overflow: 'visible' }}>
                    <div style={{ position: 'absolute', inset: 0, width: `${pct}%`, borderRadius: 999, background: fill, transition: 'width var(--ox-dur-slow) var(--ox-ease)', boxShadow: `0 0 12px ${low ? 'rgba(217,149,17,0.4)' : 'rgba(51,193,62,0.4)'}` }} />
                    {/* minimum threshold marker */}
                    <div style={{ position: 'absolute', top: -5, bottom: -5, left: `${minPct}%`, width: 2, background: dark ? 'rgba(255,255,255,0.4)' : 'var(--ox-ink-700)', borderRadius: 2 }} />
                    <span style={{ position: 'absolute', top: 18, left: `${minPct}%`, transform: 'translateX(-50%)', fontFamily: 'var(--ox-font-mono)', fontSize: 10, color: muted, whiteSpace: 'nowrap' }}>min {currency}{min}</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 30, paddingTop: 16, borderTop: `1px solid ${dark ? 'rgba(255,255,255,0.09)' : border}` }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--ox-green-500)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><polyline points="23 4 23 10 17 10" /><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" /></svg>
                    <span style={{ fontFamily: 'var(--ox-font-sans)', fontSize: 13, color: muted }}>
                        {!hasCard
                            ? <>Add a card to fund your balance — we take an initial top-up, then keep it above your minimum.</>
                            : !autoTopup
                                ? <>Auto top-up is <span style={{ color: text, fontWeight: 600 }}>off</span> — top up manually anytime.</>
                                : <>Auto top-up <span style={{ fontFamily: 'var(--ox-font-mono)', color: text, fontWeight: 600 }}>+{currency}{topUp}</span> when balance falls below <span style={{ fontFamily: 'var(--ox-font-mono)', color: text, fontWeight: 600 }}>{currency}{min}</span></>}
                    </span>
                </div>
            </div>
        </div>
    );
}
