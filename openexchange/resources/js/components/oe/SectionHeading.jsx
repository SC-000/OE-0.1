import React from 'react';

/** Marketing section header: eyebrow + title + optional subtitle + actions. */
export function SectionHeading({ eyebrow, title, subtitle, align = 'left', tone = 'light', actions = null, style = {} }) {
    const titleColor = tone === 'dark' ? '#f3f7f6' : 'var(--ox-text)';
    const subColor = tone === 'dark' ? 'rgba(238,243,242,0.72)' : 'var(--ox-text-muted)';
    const center = align === 'center';
    return (
        <div style={{
            display: 'flex', flexDirection: 'column', gap: 14, alignItems: center ? 'center' : 'flex-start',
            textAlign: center ? 'center' : 'left', maxWidth: center ? 760 : 720, marginInline: center ? 'auto' : 0, ...style,
        }}>
            {eyebrow && <span className="ox-eyebrow" style={tone === 'dark' ? { color: 'var(--ox-green-400)' } : undefined}>{eyebrow}</span>}
            <h2 style={{
                margin: 0, fontFamily: 'var(--ox-font-sans)', fontWeight: 800, color: titleColor,
                fontSize: 'clamp(1.6rem, 3.2vw, var(--ox-text-3xl))', lineHeight: 1.12, letterSpacing: '-0.02em',
            }}>{title}</h2>
            {subtitle && <p style={{
                margin: 0, fontFamily: 'var(--ox-font-sans)', fontSize: 'var(--ox-text-md)',
                lineHeight: 1.6, color: subColor, maxWidth: 620,
            }}>{subtitle}</p>}
            {actions && <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 6 }}>{actions}</div>}
        </div>
    );
}
