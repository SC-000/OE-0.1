import { Head } from '@inertiajs/react';
import ConsoleLayout from '@/layouts/console-layout';
import { Card, StatCard, Button, Icon, LineArea, Bars, Donut, RankBars } from '@/components/oe';

type Props = {
    stats?: { tokens: string; requests: string; spend: string; avg: string };
    dailySpend?: number[];
    byModel?: { label: string; value: number }[];
    byProvider?: { label: string; value: number }[];
    bySource?: { label: string; value: number }[];
    table?: string[][];
};

export default function Usage({ stats, dailySpend = [0], byModel = [], byProvider = [], bySource = [], table = [] }: Props) {
    const th = { padding: '10px 20px', fontSize: 'var(--ox-text-2xs)', textTransform: 'uppercase' as const, letterSpacing: 'var(--ox-tracking-caps)', color: 'var(--ox-text-subtle)', fontWeight: 600, borderBottom: '1px solid var(--ox-divider)', textAlign: 'left' as const };
    const td = { padding: '12px 20px', borderBottom: '1px solid var(--ox-divider)', fontFamily: 'var(--ox-font-mono)', fontSize: 'var(--ox-text-sm)', color: 'var(--ox-text-muted)' };
    return (
        <ConsoleLayout active="usage" title="Usage" subtitle="Current billing period"
            actions={<Button size="sm" variant="secondary" leadingIcon={<Icon name="database" size={15} />}>Export CSV</Button>}>
            <Head title="Usage — Console" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div className="oe-grid-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
                    <StatCard label="Tokens (MTD)" value={stats?.tokens ?? '0'} hint="in + out" />
                    <StatCard label="Requests (MTD)" value={stats?.requests ?? '0'} hint="metered windows" />
                    <StatCard label="Spend (MTD)" value={stats?.spend ?? '$0'} hint="your rates" />
                    <StatCard label="Avg cost / req" value={stats?.avg ?? '$0'} hint="blended" />
                </div>

                <div className="oe-2col" style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 16 }}>
                    <Card padding="md">
                        <div style={{ fontSize: 'var(--ox-text-lg)', fontWeight: 600, marginBottom: 4 }}>Daily spend</div>
                        <div style={{ fontSize: 'var(--ox-text-sm)', color: 'var(--ox-text-subtle)', marginBottom: 12 }}>USD · last 30 days</div>
                        <LineArea height={220} xLabels={[]} series={[{ name: 'spend', values: dailySpend.length ? dailySpend : [0], color: '#33c13e' }]} valueFmt={(v) => '$' + Math.round(v)} legend={false} />
                    </Card>
                    <Card padding="md">
                        <div style={{ fontSize: 'var(--ox-text-lg)', fontWeight: 600, marginBottom: 16 }}>Spend by provider</div>
                        {byProvider.length ? (
                            <Donut size={180} thickness={24} centerValue={stats?.spend ?? ''} centerLabel="MTD" segments={byProvider} />
                        ) : <span style={{ fontSize: 13, color: 'var(--ox-text-subtle)' }}>No usage yet.</span>}
                    </Card>
                </div>

                <Card padding="md">
                    <div style={{ fontSize: 'var(--ox-text-lg)', fontWeight: 600, marginBottom: 4 }}>Spend by model</div>
                    <div style={{ fontSize: 'var(--ox-text-sm)', color: 'var(--ox-text-subtle)', marginBottom: 14 }}>USD · month to date</div>
                    {byModel.length ? <Bars data={byModel} height={230} valueFmt={(v) => '$' + (v >= 1000 ? (v / 1000).toFixed(1) + 'k' : v)} /> : <span style={{ fontSize: 13, color: 'var(--ox-text-subtle)' }}>No usage yet.</span>}
                </Card>

                {bySource.length > 0 && (
                    <Card padding="md">
                        <div style={{ fontSize: 'var(--ox-text-lg)', fontWeight: 600, marginBottom: 4 }}>Spend by source</div>
                        <div style={{ fontSize: 'var(--ox-text-sm)', color: 'var(--ox-text-subtle)', marginBottom: 16 }}>Your labelled tokens · month to date</div>
                        <RankBars items={bySource} valueFmt={(v) => '$' + v} unit="" />
                    </Card>
                )}

                <Card padding="none">
                    <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--ox-divider)', fontSize: 'var(--ox-text-lg)', fontWeight: 600 }}>Breakdown by model</div>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 660 }}>
                            <thead><tr>{['Model', 'Provider', 'Requests', 'Tokens', 'Avg / req', 'Spend'].map((h) => <th key={h} style={th}>{h}</th>)}</tr></thead>
                            <tbody>
                                {table.length === 0 && <tr><td style={{ ...td, color: 'var(--ox-text-subtle)' }} colSpan={6}>No usage metered yet.</td></tr>}
                                {table.map((r, i) => (
                                    <tr key={i}>
                                        <td style={{ ...td, color: 'var(--ox-text)', fontWeight: 600 }}>{r[0]}</td>
                                        <td style={{ ...td, fontFamily: 'var(--ox-font-sans)' }}>{r[1]}</td>
                                        <td style={td}>{r[2]}</td><td style={td}>{r[3]}</td><td style={td}>{r[4]}</td>
                                        <td style={{ ...td, color: 'var(--ox-text)', fontWeight: 600 }}>{r[5]}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>
        </ConsoleLayout>
    );
}
