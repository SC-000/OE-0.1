import { useState } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import AdminLayout from '@/layouts/admin-layout';
import { Card, Badge, Button, Icon, StatCard } from '@/components/oe';
import { bps, money, num, pct, tokens } from '@/lib/format';

type Client = {
    id: number; name: string; slug: string; company: string | null; contact_email: string | null; notes: string | null;
    status: string; since: string | null; balance_cents: number; markup_bps: number; min_cents: number;
    topup_cents: number; debt_limit_cents: number; auto_topup: boolean; model_visibility: string; billings_customer_id: string | null;
};
type PerModel = {
    provider: string; provider_label: string; model: string; client_sees: string;
    input_tokens: number; output_tokens: number; tokens: number; requests: number;
    revenue_cents: number; cost_cents: number; margin_cents: number;
    effective_markup_bps: number | null; rate_label: string; rate_origin: string;
};
type Rate = { id: number; provider: string | null; model: string | null; mode: string; label: string; markup_bps: number | null; note: string | null; per_request_fee_cents: number; min_margin_bps: number | null };
type Charge = { id: number; kind: string; cadence: string; name: string; amount_cents: number; model: string | null; provider: string | null; input_tokens: number; output_tokens: number; active: boolean; last_run: string | null; runs: number };
type Staff = { id: number; name: string; email: string; role: string; verified: boolean; last_login: string; joined: string | null };

type Props = {
    client: Client;
    summary: { revenue_cents: number; cost_cents: number; margin_cents: number; margin_pct: number | null; requests: number; tokens: number };
    staff: Staff[];
    perModel: PerModel[];
    rates: Rate[];
    charges: Charge[];
    ledger: { date: string; type: string; desc: string | null; amount_cents: number; balance_after_cents: number }[];
    topUps: { date: string; amount_cents: number; status: string; trigger: string; reason: string | null }[];
    cards: { brand: string; last4: string; exp: string; default: boolean }[];
    accessKeys: { id: number; name: string; frag: string; status: string; last_used: string }[];
    sources: { id: number; provider: string; project: string | null; label: string; status: string; revenue_cents: number; synced: string }[];
    audit: { at: string; action: string; actor: string; summary: string | null }[];
    catalog: { provider: string; model: string; in: number; out: number }[];
    newKey?: { name: string; secret: string } | null;
};

const TABS = [
    ['overview', 'Overview'], ['usage', 'Usage & margin'], ['rates', 'Rate card'],
    ['charges', 'Charges'], ['people', 'People & access'], ['billing', 'Billing'], ['activity', 'Activity'],
] as const;
type Tab = typeof TABS[number][0];

const th: React.CSSProperties = { textAlign: 'left', padding: '9px 10px', fontSize: 11, fontWeight: 600, color: 'var(--ox-text-subtle)', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid var(--ox-border)', whiteSpace: 'nowrap' };
const td: React.CSSProperties = { padding: '10px', fontSize: 'var(--ox-text-sm)', borderBottom: '1px solid var(--ox-border)' };
const mono: React.CSSProperties = { fontFamily: 'var(--ox-font-mono)' };
const input: React.CSSProperties = { width: '100%', height: 34, padding: '0 9px', borderRadius: 'var(--ox-radius-sm)', border: '1px solid var(--ox-border)', background: 'var(--ox-surface)', color: 'var(--ox-text)', fontSize: 'var(--ox-text-sm)' };

const Lbl = ({ children }: { children: React.ReactNode }) => (
    <span style={{ display: 'block', fontSize: 11.5, fontWeight: 600, color: 'var(--ox-text-subtle)', marginBottom: 5 }}>{children}</span>
);
const Section = ({ title, hint, children, right }: { title: string; hint?: string; children: React.ReactNode; right?: React.ReactNode }) => (
    <Card padding="lg" style={{ marginBottom: 18 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 12 }}>
            <div>
                <h2 style={{ margin: 0, fontSize: 'var(--ox-text-md)', fontWeight: 700 }}>{title}</h2>
                {hint && <p style={{ margin: '2px 0 0', fontSize: 'var(--ox-text-xs)', color: 'var(--ox-text-subtle)' }}>{hint}</p>}
            </div>
            {right}
        </div>
        {children}
    </Card>
);

export default function ClientProfile(props: Props) {
    const { client, summary, staff, perModel, rates, charges, ledger, topUps, cards, accessKeys, sources, audit, catalog, newKey } = props;
    const [tab, setTab] = useState<Tab>('overview');

    return (
        <AdminLayout
            active="clients"
            title={client.name}
            subtitle={`${client.company ? client.company + ' · ' : ''}${client.contact_email ?? 'no contact email'} · client since ${client.since}`}
            actions={<>
                <Badge tone={client.status === 'active' ? 'success' : 'neutral'}>{client.status}</Badge>
                <Button size="sm" variant="secondary" leadingIcon={<Icon name="eye" size={15} />}
                    onClick={() => router.post(`/admin/clients/${client.id}/impersonate`)}>View as client</Button>
                <Link href="/admin/clients" style={{ fontSize: 'var(--ox-text-sm)', color: 'var(--ox-text-subtle)', textDecoration: 'none' }}>← All clients</Link>
            </>}
        >
            <Head title={`Admin — ${client.name}`} />

            {newKey && (
                <Card padding="md" style={{ marginBottom: 16, borderLeft: '3px solid var(--ox-primary)' }}>
                    <strong style={{ fontSize: 'var(--ox-text-sm)' }}>New gateway key “{newKey.name}” — copy it now, it is not shown again.</strong>
                    <div style={{ ...mono, marginTop: 8, padding: 10, background: 'var(--ox-bg-muted)', borderRadius: 'var(--ox-radius-sm)', fontSize: 12.5, wordBreak: 'break-all' }}>{newKey.secret}</div>
                </Card>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 12, marginBottom: 20 }}>
                <StatCard label="Balance" value={money(client.balance_cents)} hint={client.auto_topup ? `Auto top-up ${money(client.topup_cents)} at ${money(client.min_cents)}` : 'Auto top-up off'} />
                <StatCard label="Revenue MTD" value={money(summary.revenue_cents)} hint={`${num(summary.requests)} requests`} />
                <StatCard label="Your cost" value={money(summary.cost_cents)} hint="Paid to providers" />
                <StatCard label="Margin" value={money(summary.margin_cents)} hint={`${pct(summary.margin_pct)} of revenue`} />
                <StatCard label="Default markup" value={bps(client.markup_bps)} hint={`${rates.length} override${rates.length === 1 ? '' : 's'}`} />
            </div>

            <div style={{ display: 'flex', gap: 4, marginBottom: 16, flexWrap: 'wrap' }}>
                {TABS.map(([id, label]) => (
                    <button key={id} onClick={() => setTab(id)} style={{
                        padding: '7px 13px', borderRadius: 'var(--ox-radius-full)', cursor: 'pointer', fontSize: 'var(--ox-text-sm)', fontWeight: 600,
                        border: '1px solid ' + (tab === id ? 'transparent' : 'var(--ox-border)'),
                        background: tab === id ? 'var(--ox-primary-subtle)' : 'transparent',
                        color: tab === id ? 'var(--ox-green-700)' : 'var(--ox-text-muted)',
                    }}>{label}</button>
                ))}
            </div>

            {tab === 'overview' && <OverviewTab client={client} />}
            {tab === 'usage' && <UsageTab perModel={perModel} visibility={client.model_visibility} />}
            {tab === 'rates' && <RatesTab client={client} rates={rates} catalog={catalog} />}
            {tab === 'charges' && <ChargesTab client={client} charges={charges} catalog={catalog} />}
            {tab === 'people' && <PeopleTab client={client} staff={staff} accessKeys={accessKeys} sources={sources} />}
            {tab === 'billing' && <BillingTab client={client} ledger={ledger} topUps={topUps} cards={cards} />}
            {tab === 'activity' && <ActivityTab audit={audit} />}
        </AdminLayout>
    );
}

/* ------------------------------------ Overview / settings ----------------------------------- */

function OverviewTab({ client }: { client: Client }) {
    const form = useForm({
        name: client.name, company: client.company ?? '', contact_email: client.contact_email ?? '', notes: client.notes ?? '',
        status: client.status, model_visibility: client.model_visibility,
        default_markup_bps: client.markup_bps, min_balance_cents: client.min_cents,
        topup_amount_cents: client.topup_cents, debt_limit_cents: client.debt_limit_cents, auto_topup: client.auto_topup,
    });
    const [adjust, setAdjust] = useState({ amount: '', dir: 1, reason: '' });
    const [confirmDelete, setConfirmDelete] = useState(false);

    return (
        <>
            <Section title="Profile & commercial terms" hint="Everything the client is, and everything they're charged on.">
                <form onSubmit={(e) => { e.preventDefault(); form.patch(`/admin/clients/${client.id}`, { preserveScroll: true }); }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
                        <label><Lbl>Account name</Lbl><input style={input} value={form.data.name} onChange={(e) => form.setData('name', e.target.value)} /></label>
                        <label><Lbl>Company</Lbl><input style={input} value={form.data.company} onChange={(e) => form.setData('company', e.target.value)} /></label>
                        <label><Lbl>Billing email</Lbl><input style={input} type="email" value={form.data.contact_email} onChange={(e) => form.setData('contact_email', e.target.value)} /></label>
                        <label><Lbl>Status</Lbl>
                            <select style={input} value={form.data.status} onChange={(e) => form.setData('status', e.target.value)}>
                                <option value="active">Active</option><option value="suspended">Suspended</option>
                            </select>
                        </label>

                        <label><Lbl>Default markup</Lbl>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <input style={{ ...input, ...mono }} type="number" step="0.01"
                                    value={form.data.default_markup_bps / 100}
                                    onChange={(e) => form.setData('default_markup_bps', Math.round(Number(e.target.value) * 100))} />
                                <span style={{ color: 'var(--ox-text-subtle)' }}>%</span>
                            </div>
                        </label>
                        <label><Lbl>Low-balance threshold</Lbl>
                            <input style={{ ...input, ...mono }} type="number" value={form.data.min_balance_cents / 100}
                                onChange={(e) => form.setData('min_balance_cents', Math.round(Number(e.target.value) * 100))} />
                        </label>
                        <label><Lbl>Top-up amount</Lbl>
                            <input style={{ ...input, ...mono }} type="number" value={form.data.topup_amount_cents / 100}
                                onChange={(e) => form.setData('topup_amount_cents', Math.round(Number(e.target.value) * 100))} />
                        </label>
                        <label><Lbl>Debt limit (gateway refuses below −this)</Lbl>
                            <input style={{ ...input, ...mono }} type="number" value={form.data.debt_limit_cents / 100}
                                onChange={(e) => form.setData('debt_limit_cents', Math.round(Number(e.target.value) * 100))} />
                        </label>
                    </div>

                    <div style={{ marginTop: 16, padding: 14, borderRadius: 'var(--ox-radius-md)', background: 'var(--ox-bg-subtle)', border: '1px solid var(--ox-border)' }}>
                        <Lbl>What this client sees in their portal</Lbl>
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 4 }}>
                            {([
                                ['aliased', 'Tier names', '“OpenAI Premium” — hides which model ran'],
                                ['provider_only', 'Provider only', '“OpenAI” — hides the tier too'],
                                ['exact', 'Exact models', '“gpt-5.4” — full disclosure'],
                            ] as const).map(([val, label, hint]) => (
                                <button key={val} type="button" onClick={() => form.setData('model_visibility', val)} style={{
                                    textAlign: 'left', padding: '9px 12px', borderRadius: 'var(--ox-radius-md)', cursor: 'pointer', flex: '1 1 200px',
                                    border: '1px solid ' + (form.data.model_visibility === val ? 'var(--ox-primary)' : 'var(--ox-border)'),
                                    background: form.data.model_visibility === val ? 'var(--ox-primary-subtle)' : 'var(--ox-surface)',
                                }}>
                                    <div style={{ fontSize: 'var(--ox-text-sm)', fontWeight: 600 }}>{label}</div>
                                    <div style={{ fontSize: 11.5, color: 'var(--ox-text-subtle)', marginTop: 2 }}>{hint}</div>
                                </button>
                            ))}
                        </div>
                    </div>

                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 14, fontSize: 'var(--ox-text-sm)' }}>
                        <input type="checkbox" checked={form.data.auto_topup} onChange={(e) => form.setData('auto_topup', e.target.checked)} />
                        Auto top-up when the balance falls below the threshold
                    </label>

                    <label style={{ display: 'block', marginTop: 14 }}>
                        <Lbl>Internal notes (never shown to the client)</Lbl>
                        <textarea rows={3} style={{ ...input, height: 'auto', padding: 9, resize: 'vertical' }}
                            value={form.data.notes} onChange={(e) => form.setData('notes', e.target.value)} />
                    </label>

                    <div style={{ marginTop: 14 }}>
                        <Button type="submit" size="sm" disabled={form.processing}>{form.processing ? 'Saving…' : 'Save changes'}</Button>
                        {form.recentlySuccessful && <span style={{ marginLeft: 10, fontSize: 12.5, color: 'var(--ox-success)' }}>Saved</span>}
                    </div>
                </form>
            </Section>

            <Section title="Adjust balance" hint="Writes a signed ledger entry. Use for goodwill credits, refunds or corrections.">
                <div style={{ display: 'flex', gap: 10, alignItems: 'end', flexWrap: 'wrap' }}>
                    <label style={{ width: 130 }}><Lbl>Amount ($)</Lbl>
                        <input style={{ ...input, ...mono }} value={adjust.amount} onChange={(e) => setAdjust({ ...adjust, amount: e.target.value })} placeholder="25.00" />
                    </label>
                    <div style={{ display: 'flex', gap: 6 }}>
                        <Button size="sm" variant={adjust.dir === 1 ? 'primary' : 'secondary'} onClick={() => setAdjust({ ...adjust, dir: 1 })}>Credit</Button>
                        <Button size="sm" variant={adjust.dir === -1 ? 'danger' : 'secondary'} onClick={() => setAdjust({ ...adjust, dir: -1 })}>Debit</Button>
                    </div>
                    <label style={{ flex: 1, minWidth: 180 }}><Lbl>Reason</Lbl>
                        <input style={input} value={adjust.reason} onChange={(e) => setAdjust({ ...adjust, reason: e.target.value })} placeholder="Goodwill credit — outage on 3 Jul" />
                    </label>
                    <Button size="sm" disabled={!adjust.amount}
                        onClick={() => router.post(`/admin/clients/${client.id}/balance`, { amount: Number(adjust.amount) * adjust.dir, reason: adjust.reason }, {
                            preserveScroll: true, onSuccess: () => setAdjust({ amount: '', dir: 1, reason: '' }),
                        })}>Apply</Button>
                </div>
            </Section>

            <Section title="Danger zone" hint="Deleting a client removes its users, keys, usage history and ledger. This cannot be undone.">
                {!confirmDelete ? (
                    <Button size="sm" variant="danger" onClick={() => setConfirmDelete(true)}>Delete {client.name}</Button>
                ) : (
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                        <Icon name="alert-triangle" size={16} color="var(--ox-danger)" />
                        <span style={{ fontSize: 'var(--ox-text-sm)' }}>Permanently delete <strong>{client.name}</strong> and all of its data?</span>
                        <Button size="sm" variant="danger" onClick={() => router.delete(`/admin/clients/${client.id}`)}>Yes, delete</Button>
                        <Button size="sm" variant="ghost" onClick={() => setConfirmDelete(false)}>Cancel</Button>
                    </div>
                )}
            </Section>
        </>
    );
}

/* --------------------------------------- Usage & margin ------------------------------------- */

function UsageTab({ perModel, visibility }: { perModel: PerModel[]; visibility: string }) {
    return (
        <Section
            title="Usage by model — month to date"
            hint={`True model, true margin. The “client sees” column is exactly what their portal renders (visibility: ${visibility}).`}
        >
            {perModel.length === 0 ? (
                <p style={{ color: 'var(--ox-text-subtle)', fontSize: 'var(--ox-text-sm)' }}>No usage this month.</p>
            ) : (
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 940 }}>
                        <thead><tr>
                            <th style={th}>Model (real)</th><th style={th}>Client sees</th>
                            <th style={{ ...th, textAlign: 'right' }}>In / Out tokens</th>
                            <th style={{ ...th, textAlign: 'right' }}>Requests</th>
                            <th style={{ ...th, textAlign: 'right' }}>Revenue</th>
                            <th style={{ ...th, textAlign: 'right' }}>Cost</th>
                            <th style={{ ...th, textAlign: 'right' }}>Margin</th>
                            <th style={th}>Rate applied</th>
                        </tr></thead>
                        <tbody>
                            {perModel.map((m) => (
                                <tr key={`${m.provider}/${m.model}`}>
                                    <td style={{ ...td, ...mono, fontSize: 12.5 }}>{m.model}
                                        <div style={{ fontFamily: 'var(--ox-font-sans)', fontSize: 11, color: 'var(--ox-text-subtle)' }}>{m.provider_label}</div>
                                    </td>
                                    <td style={td}><Badge tone="brand" dot={false}>{m.client_sees}</Badge></td>
                                    <td style={{ ...td, textAlign: 'right', ...mono, fontSize: 12.5 }}>{tokens(m.input_tokens)} / {tokens(m.output_tokens)}</td>
                                    <td style={{ ...td, textAlign: 'right', ...mono }}>{num(m.requests)}</td>
                                    <td style={{ ...td, textAlign: 'right', ...mono }}>{money(m.revenue_cents)}</td>
                                    <td style={{ ...td, textAlign: 'right', ...mono, color: 'var(--ox-text-subtle)' }}>{money(m.cost_cents)}</td>
                                    <td style={{ ...td, textAlign: 'right', ...mono, fontWeight: 600, color: m.margin_cents < 0 ? 'var(--ox-danger)' : 'var(--ox-success)' }}>
                                        {money(m.margin_cents)}
                                        {m.effective_markup_bps !== null && <div style={{ fontSize: 10.5, fontWeight: 400, color: 'var(--ox-text-subtle)' }}>{bps(m.effective_markup_bps)}</div>}
                                    </td>
                                    <td style={td}>
                                        <span style={{ fontSize: 12.5 }}>{m.rate_label}</span>
                                        <div style={{ fontSize: 10.5, color: 'var(--ox-text-subtle)' }}>{m.rate_origin.replace('_', ' ')}</div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </Section>
    );
}

/* ------------------------------------------ Rate card --------------------------------------- */

function RatesTab({ client, rates, catalog }: { client: Client; rates: Rate[]; catalog: Props['catalog'] }) {
    const [mode, setMode] = useState<'markup' | 'fixed'>('markup');
    const form = useForm<{ client_id: number; provider: string; model: string; pricing_mode: string; markup_bps: number; input_usd_per_million: string; output_usd_per_million: string; per_request_fee_cents: number; min_margin_bps: string; note: string }>({
        client_id: client.id, provider: '', model: '', pricing_mode: 'markup',
        markup_bps: 2500, input_usd_per_million: '', output_usd_per_million: '',
        per_request_fee_cents: 0, min_margin_bps: '', note: '',
    });

    const chosen = catalog.find((c) => c.model === form.data.model);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        // transform() returns void in Inertia 3 — set it, then submit.
        form.transform((d) => ({
            ...d, pricing_mode: mode,
            provider: d.provider || chosen?.provider || '',
            min_margin_bps: d.min_margin_bps === '' ? null : Number(d.min_margin_bps),
            input_usd_per_million: d.input_usd_per_million === '' ? null : Number(d.input_usd_per_million),
            output_usd_per_million: d.output_usd_per_million === '' ? null : Number(d.output_usd_per_million),
        }));
        form.post('/admin/rates', { preserveScroll: true, onSuccess: () => form.reset('model', 'note') });
    };

    return (
        <>
            <Section title="Rate overrides" hint={`Anything not overridden bills at this client's default markup of ${bps(client.markup_bps)}. Most specific rule wins.`}>
                {rates.length === 0 ? (
                    <p style={{ color: 'var(--ox-text-subtle)', fontSize: 'var(--ox-text-sm)' }}>No overrides — every model bills at the default markup.</p>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead><tr><th style={th}>Scope</th><th style={th}>Price</th><th style={th}>Guards</th><th style={th}>Note</th><th style={{ ...th, textAlign: 'right' }}></th></tr></thead>
                        <tbody>
                            {rates.map((r) => (
                                <tr key={r.id}>
                                    <td style={{ ...td, ...mono, fontSize: 12.5 }}>{r.model ?? (r.provider ? `all ${r.provider} models` : 'all models')}</td>
                                    <td style={td}><Badge tone={r.mode === 'fixed' ? 'info' : 'brand'} dot={false}>{r.label}</Badge></td>
                                    <td style={{ ...td, fontSize: 12, color: 'var(--ox-text-subtle)' }}>
                                        {r.min_margin_bps ? `floor ${bps(r.min_margin_bps)}` : '—'}
                                    </td>
                                    <td style={{ ...td, fontSize: 12, color: 'var(--ox-text-subtle)' }}>{r.note ?? '—'}</td>
                                    <td style={{ ...td, textAlign: 'right' }}>
                                        <Button size="sm" variant="ghost" onClick={() => router.post('/admin/rates/delete', { id: r.id }, { preserveScroll: true })}>Remove</Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </Section>

            <Section title="Add an override" hint="Mark up the provider's cost, or set your own absolute sell price and stop caring what it costs.">
                <form onSubmit={submit}>
                    <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
                        {([['markup', 'Markup over cost'], ['fixed', 'Fixed sell price']] as const).map(([m, label]) => (
                            <button key={m} type="button" onClick={() => setMode(m)} style={{
                                padding: '7px 13px', borderRadius: 'var(--ox-radius-full)', cursor: 'pointer', fontSize: 'var(--ox-text-sm)', fontWeight: 600,
                                border: '1px solid ' + (mode === m ? 'transparent' : 'var(--ox-border)'),
                                background: mode === m ? 'var(--ox-primary-subtle)' : 'transparent',
                                color: mode === m ? 'var(--ox-green-700)' : 'var(--ox-text-muted)',
                            }}>{label}</button>
                        ))}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 12, alignItems: 'end' }}>
                        <label><Lbl>Applies to</Lbl>
                            <select style={input} value={form.data.model} onChange={(e) => form.setData('model', e.target.value)}>
                                <option value="">All models</option>
                                {catalog.map((c) => <option key={`${c.provider}/${c.model}`} value={c.model}>{c.model}</option>)}
                            </select>
                        </label>

                        {mode === 'markup' ? (
                            <label><Lbl>Markup %</Lbl>
                                <input style={{ ...input, ...mono }} type="number" step="0.01" value={form.data.markup_bps / 100}
                                    onChange={(e) => form.setData('markup_bps', Math.round(Number(e.target.value) * 100))} />
                            </label>
                        ) : (
                            <>
                                <label><Lbl>Sell input $/1M</Lbl>
                                    <input style={{ ...input, ...mono }} value={form.data.input_usd_per_million}
                                        onChange={(e) => form.setData('input_usd_per_million', e.target.value)}
                                        placeholder={chosen ? String(chosen.in * 1.25) : '3.00'} />
                                </label>
                                <label><Lbl>Sell output $/1M</Lbl>
                                    <input style={{ ...input, ...mono }} value={form.data.output_usd_per_million}
                                        onChange={(e) => form.setData('output_usd_per_million', e.target.value)}
                                        placeholder={chosen ? String(chosen.out * 1.25) : '12.00'} />
                                </label>
                            </>
                        )}

                        <label><Lbl>Per-request fee (¢)</Lbl>
                            <input style={{ ...input, ...mono }} type="number" min={0} value={form.data.per_request_fee_cents}
                                onChange={(e) => form.setData('per_request_fee_cents', Number(e.target.value))} />
                        </label>
                        <label><Lbl>Min margin % (floor)</Lbl>
                            <input style={{ ...input, ...mono }} type="number" step="0.01" placeholder="optional"
                                value={form.data.min_margin_bps === '' ? '' : Number(form.data.min_margin_bps) / 100}
                                onChange={(e) => form.setData('min_margin_bps', e.target.value === '' ? '' : String(Math.round(Number(e.target.value) * 100)))} />
                        </label>
                        <label><Lbl>Note</Lbl><input style={input} value={form.data.note} onChange={(e) => form.setData('note', e.target.value)} placeholder="Negotiated Q3" /></label>
                        <Button type="submit" size="sm" disabled={form.processing}>Add override</Button>
                    </div>

                    {chosen && (
                        <p style={{ marginTop: 12, fontSize: 'var(--ox-text-xs)', color: 'var(--ox-text-subtle)', ...mono }}>
                            {chosen.model} costs you ${chosen.in.toFixed(2)} in / ${chosen.out.toFixed(2)} out per 1M.
                            {mode === 'markup'
                                ? ` At ${bps(form.data.markup_bps)} you'd sell at $${(chosen.in * (1 + form.data.markup_bps / 10000)).toFixed(2)} / $${(chosen.out * (1 + form.data.markup_bps / 10000)).toFixed(2)}.`
                                : form.data.input_usd_per_million && ` Margin: ${(((Number(form.data.input_usd_per_million) - chosen.in) / (chosen.in || 1)) * 100).toFixed(0)}% on input.`}
                        </p>
                    )}
                    <p style={{ marginTop: 8, fontSize: 'var(--ox-text-xs)', color: 'var(--ox-text-subtle)' }}>
                        A <strong>min margin floor</strong> guarantees you never bill below cost × (1 + floor), even if a provider raises prices before you notice.
                    </p>
                </form>
            </Section>
        </>
    );
}

/* ------------------------------------------- Charges ---------------------------------------- */

function ChargesTab({ client, charges, catalog }: { client: Client; charges: Charge[]; catalog: Props['catalog'] }) {
    const [kind, setKind] = useState<'fee' | 'usage'>('fee');
    const form = useForm<Record<string, string | number>>({
        client_id: client.id, kind: 'fee', cadence: 'monthly', name: '',
        amount_cents: 0, provider: '', model: '', input_tokens: 0, output_tokens: 0,
    });

    const chosen = catalog.find((c) => c.model === form.data.model);
    const estCost = chosen ? (Number(form.data.input_tokens) / 1e6) * chosen.in + (Number(form.data.output_tokens) / 1e6) * chosen.out : 0;
    const estBilled = estCost * (1 + client.markup_bps / 10000);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        form.transform((d) => ({ ...d, kind, provider: d.provider || chosen?.provider || '' }));
        form.post('/admin/charges', { preserveScroll: true, onSuccess: () => form.reset('name', 'amount_cents', 'input_tokens', 'output_tokens') });
    };

    return (
        <>
            <Section title="Charges" hint="Recurring fees, one-off credits, and off-platform AI cost billed through the rate card.">
                {charges.length === 0 ? (
                    <p style={{ color: 'var(--ox-text-subtle)', fontSize: 'var(--ox-text-sm)' }}>No charges configured.</p>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead><tr><th style={th}>Name</th><th style={th}>Type</th><th style={th}>Cadence</th><th style={{ ...th, textAlign: 'right' }}>Amount</th><th style={th}>Last billed</th><th style={{ ...th, textAlign: 'right' }}></th></tr></thead>
                        <tbody>
                            {charges.map((c) => (
                                <tr key={c.id} style={!c.active ? { opacity: 0.55 } : undefined}>
                                    <td style={{ ...td, fontWeight: 600 }}>{c.name}
                                        {c.kind === 'usage' && <div style={{ fontSize: 11, fontWeight: 400, color: 'var(--ox-text-subtle)', ...mono }}>{c.model} · {tokens(c.input_tokens)} in / {tokens(c.output_tokens)} out</div>}
                                    </td>
                                    <td style={td}>
                                        <Badge tone={c.kind === 'usage' ? 'info' : c.amount_cents < 0 ? 'success' : 'neutral'} dot={false}>
                                            {c.kind === 'usage' ? 'Shows as usage' : c.amount_cents < 0 ? 'Credit' : 'Fee'}
                                        </Badge>
                                    </td>
                                    <td style={{ ...td, fontSize: 12.5 }}>{c.cadence}</td>
                                    <td style={{ ...td, textAlign: 'right', ...mono }}>{c.kind === 'usage' && c.amount_cents === 0 ? 'rate card' : money(c.amount_cents)}</td>
                                    <td style={{ ...td, fontSize: 12, color: 'var(--ox-text-subtle)' }}>{c.last_run ?? 'never'} · {c.runs} run{c.runs === 1 ? '' : 's'}</td>
                                    <td style={{ ...td, textAlign: 'right', whiteSpace: 'nowrap' }}>
                                        {c.cadence !== 'once' && <Button size="sm" variant="ghost" onClick={() => router.post(`/admin/charges/${c.id}/run`, {}, { preserveScroll: true })}>Bill now</Button>}
                                        <Button size="sm" variant="ghost" onClick={() => router.delete(`/admin/charges/${c.id}`, { preserveScroll: true })}>
                                            <Icon name="trash" size={13} color="var(--ox-danger)" />
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </Section>

            <Section title="Add a charge">
                <form onSubmit={submit}>
                    <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
                        {([['fee', 'Fee or credit'], ['usage', 'AI cost (shows as token usage)']] as const).map(([k, label]) => (
                            <button key={k} type="button" onClick={() => setKind(k)} style={{
                                padding: '7px 13px', borderRadius: 'var(--ox-radius-full)', cursor: 'pointer', fontSize: 'var(--ox-text-sm)', fontWeight: 600,
                                border: '1px solid ' + (kind === k ? 'transparent' : 'var(--ox-border)'),
                                background: kind === k ? 'var(--ox-primary-subtle)' : 'transparent',
                                color: kind === k ? 'var(--ox-green-700)' : 'var(--ox-text-muted)',
                            }}>{label}</button>
                        ))}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 12, alignItems: 'end' }}>
                        <label><Lbl>Name (shown on their statement)</Lbl>
                            <input style={input} value={String(form.data.name)} onChange={(e) => form.setData('name', e.target.value)}
                                placeholder={kind === 'fee' ? 'Platform fee' : 'Batch processing'} />
                        </label>
                        <label><Lbl>Cadence</Lbl>
                            <select style={input} value={String(form.data.cadence)} onChange={(e) => form.setData('cadence', e.target.value)}>
                                <option value="once">One-off (bills now)</option>
                                <option value="daily">Daily</option>
                                <option value="monthly">Monthly</option>
                            </select>
                        </label>

                        {kind === 'fee' ? (
                            <label><Lbl>Amount ($) — negative for a credit</Lbl>
                                <input style={{ ...input, ...mono }} type="number" step="0.01"
                                    value={Number(form.data.amount_cents) / 100}
                                    onChange={(e) => form.setData('amount_cents', Math.round(Number(e.target.value) * 100))} />
                            </label>
                        ) : (
                            <>
                                <label><Lbl>Model</Lbl>
                                    <select style={input} value={String(form.data.model)} onChange={(e) => form.setData('model', e.target.value)}>
                                        <option value="">Select…</option>
                                        {catalog.map((c) => <option key={`${c.provider}/${c.model}`} value={c.model}>{c.model}</option>)}
                                    </select>
                                </label>
                                <label><Lbl>Input tokens</Lbl>
                                    <input style={{ ...input, ...mono }} type="number" min={0} value={Number(form.data.input_tokens)}
                                        onChange={(e) => form.setData('input_tokens', Number(e.target.value))} />
                                </label>
                                <label><Lbl>Output tokens</Lbl>
                                    <input style={{ ...input, ...mono }} type="number" min={0} value={Number(form.data.output_tokens)}
                                        onChange={(e) => form.setData('output_tokens', Number(e.target.value))} />
                                </label>
                            </>
                        )}
                        <Button type="submit" size="sm" disabled={form.processing}>Add charge</Button>
                    </div>

                    {kind === 'usage' && chosen && (Number(form.data.input_tokens) > 0 || Number(form.data.output_tokens) > 0) && (
                        <p style={{ marginTop: 12, fontSize: 'var(--ox-text-xs)', ...mono, color: 'var(--ox-text-subtle)' }}>
                            Costs you {money(Math.round(estCost * 100))} · bills them {money(Math.round(estBilled * 100))} at their {bps(client.markup_bps)} markup
                            · margin {money(Math.round((estBilled - estCost) * 100))}
                        </p>
                    )}

                    {kind === 'usage' && (
                        <p style={{ marginTop: 10, fontSize: 'var(--ox-text-xs)', color: 'var(--ox-text-subtle)', maxWidth: 700 }}>
                            <Icon name="alert-triangle" size={12} color="var(--ox-warning)" style={{ verticalAlign: -1, marginRight: 4 }} />
                            This writes a real usage record the client sees as token usage in their dashboard. It's stamped
                            <code style={{ margin: '0 3px' }}>source=manual</code> with your name, so any line can be traced back.
                            Use it for AI cost you actually incurred on their behalf.
                        </p>
                    )}
                </form>
            </Section>
        </>
    );
}

/* --------------------------------------- People & access ------------------------------------ */

function PeopleTab({ client, staff, accessKeys, sources }: { client: Client; staff: Staff[]; accessKeys: Props['accessKeys']; sources: Props['sources'] }) {
    const form = useForm({ name: '', email: '', role: 'member' });
    const keyForm = useForm({ client_id: client.id, name: '' });

    return (
        <>
            <Section title="People" hint="Everyone who can sign in to this client's portal.">
                <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 16 }}>
                    <thead><tr><th style={th}>Name</th><th style={th}>Email</th><th style={th}>Role</th><th style={th}>Last seen</th><th style={{ ...th, textAlign: 'right' }}></th></tr></thead>
                    <tbody>
                        {staff.map((u) => (
                            <tr key={u.id}>
                                <td style={{ ...td, fontWeight: 600 }}>{u.name}</td>
                                <td style={{ ...td, ...mono, fontSize: 12.5 }}>{u.email}</td>
                                <td style={td}><Badge tone={u.role === 'owner' ? 'brand' : 'neutral'}>{u.role}</Badge></td>
                                <td style={{ ...td, fontSize: 12.5, color: 'var(--ox-text-subtle)' }}>{u.last_login}</td>
                                <td style={{ ...td, textAlign: 'right', whiteSpace: 'nowrap' }}>
                                    <Button size="sm" variant="ghost" onClick={() => router.post(`/admin/clients/${client.id}/staff/${u.id}/invite`, {}, { preserveScroll: true })}>Resend invite</Button>
                                    <Button size="sm" variant="ghost" onClick={() => router.delete(`/admin/clients/${client.id}/staff/${u.id}`, { preserveScroll: true })}>
                                        <Icon name="trash" size={13} color="var(--ox-danger)" />
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <form onSubmit={(e) => { e.preventDefault(); form.post(`/admin/clients/${client.id}/staff`, { preserveScroll: true, onSuccess: () => form.reset() }); }}
                    style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, alignItems: 'end' }}>
                    <label><Lbl>Name</Lbl><input style={input} value={form.data.name} onChange={(e) => form.setData('name', e.target.value)} /></label>
                    <label><Lbl>Email</Lbl><input style={input} type="email" value={form.data.email} onChange={(e) => form.setData('email', e.target.value)} />
                        {form.errors.email && <span style={{ fontSize: 11.5, color: 'var(--ox-danger)' }}>{form.errors.email}</span>}
                    </label>
                    <label><Lbl>Role</Lbl>
                        <select style={input} value={form.data.role} onChange={(e) => form.setData('role', e.target.value)}>
                            <option value="member">Member</option><option value="owner">Owner</option>
                        </select>
                    </label>
                    <Button type="submit" size="sm" disabled={form.processing}>Add & invite</Button>
                </form>
            </Section>

            <Section title="Gateway keys" hint="What the client calls the API with. Shown once at creation."
                right={
                    <form onSubmit={(e) => { e.preventDefault(); keyForm.post('/admin/platform/access-keys', { preserveScroll: true, onSuccess: () => keyForm.reset('name') }); }}
                        style={{ display: 'flex', gap: 8 }}>
                        <input style={{ ...input, width: 150 }} placeholder="Key name" value={keyForm.data.name} onChange={(e) => keyForm.setData('name', e.target.value)} />
                        <Button type="submit" size="sm" disabled={!keyForm.data.name}>Issue key</Button>
                    </form>
                }>
                {accessKeys.length === 0 ? <p style={{ color: 'var(--ox-text-subtle)', fontSize: 'var(--ox-text-sm)' }}>No gateway keys yet.</p> : (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead><tr><th style={th}>Name</th><th style={th}>Key</th><th style={th}>Status</th><th style={th}>Last used</th><th style={{ ...th, textAlign: 'right' }}></th></tr></thead>
                        <tbody>
                            {accessKeys.map((k) => (
                                <tr key={k.id}>
                                    <td style={{ ...td, fontWeight: 600 }}>{k.name}</td>
                                    <td style={{ ...td, ...mono, fontSize: 12.5 }}>{k.frag}</td>
                                    <td style={td}><Badge tone={k.status === 'active' ? 'success' : 'neutral'}>{k.status}</Badge></td>
                                    <td style={{ ...td, fontSize: 12.5, color: 'var(--ox-text-subtle)' }}>{k.last_used}</td>
                                    <td style={{ ...td, textAlign: 'right' }}>
                                        {k.status === 'active' && <Button size="sm" variant="ghost" onClick={() => router.delete(`/admin/platform/access-keys/${k.id}`, { preserveScroll: true })}>Revoke</Button>}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </Section>

            {sources.length > 0 && (
                <Section title="Attributed provider projects" hint="Usage pulled from these projects bills to this client.">
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead><tr><th style={th}>Label</th><th style={th}>Provider</th><th style={th}>Project</th><th style={th}>Status</th><th style={{ ...th, textAlign: 'right' }}>Revenue MTD</th><th style={th}>Synced</th></tr></thead>
                        <tbody>
                            {sources.map((s) => (
                                <tr key={s.id}>
                                    <td style={{ ...td, fontWeight: 600 }}>{s.label}</td>
                                    <td style={td}>{s.provider}</td>
                                    <td style={{ ...td, ...mono, fontSize: 12 }}>{s.project ?? '—'}</td>
                                    <td style={td}><Badge tone={s.status === 'active' ? 'success' : 'neutral'}>{s.status}</Badge></td>
                                    <td style={{ ...td, textAlign: 'right', ...mono }}>{money(s.revenue_cents)}</td>
                                    <td style={{ ...td, fontSize: 12.5, color: 'var(--ox-text-subtle)' }}>{s.synced}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </Section>
            )}
        </>
    );
}

/* ------------------------------------------- Billing ---------------------------------------- */

function BillingTab({ client, ledger, topUps, cards }: { client: Client; ledger: Props['ledger']; topUps: Props['topUps']; cards: Props['cards'] }) {
    return (
        <>
            <Section title="Payment methods" hint={client.billings_customer_id ? `billings customer ${client.billings_customer_id}` : 'Not yet linked to billings.systems'}>
                {cards.length === 0 ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--ox-warning)', fontSize: 'var(--ox-text-sm)' }}>
                        <Icon name="alert-triangle" size={15} color="var(--ox-warning)" /> No card on file — auto top-up cannot run.
                    </div>
                ) : cards.map((c) => (
                    <div key={c.last4} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0' }}>
                        <Icon name="credit-card" size={16} color="var(--ox-text-subtle)" />
                        <span style={mono}>{c.brand} •••• {c.last4}</span>
                        <span style={{ color: 'var(--ox-text-subtle)', fontSize: 12.5 }}>exp {c.exp}</span>
                        {c.default && <Badge tone="brand">default</Badge>}
                    </div>
                ))}
            </Section>

            <Section title="Top-ups">
                {topUps.length === 0 ? <p style={{ color: 'var(--ox-text-subtle)', fontSize: 'var(--ox-text-sm)' }}>No top-ups yet.</p> : (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead><tr><th style={th}>Date</th><th style={{ ...th, textAlign: 'right' }}>Amount</th><th style={th}>Trigger</th><th style={th}>Status</th></tr></thead>
                        <tbody>
                            {topUps.map((t, i) => (
                                <tr key={i}>
                                    <td style={td}>{t.date}</td>
                                    <td style={{ ...td, textAlign: 'right', ...mono }}>{money(t.amount_cents)}</td>
                                    <td style={{ ...td, fontSize: 12.5 }}>{t.trigger}</td>
                                    <td style={td}>
                                        <Badge tone={t.status === 'succeeded' ? 'success' : t.status === 'failed' ? 'danger' : 'warning'}>{t.status}</Badge>
                                        {t.reason && <div style={{ fontSize: 11, color: 'var(--ox-danger)' }}>{t.reason}</div>}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </Section>

            <Section title="Ledger" hint="Every movement on this account, newest first.">
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead><tr><th style={th}>Date</th><th style={th}>Type</th><th style={th}>Description</th><th style={{ ...th, textAlign: 'right' }}>Amount</th><th style={{ ...th, textAlign: 'right' }}>Balance</th></tr></thead>
                    <tbody>
                        {ledger.map((e, i) => (
                            <tr key={i}>
                                <td style={{ ...td, whiteSpace: 'nowrap', fontSize: 12.5 }}>{e.date}</td>
                                <td style={{ ...td, fontSize: 12.5, color: 'var(--ox-text-subtle)' }}>{e.type}</td>
                                <td style={{ ...td, fontSize: 12.5 }}>{e.desc ?? '—'}</td>
                                <td style={{ ...td, textAlign: 'right', ...mono, color: e.amount_cents >= 0 ? 'var(--ox-success)' : 'var(--ox-text)' }}>{money(e.amount_cents, { sign: true })}</td>
                                <td style={{ ...td, textAlign: 'right', ...mono, color: 'var(--ox-text-subtle)' }}>{money(e.balance_after_cents)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </Section>
        </>
    );
}

function ActivityTab({ audit }: { audit: Props['audit'] }) {
    return (
        <Section title="Activity" hint="Privileged actions taken on this account, including impersonation.">
            {audit.length === 0 ? <p style={{ color: 'var(--ox-text-subtle)', fontSize: 'var(--ox-text-sm)' }}>Nothing yet.</p> : (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead><tr><th style={th}>When</th><th style={th}>Action</th><th style={th}>Actor</th><th style={th}>Detail</th></tr></thead>
                    <tbody>
                        {audit.map((a, i) => (
                            <tr key={i}>
                                <td style={{ ...td, whiteSpace: 'nowrap', fontSize: 12.5 }}>{a.at}</td>
                                <td style={{ ...td, ...mono, fontSize: 12 }}>{a.action}</td>
                                <td style={{ ...td, fontSize: 12.5 }}>{a.actor}</td>
                                <td style={{ ...td, fontSize: 12.5, color: 'var(--ox-text-subtle)' }}>{a.summary ?? '—'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </Section>
    );
}
