import { Head } from '@inertiajs/react';
import { useMemo } from 'react';
import { Badge, Card, Donut, LineArea, StatCard } from '@/components/oe';
import ConsoleLayout from '@/layouts/console-layout';
import { money, num, tokens as fmtTokens } from '@/lib/format';

type Row = {
    label: string;
    requests: number;
    tokens: number;
    spend_cents: number;
    per_1k_cents: number | null;
    share_pct: number;
};
type Activity = {
    at: string;
    ago: string;
    label: string;
    input_tokens: number;
    output_tokens: number;
    billed_cents: number;
    source: string;
};
type Props = {
    stats: {
        tokens: number;
        requests: number;
        spend_cents: number;
        per_request_cents: number | null;
        per_1k_cents: number | null;
    };
    daily: { labels: string[]; spend: number[]; per_1k: (number | null)[] };
    byProvider: { label: string; value: number }[];
    bySource: { label: string; value: number }[];
    table: Row[];
    activity: Activity[];
    period: { label: string; day: number; days: number };
};

const per1k = (c: number | null) =>
    c === null ? '—' : `$${(c / 100).toFixed(4)}`;

const th: React.CSSProperties = {
    padding: '10px 20px',
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    color: 'var(--ox-text-subtle)',
    fontWeight: 600,
    borderBottom: '1px solid var(--ox-divider)',
    textAlign: 'left',
};
const td: React.CSSProperties = {
    padding: '12px 20px',
    borderBottom: '1px solid var(--ox-divider)',
    fontSize: 'var(--ox-text-sm)',
};
const mono: React.CSSProperties = { fontFamily: 'var(--ox-font-mono)' };

const SOURCE_TONE: Record<string, 'neutral' | 'brand' | 'info'> = {
    request: 'brand',
    metered: 'neutral',
    adjustment: 'info',
};

export default function Usage({
    stats,
    daily,
    byProvider,
    bySource,
    table,
    activity,
    period,
}: Props) {
    // Unit cost is only meaningful on days with traffic — carry the last known value
    // across quiet days rather than plotting a misleading zero.
    const unit = useMemo(() => {
        const out: number[] = [];
        let carried: number | null = null;

        for (const v of daily.per_1k) {
            if (v !== null) {
                carried = v;
            }

            out.push(carried === null ? 0 : carried / 100);
        }

        return out;
    }, [daily.per_1k]);
    const hasUnit = daily.per_1k.some((v) => v !== null);

    return (
        <ConsoleLayout
            active="usage"
            title="Usage"
            subtitle={`${period.label} · day ${period.day} of ${period.days}`}
        >
            <Head title="Usage — Console" />

            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
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
                        label="Spend"
                        value={money(stats.spend_cents)}
                        unit=""
                        delta={undefined}
                        deltaDirection={undefined}
                        hint="this month"
                    />
                    <StatCard
                        label="Tokens"
                        value={fmtTokens(stats.tokens)}
                        unit=""
                        delta={undefined}
                        deltaDirection={undefined}
                        hint="input + output"
                    />
                    <StatCard
                        label="Requests"
                        value={num(stats.requests)}
                        unit=""
                        delta={undefined}
                        deltaDirection={undefined}
                        hint="metered"
                    />
                    <StatCard
                        label="Cost per 1k tokens"
                        value={per1k(stats.per_1k_cents)}
                        unit=""
                        delta={undefined}
                        deltaDirection={undefined}
                        hint="blended across models"
                    />
                </div>

                <div
                    className="oe-2col"
                    style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: 20,
                    }}
                >
                    <Card padding="lg">
                        <h2
                            style={{ margin: 0, fontSize: 16, fontWeight: 700 }}
                        >
                            Daily spend
                        </h2>
                        <p
                            style={{
                                margin: '2px 0 14px',
                                fontSize: 12.5,
                                color: 'var(--ox-text-subtle)',
                            }}
                        >
                            Last 30 days.
                        </p>
                        <LineArea
                            height={190}
                            xLabels={daily.labels.map((d, i) =>
                                i % 6 === 0 ? d.slice(5) : '',
                            )}
                            series={[
                                {
                                    name: 'Spend',
                                    values: daily.spend,
                                    color: '#33c13e',
                                },
                            ]}
                            valueFmt={(v: number) => `$${v.toFixed(2)}`}
                        />
                    </Card>

                    <Card padding="lg">
                        <h2
                            style={{ margin: 0, fontSize: 16, fontWeight: 700 }}
                        >
                            Cost per 1,000 tokens
                        </h2>
                        <p
                            style={{
                                margin: '2px 0 14px',
                                fontSize: 12.5,
                                color: 'var(--ox-text-subtle)',
                            }}
                        >
                            What a unit of work costs you over time. A falling
                            line means you’re getting more for the same spend.
                        </p>
                        {hasUnit ? (
                            <LineArea
                                height={190}
                                area={false}
                                xLabels={daily.labels.map((d, i) =>
                                    i % 6 === 0 ? d.slice(5) : '',
                                )}
                                series={[
                                    {
                                        name: '$ / 1k tokens',
                                        values: unit,
                                        color: '#2a7de1',
                                    },
                                ]}
                                valueFmt={(v: number) => `$${v.toFixed(4)}`}
                            />
                        ) : (
                            <p
                                style={{
                                    fontSize: 13,
                                    color: 'var(--ox-text-muted)',
                                }}
                            >
                                No metered tokens in the last 30 days.
                            </p>
                        )}
                    </Card>
                </div>

                <div
                    className="oe-2col"
                    style={{
                        display: 'grid',
                        gridTemplateColumns: '2fr 1fr',
                        gap: 20,
                    }}
                >
                    <Card padding="none">
                        <div style={{ padding: '16px 20px 10px' }}>
                            <h2
                                style={{
                                    margin: 0,
                                    fontSize: 16,
                                    fontWeight: 700,
                                }}
                            >
                                Breakdown
                            </h2>
                            <p
                                style={{
                                    margin: '2px 0 0',
                                    fontSize: 12.5,
                                    color: 'var(--ox-text-subtle)',
                                }}
                            >
                                Spend by model class this month, with the unit
                                cost of each.
                            </p>
                        </div>
                        {table.length === 0 ? (
                            <p
                                style={{
                                    padding: '0 20px 20px',
                                    fontSize: 13,
                                    color: 'var(--ox-text-muted)',
                                }}
                            >
                                No usage this month.
                            </p>
                        ) : (
                            <table
                                style={{
                                    width: '100%',
                                    borderCollapse: 'collapse',
                                }}
                            >
                                <thead>
                                    <tr>
                                        <th style={th}>Class</th>
                                        <th
                                            style={{
                                                ...th,
                                                textAlign: 'right',
                                            }}
                                        >
                                            Requests
                                        </th>
                                        <th
                                            style={{
                                                ...th,
                                                textAlign: 'right',
                                            }}
                                        >
                                            Tokens
                                        </th>
                                        <th
                                            style={{
                                                ...th,
                                                textAlign: 'right',
                                            }}
                                        >
                                            $ / 1k
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
                                    {table.map((r) => (
                                        <tr key={r.label}>
                                            <td
                                                style={{
                                                    ...td,
                                                    fontWeight: 600,
                                                }}
                                            >
                                                {r.label}
                                                <div
                                                    style={{
                                                        fontSize: 11,
                                                        color: 'var(--ox-text-subtle)',
                                                        fontWeight: 400,
                                                    }}
                                                >
                                                    {r.share_pct}% of spend
                                                </div>
                                            </td>
                                            <td
                                                style={{
                                                    ...td,
                                                    textAlign: 'right',
                                                    ...mono,
                                                    color: 'var(--ox-text-muted)',
                                                }}
                                            >
                                                {num(r.requests)}
                                            </td>
                                            <td
                                                style={{
                                                    ...td,
                                                    textAlign: 'right',
                                                    ...mono,
                                                    color: 'var(--ox-text-muted)',
                                                }}
                                            >
                                                {fmtTokens(r.tokens)}
                                            </td>
                                            <td
                                                style={{
                                                    ...td,
                                                    textAlign: 'right',
                                                    ...mono,
                                                    color: 'var(--ox-text-muted)',
                                                }}
                                            >
                                                {per1k(r.per_1k_cents)}
                                            </td>
                                            <td
                                                style={{
                                                    ...td,
                                                    textAlign: 'right',
                                                    ...mono,
                                                    fontWeight: 600,
                                                }}
                                            >
                                                {money(r.spend_cents)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </Card>

                    <Card padding="lg">
                        <h2
                            style={{ margin: 0, fontSize: 16, fontWeight: 700 }}
                        >
                            By source
                        </h2>
                        <p
                            style={{
                                margin: '2px 0 14px',
                                fontSize: 12.5,
                                color: 'var(--ox-text-subtle)',
                            }}
                        >
                            Which of your apps is spending.
                        </p>
                        {bySource.length === 0 ? (
                            <p
                                style={{
                                    fontSize: 13,
                                    color: 'var(--ox-text-muted)',
                                }}
                            >
                                Nothing attributed yet.
                            </p>
                        ) : (
                            <Donut
                                segments={bySource.map((s) => ({
                                    label: s.label,
                                    value: s.value,
                                }))}
                                centerValue={money(stats.spend_cents)}
                                centerLabel="this month"
                            />
                        )}
                        {byProvider.length > 0 && (
                            <div
                                style={{
                                    marginTop: 16,
                                    fontSize: 12.5,
                                    color: 'var(--ox-text-muted)',
                                }}
                            >
                                {byProvider.map((p) => (
                                    <div
                                        key={p.label}
                                        style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            padding: '3px 0',
                                        }}
                                    >
                                        <span>{p.label}</span>
                                        <span style={mono}>
                                            {money(p.value)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </Card>
                </div>

                {/* The accrual log. Usage arrives as many small amounts; showing each one as
                    it lands is the honest way to present that — a record you can reconcile. */}
                <Card padding="none">
                    <div style={{ padding: '16px 20px 10px' }}>
                        <h2
                            style={{ margin: 0, fontSize: 16, fontWeight: 700 }}
                        >
                            Activity
                        </h2>
                        <p
                            style={{
                                margin: '2px 0 0',
                                fontSize: 12.5,
                                color: 'var(--ox-text-subtle)',
                            }}
                        >
                            Every amount as it was metered, newest first. Your
                            balance moves by exactly these amounts.
                        </p>
                    </div>
                    {activity.length === 0 ? (
                        <p
                            style={{
                                padding: '0 20px 20px',
                                fontSize: 13,
                                color: 'var(--ox-text-muted)',
                            }}
                        >
                            Nothing metered yet.
                        </p>
                    ) : (
                        <table
                            style={{
                                width: '100%',
                                borderCollapse: 'collapse',
                            }}
                        >
                            <thead>
                                <tr>
                                    <th style={th}>When</th>
                                    <th style={th}>Class</th>
                                    <th style={{ ...th, textAlign: 'right' }}>
                                        In / Out tokens
                                    </th>
                                    <th style={{ ...th, textAlign: 'right' }}>
                                        Amount
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {activity.map((a, i) => (
                                    <tr key={i}>
                                        <td style={td}>
                                            <div style={{ fontSize: 13 }}>
                                                {a.at}
                                            </div>
                                            <div
                                                style={{
                                                    fontSize: 11,
                                                    color: 'var(--ox-text-subtle)',
                                                }}
                                            >
                                                {a.ago} ago
                                            </div>
                                        </td>
                                        <td style={td}>
                                            <span
                                                style={{
                                                    fontWeight: 600,
                                                    marginRight: 8,
                                                }}
                                            >
                                                {a.label}
                                            </span>
                                            {a.source !== 'request' && (
                                                <Badge
                                                    tone={
                                                        SOURCE_TONE[a.source] ??
                                                        'neutral'
                                                    }
                                                    dot={false}
                                                >
                                                    {a.source}
                                                </Badge>
                                            )}
                                        </td>
                                        <td
                                            style={{
                                                ...td,
                                                textAlign: 'right',
                                                ...mono,
                                                color: 'var(--ox-text-muted)',
                                                fontSize: 12.5,
                                            }}
                                        >
                                            {fmtTokens(a.input_tokens)} /{' '}
                                            {fmtTokens(a.output_tokens)}
                                        </td>
                                        <td
                                            style={{
                                                ...td,
                                                textAlign: 'right',
                                                ...mono,
                                                fontWeight: 600,
                                            }}
                                        >
                                            {money(a.billed_cents)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </Card>
            </div>
        </ConsoleLayout>
    );
}
