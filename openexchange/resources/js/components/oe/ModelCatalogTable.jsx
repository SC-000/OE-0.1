import React from 'react';
import { GradeBadge } from './GradeBadge.jsx';

/**
 * Model catalog table — the routing catalogue: provider, context window,
 * per-1M input/output price, instrument grade and availability. tone-aware.
 */
const DEFAULT_ROWS = [
    { model: 'gpt-5.5', provider: 'OpenAI', ctx: '400K', in: '5.00', out: '30.00', grade: 'Z9', status: 'live' },
    { model: 'claude-opus-4-8', provider: 'Anthropic', ctx: '1M', in: '5.00', out: '25.00', grade: 'Z9', status: 'live' },
    { model: 'gemini-3.1-pro', provider: 'Google', ctx: '1M', in: '2.00', out: '12.00', grade: 'Z8', status: 'live' },
    { model: 'gemini-2.5-flash', provider: 'Google', ctx: '1M', in: '0.30', out: '2.50', grade: 'Y7', status: 'live' },
    { model: 'llama-4-maverick', provider: 'Meta', ctx: '1M', in: '0.15', out: '0.60', grade: 'X7', status: 'live' },
    { model: 'deepseek-v4-pro', provider: 'DeepSeek', ctx: '1M', in: '0.44', out: '0.87', grade: 'X7', status: 'live' },
    { model: 'grok-4.3', provider: 'xAI', ctx: '1M', in: '1.25', out: '2.50', grade: 'Y8', status: 'live' },
];

export function ModelCatalogTable({ rows = DEFAULT_ROWS, tone = 'light', style = {} }) {
    const dark = tone === 'dark';
    const surface = dark ? 'var(--ox-ink-800)' : 'var(--ox-surface)';
    const border = dark ? 'rgba(255,255,255,0.09)' : 'var(--ox-border)';
    const head = dark ? 'rgba(238,243,242,0.5)' : 'var(--ox-text-subtle)';
    const text = dark ? '#eef3f2' : 'var(--ox-text)';
    const muted = dark ? 'rgba(238,243,242,0.62)' : 'var(--ox-text-muted)';
    const cell = { padding: '13px 16px', fontFamily: 'var(--ox-font-mono)', fontSize: 13, fontVariantNumeric: 'tabular-nums' };
    const th = { padding: '11px 16px', fontFamily: 'var(--ox-font-sans)', fontSize: 11, fontWeight: 600, letterSpacing: '0.07em', textTransform: 'uppercase', color: head, textAlign: 'left' };
    return (
        <div style={{ borderRadius: 'var(--ox-radius-lg)', border: `1px solid ${border}`, background: surface, overflow: 'hidden', boxShadow: dark ? 'none' : 'var(--ox-shadow-sm)', ...style }}>
            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 620 }}>
                    <thead>
                        <tr style={{ borderBottom: `1px solid ${border}` }}>
                            <th style={th}>Model</th>
                            <th style={th}>Provider</th>
                            <th style={{ ...th, textAlign: 'right' }}>Context</th>
                            <th style={{ ...th, textAlign: 'right' }}>In /1M</th>
                            <th style={{ ...th, textAlign: 'right' }}>Out /1M</th>
                            <th style={th}>Grade</th>
                            <th style={{ ...th, textAlign: 'right' }}>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((r, i) => (
                            <tr key={r.model} style={{ borderBottom: i < rows.length - 1 ? `1px solid ${border}` : 'none' }}>
                                <td style={{ ...cell, color: text, fontWeight: 600 }}>{r.model}</td>
                                <td style={{ ...cell, color: muted, fontFamily: 'var(--ox-font-sans)' }}>{r.provider}</td>
                                <td style={{ ...cell, color: muted, textAlign: 'right' }}>{r.ctx}</td>
                                <td style={{ ...cell, color: text, textAlign: 'right' }}>${r.in}</td>
                                <td style={{ ...cell, color: text, textAlign: 'right' }}>${r.out}</td>
                                <td style={cell}><GradeBadge grade={r.grade} size="sm" /></td>
                                <td style={{ ...cell, textAlign: 'right' }}>
                                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontFamily: 'var(--ox-font-sans)', fontSize: 12, color: 'var(--ox-success)' }}>
                                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--ox-success)', boxShadow: '0 0 6px var(--ox-success)' }} />
                                        {r.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
