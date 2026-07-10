import { useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import AdminLayout from '@/layouts/admin-layout';
import { Card, Badge, Button, Icon } from '@/components/oe';
import { money, tokens } from '@/lib/format';

type Backend = { id: number; provider: string; backend: string; label: string; project: string; region: string; status: string };
type Key = { id: number; provider: string; project: string; label: string; client: string; client_id: number | null; status: string; revenue_cents: number; records: number; synced: string };
type Proj = { id: string; name: string; status: string; assigned_client_id: number | null; assigned_client: string | null; label: string | null; key_status: string | null; tokens: number; series: number[] };
type AccessKey = { id: number; name: string; frag: string; status: string; client: string | null; client_id: number | null; last_used: string };

type Props = {
    backends: Backend[]; keys: Key[]; discovery: Proj[]; discoveredAt: string | null; openaiReady: boolean;
    clientOptions: { id: number; name: string }[]; accessKeys: AccessKey[];
    lastPull: { at: string } | null; lastCharges: { at: string } | null;
    newAccessKey?: { name: string; client: string; secret: string } | null;
};

const th: React.CSSProperties = { textAlign: 'left', padding: '9px 10px', fontSize: 11, fontWeight: 600, color: 'var(--ox-text-subtle)', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid var(--ox-border)' };
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

export default function Platform({ backends, keys, discovery, discoveredAt, openaiReady, clientOptions, accessKeys, lastPull, lastCharges, newAccessKey }: Props) {
    const [addingBackend, setAddingBackend] = useState(false);
    const [assign, setAssign] = useState<{ id: string; client_id: string; label: string } | null>(null);
    const backendForm = useForm({ provider: 'openai', backend: 'openai', label: '', secret: '', project_id: '', region: '' });

    return (
        <AdminLayout
            active="platform"
            title="Platform"
            subtitle="Your upstream provider credentials, per-client attribution, and metering jobs"
            actions={<>
                <Button size="sm" variant="secondary" onClick={() => router.post('/admin/platform/rebill', {}, { preserveScroll: true })}>Re-bill $0 usage</Button>
                <Button size="sm" leadingIcon={<Icon name="refresh-cw" size={15} />} onClick={() => router.post('/admin/platform/sync', {}, { preserveScroll: true })}>Pull usage</Button>
            </>}
        >
            <Head title="Admin — Platform" />

            {newAccessKey && (
                <Card padding="md" style={{ marginBottom: 16, borderLeft: '3px solid var(--ox-primary)' }}>
                    <strong style={{ fontSize: 'var(--ox-text-sm)' }}>Gateway key “{newAccessKey.name}” for {newAccessKey.client} — copy it now.</strong>
                    <div style={{ ...mono, marginTop: 8, padding: 10, background: 'var(--ox-bg-muted)', borderRadius: 'var(--ox-radius-sm)', fontSize: 12.5, wordBreak: 'break-all' }}>{newAccessKey.secret}</div>
                </Card>
            )}

            <Section
                title="Provider backends"
                hint="Open Exchange's own upstream credentials — what the gateway calls the providers with."
                right={<Button size="sm" variant="secondary" leadingIcon={<Icon name="plus" size={15} />} onClick={() => setAddingBackend((v) => !v)}>Add backend</Button>}
            >
                {addingBackend && (
                    <form onSubmit={(e) => { e.preventDefault(); backendForm.post('/admin/platform/backends', { preserveScroll: true, onSuccess: () => { backendForm.reset(); setAddingBackend(false); } }); }}
                        style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12, alignItems: 'end', marginBottom: 16, paddingBottom: 16, borderBottom: '1px solid var(--ox-border)' }}>
                        <label><Lbl>Provider</Lbl>
                            <select style={input} value={backendForm.data.provider} onChange={(e) => backendForm.setData('provider', e.target.value)}>
                                <option value="openai">OpenAI</option><option value="google">Google</option>
                            </select>
                        </label>
                        <label><Lbl>Backend</Lbl>
                            <select style={input} value={backendForm.data.backend} onChange={(e) => backendForm.setData('backend', e.target.value)}>
                                <option value="openai">openai</option><option value="aistudio">aistudio</option><option value="vertex">vertex</option>
                            </select>
                        </label>
                        <label><Lbl>Label</Lbl><input style={input} value={backendForm.data.label} onChange={(e) => backendForm.setData('label', e.target.value)} /></label>
                        <label><Lbl>Secret / service-account JSON</Lbl><input style={input} type="password" value={backendForm.data.secret} onChange={(e) => backendForm.setData('secret', e.target.value)} /></label>
                        <label><Lbl>Project (vertex)</Lbl><input style={input} value={backendForm.data.project_id} onChange={(e) => backendForm.setData('project_id', e.target.value)} /></label>
                        <label><Lbl>Region (vertex)</Lbl><input style={input} value={backendForm.data.region} onChange={(e) => backendForm.setData('region', e.target.value)} /></label>
                        <Button type="submit" size="sm" disabled={backendForm.processing}>Save backend</Button>
                    </form>
                )}
                {backends.length === 0 ? (
                    <p style={{ color: 'var(--ox-text-subtle)', fontSize: 'var(--ox-text-sm)' }}>No backends configured — the gateway cannot serve requests.</p>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead><tr><th style={th}>Label</th><th style={th}>Provider</th><th style={th}>Backend</th><th style={th}>Project</th><th style={th}>Region</th><th style={th}>Status</th><th style={{ ...th, textAlign: 'right' }}></th></tr></thead>
                        <tbody>
                            {backends.map((b) => (
                                <tr key={b.id}>
                                    <td style={{ ...td, fontWeight: 600 }}>{b.label}</td>
                                    <td style={td}>{b.provider}</td>
                                    <td style={{ ...td, ...mono, fontSize: 12.5 }}>{b.backend}</td>
                                    <td style={{ ...td, ...mono, fontSize: 12 }}>{b.project}</td>
                                    <td style={{ ...td, ...mono, fontSize: 12 }}>{b.region}</td>
                                    <td style={td}><Badge tone={b.status === 'active' ? 'success' : 'neutral'}>{b.status}</Badge></td>
                                    <td style={{ ...td, textAlign: 'right' }}>
                                        <Button size="sm" variant="ghost" onClick={() => router.delete(`/admin/platform/backends/${b.id}`, { preserveScroll: true })}>
                                            <Icon name="trash" size={13} color="var(--ox-danger)" />
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </Section>

            <Section
                title="Discovered OpenAI projects"
                hint={openaiReady ? (discoveredAt ? `Last discovered ${discoveredAt}` : 'Run discovery to list your org’s projects') : 'Set OPENAI_ADMIN_KEY to enable discovery'}
                right={<Button size="sm" variant="secondary" disabled={!openaiReady} onClick={() => router.post('/admin/platform/discover', {}, { preserveScroll: true })}>Discover</Button>}
            >
                {discovery.length === 0 ? (
                    <p style={{ color: 'var(--ox-text-subtle)', fontSize: 'var(--ox-text-sm)' }}>No projects discovered yet.</p>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead><tr><th style={th}>Project</th><th style={th}>Assigned to</th><th style={{ ...th, textAlign: 'right' }}>Tokens (30d)</th><th style={th}>Metering</th><th style={{ ...th, textAlign: 'right' }}></th></tr></thead>
                        <tbody>
                            {discovery.map((p) => (
                                <tr key={p.id}>
                                    <td style={td}>
                                        <div style={{ fontWeight: 600 }}>{p.name}</div>
                                        <div style={{ ...mono, fontSize: 11, color: 'var(--ox-text-subtle)' }}>{p.id}</div>
                                    </td>
                                    <td style={td}>
                                        {assign?.id === p.id ? (
                                            <div style={{ display: 'flex', gap: 6 }}>
                                                <select style={{ ...input, width: 150 }} value={assign.client_id} onChange={(e) => setAssign({ ...assign, client_id: e.target.value })}>
                                                    <option value="">Select client…</option>
                                                    {clientOptions.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                                                </select>
                                                <Button size="sm" disabled={!assign.client_id}
                                                    onClick={() => router.post('/admin/platform/assign-project', { client_id: assign.client_id, provider: 'openai', external_project_id: p.id, label: assign.label }, { preserveScroll: true, onSuccess: () => setAssign(null) })}>Save</Button>
                                                <Button size="sm" variant="ghost" onClick={() => setAssign(null)}>Cancel</Button>
                                            </div>
                                        ) : p.assigned_client ? (
                                            <span style={{ fontWeight: 600 }}>{p.assigned_client}</span>
                                        ) : (
                                            <span style={{ color: 'var(--ox-text-subtle)' }}>— unassigned</span>
                                        )}
                                    </td>
                                    <td style={{ ...td, textAlign: 'right', ...mono }}>{tokens(p.tokens)}</td>
                                    <td style={td}>{p.key_status ? <Badge tone={p.key_status === 'active' ? 'success' : 'neutral'}>{p.key_status}</Badge> : <Badge tone="neutral">not metered</Badge>}</td>
                                    <td style={{ ...td, textAlign: 'right', whiteSpace: 'nowrap' }}>
                                        {assign?.id !== p.id && (
                                            <Button size="sm" variant="ghost" onClick={() => setAssign({ id: p.id, client_id: String(p.assigned_client_id ?? ''), label: p.label ?? p.name })}>
                                                {p.assigned_client ? 'Reassign' : 'Assign'}
                                            </Button>
                                        )}
                                        {p.key_status && (
                                            <Button size="sm" variant="ghost" onClick={() => router.post('/admin/platform/toggle-project', { provider: 'openai', external_project_id: p.id }, { preserveScroll: true })}>
                                                {p.key_status === 'active' ? 'Disable' : 'Enable'}
                                            </Button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </Section>

            <Section title="Metered provider keys" hint="Usage pulled from these keys is attributed to the owning client.">
                {keys.length === 0 ? <p style={{ color: 'var(--ox-text-subtle)', fontSize: 'var(--ox-text-sm)' }}>No keys attached.</p> : (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead><tr><th style={th}>Label</th><th style={th}>Client</th><th style={th}>Project</th><th style={th}>State</th><th style={{ ...th, textAlign: 'right' }}>Revenue MTD</th><th style={th}>Synced</th></tr></thead>
                        <tbody>
                            {keys.map((k) => (
                                <tr key={k.id}>
                                    <td style={{ ...td, fontWeight: 600 }}>{k.label}</td>
                                    <td style={td}>{k.client}</td>
                                    <td style={{ ...td, ...mono, fontSize: 12 }}>{k.project}</td>
                                    <td style={td}><Badge tone={k.status === 'billing' ? 'success' : k.status === 'pending' ? 'warning' : 'neutral'}>{k.status}</Badge></td>
                                    <td style={{ ...td, textAlign: 'right', ...mono }}>{money(k.revenue_cents)}</td>
                                    <td style={{ ...td, fontSize: 12.5, color: 'var(--ox-text-subtle)' }}>{k.synced}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </Section>

            <Section title="All gateway keys" hint="Every client-facing access key across the platform.">
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead><tr><th style={th}>Name</th><th style={th}>Client</th><th style={th}>Key</th><th style={th}>Status</th><th style={th}>Last used</th><th style={{ ...th, textAlign: 'right' }}></th></tr></thead>
                    <tbody>
                        {accessKeys.map((k) => (
                            <tr key={k.id}>
                                <td style={{ ...td, fontWeight: 600 }}>{k.name}</td>
                                <td style={td}>{k.client ?? '—'}</td>
                                <td style={{ ...td, ...mono, fontSize: 12.5 }}>{k.frag}</td>
                                <td style={td}><Badge tone={k.status === 'active' ? 'success' : 'neutral'}>{k.status}</Badge></td>
                                <td style={{ ...td, fontSize: 12.5, color: 'var(--ox-text-subtle)' }}>{k.last_used}</td>
                                <td style={{ ...td, textAlign: 'right' }}>
                                    {k.status === 'active' && <Button size="sm" variant="ghost" onClick={() => router.delete(`/admin/platform/access-keys/${k.id}`, { preserveScroll: true })}>Revoke</Button>}
                                </td>
                            </tr>
                        ))}
                        {accessKeys.length === 0 && <tr><td style={{ ...td, color: 'var(--ox-text-subtle)' }} colSpan={6}>None issued.</td></tr>}
                    </tbody>
                </table>
            </Section>

            <div style={{ display: 'flex', gap: 18, fontSize: 'var(--ox-text-xs)', color: 'var(--ox-text-subtle)' }}>
                <span>Last usage pull: {lastPull?.at ?? 'never'}</span>
                <span>Last charges run: {lastCharges?.at ?? 'never'}</span>
            </div>
        </AdminLayout>
    );
}
