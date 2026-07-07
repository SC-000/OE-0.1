import React from 'react';
import { GradeBadge } from './GradeBadge.jsx';

/**
 * Grade-Rates board — the exchange view of graded AI "instruments". Each row is
 * an Instrument (Class + Grade) with a live Grade Rate, 24h change and Lot size.
 * tone-aware; renders on ink or beige.
 */
const DEFAULT_ROWS = [
    { instrument: 'LANG·Z', klass: 'Language', grade: 'Z5', rate: '12.40', chg: '+2.1%', dir: 'up', lot: '1M' },
    { instrument: 'RSN·AA', klass: 'Reasoning', grade: 'AA10', rate: '58.90', chg: '-4.3%', dir: 'down', lot: '1M' },
    { instrument: 'VIS·Y', klass: 'Vision', grade: 'Y7', rate: '19.75', chg: '+0.6%', dir: 'up', lot: '1M' },
    { instrument: 'GEN·X', klass: 'Generation', grade: 'X6', rate: '8.10', chg: '-1.2%', dir: 'down', lot: '1M' },
    { instrument: 'CODE·Z', klass: 'Language', grade: 'Z8', rate: '22.30', chg: '+3.8%', dir: 'up', lot: '1M' },
    { instrument: 'AUD·W', klass: 'Audio', grade: 'W5', rate: '6.45', chg: '+0.0%', dir: 'flat', lot: '1M' },
];

export function GradeRatesBoard({ rows = DEFAULT_ROWS, tone = 'light', style = {} }) {
    const dark = tone === 'dark';
    const surface = dark ? 'var(--ox-ink-800)' : 'var(--ox-surface)';
    const border = dark ? 'rgba(255,255,255,0.09)' : 'var(--ox-border)';
    const head = dark ? 'rgba(238,243,242,0.5)' : 'var(--ox-text-subtle)';
    const text = dark ? '#eef3f2' : 'var(--ox-text)';
    const muted = dark ? 'rgba(238,243,242,0.62)' : 'var(--ox-text-muted)';
    const dirColor = (d) => (d === 'up' ? 'var(--ox-success)' : d === 'down' ? 'var(--ox-danger)' : muted);
    const cell = { padding: '13px 16px', fontFamily: 'var(--ox-font-mono)', fontSize: 13, fontVariantNumeric: 'tabular-nums' };
    const th = { padding: '11px 16px', fontFamily: 'var(--ox-font-sans)', fontSize: 11, fontWeight: 600, letterSpacing: '0.07em', textTransform: 'uppercase', color: head, textAlign: 'left' };
    return (
        <div style={{ borderRadius: 'var(--ox-radius-lg)', border: `1px solid ${border}`, background: surface, overflow: 'hidden', boxShadow: dark ? 'none' : 'var(--ox-shadow-sm)', ...style }}>
            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 560 }}>
                    <thead>
                        <tr style={{ borderBottom: `1px solid ${border}` }}>
                            <th style={th}>Instrument</th>
                            <th style={th}>Class</th>
                            <th style={th}>Grade</th>
                            <th style={{ ...th, textAlign: 'right' }}>Grade rate</th>
                            <th style={{ ...th, textAlign: 'right' }}>24h</th>
                            <th style={{ ...th, textAlign: 'right' }}>Lot</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((r, i) => (
                            <tr key={r.instrument} style={{ borderBottom: i < rows.length - 1 ? `1px solid ${border}` : 'none' }}>
                                <td style={{ ...cell, color: text, fontWeight: 600 }}>{r.instrument}</td>
                                <td style={{ ...cell, color: muted, fontFamily: 'var(--ox-font-sans)' }}>{r.klass}</td>
                                <td style={cell}><GradeBadge grade={r.grade} size="sm" /></td>
                                <td style={{ ...cell, color: text, textAlign: 'right' }}>${r.rate}</td>
                                <td style={{ ...cell, color: dirColor(r.dir), textAlign: 'right', fontWeight: 600 }}>{r.chg}</td>
                                <td style={{ ...cell, color: muted, textAlign: 'right' }}>{r.lot}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
