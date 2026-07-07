import React from 'react';

/** Compact metadata tag / chip. Mono variant for model ids, versions, key fragments. */
export function Tag({ children, mono = false, onRemove, style = {} }) {
    return (
        <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 6, padding: '3px 8px', borderRadius: 'var(--ox-radius-sm)',
            background: 'var(--ox-bg-subtle)', border: '1px solid var(--ox-border)', color: 'var(--ox-text-muted)',
            fontFamily: mono ? 'var(--ox-font-mono)' : 'var(--ox-font-sans)', fontSize: 'var(--ox-text-xs)',
            fontWeight: 500, lineHeight: 1.4, whiteSpace: 'nowrap', ...style,
        }}>
            {children}
            {onRemove && (
                <button type="button" onClick={onRemove} aria-label="Remove" style={{
                    display: 'inline-flex', border: 'none', background: 'transparent', padding: 0, cursor: 'pointer', color: 'var(--ox-text-subtle)',
                }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
                        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                </button>
            )}
        </span>
    );
}
