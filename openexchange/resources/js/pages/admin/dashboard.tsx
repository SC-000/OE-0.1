import { Head, Link } from '@inertiajs/react';
import { Card, Badge, Icon, StatCard, LineArea } from '@/components/oe';
import AdminLayout from '@/layouts/admin-layout';
import { money, moneyShort, num, pct, tokens } from '@/lib/format';

type Overview = {
    revenue_cents: number;
    cost_cents: number;
    margin_cents: number;
    margin_pct: number | null;
    effective_markup_pct: number | null;
    projected_revenue_cents: number;
    projected_margin_cents: number;
    revenue_delta_pct: number | null;
    margin_delta_pct: number | null;
    requests: number;
    tokens: number;
    blended_per_1k: number | null;
};
type Leak = {
    provider: string;
    model: string;
    kind: 'unpriced' | 'below_cost' | 'thin';
    revenue_cents: number;
    cost_cents: number;
    margin_cents: number;
    markup_pct: number | null;
    tokens: number;
    impact_cents: number;
};
type TopModel = {
    provider: string;
    model: string;
    revenue_cents: number;
    margin_cents: number;
    margin_pct: number | null;
    tokens: number;
    requests: number;
};
type ClientPerf = {
    id: number;
    name: string;
    revenue_cents: number;
    margin_cents: number;
    margin_pct: number | null;
    share_pct: number;
    balance_cents: number;
    markup_pct: number;
};
type Risk = {
    id: number;
    name: string;
    reason: string;
    balance_cents: number;
    has_card: boolean;
    auto_topup: boolean;
    exposure_cents: number;
};
type Churn = {
    id: number;
    name: string;
    prior_cents: number;
    recent_cents: number;
    drop_pct: number;
};
type ProfitSeries = {
    range: string;
    bucket: 'hour' | 'day';
    granularity: string;
    labels: string[];
    revenue: number[];
    cost: number[];
    margin: number[];
};
type SeriesOption = {
    value: string;
    label: string;
    granularity: string;
};

type Props = {
    overview: Overview;
    series: ProfitSeries;
    seriesOptions: SeriesOption[];
    leaks: Leak[];
    topModels: TopModel[];
    clients: ClientPerf[];
    risk: Risk[];
    churn: Churn[];
    attention: {
        pending_proposals: number;
        unpriced_models: number;
        failed_topups_7d: number;
        suspended_clients: number;
        untiered_models: number;
    };
    counts: { clients: number; active_models: number };
    lastPull?: { at: string } | null;
    lastCharges?: { at: string } | null;
};

const LEAK_COPY: Record<
    Leak['kind'],
    { label: string; tone: 'danger' | 'warning'; fix: string }
> = {
    unpriced: {
        label: 'Unpriced',
        tone: 'danger',
        fix: 'No cost basis — billing $0. Price it.',
    },
    below_cost: {
        label: 'Below cost',
        tone: 'danger',
        fix: 'You bill less than you pay. Raise the rate.',
    },
    thin: { label: 'Thin margin', tone: 'warning', fix: 'Under 5% markup.' },
};

const RISK_COPY: Record<string, string> = {
    in_debt: 'Negative balance',
    low_no_autotopup: 'Low, auto top-up off',
    low_no_card: 'Low, no card on file',
    no_card: 'No card on file',
};

const sectionTitle = (text: string, hint?: string) => (
    <div style={{ marginBottom: 12 }}>
        <h2
            style={{
                margin: 0,
                fontSize: 'var(--ox-text-md)',
                fontWeight: 700,
            }}
        >
            {text}
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
);

const th: React.CSSProperties = {
    textAlign: 'left',
    padding: '8px 10px',
    fontSize: 11,
    fontWeight: 600,
    color: 'var(--ox-text-subtle)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    borderBottom: '1px solid var(--ox-border)',
};
const td: React.CSSProperties = {
    padding: '9px 10px',
    fontSize: 'var(--ox-text-sm)',
    borderBottom: '1px solid var(--ox-border-subtle, var(--ox-border))',
};
const mono: React.CSSProperties = { fontFamily: 'var(--ox-font-mono)' };

const chartTickLabels = (series: ProfitSeries) => {
    const step = Math.max(1, Math.ceil(series.labels.length / 6));

    return series.labels.map((label, i) => {
        const show = i === 0 || i === series.labels.length - 1 || i % step === 0;
        if (!show) {
            return '';
        }

        if (series.bucket === 'hour') {
            const [date, time = ''] = label.split(' ');

            return `${date.slice(5)} ${time.slice(0, 2)}h`;
        }

        return label.slice(5);
    });
};

export default function AdminDashboard({
    overview,
    series,
    seriesOptions,
    leaks,
    topModels,
    clients,
    risk,
    churn,
    attention,
    counts,
    lastPull,
    lastCharges,
}: Props) {
    const totalLeak = leaks.reduce((s, l) => s + l.impact_cents, 0);
    const topClient = clients[0];
    const activeSeriesOption = seriesOptions.find((o) => o.value === series.range);

    const actions = [
        attention.pending_proposals && {
            label: `${attention.pending_proposals} price change${attention.pending_proposals > 1 ? 's' : ''} to review`,
            href: '/admin/models',
            tone: 'warning' as const,
        },
        attention.unpriced_models && {
            label: `${attention.unpriced_models} unpriced model${attention.unpriced_models > 1 ? 's' : ''}`,
            href: '/admin/models',
            tone: 'danger' as const,
        },
        attention.failed_topups_7d && {
            label: `${attention.failed_topups_7d} failed top-up${attention.failed_topups_7d > 1 ? 's' : ''} (7d)`,
            href: '/admin/clients',
            tone: 'danger' as const,
        },
        attention.suspended_clients && {
            label: `${attention.suspended_clients} suspended client${attention.suspended_clients > 1 ? 's' : ''}`,
            href: '/admin/clients',
            tone: 'neutral' as const,
        },
    ].filter(Boolean) as {
        label: string;
        href: string;
        tone: 'warning' | 'danger' | 'neutral';
    }[];

    return (
        <AdminLayout
            active="dashboard"
            title="Platform overview"
            subtitle="Month to date — revenue, cost and margin across every client"
            actions={
                <>
                    <Link href="/admin/models">
                        <span
                            style={{
                                fontSize: 'var(--ox-text-sm)',
                                color: 'var(--ox-text-subtle)',
                            }}
                        >
                            {counts.active_models} models
                        </span>
                    </Link>
                    <Link href="/admin/clients">
                        <span
                            style={{
                                fontSize: 'var(--ox-text-sm)',
                                color: 'var(--ox-text-subtle)',
                            }}
                        >
                            {counts.clients} clients
                        </span>
                    </Link>
                </>
            }
        >
            <Head title="Admin — Overview" />

            {actions.length > 0 && (
                <Card
                    padding="md"
                    style={{
                        marginBottom: 20,
                        borderLeft: '3px solid var(--ox-gold-500)',
                    }}
                >
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 12,
                            flexWrap: 'wrap',
                        }}
                    >
                        <Icon
                            name="bell"
                            size={16}
                            color="var(--ox-gold-600)"
                        />
                        <strong style={{ fontSize: 'var(--ox-text-sm)' }}>
                            Needs your attention
                        </strong>
                        {actions.map((a) => (
                            <Link
                                key={a.label}
                                href={a.href}
                                style={{ textDecoration: 'none' }}
                            >
                                <Badge tone={a.tone}>{a.label}</Badge>
                            </Link>
                        ))}
                    </div>
                </Card>
            )}

            {/* Headline P&L */}
            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
                    gap: 14,
                    marginBottom: 22,
                }}
            >
                <StatCard
                    label="Revenue (MTD)"
                    value={money(overview.revenue_cents)}
                    delta={
                        overview.revenue_delta_pct != null
                            ? `${overview.revenue_delta_pct > 0 ? '+' : ''}${overview.revenue_delta_pct}%`
                            : undefined
                    }
                    deltaDirection={
                        (overview.revenue_delta_pct ?? 0) >= 0 ? 'up' : 'down'
                    }
                    hint={`Projected ${moneyShort(overview.projected_revenue_cents)}`}
                />
                <StatCard
                    label="Provider cost"
                    value={money(overview.cost_cents)}
                    hint="What the models cost you"
                />
                <StatCard
                    label="Gross margin"
                    value={money(overview.margin_cents)}
                    delta={
                        overview.margin_delta_pct != null
                            ? `${overview.margin_delta_pct > 0 ? '+' : ''}${overview.margin_delta_pct}%`
                            : undefined
                    }
                    deltaDirection={
                        (overview.margin_delta_pct ?? 0) >= 0 ? 'up' : 'down'
                    }
                    hint={`${pct(overview.margin_pct)} of revenue`}
                />
                <StatCard
                    label="Effective markup"
                    value={pct(overview.effective_markup_pct)}
                    hint="Realised, not configured"
                />
                <StatCard
                    label="Blended rate"
                    value={
                        overview.blended_per_1k != null
                            ? `$${overview.blended_per_1k.toFixed(4)}`
                            : '—'
                    }
                    hint="per 1k tokens sold"
                />
            </div>

            <Card padding="lg" style={{ marginBottom: 22 }}>
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        gap: 16,
                        flexWrap: 'wrap',
                        marginBottom: 4,
                    }}
                >
                    {sectionTitle(
                        'Revenue, cost & margin',
                        `${activeSeriesOption?.label ?? series.range} · ${activeSeriesOption?.granularity ?? series.granularity} buckets`,
                    )}
                    <div
                        role="tablist"
                        aria-label="Revenue chart range"
                        style={{
                            display: 'inline-flex',
                            gap: 3,
                            padding: 3,
                            border: '1px solid var(--ox-border)',
                            borderRadius: 'var(--ox-radius-md)',
                            background: 'var(--ox-bg)',
                        }}
                    >
                        {seriesOptions.map((option) => {
                            const active = option.value === series.range;

                            return (
                                <Link
                                    key={option.value}
                                    href={
                                        option.value === '30d'
                                            ? '/admin'
                                            : `/admin?range=${option.value}`
                                    }
                                    preserveScroll
                                    role="tab"
                                    aria-selected={active}
                                    style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        minWidth: 44,
                                        height: 28,
                                        padding: '0 10px',
                                        borderRadius: 'var(--ox-radius-sm)',
                                        textDecoration: 'none',
                                        fontSize: 'var(--ox-text-xs)',
                                        fontWeight: 700,
                                        color: active
                                            ? '#fff'
                                            : 'var(--ox-text-subtle)',
                                        background: active
                                            ? 'var(--ox-ink-900)'
                                            : 'transparent',
                                    }}
                                >
                                    {option.label}
                                </Link>
                            );
                        })}
                    </div>
                </div>
                <LineArea
                    height={230}
                    xLabels={chartTickLabels(series)}
                    series={[
                        {
                            name: 'Revenue',
                            values: series.revenue,
                            color: '#33c13e',
                        },
                        {
                            name: 'Cost',
                            values: series.cost,
                            color: '#c9992e',
                        },
                        {
                            name: 'Margin',
                            values: series.margin,
                            color: '#2a7de1',
                        },
                    ]}
                    valueFmt={(v: number) => `$${v.toFixed(0)}`}
                />
            </Card>

            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))',
                    gap: 18,
                    marginBottom: 22,
                }}
            >
                {/* Margin leaks */}
                <Card padding="lg">
                    {sectionTitle(
                        'Margin leaks',
                        totalLeak > 0
                            ? `${money(totalLeak)} of margin at risk this month`
                            : 'Nothing losing money right now',
                    )}
                    {leaks.length === 0 ? (
                        <Empty
                            icon="check"
                            text="Every model with traffic is billing above cost."
                        />
                    ) : (
                        <table
                            style={{
                                width: '100%',
                                borderCollapse: 'collapse',
                            }}
                        >
                            <thead>
                                <tr>
                                    <th style={th}>Model</th>
                                    <th style={th}>Issue</th>
                                    <th style={{ ...th, textAlign: 'right' }}>
                                        Impact
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {leaks.map((l) => (
                                    <tr key={`${l.provider}/${l.model}`}>
                                        <td style={td}>
                                            <div
                                                style={{
                                                    ...mono,
                                                    fontSize: 12.5,
                                                }}
                                            >
                                                {l.model}
                                            </div>
                                            <div
                                                style={{
                                                    fontSize: 11,
                                                    color: 'var(--ox-text-subtle)',
                                                }}
                                            >
                                                {tokens(l.tokens)} tokens ·{' '}
                                                {LEAK_COPY[l.kind].fix}
                                            </div>
                                        </td>
                                        <td style={td}>
                                            <Badge
                                                tone={LEAK_COPY[l.kind].tone}
                                            >
                                                {LEAK_COPY[l.kind].label}
                                            </Badge>
                                        </td>
                                        <td
                                            style={{
                                                ...td,
                                                textAlign: 'right',
                                                ...mono,
                                                color: 'var(--ox-danger)',
                                                fontWeight: 600,
                                            }}
                                        >
                                            {l.impact_cents > 0
                                                ? `−${money(l.impact_cents).replace('$', '$')}`
                                                : '—'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                    <Link
                        href="/admin/models"
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 5,
                            marginTop: 12,
                            fontSize: 'var(--ox-text-sm)',
                            color: 'var(--ox-primary)',
                            textDecoration: 'none',
                            fontWeight: 600,
                        }}
                    >
                        Fix pricing{' '}
                        <Icon
                            name="arrow-right"
                            size={14}
                            color="var(--ox-primary)"
                        />
                    </Link>
                </Card>

                {/* Collection risk */}
                <Card padding="lg">
                    {sectionTitle(
                        'Collection risk',
                        'Accounts that will cost you money if left alone',
                    )}
                    {risk.length === 0 ? (
                        <Empty
                            icon="check"
                            text="Every account is funded and has a card on file."
                        />
                    ) : (
                        <table
                            style={{
                                width: '100%',
                                borderCollapse: 'collapse',
                            }}
                        >
                            <thead>
                                <tr>
                                    <th style={th}>Client</th>
                                    <th style={th}>Reason</th>
                                    <th style={{ ...th, textAlign: 'right' }}>
                                        Balance
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {risk.slice(0, 8).map((r) => (
                                    <tr key={r.id}>
                                        <td style={td}>
                                            <Link
                                                href={`/admin/clients/${r.id}`}
                                                style={{
                                                    color: 'var(--ox-text)',
                                                    fontWeight: 600,
                                                    textDecoration: 'none',
                                                }}
                                            >
                                                {r.name}
                                            </Link>
                                        </td>
                                        <td style={td}>
                                            <Badge
                                                tone={
                                                    r.reason === 'in_debt'
                                                        ? 'danger'
                                                        : 'warning'
                                                }
                                            >
                                                {RISK_COPY[r.reason]}
                                            </Badge>
                                        </td>
                                        <td
                                            style={{
                                                ...td,
                                                textAlign: 'right',
                                                ...mono,
                                                color:
                                                    r.balance_cents < 0
                                                        ? 'var(--ox-danger)'
                                                        : 'inherit',
                                            }}
                                        >
                                            {money(r.balance_cents)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </Card>
            </div>

            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))',
                    gap: 18,
                    marginBottom: 22,
                }}
            >
                {/* Client performance */}
                <Card padding="lg">
                    {sectionTitle(
                        'Clients by margin',
                        topClient
                            ? `${topClient.name} is ${topClient.share_pct}% of revenue${topClient.share_pct > 50 ? ' — concentration risk' : ''}`
                            : 'No revenue yet',
                    )}
                    <table
                        style={{ width: '100%', borderCollapse: 'collapse' }}
                    >
                        <thead>
                            <tr>
                                <th style={th}>Client</th>
                                <th style={{ ...th, textAlign: 'right' }}>
                                    Revenue
                                </th>
                                <th style={{ ...th, textAlign: 'right' }}>
                                    Margin
                                </th>
                                <th style={{ ...th, textAlign: 'right' }}>
                                    Share
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {clients.slice(0, 8).map((c) => (
                                <tr key={c.id}>
                                    <td style={td}>
                                        <Link
                                            href={`/admin/clients/${c.id}`}
                                            style={{
                                                color: 'var(--ox-text)',
                                                fontWeight: 600,
                                                textDecoration: 'none',
                                            }}
                                        >
                                            {c.name}
                                        </Link>
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
                                        {money(c.margin_cents)}{' '}
                                        <span
                                            style={{
                                                color: 'var(--ox-text-subtle)',
                                                fontSize: 11,
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
                                        {c.share_pct}%
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </Card>

                {/* Top models */}
                <Card padding="lg">
                    {sectionTitle(
                        'Most profitable models',
                        'Where your margin actually comes from',
                    )}
                    <table
                        style={{ width: '100%', borderCollapse: 'collapse' }}
                    >
                        <thead>
                            <tr>
                                <th style={th}>Model</th>
                                <th style={{ ...th, textAlign: 'right' }}>
                                    Revenue
                                </th>
                                <th style={{ ...th, textAlign: 'right' }}>
                                    Margin
                                </th>
                                <th style={{ ...th, textAlign: 'right' }}>
                                    Tokens
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {topModels.length === 0 && (
                                <tr>
                                    <td style={td} colSpan={4}>
                                        <Empty
                                            icon="activity"
                                            text="No usage this month yet."
                                        />
                                    </td>
                                </tr>
                            )}
                            {topModels.map((m) => (
                                <tr key={`${m.provider}/${m.model}`}>
                                    <td
                                        style={{
                                            ...td,
                                            ...mono,
                                            fontSize: 12.5,
                                        }}
                                    >
                                        {m.model}
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
                                            color:
                                                m.margin_cents < 0
                                                    ? 'var(--ox-danger)'
                                                    : 'var(--ox-success)',
                                        }}
                                    >
                                        {money(m.margin_cents)}
                                    </td>
                                    <td
                                        style={{
                                            ...td,
                                            textAlign: 'right',
                                            ...mono,
                                            color: 'var(--ox-text-subtle)',
                                        }}
                                    >
                                        {tokens(m.tokens)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </Card>
            </div>

            {churn.length > 0 && (
                <Card padding="lg" style={{ marginBottom: 22 }}>
                    {sectionTitle(
                        'Usage falling',
                        'Spend down materially in the last 7 days vs the 7 before — the earliest churn signal you get',
                    )}
                    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                        {churn.map((c) => (
                            <Link
                                key={c.id}
                                href={`/admin/clients/${c.id}`}
                                style={{ textDecoration: 'none' }}
                            >
                                <Card
                                    padding="sm"
                                    interactive
                                    style={{ minWidth: 210 }}
                                >
                                    <div
                                        style={{
                                            fontWeight: 600,
                                            fontSize: 'var(--ox-text-sm)',
                                        }}
                                    >
                                        {c.name}
                                    </div>
                                    <div
                                        style={{
                                            fontSize: 'var(--ox-text-xs)',
                                            color: 'var(--ox-text-subtle)',
                                            marginTop: 3,
                                        }}
                                    >
                                        {money(c.prior_cents)} →{' '}
                                        {money(c.recent_cents)}
                                    </div>
                                    <div style={{ marginTop: 6 }}>
                                        <Badge tone="warning">
                                            −{c.drop_pct}%
                                        </Badge>
                                    </div>
                                </Card>
                            </Link>
                        ))}
                    </div>
                </Card>
            )}

            <div
                style={{
                    display: 'flex',
                    gap: 18,
                    fontSize: 'var(--ox-text-xs)',
                    color: 'var(--ox-text-subtle)',
                    flexWrap: 'wrap',
                }}
            >
                <span>Usage pull: {lastPull?.at ?? 'never'}</span>
                <span>Charges run: {lastCharges?.at ?? 'never'}</span>
                <span>
                    {num(overview.requests)} requests ·{' '}
                    {tokens(overview.tokens)} tokens MTD
                </span>
            </div>
        </AdminLayout>
    );
}

function Empty({ icon, text }: { icon: string; text: string }) {
    return (
        <div
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '14px 0',
                color: 'var(--ox-text-subtle)',
                fontSize: 'var(--ox-text-sm)',
            }}
        >
            <Icon name={icon} size={15} color="var(--ox-text-subtle)" />
            {text}
        </div>
    );
}
