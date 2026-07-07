import { Head, Link } from '@inertiajs/react';
import MarketingLayout from '@/layouts/marketing-layout';
import { Section } from '@/components/marketing/Section';
import { Badge, Card, Icon } from '@/components/oe';
import { ARTICLES } from '@/lib/articles';

export default function Blog() {
    return (
        <MarketingLayout>
            <Head title="Research & blog — Open Exchange" />

            <section className="ox-dark" style={{ position: 'relative', background: 'var(--ox-ink-900)', color: '#eef3f2', overflow: 'hidden' }}>
                <div className="ox-dot-grid ox-dot-grid--fade" style={{ position: 'absolute', inset: 0, ['--ox-dot-focus' as string]: '50% 40%' }} />
                <div className="ox-container" style={{ position: 'relative', paddingBlock: '76px', textAlign: 'center' }}>
                    <Badge tone="brand">Research &amp; blog</Badge>
                    <h1 style={{ margin: '20px auto 0', maxWidth: 720, fontWeight: 800, fontSize: 'clamp(2.2rem, 4.6vw, 3.4rem)', lineHeight: 1.08, letterSpacing: '-0.03em' }}>
                        How the exchange thinks
                    </h1>
                    <p style={{ margin: '18px auto 0', maxWidth: 600, fontSize: 'var(--ox-text-md)', lineHeight: 1.6, color: 'rgba(238,243,242,0.74)' }}>
                        Notes on routing, grading and the economics of commoditised intelligence — our record, and free marketing.
                    </p>
                </div>
            </section>

            <Section tone="beige">
                <div className="oe-grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 18 }}>
                    {ARTICLES.map((a) => (
                        <Link key={a.slug} href={`/blog/${a.slug}`} style={{ textDecoration: 'none' }}>
                            <Card interactive padding="lg" style={{ display: 'flex', flexDirection: 'column', gap: 12, height: '100%' }}>
                                <Badge tone="neutral" dot={false}>{a.tag}</Badge>
                                <div style={{ fontWeight: 800, fontSize: 18, lineHeight: 1.25, color: 'var(--ox-text)' }}>{a.title}</div>
                                <p style={{ margin: 0, color: 'var(--ox-text-muted)', fontSize: 14, lineHeight: 1.55, flex: 1 }}>{a.excerpt}</p>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 }}>
                                    <span style={{ fontFamily: 'var(--ox-font-mono)', fontSize: 12, color: 'var(--ox-text-subtle)' }}>{a.date} · {a.read}</span>
                                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--ox-green-700)', fontWeight: 600, fontSize: 13.5 }}>Read <Icon name="arrow-right" size={15} color="var(--ox-green-700)" /></span>
                                </div>
                            </Card>
                        </Link>
                    ))}
                </div>
            </Section>
        </MarketingLayout>
    );
}
