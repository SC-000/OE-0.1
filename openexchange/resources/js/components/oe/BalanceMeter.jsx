import React from 'react';

/**
 * Prepaid balance meter — shows a client's live credit balance against their
 * minimum-balance threshold and the auto-top-up amount that fires when it's
 * crossed. The core of the advanced billing portal, in one glanceable tile.
 */
export function BalanceMeter({ balance = 42.5, min = 10, topUp = 50, currency = '$', tone = 'light', hasCard = true, autoTopup = true, style = {} }) {
    const dark = tone === 'dark';
    const max = Math.max(balance, min + topUp) * 1.12;
    const pct = Math.max(2, Math.min(100, (balance / max) * 100));
    const minPct = Math.min(100, (min / max) * 100);
    const low = balance <= min;
    const willTopUp = low && hasCard && autoTopup;
    const statusLabel = !low ? 'Healthy' : willTopUp ? 'Topping up' : hasCard ? 'Low balance' : 'Add a card';
    const fill = low ? 'var(--ox-warning)' : 'var(--ox-green-500)';
    const surface = dark ? 'var(--ox-ink-800)' : 'var(--ox-surface)';
    const border = dark ? 'rgba(255,255,255,0.09)' : 'var(--ox-border)';
    const text = dark ? '#eef3f2' : 'var(--ox-text)';
    const muted = dark ? 'rgba(238,243,242,0.62)' : 'var(--ox-text-muted)';
    const track = dark ? 'rgba(255,255,255,0.08)' : 'var(--ox-beige-200)';
    const fmt = (n) => n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return (
        <div style={{ background: surface, border: `1px solid ${border}`, borderRadius: 'var(--ox-radius-lg)', padding: 'var(--ox-space-6)', boxShadow: dark ? 'none' : 'var(--ox-shadow-sm)', ...style }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18 }}>
                <div>
                    <div style={{ fontFamily: 'var(--ox-font-sans)', fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: dark ? 'rgba(238,243,242,0.5)' : 'var(--ox-text-subtle)' }}>Prepaid balance</div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 6 }}>
                        <span style={{ fontFamily: 'var(--ox-font-mono)', fontSize: 'var(--ox-text-3xl)', fontWeight: 500, color: text, lineHeight: 1, letterSpacing: '-0.02em' }}>{currency}{fmt(balance)}</span>
                        <span style={{ fontFamily: 'var(--ox-font-sans)', fontSize: 13, color: muted }}>USD</span>
                    </div>
                </div>
                <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 'var(--ox-radius-full)',
                    fontFamily: 'var(--ox-font-sans)', fontSize: 12, fontWeight: 600,
                    background: low ? 'var(--ox-warning-surface)' : 'var(--ox-success-surface)', color: low ? 'var(--ox-warning)' : 'var(--ox-success)',
                }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: low ? 'var(--ox-warning)' : 'var(--ox-success)' }} />
                    {statusLabel}
                </span>
            </div>

            <div style={{ position: 'relative', height: 12, borderRadius: 999, background: track, overflow: 'visible' }}>
                <div style={{ position: 'absolute', inset: 0, width: `${pct}%`, borderRadius: 999, background: fill, transition: 'width var(--ox-dur-slow) var(--ox-ease)', boxShadow: `0 0 12px ${low ? 'rgba(217,149,17,0.4)' : 'rgba(51,193,62,0.4)'}` }} />
                {/* minimum threshold marker */}
                <div style={{ position: 'absolute', top: -5, bottom: -5, left: `${minPct}%`, width: 2, background: dark ? 'rgba(255,255,255,0.4)' : 'var(--ox-ink-700)', borderRadius: 2 }} />
                <span style={{ position: 'absolute', top: 18, left: `${minPct}%`, transform: 'translateX(-50%)', fontFamily: 'var(--ox-font-mono)', fontSize: 10, color: muted, whiteSpace: 'nowrap' }}>min {currency}{min}</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 30, paddingTop: 16, borderTop: `1px solid ${border}` }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--ox-green-500)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10" /><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" /></svg>
                <span style={{ fontFamily: 'var(--ox-font-sans)', fontSize: 13, color: muted }}>
                    {!hasCard
                        ? <>Add a card to fund your balance — we take an initial top-up, then keep it above your minimum.</>
                        : !autoTopup
                            ? <>Auto top-up is <span style={{ color: text, fontWeight: 600 }}>off</span> — top up manually anytime.</>
                            : <>Auto top-up <span style={{ fontFamily: 'var(--ox-font-mono)', color: text, fontWeight: 600 }}>+{currency}{topUp}</span> when balance falls below <span style={{ fontFamily: 'var(--ox-font-mono)', color: text, fontWeight: 600 }}>{currency}{min}</span></>}
                </span>
            </div>
        </div>
    );
}
