import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import ConsoleLayout from '@/layouts/console-layout';
import { Card, Button, Icon, Badge, Tag, StatCard } from '@/components/oe';

type Client = { id: number; client: string; balance: string; balance_cents: number; usage: string; markup: string; markup_bps: number; min_cents: number; topup_cents: number; auto_topup: boolean; account_status: string; status: string };
type Key = { provider: string; frag: string; client: string; usage: string; sync: string };
type RateModel = { model: string; provider: string; cost: number };
type Props = {
    stats?: { clients: number; keys: number; metered: string; margin: string };
    clients?: Client[];
    keys?: Key[];
    rateModels?: RateModel[];
    markupBps?: number;
    clientOptions?: { id: number; name: string }[];
    backends?: { provider: string; backend: string; label: string; project: string; region: string; status: string }[];
};

const TABS = [['clients', 'Clients'], ['keys', 'Provider keys'], ['rates', 'Rate card'], ['backends', 'Backends']] as const;

export default function Admin({ stats, clients = [], keys = [], rateModels = [], markupBps = 2500, clientOptions = [], backends = [] }: Props) {
    const [tab, setTab] = useState<'clients' | 'keys' | 'rates' | 'backends'>('clients');
    const [markup, setMarkup] = useState(Math.round(markupBps / 100));
    const [modal, setModal] = useState<null | 'client' | 'key' | 'backend'>(null);
    const [form, setForm] = useState<Record<string, string>>({ provider: 'openai' });
    const [manage, setManage] = useState<Client | null>(null);
    const [mForm, setMForm] = useState<Record<string, number | boolean | string>>({});
    const [adjust, setAdjust] = useState<{ amount: string; dir: number; reason: string }>({ amount: '', dir: 1, reason: '' });

    const openManage = (c: Client) => {
        setManage(c);
        setMForm({ default_markup_bps: c.markup_bps, min_balance_cents: c.min_cents, topup_amount_cents: c.topup_cents, auto_topup: c.auto_topup, status: c.account_status });
        setAdjust({ amount: '', dir: 1, reason: '' });
    };
    const applyAdjust = () => manage && router.post('/console/admin/balance', { client_id: manage.id, amount: Number(adjust.amount) * adjust.dir, reason: adjust.reason }, { preserveScroll: true, onSuccess: () => setAdjust({ amount: '', dir: 1, reason: '' }) });
    const saveSettings = () => manage && router.post('/console/admin/client', { client_id: manage.id, ...mForm }, { preserveScroll: true, onSuccess: () => setManage(null) });

    const persistRate = (pct: number) => router.post('/console/admin/rate', { markup_bps: pct * 100 }, { preserveScroll: true, preserveState: true });
    const sync = () => router.post('/console/admin/sync', {}, { preserveScroll: true });
    const submit = () => {
        if (modal === 'client') router.post('/console/admin/clients', form, { preserveScroll: true, onSuccess: () => setModal(null) });
        if (modal === 'key') router.post('/console/admin/keys', form, { preserveScroll: true, onSuccess: () => setModal(null) });
        if (modal === 'backend') router.post('/console/admin/backends', form, { preserveScroll: true, onSuccess: () => setModal(null) });
    };
    const upd = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm((f) => ({ ...f, [k]: e.target.value }));

    const th = { padding: '11px 20px', fontSize: 'var(--ox-text-2xs)', textTransform: 'uppercase' as const, letterSpacing: 'var(--ox-tracking-caps)', color: 'var(--ox-text-subtle)', fontWeight: 600, borderBottom: '1px solid var(--ox-divider)', textAlign: 'left' as const };
    const td = { padding: '13px 20px', borderBottom: '1px solid var(--ox-divider)', fontSize: 'var(--ox-text-sm)', color: 'var(--ox-text-muted)' };

    return (
        <ConsoleLayout active="admin" title="Clients & rates" subtitle="Assign provider keys, meter usage and set per-model rates"
            actions={<>
                <Button size="sm" variant="secondary" leadingIcon={<Icon name="refresh-cw" size={15} />} onClick={sync}>Sync usage</Button>
                <Button size="sm" leadingIcon={<Icon name="plus" size={15} color="var(--ox-on-primary)" />} onClick={() => { setForm({}); setModal('client'); }}>Add client</Button>
            </>}>
            <Head title="Admin — Console" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div className="oe-grid-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
                    <StatCard label="Active clients" value={String(stats?.clients ?? 0)} hint="on the exchange" />
                    <StatCard label="Provider keys" value={String(stats?.keys ?? 0)} hint="OpenAI · Google" />
                    <StatCard label="Metered (MTD)" value={stats?.metered ?? '$0'} hint="pulled usage" />
                    <StatCard label="Your margin" value={stats?.margin ?? '$0'} hint="after provider cost" />
                </div>

                <div style={{ display: 'flex', gap: 4, borderBottom: '1px solid var(--ox-border)' }}>
                    {TABS.map(([id, label]) => (
                        <button key={id} onClick={() => setTab(id)} style={{
                            padding: '10px 16px', border: 'none', background: 'transparent', cursor: 'pointer', fontFamily: 'var(--ox-font-sans)', fontSize: 14, fontWeight: 600,
                            color: tab === id ? 'var(--ox-text)' : 'var(--ox-text-subtle)', borderBottom: `2px solid ${tab === id ? 'var(--ox-green-500)' : 'transparent'}`, marginBottom: -1,
                        }}>{label}</button>
                    ))}
                </div>

                {tab === 'clients' && (
                    <Card padding="none">
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 640 }}>
                                <thead><tr>{['Client', 'Balance', 'Usage (MTD)', 'Markup', 'Status', ''].map((h, i) => <th key={i} style={th}>{h}</th>)}</tr></thead>
                                <tbody>
                                    {clients.map((c) => (
                                        <tr key={c.id}>
                                            <td style={{ ...td, color: 'var(--ox-text)', fontWeight: 600, fontFamily: 'var(--ox-font-sans)' }}>{c.client}</td>
                                            <td style={{ ...td, fontFamily: 'var(--ox-font-mono)' }}>{c.balance}</td>
                                            <td style={{ ...td, fontFamily: 'var(--ox-font-mono)' }}>{c.usage}</td>
                                            <td style={{ ...td, fontFamily: 'var(--ox-font-mono)' }}>{c.markup}</td>
                                            <td style={{ ...td, fontFamily: 'var(--ox-font-sans)' }}><Badge tone={c.status === 'suspended' ? 'danger' : c.status === 'low' ? 'warning' : 'success'}>{c.status === 'suspended' ? 'Suspended' : c.status === 'low' ? 'Low balance' : 'Active'}</Badge></td>
                                            <td style={{ ...td, textAlign: 'right' }}><Button variant="ghost" size="sm" onClick={() => openManage(c)}>Manage</Button></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                )}

                {tab === 'keys' && (
                    <Card padding="none">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid var(--ox-divider)' }}>
                            <div style={{ fontSize: 14, color: 'var(--ox-text-muted)', maxWidth: 520 }}>Each provider key is assigned to one client. Usage is pulled from the provider per key and attributed to that client.</div>
                            <Button size="sm" variant="secondary" leadingIcon={<Icon name="plus" size={15} />} onClick={() => { setForm({ provider: 'openai' }); setModal('key'); }}>Assign key</Button>
                        </div>
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 640 }}>
                                <thead><tr>{['Provider', 'Key', 'Assigned client', 'Usage pulled', 'Last sync'].map((h) => <th key={h} style={th}>{h}</th>)}</tr></thead>
                                <tbody>
                                    {keys.map((k, i) => (
                                        <tr key={i}>
                                            <td style={{ ...td, fontFamily: 'var(--ox-font-sans)', color: 'var(--ox-text)', fontWeight: 600 }}>{k.provider}</td>
                                            <td style={td}><Tag mono>{k.frag}</Tag></td>
                                            <td style={{ ...td, fontFamily: 'var(--ox-font-sans)' }}>{k.client}</td>
                                            <td style={{ ...td, fontFamily: 'var(--ox-font-mono)' }}>{k.usage}</td>
                                            <td style={{ ...td, display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--ox-success)' }} />{k.sync}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                )}

                {tab === 'rates' && (
                    <div className="oe-2col" style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 20, alignItems: 'start' }}>
                        <Card padding="lg" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                            <div style={{ fontWeight: 700, fontSize: 16 }}>Default markup</div>
                            <div style={{ fontSize: 13, color: 'var(--ox-text-muted)' }}>Applied over provider cost to compute each client's price.</div>
                            <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                                <span style={{ fontFamily: 'var(--ox-font-mono)', fontSize: 34, fontWeight: 600 }}>+{markup}</span>
                                <span style={{ fontSize: 18, color: 'var(--ox-text-subtle)' }}>%</span>
                            </div>
                            <input type="range" min={0} max={100} value={markup} onChange={(e) => setMarkup(Number(e.target.value))} onPointerUp={() => persistRate(markup)} onKeyUp={() => persistRate(markup)} style={{ accentColor: 'var(--ox-green-500)', width: '100%' }} />
                            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                {[15, 25, 40, 60].map((v) => (
                                    <button key={v} onClick={() => { setMarkup(v); persistRate(v); }} style={{ padding: '6px 12px', borderRadius: 999, fontFamily: 'var(--ox-font-mono)', fontSize: 12.5, cursor: 'pointer', border: `1px solid ${v === markup ? 'var(--ox-green-500)' : 'var(--ox-border-strong)'}`, background: v === markup ? 'var(--ox-primary-subtle)' : 'var(--ox-surface)', color: v === markup ? 'var(--ox-green-700)' : 'var(--ox-text-muted)' }}>+{v}%</button>
                                ))}
                            </div>
                        </Card>
                        <Card padding="none">
                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 540 }}>
                                    <thead><tr>{['Model', 'Provider', 'Provider cost /1M', 'Your price /1M', 'Margin'].map((h) => <th key={h} style={th}>{h}</th>)}</tr></thead>
                                    <tbody>
                                        {rateModels.map((m) => {
                                            const price = m.cost * (1 + markup / 100);
                                            return (
                                                <tr key={m.model}>
                                                    <td style={{ ...td, fontFamily: 'var(--ox-font-mono)', color: 'var(--ox-text)', fontWeight: 600 }}>{m.model}</td>
                                                    <td style={{ ...td, fontFamily: 'var(--ox-font-sans)' }}>{m.provider}</td>
                                                    <td style={{ ...td, fontFamily: 'var(--ox-font-mono)' }}>${m.cost.toFixed(2)}</td>
                                                    <td style={{ ...td, fontFamily: 'var(--ox-font-mono)', color: 'var(--ox-text)', fontWeight: 600 }}>${price.toFixed(2)}</td>
                                                    <td style={{ ...td, fontFamily: 'var(--ox-font-mono)', color: 'var(--ox-success)', fontWeight: 600 }}>+${(price - m.cost).toFixed(2)}</td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </Card>
                    </div>
                )}

                {tab === 'backends' && (
                    <Card padding="none">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid var(--ox-divider)' }}>
                            <div style={{ fontSize: 14, color: 'var(--ox-text-muted)', maxWidth: 560 }}>Open Exchange’s upstream credentials — what the gateway calls with. Add OpenAI, Gemini (AI Studio) and Vertex backends.</div>
                            <Button size="sm" variant="secondary" leadingIcon={<Icon name="plus" size={15} />} onClick={() => { setForm({ provider: 'google', backend: 'aistudio' }); setModal('backend'); }}>Add backend</Button>
                        </div>
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 640 }}>
                                <thead><tr>{['Provider', 'Backend', 'Label', 'Project', 'Region', 'Status'].map((h) => <th key={h} style={th}>{h}</th>)}</tr></thead>
                                <tbody>
                                    {backends.length === 0 && <tr><td style={{ ...td, color: 'var(--ox-text-subtle)' }} colSpan={6}>No backends yet — add one so the gateway can route.</td></tr>}
                                    {backends.map((b, i) => (
                                        <tr key={i}>
                                            <td style={{ ...td, fontFamily: 'var(--ox-font-sans)', color: 'var(--ox-text)', fontWeight: 600 }}>{b.provider}</td>
                                            <td style={td}><Tag mono>{b.backend}</Tag></td>
                                            <td style={{ ...td, fontFamily: 'var(--ox-font-sans)' }}>{b.label}</td>
                                            <td style={td}>{b.project}</td>
                                            <td style={td}>{b.region}</td>
                                            <td style={{ ...td, fontFamily: 'var(--ox-font-sans)' }}><Badge tone={b.status === 'active' ? 'success' : 'neutral'}>{b.status}</Badge></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                )}
            </div>

            {modal && (
                <div style={overlay} onClick={() => setModal(null)}>
                    <div style={modalBox} onClick={(e) => e.stopPropagation()}>
                        <div style={{ fontSize: 'var(--ox-text-lg)', fontWeight: 700, marginBottom: 16 }}>{modal === 'client' ? 'Add client' : modal === 'key' ? 'Assign provider key' : 'Add gateway backend'}</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {modal === 'client' && <>
                                <input autoFocus placeholder="Client / company name" style={inp} onChange={upd('name')} />
                                <input placeholder="Owner full name (optional)" style={inp} onChange={upd('owner_name')} />
                                <input type="email" placeholder="Owner email" style={inp} onChange={upd('owner_email')} />
                                <span style={{ fontSize: 12, color: 'var(--ox-text-subtle)', lineHeight: 1.5 }}>We’ll create their billing account and email them a link to set a password and log in.</span>
                            </>}
                            {modal === 'key' && <>
                                <select style={inp} value={form.client_id ?? ''} onChange={upd('client_id')}>
                                    <option value="">Select client…</option>
                                    {clientOptions.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                                <select style={inp} value={form.provider ?? 'openai'} onChange={upd('provider')}>
                                    <option value="openai">OpenAI</option>
                                    <option value="google">Google / Gemini</option>
                                </select>
                                <input placeholder="Label (e.g. production)" style={inp} onChange={upd('label')} />
                                <input placeholder={form.provider === 'google' ? 'GCP project id' : 'OpenAI project id'} style={inp} onChange={upd('external_project_id')} />
                                <input placeholder="API key / secret" style={inp} onChange={upd('secret')} />
                            </>}
                            {modal === 'backend' && <>
                                <select style={inp} value={form.provider ?? 'google'} onChange={upd('provider')}>
                                    <option value="google">Google (Gemini)</option>
                                    <option value="openai">OpenAI</option>
                                </select>
                                <select style={inp} value={form.backend ?? 'aistudio'} onChange={upd('backend')}>
                                    <option value="aistudio">AI Studio (Gemini Developer API)</option>
                                    <option value="vertex">Vertex AI</option>
                                    <option value="openai">OpenAI</option>
                                </select>
                                <input placeholder="Label (e.g. gemini-prod)" style={inp} onChange={upd('label')} />
                                {form.backend === 'vertex' ? <>
                                    <input placeholder="GCP project id" style={inp} onChange={upd('project_id')} />
                                    <input placeholder="Region (e.g. us-central1)" style={inp} onChange={upd('region')} />
                                    <textarea placeholder="Service-account JSON" style={{ ...inp, height: 90, paddingTop: 10, fontFamily: 'var(--ox-font-mono)', fontSize: 12 }} onChange={(e) => setForm((f) => ({ ...f, secret: e.target.value }))} />
                                </> : <input placeholder={form.provider === 'openai' ? 'OpenAI API key' : 'Gemini API key (AIza…)'} style={inp} onChange={upd('secret')} />}
                            </>}
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20 }}>
                            <Button variant="ghost" onClick={() => setModal(null)}>Cancel</Button>
                            <Button onClick={submit}>{modal === 'client' ? 'Create client' : 'Assign key'}</Button>
                        </div>
                    </div>
                </div>
            )}

            {manage && (
                <div style={overlay} onClick={() => setManage(null)}>
                    <div style={{ ...modalBox, maxWidth: 480 }} onClick={(e) => e.stopPropagation()}>
                        <div style={{ fontSize: 'var(--ox-text-lg)', fontWeight: 700 }}>Manage {manage.client}</div>
                        <div style={{ fontSize: 12.5, color: 'var(--ox-text-subtle)', marginBottom: 18 }}>Balance {manage.balance} · {manage.markup} markup · {manage.usage} used</div>

                        <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--ox-text-muted)', marginBottom: 8 }}>Adjust balance</div>
                        <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                            <select value={adjust.dir} onChange={(e) => setAdjust((a) => ({ ...a, dir: Number(e.target.value) }))} style={{ ...inp, width: 120, flex: 'none' }}>
                                <option value={1}>Credit +</option><option value={-1}>Debit −</option>
                            </select>
                            <input type="number" placeholder="0.00" value={adjust.amount} onChange={(e) => setAdjust((a) => ({ ...a, amount: e.target.value }))} style={inp} />
                        </div>
                        <input placeholder="Reason (optional)" value={adjust.reason} onChange={(e) => setAdjust((a) => ({ ...a, reason: e.target.value }))} style={{ ...inp, marginBottom: 10 }} />
                        <Button variant="secondary" fullWidth onClick={applyAdjust}>Apply adjustment</Button>

                        <div style={{ height: 1, background: 'var(--ox-divider)', margin: '20px 0' }} />

                        <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--ox-text-muted)', marginBottom: 10 }}>Billing settings</div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                            <label style={lbl}>Markup %<input type="number" style={inp} value={Number(mForm.default_markup_bps) / 100} onChange={(e) => setMForm((f) => ({ ...f, default_markup_bps: Math.round(Number(e.target.value) * 100) }))} /></label>
                            <label style={lbl}>Status<select style={inp} value={String(mForm.status)} onChange={(e) => setMForm((f) => ({ ...f, status: e.target.value }))}><option value="active">Active</option><option value="suspended">Suspended</option></select></label>
                            <label style={lbl}>Min balance $<input type="number" style={inp} value={Number(mForm.min_balance_cents) / 100} onChange={(e) => setMForm((f) => ({ ...f, min_balance_cents: Math.round(Number(e.target.value) * 100) }))} /></label>
                            <label style={lbl}>Top-up $<input type="number" style={inp} value={Number(mForm.topup_amount_cents) / 100} onChange={(e) => setMForm((f) => ({ ...f, topup_amount_cents: Math.round(Number(e.target.value) * 100) }))} /></label>
                        </div>
                        <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12, fontSize: 13, color: 'var(--ox-text)' }}>
                            <input type="checkbox" checked={!!mForm.auto_topup} onChange={(e) => setMForm((f) => ({ ...f, auto_topup: e.target.checked }))} /> Auto top-up enabled
                        </label>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 22 }}>
                            <Button variant="ghost" onClick={() => setManage(null)}>Close</Button>
                            <Button onClick={saveSettings}>Save settings</Button>
                        </div>
                    </div>
                </div>
            )}
        </ConsoleLayout>
    );
}

const overlay: React.CSSProperties = { position: 'fixed', inset: 0, background: 'var(--ox-overlay)', backdropFilter: 'blur(2px)', display: 'grid', placeItems: 'center', zIndex: 1100, padding: 20 };
const modalBox: React.CSSProperties = { width: '100%', maxWidth: 440, background: 'var(--ox-surface)', borderRadius: 'var(--ox-radius-xl)', border: '1px solid var(--ox-border)', boxShadow: 'var(--ox-shadow-xl)', padding: 24 };
const inp: React.CSSProperties = { width: '100%', height: 42, padding: '0 12px', borderRadius: 'var(--ox-radius-md)', border: '1px solid var(--ox-border-strong)', background: 'var(--ox-bg-subtle)', fontFamily: 'var(--ox-font-sans)', fontSize: 14, color: 'var(--ox-text)', outline: 'none' };
const lbl: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: 5, fontSize: 12, fontWeight: 600, color: 'var(--ox-text-muted)' };
