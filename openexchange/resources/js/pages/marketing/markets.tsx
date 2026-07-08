import { Head, Link } from '@inertiajs/react';
import MarketingLayout from '@/layouts/marketing-layout';
import { Section } from '@/components/marketing/Section';
import { Button, Icon, Badge, Card, GradeRatesBoard, RateTicker, GradeBadge, SectionHeading } from '@/components/oe';

const TERMS = [
    ['Deal', 'A single AI transaction, executed against the current rate.'],
    ['Lot', 'The trading unit — 1M tokens.'],
    ['Grade', 'A classification of a request class, e.g. Z5.'],
    ['Grade Rate', 'The live price for a specific grade and class.'],
    ['Instrument', 'A tradable Grade/Class pair.'],
    ['Dark Pool', 'A market-making service for large size, off the lit book.'],
];

const ORDER_TYPES = [
    { icon: 'zap', name: 'Market', body: 'Execute immediately at the prevailing Grade Rate.' },
    { icon: 'sliders', name: 'Limit', body: 'Execute only if cost is within a threshold you set.' },
    { icon: 'search', name: 'Quote', body: 'Return an estimated price without invoking the model.' },
];

const CATEGORIES = [
    { c: 'Language', weights: 'Accuracy 35 · Quality 30 · Speed 15 · Cost 10 · Robustness 10' },
    { c: 'Vision', weights: 'Accuracy 40 · Quality 25 · Speed 15 · Cost 10 · Scale 10' },
    { c: 'Reasoning', weights: 'Accuracy 40 · Quality 25 · Speed 15 · Cost 10 · Flex 10' },
    { c: 'Generation', weights: 'Quality 35 · Accuracy 25 · Speed 15 · Cost 10 · Diversity 15' },
    { c: 'Control', weights: 'Accuracy 35 · Speed 25 · Reliability 20 · Cost 10 · Scale 10' },
];

export default function Markets() {
    return (
        <MarketingLayout>
            <Head title="Markets — Open Exchange" />

            <section className="ox-dark" style={{ position: 'relative', background: 'var(--ox-ink-900)', color: '#eef3f2', overflow: 'hidden' }}>
                <div className="ox-dot-grid ox-dot-grid--fade" style={{ position: 'absolute', inset: 0, ['--ox-dot-focus' as string]: '30% 40%' }} />
                <div className="ox-container-wide" style={{ position: 'relative', paddingBlock: 'clamp(48px, 9vw, 76px)' }}>
                    <div style={{ maxWidth: 680 }}>
                        <Badge tone="brand">Markets</Badge>
                        <h1 style={{ margin: '18px 0 0', fontWeight: 800, fontSize: 'clamp(2.2rem, 4.6vw, 3.4rem)', lineHeight: 1.07, letterSpacing: '-0.03em' }}>
                            AI capacity, graded and traded
                        </h1>
                        <p style={{ margin: '18px 0 0', fontSize: 'var(--ox-text-md)', lineHeight: 1.6, color: 'rgba(238,243,242,0.74)', maxWidth: 620 }}>
                            Every request class is standardised into an Instrument with a Grade and a live Grade Rate.
                            Deal in Lots of 1M tokens, clear in real time, and hedge with futures.
                        </p>
                        <div style={{ display: 'flex', gap: 10, marginTop: 22, flexWrap: 'wrap' }}>
                            <Button as={Link} href="/register" trailingIcon={<Icon name="arrow-right" size={15} color="var(--ox-on-primary)" />}>Open an account</Button>
                            <Button as={Link} href="/whitepaper" variant="secondary">Grading methodology</Button>
                        </div>
                    </div>
                </div>
                <RateTicker tone="dark" />
            </section>

            <Section tone="ink-deep">
                <SectionHeading tone="dark" eyebrow="Live board" title="Grade Rates" subtitle="Indicative rates across classes and grades. Green is a 24h uptick; gold grades are premium V–Z generations." />
                <div style={{ marginTop: 28 }}><GradeRatesBoard tone="dark" /></div>
            </Section>

            {/* how we grade */}
            <Section tone="beige">
                <div className="oe-2col" style={{ display: 'grid', gridTemplateColumns: '0.85fr 1.15fr', gap: 44 }}>
                    <SectionHeading eyebrow="How we grade" title="A generation letter and a 1–10 score"
                        subtitle="Models are graded across ten quality categories on a 1–10 scale, prefixed by a capability generation from A to Z (V–Z are the frontier). The result is a compact instrument code like Z5 or AA10." />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                            {['V4', 'W5', 'X6', 'Y7', 'Z8', 'AA10'].map((g) => <GradeBadge key={g} grade={g} size="lg" />)}
                        </div>
                        <Card padding="lg">
                            <div className="ox-eyebrow" style={{ marginBottom: 12 }}>Objective weighting by class</div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                {CATEGORIES.map((c) => (
                                    <div key={c.c} style={{ display: 'flex', justifyContent: 'space-between', gap: 16, borderTop: '1px solid var(--ox-divider)', paddingTop: 10 }}>
                                        <span style={{ fontWeight: 700, fontSize: 14, minWidth: 96 }}>{c.c}</span>
                                        <span style={{ fontFamily: 'var(--ox-font-mono)', fontSize: 12, color: 'var(--ox-text-muted)', textAlign: 'right' }}>{c.weights}</span>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    </div>
                </div>
            </Section>

            {/* order types + glossary */}
            <Section tone="subtle">
                <div className="oe-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 44 }}>
                    <div>
                        <SectionHeading eyebrow="Order types" title="Market, Limit, Quote" subtitle="Exchange mechanics, applied to inference." />
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 28 }}>
                            {ORDER_TYPES.map((o) => (
                                <Card key={o.name} padding="md" style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                                    <span style={{ display: 'grid', placeItems: 'center', width: 42, height: 42, borderRadius: 11, background: 'var(--ox-primary-subtle)', flexShrink: 0 }}>
                                        <Icon name={o.icon} size={20} color="var(--ox-green-600)" />
                                    </span>
                                    <div>
                                        <div style={{ fontWeight: 700, fontSize: 16 }}>{o.name}</div>
                                        <p style={{ margin: '2px 0 0', color: 'var(--ox-text-muted)', fontSize: 13.5 }}>{o.body}</p>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </div>
                    <div>
                        <SectionHeading eyebrow="Glossary" title="The language of the exchange" subtitle="Key terms you'll see across the markets." />
                        <div style={{ marginTop: 28, display: 'flex', flexDirection: 'column' }}>
                            {TERMS.map(([t, d], i) => (
                                <div key={t} style={{ display: 'flex', gap: 16, padding: '14px 0', borderTop: i ? '1px solid var(--ox-border)' : 'none' }}>
                                    <span style={{ fontFamily: 'var(--ox-font-mono)', fontWeight: 700, fontSize: 14, minWidth: 96, color: 'var(--ox-green-700)' }}>{t}</span>
                                    <span style={{ color: 'var(--ox-text-muted)', fontSize: 14, lineHeight: 1.5 }}>{d}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </Section>

            <Section tone="ink" pad="xl">
                <div style={{ textAlign: 'center', maxWidth: 640, margin: '0 auto' }}>
                    <SectionHeading tone="dark" align="center" title="Trade the AI market" subtitle="Spot Deals today; futures, dark pools and crypto settlement via OpenExchange.ai." style={{ alignItems: 'center' }}
                        actions={
                            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                                <Button as={Link} href="/register" size="lg" trailingIcon={<Icon name="arrow-right" size={16} color="var(--ox-on-primary)" />}>Get started</Button>
                                <Button as={Link} href="/products/openexchange" size="lg" variant="secondary">Explore OpenExchange.ai</Button>
                            </div>
                        }
                    />
                </div>
            </Section>
        </MarketingLayout>
    );
}
