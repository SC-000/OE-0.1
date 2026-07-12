import React from 'react';

/**
 * KPI / metric tile. Big mono figure, label, optional signed delta chip.
 *
 * `estimate` marks a figure that hasn't happened yet — a projection, not a booked
 * number. It is deliberately quieter than its siblings: a step smaller, in muted ink,
 * behind an "≈", inside a dashed border. Dashed reads as provisional, which is exactly
 * what it is; a solid tile of the same weight as the actual-spend tile beside it would
 * be claiming a certainty we don't have. Muted ink here still clears 4.5:1 on both
 * surfaces, so quieter never means harder to read.
 */
export function StatCard({ label, value, unit, delta, deltaDirection, hint, estimate = false, style = {} }) {
    const up = deltaDirection === 'up';
    const deltaColor = up ? 'var(--ox-success)' : 'var(--ox-danger)';
    const deltaBg = up ? 'var(--ox-success-surface)' : 'var(--ox-danger-surface)';
    return (
        <div style={{
            display: 'flex', flexDirection: 'column', gap: 10, background: 'var(--ox-surface)',
            border: estimate ? '1px dashed var(--ox-border-strong)' : '1px solid var(--ox-border)',
            borderRadius: 'var(--ox-radius-lg)',
            padding: 'var(--ox-space-5)', boxShadow: 'var(--ox-shadow-xs)', ...style,
        }}>
            <div style={{
                fontFamily: 'var(--ox-font-sans)', fontSize: 'var(--ox-text-xs)', fontWeight: 'var(--ox-weight-semibold)',
                letterSpacing: 'var(--ox-tracking-caps)', textTransform: 'uppercase', color: 'var(--ox-text-subtle)',
            }}>{label}</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, flexWrap: 'wrap' }}>
                <span style={{
                    fontFamily: 'var(--ox-font-mono)',
                    fontSize: estimate ? 'var(--ox-text-xl)' : 'var(--ox-text-2xl)',
                    fontWeight: 'var(--ox-weight-medium)',
                    color: estimate ? 'var(--ox-text-muted)' : 'var(--ox-text)',
                    lineHeight: 1, letterSpacing: 'var(--ox-tracking-snug)',
                    // A long figure must break rather than widen the tile — these
                    // sit in auto-fit grids where an over-wide item drags the
                    // whole track (and the page) out past the viewport.
                    minWidth: 0, overflowWrap: 'anywhere',
                }}>
                    {/* Decorative: the label and hint already say this is an estimate. */}
                    {estimate && <span aria-hidden="true" style={{ marginRight: 3 }}>≈</span>}
                    {value}
                </span>
                {unit && <span style={{ fontFamily: 'var(--ox-font-sans)', fontSize: 'var(--ox-text-sm)', color: 'var(--ox-text-subtle)' }}>{unit}</span>}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                {delta != null && (
                    <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: 3, fontFamily: 'var(--ox-font-mono)',
                        fontSize: 'var(--ox-text-xs)', fontWeight: 600, color: deltaColor, background: deltaBg,
                        padding: '2px 7px', borderRadius: 'var(--ox-radius-full)',
                    }}>
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={deltaColor} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ transform: up ? 'none' : 'rotate(180deg)' }}>
                            <polyline points="18 15 12 9 6 15" />
                        </svg>
                        {delta}
                    </span>
                )}
                {hint && <span style={{ fontFamily: 'var(--ox-font-sans)', fontSize: 'var(--ox-text-xs)', color: 'var(--ox-text-subtle)' }}>{hint}</span>}
            </div>
        </div>
    );
}
