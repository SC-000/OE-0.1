import { Head, Link } from '@inertiajs/react';
import MarketingLayout from '@/layouts/marketing-layout';
import { Section } from '@/components/marketing/Section';
import {
    Button, Icon, Badge, Card, PipelineFlow, GradeBadge, SectionHeading,
    LineArea, Bars, RankBars, Donut, StatCard,
} from '@/components/oe';

const TOC: [string, string][] = [
    ['abstract', 'Abstract'],
    ['trajectory', '1 · The trajectory of AI'],
    ['needs', '2 · What customers need'],
    ['inevitable', '3 · Why an exchange'],
    ['routing', '4 · The routing model'],
    ['weighting', '5 · Objective weighting'],
    ['grading', '6 · Grading methodology'],
    ['architecture', '7 · Reference architecture'],
    ['market', '8 · Market mechanics'],
    ['economics', '9 · Unit economics'],
    ['reliability', '10 · Reliability & SLAs'],
    ['roadmap', '11 · Roadmap'],
];

const INK = 'var(--ox-text)';
const MUTED = 'var(--ox-text-muted)';

function H({ id, n, children }: { id: string; n?: string; children: React.ReactNode }) {
    return (
        <h2 id={id} style={{ scrollMarginTop: 88, margin: '0 0 16px', fontWeight: 800, fontSize: 'var(--ox-text-xl)', letterSpacing: '-0.02em', color: INK }}>
            {n && <span style={{ fontFamily: 'var(--ox-font-mono)', color: 'var(--ox-green-600)', marginRight: 10 }}>{n}</span>}{children}
        </h2>
    );
}
const P = ({ children }: { children: React.ReactNode }) => <p style={{ margin: '0 0 16px', color: MUTED, fontSize: 15.5, lineHeight: 1.72 }}>{children}</p>;
const Block = ({ children }: { children: React.ReactNode }) => <div style={{ marginBottom: 56 }}>{children}</div>;

function Fig({ title, sub, source, children }: { title?: string; sub?: string; source?: string; children: React.ReactNode }) {
    return (
        <figure style={{ margin: '0 0 22px' }}>
            <div style={{ padding: '20px 18px 16px', borderRadius: 'var(--ox-radius-lg)', background: 'var(--ox-cream)', border: '1px solid var(--ox-border)', boxShadow: 'var(--ox-shadow-sm)' }}>
                {title && <div style={{ marginBottom: 16 }}>
                    <div style={{ fontWeight: 700, fontSize: 15, color: INK }}>{title}</div>
                    {sub && <div style={{ fontSize: 12.5, color: 'var(--ox-text-subtle)', marginTop: 2 }}>{sub}</div>}
                </div>}
                {children}
            </div>
            {source && <figcaption style={{ fontFamily: 'var(--ox-font-mono)', fontSize: 11, color: 'var(--ox-text-subtle)', marginTop: 8 }}>{source}</figcaption>}
        </figure>
    );
}

export default function Whitepaper() {
    return (
        <MarketingLayout>
            <Head title="White paper — Open Exchange" />

            {/* hero */}
            <section className="ox-dark" style={{ position: 'relative', background: 'var(--ox-ink-900)', color: '#eef3f2', overflow: 'hidden' }}>
                <div className="ox-dot-grid ox-dot-grid--fade" style={{ position: 'absolute', inset: 0, ['--ox-dot-focus' as string]: '50% 35%' }} />
                <div className="ox-container" style={{ position: 'relative', paddingBlock: '84px', textAlign: 'center' }}>
                    <Badge tone="brand">White paper · v1.1</Badge>
                    <h1 style={{ margin: '20px auto 0', maxWidth: 800, fontWeight: 800, fontSize: 'clamp(2.2rem, 4.6vw, 3.5rem)', lineHeight: 1.07, letterSpacing: '-0.03em' }}>
                        The exchange for a commoditised AI economy
                    </h1>
                    <p style={{ margin: '20px auto 0', maxWidth: 660, fontSize: 'var(--ox-text-md)', lineHeight: 1.6, color: 'rgba(238,243,242,0.74)' }}>
                        Intelligence is getting cheaper and more plural every quarter. As it commoditises, value migrates from any single model to whoever can route, meter, govern and clear across all of them. This paper makes the case — with the numbers — and specifies the system.
                    </p>
                    <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 26, flexWrap: 'wrap' }}>
                        <Button as="a" href="#abstract" size="lg" trailingIcon={<Icon name="arrow-right" size={16} color="var(--ox-on-primary)" />}>Read online</Button>
                        <Button as="a" href="#abstract" size="lg" variant="secondary" leadingIcon={<Icon name="database" size={16} />}>Download PDF</Button>
                    </div>
                    <div style={{ marginTop: 22, fontFamily: 'var(--ox-font-mono)', fontSize: 12, color: 'rgba(238,243,242,0.45)' }}>
                        Open Exchange · 11 sections · illustrative figures
                    </div>
                </div>
            </section>

            <Section tone="beige">
                <div className="oe-2col" style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 48, alignItems: 'flex-start' }}>
                    <nav className="oe-desktop-nav" style={{ position: 'sticky', top: 88, flexDirection: 'column', gap: 2 }}>
                        <div className="ox-eyebrow" style={{ marginBottom: 10 }}>Contents</div>
                        {TOC.map(([id, label]) => (
                            <a key={id} href={`#${id}`} style={{ padding: '7px 10px', borderRadius: 8, textDecoration: 'none', color: MUTED, fontSize: 13.5 }}>{label}</a>
                        ))}
                    </nav>

                    <article style={{ maxWidth: 760, minWidth: 0 }}>
                        <Block>
                            <H id="abstract">Abstract</H>
                            <P>Three forces are reshaping applied AI: the marginal cost of a competent token is collapsing, the number of viable models is exploding, and demand is compounding faster than either. Together they turn intelligence into a commodity — abundant, substitutable and priced at the margin. In every commodity market that has come before, durable value accrued not to the lowest-cost producer but to the <em>exchange</em>: the layer that standardises the good, routes to best execution, meters consumption, enforces the rules and clears the trades.</P>
                            <P>Open Exchange is that layer for AI. This paper quantifies the trajectory, maps it to what buyers actually need, and specifies the routing model, grading methodology, reference architecture, market mechanics, unit economics and reliability guarantees that make the exchange work.</P>
                        </Block>

                        <Block>
                            <H id="trajectory" n="1">The trajectory of AI</H>
                            <P>The price of frontier-grade output has fallen roughly an order of magnitude in three years, and open-weight models track just beneath it. When a capability halves in price every ~9–12 months, buying a single provider's roadmap is a bet against your own margin.</P>
                            <Fig title="The cost of intelligence is collapsing" sub="Blended output price, indexed to 100 at 2023" source="Illustrative, indexed from public list prices · frontier vs open-weight">
                                <LineArea
                                    xLabels={['2023', '2024', '2025', '2026']}
                                    yMax={110} yUnit=""
                                    series={[
                                        { name: 'Frontier models', values: [100, 52, 26, 17], color: '#2a7de1' },
                                        { name: 'Open-weight models', values: [100, 44, 19, 12], color: '#33c13e' },
                                    ]}
                                />
                            </Fig>
                            <P>Simultaneously, demand is compounding. As price falls, previously uneconomic workloads — agents, retrieval over whole corpora, always-on copiloting — become viable, and consumption runs far ahead of the price decline.</P>
                            <Fig title="Inference demand is compounding" sub="Global inference volume, indexed to 100 at 2023" source="Illustrative index of tokens processed per day">
                                <LineArea
                                    xLabels={['2023', '2024', '2025', '2026']}
                                    yMax={2300}
                                    valueFmt={(v) => Math.round(v).toString()}
                                    series={[{ name: 'Inference volume', values: [100, 340, 900, 2100], color: '#33c13e' }]}
                                />
                            </Fig>
                            <P>And the field is fragmenting. The question is no longer "which model" but "which of hundreds, for this request, right now" — a routing problem, not a procurement one.</P>
                            <div className="oe-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                                <Fig title="Models keep multiplying" sub="Distinct models available via aggregators" source="Illustrative · 2026 projected">
                                    <Bars data={[
                                        { label: '2022', value: 28 }, { label: '2023', value: 96 }, { label: '2024', value: 210 }, { label: '2025', value: 314 }, { label: '2026', value: 480 },
                                    ]} projectedFrom={4} height={230} valueFmt={(v) => Math.round(v).toString()} />
                                </Fig>
                                <Fig title="A market forming fast" sub="Global AI inference spend, $B" source="Illustrative · 2026+ projected">
                                    <Bars data={[
                                        { label: '23', value: 6 }, { label: '24', value: 14 }, { label: '25', value: 30 }, { label: '26', value: 58 }, { label: '27', value: 96 }, { label: '28', value: 150 },
                                    ]} projectedFrom={3} height={230} valueFmt={(v) => '$' + Math.round(v)} />
                                </Fig>
                            </div>
                        </Block>

                        <Block>
                            <H id="needs" n="2">What customers actually need</H>
                            <P>Talk to anyone running AI in production and the same anxieties surface — and note what tops the list. It is not raw capability (models are good enough and getting cheaper); it is <strong>cost predictability</strong>, <strong>freedom from lock-in</strong>, and <strong>governance</strong>. These are exchange problems, not model problems.</P>
                            <Fig title="Buyer priorities in production AI" sub="Share rating each 'critical', illustrative" source="Composite of common enterprise buying criteria">
                                <RankBars items={[
                                    { label: 'Cost predictability', value: 92 },
                                    { label: 'No model lock-in', value: 88 },
                                    { label: 'Governance & policy', value: 81 },
                                    { label: 'Uptime & fallbacks', value: 78 },
                                    { label: 'Data control', value: 74 },
                                    { label: 'Latency', value: 63 },
                                ]} />
                            </Fig>
                            <P>A single bill, the best model per request, spend caps that actually hold, policy that travels with every call, and a fallback when a provider degrades — that is the product surface customers are asking for. It maps one-to-one onto an exchange.</P>
                        </Block>

                        <Block>
                            <H id="inevitable" n="3">Why an exchange is inevitable</H>
                            <P>When a good commoditises, margin migrates away from production toward standardisation and distribution. Grain has the CBOT; equities have exchanges and clearing houses; electricity has grid operators and spot markets. The pattern is consistent: a neutral layer defines the standard unit, discovers price, routes to best execution, and clears settlement — capturing a small, durable fee on enormous volume.</P>
                            <Fig title="Where enterprise AI spend accrues" sub="By layer, 2026 estimate" source="Illustrative allocation of applied-AI budget">
                                <Donut segments={[
                                    { label: 'Compute & models', value: 46 },
                                    { label: 'Gateway & orchestration', value: 22 },
                                    { label: 'Data & retrieval', value: 18 },
                                    { label: 'Governance & layers', value: 14 },
                                ]} centerValue="$58B" centerLabel="2026 est." />
                            </Fig>
                            <P>Model production is capital-intensive and racing to zero margin. The orchestration, governance and data layers — the exchange — are where a defensible, compounding business sits. Open Exchange is built to own that layer: standard instruments (Grades and Classes), a routing engine for best execution, metering and clearing, and a market on top.</P>
                        </Block>

                        <Block>
                            <H id="routing" n="4">The routing model — LAIE O-Algo</H>
                            <P>Each request carries signals: an objective, estimated token length, content features (code, JSON, vision) and a latency preference. The router scores a catalogue of models — annotated with price, context window and capability — against the objective function for the request's class, applies workspace policy (allow/deny, budget tiers) and returns a primary model plus an ordered fallback list.</P>
                            <P>Formally, the router maximises a weighted utility <span className="ox-mono">U(m) = Σ wᵢ · sᵢ(m)</span> subject to hard constraints (context ≥ tokens, cost ≤ cap, capability ⊇ required). Modes: <strong>Automatic</strong>, <strong>Category</strong> (presets), <strong>Specific</strong> (a weight vector like <span className="ox-mono">[cost:10, speed:7, quality:10]</span>) and <strong>Delayed Deal</strong> (trade latency for a better or cheaper fill). Every decision is logged deterministically and surfaced via <span className="ox-mono">X-Model-Selected</span> / <span className="ox-mono">X-Fallback-Used</span>.</P>
                        </Block>

                        <Block>
                            <H id="weighting" n="5">Objective weighting</H>
                            <P>"Best" is defined per class: each request class weights the quality attributes differently, and the router scores candidates against the relevant objective function.</P>
                            <Card padding="lg">
                                {[
                                    ['Language', 'Accuracy 35 · Quality 30 · Speed 15 · Cost 10 · Robustness 10'],
                                    ['Vision', 'Accuracy 40 · Quality 25 · Speed 15 · Cost 10 · Scalability 10'],
                                    ['Reasoning', 'Accuracy 40 · Quality 25 · Speed 15 · Cost 10 · Flexibility 10'],
                                    ['Generation', 'Quality 35 · Accuracy 25 · Speed 15 · Cost 10 · Diversity 15'],
                                    ['Control', 'Accuracy 35 · Speed 25 · Reliability 20 · Cost 10 · Scalability 10'],
                                ].map(([c, w], i) => (
                                    <div key={c} style={{ display: 'flex', justifyContent: 'space-between', gap: 16, padding: '11px 0', borderTop: i ? '1px solid var(--ox-divider)' : 'none' }}>
                                        <span style={{ fontWeight: 700, fontSize: 14, minWidth: 100 }}>{c}</span>
                                        <span style={{ fontFamily: 'var(--ox-font-mono)', fontSize: 12.5, color: MUTED, textAlign: 'right' }}>{w}</span>
                                    </div>
                                ))}
                            </Card>
                        </Block>

                        <Block>
                            <H id="grading" n="6">Grading methodology</H>
                            <P>Models are graded across ten quality categories — test performance, data accuracy, response time, security, scalability and more — on a 1–10 scale with defined thresholds (response time scores 10 below 100ms; data accuracy scores 10 above 99.5%). A capability <em>generation</em> letter from A to Z prefixes the score; V–Z denote the frontier. The result is a compact, tradable instrument code.</P>
                            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                                {['V4', 'W5', 'X6', 'Y7', 'Z8', 'AA10'].map((g) => <GradeBadge key={g} grade={g} size="lg" title={`Generation ${g[0]}, score ${g.slice(1)}`} />)}
                            </div>
                        </Block>

                        <Block>
                            <H id="architecture" n="7">Reference architecture</H>
                            <P>Every request runs the same pipeline: guarded (auth, plan, quota), routed, optionally grounded with retrieval, sent to the provider on a platform key, filtered to redact secrets, metered, and streamed back.</P>
                            <div style={{ padding: '24px 16px', borderRadius: 'var(--ox-radius-lg)', background: 'var(--ox-cream)', border: '1px solid var(--ox-border)', overflowX: 'auto', marginBottom: 16 }}>
                                <PipelineFlow tone="light" style={{ minWidth: 680 }} />
                            </div>
                            <P>Core components: the Routing Engine and Prompt Analyzer, the Model Catalog and Pricing Engine, the Clearing Stream Connector, and per-provider adapters with health checks and fallbacks. Secrets are encrypted at rest, workspaces isolated at the data and vector layers, and output filters run on every response.</P>
                        </Block>

                        <Block>
                            <H id="market" n="8">Market mechanics</H>
                            <P>A <strong>Deal</strong> is a single transaction; a <strong>Lot</strong> is 1M tokens; a <strong>Grade</strong> classifies a request class; a <strong>Grade Rate</strong> is its live price; an <strong>Instrument</strong> is a tradable Grade/Class pair. Orders come in three types — <strong>Market</strong>, <strong>Limit</strong> and <strong>Quote</strong> (price without invoking the model). The Clearing Stream Connector reserves, executes and settles usage in real time. On the roadmap: <strong>futures</strong> on instrument prices, <strong>dark pools</strong> for large size, and <strong>crypto settlement</strong> via OpenExchange.ai.</P>
                        </Block>

                        <Block>
                            <H id="economics" n="9">Unit economics</H>
                            <P>The exchange makes a small, transparent margin on volume, not a markup on compute. Participation is held as credit; compute is billed near cost; clearing is a few hundredths of a cent per request; resellers set their own per-model rate cards on top. At scale, a fraction of a cent per Deal across billions of Deals is the business — the same shape as every exchange before it.</P>
                            <div className="oe-grid-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
                                <StatCard label="Take rate / deal" value="<0.1" unit="¢" hint="clearing + participation" />
                                <StatCard label="Gross margin" value="82" unit="%" delta="exchange layer" deltaDirection="up" />
                                <StatCard label="Compute markup" value="0" unit="%" hint="billed at cost" />
                            </div>
                        </Block>

                        <Block>
                            <H id="reliability" n="10">Reliability &amp; SLAs</H>
                            <P>Best execution is also best <em>availability</em>. With an ordered fallback list of k independent providers each at availability a, a routed request fails only if all k fail: <span className="ox-mono">1 − (1 − a)ᵏ</span>. Three providers at 99.0% each yield 99.9999% routed availability — four nines beyond any single provider. The router degrades gracefully: on timeout or 5xx it re-routes to the next model within the request budget, and the decision log records every hop for reconciliation.</P>
                            <Fig title="Routed availability vs provider count" sub="Each provider independent at 99.0%" source="1 − (1 − 0.99)ᵏ, by number of fallbacks k">
                                <Bars data={[
                                    { label: '1', value: 99.0 }, { label: '2', value: 99.99 }, { label: '3', value: 99.9999 }, { label: '4', value: 99.999999 },
                                ]} yMax={100} height={210} valueFmt={(v) => v.toFixed(v >= 99.99 ? 4 : 2)} unit="" />
                            </Fig>
                        </Block>

                        <Block>
                            <H id="roadmap" n="11">Roadmap</H>
                            <P>Delivery proceeds in phases: Foundation → Routing Engine → Billing &amp; Metering → Admin Portal → Public API &amp; Widget → Hardening. The spot exchange and metered billing ship first; the derivatives market, dark pools and crypto settlement follow.</P>
                            <div style={{ display: 'flex', gap: 12, marginTop: 8, flexWrap: 'wrap' }}>
                                <Button as={Link} href="/register" trailingIcon={<Icon name="arrow-right" size={15} color="var(--ox-on-primary)" />}>Create an account</Button>
                                <Button as={Link} href="/markets" variant="secondary">See the markets</Button>
                            </div>
                        </Block>
                    </article>
                </div>
            </Section>
        </MarketingLayout>
    );
}
