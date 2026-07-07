import React from 'react';
import { Icon } from './Icon.jsx';

/**
 * PipelineFlow — the request lifecycle as an exchange pipeline:
 * Guard → Route → RAG → Provider → Filter → Meter → Stream.
 * Node glow pulses travel left→right (staggered) to imply flow. tone-aware.
 */
const STEPS = [
    { key: 'guard', label: 'Guard', icon: 'lock', note: 'Auth · plan · quota' },
    { key: 'route', label: 'Route', icon: 'sliders', note: 'Best model' },
    { key: 'rag', label: 'RAG', icon: 'database', note: 'Retrieve · cite' },
    { key: 'provider', label: 'Provider', icon: 'cpu', note: 'Our keys' },
    { key: 'filter', label: 'Filter', icon: 'shield', note: 'Redact · policy' },
    { key: 'meter', label: 'Meter', icon: 'activity', note: 'Tokens · cost' },
    { key: 'stream', label: 'Stream', icon: 'zap', note: 'Back to you' },
];

export function PipelineFlow({ steps = STEPS, tone = 'dark', style = {} }) {
    const dark = tone === 'dark';
    const text = dark ? '#eef3f2' : 'var(--ox-text)';
    const note = dark ? 'rgba(238,243,242,0.55)' : 'var(--ox-text-subtle)';
    const nodeBg = dark ? 'var(--ox-ink-800)' : 'var(--ox-cream)';
    const nodeBorder = dark ? 'rgba(51,193,62,0.35)' : 'var(--ox-border-strong)';
    const conn = dark ? 'rgba(255,255,255,0.14)' : 'var(--ox-border-strong)';
    return (
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', gap: 4, ...style }}>
            {steps.map((s, i) => (
                <React.Fragment key={s.key}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, width: 88, flexShrink: 0 }}>
                        <div className="ox-pipe-node" style={{
                            width: 52, height: 52, borderRadius: 14, display: 'grid', placeItems: 'center',
                            background: nodeBg, border: `1px solid ${nodeBorder}`, color: 'var(--ox-green-500)',
                            animationDelay: `${i * 0.32}s`,
                        }}>
                            <Icon name={s.icon} size={22} color="var(--ox-green-500)" />
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontFamily: 'var(--ox-font-sans)', fontSize: 13, fontWeight: 700, color: text, letterSpacing: '-0.01em' }}>{s.label}</div>
                            <div style={{ fontFamily: 'var(--ox-font-mono)', fontSize: 10, color: note, marginTop: 2 }}>{s.note}</div>
                        </div>
                    </div>
                    {i < steps.length - 1 && (
                        <div style={{ flex: '1 1 12px', minWidth: 12, height: 52, display: 'flex', alignItems: 'center' }}>
                            <div style={{ width: '100%', height: 2, background: `linear-gradient(90deg, ${conn}, ${dark ? 'rgba(51,193,62,0.4)' : 'var(--ox-green-400)'}, ${conn})` }} />
                        </div>
                    )}
                </React.Fragment>
            ))}
        </div>
    );
}
