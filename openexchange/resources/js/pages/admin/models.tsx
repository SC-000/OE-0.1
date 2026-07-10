import { useMemo, useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import AdminLayout from '@/layouts/admin-layout';
import { Card, Badge, Button, Icon } from '@/components/oe';
import { money, tokens, usdPerM } from '@/lib/format';

type Cat = {
    id: number; provider: string; provider_label: string; model: string;
    alias: string | null; client_label: string; tier: string | null;
    in: number; out: number; active: boolean; client_visible: boolean;
    price_source: string; feed_in: number | null; feed_out: number | null; feed_synced_at: string | null;
    priced: boolean; first_seen: string | null; rate: string | null;
    revenue_cents: number; cost_cents: number; margin_cents: number; markup_pct: number | null;
    tokens: number; requests: number;
};
type Proposal = {
    id: number; provider: string; model: string;
    current_in: number; current_out: number; proposed_in: number; proposed_out: number;
    delta_pct: number; source: string; at: string; impact: 'cost_up' | 'cost_down';
};
type Props = { catalog: Cat[]; proposals: Proposal[]; tiers: string[]; providers: string[]; lastSync: string | null; feedSource: string };

const th: React.CSSProperties = { textAlign: 'left', padding: '9px 10px', fontSize: 11, fontWeight: 600, color: 'var(--ox-text-subtle)', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid var(--ox-border)', whiteSpace: 'nowrap' };
const td: React.CSSProperties = { padding: '9px 10px', fontSize: 'var(--ox-text-sm)', borderBottom: '1px solid var(--ox-border)' };
const mono: React.CSSProperties = { fontFamily: 'var(--ox-font-mono)' };
const input: React.CSSProperties = { width: '100%', height: 32, padding: '0 8px', borderRadius: 'var(--ox-radius-sm)', border: '1px solid var(--ox-border)', background: 'var(--ox-surface)', color: 'var(--ox-text)', fontSize: 12.5, fontFamily: 'var(--ox-font-mono)' };

export default function Models({ catalog, proposals, tiers, lastSync, feedSource }: Props) {
    const [tab, setTab] = useState<'catalog' | 'presentation'>('catalog');
    const [q, setQ] = useState('');
    const [onlyUnpriced, setOnlyUnpriced] = useState(false);
    const [edits, setEdits] = useState<Record<number, { in?: string; out?: string; active?: boolean }>>({});
    const [pres, setPres] = useState<Record<number, { alias?: string; tier?: string; visible?: boolean }>>({});
    const [adding, setAdding] = useState(false);
    const addForm = useForm({ provider: 'openai', model: '', input: '', output: '' });

    const rows = useMemo(() => {
        const s = q.trim().toLowerCase();
        return catalog.filter((m) => {
            if (onlyUnpriced && m.priced) return false;
            if (!s) return true;
            return m.model.toLowerCase().includes(s) || (m.alias ?? '').toLowerCase().includes(s) || m.provider.includes(s);
        });
    }, [catalog, q, onlyUnpriced]);

    const unpriced = catalog.filter((m) => !m.priced).length;

    const pv = (m: Cat, f: 'in' | 'out') => edits[m.id]?.[f] ?? String(m[f]);
    const pActive = (m: Cat) => edits[m.id]?.active ?? m.active;
    const dirty = (m: Cat) => edits[m.id] !== undefined;
    const setP = (id: number, f: 'in' | 'out' | 'active', v: string | boolean) => setEdits((e) => ({ ...e, [id]: { ...e[id], [f]: v } }));
    const savePrice = (m: Cat) =>
        router.patch(`/admin/models/${m.id}`, { input: Number(pv(m, 'in')), output: Number(pv(m, 'out')), active: pActive(m) }, {
            preserveScroll: true, preserveState: true,
            onSuccess: () => setEdits((e) => { const n = { ...e }; delete n[m.id]; return n; }),
        });

    const rv = (m: Cat, f: 'alias' | 'tier') => pres[m.id]?.[f] ?? (f === 'alias' ? (m.alias ?? '') : (m.tier ?? ''));
    const rVisible = (m: Cat) => pres[m.id]?.visible ?? m.client_visible;
    const rDirty = (m: Cat) => pres[m.id] !== undefined;
    const setR = (id: number, f: 'alias' | 'tier' | 'visible', v: string | boolean) => setPres((e) => ({ ...e, [id]: { ...e[id], [f]: v } }));
    const savePres = (m: Cat) =>
        router.patch(`/admin/models/${m.id}/presentation`, {
            display_alias: rv(m, 'alias') || null, tier: rv(m, 'tier') || null, client_visible: rVisible(m),
        }, { preserveScroll: true, preserveState: true, onSuccess: () => setPres((e) => { const n = { ...e }; delete n[m.id]; return n; }) });

    return (
        <AdminLayout
            active="models"
            title="Models & pricing"
            subtitle={`${catalog.length} models · cost basis from ${feedSource}${lastSync ? ` · synced ${new Date(lastSync).toLocaleDateString()}` : ''}`}
            actions={<>
                <Button size="sm" variant="secondary" leadingIcon={<Icon name="plus" size={15} />} onClick={() => setAdding((v) => !v)}>Add model</Button>
                <Button size="sm" leadingIcon={<Icon name="refresh-cw" size={15} />} onClick={() => router.post('/admin/models/sync', {}, { preserveScroll: true })}>Sync now</Button>
            </>}
        >
            <Head title="Admin — Models & pricing" />

            {/* Review queue — a price change never applies on its own */}
            {proposals.length > 0 && (
                <Card padding="lg" style={{ marginBottom: 20, borderLeft: '3px solid var(--ox-gold-500)' }}>
                    <div style={{ marginBottom: 10 }}>
                        <h2 style={{ margin: 0, fontSize: 'var(--ox-text-md)', fontWeight: 700 }}>
                            {proposals.length} price change{proposals.length > 1 ? 's' : ''} to review
                        </h2>
                        <p style={{ margin: '2px 0 0', fontSize: 'var(--ox-text-xs)', color: 'var(--ox-text-subtle)' }}>
                            The feed says your cost basis moved. Nothing bills differently until you accept.
                            A cost rise with a markup rate card eats your margin silently.
                        </p>
                    </div>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead><tr>
                            <th style={th}>Model</th><th style={th}>Current cost</th><th style={th}>Feed says</th>
                            <th style={th}>Change</th><th style={{ ...th, textAlign: 'right' }}>Decide</th>
                        </tr></thead>
                        <tbody>
                            {proposals.map((p) => (
                                <tr key={p.id}>
                                    <td style={{ ...td, ...mono, fontSize: 12.5 }}>{p.model}<div style={{ fontSize: 11, color: 'var(--ox-text-subtle)', fontFamily: 'var(--ox-font-sans)' }}>{p.provider} · {p.at}</div></td>
                                    <td style={{ ...td, ...mono }}>{usdPerM(p.current_in)} / {usdPerM(p.current_out)}</td>
                                    <td style={{ ...td, ...mono, fontWeight: 600 }}>{usdPerM(p.proposed_in)} / {usdPerM(p.proposed_out)}</td>
                                    <td style={td}>
                                        <Badge tone={p.impact === 'cost_up' ? 'danger' : 'success'}>
                                            {p.delta_pct > 0 ? '+' : ''}{p.delta_pct}% cost
                                        </Badge>
                                        <div style={{ fontSize: 10.5, color: 'var(--ox-text-subtle)', marginTop: 3 }}>
                                            {p.impact === 'cost_up' ? 'eats your margin' : 'widens your margin'}
                                        </div>
                                    </td>
                                    <td style={{ ...td, textAlign: 'right', whiteSpace: 'nowrap' }}>
                                        <Button size="sm" onClick={() => router.post(`/admin/proposals/${p.id}/accept`, {}, { preserveScroll: true })}>Accept</Button>
                                        <Button size="sm" variant="ghost" style={{ marginLeft: 6 }} onClick={() => router.post(`/admin/proposals/${p.id}/reject`, {}, { preserveScroll: true })}>Keep mine</Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </Card>
            )}

            {adding && (
                <Card padding="lg" style={{ marginBottom: 18 }}>
                    <h2 style={{ margin: '0 0 12px', fontSize: 'var(--ox-text-md)', fontWeight: 700 }}>Add / re-price a model</h2>
                    <form
                        onSubmit={(e) => { e.preventDefault(); addForm.post('/admin/models', { preserveScroll: true, onSuccess: () => { addForm.reset(); setAdding(false); } }); }}
                        style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, alignItems: 'end' }}
                    >
                        <label><Lbl>Provider</Lbl>
                            <select style={{ ...input, fontFamily: 'var(--ox-font-sans)' }} value={addForm.data.provider} onChange={(e) => addForm.setData('provider', e.target.value)}>
                                <option value="openai">OpenAI</option><option value="google">Google</option>
                            </select>
                        </label>
                        <label><Lbl>Model id</Lbl><input style={input} value={addForm.data.model} onChange={(e) => addForm.setData('model', e.target.value)} placeholder="gpt-5.4" /></label>
                        <label><Lbl>Input $/1M</Lbl><input style={input} value={addForm.data.input} onChange={(e) => addForm.setData('input', e.target.value)} placeholder="2.50" /></label>
                        <label><Lbl>Output $/1M</Lbl><input style={input} value={addForm.data.output} onChange={(e) => addForm.setData('output', e.target.value)} placeholder="10.00" /></label>
                        <div style={{ display: 'flex', gap: 8 }}>
                            <Button type="submit" size="sm" disabled={addForm.processing}>Save</Button>
                            <Button type="button" size="sm" variant="ghost" onClick={() => setAdding(false)}>Cancel</Button>
                        </div>
                    </form>
                </Card>
            )}

            <div style={{ display: 'flex', gap: 4, marginBottom: 14 }}>
                {([['catalog', 'Cost basis & margin'], ['presentation', 'What clients see']] as const).map(([id, label]) => (
                    <button key={id} onClick={() => setTab(id)} style={{
                        padding: '7px 14px', borderRadius: 'var(--ox-radius-full)', cursor: 'pointer', fontSize: 'var(--ox-text-sm)', fontWeight: 600,
                        border: '1px solid ' + (tab === id ? 'transparent' : 'var(--ox-border)'),
                        background: tab === id ? 'var(--ox-primary-subtle)' : 'transparent',
                        color: tab === id ? 'var(--ox-green-700)' : 'var(--ox-text-muted)',
                    }}>{label}</button>
                ))}
            </div>

            <Card padding="none" style={{ overflow: 'hidden' }}>
                <div style={{ padding: '11px 14px', borderBottom: '1px solid var(--ox-border)', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                    <Icon name="search" size={15} color="var(--ox-text-subtle)" />
                    <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search models…"
                        style={{ flex: 1, minWidth: 140, border: 'none', outline: 'none', background: 'transparent', fontSize: 'var(--ox-text-sm)', color: 'var(--ox-text)' }} />
                    {unpriced > 0 && (
                        <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12.5, color: 'var(--ox-text-muted)', cursor: 'pointer' }}>
                            <input type="checkbox" checked={onlyUnpriced} onChange={(e) => setOnlyUnpriced(e.target.checked)} />
                            Only unpriced ({unpriced})
                        </label>
                    )}
                    {tab === 'presentation' && (
                        <Button size="sm" variant="ghost" onClick={() => router.post('/admin/models/retier', {}, { preserveScroll: true })}>Re-tier from prices</Button>
                    )}
                </div>

                <div style={{ overflowX: 'auto' }}>
                    {tab === 'catalog' ? (
                        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 980 }}>
                            <thead><tr>
                                <th style={th}>Model</th><th style={th}>Cost in $/1M</th><th style={th}>Cost out $/1M</th>
                                <th style={th}>Source</th><th style={{ ...th, textAlign: 'right' }}>Revenue MTD</th>
                                <th style={{ ...th, textAlign: 'right' }}>Margin</th><th style={{ ...th, textAlign: 'right' }}>Tokens</th>
                                <th style={th}>Live</th><th style={{ ...th, textAlign: 'right' }}></th>
                            </tr></thead>
                            <tbody>
                                {rows.map((m) => {
                                    const drift = m.feed_in !== null && (Math.abs(m.feed_in - m.in) > 1e-6 || Math.abs((m.feed_out ?? 0) - m.out) > 1e-6);
                                    return (
                                        <tr key={m.id} style={!m.priced ? { background: 'var(--ox-danger-surface)' } : undefined}>
                                            <td style={td}>
                                                <div style={{ ...mono, fontSize: 12.5 }}>{m.model}</div>
                                                <div style={{ fontSize: 11, color: 'var(--ox-text-subtle)' }}>
                                                    {m.provider_label}{m.first_seen ? ` · seen ${m.first_seen}` : ''}
                                                </div>
                                            </td>
                                            <td style={{ ...td, width: 110 }}><input style={input} value={pv(m, 'in')} onChange={(e) => setP(m.id, 'in', e.target.value)} /></td>
                                            <td style={{ ...td, width: 110 }}><input style={input} value={pv(m, 'out')} onChange={(e) => setP(m.id, 'out', e.target.value)} /></td>
                                            <td style={td}>
                                                {!m.priced ? <Badge tone="danger">Unpriced</Badge>
                                                    : m.price_source === 'manual' ? <Badge tone="info">Manual</Badge>
                                                    : <Badge tone="neutral">{m.price_source}</Badge>}
                                                {drift && <div style={{ fontSize: 10.5, color: 'var(--ox-warning)', marginTop: 3 }}>feed: {usdPerM(m.feed_in!)}/{usdPerM(m.feed_out!)}</div>}
                                            </td>
                                            <td style={{ ...td, textAlign: 'right', ...mono }}>{m.revenue_cents ? money(m.revenue_cents) : '—'}</td>
                                            <td style={{ ...td, textAlign: 'right', ...mono, color: m.margin_cents < 0 ? 'var(--ox-danger)' : m.margin_cents > 0 ? 'var(--ox-success)' : 'var(--ox-text-subtle)' }}>
                                                {m.revenue_cents || m.cost_cents ? money(m.margin_cents) : '—'}
                                                {m.markup_pct !== null && <div style={{ fontSize: 10.5, color: 'var(--ox-text-subtle)' }}>{m.markup_pct}%</div>}
                                            </td>
                                            <td style={{ ...td, textAlign: 'right', ...mono, color: 'var(--ox-text-subtle)' }}>{m.tokens ? tokens(m.tokens) : '—'}</td>
                                            <td style={td}>
                                                <input type="checkbox" checked={pActive(m)} onChange={(e) => setP(m.id, 'active', e.target.checked)} />
                                            </td>
                                            <td style={{ ...td, textAlign: 'right' }}>
                                                {dirty(m) && <Button size="sm" onClick={() => savePrice(m)}>Save</Button>}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    ) : (
                        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 900 }}>
                            <thead><tr>
                                <th style={th}>Real model</th><th style={th}>Tier</th><th style={th}>Alias shown to clients</th>
                                <th style={th}>Client sees</th><th style={th}>Visible</th><th style={{ ...th, textAlign: 'right' }}></th>
                            </tr></thead>
                            <tbody>
                                {rows.map((m) => {
                                    const previewAlias = rv(m, 'alias');
                                    const previewTier = rv(m, 'tier') || 'standard';
                                    const preview = previewAlias || `${m.provider_label} ${previewTier[0].toUpperCase()}${previewTier.slice(1)}`;
                                    return (
                                        <tr key={m.id}>
                                            <td style={{ ...td, ...mono, fontSize: 12.5 }}>{m.model}</td>
                                            <td style={{ ...td, width: 130 }}>
                                                <select style={{ ...input, fontFamily: 'var(--ox-font-sans)' }} value={rv(m, 'tier')} onChange={(e) => setR(m.id, 'tier', e.target.value)}>
                                                    <option value="">— none —</option>
                                                    {tiers.map((t) => <option key={t} value={t}>{t}</option>)}
                                                </select>
                                            </td>
                                            <td style={{ ...td, width: 190 }}>
                                                <input style={{ ...input, fontFamily: 'var(--ox-font-sans)' }} placeholder="(use tier label)"
                                                    value={previewAlias} onChange={(e) => setR(m.id, 'alias', e.target.value)} />
                                            </td>
                                            <td style={td}><Badge tone="brand" dot={false}>{preview}</Badge></td>
                                            <td style={td}>
                                                <input type="checkbox" checked={rVisible(m)} onChange={(e) => setR(m.id, 'visible', e.target.checked)} />
                                            </td>
                                            <td style={{ ...td, textAlign: 'right' }}>{rDirty(m) && <Button size="sm" onClick={() => savePres(m)}>Save</Button>}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </div>
            </Card>

            <p style={{ marginTop: 12, fontSize: 'var(--ox-text-xs)', color: 'var(--ox-text-subtle)', maxWidth: 760 }}>
                The catalogue stores your <strong>provider cost basis</strong> — what a model costs you. What you charge lives on
                the rate card, per client. Editing a price here marks it <em>manual</em>, and the feed will never overwrite it;
                it will only tell you when it drifts.
            </p>
        </AdminLayout>
    );
}

const Lbl = ({ children }: { children: React.ReactNode }) => (
    <span style={{ display: 'block', fontSize: 11.5, fontWeight: 600, color: 'var(--ox-text-subtle)', marginBottom: 5 }}>{children}</span>
);
