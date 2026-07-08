import { ReactNode } from 'react';
import { Head, Link } from '@inertiajs/react';
import MarketingLayout from '@/layouts/marketing-layout';
import { Section } from '@/components/marketing/Section';
import {
    Button, Icon, Badge, Card, FlowRouting, GradeRatesBoard, ModelCatalogTable,
    RateTicker, StatCard, SectionHeading, GradeBadge,
} from '@/components/oe';

type Feature = { icon: string; title: string; body: string };
type Content = {
    name: string;
    tag: string;
    eyebrow: string;
    tagline: string;
    description: string;
    roadmap?: boolean;
    domain?: string;
    visual: ReactNode;
    features: Feature[];
    featuresTitle: string;
    featuresSub: string;
    extra?: ReactNode;
};

/* ----------------------------- visuals ----------------------------- */

function FramedInk({ label, badge, children }: { label: string; badge?: string; children: ReactNode }) {
    return (
        <div style={{ borderRadius: 20, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(12,23,25,0.5)', boxShadow: 'var(--ox-shadow-xl)', padding: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                <span style={{ fontFamily: 'var(--ox-font-mono)', fontSize: 12, color: 'rgba(238,243,242,0.6)' }}>{label}</span>
                {badge && <Badge tone="success">{badge}</Badge>}
            </div>
            <div style={{ padding: 6 }}>{children}</div>
        </div>
    );
}

function WorkspaceVisual() {
    const chips = ['Auto', 'Cost', 'Quality', 'Fast', 'Code'];
    return (
        <FramedInk label="hyperquay · workspace" badge="streaming">
            <div style={{ padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 12, minHeight: 300 }}>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {chips.map((c, i) => (
                        <span key={c} style={{ fontFamily: 'var(--ox-font-mono)', fontSize: 11, padding: '4px 10px', borderRadius: 999, border: `1px solid ${i === 0 ? 'var(--ox-green-500)' : 'rgba(255,255,255,0.12)'}`, color: i === 0 ? 'var(--ox-green-400)' : 'rgba(238,243,242,0.6)', background: i === 0 ? 'rgba(51,193,62,0.1)' : 'transparent' }}>{c}</span>
                    ))}
                </div>
                <div style={{ alignSelf: 'flex-end', maxWidth: '80%', background: 'rgba(51,193,62,0.12)', border: '1px solid rgba(51,193,62,0.25)', borderRadius: '12px 12px 4px 12px', padding: '10px 13px', fontSize: 13.5, color: '#eef3f2' }}>
                    Summarise this contract and flag any liability clauses.
                </div>
                <div style={{ alignSelf: 'flex-start', maxWidth: '85%' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                        <span style={{ fontFamily: 'var(--ox-font-mono)', fontSize: 11, color: 'var(--ox-green-400)' }}>claude-sonnet-5</span>
                        <GradeBadge grade="Z8" size="sm" />
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: '12px 12px 12px 4px', padding: '10px 13px', fontSize: 13.5, color: 'rgba(238,243,242,0.85)', lineHeight: 1.55 }}>
                        Three liability clauses need attention. §7.2 caps damages at fees paid; §11 shifts indemnity to you…
                    </div>
                </div>
                <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: 8, border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '9px 12px' }}>
                    <Icon name="search" size={16} color="rgba(238,243,242,0.4)" />
                    <span style={{ fontSize: 13, color: 'rgba(238,243,242,0.4)' }}>Ask anything — the gateway routes it</span>
                    <span style={{ marginLeft: 'auto', display: 'grid', placeItems: 'center', width: 28, height: 28, borderRadius: 8, background: 'var(--ox-green-500)' }}>
                        <Icon name="arrow-right" size={15} color="var(--ox-on-primary)" />
                    </span>
                </div>
            </div>
        </FramedInk>
    );
}

function ServicesVisual() {
    const pre = ['Security', 'Anonymise', 'Corp policy', 'Prompt enhance', 'Segmentation', 'Agents', 'Cost limit', 'Allow/deny'];
    const post = ['Data integrity', 'Malware scan', 'Storage'];
    const col = (title: string, items: string[], tone: string) => (
        <div style={{ flex: 1, minWidth: 150 }}>
            <div style={{ fontFamily: 'var(--ox-font-mono)', fontSize: 11, letterSpacing: '0.06em', color: tone, marginBottom: 10 }}>{title}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {items.map((i) => (
                    <div key={i} style={{ fontSize: 12.5, padding: '7px 10px', borderRadius: 8, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(238,243,242,0.82)' }}>{i}</div>
                ))}
            </div>
        </div>
    );
    return (
        <FramedInk label="request pipeline · layers">
            <div style={{ display: 'flex', gap: 14, padding: 10, flexWrap: 'wrap' }}>
                {col('PRE-REQUEST', pre, 'var(--ox-green-400)')}
                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 8, minWidth: 90 }}>
                    <span style={{ display: 'grid', placeItems: 'center', width: 46, height: 46, borderRadius: 12, background: 'rgba(51,193,62,0.12)', border: '1px solid rgba(51,193,62,0.35)' }}>
                        <Icon name="cpu" size={22} color="var(--ox-green-500)" />
                    </span>
                    <span style={{ fontFamily: 'var(--ox-font-mono)', fontSize: 10, color: 'rgba(238,243,242,0.6)' }}>REQUEST</span>
                </div>
                {col('POST-REQUEST', post, 'var(--ox-gold-400)')}
            </div>
        </FramedInk>
    );
}

function DataVisual() {
    const news = [
        ['GPT-4o output price cut 20%', '2h'],
        ['Gemini 2.5 Flash adds 1M context', '5h'],
        ['DeepSeek V3 availability restored', '1d'],
    ];
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div className="oe-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <StatCard label="Models tracked" value="314" delta="+7" deltaDirection="up" hint="this week" />
                <StatCard label="Avg $/1M in" value="1.42" unit="USD" delta="-6%" deltaDirection="down" hint="30d" />
            </div>
            <FramedInk label="live · ai market news">
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    {news.map(([t, ago], i) => (
                        <div key={t} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, padding: '11px 12px', borderTop: i ? '1px solid rgba(255,255,255,0.06)' : 'none' }}>
                            <span style={{ fontSize: 13, color: 'rgba(238,243,242,0.85)' }}>{t}</span>
                            <span style={{ fontFamily: 'var(--ox-font-mono)', fontSize: 11, color: 'rgba(238,243,242,0.4)' }}>{ago}</span>
                        </div>
                    ))}
                </div>
            </FramedInk>
        </div>
    );
}

/* ----------------------------- content ----------------------------- */

const CONTENT: Record<string, Content> = {
    'ai-router': {
        name: 'AI Router', tag: 'Flagship', eyebrow: 'aixroute.com', domain: 'The routing engine',
        tagline: 'One API for every model.',
        description: 'Send one request; the LAIE O-Algo picks the best model on cost, quality, latency and capability — or you choose. Ordered fallbacks, a deterministic decision log, and usage metered on our provider keys.',
        visual: <FramedInk label="POST /v1/chat" badge="best execution"><FlowRouting /></FramedInk>,
        featuresTitle: 'Everything a gateway should do — and the parts it usually skips',
        featuresSub: 'Model aggregation is table stakes. The router adds the policy, optimisation and explainability an operator actually needs.',
        features: [
            { icon: 'sliders', title: 'Auto-routing engine', body: 'Route by Auto, Cost, Quality, Fast, Code, Vision or JSON — or pass a weighted vector like [cost:10, speed:7, quality:10].' },
            { icon: 'layers', title: 'Model catalog & ranking', body: 'A live catalogue with price, context, capabilities and a model-ranking system across 314+ models and 70+ providers.' },
            { icon: 'refresh-cw', title: 'Ordered fallbacks', body: 'Primary model plus a ranked fallback list, with retries — a provider outage never becomes yours.' },
            { icon: 'activity', title: 'Prompt analyzer', body: 'Detects code, JSON, vision and token length up front, then matches against workspace policies and budget tiers.' },
            { icon: 'search', title: '“Why this model?”', body: 'X-Model-Selected and X-Fallback-Used headers plus a stored decision log make every route auditable.' },
            { icon: 'cpu', title: 'One /v1 API', body: 'Chat, RAG, embeddings and models behind a single REST surface with streaming and usage headers.' },
        ],
        extra: (
            <Section tone="ink">
                <SectionHeading tone="dark" eyebrow="Routing catalogue" title="The models, graded and priced" subtitle="Enable or disable models per workspace; every one carries a live instrument grade and per-1M pricing." />
                <div style={{ marginTop: 32 }}><ModelCatalogTable tone="dark" /></div>
            </Section>
        ),
    },
    hyperquay: {
        name: 'HYPERQUAY', tag: 'Power tool', eyebrow: 'hyperquay.com', domain: 'Power-user workspace',
        tagline: 'The power-user AI workspace.',
        description: 'An active LLM interface built for people who live in AI all day — corporate policy, personas and writing styles, workspaces and folders, custom history backups and one-click API generation, all on top of smart routing.',
        visual: <WorkspaceVisual />,
        featuresTitle: 'A cockpit, not a chatbox',
        featuresSub: 'Everything power users ask for — organised, governed and portable.',
        features: [
            { icon: 'user', title: 'Personas & writing styles', body: 'Switch between “university”, “work” and custom voices; the workspace keeps tone and context consistent.' },
            { icon: 'layers', title: 'Workspaces & folders', body: 'Organise projects with breadcrumb navigation, shared folders and per-workspace routing policies.' },
            { icon: 'shield', title: 'Policy & guardrails', body: 'Corporate policy layers, spend caps and allow/deny lists apply to every request automatically.' },
            { icon: 'database', title: 'History backups', body: 'Custom, exportable history backups you own — nothing locked inside a vendor silo.' },
            { icon: 'key', title: 'Custom API generation', body: 'Turn any saved workflow into a callable endpoint with generated keys in a click.' },
            { icon: 'zap', title: 'Agents', body: 'Break a large task into optimum sub-tasks and route each to the best service, then reassemble.' },
        ],
    },
    exchange: {
        name: 'AI Exchange', tag: 'Markets', eyebrow: 'newyorkaiexchange.com · londonaiexchange.com', domain: 'Endpoint exchange',
        tagline: 'Trade AI endpoints like a market.',
        description: 'The exchange for AI endpoints — smart routing, price comparison, cost savings and uptime guarantees, cleared through regional venues in New York and London. AI capacity, priced and executed like a commodity.',
        visual: <FramedInk label="markets · london · new york"><GradeRatesBoard tone="dark" /></FramedInk>,
        featuresTitle: 'Best execution, exchange-grade',
        featuresSub: 'The routing engine, framed as a venue: quotes, clearing, settlement and market data.',
        features: [
            { icon: 'trending-up', title: 'Endpoint exchange', body: 'A single system for exchanging AI endpoints across every connected provider and lab.' },
            { icon: 'scale', title: 'Price comparison', body: 'Live Grade Rates for every Class and Grade, so a Deal always executes at the best available price.' },
            { icon: 'refresh-cw', title: 'Clearing & settlement', body: 'The Clearing Stream Connector reserves, executes and settles usage — request clearing in real time.' },
            { icon: 'globe', title: 'Regional venues', body: 'New York and London venues for locality, redundancy and jurisdictional routing.' },
            { icon: 'activity', title: 'Market & order types', body: 'Market, Limit and Quote orders — get a price without invoking the model, or cap your spend.' },
            { icon: 'database', title: 'Market data', body: 'Depth, rates and history exposed as a data feed for your own dashboards and models.' },
        ],
    },
    openexchange: {
        name: 'OpenExchange.ai', tag: 'Crypto', eyebrow: 'openexchange.ai', domain: 'Crypto-settled exchange',
        tagline: 'The crypto-settled AI exchange.',
        description: 'The AI exchange, settled in crypto — with futures on instrument prices and dark-pool market making. Trade graded AI instruments with global access and anonymity at heart.',
        roadmap: true,
        visual: <FramedInk label="openexchange · settlement"><GradeRatesBoard tone="dark" rows={[
            { instrument: 'LANG·Z', klass: 'Spot', grade: 'Z5', rate: '12.40', chg: '+2.1%', dir: 'up', lot: '1M' },
            { instrument: 'RSN·AA-F', klass: 'Future', grade: 'AA10', rate: '61.20', chg: '-3.1%', dir: 'down', lot: '1M' },
            { instrument: 'VIS·Y-F', klass: 'Future', grade: 'Y7', rate: '20.90', chg: '+1.4%', dir: 'up', lot: '1M' },
            { instrument: 'DARK·Z', klass: 'Dark pool', grade: 'Z8', rate: '—', chg: '·', dir: 'flat', lot: '10M' },
        ]} /></FramedInk>,
        featuresTitle: 'A market for AI capacity, on-chain',
        featuresSub: 'The exchange thesis taken to its conclusion: standardised instruments, derivatives and crypto settlement.',
        features: [
            { icon: 'globe', title: 'Crypto settlement', body: 'Fund and settle Deals in crypto for borderless, near-instant participation.' },
            { icon: 'trending-up', title: 'Futures & derivatives', body: 'Hedge or speculate on the price of graded AI instruments with futures contracts.' },
            { icon: 'layers', title: 'Dark pools', body: 'A market-making service for large size, executed away from the lit book.' },
            { icon: 'scale', title: 'Instruments & Grade Rates', body: 'Every Class and Grade is a standardised, tradable instrument with a live rate.' },
            { icon: 'lock', title: 'Anonymity at heart', body: 'Security and anonymity designed in, not bolted on.' },
            { icon: 'zap', title: 'Global access', body: 'Low barrier to entry, high ceiling — a distributed network and compute, open to all.' },
        ],
    },
    data: {
        name: 'Data & Insights', tag: 'Data', eyebrow: 'insights & data access', domain: 'Market data & news',
        tagline: 'Market data & live AI news.',
        description: 'The data layer of the exchange — model pricing indices, availability and status, live AI market news, and reports. Delivered as APIs, feeds and dashboards for teams that need to see the whole market.',
        visual: <DataVisual />,
        featuresTitle: 'See the whole AI market in one place',
        featuresSub: 'Pricing, availability and momentum across 314+ models and 70+ providers — as data you can build on.',
        features: [
            { icon: 'database', title: 'Market data feed', body: 'Live Grade Rates, depth and history for every instrument, streamed or polled.' },
            { icon: 'activity', title: 'Live AI news', body: 'Price changes, new models, deprecations and outages — a real-time market wire.' },
            { icon: 'scale', title: 'Model pricing index', body: 'Normalised per-1M input/output pricing across providers, tracked over time.' },
            { icon: 'globe', title: 'Availability & status', body: 'Uptime, moderation flags and health across the connected provider network.' },
            { icon: 'trending-up', title: 'Reports & exports', body: 'Scheduled reports and CSV/JSON exports for finance and analytics teams.' },
            { icon: 'cpu', title: 'Insights API', body: 'Query the whole dataset programmatically and wire it into your own tooling.' },
        ],
    },
    services: {
        name: 'Services & Layers', tag: 'Add-ons', eyebrow: 'shields · optimizers · guardians', domain: 'Composable layers',
        tagline: 'Compose your request pipeline.',
        description: 'À-la-carte layers that run before and after every request — Shields, Optimizers, Guardians and Agents. Add security, anonymisation, corporate policy, prompt enhancement, segmentation and agent orchestration, priced per use.',
        visual: <ServicesVisual />,
        featuresTitle: 'Build the pipeline your requests deserve',
        featuresSub: 'Named, configurable modules — e.g. “Vision Sector Optimizer Cost” or “Language Sector Shield Corporate”.',
        features: [
            { icon: 'shield', title: 'Shields', body: 'Security, data protection and anonymisation applied before a prompt ever reaches a provider.' },
            { icon: 'sliders', title: 'Optimizers', body: 'Prompt enhancement, caching and cost optimisation that improve every request.' },
            { icon: 'lock', title: 'Guardians', body: 'Corporate policy, blacklists/whitelists and cost limits enforced automatically.' },
            { icon: 'layers', title: 'Segmentation', body: 'Split large or mixed workloads into the right class and route each part optimally.' },
            { icon: 'cpu', title: 'Agent management', body: 'Break a big task into optimum sub-tasks and orchestrate them across services.' },
            { icon: 'database', title: 'Post-request', body: 'Data integrity checks, malicious-code scanning and storage after the model responds.' },
        ],
    },
};

/* ----------------------------- template ----------------------------- */

export function ProductPage({ slug }: { slug: string }) {
    const c = CONTENT[slug];
    if (!c) return null;
    return (
        <MarketingLayout>
            <Head title={`${c.name} — Open Exchange`} />

            <section className="ox-dark" style={{ position: 'relative', background: 'var(--ox-ink-900)', color: '#eef3f2', overflow: 'hidden' }}>
                <div className="ox-dot-grid ox-dot-grid--fade" style={{ position: 'absolute', inset: 0, ['--ox-dot-focus' as string]: '78% 40%' }} />
                <div className="ox-container-wide oe-hero-grid" style={{ position: 'relative', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, alignItems: 'center', paddingBlock: 'clamp(48px, 9vw, 76px)' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 560 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                            <Badge tone="brand">{c.tag}</Badge>
                            {c.roadmap && <Badge tone="gold">On the roadmap</Badge>}
                            <span style={{ fontFamily: 'var(--ox-font-mono)', fontSize: 12, color: 'rgba(238,243,242,0.5)' }}>{c.eyebrow}</span>
                        </div>
                        <h1 style={{ margin: 0, fontWeight: 800, fontSize: 'clamp(2.1rem, 4.4vw, 3.25rem)', lineHeight: 1.08, letterSpacing: '-0.03em' }}>
                            {c.name}<span style={{ display: 'block', color: 'var(--ox-green-500)', fontSize: '0.62em', marginTop: 10 }}>{c.tagline}</span>
                        </h1>
                        <p style={{ margin: 0, fontSize: 'var(--ox-text-md)', lineHeight: 1.6, color: 'rgba(238,243,242,0.74)' }}>{c.description}</p>
                        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 4 }}>
                            <Button as={Link} href="/register" size="lg" trailingIcon={<Icon name="arrow-right" size={16} color="var(--ox-on-primary)" />}>Get started</Button>
                            <Button as={Link} href="/developers" size="lg" variant="secondary">Developer docs</Button>
                        </div>
                    </div>
                    <div>{c.visual}</div>
                </div>
            </section>

            <Section tone="beige">
                <SectionHeading eyebrow={c.domain} title={c.featuresTitle} subtitle={c.featuresSub} />
                <div className="oe-grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 18, marginTop: 40 }}>
                    {c.features.map((f) => (
                        <Card key={f.title} padding="lg" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            <span style={{ display: 'grid', placeItems: 'center', width: 44, height: 44, borderRadius: 12, background: 'var(--ox-primary-subtle)' }}>
                                <Icon name={f.icon} size={22} color="var(--ox-green-600)" />
                            </span>
                            <div style={{ fontWeight: 700, fontSize: 17 }}>{f.title}</div>
                            <p style={{ margin: 0, color: 'var(--ox-text-muted)', fontSize: 14, lineHeight: 1.55 }}>{f.body}</p>
                        </Card>
                    ))}
                </div>
            </Section>

            {c.extra}

            <Section tone="ink-deep" pad="xl">
                <div style={{ textAlign: 'center', maxWidth: 640, margin: '0 auto' }}>
                    <SectionHeading tone="dark" align="center" title={`Start with ${c.name}`} subtitle="Create an account in minutes, or talk to us about enterprise routing, volume pricing and private venues." style={{ alignItems: 'center' }}
                        actions={
                            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                                <Button as={Link} href="/register" size="lg" trailingIcon={<Icon name="arrow-right" size={16} color="var(--ox-on-primary)" />}>Create account</Button>
                                <Button as={Link} href="/pricing" size="lg" variant="secondary">See pricing</Button>
                            </div>
                        }
                    />
                </div>
            </Section>
        </MarketingLayout>
    );
}
