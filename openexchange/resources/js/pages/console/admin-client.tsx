import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import ConsoleLayout from '@/layouts/console-layout';
import { Card, Button, Icon, Badge } from '@/components/oe';

type Cat = { model: string; provider: string; in: number; out: number };
type Props = {
    client: { id: number; name: string; status: string; balance: string; balance_cents: number; usage_mtd: string; markup_bps: number; min_cents: number; topup_cents: number; auto_topup: boolean };
    catalog?: Cat[];
    accessKeys?: { id: number; name: string; frag: string; status: string; last_used: string }[];
    rates?: { id: number; provider: string; model: string; markup_bps: number }[];
    ledger?: { date: string; type: string; desc: string | null; amount: string; credit: boolean }[];
    projects?: { provider: string; project: string; label: string; status: string; usage: string }[];
    newKey?: { name: string; secret: string } | null;
};

export default function AdminClient({ client, catalog = [], accessKeys = [], rates = [], ledger = [], projects = [], newKey = null }: Props) {
    const [markup, setMarkup] = useState(client.markup_bps / 100);
    const [min, setMin] = useState(client.min_cents / 100);
    const [topup, setTopup] = useState(client.topup_cents / 100);
    const [auto, setAuto] = useState(client.auto_topup);
    const [status, setStatus] = useState(client.status);
    const [adj, setAdj] = useState<{ amount: string; dir: number; reason: string }>({ amount: '', dir: 1, reason: '' });
    const [keyName, setKeyName] = useState('');
    const [usage, setUsage] = useState<{ model: string; in: string; out: string }>({ model: '', in: '', out: '' });
    const [rate, setRate] = useState<{ model: string; pct: string }>({ model: '', pct: '' });
    const [confirmDel, setConfirmDel] = useState(false);

    const post = (url: string, data: Record<string, unknown>, opts: Record<string, unknown> = {}) => router.post(url, data, { preserveScroll: true, ...opts });
    const saveSettings = () => post('/console/admin/client', { client_id: client.id, default_markup_bps: Math.round(markup * 100), min_balance_cents: Math.round(min * 100), topup_amount_cents: Math.round(topup * 100), auto_topup: auto, status });
    const applyAdj = () => post('/console/admin/balance', { client_id: client.id, amount: Number(adj.amount) * adj.dir, reason: adj.reason }, { onSuccess: () => setAdj({ amount: '', dir: 1, reason: '' }) });
    const createKey = () => keyName && post('/console/admin/access-key', { client_id: client.id, name: keyName }, { onSuccess: () => setKeyName('') });
    const revokeKey = (id: number) => post('/console/admin/access-key/revoke', { access_key_id: id });
    const addUsage = () => post('/console/admin/usage', { client_id: client.id, model: usage.model, input_tokens: Number(usage.in || 0), output_tokens: Number(usage.out || 0) }, { onSuccess: () => setUsage({ model: '', in: '', out: '' }) });
    const setModelRate = () => { if (!rate.model) return; const cat = catalog.find((c) => c.model === rate.model); post('/console/admin/client-model-rate', { client_id: client.id, provider: cat?.provider ?? 'openai', model: rate.model, markup_bps: Math.round(Number(rate.pct || 0) * 100) }, { onSuccess: () => setRate({ model: '', pct: '' }) }); };
    const deleteRate = (id: number) => post('/console/admin/client-model-rate/delete', { id });
    const deleteClient = () => router.post('/console/admin/client/delete', { client_id: client.id }, { onSuccess: () => router.visit('/console/admin') });

    const uCat = catalog.find((c) => c.model === usage.model);
    const provCost = uCat ? (uCat.in * Number(usage.in || 0) / 1e6 + uCat.out * Number(usage.out || 0) / 1e6) : 0;
    const rOv = uCat && rates.find((r) => r.model === usage.model);
    const effMarkup = rOv ? rOv.markup_bps / 100 : markup;
    const billed = provCost * (1 + effMarkup / 100);

    return (
        <ConsoleLayout active="admin" title={client.name} subtitle="Balance, pricing, keys and usage">
            <Head title={`${client.name} — Admin`} />
            <div style={{ maxWidth: 1120, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
                <Link href="/console/admin" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--ox-text-muted)', textDecoration: 'none', fontSize: 13.5 }}>
                    <Icon name="chevron-right" size={15} color="var(--ox-text-muted)" style={{ transform: 'rotate(180deg)' }} />All clients
                </Link>

                <div className="oe-grid-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
                    <Tile label="Balance" value={client.balance} mono danger={client.balance_cents < 0} />
                    <Tile label="Usage · MTD" value={client.usage_mtd} mono />
                    <Tile label="Default markup" value={`+${(client.markup_bps / 100).toFixed(0)}%`} mono />
                    <Tile label="Status" node={<Badge tone={status === 'suspended' ? 'danger' : 'success'}>{status === 'suspended' ? 'Suspended' : 'Active'}</Badge>} />
                </div>

                {newKey && (
                    <Card padding="lg" style={{ border: '1.5px solid var(--ox-green-500)', background: 'var(--ox-primary-subtle)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                            <Icon name="check" size={18} color="var(--ox-green-700)" />
                            <span style={{ fontWeight: 700 }}>New gateway key — “{newKey.name}”</span>
                            <span style={{ marginLeft: 'auto' }}><Badge tone="warning">Shown once</Badge></span>
                        </div>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center', background: 'var(--ox-ink-900)', borderRadius: 10, padding: '12px 14px' }}>
                            <code style={{ flex: 1, fontFamily: 'var(--ox-font-mono)', fontSize: 13, color: '#eef3f2', wordBreak: 'break-all' }}>{newKey.secret}</code>
                            <Button size="sm" variant="secondary" onClick={() => navigator.clipboard?.writeText(newKey.secret)} leadingIcon={<Icon name="copy" size={14} />}>Copy</Button>
                        </div>
                    </Card>
                )}

                <div className="oe-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, alignItems: 'start' }}>
                    {/* LEFT */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                        <Card padding="lg">
                            <Title>Adjust balance</Title>
                            <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                                <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                                    <Seg active={adj.dir === 1} onClick={() => setAdj((a) => ({ ...a, dir: 1 }))}>Credit +</Seg>
                                    <Seg active={adj.dir === -1} onClick={() => setAdj((a) => ({ ...a, dir: -1 }))}>Debit −</Seg>
                                </div>
                                <input type="number" placeholder="0.00" value={adj.amount} onChange={(e) => setAdj((a) => ({ ...a, amount: e.target.value }))} style={inp} />
                            </div>
                            <input placeholder="Reason (optional)" value={adj.reason} onChange={(e) => setAdj((a) => ({ ...a, reason: e.target.value }))} style={{ ...inp, marginBottom: 10 }} />
                            <Button fullWidth variant="secondary" onClick={applyAdj} disabled={!adj.amount}>{adj.dir === 1 ? 'Credit' : 'Debit'} ${adj.amount || '0.00'}</Button>
                        </Card>

                        <Card padding="lg">
                            <Title>Add usage manually</Title>
                            <ModelPicker catalog={catalog} value={usage.model} onChange={(m) => setUsage((u) => ({ ...u, model: m }))} placeholder="Type a model — e.g. gpt-5.4" />
                            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                                <input type="number" placeholder="Input tokens" value={usage.in} onChange={(e) => setUsage((u) => ({ ...u, in: e.target.value }))} style={inp} />
                                <input type="number" placeholder="Output tokens" value={usage.out} onChange={(e) => setUsage((u) => ({ ...u, out: e.target.value }))} style={inp} />
                            </div>
                            {usage.model && (
                                <div style={{ fontSize: 12, color: 'var(--ox-text-subtle)', margin: '10px 0', lineHeight: 1.5 }}>
                                    {uCat ? <>Provider cost <span className="ox-mono" style={{ color: 'var(--ox-text-muted)' }}>${provCost.toFixed(4)}</span> → billed <span className="ox-mono" style={{ color: 'var(--ox-green-700)', fontWeight: 700 }}>${billed.toFixed(4)}</span> (+{effMarkup.toFixed(0)}%{rOv ? ' · model rate' : ''})</> : <span style={{ color: 'var(--ox-warning)' }}>Not in catalogue — nothing billed.</span>}
                                </div>
                            )}
                            <Button fullWidth variant="secondary" onClick={addUsage} disabled={!usage.model} style={{ marginTop: usage.model ? 0 : 10 }}>Add usage · debit ${billed.toFixed(2)}</Button>
                        </Card>

                        <Card padding="none">
                            <div style={cardHead}>Recent activity</div>
                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <tbody>
                                        {ledger.length === 0 && <tr><td style={{ ...td, color: 'var(--ox-text-subtle)' }}>No activity yet.</td></tr>}
                                        {ledger.map((e, i) => (
                                            <tr key={i}>
                                                <td style={{ ...td, fontFamily: 'var(--ox-font-mono)', color: 'var(--ox-text-subtle)', width: 96 }}>{e.date}</td>
                                                <td style={{ ...td, color: 'var(--ox-text)' }}>{label(e.type)}{e.desc ? <span style={{ color: 'var(--ox-text-subtle)' }}> · {e.desc}</span> : ''}</td>
                                                <td style={{ ...td, fontFamily: 'var(--ox-font-mono)', fontWeight: 600, textAlign: 'right', color: e.credit ? 'var(--ox-success)' : 'var(--ox-text)' }}>{e.amount}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </Card>
                    </div>

                    {/* RIGHT */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                        <Card padding="lg">
                            <Title>Billing settings</Title>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                <label style={lbl}>Default markup %<input type="number" style={inp} value={markup} onChange={(e) => setMarkup(Number(e.target.value))} /></label>
                                <label style={lbl}>Status<select style={inp} value={status} onChange={(e) => setStatus(e.target.value)}><option value="active">Active</option><option value="suspended">Suspended</option></select></label>
                                <label style={lbl}>Min balance $<input type="number" style={inp} value={min} onChange={(e) => setMin(Number(e.target.value))} /></label>
                                <label style={lbl}>Top-up $<input type="number" style={inp} value={topup} onChange={(e) => setTopup(Number(e.target.value))} /></label>
                            </div>
                            <label style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '12px 0', fontSize: 13, color: 'var(--ox-text)' }}>
                                <input type="checkbox" checked={auto} onChange={(e) => setAuto(e.target.checked)} /> Auto top-up enabled
                            </label>
                            <Button fullWidth onClick={saveSettings}>Save settings</Button>
                        </Card>

                        <Card padding="lg">
                            <Title>Per-model rates<span style={sub}>override the default for specific models</span></Title>
                            {rates.map((r) => (
                                <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, fontSize: 13 }}>
                                    <span className="ox-mono" style={{ color: 'var(--ox-text)' }}>{r.model}</span>
                                    <span style={{ color: 'var(--ox-green-700)', fontWeight: 700 }}>+{(r.markup_bps / 100).toFixed(0)}%</span>
                                    <button onClick={() => deleteRate(r.id)} style={{ marginLeft: 'auto', ...linkBtn, color: 'var(--ox-danger)' }}>Remove</button>
                                </div>
                            ))}
                            <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                                <div style={{ flex: 1 }}><ModelPicker catalog={catalog} value={rate.model} onChange={(m) => setRate((r) => ({ ...r, model: m }))} placeholder="Type a model…" /></div>
                                <input type="number" placeholder="Markup %" value={rate.pct} onChange={(e) => setRate((r) => ({ ...r, pct: e.target.value }))} style={{ ...inp, width: 110, flexShrink: 0 }} />
                                <Button variant="secondary" onClick={setModelRate} disabled={!rate.model} style={{ flexShrink: 0 }}>Set</Button>
                            </div>
                        </Card>

                        <Card padding="lg">
                            <Title>Gateway keys</Title>
                            {accessKeys.map((k) => (
                                <div key={k.id} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, fontSize: 12.5 }}>
                                    <span className="ox-mono" style={{ color: 'var(--ox-text-muted)' }}>{k.frag}</span>
                                    <span style={{ color: 'var(--ox-text-subtle)' }}>{k.name}</span>
                                    {k.status === 'revoked' ? <Badge tone="neutral">Revoked</Badge> : <button onClick={() => revokeKey(k.id)} style={{ marginLeft: 'auto', ...linkBtn, color: 'var(--ox-danger)' }}>Revoke</button>}
                                </div>
                            ))}
                            <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                                <input placeholder="New key name (e.g. Production app)" value={keyName} onChange={(e) => setKeyName(e.target.value)} style={inp} />
                                <Button variant="secondary" onClick={createKey} disabled={!keyName} style={{ flexShrink: 0 }}>Create</Button>
                            </div>
                        </Card>

                        {projects.length > 0 && (
                            <Card padding="none">
                                <div style={cardHead}>Assigned projects</div>
                                {projects.map((p, i) => (
                                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', borderBottom: i < projects.length - 1 ? '1px solid var(--ox-divider)' : 'none', fontSize: 13 }}>
                                        <Badge tone={p.status === 'active' ? 'success' : 'neutral'} dot={false}>{p.provider}</Badge>
                                        <span className="ox-mono" style={{ color: 'var(--ox-text-subtle)', fontSize: 12 }}>{p.project}</span>
                                        <span style={{ color: 'var(--ox-text)' }}>{p.label}</span>
                                        <span style={{ marginLeft: 'auto', fontFamily: 'var(--ox-font-mono)', color: 'var(--ox-text)', fontWeight: 600 }}>{p.usage}</span>
                                    </div>
                                ))}
                            </Card>
                        )}

                        <Card padding="lg" style={{ border: '1px solid var(--ox-danger)' }}>
                            {!confirmDel ? (
                                <button onClick={() => setConfirmDel(true)} style={{ ...linkBtn, color: 'var(--ox-danger)', fontSize: 13.5 }}>Delete this client…</button>
                            ) : (
                                <>
                                    <div style={{ fontSize: 13.5, color: 'var(--ox-danger)', fontWeight: 700, marginBottom: 6 }}>Permanently delete {client.name}?</div>
                                    <div style={{ fontSize: 12.5, color: 'var(--ox-text-muted)', marginBottom: 12, lineHeight: 1.5 }}>Removes the client, its users, assigned projects, usage records and balance history. Cannot be undone.</div>
                                    <div style={{ display: 'flex', gap: 8 }}>
                                        <Button variant="ghost" size="sm" onClick={() => setConfirmDel(false)}>Cancel</Button>
                                        <Button size="sm" onClick={deleteClient} style={{ background: 'var(--ox-danger)', color: '#fff' }}>Yes, delete</Button>
                                    </div>
                                </>
                            )}
                        </Card>
                    </div>
                </div>
            </div>
        </ConsoleLayout>
    );
}

/** Type-to-search model picker — filters the catalogue as you type. */
function ModelPicker({ catalog, value, onChange, placeholder }: { catalog: Cat[]; value: string; onChange: (m: string) => void; placeholder?: string }) {
    const [q, setQ] = useState(value);
    const [open, setOpen] = useState(false);
    const matches = q ? catalog.filter((c) => c.model.toLowerCase().includes(q.toLowerCase()) || c.provider.toLowerCase().includes(q.toLowerCase())).slice(0, 8) : [];
    return (
        <div style={{ position: 'relative' }}>
            <input value={q} placeholder={placeholder} onChange={(e) => { setQ(e.target.value); onChange(e.target.value); setOpen(true); }} onFocus={() => setOpen(true)} onBlur={() => setTimeout(() => setOpen(false), 150)} style={{ ...inp, fontFamily: 'var(--ox-font-mono)' }} />
            {open && matches.length > 0 && (
                <div style={{ position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0, zIndex: 30, background: 'var(--ox-surface)', border: '1px solid var(--ox-border-strong)', borderRadius: 'var(--ox-radius-md)', boxShadow: 'var(--ox-shadow-lg)', maxHeight: 240, overflowY: 'auto', padding: 4 }}>
                    {matches.map((c) => (
                        <button key={c.provider + c.model} onMouseDown={() => { setQ(c.model); onChange(c.model); setOpen(false); }} style={{ display: 'flex', width: '100%', alignItems: 'center', gap: 8, textAlign: 'left', padding: '8px 10px', border: 'none', background: 'transparent', cursor: 'pointer', borderRadius: 8 }}>
                            <span style={{ fontFamily: 'var(--ox-font-mono)', fontSize: 13, color: 'var(--ox-text)', fontWeight: 600 }}>{c.model}</span>
                            <span style={{ marginLeft: 'auto', fontFamily: 'var(--ox-font-mono)', fontSize: 11.5, color: 'var(--ox-text-subtle)' }}>{c.provider} · ${c.in}/${c.out}</span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

function Tile({ label, value, node, mono, danger }: { label: string; value?: string; node?: React.ReactNode; mono?: boolean; danger?: boolean }) {
    return (
        <Card padding="md">
            <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--ox-text-subtle)' }}>{label}</div>
            <div style={{ marginTop: 8, fontSize: 24, fontWeight: 600, fontFamily: mono ? 'var(--ox-font-mono)' : 'var(--ox-font-sans)', color: danger ? 'var(--ox-danger)' : 'var(--ox-text)', letterSpacing: '-0.01em' }}>{node ?? value}</div>
        </Card>
    );
}
function Title({ children }: { children: React.ReactNode }) {
    return <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 14, display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' }}>{children}</div>;
}
function Seg({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
    return <button onClick={onClick} style={{ padding: '0 14px', height: 42, borderRadius: 'var(--ox-radius-md)', cursor: 'pointer', fontSize: 13.5, fontWeight: 600, whiteSpace: 'nowrap', border: `1px solid ${active ? 'var(--ox-green-500)' : 'var(--ox-border-strong)'}`, background: active ? 'var(--ox-primary-subtle)' : 'var(--ox-surface)', color: active ? 'var(--ox-green-700)' : 'var(--ox-text-muted)' }}>{children}</button>;
}
function label(t: string) {
    return t === 'topup_credit' ? 'Top-up' : t === 'usage_debit' ? 'Usage' : t === 'adjustment' ? 'Adjustment' : t === 'refund' ? 'Refund' : t;
}

const inp: React.CSSProperties = { width: '100%', height: 42, padding: '0 12px', borderRadius: 'var(--ox-radius-md)', border: '1px solid var(--ox-border-strong)', background: 'var(--ox-bg-subtle)', fontFamily: 'var(--ox-font-sans)', fontSize: 14, color: 'var(--ox-text)', outline: 'none' };
const lbl: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: 5, fontSize: 12, fontWeight: 600, color: 'var(--ox-text-muted)' };
const sub: React.CSSProperties = { fontSize: 12, fontWeight: 400, color: 'var(--ox-text-subtle)' };
const cardHead: React.CSSProperties = { padding: '16px 20px', borderBottom: '1px solid var(--ox-divider)', fontSize: 'var(--ox-text-lg)', fontWeight: 600 };
const td: React.CSSProperties = { padding: '11px 20px', borderBottom: '1px solid var(--ox-divider)', fontSize: 'var(--ox-text-sm)', color: 'var(--ox-text-muted)' };
const linkBtn: React.CSSProperties = { background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, fontFamily: 'var(--ox-font-sans)', padding: 0 };
