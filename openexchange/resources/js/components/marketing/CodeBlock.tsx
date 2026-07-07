import { ReactNode } from 'react';

/** Ink code panel with a filename header. Presentational. */
export function CodeBlock({ filename = 'request', lang = 'bash', children, style = {} }: { filename?: string; lang?: string; children: ReactNode; style?: React.CSSProperties }) {
    return (
        <div style={{ borderRadius: 'var(--ox-radius-lg)', border: '1px solid rgba(255,255,255,0.1)', background: 'var(--ox-ink-950)', overflow: 'hidden', boxShadow: 'var(--ox-shadow-lg)', ...style }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 14px', borderBottom: '1px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.02)' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ display: 'flex', gap: 5 }}>
                        {['#e0d5bf', '#48ca5b', '#415a5f'].map((c) => <span key={c} style={{ width: 9, height: 9, borderRadius: '50%', background: c }} />)}
                    </span>
                    <span style={{ fontFamily: 'var(--ox-font-mono)', fontSize: 12, color: 'rgba(238,243,242,0.55)', marginLeft: 6 }}>{filename}</span>
                </span>
                <span style={{ fontFamily: 'var(--ox-font-mono)', fontSize: 11, color: 'rgba(238,243,242,0.4)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{lang}</span>
            </div>
            <pre style={{ margin: 0, padding: '16px 18px', overflowX: 'auto', fontFamily: 'var(--ox-font-mono)', fontSize: 13, lineHeight: 1.7, color: '#d7e0dd' }}>
                <code>{children}</code>
            </pre>
        </div>
    );
}
