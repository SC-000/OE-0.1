import { Head, Link } from '@inertiajs/react';
import MarketingLayout from '@/layouts/marketing-layout';
import { Section } from '@/components/marketing/Section';
import { Button, Icon, Badge, Card, StatCard, SectionHeading } from '@/components/oe';
import { ARTICLES } from '@/lib/articles';

const VALUES = [
    { icon: 'scale', title: 'Commoditised', body: 'We compete on price and throughput, and earn on the market, data and layers — not on locking you in.' },
    { icon: 'lock', title: 'Secure & anonymous', body: 'Security and anonymity are designed in: encrypted secrets, isolation and output filtering by default.' },
    { icon: 'globe', title: 'Distributed & redundant', body: 'A global network with ordered fallbacks and health checks, engineered for uptime.' },
    { icon: 'cpu', title: 'Developer-first', body: 'One clean API, transparent pricing, and a decision log you can actually inspect.' },
];

const SECURITY = [
    ['Encrypted secrets', 'Provider keys encrypted at rest with rotation policies.'],
    ['Workspace isolation', 'Tenant data and vectors isolated at the database layer.'],
    ['Output filters', 'System prompts, keys and env variables redacted from responses.'],
    ['Transport & edge', 'TLS/HSTS, secure cookies, WAF and per-key rate limits.'],
    ['Audit logging', 'Every sensitive action recorded with request IDs.'],
    ['PCI-aware billing', 'Cards tokenised via our billing partner — SAQ-A scope.'],
];

const STATUS = [
    ['Gateway & API', '99.98%'],
    ['Routing engine', '99.99%'],
    ['Provider network', '99.95%'],
    ['Billing & metering', '100.0%'],
    ['Embeddable widget', '99.97%'],
    ['Market data', '99.96%'],
];

export default function Company() {
    return (
        <MarketingLayout>
            <Head title="Company — Open Exchange" />

            <section className="ox-dark" style={{ position: 'relative', background: 'var(--ox-ink-900)', color: '#eef3f2', overflow: 'hidden' }}>
                <div className="ox-dot-grid ox-dot-grid--fade" style={{ position: 'absolute', inset: 0, ['--ox-dot-focus' as string]: '50% 40%' }} />
                <div className="ox-container" style={{ position: 'relative', paddingBlock: '84px', textAlign: 'center' }}>
                    <Badge tone="brand">Company</Badge>
                    <h1 style={{ margin: '20px auto 0', maxWidth: 720, fontWeight: 800, fontSize: 'clamp(2.2rem, 4.6vw, 3.4rem)', lineHeight: 1.08, letterSpacing: '-0.03em' }}>
                        The backbone for AI development
                    </h1>
                    <p style={{ margin: '20px auto 0', maxWidth: 620, fontSize: 'var(--ox-text-md)', lineHeight: 1.6, color: 'rgba(238,243,242,0.74)' }}>
                        Open Exchange exists to do two things: build a centralised smart-routing exchange that sends every request to the best place, and build the best power-user AI tools in the market.
                    </p>
                </div>
            </section>

            <Section tone="beige">
                <div className="oe-grid-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
                    <StatCard label="Models routed" value="314+" hint="70+ providers" />
                    <StatCard label="Context range" value="2M" unit="tokens" hint="max window" />
                    <StatCard label="Gateway uptime" value="99.98" unit="%" delta="30d" deltaDirection="up" />
                    <StatCard label="Per transaction" value="$0.01" hint="at-cost compute" />
                </div>
                <div style={{ marginTop: 40 }}>
                    <div className="oe-grid-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
                        {VALUES.map((v) => (
                            <Card key={v.title} padding="lg" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                <Icon name={v.icon} size={22} color="var(--ox-green-600)" />
                                <div style={{ fontWeight: 700, fontSize: 16 }}>{v.title}</div>
                                <p style={{ margin: 0, color: 'var(--ox-text-muted)', fontSize: 13.5, lineHeight: 1.5 }}>{v.body}</p>
                            </Card>
                        ))}
                    </div>
                </div>
            </Section>

            {/* security */}
            <Section tone="subtle" id="security">
                <SectionHeading eyebrow="Security & compliance" title="Trust, by construction" subtitle="Infrastructure-grade practices across secrets, isolation, transport and audit." />
                <div className="oe-grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 18, marginTop: 36 }}>
                    {SECURITY.map(([t, d]) => (
                        <Card key={t} padding="lg" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            <Icon name="shield" size={20} color="var(--ox-green-600)" />
                            <div style={{ fontWeight: 700, fontSize: 15.5 }}>{t}</div>
                            <p style={{ margin: 0, color: 'var(--ox-text-muted)', fontSize: 13.5, lineHeight: 1.5 }}>{d}</p>
                        </Card>
                    ))}
                </div>
            </Section>

            {/* status */}
            <Section tone="ink" id="status">
                <div className="oe-2col" style={{ display: 'grid', gridTemplateColumns: '0.8fr 1.2fr', gap: 44, alignItems: 'center' }}>
                    <SectionHeading tone="dark" eyebrow="Status" title="All systems operational" subtitle="Live health across the exchange. 90-day rolling uptime shown per service." />
                    <Card padding="none" style={{ background: 'var(--ox-ink-800)', border: '1px solid rgba(255,255,255,0.09)' }}>
                        {STATUS.map(([svc, up], i) => (
                            <div key={svc} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '15px 18px', borderTop: i ? '1px solid rgba(255,255,255,0.07)' : 'none' }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#eef3f2', fontSize: 14.5, fontWeight: 600 }}>
                                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--ox-green-500)', boxShadow: '0 0 8px var(--ox-green-500)' }} />
                                    {svc}
                                </span>
                                <span style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                    <span style={{ fontFamily: 'var(--ox-font-mono)', fontSize: 13, color: 'rgba(238,243,242,0.6)' }}>{up}</span>
                                    <Badge tone="success">Operational</Badge>
                                </span>
                            </div>
                        ))}
                    </Card>
                </div>
            </Section>

            {/* research */}
            <Section tone="beige" id="research">
                <SectionHeading eyebrow="Research & blog" title="Legitimacy, in writing" subtitle="Articles and research — free marketing, and a record of how the exchange thinks." />
                <div className="oe-grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 18, marginTop: 36 }}>
                    {ARTICLES.map((a) => (
                        <Link key={a.slug} href={`/blog/${a.slug}`} style={{ textDecoration: 'none' }}>
                            <Card interactive padding="lg" style={{ display: 'flex', flexDirection: 'column', gap: 12, height: '100%' }}>
                                <Badge tone="neutral" dot={false}>{a.tag}</Badge>
                                <div style={{ fontWeight: 700, fontSize: 17, lineHeight: 1.25, color: 'var(--ox-text)' }}>{a.title}</div>
                                <p style={{ margin: 0, color: 'var(--ox-text-muted)', fontSize: 14, lineHeight: 1.55, flex: 1 }}>{a.excerpt}</p>
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--ox-green-700)', fontWeight: 600, fontSize: 13.5 }}>Read <Icon name="arrow-right" size={15} color="var(--ox-green-700)" /></span>
                            </Card>
                        </Link>
                    ))}
                </div>
            </Section>

            {/* contact */}
            <Section tone="ink-deep" id="contact">
                <div className="oe-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 44, alignItems: 'center' }}>
                    <SectionHeading tone="dark" eyebrow="Contact" title="Talk to the exchange"
                        subtitle="Questions about routing, enterprise venues, volume pricing or reselling with your own rates — we'll get back to you fast." />
                    <Card padding="lg" style={{ background: 'var(--ox-ink-800)', border: '1px solid rgba(255,255,255,0.09)' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            <input placeholder="Work email" style={inputStyle} />
                            <input placeholder="Company" style={inputStyle} />
                            <textarea placeholder="What are you building?" rows={3} style={{ ...inputStyle, resize: 'vertical' }} />
                            <Button size="lg" fullWidth trailingIcon={<Icon name="arrow-right" size={16} color="var(--ox-on-primary)" />}>Contact sales</Button>
                            <span style={{ fontFamily: 'var(--ox-font-mono)', fontSize: 12, color: 'rgba(238,243,242,0.45)', textAlign: 'center' }}>or email hello@openexchange.ai</span>
                        </div>
                    </Card>
                </div>
            </Section>

            <Section tone="beige" pad="xl">
                <div style={{ textAlign: 'center', maxWidth: 620, margin: '0 auto' }}>
                    <SectionHeading align="center" title="Join the exchange" style={{ alignItems: 'center' }}
                        actions={<Button as={Link} href="/register" size="lg" trailingIcon={<Icon name="arrow-right" size={16} color="var(--ox-on-primary)" />}>Create account</Button>} />
                </div>
            </Section>
        </MarketingLayout>
    );
}

const inputStyle: React.CSSProperties = {
    width: '100%', padding: '11px 13px', borderRadius: 'var(--ox-radius-md)', border: '1px solid rgba(255,255,255,0.14)',
    background: 'rgba(255,255,255,0.04)', color: '#eef3f2', fontFamily: 'var(--ox-font-sans)', fontSize: 14, outline: 'none',
};
