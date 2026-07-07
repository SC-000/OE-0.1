import { Head, Link } from '@inertiajs/react';
import ConsoleLayout from '@/layouts/console-layout';
import { Card, StatCard, Badge, Button, Icon } from '@/components/oe';

type Source = { label: string; provider: string; usage: string };
type Recent = { model: string; provider: string; tokens: string; billed: string; date: string };
type Props = {
    account?: { name: string; id: string; type: string; since: string };
    balance?: string;
    lowThreshold?: string;
    autoTopup?: boolean;
    value?: { spendMtd: string; projected: string; requests: string; tokens: string; blendedRate: string; modelsAvailable: number; providers: number; uptime: string };
    range?: { status: 'normal' | 'high' | 'low' | 'baseline'; note: string; projected: string; typical: string };
    sources?: Source[];
    recent?: Recent[];
};

const RANGE_TONE = { normal: 'success', high: 'warning', low: 'info', baseline: 'neutral' } as const;
const RANGE_LABEL = { normal: 'Normal range', high: 'Above average', low: 'Below average', baseline: 'Baseline' } as const;

export default function Overview({ account, balance = '$0.00', lowThreshold, autoTopup, value, range, sources = [], recent = [] }: Props) {
    const included = [
        { icon: 'cpu', k: `${value?.modelsAvailable ?? 0} models`, v: 'One API, best-model routing' },
        { icon: 'globe', k: `${value?.providers ?? 0} providers`, v: 'Connected & metered' },
        { icon: 'activity', k: value?.uptime ?? '99.9%', v: 'Gateway uptime, with fallbacks' },
        { icon: 'credit-card', k: 'One bill', v: 'No provider accounts to manage' },
    ];
    const rangeStatus = range?.status ?? 'baseline';
    const th = { padding: '10px 18px', fontSize: 'var(--ox-text-2xs)', textTransform: 'uppercase' as const, letterSpacing: 'var(--ox-tracking-caps)', color: 'var(--ox-text-subtle)', fontWeight: 600, borderBottom: '1px solid var(--ox-divider)', textAlign: 'left' as const };
    const td = { padding: '11px 18px', borderBottom: '1px solid var(--ox-divider)', fontFamily: 'var(--ox-font-mono)', fontSize: 'var(--ox-text-sm)', color: 'var(--ox-text-muted)' };

    return (
        <ConsoleLayout active="overview" title="Overview" subtitle={account ? `${account.name} · ${account.type}` : undefined}
            actions={<Button as={Link} href="/console/billing" size="sm" variant="secondary" leadingIcon={<Icon name="credit-card" size={15} />}>Billing account</Button>}>
            <Head title="Overview — Account" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {/* account + balance banner */}
                <Card padding="lg" style={{ display: 'flex', flexWrap: 'wrap', gap: 24, alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        <span style={{ display: 'grid', placeItems: 'center', width: 48, height: 48, borderRadius: 12, background: 'var(--ox-primary-subtle)' }}>
                            <Icon name="user" size={24} color="var(--ox-green-700)" />
                        </span>
                        <div>
                            <div style={{ fontWeight: 800, fontSize: 19, letterSpacing: '-0.01em' }}>{account?.name ?? 'Your account'}</div>
                            <div style={{ display: 'flex', gap: 10, marginTop: 3, flexWrap: 'wrap', fontFamily: 'var(--ox-font-mono)', fontSize: 12, color: 'var(--ox-text-subtle)' }}>
                                <span>{account?.id}</span><span>·</span><span>member since {account?.since}</span>
                            </div>
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 22, flexWrap: 'wrap' }}>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: 11, color: 'var(--ox-text-subtle)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>Prepaid balance</div>
                            <div style={{ fontFamily: 'var(--ox-font-mono)', fontSize: 26, fontWeight: 600, letterSpacing: '-0.02em' }}>{balance}</div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-end' }}>
                            <Badge tone={autoTopup ? 'success' : 'warning'}>{autoTopup ? 'Auto top-up on' : 'Auto top-up off'}</Badge>
                            <Button as={Link} href="/console/billing" size="sm">Manage</Button>
                        </div>
                    </div>
                </Card>

                {/* value stats */}
                <div className="oe-grid-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
                    <StatCard label="Spend this month" value={value?.spendMtd ?? '$0'} hint="metered to date" />
                    <StatCard label="Projected month-end" value={value?.projected ?? '$0'} hint="at current run-rate" />
                    <StatCard label="Requests" value={value?.requests ?? '0'} hint="this month" />
                    <StatCard label="Effective rate" value={value?.blendedRate ?? '—'} hint="blended / 1k tokens" />
                </div>

                <div className="oe-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                    {/* normal-range reassurance */}
                    <Card padding="lg" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <Icon name="activity" size={18} color="var(--ox-green-600)" />
                            <span style={{ fontWeight: 700, fontSize: 15 }}>Usage health</span>
                            <span style={{ marginLeft: 'auto' }}><Badge tone={RANGE_TONE[rangeStatus]}>{RANGE_LABEL[rangeStatus]}</Badge></span>
                        </div>
                        <p style={{ margin: 0, color: 'var(--ox-text-muted)', fontSize: 14, lineHeight: 1.6 }}>{range?.note}</p>
                        {rangeStatus !== 'baseline' && (
                            <div style={{ display: 'flex', gap: 24, marginTop: 4, paddingTop: 14, borderTop: '1px solid var(--ox-divider)' }}>
                                <div><div style={cap}>Projected</div><div style={fig}>{range?.projected}</div></div>
                                <div><div style={cap}>Recent average</div><div style={fig}>{range?.typical}</div></div>
                            </div>
                        )}
                    </Card>

                    {/* what's included */}
                    <Card padding="lg">
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                            <Icon name="check" size={18} color="var(--ox-green-600)" />
                            <span style={{ fontWeight: 700, fontSize: 15 }}>What your account includes</span>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                            {included.map((x) => (
                                <div key={x.k} style={{ display: 'flex', gap: 10 }}>
                                    <Icon name={x.icon} size={17} color="var(--ox-green-600)" style={{ marginTop: 2, flexShrink: 0 }} />
                                    <div>
                                        <div style={{ fontWeight: 700, fontSize: 14 }}>{x.k}</div>
                                        <div style={{ color: 'var(--ox-text-subtle)', fontSize: 12.5, lineHeight: 1.4 }}>{x.v}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>

                {/* sources + recent */}
                <div className="oe-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: 20 }}>
                    <Card padding="none">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 18px', borderBottom: '1px solid var(--ox-divider)' }}>
                            <span style={{ fontWeight: 600, fontSize: 15 }}>Top sources</span>
                            <Button as={Link} href="/console/sources" variant="ghost" size="sm" trailingIcon={<Icon name="arrow-right" size={14} />}>All sources</Button>
                        </div>
                        <div>
                            {sources.length === 0 && <div style={{ padding: 18, fontSize: 13, color: 'var(--ox-text-subtle)' }}>No sources connected yet.</div>}
                            {sources.map((s, i) => (
                                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '13px 18px', borderTop: i ? '1px solid var(--ox-divider)' : 'none' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                                        <span style={{ width: 8, height: 8, borderRadius: 3, background: 'var(--ox-green-500)', flexShrink: 0 }} />
                                        <div style={{ minWidth: 0 }}>
                                            <div style={{ fontWeight: 600, fontSize: 14, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.label}</div>
                                            <div style={{ fontSize: 11.5, color: 'var(--ox-text-subtle)' }}>{s.provider}</div>
                                        </div>
                                    </div>
                                    <span style={{ fontFamily: 'var(--ox-font-mono)', fontSize: 13, fontWeight: 600 }}>{s.usage}</span>
                                </div>
                            ))}
                        </div>
                    </Card>

                    <Card padding="none">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 18px', borderBottom: '1px solid var(--ox-divider)' }}>
                            <span style={{ fontWeight: 600, fontSize: 15 }}>Recent usage</span>
                            <Button as={Link} href="/console/usage" variant="ghost" size="sm" trailingIcon={<Icon name="arrow-right" size={14} />}>View usage</Button>
                        </div>
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 460 }}>
                                <thead><tr>{['Model', 'Provider', 'Tokens', 'Billed', 'Date'].map((h) => <th key={h} style={th}>{h}</th>)}</tr></thead>
                                <tbody>
                                    {recent.length === 0 && <tr><td style={{ ...td, color: 'var(--ox-text-subtle)' }} colSpan={5}>No usage metered yet.</td></tr>}
                                    {recent.map((r, i) => (
                                        <tr key={i}>
                                            <td style={{ ...td, color: 'var(--ox-text)', fontWeight: 600 }}>{r.model}</td>
                                            <td style={{ ...td, fontFamily: 'var(--ox-font-sans)' }}>{r.provider}</td>
                                            <td style={td}>{r.tokens}</td>
                                            <td style={{ ...td, color: 'var(--ox-text)', fontWeight: 600 }}>{r.billed}</td>
                                            <td style={{ ...td, color: 'var(--ox-text-subtle)' }}>{r.date}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </div>

                {/* trust strip */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px 24px', justifyContent: 'center', padding: '4px 0' }}>
                    {[['lock', 'Secrets encrypted at rest'], ['shield', 'Workspace isolation'], ['credit-card', 'PCI-compliant billing (SAQ-A)'], ['refresh-cw', 'Itemised, transparent invoicing']].map(([ic, t]) => (
                        <span key={t} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: 12.5, color: 'var(--ox-text-subtle)' }}>
                            <Icon name={ic} size={14} color="var(--ox-text-subtle)" />{t}
                        </span>
                    ))}
                </div>
            </div>
        </ConsoleLayout>
    );
}

const cap: React.CSSProperties = { fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--ox-text-subtle)', fontWeight: 600 };
const fig: React.CSSProperties = { fontFamily: 'var(--ox-font-mono)', fontSize: 18, fontWeight: 600, marginTop: 2 };
