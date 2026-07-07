import { Head, Link } from '@inertiajs/react';
import MarketingLayout from '@/layouts/marketing-layout';
import { Section } from '@/components/marketing/Section';
import { Button, Icon, Badge, Card, BalanceMeter, ModelCatalogTable, Bars, SectionHeading } from '@/components/oe';
import { FEES } from '@/lib/site';

const PLANS = [
    {
        name: 'Pay-as-you-go', price: '$0', unit: '/mo', tag: 'Raw rates',
        blurb: 'Pay only the published per-token rate. No subscription, no lock-in.',
        features: ['Raw per-token pricing — no markup', 'All 300+ models, one API', 'Single prepaid bill + auto top-up', 'Streaming /v1 gateway', 'Usage metered in real time', 'Community support'],
        cta: 'Start free', href: '/register', highlight: false,
    },
    {
        name: 'Growth', price: '$40', unit: '/mo', tag: 'Advanced routing + layers',
        blurb: 'Best-execution routing and policy layers that usually pay for themselves.',
        features: ['Everything in Pay-as-you-go', 'LAIE best-execution routing (save 20–40%)', 'Policy Shields & Guardians', 'Prompt optimisation & caching', 'Segmentation & agents', 'Ordered fallbacks + priority', 'Workspaces & spend caps', 'Email support'],
        cta: 'Upgrade to Growth', href: '/register', highlight: true,
    },
    {
        name: 'Enterprise', price: 'Custom', unit: '', tag: 'Scale & resell',
        blurb: 'Custom rates, private venues, and reseller / white-label.',
        features: ['Everything in Growth', 'Custom / negotiated rates', 'Private & regional venues', 'SSO / SAML & RBAC', 'Set your own client rate cards (resell)', 'Dedicated support & SLA'],
        cta: 'Talk to us', href: '/company#contact', highlight: false,
    },
];

const LAYERS = [
    { icon: 'shield', name: 'Shields', body: 'Security, anonymisation & data protection before a prompt leaves.', price: 'from $0.0005 / req' },
    { icon: 'sliders', name: 'Optimizers', body: 'Prompt enhancement, caching & cost optimisation.', price: 'from $0.0003 / req' },
    { icon: 'lock', name: 'Guardians', body: 'Corporate policy, allow/deny lists & spend limits.', price: 'included in Growth' },
    { icon: 'cpu', name: 'Agents', body: 'Break big tasks into sub-tasks and orchestrate.', price: 'usage-based' },
];

export default function Pricing() {
    return (
        <MarketingLayout>
            <Head title="Pricing — Open Exchange" />

            <Section tone="ink" pad="xl">
                <div className="ox-dot-grid ox-dot-grid--fade" style={{ position: 'absolute', inset: 0, opacity: 0.4, ['--ox-dot-focus' as string]: '50% 30%' }} />
                <div style={{ position: 'relative', textAlign: 'center' }}>
                    <SectionHeading tone="dark" align="center" eyebrow="Pricing"
                        title="Pay the raw rate. Upgrade to save more."
                        subtitle="You only pay for the tokens you use, at transparent published rates. Turn on advanced routing and layers when they save you more than they cost — otherwise, stay on raw rates for free." />
                    <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 22, flexWrap: 'wrap' }}>
                        <Badge tone="success">No monthly fee to start</Badge>
                        <Badge tone="brand">No hidden markup</Badge>
                        <Badge tone="gold">Cancel anytime</Badge>
                    </div>
                </div>
            </Section>

            {/* plans */}
            <Section tone="beige" style={{ marginTop: -56, background: 'transparent', paddingTop: 0 }}>
                <div className="oe-grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
                    {PLANS.map((p) => (
                        <Card key={p.name} padding="lg" style={{
                            display: 'flex', flexDirection: 'column', gap: 16, position: 'relative',
                            border: p.highlight ? '1.5px solid var(--ox-green-500)' : '1px solid var(--ox-border)',
                            boxShadow: p.highlight ? 'var(--ox-shadow-lg)' : 'var(--ox-shadow-sm)',
                        }}>
                            {p.highlight && <span style={{ position: 'absolute', top: -12, left: 24 }}><Badge tone="brand">Best value</Badge></span>}
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <span style={{ fontWeight: 800, fontSize: 20 }}>{p.name}</span>
                                    <Badge tone="neutral" dot={false}>{p.tag}</Badge>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginTop: 12 }}>
                                    <span style={{ fontFamily: 'var(--ox-font-mono)', fontSize: 34, fontWeight: 600, letterSpacing: '-0.02em' }}>{p.price}</span>
                                    <span style={{ color: 'var(--ox-text-subtle)', fontSize: 15 }}>{p.unit}</span>
                                    {p.name === 'Pay-as-you-go' && <span style={{ color: 'var(--ox-text-subtle)', fontSize: 13, marginLeft: 4 }}>+ token usage</span>}
                                </div>
                                <p style={{ margin: '8px 0 0', color: 'var(--ox-text-muted)', fontSize: 14, lineHeight: 1.5 }}>{p.blurb}</p>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 9, flex: 1 }}>
                                {p.features.map((f) => (
                                    <div key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 9, fontSize: 14 }}>
                                        <Icon name="check" size={17} color="var(--ox-green-600)" style={{ marginTop: 1, flexShrink: 0 }} />
                                        <span style={{ color: 'var(--ox-text)' }}>{f}</span>
                                    </div>
                                ))}
                            </div>
                            <Button as={Link} href={p.href} variant={p.highlight ? 'primary' : 'secondary'} fullWidth>{p.cta}</Button>
                        </Card>
                    ))}
                </div>
            </Section>

            {/* the raw rates */}
            <Section tone="subtle">
                <SectionHeading eyebrow="The rates you pay" title="Transparent per-token pricing"
                    subtitle="On Pay-as-you-go you pay the model’s published rate — nothing added on top. We earn on routing, layers and a few hundredths of a cent of clearing, never a hidden markup." />
                <div style={{ marginTop: 32 }}><ModelCatalogTable tone="light" /></div>
                <p style={{ margin: '14px 2px 0', fontSize: 13, color: 'var(--ox-text-subtle)' }}>
                    Rates shown per 1M tokens. Plus a small per-request clearing fee from <span className="ox-mono">${FEES.clearing[0].price}</span>. Prices update live with the providers.
                </p>
            </Section>

            {/* save with routing */}
            <Section tone="beige">
                <div className="oe-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 44, alignItems: 'center' }}>
                    <SectionHeading eyebrow="Save money" title="Advanced routing usually pays for itself"
                        subtitle="Best-execution routing sends each request to the cheapest model that can do the job — with quality and latency guarantees. Most workloads spend 20–40% less than pinning a single premium model. Upgrade when the savings beat the fee; if they don’t, stay on raw rates."
                        actions={<Button as={Link} href="/products/ai-router" variant="secondary" trailingIcon={<Icon name="arrow-right" size={15} />}>How routing works</Button>}
                    />
                    <Card padding="lg">
                        <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>Typical monthly spend</div>
                        <div style={{ fontSize: 13, color: 'var(--ox-text-subtle)', marginBottom: 16 }}>Indexed · single premium model vs best-execution routing</div>
                        <Bars height={220} data={[{ label: 'Single model', value: 100 }, { label: 'Best-execution', value: 66 }]} yMax={115} valueFmt={(v) => Math.round(v).toString()} />
                        <div style={{ marginTop: 8, display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                            <Badge tone="success">~34% lower</Badge>
                            <span style={{ fontSize: 12.5, color: 'var(--ox-text-subtle)' }}>illustrative — your savings depend on your mix</span>
                        </div>
                    </Card>
                </div>
            </Section>

            {/* layers */}
            <Section tone="subtle">
                <SectionHeading eyebrow="Layers, à la carte" title="Add only what you need"
                    subtitle="Compose your request pipeline. Growth includes Guardians; the rest are usage-priced so you pay only when a layer runs." />
                <div className="oe-grid-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginTop: 36 }}>
                    {LAYERS.map((l) => (
                        <Card key={l.name} padding="lg" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            <Icon name={l.icon} size={22} color="var(--ox-green-600)" />
                            <div style={{ fontWeight: 700, fontSize: 16 }}>{l.name}</div>
                            <p style={{ margin: 0, color: 'var(--ox-text-muted)', fontSize: 13.5, lineHeight: 1.5, flex: 1 }}>{l.body}</p>
                            <span style={{ fontFamily: 'var(--ox-font-mono)', fontSize: 12.5, color: 'var(--ox-green-700)', fontWeight: 600 }}>{l.price}</span>
                        </Card>
                    ))}
                </div>
            </Section>

            {/* prepaid + transparent */}
            <Section tone="ink">
                <div className="oe-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 44, alignItems: 'center' }}>
                    <SectionHeading tone="dark" eyebrow="Prepaid & transparent" title="Only ever pay for what you use"
                        subtitle="Top up a prepaid balance and set a minimum. Usage is metered in real time and drawn from your balance; when it runs low we top it up automatically from your saved card. One itemised bill, every token accounted for."
                        actions={<Button as={Link} href="/register" trailingIcon={<Icon name="arrow-right" size={15} color="var(--ox-on-primary)" />}>Open a billing account</Button>}
                    />
                    <BalanceMeter tone="dark" balance={42.5} min={10} topUp={50} />
                </div>
            </Section>

            <Section tone="beige" pad="xl">
                <div style={{ textAlign: 'center', maxWidth: 640, margin: '0 auto' }}>
                    <SectionHeading align="center" title="Start on raw rates — upgrade only if it saves you money"
                        subtitle="No monthly fee, no commitment. Turn on routing and layers the moment they earn their keep." style={{ alignItems: 'center' }}
                        actions={
                            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                                <Button as={Link} href="/register" size="lg" trailingIcon={<Icon name="arrow-right" size={16} color="var(--ox-on-primary)" />}>Start free</Button>
                                <Button as={Link} href="/company#contact" size="lg" variant="secondary">Talk to sales</Button>
                            </div>
                        }
                    />
                </div>
            </Section>
        </MarketingLayout>
    );
}
