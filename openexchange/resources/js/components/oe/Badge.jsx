import React from 'react';

/** Status badge with a leading dot. Tones: neutral, success, warning, danger, info, brand, gold. */
export function Badge({ children, tone = 'neutral', dot = true, style = {} }) {
    const tones = {
        neutral: { color: 'var(--ox-text-muted)', bg: 'var(--ox-bg-muted)', dot: 'var(--ox-slate-400)' },
        success: { color: 'var(--ox-success)', bg: 'var(--ox-success-surface)', dot: 'var(--ox-success)' },
        warning: { color: 'var(--ox-warning)', bg: 'var(--ox-warning-surface)', dot: 'var(--ox-warning)' },
        danger: { color: 'var(--ox-danger)', bg: 'var(--ox-danger-surface)', dot: 'var(--ox-danger)' },
        info: { color: 'var(--ox-info)', bg: 'var(--ox-info-surface)', dot: 'var(--ox-info)' },
        brand: { color: 'var(--ox-green-700)', bg: 'var(--ox-primary-subtle)', dot: 'var(--ox-primary)' },
        gold: { color: 'var(--ox-gold-600)', bg: 'rgba(201,153,46,0.14)', dot: 'var(--ox-gold-500)' },
    }[tone];
    return (
        <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 6, padding: '3px 9px', borderRadius: 'var(--ox-radius-full)',
            background: tones.bg, color: tones.color, fontFamily: 'var(--ox-font-sans)', fontSize: 'var(--ox-text-xs)',
            fontWeight: 'var(--ox-weight-semibold)', letterSpacing: 'var(--ox-tracking-snug)', lineHeight: 1.4, whiteSpace: 'nowrap', ...style,
        }}>
            {dot && <span style={{ width: 6, height: 6, borderRadius: '50%', background: tones.dot }} />}
            {children}
        </span>
    );
}
