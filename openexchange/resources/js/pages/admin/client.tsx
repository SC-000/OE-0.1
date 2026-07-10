import { Head, Link, router, useForm } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import { Card, Badge, Button, Icon, StatCard } from '@/components/oe';
import AdminLayout from '@/layouts/admin-layout';
import { bps, money, num, pct, tokens } from '@/lib/format';

type Client = {
    id: number;
    name: string;
    slug: string;
    company: string | null;
    contact_email: string | null;
    notes: string | null;
    status: string;
    since: string | null;
    balance_cents: number;
    markup_bps: number;
    min_cents: number;
    topup_cents: number;
    debt_limit_cents: number;
    auto_topup: boolean;
    model_visibility: string;
    billings_customer_id: string | null;
};
type PerModel = {
    provider: string;
    provider_label: string;
    model: string;
    client_sees: string;
    input_tokens: number;
    output_tokens: number;
    tokens: number;
    requests: number;
    revenue_cents: number;
    cost_cents: number;
    margin_cents: number;
    effective_markup_bps: number | null;
    rate_label: string;
    rate_origin: string;
};
type Rate = {
    id: number;
    provider: string | null;
    model: string | null;
    mode: string;
    label: string;
    markup_bps: number | null;
    note: string | null;
    per_request_fee_cents: number;
    min_margin_bps: number | null;
};
type Charge = {
    id: number;
    kind: string;
    cadence: string;
    name: string;
    amount_cents: number;
    model: string | null;
    provider: string | null;
    input_tokens: number;
    output_tokens: number;
    active: boolean;
    last_run: string | null;
    runs: number;
};
type Staff = {
    id: number;
    name: string;
    email: string;
    role: string;
    verified: boolean;
    last_login: string;
    joined: string | null;
};
type GridRow = {
    id: number;
    provider: string;
    provider_label: string;
    model: string;
    tier: string | null;
    priced: boolean;
    cost_in: number;
    cost_out: number;
    base_in: number;
    base_out: number;
    mode: string;
    markup_bps: number | null;
    rate_label: string;
    rate_origin: string;
    inherited: boolean;
    override_id: number | null;
    note: string | null;
    cost_per_m_cents: number;
    sell_per_m_cents: number;
    margin_per_m_cents: number;
    usage_records: number;
    usage_tokens: number;
    revenue_cents: number;
    usage_cost_cents: number;
    margin_cents: number;
};

type Props = {
    client: Client;
    summary: {
        revenue_cents: number;
        cost_cents: number;
        margin_cents: number;
        margin_pct: number | null;
        requests: number;
        tokens: number;
    };
    staff: Staff[];
    perModel: PerModel[];
    rates: Rate[];
    charges: Charge[];
    ledger: {
        date: string;
        type: string;
        desc: string | null;
        amount_cents: number;
        balance_after_cents: number;
    }[];
    topUps: {
        date: string;
        amount_cents: number;
        status: string;
        trigger: string;
        reason: string | null;
    }[];
    cards: { brand: string; last4: string; exp: string; default: boolean }[];
    accessKeys: {
        id: number;
        name: string;
        frag: string;
        status: string;
        last_used: string;
    }[];
    sources: {
        id: number;
        provider: string;
        project: string | null;
        label: string;
        status: string;
        revenue_cents: number;
        synced: string;
    }[];
    audit: {
        at: string;
        action: string;
        actor: string;
        summary: string | null;
    }[];
    catalog: { provider: string; model: string; in: number; out: number }[];
    rateGrid: GridRow[];
    newKey?: { name: string; secret: string } | null;
};

const TABS = [
    ['overview', 'Overview'],
    ['usage', 'Usage & margin'],
    ['rates', 'Rate card'],
    ['charges', 'Charges'],
    ['people', 'People & access'],
    ['billing', 'Billing'],
    ['activity', 'Activity'],
] as const;
type Tab = (typeof TABS)[number][0];

const th: React.CSSProperties = {
    textAlign: 'left',
    padding: '9px 10px',
    fontSize: 11,
    fontWeight: 600,
    color: 'var(--ox-text-subtle)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    borderBottom: '1px solid var(--ox-border)',
    whiteSpace: 'nowrap',
};
const td: React.CSSProperties = {
    padding: '10px',
    fontSize: 'var(--ox-text-sm)',
    borderBottom: '1px solid var(--ox-border)',
};
const mono: React.CSSProperties = { fontFamily: 'var(--ox-font-mono)' };
const input: React.CSSProperties = {
    width: '100%',
    height: 34,
    padding: '0 9px',
    borderRadius: 'var(--ox-radius-sm)',
    border: '1px solid var(--ox-border)',
    background: 'var(--ox-surface)',
    color: 'var(--ox-text)',
    fontSize: 'var(--ox-text-sm)',
};

const Lbl = ({ children }: { children: React.ReactNode }) => (
    <span
        style={{
            display: 'block',
            fontSize: 11.5,
            fontWeight: 600,
            color: 'var(--ox-text-subtle)',
            marginBottom: 5,
        }}
    >
        {children}
    </span>
);
const Section = ({
    title,
    hint,
    children,
    right,
}: {
    title: string;
    hint?: string;
    children: React.ReactNode;
    right?: React.ReactNode;
}) => (
    <Card padding="lg" style={{ marginBottom: 18 }}>
        <div
            style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                gap: 12,
                marginBottom: 12,
            }}
        >
            <div>
                <h2
                    style={{
                        margin: 0,
                        fontSize: 'var(--ox-text-md)',
                        fontWeight: 700,
                    }}
                >
                    {title}
                </h2>
                {hint && (
                    <p
                        style={{
                            margin: '2px 0 0',
                            fontSize: 'var(--ox-text-xs)',
                            color: 'var(--ox-text-subtle)',
                        }}
                    >
                        {hint}
                    </p>
                )}
            </div>
            {right}
        </div>
        {children}
    </Card>
);

export default function ClientProfile(props: Props) {
    const {
        client,
        summary,
        staff,
        perModel,
        rates,
        charges,
        ledger,
        topUps,
        cards,
        accessKeys,
        sources,
        audit,
        catalog,
        rateGrid,
        newKey,
    } = props;
    const [tab, setTab] = useState<Tab>('overview');

    return (
        <AdminLayout
            active="clients"
            title={client.name}
            subtitle={`${client.company ? client.company + ' · ' : ''}${client.contact_email ?? 'no contact email'} · client since ${client.since}`}
            actions={
                <>
                    <Badge
                        tone={
                            client.status === 'active' ? 'success' : 'neutral'
                        }
                    >
                        {client.status}
                    </Badge>
                    <Button
                        size="sm"
                        variant="secondary"
                        leadingIcon={<Icon name="eye" size={15} />}
                        onClick={() =>
                            router.post(
                                `/admin/clients/${client.id}/impersonate`,
                            )
                        }
                    >
                        View as client
                    </Button>
                    <Link
                        href="/admin/clients"
                        style={{
                            fontSize: 'var(--ox-text-sm)',
                            color: 'var(--ox-text-subtle)',
                            textDecoration: 'none',
                        }}
                    >
                        ← All clients
                    </Link>
                </>
            }
        >
            <Head title={`Admin — ${client.name}`} />

            {newKey && (
                <Card
                    padding="md"
                    style={{
                        marginBottom: 16,
                        borderLeft: '3px solid var(--ox-primary)',
                    }}
                >
                    <strong style={{ fontSize: 'var(--ox-text-sm)' }}>
                        New gateway key “{newKey.name}” — copy it now, it is not
                        shown again.
                    </strong>
                    <div
                        style={{
                            ...mono,
                            marginTop: 8,
                            padding: 10,
                            background: 'var(--ox-bg-muted)',
                            borderRadius: 'var(--ox-radius-sm)',
                            fontSize: 12.5,
                            wordBreak: 'break-all',
                        }}
                    >
                        {newKey.secret}
                    </div>
                </Card>
            )}

            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
                    gap: 12,
                    marginBottom: 20,
                }}
            >
                <StatCard
                    label="Balance"
                    value={money(client.balance_cents)}
                    hint={
                        client.auto_topup
                            ? `Auto top-up ${money(client.topup_cents)} at ${money(client.min_cents)}`
                            : 'Auto top-up off'
                    }
                />
                <StatCard
                    label="Revenue MTD"
                    value={money(summary.revenue_cents)}
                    hint={`${num(summary.requests)} requests`}
                />
                <StatCard
                    label="Your cost"
                    value={money(summary.cost_cents)}
                    hint="Paid to providers"
                />
                <StatCard
                    label="Margin"
                    value={money(summary.margin_cents)}
                    hint={`${pct(summary.margin_pct)} of revenue`}
                />
                <StatCard
                    label="Default markup"
                    value={bps(client.markup_bps)}
                    hint={`${rates.length} override${rates.length === 1 ? '' : 's'}`}
                />
            </div>

            <div
                style={{
                    display: 'flex',
                    gap: 4,
                    marginBottom: 16,
                    flexWrap: 'wrap',
                }}
            >
                {TABS.map(([id, label]) => (
                    <button
                        key={id}
                        onClick={() => setTab(id)}
                        style={{
                            padding: '7px 13px',
                            borderRadius: 'var(--ox-radius-full)',
                            cursor: 'pointer',
                            fontSize: 'var(--ox-text-sm)',
                            fontWeight: 600,
                            border:
                                '1px solid ' +
                                (tab === id
                                    ? 'transparent'
                                    : 'var(--ox-border)'),
                            background:
                                tab === id
                                    ? 'var(--ox-primary-subtle)'
                                    : 'transparent',
                            color:
                                tab === id
                                    ? 'var(--ox-green-700)'
                                    : 'var(--ox-text-muted)',
                        }}
                    >
                        {label}
                    </button>
                ))}
            </div>

            {tab === 'overview' && <OverviewTab client={client} />}
            {tab === 'usage' && (
                <UsageTab
                    perModel={perModel}
                    visibility={client.model_visibility}
                />
            )}
            {tab === 'rates' && (
                <RatesTab
                    client={client}
                    rateGrid={rateGrid}
                    catalog={catalog}
                />
            )}
            {tab === 'charges' && (
                <ChargesTab
                    client={client}
                    charges={charges}
                    catalog={catalog}
                />
            )}
            {tab === 'people' && (
                <PeopleTab
                    client={client}
                    staff={staff}
                    accessKeys={accessKeys}
                    sources={sources}
                />
            )}
            {tab === 'billing' && (
                <BillingTab
                    client={client}
                    ledger={ledger}
                    topUps={topUps}
                    cards={cards}
                />
            )}
            {tab === 'activity' && <ActivityTab audit={audit} />}
        </AdminLayout>
    );
}

/* ------------------------------------ Overview / settings ----------------------------------- */

function OverviewTab({ client }: { client: Client }) {
    const form = useForm({
        name: client.name,
        company: client.company ?? '',
        contact_email: client.contact_email ?? '',
        notes: client.notes ?? '',
        status: client.status,
        model_visibility: client.model_visibility,
        default_markup_bps: client.markup_bps,
        min_balance_cents: client.min_cents,
        topup_amount_cents: client.topup_cents,
        debt_limit_cents: client.debt_limit_cents,
        auto_topup: client.auto_topup,
    });
    const [adjust, setAdjust] = useState({ amount: '', dir: 1, reason: '' });
    const [confirmDelete, setConfirmDelete] = useState(false);

    return (
        <>
            <Section
                title="Profile & commercial terms"
                hint="Everything the client is, and everything they're charged on."
            >
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        form.patch(`/admin/clients/${client.id}`, {
                            preserveScroll: true,
                        });
                    }}
                >
                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns:
                                'repeat(auto-fit, minmax(200px, 1fr))',
                            gap: 14,
                        }}
                    >
                        <label>
                            <Lbl>Account name</Lbl>
                            <input
                                style={input}
                                value={form.data.name}
                                onChange={(e) =>
                                    form.setData('name', e.target.value)
                                }
                            />
                        </label>
                        <label>
                            <Lbl>Company</Lbl>
                            <input
                                style={input}
                                value={form.data.company}
                                onChange={(e) =>
                                    form.setData('company', e.target.value)
                                }
                            />
                        </label>
                        <label>
                            <Lbl>Billing email</Lbl>
                            <input
                                style={input}
                                type="email"
                                value={form.data.contact_email}
                                onChange={(e) =>
                                    form.setData(
                                        'contact_email',
                                        e.target.value,
                                    )
                                }
                            />
                        </label>
                        <label>
                            <Lbl>Status</Lbl>
                            <select
                                style={input}
                                value={form.data.status}
                                onChange={(e) =>
                                    form.setData('status', e.target.value)
                                }
                            >
                                <option value="active">Active</option>
                                <option value="suspended">Suspended</option>
                            </select>
                        </label>

                        <label>
                            <Lbl>Default markup</Lbl>
                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 8,
                                }}
                            >
                                <input
                                    style={{ ...input, ...mono }}
                                    type="number"
                                    step="0.01"
                                    value={form.data.default_markup_bps / 100}
                                    onChange={(e) =>
                                        form.setData(
                                            'default_markup_bps',
                                            Math.round(
                                                Number(e.target.value) * 100,
                                            ),
                                        )
                                    }
                                />
                                <span
                                    style={{ color: 'var(--ox-text-subtle)' }}
                                >
                                    %
                                </span>
                            </div>
                        </label>
                        <label>
                            <Lbl>Low-balance threshold</Lbl>
                            <input
                                style={{ ...input, ...mono }}
                                type="number"
                                value={form.data.min_balance_cents / 100}
                                onChange={(e) =>
                                    form.setData(
                                        'min_balance_cents',
                                        Math.round(
                                            Number(e.target.value) * 100,
                                        ),
                                    )
                                }
                            />
                        </label>
                        <label>
                            <Lbl>Top-up amount</Lbl>
                            <input
                                style={{ ...input, ...mono }}
                                type="number"
                                value={form.data.topup_amount_cents / 100}
                                onChange={(e) =>
                                    form.setData(
                                        'topup_amount_cents',
                                        Math.round(
                                            Number(e.target.value) * 100,
                                        ),
                                    )
                                }
                            />
                        </label>
                        <label>
                            <Lbl>Debt limit (gateway refuses below −this)</Lbl>
                            <input
                                style={{ ...input, ...mono }}
                                type="number"
                                value={form.data.debt_limit_cents / 100}
                                onChange={(e) =>
                                    form.setData(
                                        'debt_limit_cents',
                                        Math.round(
                                            Number(e.target.value) * 100,
                                        ),
                                    )
                                }
                            />
                        </label>
                    </div>

                    <div
                        style={{
                            marginTop: 16,
                            padding: 14,
                            borderRadius: 'var(--ox-radius-md)',
                            background: 'var(--ox-bg-subtle)',
                            border: '1px solid var(--ox-border)',
                        }}
                    >
                        <Lbl>What this client sees in their portal</Lbl>
                        <div
                            style={{
                                display: 'flex',
                                gap: 8,
                                flexWrap: 'wrap',
                                marginTop: 4,
                            }}
                        >
                            {(
                                [
                                    [
                                        'aliased',
                                        'Tier names',
                                        '“OpenAI Premium” — hides which model ran',
                                    ],
                                    [
                                        'provider_only',
                                        'Provider only',
                                        '“OpenAI” — hides the tier too',
                                    ],
                                    [
                                        'exact',
                                        'Exact models',
                                        '“gpt-5.4” — full disclosure',
                                    ],
                                ] as const
                            ).map(([val, label, hint]) => (
                                <button
                                    key={val}
                                    type="button"
                                    onClick={() =>
                                        form.setData('model_visibility', val)
                                    }
                                    style={{
                                        textAlign: 'left',
                                        padding: '9px 12px',
                                        borderRadius: 'var(--ox-radius-md)',
                                        cursor: 'pointer',
                                        flex: '1 1 200px',
                                        border:
                                            '1px solid ' +
                                            (form.data.model_visibility === val
                                                ? 'var(--ox-primary)'
                                                : 'var(--ox-border)'),
                                        background:
                                            form.data.model_visibility === val
                                                ? 'var(--ox-primary-subtle)'
                                                : 'var(--ox-surface)',
                                    }}
                                >
                                    <div
                                        style={{
                                            fontSize: 'var(--ox-text-sm)',
                                            fontWeight: 600,
                                        }}
                                    >
                                        {label}
                                    </div>
                                    <div
                                        style={{
                                            fontSize: 11.5,
                                            color: 'var(--ox-text-subtle)',
                                            marginTop: 2,
                                        }}
                                    >
                                        {hint}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    <label
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            marginTop: 14,
                            fontSize: 'var(--ox-text-sm)',
                        }}
                    >
                        <input
                            type="checkbox"
                            checked={form.data.auto_topup}
                            onChange={(e) =>
                                form.setData('auto_topup', e.target.checked)
                            }
                        />
                        Auto top-up when the balance falls below the threshold
                    </label>

                    <label style={{ display: 'block', marginTop: 14 }}>
                        <Lbl>Internal notes (never shown to the client)</Lbl>
                        <textarea
                            rows={3}
                            style={{
                                ...input,
                                height: 'auto',
                                padding: 9,
                                resize: 'vertical',
                            }}
                            value={form.data.notes}
                            onChange={(e) =>
                                form.setData('notes', e.target.value)
                            }
                        />
                    </label>

                    <div style={{ marginTop: 14 }}>
                        <Button
                            type="submit"
                            size="sm"
                            disabled={form.processing}
                        >
                            {form.processing ? 'Saving…' : 'Save changes'}
                        </Button>
                        {form.recentlySuccessful && (
                            <span
                                style={{
                                    marginLeft: 10,
                                    fontSize: 12.5,
                                    color: 'var(--ox-success)',
                                }}
                            >
                                Saved
                            </span>
                        )}
                    </div>
                </form>
            </Section>

            <Section
                title="Adjust balance"
                hint="Writes a signed ledger entry. Use for goodwill credits, refunds or corrections."
            >
                <div
                    style={{
                        display: 'flex',
                        gap: 10,
                        alignItems: 'end',
                        flexWrap: 'wrap',
                    }}
                >
                    <label style={{ width: 130 }}>
                        <Lbl>Amount ($)</Lbl>
                        <input
                            style={{ ...input, ...mono }}
                            value={adjust.amount}
                            onChange={(e) =>
                                setAdjust({ ...adjust, amount: e.target.value })
                            }
                            placeholder="25.00"
                        />
                    </label>
                    <div style={{ display: 'flex', gap: 6 }}>
                        <Button
                            size="sm"
                            variant={adjust.dir === 1 ? 'primary' : 'secondary'}
                            onClick={() => setAdjust({ ...adjust, dir: 1 })}
                        >
                            Credit
                        </Button>
                        <Button
                            size="sm"
                            variant={adjust.dir === -1 ? 'danger' : 'secondary'}
                            onClick={() => setAdjust({ ...adjust, dir: -1 })}
                        >
                            Debit
                        </Button>
                    </div>
                    <label style={{ flex: 1, minWidth: 180 }}>
                        <Lbl>Reason</Lbl>
                        <input
                            style={input}
                            value={adjust.reason}
                            onChange={(e) =>
                                setAdjust({ ...adjust, reason: e.target.value })
                            }
                            placeholder="Goodwill credit — outage on 3 Jul"
                        />
                    </label>
                    <Button
                        size="sm"
                        disabled={!adjust.amount}
                        onClick={() =>
                            router.post(
                                `/admin/clients/${client.id}/balance`,
                                {
                                    amount: Number(adjust.amount) * adjust.dir,
                                    reason: adjust.reason,
                                },
                                {
                                    preserveScroll: true,
                                    onSuccess: () =>
                                        setAdjust({
                                            amount: '',
                                            dir: 1,
                                            reason: '',
                                        }),
                                },
                            )
                        }
                    >
                        Apply
                    </Button>
                </div>
            </Section>

            <Section
                title="Danger zone"
                hint="Deleting a client removes its users, keys, usage history and ledger. This cannot be undone."
            >
                {!confirmDelete ? (
                    <Button
                        size="sm"
                        variant="danger"
                        onClick={() => setConfirmDelete(true)}
                    >
                        Delete {client.name}
                    </Button>
                ) : (
                    <div
                        style={{
                            display: 'flex',
                            gap: 8,
                            alignItems: 'center',
                            flexWrap: 'wrap',
                        }}
                    >
                        <Icon
                            name="alert-triangle"
                            size={16}
                            color="var(--ox-danger)"
                        />
                        <span style={{ fontSize: 'var(--ox-text-sm)' }}>
                            Permanently delete <strong>{client.name}</strong>{' '}
                            and all of its data?
                        </span>
                        <Button
                            size="sm"
                            variant="danger"
                            onClick={() =>
                                router.delete(`/admin/clients/${client.id}`)
                            }
                        >
                            Yes, delete
                        </Button>
                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setConfirmDelete(false)}
                        >
                            Cancel
                        </Button>
                    </div>
                )}
            </Section>
        </>
    );
}

/* --------------------------------------- Usage & margin ------------------------------------- */

function UsageTab({
    perModel,
    visibility,
}: {
    perModel: PerModel[];
    visibility: string;
}) {
    return (
        <Section
            title="Usage by model — month to date"
            hint={`True model, true margin. The “client sees” column is exactly what their portal renders (visibility: ${visibility}).`}
        >
            {perModel.length === 0 ? (
                <p
                    style={{
                        color: 'var(--ox-text-subtle)',
                        fontSize: 'var(--ox-text-sm)',
                    }}
                >
                    No usage this month.
                </p>
            ) : (
                <div style={{ overflowX: 'auto' }}>
                    <table
                        style={{
                            width: '100%',
                            borderCollapse: 'collapse',
                            minWidth: 940,
                        }}
                    >
                        <thead>
                            <tr>
                                <th style={th}>Model (real)</th>
                                <th style={th}>Client sees</th>
                                <th style={{ ...th, textAlign: 'right' }}>
                                    In / Out tokens
                                </th>
                                <th style={{ ...th, textAlign: 'right' }}>
                                    Requests
                                </th>
                                <th style={{ ...th, textAlign: 'right' }}>
                                    Revenue
                                </th>
                                <th style={{ ...th, textAlign: 'right' }}>
                                    Cost
                                </th>
                                <th style={{ ...th, textAlign: 'right' }}>
                                    Margin
                                </th>
                                <th style={th}>Rate applied</th>
                            </tr>
                        </thead>
                        <tbody>
                            {perModel.map((m) => (
                                <tr key={`${m.provider}/${m.model}`}>
                                    <td
                                        style={{
                                            ...td,
                                            ...mono,
                                            fontSize: 12.5,
                                        }}
                                    >
                                        {m.model}
                                        <div
                                            style={{
                                                fontFamily:
                                                    'var(--ox-font-sans)',
                                                fontSize: 11,
                                                color: 'var(--ox-text-subtle)',
                                            }}
                                        >
                                            {m.provider_label}
                                        </div>
                                    </td>
                                    <td style={td}>
                                        <Badge tone="brand" dot={false}>
                                            {m.client_sees}
                                        </Badge>
                                    </td>
                                    <td
                                        style={{
                                            ...td,
                                            textAlign: 'right',
                                            ...mono,
                                            fontSize: 12.5,
                                        }}
                                    >
                                        {tokens(m.input_tokens)} /{' '}
                                        {tokens(m.output_tokens)}
                                    </td>
                                    <td
                                        style={{
                                            ...td,
                                            textAlign: 'right',
                                            ...mono,
                                        }}
                                    >
                                        {num(m.requests)}
                                    </td>
                                    <td
                                        style={{
                                            ...td,
                                            textAlign: 'right',
                                            ...mono,
                                        }}
                                    >
                                        {money(m.revenue_cents)}
                                    </td>
                                    <td
                                        style={{
                                            ...td,
                                            textAlign: 'right',
                                            ...mono,
                                            color: 'var(--ox-text-subtle)',
                                        }}
                                    >
                                        {money(m.cost_cents)}
                                    </td>
                                    <td
                                        style={{
                                            ...td,
                                            textAlign: 'right',
                                            ...mono,
                                            fontWeight: 600,
                                            color:
                                                m.margin_cents < 0
                                                    ? 'var(--ox-danger)'
                                                    : 'var(--ox-success)',
                                        }}
                                    >
                                        {money(m.margin_cents)}
                                        {m.effective_markup_bps !== null && (
                                            <div
                                                style={{
                                                    fontSize: 10.5,
                                                    fontWeight: 400,
                                                    color: 'var(--ox-text-subtle)',
                                                }}
                                            >
                                                {bps(m.effective_markup_bps)}
                                            </div>
                                        )}
                                    </td>
                                    <td style={td}>
                                        <span style={{ fontSize: 12.5 }}>
                                            {m.rate_label}
                                        </span>
                                        <div
                                            style={{
                                                fontSize: 10.5,
                                                color: 'var(--ox-text-subtle)',
                                            }}
                                        >
                                            {m.rate_origin.replace('_', ' ')}
                                        </div>
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

/**
 * Every model, laid out. No dropdown: the admin sees each model's real cost, the
 * charge-on price markup applies to, what this client is actually charged, and what
 * they've spent on it — and can adjust any row in place.
 */
function RatesTab({
    client,
    rateGrid,
    catalog,
}: {
    client: Client;
    rateGrid: GridRow[];
    catalog: Props['catalog'];
}) {
    const [q, setQ] = useState('');
    const [onlyUsed, setOnlyUsed] = useState(false);
    const [edits, setEdits] = useState<Record<number, string>>({});
    const [recost, setRecost] = useState<{
        row: GridRow;
        preview: RecostPreview | null;
        loading: boolean;
    } | null>(null);
    const [advanced, setAdvanced] = useState(false);

    const rows = useMemo(() => {
        const s = q.trim().toLowerCase();

        return rateGrid.filter((r) => {
            if (onlyUsed && r.usage_records === 0) {
                return false;
            }

            return (
                !s ||
                r.model.toLowerCase().includes(s) ||
                r.provider.includes(s)
            );
        });
    }, [rateGrid, q, onlyUsed]);

    const overrides = rateGrid.filter((r) => !r.inherited).length;
    const used = rateGrid.filter((r) => r.usage_records > 0).length;

    const pctOf = (r: GridRow) =>
        edits[r.id] ??
        (r.markup_bps !== null ? String(r.markup_bps / 100) : '');
    const dirty = (r: GridRow) =>
        edits[r.id] !== undefined && Number(edits[r.id]) * 100 !== r.markup_bps;

    const saveRow = (r: GridRow) =>
        router.post(
            '/admin/rates',
            {
                client_id: client.id,
                provider: r.provider,
                model: r.model,
                pricing_mode: 'markup',
                markup_bps: Math.round(Number(pctOf(r)) * 100),
            },
            {
                preserveScroll: true,
                preserveState: false,
                onSuccess: () =>
                    setEdits((e) => {
                        const n = { ...e };
                        delete n[r.id];

                        return n;
                    }),
            },
        );

    const resetRow = (r: GridRow) =>
        r.override_id &&
        router.post(
            '/admin/rates/delete',
            { id: r.override_id },
            { preserveScroll: true },
        );

    const openRecost = async (row: GridRow) => {
        setRecost({ row, preview: null, loading: true });

        try {
            const res = await fetch(
                `/admin/clients/${client.id}/recost/preview`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Accept: 'application/json',
                        'X-Requested-With': 'XMLHttpRequest',
                        'X-XSRF-TOKEN': xsrf(),
                    },
                    body: JSON.stringify({
                        provider: row.provider,
                        model: row.model,
                    }),
                },
            );
            setRecost({ row, preview: await res.json(), loading: false });
        } catch {
            setRecost({ row, preview: null, loading: false });
        }
    };
    const applyRecost = () => {
        if (!recost) {
            return;
        }

        router.post(
            `/admin/clients/${client.id}/recost`,
            { provider: recost.row.provider, model: recost.row.model },
            { preserveScroll: true, onSuccess: () => setRecost(null) },
        );
    };

    return (
        <>
            <Section
                title="Rate card"
                hint={`Every model this client can reach. ${overrides} override${overrides === 1 ? '' : 's'}; the rest inherit their ${bps(client.markup_bps)} default markup. Markup is applied to the charge-on price, and margin is measured against the real cost.`}
                right={
                    <div
                        style={{
                            display: 'flex',
                            gap: 8,
                            alignItems: 'center',
                            flexWrap: 'wrap',
                        }}
                    >
                        <label
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 6,
                                fontSize: 12.5,
                                color: 'var(--ox-text-muted)',
                                cursor: 'pointer',
                            }}
                        >
                            <input
                                type="checkbox"
                                checked={onlyUsed}
                                onChange={(e) => setOnlyUsed(e.target.checked)}
                            />
                            Only models they use ({used})
                        </label>
                        <input
                            style={{ ...input, width: 170 }}
                            placeholder="Search models…"
                            value={q}
                            onChange={(e) => setQ(e.target.value)}
                        />
                    </div>
                }
            >
                <div style={{ overflowX: 'auto' }}>
                    <table
                        style={{
                            width: '100%',
                            borderCollapse: 'collapse',
                            minWidth: 1080,
                        }}
                    >
                        <thead>
                            <tr>
                                <th style={th}>Model</th>
                                <th style={{ ...th, textAlign: 'right' }}>
                                    Real cost
                                    <br />
                                    <span
                                        style={{
                                            fontWeight: 400,
                                            textTransform: 'none',
                                        }}
                                    >
                                        per 1M+1M
                                    </span>
                                </th>
                                <th style={{ ...th, textAlign: 'right' }}>
                                    Charge-on
                                    <br />
                                    <span
                                        style={{
                                            fontWeight: 400,
                                            textTransform: 'none',
                                        }}
                                    >
                                        per 1M+1M
                                    </span>
                                </th>
                                <th style={{ ...th, textAlign: 'center' }}>
                                    Markup %
                                </th>
                                <th style={{ ...th, textAlign: 'right' }}>
                                    They pay
                                    <br />
                                    <span
                                        style={{
                                            fontWeight: 400,
                                            textTransform: 'none',
                                        }}
                                    >
                                        per 1M+1M
                                    </span>
                                </th>
                                <th style={{ ...th, textAlign: 'right' }}>
                                    Margin
                                </th>
                                <th style={{ ...th, textAlign: 'right' }}>
                                    Their usage MTD
                                </th>
                                <th style={{ ...th, textAlign: 'right' }} />
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map((r) => {
                                const fixed = r.mode === 'fixed';

                                return (
                                    <tr
                                        key={r.id}
                                        style={
                                            !r.priced
                                                ? {
                                                      background:
                                                          'var(--ox-danger-surface)',
                                                  }
                                                : undefined
                                        }
                                    >
                                        <td style={td}>
                                            <div
                                                style={{
                                                    ...mono,
                                                    fontSize: 12.5,
                                                }}
                                            >
                                                {r.model}
                                            </div>
                                            <div
                                                style={{
                                                    fontSize: 11,
                                                    color: 'var(--ox-text-subtle)',
                                                }}
                                            >
                                                {r.provider_label}
                                                {!r.inherited && (
                                                    <>
                                                        {' '}
                                                        ·{' '}
                                                        <span
                                                            style={{
                                                                color: 'var(--ox-green-700)',
                                                                fontWeight: 600,
                                                            }}
                                                        >
                                                            override
                                                        </span>
                                                    </>
                                                )}
                                                {r.note && ` · ${r.note}`}
                                            </div>
                                        </td>
                                        <td
                                            style={{
                                                ...td,
                                                ...mono,
                                                textAlign: 'right',
                                                color: 'var(--ox-text-subtle)',
                                            }}
                                        >
                                            {r.priced
                                                ? money(r.cost_per_m_cents)
                                                : '—'}
                                        </td>
                                        <td
                                            style={{
                                                ...td,
                                                ...mono,
                                                textAlign: 'right',
                                            }}
                                        >
                                            {r.priced
                                                ? money(
                                                      r.base_in * 100 +
                                                          r.base_out * 100,
                                                  )
                                                : '—'}
                                        </td>
                                        <td
                                            style={{
                                                ...td,
                                                textAlign: 'center',
                                                width: 130,
                                            }}
                                        >
                                            {fixed ? (
                                                <Badge tone="info" dot={false}>
                                                    {r.rate_label}
                                                </Badge>
                                            ) : (
                                                <div
                                                    style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: 4,
                                                        justifyContent:
                                                            'center',
                                                    }}
                                                >
                                                    <input
                                                        style={{
                                                            ...input,
                                                            ...mono,
                                                            width: 74,
                                                            height: 30,
                                                            textAlign: 'right',
                                                        }}
                                                        value={pctOf(r)}
                                                        onChange={(e) =>
                                                            setEdits((s) => ({
                                                                ...s,
                                                                [r.id]:
                                                                    e.target
                                                                        .value,
                                                            }))
                                                        }
                                                    />
                                                    <span
                                                        style={{
                                                            color: 'var(--ox-text-subtle)',
                                                            fontSize: 12,
                                                        }}
                                                    >
                                                        %
                                                    </span>
                                                </div>
                                            )}
                                            {r.inherited && !fixed && (
                                                <div
                                                    style={{
                                                        fontSize: 10,
                                                        color: 'var(--ox-text-subtle)',
                                                        marginTop: 2,
                                                    }}
                                                >
                                                    inherited
                                                </div>
                                            )}
                                        </td>
                                        <td
                                            style={{
                                                ...td,
                                                ...mono,
                                                textAlign: 'right',
                                                fontWeight: 600,
                                            }}
                                        >
                                            {r.priced
                                                ? money(r.sell_per_m_cents)
                                                : '—'}
                                        </td>
                                        <td
                                            style={{
                                                ...td,
                                                ...mono,
                                                textAlign: 'right',
                                                color:
                                                    r.margin_per_m_cents < 0
                                                        ? 'var(--ox-danger)'
                                                        : 'var(--ox-success)',
                                            }}
                                        >
                                            {r.priced
                                                ? money(r.margin_per_m_cents)
                                                : '—'}
                                        </td>
                                        <td
                                            style={{
                                                ...td,
                                                textAlign: 'right',
                                            }}
                                        >
                                            {r.usage_records > 0 ? (
                                                <>
                                                    <div style={{ ...mono }}>
                                                        {money(r.revenue_cents)}
                                                    </div>
                                                    <div
                                                        style={{
                                                            fontSize: 10.5,
                                                            color: 'var(--ox-text-subtle)',
                                                        }}
                                                    >
                                                        {tokens(r.usage_tokens)}{' '}
                                                        tok · margin{' '}
                                                        {money(r.margin_cents)}
                                                    </div>
                                                </>
                                            ) : (
                                                <span
                                                    style={{
                                                        color: 'var(--ox-text-subtle)',
                                                    }}
                                                >
                                                    —
                                                </span>
                                            )}
                                        </td>
                                        <td
                                            style={{
                                                ...td,
                                                textAlign: 'right',
                                                whiteSpace: 'nowrap',
                                            }}
                                        >
                                            {dirty(r) && (
                                                <Button
                                                    size="sm"
                                                    onClick={() => saveRow(r)}
                                                >
                                                    Save
                                                </Button>
                                            )}
                                            {!dirty(r) && !r.inherited && (
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => resetRow(r)}
                                                    title="Remove this override and fall back to the client default"
                                                >
                                                    Reset
                                                </Button>
                                            )}
                                            {!dirty(r) &&
                                                r.usage_records > 0 &&
                                                r.priced && (
                                                    <Button
                                                        size="sm"
                                                        variant="secondary"
                                                        onClick={() =>
                                                            openRecost(r)
                                                        }
                                                        title="Re-bill this model's existing usage at today's cost and rate"
                                                    >
                                                        Re-bill at current rate
                                                    </Button>
                                                )}
                                        </td>
                                    </tr>
                                );
                            })}
                            {rows.length === 0 && (
                                <tr>
                                    <td
                                        style={{
                                            ...td,
                                            textAlign: 'center',
                                            padding: 26,
                                            color: 'var(--ox-text-subtle)',
                                        }}
                                        colSpan={8}
                                    >
                                        No models match.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Section>

            {recost && (
                <RecostDialog
                    row={recost.row}
                    preview={recost.preview}
                    loading={recost.loading}
                    onCancel={() => setRecost(null)}
                    onApply={applyRecost}
                />
            )}

            <Section
                title="Advanced override"
                hint="For a fixed sell price, a per-request fee, or a minimum-margin floor. The grid above covers plain markup."
            >
                {!advanced ? (
                    <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => setAdvanced(true)}
                    >
                        Add advanced override
                    </Button>
                ) : (
                    <AdvancedOverrideForm
                        client={client}
                        catalog={catalog}
                        onDone={() => setAdvanced(false)}
                    />
                )}
            </Section>
        </>
    );
}

type RecostPreview = {
    records: number;
    was_cents: number;
    now_cents: number;
    delta_cents: number;
    credited: number;
};

/**
 * Re-costing rewrites history and moves the client's balance, so it is never a
 * one-click action: the admin sees exactly who is charged what before committing.
 */
function RecostDialog({
    row,
    preview,
    loading,
    onCancel,
    onApply,
}: {
    row: GridRow;
    preview: RecostPreview | null;
    loading: boolean;
    onCancel: () => void;
    onApply: () => void;
}) {
    const delta = preview?.delta_cents ?? 0;
    const nothing = preview !== null && (preview.records === 0 || delta === 0);

    return (
        <div
            role="dialog"
            aria-modal="true"
            style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(6,14,12,0.55)',
                display: 'grid',
                placeItems: 'center',
                zIndex: 80,
                padding: 20,
            }}
        >
            <Card padding="lg" style={{ maxWidth: 560, width: '100%' }}>
                <h2
                    style={{
                        margin: '0 0 4px',
                        fontSize: 'var(--ox-text-md)',
                        fontWeight: 700,
                    }}
                >
                    Re-bill {row.model} at the current rate
                </h2>
                <p
                    style={{
                        margin: '0 0 14px',
                        fontSize: 'var(--ox-text-xs)',
                        color: 'var(--ox-text-subtle)',
                        lineHeight: 1.6,
                    }}
                >
                    Recomputes this client's existing usage of {row.model} at
                    today's real cost, charge-on price and rate card, then
                    settles the difference. Safe to run twice — the second run
                    moves nothing.
                </p>

                {loading && (
                    <p
                        style={{
                            fontSize: 'var(--ox-text-sm)',
                            color: 'var(--ox-text-subtle)',
                        }}
                    >
                        Calculating…
                    </p>
                )}

                {preview && (
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 8,
                            padding: 14,
                            borderRadius: 'var(--ox-radius-md)',
                            background: 'var(--ox-bg-subtle)',
                            border: '1px solid var(--ox-border)',
                            marginBottom: 14,
                        }}
                    >
                        <Line
                            label="Usage records affected"
                            value={num(preview.records)}
                        />
                        <Line
                            label="Billed today"
                            value={money(preview.was_cents)}
                        />
                        <Line
                            label="Billed at current rate"
                            value={money(preview.now_cents)}
                        />
                        <div
                            style={{
                                height: 1,
                                background: 'var(--ox-border)',
                                margin: '4px 0',
                            }}
                        />
                        <Line
                            label={
                                delta >= 0
                                    ? 'Additional charge'
                                    : 'Refund to client'
                            }
                            value={money(Math.abs(delta))}
                            tone={
                                delta > 0
                                    ? 'var(--ox-danger)'
                                    : delta < 0
                                      ? 'var(--ox-success)'
                                      : undefined
                            }
                            strong
                        />
                    </div>
                )}

                {preview && !nothing && (
                    <p
                        style={{
                            margin: '0 0 14px',
                            fontSize: 11.5,
                            color: 'var(--ox-text-subtle)',
                            lineHeight: 1.6,
                        }}
                    >
                        <Icon
                            name="alert-triangle"
                            size={12}
                            color="var(--ox-warning)"
                            style={{ verticalAlign: -1, marginRight: 4 }}
                        />
                        Their balance moves and a ledger line appears — money
                        cannot move invisibly. They will not see the model name,
                        or that a re-price happened: the line reads “Usage —
                        inference”, like every other metered line.
                    </p>
                )}

                <div
                    style={{
                        display: 'flex',
                        gap: 8,
                        justifyContent: 'flex-end',
                    }}
                >
                    <Button size="sm" variant="ghost" onClick={onCancel}>
                        Cancel
                    </Button>
                    <Button
                        size="sm"
                        variant={delta > 0 ? 'danger' : 'primary'}
                        disabled={loading || nothing}
                        onClick={onApply}
                    >
                        {nothing
                            ? 'Nothing to change'
                            : delta > 0
                              ? `Charge ${money(delta)}`
                              : `Refund ${money(Math.abs(delta))}`}
                    </Button>
                </div>
            </Card>
        </div>
    );
}

const Line = ({
    label,
    value,
    tone,
    strong,
}: {
    label: string;
    value: string;
    tone?: string;
    strong?: boolean;
}) => (
    <div
        style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: 'var(--ox-text-sm)',
        }}
    >
        <span style={{ color: 'var(--ox-text-subtle)' }}>{label}</span>
        <span
            style={{
                ...mono,
                color: tone ?? 'var(--ox-text)',
                fontWeight: strong ? 700 : 400,
            }}
        >
            {value}
        </span>
    </div>
);

/** Laravel's XSRF cookie, for the one place we hand-roll a fetch (the recost preview). */
function xsrf(): string {
    const m = document.cookie.match(/(?:^|;\s*)XSRF-TOKEN=([^;]+)/);

    return m ? decodeURIComponent(m[1]) : '';
}

function AdvancedOverrideForm({
    client,
    catalog,
    onDone,
}: {
    client: Client;
    catalog: Props['catalog'];
    onDone: () => void;
}) {
    const [mode, setMode] = useState<'markup' | 'fixed'>('fixed');
    const form = useForm<Record<string, string | number | null>>({
        client_id: client.id,
        provider: '',
        model: '',
        pricing_mode: 'fixed',
        markup_bps: 2500,
        input_usd_per_million: '',
        output_usd_per_million: '',
        per_request_fee_cents: 0,
        min_margin_bps: '',
        note: '',
    });
    const chosen = catalog.find((c) => c.model === form.data.model);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        // transform() returns void in Inertia 3 — set it, then submit.
        form.transform((d) => ({
            ...d,
            pricing_mode: mode,
            provider: d.provider || chosen?.provider || '',
            min_margin_bps:
                d.min_margin_bps === '' ? null : Number(d.min_margin_bps),
            input_usd_per_million:
                d.input_usd_per_million === ''
                    ? null
                    : Number(d.input_usd_per_million),
            output_usd_per_million:
                d.output_usd_per_million === ''
                    ? null
                    : Number(d.output_usd_per_million),
        }));
        form.post('/admin/rates', {
            preserveScroll: true,
            onSuccess: () => {
                form.reset('model', 'note');
                onDone();
            },
        });
    };

    return (
        <form onSubmit={submit}>
            <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
                {(
                    [
                        ['fixed', 'Fixed sell price'],
                        ['markup', 'Markup + guards'],
                    ] as const
                ).map(([m, label]) => (
                    <button
                        key={m}
                        type="button"
                        onClick={() => setMode(m)}
                        style={{
                            padding: '7px 13px',
                            borderRadius: 'var(--ox-radius-full)',
                            cursor: 'pointer',
                            fontSize: 'var(--ox-text-sm)',
                            fontWeight: 600,
                            border:
                                '1px solid ' +
                                (mode === m
                                    ? 'transparent'
                                    : 'var(--ox-border)'),
                            background:
                                mode === m
                                    ? 'var(--ox-primary-subtle)'
                                    : 'transparent',
                            color:
                                mode === m
                                    ? 'var(--ox-green-700)'
                                    : 'var(--ox-text-muted)',
                        }}
                    >
                        {label}
                    </button>
                ))}
            </div>

            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
                    gap: 12,
                    alignItems: 'end',
                }}
            >
                <label>
                    <Lbl>Applies to</Lbl>
                    <select
                        style={input}
                        value={String(form.data.model)}
                        onChange={(e) => form.setData('model', e.target.value)}
                    >
                        <option value="">All models</option>
                        {catalog.map((c) => (
                            <option
                                key={`${c.provider}/${c.model}`}
                                value={c.model}
                            >
                                {c.model}
                            </option>
                        ))}
                    </select>
                </label>

                {mode === 'markup' ? (
                    <label>
                        <Lbl>Markup %</Lbl>
                        <input
                            style={{ ...input, ...mono }}
                            type="number"
                            step="0.01"
                            value={Number(form.data.markup_bps) / 100}
                            onChange={(e) =>
                                form.setData(
                                    'markup_bps',
                                    Math.round(Number(e.target.value) * 100),
                                )
                            }
                        />
                    </label>
                ) : (
                    <>
                        <label>
                            <Lbl>Sell input $/1M</Lbl>
                            <input
                                style={{ ...input, ...mono }}
                                value={String(form.data.input_usd_per_million)}
                                onChange={(e) =>
                                    form.setData(
                                        'input_usd_per_million',
                                        e.target.value,
                                    )
                                }
                                placeholder={
                                    chosen ? String(chosen.in * 1.25) : '3.00'
                                }
                            />
                        </label>
                        <label>
                            <Lbl>Sell output $/1M</Lbl>
                            <input
                                style={{ ...input, ...mono }}
                                value={String(form.data.output_usd_per_million)}
                                onChange={(e) =>
                                    form.setData(
                                        'output_usd_per_million',
                                        e.target.value,
                                    )
                                }
                                placeholder={
                                    chosen ? String(chosen.out * 1.25) : '12.00'
                                }
                            />
                        </label>
                    </>
                )}

                <label>
                    <Lbl>Per-request fee (¢)</Lbl>
                    <input
                        style={{ ...input, ...mono }}
                        type="number"
                        min={0}
                        value={Number(form.data.per_request_fee_cents)}
                        onChange={(e) =>
                            form.setData(
                                'per_request_fee_cents',
                                Number(e.target.value),
                            )
                        }
                    />
                </label>
                <label>
                    <Lbl>Min margin % (floor)</Lbl>
                    <input
                        style={{ ...input, ...mono }}
                        type="number"
                        step="0.01"
                        placeholder="optional"
                        value={
                            form.data.min_margin_bps === ''
                                ? ''
                                : Number(form.data.min_margin_bps) / 100
                        }
                        onChange={(e) =>
                            form.setData(
                                'min_margin_bps',
                                e.target.value === ''
                                    ? ''
                                    : String(
                                          Math.round(
                                              Number(e.target.value) * 100,
                                          ),
                                      ),
                            )
                        }
                    />
                </label>
                <label>
                    <Lbl>Note</Lbl>
                    <input
                        style={input}
                        value={String(form.data.note)}
                        onChange={(e) => form.setData('note', e.target.value)}
                        placeholder="Negotiated Q3"
                    />
                </label>
                <div style={{ display: 'flex', gap: 8 }}>
                    <Button type="submit" size="sm" disabled={form.processing}>
                        Add override
                    </Button>
                    <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={onDone}
                    >
                        Cancel
                    </Button>
                </div>
            </div>

            <p
                style={{
                    marginTop: 12,
                    fontSize: 'var(--ox-text-xs)',
                    color: 'var(--ox-text-subtle)',
                }}
            >
                A <strong>min margin floor</strong> guarantees you never bill
                below real cost × (1 + floor), even if a provider raises prices
                before you notice.
            </p>
        </form>
    );
}

/* ------------------------------------------- Charges ---------------------------------------- */

function ChargesTab({
    client,
    charges,
    catalog,
}: {
    client: Client;
    charges: Charge[];
    catalog: Props['catalog'];
}) {
    const [kind, setKind] = useState<'fee' | 'usage'>('fee');
    const form = useForm<Record<string, string | number>>({
        client_id: client.id,
        kind: 'fee',
        cadence: 'monthly',
        name: '',
        amount_cents: 0,
        provider: '',
        model: '',
        input_tokens: 0,
        output_tokens: 0,
    });

    const chosen = catalog.find((c) => c.model === form.data.model);
    const estCost = chosen
        ? (Number(form.data.input_tokens) / 1e6) * chosen.in +
          (Number(form.data.output_tokens) / 1e6) * chosen.out
        : 0;
    const estBilled = estCost * (1 + client.markup_bps / 10000);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        form.transform((d) => ({
            ...d,
            kind,
            provider: d.provider || chosen?.provider || '',
        }));
        form.post('/admin/charges', {
            preserveScroll: true,
            onSuccess: () =>
                form.reset(
                    'name',
                    'amount_cents',
                    'input_tokens',
                    'output_tokens',
                ),
        });
    };

    return (
        <>
            <Section
                title="Charges"
                hint="Recurring fees, one-off credits, and off-platform AI cost billed through the rate card."
            >
                {charges.length === 0 ? (
                    <p
                        style={{
                            color: 'var(--ox-text-subtle)',
                            fontSize: 'var(--ox-text-sm)',
                        }}
                    >
                        No charges configured.
                    </p>
                ) : (
                    <table
                        style={{ width: '100%', borderCollapse: 'collapse' }}
                    >
                        <thead>
                            <tr>
                                <th style={th}>Name</th>
                                <th style={th}>Type</th>
                                <th style={th}>Cadence</th>
                                <th style={{ ...th, textAlign: 'right' }}>
                                    Amount
                                </th>
                                <th style={th}>Last billed</th>
                                <th style={{ ...th, textAlign: 'right' }}></th>
                            </tr>
                        </thead>
                        <tbody>
                            {charges.map((c) => (
                                <tr
                                    key={c.id}
                                    style={
                                        !c.active
                                            ? { opacity: 0.55 }
                                            : undefined
                                    }
                                >
                                    <td style={{ ...td, fontWeight: 600 }}>
                                        {c.name}
                                        {c.kind === 'usage' && (
                                            <div
                                                style={{
                                                    fontSize: 11,
                                                    fontWeight: 400,
                                                    color: 'var(--ox-text-subtle)',
                                                    ...mono,
                                                }}
                                            >
                                                {c.model} ·{' '}
                                                {tokens(c.input_tokens)} in /{' '}
                                                {tokens(c.output_tokens)} out
                                            </div>
                                        )}
                                    </td>
                                    <td style={td}>
                                        <Badge
                                            tone={
                                                c.kind === 'usage'
                                                    ? 'info'
                                                    : c.amount_cents < 0
                                                      ? 'success'
                                                      : 'neutral'
                                            }
                                            dot={false}
                                        >
                                            {c.kind === 'usage'
                                                ? 'Shows as usage'
                                                : c.amount_cents < 0
                                                  ? 'Credit'
                                                  : 'Fee'}
                                        </Badge>
                                    </td>
                                    <td style={{ ...td, fontSize: 12.5 }}>
                                        {c.cadence}
                                    </td>
                                    <td
                                        style={{
                                            ...td,
                                            textAlign: 'right',
                                            ...mono,
                                        }}
                                    >
                                        {c.kind === 'usage' &&
                                        c.amount_cents === 0
                                            ? 'rate card'
                                            : money(c.amount_cents)}
                                    </td>
                                    <td
                                        style={{
                                            ...td,
                                            fontSize: 12,
                                            color: 'var(--ox-text-subtle)',
                                        }}
                                    >
                                        {c.last_run ?? 'never'} · {c.runs} run
                                        {c.runs === 1 ? '' : 's'}
                                    </td>
                                    <td
                                        style={{
                                            ...td,
                                            textAlign: 'right',
                                            whiteSpace: 'nowrap',
                                        }}
                                    >
                                        {c.cadence !== 'once' && (
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() =>
                                                    router.post(
                                                        `/admin/charges/${c.id}/run`,
                                                        {},
                                                        {
                                                            preserveScroll: true,
                                                        },
                                                    )
                                                }
                                            >
                                                Bill now
                                            </Button>
                                        )}
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() =>
                                                router.delete(
                                                    `/admin/charges/${c.id}`,
                                                    { preserveScroll: true },
                                                )
                                            }
                                        >
                                            <Icon
                                                name="trash"
                                                size={13}
                                                color="var(--ox-danger)"
                                            />
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
                        {(
                            [
                                ['fee', 'Fee or credit'],
                                ['usage', 'AI cost (shows as token usage)'],
                            ] as const
                        ).map(([k, label]) => (
                            <button
                                key={k}
                                type="button"
                                onClick={() => setKind(k)}
                                style={{
                                    padding: '7px 13px',
                                    borderRadius: 'var(--ox-radius-full)',
                                    cursor: 'pointer',
                                    fontSize: 'var(--ox-text-sm)',
                                    fontWeight: 600,
                                    border:
                                        '1px solid ' +
                                        (kind === k
                                            ? 'transparent'
                                            : 'var(--ox-border)'),
                                    background:
                                        kind === k
                                            ? 'var(--ox-primary-subtle)'
                                            : 'transparent',
                                    color:
                                        kind === k
                                            ? 'var(--ox-green-700)'
                                            : 'var(--ox-text-muted)',
                                }}
                            >
                                {label}
                            </button>
                        ))}
                    </div>

                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns:
                                'repeat(auto-fit, minmax(170px, 1fr))',
                            gap: 12,
                            alignItems: 'end',
                        }}
                    >
                        <label>
                            <Lbl>Name (shown on their statement)</Lbl>
                            <input
                                style={input}
                                value={String(form.data.name)}
                                onChange={(e) =>
                                    form.setData('name', e.target.value)
                                }
                                placeholder={
                                    kind === 'fee'
                                        ? 'Platform fee'
                                        : 'Batch processing'
                                }
                            />
                        </label>
                        <label>
                            <Lbl>Cadence</Lbl>
                            <select
                                style={input}
                                value={String(form.data.cadence)}
                                onChange={(e) =>
                                    form.setData('cadence', e.target.value)
                                }
                            >
                                <option value="once">
                                    One-off (bills now)
                                </option>
                                <option value="daily">Daily</option>
                                <option value="monthly">Monthly</option>
                            </select>
                        </label>

                        {kind === 'fee' ? (
                            <label>
                                <Lbl>Amount ($) — negative for a credit</Lbl>
                                <input
                                    style={{ ...input, ...mono }}
                                    type="number"
                                    step="0.01"
                                    value={Number(form.data.amount_cents) / 100}
                                    onChange={(e) =>
                                        form.setData(
                                            'amount_cents',
                                            Math.round(
                                                Number(e.target.value) * 100,
                                            ),
                                        )
                                    }
                                />
                            </label>
                        ) : (
                            <>
                                <label>
                                    <Lbl>Model</Lbl>
                                    <select
                                        style={input}
                                        value={String(form.data.model)}
                                        onChange={(e) =>
                                            form.setData(
                                                'model',
                                                e.target.value,
                                            )
                                        }
                                    >
                                        <option value="">Select…</option>
                                        {catalog.map((c) => (
                                            <option
                                                key={`${c.provider}/${c.model}`}
                                                value={c.model}
                                            >
                                                {c.model}
                                            </option>
                                        ))}
                                    </select>
                                </label>
                                <label>
                                    <Lbl>Input tokens</Lbl>
                                    <input
                                        style={{ ...input, ...mono }}
                                        type="number"
                                        min={0}
                                        value={Number(form.data.input_tokens)}
                                        onChange={(e) =>
                                            form.setData(
                                                'input_tokens',
                                                Number(e.target.value),
                                            )
                                        }
                                    />
                                </label>
                                <label>
                                    <Lbl>Output tokens</Lbl>
                                    <input
                                        style={{ ...input, ...mono }}
                                        type="number"
                                        min={0}
                                        value={Number(form.data.output_tokens)}
                                        onChange={(e) =>
                                            form.setData(
                                                'output_tokens',
                                                Number(e.target.value),
                                            )
                                        }
                                    />
                                </label>
                            </>
                        )}
                        <Button
                            type="submit"
                            size="sm"
                            disabled={form.processing}
                        >
                            Add charge
                        </Button>
                    </div>

                    {kind === 'usage' &&
                        chosen &&
                        (Number(form.data.input_tokens) > 0 ||
                            Number(form.data.output_tokens) > 0) && (
                            <p
                                style={{
                                    marginTop: 12,
                                    fontSize: 'var(--ox-text-xs)',
                                    ...mono,
                                    color: 'var(--ox-text-subtle)',
                                }}
                            >
                                Costs you {money(Math.round(estCost * 100))} ·
                                bills them {money(Math.round(estBilled * 100))}{' '}
                                at their {bps(client.markup_bps)} markup ·
                                margin{' '}
                                {money(Math.round((estBilled - estCost) * 100))}
                            </p>
                        )}

                    {kind === 'usage' && (
                        <p
                            style={{
                                marginTop: 10,
                                fontSize: 'var(--ox-text-xs)',
                                color: 'var(--ox-text-subtle)',
                                maxWidth: 700,
                            }}
                        >
                            <Icon
                                name="alert-triangle"
                                size={12}
                                color="var(--ox-warning)"
                                style={{ verticalAlign: -1, marginRight: 4 }}
                            />
                            This writes a real usage record the client sees as
                            token usage in their dashboard. It's stamped
                            <code style={{ margin: '0 3px' }}>
                                source=manual
                            </code>{' '}
                            with your name, so any line can be traced back. Use
                            it for AI cost you actually incurred on their
                            behalf.
                        </p>
                    )}
                </form>
            </Section>
        </>
    );
}

/* --------------------------------------- People & access ------------------------------------ */

function PeopleTab({
    client,
    staff,
    accessKeys,
    sources,
}: {
    client: Client;
    staff: Staff[];
    accessKeys: Props['accessKeys'];
    sources: Props['sources'];
}) {
    const form = useForm({ name: '', email: '', role: 'member' });
    const keyForm = useForm({ client_id: client.id, name: '' });

    return (
        <>
            <Section
                title="People"
                hint="Everyone who can sign in to this client's portal."
            >
                <table
                    style={{
                        width: '100%',
                        borderCollapse: 'collapse',
                        marginBottom: 16,
                    }}
                >
                    <thead>
                        <tr>
                            <th style={th}>Name</th>
                            <th style={th}>Email</th>
                            <th style={th}>Role</th>
                            <th style={th}>Last seen</th>
                            <th style={{ ...th, textAlign: 'right' }}></th>
                        </tr>
                    </thead>
                    <tbody>
                        {staff.map((u) => (
                            <tr key={u.id}>
                                <td style={{ ...td, fontWeight: 600 }}>
                                    {u.name}
                                </td>
                                <td style={{ ...td, ...mono, fontSize: 12.5 }}>
                                    {u.email}
                                </td>
                                <td style={td}>
                                    <Badge
                                        tone={
                                            u.role === 'owner'
                                                ? 'brand'
                                                : 'neutral'
                                        }
                                    >
                                        {u.role}
                                    </Badge>
                                </td>
                                <td
                                    style={{
                                        ...td,
                                        fontSize: 12.5,
                                        color: 'var(--ox-text-subtle)',
                                    }}
                                >
                                    {u.last_login}
                                </td>
                                <td
                                    style={{
                                        ...td,
                                        textAlign: 'right',
                                        whiteSpace: 'nowrap',
                                    }}
                                >
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() =>
                                            router.post(
                                                `/admin/clients/${client.id}/staff/${u.id}/invite`,
                                                {},
                                                { preserveScroll: true },
                                            )
                                        }
                                    >
                                        Resend invite
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() =>
                                            router.delete(
                                                `/admin/clients/${client.id}/staff/${u.id}`,
                                                { preserveScroll: true },
                                            )
                                        }
                                    >
                                        <Icon
                                            name="trash"
                                            size={13}
                                            color="var(--ox-danger)"
                                        />
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        form.post(`/admin/clients/${client.id}/staff`, {
                            preserveScroll: true,
                            onSuccess: () => form.reset(),
                        });
                    }}
                    style={{
                        display: 'grid',
                        gridTemplateColumns:
                            'repeat(auto-fit, minmax(160px, 1fr))',
                        gap: 12,
                        alignItems: 'end',
                    }}
                >
                    <label>
                        <Lbl>Name</Lbl>
                        <input
                            style={input}
                            value={form.data.name}
                            onChange={(e) =>
                                form.setData('name', e.target.value)
                            }
                        />
                    </label>
                    <label>
                        <Lbl>Email</Lbl>
                        <input
                            style={input}
                            type="email"
                            value={form.data.email}
                            onChange={(e) =>
                                form.setData('email', e.target.value)
                            }
                        />
                        {form.errors.email && (
                            <span
                                style={{
                                    fontSize: 11.5,
                                    color: 'var(--ox-danger)',
                                }}
                            >
                                {form.errors.email}
                            </span>
                        )}
                    </label>
                    <label>
                        <Lbl>Role</Lbl>
                        <select
                            style={input}
                            value={form.data.role}
                            onChange={(e) =>
                                form.setData('role', e.target.value)
                            }
                        >
                            <option value="member">Member</option>
                            <option value="owner">Owner</option>
                        </select>
                    </label>
                    <Button type="submit" size="sm" disabled={form.processing}>
                        Add & invite
                    </Button>
                </form>
            </Section>

            <Section
                title="Gateway keys"
                hint="What the client calls the API with. Shown once at creation."
                right={
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            keyForm.post('/admin/platform/access-keys', {
                                preserveScroll: true,
                                onSuccess: () => keyForm.reset('name'),
                            });
                        }}
                        style={{ display: 'flex', gap: 8 }}
                    >
                        <input
                            style={{ ...input, width: 150 }}
                            placeholder="Key name"
                            value={keyForm.data.name}
                            onChange={(e) =>
                                keyForm.setData('name', e.target.value)
                            }
                        />
                        <Button
                            type="submit"
                            size="sm"
                            disabled={!keyForm.data.name}
                        >
                            Issue key
                        </Button>
                    </form>
                }
            >
                {accessKeys.length === 0 ? (
                    <p
                        style={{
                            color: 'var(--ox-text-subtle)',
                            fontSize: 'var(--ox-text-sm)',
                        }}
                    >
                        No gateway keys yet.
                    </p>
                ) : (
                    <table
                        style={{ width: '100%', borderCollapse: 'collapse' }}
                    >
                        <thead>
                            <tr>
                                <th style={th}>Name</th>
                                <th style={th}>Key</th>
                                <th style={th}>Status</th>
                                <th style={th}>Last used</th>
                                <th style={{ ...th, textAlign: 'right' }}></th>
                            </tr>
                        </thead>
                        <tbody>
                            {accessKeys.map((k) => (
                                <tr key={k.id}>
                                    <td style={{ ...td, fontWeight: 600 }}>
                                        {k.name}
                                    </td>
                                    <td
                                        style={{
                                            ...td,
                                            ...mono,
                                            fontSize: 12.5,
                                        }}
                                    >
                                        {k.frag}
                                    </td>
                                    <td style={td}>
                                        <Badge
                                            tone={
                                                k.status === 'active'
                                                    ? 'success'
                                                    : 'neutral'
                                            }
                                        >
                                            {k.status}
                                        </Badge>
                                    </td>
                                    <td
                                        style={{
                                            ...td,
                                            fontSize: 12.5,
                                            color: 'var(--ox-text-subtle)',
                                        }}
                                    >
                                        {k.last_used}
                                    </td>
                                    <td style={{ ...td, textAlign: 'right' }}>
                                        {k.status === 'active' && (
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() =>
                                                    router.delete(
                                                        `/admin/platform/access-keys/${k.id}`,
                                                        {
                                                            preserveScroll: true,
                                                        },
                                                    )
                                                }
                                            >
                                                Revoke
                                            </Button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </Section>

            {sources.length > 0 && (
                <Section
                    title="Attributed provider projects"
                    hint="Usage pulled from these projects bills to this client."
                >
                    <table
                        style={{ width: '100%', borderCollapse: 'collapse' }}
                    >
                        <thead>
                            <tr>
                                <th style={th}>Label</th>
                                <th style={th}>Provider</th>
                                <th style={th}>Project</th>
                                <th style={th}>Status</th>
                                <th style={{ ...th, textAlign: 'right' }}>
                                    Revenue MTD
                                </th>
                                <th style={th}>Synced</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sources.map((s) => (
                                <tr key={s.id}>
                                    <td style={{ ...td, fontWeight: 600 }}>
                                        {s.label}
                                    </td>
                                    <td style={td}>{s.provider}</td>
                                    <td
                                        style={{ ...td, ...mono, fontSize: 12 }}
                                    >
                                        {s.project ?? '—'}
                                    </td>
                                    <td style={td}>
                                        <Badge
                                            tone={
                                                s.status === 'active'
                                                    ? 'success'
                                                    : 'neutral'
                                            }
                                        >
                                            {s.status}
                                        </Badge>
                                    </td>
                                    <td
                                        style={{
                                            ...td,
                                            textAlign: 'right',
                                            ...mono,
                                        }}
                                    >
                                        {money(s.revenue_cents)}
                                    </td>
                                    <td
                                        style={{
                                            ...td,
                                            fontSize: 12.5,
                                            color: 'var(--ox-text-subtle)',
                                        }}
                                    >
                                        {s.synced}
                                    </td>
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

function BillingTab({
    client,
    ledger,
    topUps,
    cards,
}: {
    client: Client;
    ledger: Props['ledger'];
    topUps: Props['topUps'];
    cards: Props['cards'];
}) {
    return (
        <>
            <Section
                title="Payment methods"
                hint={
                    client.billings_customer_id
                        ? `billings customer ${client.billings_customer_id}`
                        : 'Not yet linked to billings.systems'
                }
            >
                {cards.length === 0 ? (
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            color: 'var(--ox-warning)',
                            fontSize: 'var(--ox-text-sm)',
                        }}
                    >
                        <Icon
                            name="alert-triangle"
                            size={15}
                            color="var(--ox-warning)"
                        />{' '}
                        No card on file — auto top-up cannot run.
                    </div>
                ) : (
                    cards.map((c) => (
                        <div
                            key={c.last4}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 10,
                                padding: '8px 0',
                            }}
                        >
                            <Icon
                                name="credit-card"
                                size={16}
                                color="var(--ox-text-subtle)"
                            />
                            <span style={mono}>
                                {c.brand} •••• {c.last4}
                            </span>
                            <span
                                style={{
                                    color: 'var(--ox-text-subtle)',
                                    fontSize: 12.5,
                                }}
                            >
                                exp {c.exp}
                            </span>
                            {c.default && <Badge tone="brand">default</Badge>}
                        </div>
                    ))
                )}
            </Section>

            <Section title="Top-ups">
                {topUps.length === 0 ? (
                    <p
                        style={{
                            color: 'var(--ox-text-subtle)',
                            fontSize: 'var(--ox-text-sm)',
                        }}
                    >
                        No top-ups yet.
                    </p>
                ) : (
                    <table
                        style={{ width: '100%', borderCollapse: 'collapse' }}
                    >
                        <thead>
                            <tr>
                                <th style={th}>Date</th>
                                <th style={{ ...th, textAlign: 'right' }}>
                                    Amount
                                </th>
                                <th style={th}>Trigger</th>
                                <th style={th}>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {topUps.map((t, i) => (
                                <tr key={i}>
                                    <td style={td}>{t.date}</td>
                                    <td
                                        style={{
                                            ...td,
                                            textAlign: 'right',
                                            ...mono,
                                        }}
                                    >
                                        {money(t.amount_cents)}
                                    </td>
                                    <td style={{ ...td, fontSize: 12.5 }}>
                                        {t.trigger}
                                    </td>
                                    <td style={td}>
                                        <Badge
                                            tone={
                                                t.status === 'succeeded'
                                                    ? 'success'
                                                    : t.status === 'failed'
                                                      ? 'danger'
                                                      : 'warning'
                                            }
                                        >
                                            {t.status}
                                        </Badge>
                                        {t.reason && (
                                            <div
                                                style={{
                                                    fontSize: 11,
                                                    color: 'var(--ox-danger)',
                                                }}
                                            >
                                                {t.reason}
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </Section>

            <Section
                title="Ledger"
                hint="Every movement on this account, newest first."
            >
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr>
                            <th style={th}>Date</th>
                            <th style={th}>Type</th>
                            <th style={th}>Description</th>
                            <th style={{ ...th, textAlign: 'right' }}>
                                Amount
                            </th>
                            <th style={{ ...th, textAlign: 'right' }}>
                                Balance
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {ledger.map((e, i) => (
                            <tr key={i}>
                                <td
                                    style={{
                                        ...td,
                                        whiteSpace: 'nowrap',
                                        fontSize: 12.5,
                                    }}
                                >
                                    {e.date}
                                </td>
                                <td
                                    style={{
                                        ...td,
                                        fontSize: 12.5,
                                        color: 'var(--ox-text-subtle)',
                                    }}
                                >
                                    {e.type}
                                </td>
                                <td style={{ ...td, fontSize: 12.5 }}>
                                    {e.desc ?? '—'}
                                </td>
                                <td
                                    style={{
                                        ...td,
                                        textAlign: 'right',
                                        ...mono,
                                        color:
                                            e.amount_cents >= 0
                                                ? 'var(--ox-success)'
                                                : 'var(--ox-text)',
                                    }}
                                >
                                    {money(e.amount_cents, { sign: true })}
                                </td>
                                <td
                                    style={{
                                        ...td,
                                        textAlign: 'right',
                                        ...mono,
                                        color: 'var(--ox-text-subtle)',
                                    }}
                                >
                                    {money(e.balance_after_cents)}
                                </td>
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
        <Section
            title="Activity"
            hint="Privileged actions taken on this account, including impersonation."
        >
            {audit.length === 0 ? (
                <p
                    style={{
                        color: 'var(--ox-text-subtle)',
                        fontSize: 'var(--ox-text-sm)',
                    }}
                >
                    Nothing yet.
                </p>
            ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr>
                            <th style={th}>When</th>
                            <th style={th}>Action</th>
                            <th style={th}>Actor</th>
                            <th style={th}>Detail</th>
                        </tr>
                    </thead>
                    <tbody>
                        {audit.map((a, i) => (
                            <tr key={i}>
                                <td
                                    style={{
                                        ...td,
                                        whiteSpace: 'nowrap',
                                        fontSize: 12.5,
                                    }}
                                >
                                    {a.at}
                                </td>
                                <td style={{ ...td, ...mono, fontSize: 12 }}>
                                    {a.action}
                                </td>
                                <td style={{ ...td, fontSize: 12.5 }}>
                                    {a.actor}
                                </td>
                                <td
                                    style={{
                                        ...td,
                                        fontSize: 12.5,
                                        color: 'var(--ox-text-subtle)',
                                    }}
                                >
                                    {a.summary ?? '—'}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </Section>
    );
}
