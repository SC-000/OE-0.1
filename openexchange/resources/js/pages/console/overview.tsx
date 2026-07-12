import { Head, Link } from '@inertiajs/react';
import {
    Badge,
    Button,
    Card,
    Icon,
    InkSwirl,
    inkSwirlSurface,
    LineArea,
    StatCard,
} from '@/components/oe';
import ConsoleLayout from '@/layouts/console-layout';
import { money, num, tokens as fmtTokens } from '@/lib/format';

type Alert = {
    tone: 'danger' | 'warning' | 'info';
    title: string;
    body: string;
};
type Props = {
    account: { name: string; id: string; type: string; since: string };
    balance: {
        cents: number;
        low_threshold_cents: number;
        topup_cents: number;
        auto_topup: boolean;
        has_card: boolean;
        runway_days: number | null;
        daily_burn_cents: number;
    };
    spend: {
        mtd_cents: number;
        projected_cents: number;
        last_month_cents: number;
        delta_pct: number | null;
        days_elapsed: number;
        days_in_month: number;
        requests: number;
        tokens: number;
        tokens_30d: number;
    };
    efficiency: {
        per_1k_cents: number | null;
        per_1k_last_month_cents: number | null;
        delta_pct: number | null;
        models_available: number;
        providers: number;
    };
    daily: { date: string; cents: number }[];
    alerts: Alert[];
    sources: { label: string; spend_cents: number; share_pct: number }[];
    recent: {
        model: string;
        provider: string;
        tokens: number;
        billed_cents: number;
        at: string;
    }[];
};

const TONE: Record<Alert['tone'], { bg: string; fg: string; icon: string }> = {
    danger: {
        bg: 'var(--ox-danger-surface)',
        fg: 'var(--ox-danger)',
        icon: 'alert-triangle',
    },
    warning: {
        bg: 'var(--ox-warning-surface)',
        fg: 'var(--ox-warning)',
        icon: 'alert-triangle',
    },
    info: {
        bg: 'var(--ox-info-surface)',
        fg: 'var(--ox-info)',
        icon: 'activity',
    },
};

/** Cents per 1k tokens, shown as money to 4dp — these figures are genuinely tiny. */
const per1k = (c: number | null) =>
    c === null ? '—' : `$${(c / 100).toFixed(4)}`;

const th: React.CSSProperties = {
    padding: '9px 18px',
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    color: 'var(--ox-text-subtle)',
    fontWeight: 600,
    borderBottom: '1px solid var(--ox-divider)',
    textAlign: 'left',
};
const td: React.CSSProperties = {
    padding: '11px 18px',
    borderBottom: '1px solid var(--ox-divider)',
    fontSize: 'var(--ox-text-sm)',
};
const mono: React.CSSProperties = { fontFamily: 'var(--ox-font-mono)' };

export default function Overview({
    account,
    balance,
    spend,
    efficiency,
    daily,
    alerts,
    sources,
    recent,
}: Props) {
    const runway = balance.runway_days;
    const cheaper = efficiency.delta_pct !== null && efficiency.delta_pct < 0;
    const dearer = efficiency.delta_pct !== null && efficiency.delta_pct > 0;

    return (
        <ConsoleLayout
            active="overview"
            title="Overview"
            subtitle={`${account.name} · ${account.type}`}
        >
            <Head title="Overview — Account" />

            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {/* Balance leads. It is the number the customer came here for — so it
                    wears the ink-and-swirl surface of the payment card, and nothing else
                    on the page does. */}
                <Card
                    padding="lg"
                    className="ox-card oe-ink-swirl"
                    style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: 28,
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        ...inkSwirlSurface,
                    }}
                >
                    <InkSwirl />

                    <div>
                        <div
                            style={{
                                fontSize: 12,
                                color: 'var(--ox-text-subtle)',
                                textTransform: 'uppercase',
                                letterSpacing: '0.06em',
                                fontWeight: 600,
                            }}
                        >
                            Balance
                        </div>
                        <div
                            style={{
                                ...mono,
                                fontSize: 40,
                                fontWeight: 500,
                                letterSpacing: '-0.02em',
                                marginTop: 4,
                                color:
                                    balance.cents < 0
                                        ? 'var(--ox-danger)'
                                        : 'var(--ox-text)',
                            }}
                        >
                            {money(balance.cents)}
                        </div>
                        <div
                            style={{
                                fontSize: 13,
                                color: 'var(--ox-text-muted)',
                                marginTop: 6,
                            }}
                        >
                            {balance.daily_burn_cents > 0 ? (
                                <>
                                    You’re using about{' '}
                                    <strong style={mono}>
                                        {money(balance.daily_burn_cents)}
                                    </strong>{' '}
                                    a day
                                    {runway !== null && (
                                        <>
                                            {' '}
                                            — roughly{' '}
                                            <strong>
                                                {runway === 0
                                                    ? 'less than a day'
                                                    : `${num(runway)} day${runway === 1 ? '' : 's'}`}
                                            </strong>{' '}
                                            of balance left.
                                        </>
                                    )}
                                </>
                            ) : (
                                <>No usage in the last two weeks.</>
                            )}
                        </div>
                    </div>

                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 10,
                            alignItems: 'flex-end',
                        }}
                    >
                        {balance.auto_topup && balance.has_card ? (
                            <Badge tone="success">
                                Auto top-up on · adds{' '}
                                {money(balance.topup_cents)} below{' '}
                                {money(balance.low_threshold_cents)}
                            </Badge>
                        ) : (
                            <Badge tone="warning">
                                Auto top-up{' '}
                                {balance.has_card ? 'off' : 'needs a card'}
                            </Badge>
                        )}
                        <div
                            style={{
                                display: 'flex',
                                flexWrap: 'wrap',
                                gap: 8,
                            }}
                        >
                            <Button
                                as={Link}
                                href="/console/billing"
                                size="sm"
                                variant="secondary"
                            >
                                Manage billing
                            </Button>
                            <Button as={Link} href="/console/billing" size="sm">
                                Add funds
                            </Button>
                        </div>
                    </div>
                </Card>

                {alerts.length > 0 && (
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 10,
                        }}
                    >
                        {alerts.map((a) => (
                            <div
                                key={a.title}
                                style={{
                                    display: 'flex',
                                    gap: 10,
                                    alignItems: 'flex-start',
                                    padding: '12px 14px',
                                    background: TONE[a.tone].bg,
                                    border: `1px solid ${TONE[a.tone].fg}`,
                                    borderRadius: 'var(--ox-radius-md)',
                                }}
                            >
                                <Icon
                                    name={TONE[a.tone].icon}
                                    size={16}
                                    color={TONE[a.tone].fg}
                                    style={{ flexShrink: 0, marginTop: 1 }}
                                />
                                <div>
                                    <div
                                        style={{
                                            fontWeight: 600,
                                            fontSize: 'var(--ox-text-sm)',
                                            color: TONE[a.tone].fg,
                                        }}
                                    >
                                        {a.title}
                                    </div>
                                    <div
                                        style={{
                                            fontSize: 12.5,
                                            color: 'var(--ox-text-muted)',
                                            marginTop: 2,
                                        }}
                                    >
                                        {a.body}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <div
                    className="oe-grid-4"
                    style={{
                        display: 'grid',
                        gridTemplateColumns:
                            'repeat(auto-fit, minmax(190px, 1fr))',
                        gap: 16,
                    }}
                >
                    <StatCard
                        label="Spend this month"
                        value={money(spend.mtd_cents)}
                        unit=""
                        delta={undefined}
                        deltaDirection={undefined}
                        hint={`day ${spend.days_elapsed} of ${spend.days_in_month}`}
                    />
                    <StatCard
                        label="Projected month-end"
                        value={money(spend.projected_cents)}
                        unit=""
                        estimate
                        delta={
                            spend.delta_pct !== null
                                ? `${spend.delta_pct > 0 ? '+' : ''}${spend.delta_pct}%`
                                : undefined
                        }
                        deltaDirection={
                            (spend.delta_pct ?? 0) <= 0 ? 'up' : 'down'
                        }
                        hint={
                            spend.last_month_cents > 0
                                ? `vs ${money(spend.last_month_cents)} last month`
                                : 'estimate at current rate'
                        }
                    />
                    <StatCard
                        label="Total tokens 30d"
                        value={fmtTokens(spend.tokens_30d)}
                        unit=""
                        delta={undefined}
                        deltaDirection={undefined}
                        hint="input + output"
                    />
                    <StatCard
                        label="Cost per 1k tokens"
                        value={per1k(efficiency.per_1k_cents)}
                        unit=""
                        delta={
                            efficiency.delta_pct !== null
                                ? `${efficiency.delta_pct > 0 ? '+' : ''}${efficiency.delta_pct}%`
                                : undefined
                        }
                        deltaDirection={cheaper ? 'up' : 'down'}
                        hint={
                            efficiency.per_1k_last_month_cents !== null
                                ? `was ${per1k(efficiency.per_1k_last_month_cents)}`
                                : 'blended across models'
                        }
                    />
                </div>

                <div
                    className="oe-2col"
                    style={{
                        display: 'grid',
                        gridTemplateColumns: '2fr 1fr',
                        gap: 20,
                    }}
                >
                    <Card padding="lg">
                        <div style={{ marginBottom: 12 }}>
                            <h2
                                style={{
                                    margin: 0,
                                    fontSize: 16,
                                    fontWeight: 700,
                                }}
                            >
                                Daily spend
                            </h2>
                            <p
                                style={{
                                    margin: '2px 0 0',
                                    fontSize: 12.5,
                                    color: 'var(--ox-text-subtle)',
                                }}
                            >
                                Last 30 days. Usage is metered continuously and
                                accrues as it happens.
                            </p>
                        </div>
                        <LineArea
                            height={200}
                            xLabels={daily.map((d, i) =>
                                i % 6 === 0 ? d.date.slice(5) : '',
                            )}
                            series={[
                                {
                                    name: 'Spend',
                                    values: daily.map((d) => d.cents / 100),
                                    color: '#33c13e',
                                },
                            ]}
                            valueFmt={(v: number) => `$${v.toFixed(2)}`}
                        />
                    </Card>

                    <Card
                        padding="lg"
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 14,
                        }}
                    >
                        <div>
                            <h2
                                style={{
                                    margin: 0,
                                    fontSize: 16,
                                    fontWeight: 700,
                                }}
                            >
                                Is it getting cheaper?
                            </h2>
                            <p
                                style={{
                                    margin: '2px 0 0',
                                    fontSize: 12.5,
                                    color: 'var(--ox-text-subtle)',
                                }}
                            >
                                Blended cost of a thousand tokens, this month
                                against last.
                            </p>
                        </div>

                        {efficiency.per_1k_last_month_cents === null ? (
                            <p
                                style={{
                                    fontSize: 13,
                                    color: 'var(--ox-text-muted)',
                                    margin: 0,
                                }}
                            >
                                We’ll compare once you have a full month of
                                usage behind you.
                            </p>
                        ) : (
                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'baseline',
                                    gap: 10,
                                }}
                            >
                                <span
                                    style={{
                                        ...mono,
                                        fontSize: 28,
                                        fontWeight: 500,
                                    }}
                                >
                                    {per1k(efficiency.per_1k_cents)}
                                </span>
                                <Badge
                                    tone={
                                        cheaper
                                            ? 'success'
                                            : dearer
                                              ? 'warning'
                                              : 'neutral'
                                    }
                                >
                                    {cheaper
                                        ? `${Math.abs(efficiency.delta_pct!)}% cheaper`
                                        : dearer
                                          ? `${efficiency.delta_pct}% dearer`
                                          : 'unchanged'}
                                </Badge>
                            </div>
                        )}

                        <div
                            style={{
                                height: 1,
                                background: 'var(--ox-divider)',
                            }}
                        />

                        <div
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 8,
                                fontSize: 13,
                                color: 'var(--ox-text-muted)',
                            }}
                        >
                            <Row
                                label="This month / 1k tokens"
                                value={per1k(efficiency.per_1k_cents)}
                            />
                            <Row
                                label="Last month / 1k tokens"
                                value={per1k(
                                    efficiency.per_1k_last_month_cents,
                                )}
                            />
                            <Row
                                label="Models available"
                                value={num(efficiency.models_available)}
                            />
                            <Row
                                label="Providers, one bill"
                                value={num(efficiency.providers)}
                            />
                        </div>
                    </Card>
                </div>

                <div
                    className="oe-2col"
                    style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: 20,
                    }}
                >
                    <Card padding="none">
                        <div style={{ padding: '16px 18px 10px' }}>
                            <h2
                                style={{
                                    margin: 0,
                                    fontSize: 16,
                                    fontWeight: 700,
                                }}
                            >
                                Where it’s going
                            </h2>
                            <p
                                style={{
                                    margin: '2px 0 0',
                                    fontSize: 12.5,
                                    color: 'var(--ox-text-subtle)',
                                }}
                            >
                                Spend by source, this month.
                            </p>
                        </div>
                        {sources.length === 0 ? (
                            <p
                                style={{
                                    padding: '0 18px 18px',
                                    fontSize: 13,
                                    color: 'var(--ox-text-muted)',
                                }}
                            >
                                No usage yet.{' '}
                                <Link
                                    href="/console/sources"
                                    style={{ color: 'var(--ox-primary)' }}
                                >
                                    Create a source
                                </Link>{' '}
                                to start.
                            </p>
                        ) : (
                            <div className="oe-table-wrap">
                                <table
                                    style={{
                                        width: '100%',
                                        borderCollapse: 'collapse',
                                    }}
                                >
                                    <thead>
                                        <tr>
                                            <th style={th}>Source</th>
                                            <th
                                                style={{
                                                    ...th,
                                                    textAlign: 'right',
                                                }}
                                            >
                                                Share
                                            </th>
                                            <th
                                                style={{
                                                    ...th,
                                                    textAlign: 'right',
                                                }}
                                            >
                                                Spend
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {sources.map((s) => (
                                            <tr key={s.label}>
                                                <td
                                                    style={{
                                                        ...td,
                                                        fontWeight: 600,
                                                        overflowWrap:
                                                            'anywhere',
                                                    }}
                                                >
                                                    {s.label}
                                                </td>
                                                <td
                                                    style={{
                                                        ...td,
                                                        textAlign: 'right',
                                                        color: 'var(--ox-text-subtle)',
                                                        ...mono,
                                                    }}
                                                >
                                                    {s.share_pct}%
                                                </td>
                                                <td
                                                    style={{
                                                        ...td,
                                                        textAlign: 'right',
                                                        ...mono,
                                                    }}
                                                >
                                                    {money(s.spend_cents)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </Card>

                    <Card padding="none">
                        <div
                            style={{
                                padding: '16px 18px 10px',
                                display: 'flex',
                                flexWrap: 'wrap',
                                gap: 8,
                                justifyContent: 'space-between',
                                alignItems: 'baseline',
                            }}
                        >
                            <div>
                                <h2
                                    style={{
                                        margin: 0,
                                        fontSize: 16,
                                        fontWeight: 700,
                                    }}
                                >
                                    Recent activity
                                </h2>
                                <p
                                    style={{
                                        margin: '2px 0 0',
                                        fontSize: 12.5,
                                        color: 'var(--ox-text-subtle)',
                                    }}
                                >
                                    Latest requests and provider rollups.
                                </p>
                            </div>
                            <Link
                                href="/console/usage"
                                style={{
                                    fontSize: 12.5,
                                    color: 'var(--ox-primary)',
                                    textDecoration: 'none',
                                    fontWeight: 600,
                                }}
                            >
                                All usage →
                            </Link>
                        </div>
                        {recent.length === 0 ? (
                            <p
                                style={{
                                    padding: '0 18px 18px',
                                    fontSize: 13,
                                    color: 'var(--ox-text-muted)',
                                }}
                            >
                                Nothing metered yet.
                            </p>
                        ) : (
                            <div className="oe-table-wrap">
                                <table
                                    style={{
                                        width: '100%',
                                        borderCollapse: 'collapse',
                                    }}
                                >
                                    <tbody>
                                        {recent.map((r, i) => (
                                            <tr key={i}>
                                                <td
                                                    style={{
                                                        ...td,
                                                        overflowWrap:
                                                            'anywhere',
                                                    }}
                                                >
                                                    <div
                                                        style={{
                                                            fontWeight: 600,
                                                            fontSize: 13,
                                                        }}
                                                    >
                                                        {r.model}
                                                    </div>
                                                    <div
                                                        style={{
                                                            fontSize: 11.5,
                                                            color: 'var(--ox-text-subtle)',
                                                        }}
                                                    >
                                                        {fmtTokens(r.tokens)}{' '}
                                                        tokens · {r.at}
                                                    </div>
                                                </td>
                                                <td
                                                    style={{
                                                        ...td,
                                                        textAlign: 'right',
                                                        ...mono,
                                                        whiteSpace: 'nowrap',
                                                    }}
                                                >
                                                    {money(r.billed_cents)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </Card>
                </div>
            </div>
        </ConsoleLayout>
    );
}

const Row = ({ label, value }: { label: string; value: string }) => (
    <div
        style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
        }}
    >
        <span>{label}</span>
        <span style={{ ...mono, color: 'var(--ox-text)' }}>{value}</span>
    </div>
);
