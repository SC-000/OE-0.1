import { Head, Link, router, useForm } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import { Card, Badge, Button, Icon } from '@/components/oe';
import AdminLayout from '@/layouts/admin-layout';
import { money, pct } from '@/lib/format';

type Client = {
    id: number;
    name: string;
    email: string | null;
    company: string | null;
    status: string;
    health: 'healthy' | 'low' | 'debt' | 'suspended';
    balance_cents: number;
    revenue_cents: number;
    margin_cents: number;
    margin_pct: number | null;
    markup_pct: number;
    auto_topup: boolean;
    has_card: boolean;
    staff: number;
    visibility: string;
    since: string | null;
};

const HEALTH: Record<
    Client['health'],
    { tone: 'success' | 'warning' | 'danger' | 'neutral'; label: string }
> = {
    healthy: { tone: 'success', label: 'Healthy' },
    low: { tone: 'warning', label: 'Low balance' },
    debt: { tone: 'danger', label: 'In debt' },
    suspended: { tone: 'neutral', label: 'Suspended' },
};

const VISIBILITY: Record<string, string> = {
    aliased: 'Tier names',
    provider_only: 'Provider only',
    exact: 'Exact models',
};

const th: React.CSSProperties = {
    textAlign: 'left',
    padding: '9px 12px',
    fontSize: 11,
    fontWeight: 600,
    color: 'var(--ox-text-subtle)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    borderBottom: '1px solid var(--ox-border)',
};
const td: React.CSSProperties = {
    padding: '11px 12px',
    fontSize: 'var(--ox-text-sm)',
    borderBottom: '1px solid var(--ox-border)',
};
const mono: React.CSSProperties = { fontFamily: 'var(--ox-font-mono)' };

export default function Clients({ clients }: { clients: Client[] }) {
    const [q, setQ] = useState('');
    const [adding, setAdding] = useState(false);

    const form = useForm({
        name: '',
        owner_name: '',
        owner_email: '',
        company: '',
    });

    const filtered = useMemo(() => {
        const s = q.trim().toLowerCase();

        if (!s) {
            return clients;
        }

        return clients.filter((c) =>
            [c.name, c.email, c.company]
                .filter(Boolean)
                .some((v) => v!.toLowerCase().includes(s)),
        );
    }, [clients, q]);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        form.post('/admin/clients', {
            preserveScroll: true,
            onSuccess: () => {
                form.reset();
                setAdding(false);
            },
        });
    };

    return (
        <AdminLayout
            active="clients"
            title="Clients"
            subtitle={`${clients.length} account${clients.length === 1 ? '' : 's'} · month-to-date revenue and margin`}
            actions={
                <Button
                    size="sm"
                    leadingIcon={<Icon name="plus" size={15} />}
                    onClick={() => setAdding((v) => !v)}
                >
                    Add client
                </Button>
            }
        >
            <Head title="Admin — Clients" />

            {adding && (
                <Card padding="lg" style={{ marginBottom: 18 }}>
                    <h2
                        style={{
                            margin: '0 0 4px',
                            fontSize: 'var(--ox-text-md)',
                            fontWeight: 700,
                        }}
                    >
                        New client
                    </h2>
                    <p
                        style={{
                            margin: '0 0 14px',
                            fontSize: 'var(--ox-text-sm)',
                            color: 'var(--ox-text-subtle)',
                        }}
                    >
                        Creates the account and emails the owner a branded
                        set-password link.
                    </p>
                    <form
                        onSubmit={submit}
                        style={{
                            display: 'grid',
                            gridTemplateColumns:
                                'repeat(auto-fit, minmax(min(100%, 200px), 1fr))',
                            gap: 12,
                            alignItems: 'end',
                        }}
                    >
                        <Field label="Account name" error={form.errors.name}>
                            <input
                                style={input}
                                value={form.data.name}
                                onChange={(e) =>
                                    form.setData('name', e.target.value)
                                }
                                placeholder="Northwind"
                            />
                        </Field>
                        <Field label="Company (optional)">
                            <input
                                style={input}
                                value={form.data.company}
                                onChange={(e) =>
                                    form.setData('company', e.target.value)
                                }
                                placeholder="Northwind Ltd"
                            />
                        </Field>
                        <Field label="Owner name">
                            <input
                                style={input}
                                value={form.data.owner_name}
                                onChange={(e) =>
                                    form.setData('owner_name', e.target.value)
                                }
                                placeholder="Owen Ward"
                            />
                        </Field>
                        <Field
                            label="Owner email"
                            error={form.errors.owner_email}
                        >
                            <input
                                style={input}
                                type="email"
                                value={form.data.owner_email}
                                onChange={(e) =>
                                    form.setData('owner_email', e.target.value)
                                }
                                placeholder="owen@northwind.com"
                            />
                        </Field>
                        <div
                            style={{
                                display: 'flex',
                                gap: 8,
                                flexWrap: 'wrap',
                            }}
                        >
                            <Button
                                type="submit"
                                size="sm"
                                disabled={form.processing}
                            >
                                {form.processing
                                    ? 'Creating…'
                                    : 'Create & invite'}
                            </Button>
                            <Button
                                type="button"
                                size="sm"
                                variant="ghost"
                                onClick={() => setAdding(false)}
                            >
                                Cancel
                            </Button>
                        </div>
                    </form>
                </Card>
            )}

            <Card padding="none" style={{ overflow: 'hidden' }}>
                <div
                    style={{
                        padding: '12px 14px',
                        borderBottom: '1px solid var(--ox-border)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        flexWrap: 'wrap',
                    }}
                >
                    <Icon
                        name="search"
                        size={15}
                        color="var(--ox-text-subtle)"
                    />
                    <input
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        placeholder="Search name, email or company…"
                        style={{
                            flex: 1,
                            minWidth: 140,
                            border: 'none',
                            outline: 'none',
                            background: 'transparent',
                            fontSize: 'var(--ox-text-sm)',
                            color: 'var(--ox-text)',
                        }}
                    />
                </div>
                <div className="oe-table-wrap">
                    <table
                        style={{
                            width: '100%',
                            borderCollapse: 'collapse',
                            minWidth: 900,
                        }}
                    >
                        <thead>
                            <tr>
                                <th style={th}>Client</th>
                                <th style={th}>Status</th>
                                <th style={{ ...th, textAlign: 'right' }}>
                                    Balance
                                </th>
                                <th style={{ ...th, textAlign: 'right' }}>
                                    Revenue MTD
                                </th>
                                <th style={{ ...th, textAlign: 'right' }}>
                                    Margin
                                </th>
                                <th style={{ ...th, textAlign: 'right' }}>
                                    Markup
                                </th>
                                <th style={th}>Sees models as</th>
                                <th style={{ ...th, textAlign: 'right' }}>
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((c) => (
                                <tr key={c.id}>
                                    <td style={td}>
                                        <Link
                                            href={`/admin/clients/${c.id}`}
                                            style={{
                                                fontWeight: 600,
                                                color: 'var(--ox-text)',
                                                textDecoration: 'none',
                                            }}
                                        >
                                            {c.name}
                                        </Link>
                                        <div
                                            style={{
                                                fontSize: 11.5,
                                                color: 'var(--ox-text-subtle)',
                                                overflowWrap: 'anywhere',
                                            }}
                                        >
                                            {c.email ?? 'no owner email'} ·{' '}
                                            {c.staff} user
                                            {c.staff === 1 ? '' : 's'}
                                        </div>
                                    </td>
                                    <td style={td}>
                                        <Badge tone={HEALTH[c.health].tone}>
                                            {HEALTH[c.health].label}
                                        </Badge>
                                        {!c.has_card && (
                                            <div
                                                style={{
                                                    fontSize: 11,
                                                    color: 'var(--ox-warning)',
                                                    marginTop: 3,
                                                }}
                                            >
                                                No card
                                            </div>
                                        )}
                                    </td>
                                    <td
                                        style={{
                                            ...td,
                                            textAlign: 'right',
                                            ...mono,
                                            color:
                                                c.balance_cents < 0
                                                    ? 'var(--ox-danger)'
                                                    : 'inherit',
                                        }}
                                    >
                                        {money(c.balance_cents)}
                                    </td>
                                    <td
                                        style={{
                                            ...td,
                                            textAlign: 'right',
                                            ...mono,
                                        }}
                                    >
                                        {money(c.revenue_cents)}
                                    </td>
                                    <td
                                        style={{
                                            ...td,
                                            textAlign: 'right',
                                            ...mono,
                                            color:
                                                c.margin_cents < 0
                                                    ? 'var(--ox-danger)'
                                                    : 'var(--ox-success)',
                                        }}
                                    >
                                        {money(c.margin_cents)}
                                        <span
                                            style={{
                                                color: 'var(--ox-text-subtle)',
                                                fontSize: 11,
                                                marginLeft: 4,
                                            }}
                                        >
                                            {pct(c.margin_pct, 0)}
                                        </span>
                                    </td>
                                    <td
                                        style={{
                                            ...td,
                                            textAlign: 'right',
                                            ...mono,
                                            color: 'var(--ox-text-subtle)',
                                        }}
                                    >
                                        +{c.markup_pct}%
                                    </td>
                                    <td
                                        style={{
                                            ...td,
                                            fontSize: 12,
                                            color: 'var(--ox-text-subtle)',
                                        }}
                                    >
                                        {VISIBILITY[c.visibility] ??
                                            c.visibility}
                                    </td>
                                    <td
                                        style={{
                                            ...td,
                                            textAlign: 'right',
                                            whiteSpace: 'nowrap',
                                        }}
                                    >
                                        <button
                                            onClick={() =>
                                                router.post(
                                                    `/admin/clients/${c.id}/impersonate`,
                                                )
                                            }
                                            title={`Open ${c.name}'s console as they see it`}
                                            style={ghostBtn}
                                        >
                                            <Icon
                                                name="eye"
                                                size={14}
                                                color="var(--ox-text-muted)"
                                            />{' '}
                                            View as
                                        </button>
                                        <Link
                                            href={`/admin/clients/${c.id}`}
                                            style={{
                                                ...ghostBtn,
                                                textDecoration: 'none',
                                                display: 'inline-flex',
                                            }}
                                        >
                                            Manage{' '}
                                            <Icon
                                                name="chevron-right"
                                                size={14}
                                                color="var(--ox-text-muted)"
                                            />
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                            {filtered.length === 0 && (
                                <tr>
                                    <td
                                        style={{
                                            ...td,
                                            textAlign: 'center',
                                            color: 'var(--ox-text-subtle)',
                                            padding: 28,
                                        }}
                                        colSpan={8}
                                    >
                                        No clients match “{q}”.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </AdminLayout>
    );
}

const input: React.CSSProperties = {
    width: '100%',
    height: 36,
    padding: '0 10px',
    borderRadius: 'var(--ox-radius-sm)',
    border: '1px solid var(--ox-border)',
    background: 'var(--ox-surface)',
    color: 'var(--ox-text)',
    fontSize: 'var(--ox-text-sm)',
};

const ghostBtn: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 5,
    background: 'transparent',
    border: '1px solid var(--ox-border)',
    borderRadius: 'var(--ox-radius-sm)',
    padding: '5px 9px',
    marginLeft: 6,
    cursor: 'pointer',
    fontSize: 12,
    color: 'var(--ox-text-muted)',
    fontWeight: 600,
};

function Field({
    label,
    error,
    children,
}: {
    label: string;
    error?: string;
    children: React.ReactNode;
}) {
    return (
        <label style={{ display: 'block' }}>
            <span
                style={{
                    display: 'block',
                    fontSize: 11.5,
                    fontWeight: 600,
                    color: 'var(--ox-text-subtle)',
                    marginBottom: 5,
                }}
            >
                {label}
            </span>
            {children}
            {error && (
                <span
                    style={{
                        display: 'block',
                        fontSize: 11.5,
                        color: 'var(--ox-danger)',
                        marginTop: 4,
                    }}
                >
                    {error}
                </span>
            )}
        </label>
    );
}
