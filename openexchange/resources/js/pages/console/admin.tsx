import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import ConsoleLayout from '@/layouts/console-layout';
import { Card, Button, Icon, Badge, Tag, StatCard } from '@/components/oe';

type Client = { id: number; client: string; balance: string; balance_cents: number; usage: string; markup: string; markup_bps: number; min_cents: number; topup_cents: number; auto_topup: boolean; account_status: string; status: string };
type Key = { provider: string; frag: string; client: string; usage: string; sync: string };
type RateModel = { model: string; provider: string; cost: number };
type Proj = { id: string; name: string; status: string; assigned_client_id: number | null; assigned_client: string | null; label: string | null; key_status: string | null; tokens: number; series: number[] };
type Cat = { id: number; model: string; provider: string; in: number; out: number; active: boolean; markup_bps: number | null };
type Props = {
    stats?: { clients: number; keys: number; metered: string; margin: string };
    clients?: Client[];
    keys?: Key[];
    rateModels?: RateModel[];
    markupBps?: number;
    clientOptions?: { id: number; name: string }[];
    backends?: { provider: string; backend: string; label: string; project: string; region: string; status: string }[];
    newAccessKey?: { name: string; client: string; secret: string } | null;
    discovery?: Proj[];
    discoveredAt?: string | null;
    openaiReady?: boolean;
    catalog?: Cat[];
    unpricedModels?: string[];
    accessKeys?: Record<string, { id: number; name: string; frag: string; status: string; last_used: string }[]>;
    clientRates?: Record<string, { id: number; provider: string; model: string; markup_bps: number }[]>;
};

const TABS = [['clients', 'Clients'], ['discovery', 'Discovery'], ['keys', 'Provider keys'], ['rates', 'Rate card'], ['backends', 'Backends']] as const;

export default function Admin({ stats, clients = [], keys = [], rateModels = [], markupBps = 2500, clientOptions = [], backends = [], newAccessKey = null, discovery = [], discoveredAt = null, openaiReady = false, catalog = [], unpricedModels = [], accessKeys = {}, clientRates = {} }: Props) {
    const [tab, setTab] = useState<'clients' | 'discovery' | 'keys' | 'rates' | 'backends'>('clients');
    const [markup, setMarkup] = useState(Math.round(markupBps / 100));
    const [modal, setModal] = useState<null | 'client' | 'key' | 'backend' | 'model'>(null);
    const [form, setForm] = useState<Record<string, string>>({ provider: 'openai' });
    const [manage, setManage] = useState<Client | null>(null);
    const [mForm, setMForm] = useState<Record<string, number | boolean | string>>({});
    const [adjust, setAdjust] = useState<{ amount: string; dir: number; reason: string }>({ amount: '', dir: 1, reason: '' });

    const openManage = (c: Client) => {
        setManage(c);
        setMForm({ default_markup_bps: c.markup_bps, min_balance_cents: c.min_cents, topup_amount_cents: c.topup_cents, auto_topup: c.auto_topup, status: c.account_status });
        setAdjust({ amount: '', dir: 1, reason: '' });
        setConfirmDel(false);
        setUsage({ model: '', input_tokens: '', output_tokens: '' });
        setCrForm({ model: '', pct: '' });
    };
    const applyAdjust = () => manage && router.post('/console/admin/balance', { client_id: manage.id, amount: Number(adjust.amount) * adjust.dir, reason: adjust.reason }, { preserveScroll: true, onSuccess: () => setAdjust({ amount: '', dir: 1, reason: '' }) });
    const saveSettings = () => manage && router.post('/console/admin/client', { client_id: manage.id, ...mForm }, { preserveScroll: true, onSuccess: () => setManage(null) });
    const [keyName, setKeyName] = useState('');
    const [usage, setUsage] = useState<{ model: string; input_tokens: string; output_tokens: string }>({ model: '', input_tokens: '', output_tokens: '' });
    const createKey = () => manage && router.post('/console/admin/access-key', { client_id: manage.id, name: keyName }, { preserveScroll: true, onSuccess: () => { setKeyName(''); setManage(null); } });
    const addUsage = () => manage && router.post('/console/admin/usage', { client_id: manage.id, model: usage.model, input_tokens: Number(usage.input_tokens || 0), output_tokens: Number(usage.output_tokens || 0) }, { preserveScroll: true, onSuccess: () => setUsage({ model: '', input_tokens: '', output_tokens: '' }) });

    // Discovery + project assignment + client delete
    const [assignId, setAssignId] = useState<string | null>(null);
    const [assignForm, setAssignForm] = useState<{ client_id: string; label: string }>({ client_id: '', label: '' });
    const [confirmDel, setConfirmDel] = useState(false);
    const openAssign = (p: Proj) => { setAssignId(p.id); setAssignForm({ client_id: String(p.assigned_client_id ?? ''), label: p.label ?? p.name }); };
    const doAssign = (p: Proj) => router.post('/console/admin/assign-project', { client_id: assignForm.client_id, provider: 'openai', external_project_id: p.id, label: assignForm.label }, { preserveScroll: true, onSuccess: () => setAssignId(null) });
    const toggleProject = (p: Proj) => router.post('/console/admin/toggle-project', { provider: 'openai', external_project_id: p.id }, { preserveScroll: true });
    const discover = () => router.post('/console/admin/discover', {}, { preserveScroll: true });
    const deleteClient = () => manage && router.post('/console/admin/client/delete', { client_id: manage.id }, { preserveScroll: true, onSuccess: () => { setManage(null); setConfirmDel(false); } });
    const fmtTok = (n: number) => (n >= 1e6 ? (n / 1e6).toFixed(2) + 'M' : n >= 1e3 ? (n / 1e3).toFixed(1) + 'K' : String(n));

    // Live "add usage" cost preview
    const uCat = catalog.find((c) => c.model === usage.model);
    const uMarkup = Number(mForm.default_markup_bps ?? manage?.markup_bps ?? 2500) / 10000;
    const uProvCost = uCat ? (uCat.in * Number(usage.input_tokens || 0) / 1e6 + uCat.out * Number(usage.output_tokens || 0) / 1e6) : 0;
    const uBilled = uProvCost * (1 + uMarkup);

    // Model catalogue pricing editor (cost / resell / profit)
    const [priceEdits, setPriceEdits] = useState<Record<number, { in?: string; out?: string; active?: boolean }>>({});
    const pv = (m: Cat, f: 'in' | 'out') => priceEdits[m.id]?.[f] ?? String(m[f]);
    const pActive = (m: Cat) => priceEdits[m.id]?.active ?? m.active;
    const dirty = (m: Cat) => priceEdits[m.id] !== undefined;
    const setPrice = (id: number, f: 'in' | 'out' | 'active', v: string | boolean) => setPriceEdits((e) => ({ ...e, [id]: { ...e[id], [f]: v } }));
    const saveModel = (m: Cat) => router.post('/console/admin/model/update', { id: m.id, input: Number(pv(m, 'in')), output: Number(pv(m, 'out')), active: pActive(m) }, { preserveScroll: true, preserveState: true, onSuccess: () => setPriceEdits((e) => { const n = { ...e }; delete n[m.id]; return n; }) });
    const revokeKey = (id: number) => router.post('/console/admin/access-key/revoke', { access_key_id: id }, { preserveScroll: true });
    const syncModels = () => router.post('/console/admin/sync-models', {}, { preserveScroll: true });

    // Per-client, per-model markup override
    const [crForm, setCrForm] = useState<{ model: string; pct: string }>({ model: '', pct: '' });
    const saveClientRate = () => { if (!manage || !crForm.model) return; const cat = catalog.find((c) => c.model === crForm.model); router.post('/console/admin/client-model-rate', { client_id: manage.id, provider: cat?.provider ?? 'openai', model: crForm.model, markup_bps: Math.round(Number(crForm.pct || 0) * 100) }, { preserveScroll: true, onSuccess: () => setCrForm({ model: '', pct: '' }) }); };
    const deleteClientRate = (id: number) => router.post('/console/admin/client-model-rate/delete', { id }, { preserveScroll: true });

    const persistRate = (pct: number) => router.post('/console/admin/rate', { markup_bps: pct * 100 }, { preserveScroll: true, preserveState: true });
    const sync = () => router.post('/console/admin/sync', {}, { preserveScroll: true });
    const submit = () => {
        if (modal === 'client') router.post('/console/admin/clients', form, { preserveScroll: true, onSuccess: () => setModal(null) });
        if (modal === 'key') router.post('/console/admin/keys', form, { preserveScroll: true, onSuccess: () => setModal(null) });
        if (modal === 'backend') router.post('/console/admin/backends', form, { preserveScroll: true, onSuccess: () => setModal(null) });
        if (modal === 'model') router.post('/console/admin/model', form, { preserveScroll: true, onSuccess: () => setModal(null) });
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
                {newAccessKey && (
                    <Card padding="lg" style={{ border: '1.5px solid var(--ox-green-500)', background: 'var(--ox-primary-subtle)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                            <Icon name="check" size={18} color="var(--ox-green-700)" />
                            <span style={{ fontWeight: 700 }}>Gateway key for {newAccessKey.client} — “{newAccessKey.name}”</span>
                            <span style={{ marginLeft: 'auto' }}><Badge tone="warning">Shown once</Badge></span>
                        </div>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center', background: 'var(--ox-ink-900)', borderRadius: 10, padding: '12px 14px' }}>
                            <code style={{ flex: 1, fontFamily: 'var(--ox-font-mono)', fontSize: 13, color: '#eef3f2', wordBreak: 'break-all' }}>{newAccessKey.secret}</code>
                            <Button size="sm" variant="secondary" onClick={() => navigator.clipboard?.writeText(newAccessKey.secret)} leadingIcon={<Icon name="copy" size={14} />}>Copy</Button>
                        </div>
                    </Card>
                )}
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
                                            <td style={{ ...td, textAlign: 'right' }}><Button as={Link} href={`/console/admin/client/${c.id}`} variant="ghost" size="sm">Manage</Button></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                )}

                {tab === 'discovery' && (
                    <Card padding="none">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, padding: '16px 20px', borderBottom: '1px solid var(--ox-divider)', flexWrap: 'wrap' }}>
                            <div style={{ fontSize: 14, color: 'var(--ox-text-muted)', maxWidth: 580 }}>
                                Projects in your OpenAI organization. Assign each to a client — its usage is then metered and billed to them automatically. No keys to create by hand.
                                {discoveredAt && <span style={{ display: 'block', fontSize: 12, color: 'var(--ox-text-subtle)', marginTop: 3 }}>Last refreshed {discoveredAt}</span>}
                            </div>
                            <Button size="sm" variant="secondary" leadingIcon={<Icon name="refresh-cw" size={15} />} onClick={discover}>{discoveredAt ? 'Refresh from OpenAI' : 'Discover projects'}</Button>
                        </div>
                        {!openaiReady && (
                            <div style={{ padding: '12px 20px', background: 'var(--ox-warning-surface)', color: 'var(--ox-warning)', fontSize: 13 }}>Set <span className="ox-mono">OPENAI_ADMIN_KEY</span> (an organization admin key) in your environment to discover projects.</div>
                        )}
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 760 }}>
                                <thead><tr>{['Project', 'Project ID', 'Usage · 30 days', 'Assigned to'].map((h) => <th key={h} style={th}>{h}</th>)}</tr></thead>
                                <tbody>
                                    {discovery.length === 0 && <tr><td style={{ ...td, color: 'var(--ox-text-subtle)' }} colSpan={4}>{openaiReady ? 'No projects loaded yet — click Discover projects.' : 'Configure OPENAI_ADMIN_KEY, then discover.'}</td></tr>}
                                    {discovery.map((p) => (
                                        <tr key={p.id}>
                                            <td style={{ ...td, color: 'var(--ox-text)', fontWeight: 600, fontFamily: 'var(--ox-font-sans)' }}>{p.name}</td>
                                            <td style={td}><Tag mono>{p.id}</Tag></td>
                                            <td style={td}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                                    <Sparkline data={p.series} />
                                                    <span style={{ fontFamily: 'var(--ox-font-mono)', color: 'var(--ox-text)', fontWeight: 600, whiteSpace: 'nowrap' }}>{fmtTok(p.tokens)} tok</span>
                                                </div>
                                            </td>
                                            <td style={{ ...td, minWidth: 320 }}>
                                                {assignId === p.id ? (
                                                    <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
                                                        <select value={assignForm.client_id} onChange={(e) => setAssignForm((f) => ({ ...f, client_id: e.target.value }))} style={{ ...inp, width: 150, height: 34 }}>
                                                            <option value="">Client…</option>
                                                            {clientOptions.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                                                        </select>
                                                        <input placeholder="Label" value={assignForm.label} onChange={(e) => setAssignForm((f) => ({ ...f, label: e.target.value }))} style={{ ...inp, width: 130, height: 34 }} />
                                                        <Button size="sm" onClick={() => doAssign(p)} disabled={!assignForm.client_id}>Save</Button>
                                                        <Button size="sm" variant="ghost" onClick={() => setAssignId(null)}>Cancel</Button>
                                                    </div>
                                                ) : p.assigned_client ? (
                                                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                                                        <Badge tone={p.key_status === 'disabled' ? 'neutral' : 'success'}>{p.assigned_client}</Badge>
                                                        {p.label && <span style={{ fontSize: 12, color: 'var(--ox-text-subtle)' }}>{p.label}</span>}
                                                        <Button size="sm" variant="ghost" onClick={() => openAssign(p)}>Reassign</Button>
                                                        <Button size="sm" variant="ghost" onClick={() => toggleProject(p)}>{p.key_status === 'disabled' ? 'Enable' : 'Disable'}</Button>
                                                    </div>
                                                ) : (
                                                    <Button size="sm" variant="secondary" onClick={() => openAssign(p)}>Assign to client</Button>
                                                )}
                                            </td>
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
                            {unpricedModels.length > 0 && (
                                <div style={{ padding: '12px 16px', background: 'var(--ox-warning-surface)', borderBottom: '1px solid var(--ox-divider)' }}>
                                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ox-warning)', marginBottom: 6 }}>{unpricedModels.length} model{unpricedModels.length > 1 ? 's' : ''} used this month with no price — billing $0</div>
                                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                                        {unpricedModels.map((m) => <button key={m} onClick={() => { setForm({ provider: 'openai', model: m }); setModal('model'); }} style={{ ...chip, borderColor: 'var(--ox-warning)', color: 'var(--ox-warning)' }}>+ price {m}</button>)}
                                    </div>
                                </div>
                            )}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, padding: '14px 16px', borderBottom: '1px solid var(--ox-divider)', flexWrap: 'wrap' }}>
                                <span style={{ fontSize: 13, color: 'var(--ox-text-muted)' }}>Provider cost, your resell price and profit — per 1M output tokens at the effective markup.</span>
                                <div style={{ display: 'flex', gap: 8 }}>
                                    <Button size="sm" variant="secondary" leadingIcon={<Icon name="refresh-cw" size={14} />} onClick={syncModels}>Sync models</Button>
                                    <Button size="sm" leadingIcon={<Icon name="plus" size={14} color="var(--ox-on-primary)" />} onClick={() => { setForm({ provider: 'openai' }); setModal('model'); }}>Add model</Button>
                                </div>
                            </div>
                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 700 }}>
                                    <thead><tr>{['Model', 'Cost in', 'Cost out', 'Resell out', 'Profit out', 'Active', ''].map((h, i) => <th key={i} style={th}>{h}</th>)}</tr></thead>
                                    <tbody>
                                        {catalog.map((m) => {
                                            const eff = m.markup_bps != null ? m.markup_bps / 10000 : markup / 100;
                                            const outCost = Number(pv(m, 'out'));
                                            const resell = outCost * (1 + eff);
                                            return (
                                                <tr key={m.id} style={{ opacity: pActive(m) ? 1 : 0.45 }}>
                                                    <td style={{ ...td, fontFamily: 'var(--ox-font-mono)', color: 'var(--ox-text)', fontWeight: 600 }}>{m.model}<span style={{ marginLeft: 6, fontSize: 11, color: 'var(--ox-text-subtle)' }}>{m.provider}</span>{m.markup_bps != null && <span style={{ marginLeft: 6, fontSize: 10, color: 'var(--ox-green-700)' }}>+{(m.markup_bps / 100).toFixed(0)}%</span>}</td>
                                                    <td style={td}><input value={pv(m, 'in')} onChange={(e) => setPrice(m.id, 'in', e.target.value)} style={{ ...inp, height: 32, width: 78 }} /></td>
                                                    <td style={td}><input value={pv(m, 'out')} onChange={(e) => setPrice(m.id, 'out', e.target.value)} style={{ ...inp, height: 32, width: 78 }} /></td>
                                                    <td style={{ ...td, fontFamily: 'var(--ox-font-mono)', color: 'var(--ox-text)', fontWeight: 600 }}>${resell.toFixed(2)}</td>
                                                    <td style={{ ...td, fontFamily: 'var(--ox-font-mono)', color: 'var(--ox-success)', fontWeight: 600 }}>+${(resell - outCost).toFixed(2)}</td>
                                                    <td style={td}><input type="checkbox" checked={pActive(m)} onChange={(e) => setPrice(m.id, 'active', e.target.checked)} /></td>
                                                    <td style={{ ...td, textAlign: 'right' }}>{dirty(m) && <Button size="sm" onClick={() => saveModel(m)}>Save</Button>}</td>
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
                        <div style={{ fontSize: 'var(--ox-text-lg)', fontWeight: 700, marginBottom: 16 }}>{modal === 'client' ? 'Add client' : modal === 'key' ? 'Assign provider key' : modal === 'model' ? 'Add / re-price model' : 'Add gateway backend'}</div>
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
                            {modal === 'model' && <>
                                <select style={inp} value={form.provider ?? 'openai'} onChange={upd('provider')}>
                                    {['openai', 'anthropic', 'google', 'meta', 'deepseek', 'xai', 'mistral'].map((p) => <option key={p} value={p}>{p}</option>)}
                                </select>
                                <input placeholder="Model id (e.g. gpt-5.5)" style={inp} value={form.model ?? ''} onChange={upd('model')} />
                                <div style={{ display: 'flex', gap: 8 }}>
                                    <input placeholder="Input $/1M" type="number" style={inp} value={form.input ?? ''} onChange={upd('input')} />
                                    <input placeholder="Output $/1M" type="number" style={inp} value={form.output ?? ''} onChange={upd('output')} />
                                </div>
                            </>}
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20 }}>
                            <Button variant="ghost" onClick={() => setModal(null)}>Cancel</Button>
                            <Button onClick={submit}>{modal === 'client' ? 'Create client' : modal === 'model' ? 'Save model' : modal === 'backend' ? 'Add backend' : 'Assign key'}</Button>
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

                        <div style={{ height: 1, background: 'var(--ox-divider)', margin: '20px 0' }} />
                        <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--ox-text-muted)', marginBottom: 8 }}>Gateway keys</div>
                        <div style={{ display: 'flex', gap: 8 }}>
                            <input placeholder="New key name (e.g. Production app)" value={keyName} onChange={(e) => setKeyName(e.target.value)} style={inp} />
                            <Button variant="secondary" onClick={createKey} style={{ flexShrink: 0 }}>Create</Button>
                        </div>
                        {(accessKeys[String(manage.id)] ?? []).length > 0 && (
                            <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
                                {(accessKeys[String(manage.id)] ?? []).map((k) => (
                                    <div key={k.id} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5 }}>
                                        <span className="ox-mono" style={{ color: 'var(--ox-text-muted)' }}>{k.frag}</span>
                                        <span style={{ color: 'var(--ox-text-subtle)' }}>{k.name}</span>
                                        {k.status === 'revoked' ? <Badge tone="neutral">Revoked</Badge> : <button onClick={() => revokeKey(k.id)} style={{ marginLeft: 'auto', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--ox-danger)', fontSize: 12, fontWeight: 600 }}>Revoke</button>}
                                    </div>
                                ))}
                            </div>
                        )}

                        <div style={{ height: 1, background: 'var(--ox-divider)', margin: '20px 0' }} />
                        <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--ox-text-muted)', marginBottom: 8 }}>Per-model rate for this client</div>
                        {(clientRates[String(manage.id)] ?? []).map((r) => (
                            <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5, marginBottom: 6 }}>
                                <span className="ox-mono" style={{ color: 'var(--ox-text)' }}>{r.model}</span>
                                <span style={{ color: 'var(--ox-green-700)', fontWeight: 600 }}>+{(r.markup_bps / 100).toFixed(0)}%</span>
                                <button onClick={() => deleteClientRate(r.id)} style={{ marginLeft: 'auto', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--ox-danger)', fontSize: 12, fontWeight: 600 }}>Remove</button>
                            </div>
                        ))}
                        <div style={{ display: 'flex', gap: 8 }}>
                            <select value={crForm.model} onChange={(e) => setCrForm((f) => ({ ...f, model: e.target.value }))} style={inp}>
                                <option value="">Model…</option>
                                {catalog.map((c) => <option key={c.provider + c.model} value={c.model}>{c.model}</option>)}
                            </select>
                            <input type="number" placeholder="Markup %" value={crForm.pct} onChange={(e) => setCrForm((f) => ({ ...f, pct: e.target.value }))} style={{ ...inp, width: 120 }} />
                            <Button variant="secondary" onClick={saveClientRate} style={{ flexShrink: 0 }}>Set</Button>
                        </div>

                        <div style={{ height: 1, background: 'var(--ox-divider)', margin: '20px 0' }} />
                        <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--ox-text-muted)', marginBottom: 8 }}>Add usage manually</div>
                        <select value={usage.model} onChange={(e) => setUsage((u) => ({ ...u, model: e.target.value }))} style={{ ...inp, marginBottom: 8 }}>
                            <option value="">Select model…</option>
                            {catalog.map((c) => <option key={c.provider + c.model} value={c.model}>{c.model} ({c.provider})</option>)}
                        </select>
                        <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
                            <input type="number" placeholder="Input tokens" value={usage.input_tokens} onChange={(e) => setUsage((u) => ({ ...u, input_tokens: e.target.value }))} style={inp} />
                            <input type="number" placeholder="Output tokens" value={usage.output_tokens} onChange={(e) => setUsage((u) => ({ ...u, output_tokens: e.target.value }))} style={inp} />
                        </div>
                        {usage.model && (
                            <div style={{ fontSize: 12, color: 'var(--ox-text-subtle)', marginBottom: 10, lineHeight: 1.5 }}>
                                {uCat
                                    ? <>Provider cost <span className="ox-mono" style={{ color: 'var(--ox-text-muted)' }}>${uProvCost.toFixed(4)}</span> → billed to client <span className="ox-mono" style={{ color: 'var(--ox-green-700)', fontWeight: 700 }}>${uBilled.toFixed(4)}</span> (+{Math.round(uMarkup * 100)}% markup)</>
                                    : <span style={{ color: 'var(--ox-warning)' }}>Not in the catalogue — provider cost $0, nothing billed.</span>}
                            </div>
                        )}
                        <Button variant="secondary" fullWidth onClick={addUsage} disabled={!usage.model}>Add usage · debit ${uBilled.toFixed(2)}</Button>

                        <div style={{ height: 1, background: 'var(--ox-divider)', margin: '20px 0' }} />
                        {!confirmDel ? (
                            <button onClick={() => setConfirmDel(true)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--ox-danger)', fontSize: 13, fontWeight: 600, fontFamily: 'var(--ox-font-sans)', padding: 0 }}>Delete this client…</button>
                        ) : (
                            <div style={{ background: 'var(--ox-danger-surface)', borderRadius: 10, padding: 14 }}>
                                <div style={{ fontSize: 13, color: 'var(--ox-danger)', fontWeight: 700, marginBottom: 6 }}>Permanently delete {manage.client}?</div>
                                <div style={{ fontSize: 12, color: 'var(--ox-text-muted)', marginBottom: 12, lineHeight: 1.5 }}>Removes the client, its users, assigned projects, usage records and balance history. This cannot be undone.</div>
                                <div style={{ display: 'flex', gap: 8 }}>
                                    <Button variant="ghost" size="sm" onClick={() => setConfirmDel(false)}>Cancel</Button>
                                    <Button size="sm" onClick={deleteClient} style={{ background: 'var(--ox-danger)', color: '#fff' }}>Yes, delete</Button>
                                </div>
                            </div>
                        )}

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

function Sparkline({ data }: { data: number[] }) {
    const w = 116, h = 28;
    if (!data || data.length < 2 || Math.max(...data) === 0) return <span style={{ fontSize: 11, color: 'var(--ox-text-subtle)' }}>no activity</span>;
    const max = Math.max(...data, 1);
    const step = w / (data.length - 1);
    const line = data.map((v, i) => `${(i * step).toFixed(1)},${(h - (v / max) * (h - 4) - 2).toFixed(1)}`).join(' ');
    return (
        <svg width={w} height={h} style={{ display: 'block', flexShrink: 0 }} aria-hidden>
            <polygon points={`0,${h} ${line} ${w},${h}`} fill="var(--ox-primary-subtle)" />
            <polyline points={line} fill="none" stroke="var(--ox-green-500)" strokeWidth={1.5} strokeLinejoin="round" strokeLinecap="round" />
        </svg>
    );
}

const overlay: React.CSSProperties = { position: 'fixed', inset: 0, background: 'var(--ox-overlay)', backdropFilter: 'blur(2px)', display: 'grid', placeItems: 'center', zIndex: 1100, padding: 20 };
const modalBox: React.CSSProperties = { width: '100%', maxWidth: 440, background: 'var(--ox-surface)', borderRadius: 'var(--ox-radius-xl)', border: '1px solid var(--ox-border)', boxShadow: 'var(--ox-shadow-xl)', padding: 24 };
const inp: React.CSSProperties = { width: '100%', height: 42, padding: '0 12px', borderRadius: 'var(--ox-radius-md)', border: '1px solid var(--ox-border-strong)', background: 'var(--ox-bg-subtle)', fontFamily: 'var(--ox-font-sans)', fontSize: 14, color: 'var(--ox-text)', outline: 'none' };
const lbl: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: 5, fontSize: 12, fontWeight: 600, color: 'var(--ox-text-muted)' };
const chip: React.CSSProperties = { padding: '4px 10px', borderRadius: 999, border: '1px solid var(--ox-border-strong)', background: 'var(--ox-surface)', fontFamily: 'var(--ox-font-mono)', fontSize: 12, cursor: 'pointer', color: 'var(--ox-text-muted)' };
