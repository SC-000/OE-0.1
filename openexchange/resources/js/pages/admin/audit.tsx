import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/layouts/admin-layout';
import { Card, Badge, Icon } from '@/components/oe';

type Log = {
    id: number; at: string; action: string; actor: string; actor_email: string | null;
    client: string | null; client_id: number | null; summary: string | null;
    meta: Record<string, unknown> | null; ip: string | null;
};
type Props = { logs: Log[]; actions: string[]; filters: { action: string; client_id: number | null } };

const th: React.CSSProperties = { textAlign: 'left', padding: '9px 12px', fontSize: 11, fontWeight: 600, color: 'var(--ox-text-subtle)', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid var(--ox-border)' };
const td: React.CSSProperties = { padding: '10px 12px', fontSize: 'var(--ox-text-sm)', borderBottom: '1px solid var(--ox-border)', verticalAlign: 'top' };
const mono: React.CSSProperties = { fontFamily: 'var(--ox-font-mono)' };

/** Impersonation and money movements are the ones you'll want to find in a hurry. */
const tone = (action: string): 'warning' | 'danger' | 'info' | 'neutral' => {
    if (action.startsWith('impersonate')) return 'warning';
    if (action.startsWith('balance') || action.startsWith('client.delete') || action.startsWith('charge')) return 'danger';
    if (action.startsWith('rate') || action.startsWith('price') || action.startsWith('model')) return 'info';
    return 'neutral';
};

export default function Audit({ logs, actions, filters }: Props) {
    const setFilter = (action: string) =>
        router.get('/admin/audit', action ? { action } : {}, { preserveScroll: true, preserveState: true });

    return (
        <AdminLayout active="audit" title="Audit log" subtitle="Every privileged action, most recent first. Append-only.">
            <Head title="Admin — Audit log" />

            <div style={{ display: 'flex', gap: 6, marginBottom: 14, flexWrap: 'wrap' }}>
                <Chip on={!filters.action} onClick={() => setFilter('')}>All</Chip>
                {actions.map((a) => <Chip key={a} on={filters.action === a} onClick={() => setFilter(a)}>{a}</Chip>)}
            </div>

            <Card padding="none" style={{ overflow: 'hidden' }}>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 860 }}>
                        <thead><tr>
                            <th style={th}>When</th><th style={th}>Action</th><th style={th}>Actor</th>
                            <th style={th}>Client</th><th style={th}>Detail</th><th style={th}>IP</th>
                        </tr></thead>
                        <tbody>
                            {logs.map((l) => (
                                <tr key={l.id}>
                                    <td style={{ ...td, whiteSpace: 'nowrap', fontSize: 12.5 }}>{l.at}</td>
                                    <td style={td}><Badge tone={tone(l.action)}>{l.action}</Badge></td>
                                    <td style={td}>
                                        <div style={{ fontWeight: 600, fontSize: 12.5 }}>{l.actor}</div>
                                        {l.actor_email && <div style={{ fontSize: 11, color: 'var(--ox-text-subtle)', ...mono }}>{l.actor_email}</div>}
                                    </td>
                                    <td style={td}>
                                        {l.client_id
                                            ? <Link href={`/admin/clients/${l.client_id}`} style={{ color: 'var(--ox-primary)', textDecoration: 'none', fontWeight: 600 }}>{l.client}</Link>
                                            : <span style={{ color: 'var(--ox-text-subtle)' }}>—</span>}
                                    </td>
                                    <td style={{ ...td, fontSize: 12.5, maxWidth: 340 }}>{l.summary ?? '—'}</td>
                                    <td style={{ ...td, ...mono, fontSize: 11.5, color: 'var(--ox-text-subtle)' }}>{l.ip ?? '—'}</td>
                                </tr>
                            ))}
                            {logs.length === 0 && (
                                <tr><td style={{ ...td, textAlign: 'center', padding: 32, color: 'var(--ox-text-subtle)' }} colSpan={6}>
                                    <Icon name="file-text" size={18} color="var(--ox-text-subtle)" />
                                    <div style={{ marginTop: 6 }}>No activity recorded yet.</div>
                                </td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </AdminLayout>
    );
}

function Chip({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) {
    return (
        <button onClick={onClick} style={{
            padding: '6px 12px', borderRadius: 'var(--ox-radius-full)', cursor: 'pointer', fontSize: 12.5, fontWeight: 600,
            fontFamily: 'var(--ox-font-mono)',
            border: '1px solid ' + (on ? 'transparent' : 'var(--ox-border)'),
            background: on ? 'var(--ox-primary-subtle)' : 'transparent',
            color: on ? 'var(--ox-green-700)' : 'var(--ox-text-muted)',
        }}>{children}</button>
    );
}
