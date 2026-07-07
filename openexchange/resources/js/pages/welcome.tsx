import { Head, Link } from '@inertiajs/react';
import MarketingLayout from '@/layouts/marketing-layout';
import { Section } from '@/components/marketing/Section';
import {
    Button, Icon, Badge, Card, DotField, FlowRouting, RateTicker,
    GradeRatesBoard, BalanceMeter, PipelineFlow, SectionHeading, GradeBadge,
} from '@/components/oe';
import { PRODUCTS, FEES } from '@/lib/site';

const PROVIDERS = ['OpenAI', 'Anthropic', 'Google', 'Meta', 'Mistral', 'DeepSeek', 'Groq', 'xAI', 'Cohere', 'Ollama'];

const BENEFITS = [
    { icon: 'credit-card', title: 'Single bill', body: 'No provider accounts to juggle. Every model, every request — metered and billed through one gateway.' },
    { icon: 'sliders', title: 'Best model per request', body: 'The LAIE O-Algo picks the optimal model on cost, quality, latency and capability — or you choose.' },
    { icon: 'shield', title: 'Enterprise controls', body: 'Policy Shields, quotas, spend caps, allow/deny lists and full audit logs across every workspace.' },
    { icon: 'cpu', title: 'Developer-first', body: 'One clean /v1 REST API with streaming, an embeddable widget, and usage headers on every response.' },
    { icon: 'lock', title: 'Security by design', body: 'Encrypted secrets, workspace isolation and output filters that redact keys and system prompts.' },
    { icon: 'trending-up', title: 'A real market', body: 'Graded instruments, live Grade Rates, clearing and dark pools — AI capacity as a tradable commodity.' },
];

export default function Home() {
    return (
        <MarketingLayout>
            <Head title="The commoditised AI exchange" />

            {/* ============================ HERO ============================ */}
            <section className="ox-dark" style={{ position: 'relative', background: 'var(--ox-ink-900)', color: '#eef3f2', overflow: 'hidden' }}>
                <div className="ox-dot-grid ox-dot-grid--fade" style={{ position: 'absolute', inset: 0, ['--ox-dot-focus' as string]: '22% 40%' }} />
                <DotField style={{ left: 'auto', right: '-16%', top: '-10%', width: '62%', height: '120%', opacity: 0.5 }} />
                <div className="ox-container-wide oe-hero-grid" style={{ position: 'relative', display: 'grid', gridTemplateColumns: '1.05fr 0.95fr', gap: 48, alignItems: 'center', paddingBlock: '92px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 22, maxWidth: 620 }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, alignSelf: 'flex-start', padding: '5px 12px', borderRadius: 999, background: 'rgba(51,193,62,0.12)', border: '1px solid rgba(51,193,62,0.28)' }}>
                            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--ox-green-500)', boxShadow: '0 0 8px var(--ox-green-500)' }} />
                            <span style={{ fontFamily: 'var(--ox-font-mono)', fontSize: 12, letterSpacing: '0.06em', color: 'var(--ox-green-400)' }}>THE AI EXCHANGE · LIVE</span>
                        </span>
                        <h1 style={{ margin: 0, fontWeight: 800, fontSize: 'clamp(2.4rem, 5.2vw, 4rem)', lineHeight: 1.05, letterSpacing: '-0.03em' }}>
                            One request.<br />The best model.<br /><span style={{ color: 'var(--ox-green-500)' }}>One bill.</span>
                        </h1>
                        <p style={{ margin: 0, fontSize: 'var(--ox-text-md)', lineHeight: 1.6, color: 'rgba(238,243,242,0.74)', maxWidth: 520 }}>
                            Open Exchange is the commoditised AI exchange — a smart-routing gateway across every provider,
                            with the enterprise layer OpenRouter lacks and a real market on top. Route, meter and bill
                            inference through one dependable API.
                        </p>
                        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 4 }}>
                            <Button as={Link} href="/register" size="lg" trailingIcon={<Icon name="arrow-right" size={17} color="var(--ox-on-primary)" />}>Start routing free</Button>
                            <Button as={Link} href="/whitepaper" size="lg" variant="secondary" leadingIcon={<Icon name="database" size={16} />}>Read the white paper</Button>
                        </div>
                        <div style={{ display: 'flex', gap: 24, marginTop: 12, flexWrap: 'wrap' }}>
                            {[['314+', 'models routed'], ['70+', 'providers & labs'], ['$0.01', 'per transaction']].map(([n, l]) => (
                                <div key={l}>
                                    <div style={{ fontFamily: 'var(--ox-font-mono)', fontSize: 22, fontWeight: 600, color: '#eef3f2' }}>{n}</div>
                                    <div style={{ fontSize: 12.5, color: 'rgba(238,243,242,0.55)' }}>{l}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* routing visual */}
                    <div style={{ position: 'relative', borderRadius: 20, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(12,23,25,0.5)', boxShadow: 'var(--ox-shadow-xl)', padding: 8 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                            <span style={{ fontFamily: 'var(--ox-font-mono)', fontSize: 12, color: 'rgba(238,243,242,0.6)' }}>POST /v1/chat</span>
                            <Badge tone="success">best execution</Badge>
                        </div>
                        <FlowRouting />
                    </div>
                </div>
                <RateTicker tone="dark" />
            </section>

            {/* ======================= PROVIDER STRIP ======================= */}
            <Section tone="cream" pad="md">
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
                    <span className="ox-eyebrow">One interface · every provider</span>
                    <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '18px 34px' }}>
                        {PROVIDERS.map((p) => (
                            <span key={p} style={{ fontFamily: 'var(--ox-font-sans)', fontWeight: 700, fontSize: 18, letterSpacing: '-0.01em', color: 'var(--ox-text-subtle)' }}>{p}</span>
                        ))}
                    </div>
                </div>
            </Section>

            {/* ========================= HOW IT WORKS ========================= */}
            <Section tone="beige">
                <SectionHeading
                    align="center"
                    eyebrow="How one request works"
                    title="A request enters the gateway. The best model answers."
                    subtitle="Every call runs the same deterministic pipeline — guarded, routed, metered and streamed back — with a decision log you can inspect."
                />
                <div style={{ marginTop: 44, padding: '28px 20px', borderRadius: 'var(--ox-radius-xl)', background: 'var(--ox-cream)', border: '1px solid var(--ox-border)', boxShadow: 'var(--ox-shadow-sm)', overflowX: 'auto' }}>
                    <PipelineFlow tone="light" style={{ minWidth: 680 }} />
                </div>
                <div className="oe-2col" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, marginTop: 28 }}>
                    {[
                        { k: 'Automatic or your call', v: 'Route by Auto, Cost, Quality, Fast, Code, Vision or JSON — or override the model outright.' },
                        { k: 'Ordered fallbacks', v: 'Primary model plus a ranked fallback list, so a provider hiccup never becomes your outage.' },
                        { k: '“Why this model?”', v: 'X-Model-Selected headers and a stored decision log make every route auditable and explainable.' },
                    ].map((x) => (
                        <div key={x.k} style={{ padding: '4px 2px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, marginBottom: 6 }}>
                                <Icon name="check" size={17} color="var(--ox-green-600)" />{x.k}
                            </div>
                            <p style={{ margin: 0, color: 'var(--ox-text-muted)', fontSize: 14, lineHeight: 1.6 }}>{x.v}</p>
                        </div>
                    ))}
                </div>
            </Section>

            {/* ======================= PRODUCT FAMILY ======================= */}
            <Section tone="subtle">
                <SectionHeading
                    eyebrow="The family"
                    title="Six products, one exchange"
                    subtitle="The routing engine is the backbone. On top of it sits a family of products — from a power-user workspace to a crypto-settled futures market."
                />
                <div className="oe-grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 18, marginTop: 40 }}>
                    {PRODUCTS.map((p) => (
                        <Link key={p.slug} href={p.href} style={{ textDecoration: 'none' }}>
                            <Card interactive padding="lg" style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 14 }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <span style={{ display: 'grid', placeItems: 'center', width: 44, height: 44, borderRadius: 12, background: 'var(--ox-primary-subtle)' }}>
                                        <Icon name={p.icon} size={22} color="var(--ox-green-600)" />
                                    </span>
                                    <Badge tone="neutral" dot={false}>{p.tag}</Badge>
                                </div>
                                <div>
                                    <div style={{ fontWeight: 800, fontSize: 19, color: 'var(--ox-text)', letterSpacing: '-0.01em' }}>{p.name}</div>
                                    <p style={{ margin: '6px 0 0', color: 'var(--ox-text-muted)', fontSize: 14, lineHeight: 1.55 }}>{p.blurb}</p>
                                </div>
                                <span style={{ marginTop: 'auto', display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--ox-green-700)', fontWeight: 600, fontSize: 13.5 }}>
                                    Explore <Icon name="arrow-right" size={15} color="var(--ox-green-700)" />
                                </span>
                            </Card>
                        </Link>
                    ))}
                </div>
            </Section>

            {/* ========================= WHY / BENEFITS ========================= */}
            <Section tone="beige">
                <div className="oe-2col" style={{ display: 'grid', gridTemplateColumns: '0.9fr 1.1fr', gap: 48, alignItems: 'center' }}>
                    <SectionHeading
                        eyebrow="Why Open Exchange"
                        title="OpenRouter, plus the enterprise layer — and a market"
                        subtitle="The only established player routes models but stops there: no policy layers, no optimisation, no segmentation, no agents. We start where they stop."
                        actions={<Button as={Link} href="/products/ai-router" variant="secondary" trailingIcon={<Icon name="arrow-right" size={15} />}>See the router</Button>}
                    />
                    <div className="oe-grid-2" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
                        {BENEFITS.map((b) => (
                            <Card key={b.title} padding="md" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                <Icon name={b.icon} size={20} color="var(--ox-green-600)" />
                                <div style={{ fontWeight: 700, fontSize: 15 }}>{b.title}</div>
                                <p style={{ margin: 0, color: 'var(--ox-text-muted)', fontSize: 13, lineHeight: 1.5 }}>{b.body}</p>
                            </Card>
                        ))}
                    </div>
                </div>
            </Section>

            {/* ========================== MARKETS ========================== */}
            <Section tone="ink">
                <div className="oe-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 44, alignItems: 'center' }}>
                    <div>
                        <SectionHeading
                            tone="dark"
                            eyebrow="Markets"
                            title="AI capacity, graded and traded"
                            subtitle="Every request class becomes a standardised Instrument with a Grade (like Z5) and a live Grade Rate. Deal in Lots of 1M tokens, clear in real time, and hedge with futures."
                            actions={
                                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                                    <Button as={Link} href="/markets" trailingIcon={<Icon name="arrow-right" size={15} color="var(--ox-on-primary)" />}>Open the markets</Button>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <GradeBadge grade="Z5" /><GradeBadge grade="AA10" /><GradeBadge grade="X6" />
                                    </div>
                                </div>
                            }
                        />
                    </div>
                    <GradeRatesBoard tone="dark" />
                </div>
            </Section>

            {/* ========================== PRICING ========================== */}
            <Section tone="subtle">
                <div className="oe-2col" style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: 44, alignItems: 'center' }}>
                    <div>
                        <SectionHeading
                            eyebrow="Commoditised pricing"
                            title="Priced to move volume — not to gouge margin"
                            subtitle="A small market-participation fee, near-cost compute, and transparent per-request clearing. You set your own client rates on top."
                        />
                        <div className="oe-grid-2" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14, marginTop: 28 }}>
                            <Card padding="md">
                                <div className="ox-eyebrow" style={{ marginBottom: 6 }}>Participation</div>
                                <div style={{ fontFamily: 'var(--ox-font-mono)', fontSize: 28, fontWeight: 600 }}>${FEES.participation}<span style={{ fontSize: 14, color: 'var(--ox-text-subtle)' }}>/yr</span></div>
                                <p style={{ margin: '6px 0 0', fontSize: 13, color: 'var(--ox-text-muted)' }}>Held as credit. ${FEES.participationOrg} for larger orgs.</p>
                            </Card>
                            <Card padding="md">
                                <div className="ox-eyebrow" style={{ marginBottom: 6 }}>Per transaction</div>
                                <div style={{ fontFamily: 'var(--ox-font-mono)', fontSize: 28, fontWeight: 600 }}>${FEES.perTxn}</div>
                                <p style={{ margin: '6px 0 0', fontSize: 13, color: 'var(--ox-text-muted)' }}>Compute at cost. Clearing from ${FEES.clearing[0].price}/req.</p>
                            </Card>
                        </div>
                        <div style={{ marginTop: 18 }}>
                            <Button as={Link} href="/pricing" variant="secondary" trailingIcon={<Icon name="arrow-right" size={15} />}>See full pricing</Button>
                        </div>
                    </div>
                    <div>
                        <div className="ox-eyebrow" style={{ marginBottom: 12 }}>Client billing · auto top-up</div>
                        <BalanceMeter balance={42.5} min={10} topUp={50} />
                        <p style={{ margin: '14px 2px 0', fontSize: 13, color: 'var(--ox-text-muted)', lineHeight: 1.55 }}>
                            Clients prepay a balance and set a minimum. When usage draws it below the threshold, Open Exchange tops it up automatically from their saved card.
                        </p>
                    </div>
                </div>
            </Section>

            {/* ======================== WHITE PAPER CTA ======================== */}
            <Section tone="ink-deep" pad="xl">
                <div style={{ position: 'relative', textAlign: 'center', maxWidth: 720, margin: '0 auto' }}>
                    <SectionHeading
                        tone="dark"
                        align="center"
                        eyebrow="The thesis"
                        title="Read how we grade, route and clear AI"
                        subtitle="The white paper covers the LAIE O-Algo routing model, the V–Z grading methodology, the reference architecture and the market mechanics behind the exchange."
                        actions={
                            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                                <Button as={Link} href="/whitepaper" size="lg" trailingIcon={<Icon name="arrow-right" size={16} color="var(--ox-on-primary)" />}>Read the white paper</Button>
                                <Button as={Link} href="/register" size="lg" variant="secondary">Create an account</Button>
                            </div>
                        }
                        style={{ alignItems: 'center' }}
                    />
                </div>
            </Section>
        </MarketingLayout>
    );
}
