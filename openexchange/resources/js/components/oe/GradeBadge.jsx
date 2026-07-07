import React from 'react';

/**
 * Instrument grade badge — the graded "instrument" code, e.g. Z5, D7, AA10.
 * V–Z generations (and multi-letter) are premium tiers → gold ring; lower
 * generations read as brand/neutral. Monospace, exchange-grade.
 */
export function GradeBadge({ grade = 'Z5', title, size = 'md', style = {} }) {
    const premium = /^([V-Z]|[A-Z]{2})/.test(grade);
    const sizes = {
        sm: { pad: '2px 7px', fs: 11, radius: 6 },
        md: { pad: '3px 9px', fs: 13, radius: 7 },
        lg: { pad: '5px 12px', fs: 16, radius: 8 },
    }[size];
    const palette = premium
        ? { bg: 'rgba(201,153,46,0.14)', color: 'var(--ox-gold-600)', ring: 'rgba(201,153,46,0.45)' }
        : { bg: 'var(--ox-primary-subtle)', color: 'var(--ox-green-700)', ring: 'rgba(51,193,62,0.4)' };
    return (
        <span title={title} style={{
            display: 'inline-flex', alignItems: 'center', gap: 5, padding: sizes.pad, borderRadius: sizes.radius,
            fontFamily: 'var(--ox-font-mono)', fontSize: sizes.fs, fontWeight: 600, letterSpacing: '0.02em',
            background: palette.bg, color: palette.color, boxShadow: `inset 0 0 0 1px ${palette.ring}`,
            fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap', ...style,
        }}>
            {grade}
        </span>
    );
}
