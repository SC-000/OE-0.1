import React from 'react';

/** Surface container. `padding` in token steps; `interactive` adds hover lift. */
export function Card({ children, padding = 'md', interactive = false, style = {}, ...rest }) {
    const pad = { none: 0, sm: 'var(--ox-space-4)', md: 'var(--ox-space-6)', lg: 'var(--ox-space-8)' }[padding];
    return (
        <div
            className={interactive ? 'ox-card ox-card--interactive' : 'ox-card'}
            style={{
                background: 'var(--ox-surface)', border: '1px solid var(--ox-border)',
                borderRadius: 'var(--ox-radius-lg)', boxShadow: 'var(--ox-shadow-sm)', padding: pad,
                transition: 'box-shadow var(--ox-dur-base) var(--ox-ease), transform var(--ox-dur-base) var(--ox-ease), border-color var(--ox-dur-base) var(--ox-ease)',
                ...style,
            }}
            {...rest}
        >
            {children}
        </div>
    );
}
