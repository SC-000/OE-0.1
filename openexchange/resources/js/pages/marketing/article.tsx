import { Head, Link } from '@inertiajs/react';
import MarketingLayout from '@/layouts/marketing-layout';
import { Section } from '@/components/marketing/Section';
import { Badge, Button, Icon } from '@/components/oe';
import { articleBySlug } from '@/lib/articles';

export default function Article({ slug }: { slug?: string }) {
    const a = articleBySlug(slug ?? '');

    if (!a) {
        return (
            <MarketingLayout>
                <Head title="Not found — Open Exchange" />
                <Section tone="beige" pad="xl">
                    <div style={{ textAlign: 'center', color: 'var(--ox-text-muted)' }}>
                        <p>That article couldn’t be found.</p>
                        <Button as={Link} href="/blog" variant="secondary">Back to the blog</Button>
                    </div>
                </Section>
            </MarketingLayout>
        );
    }

    return (
        <MarketingLayout>
            <Head title={`${a.title} — Open Exchange`} />

            <section className="ox-dark" style={{ position: 'relative', background: 'var(--ox-ink-900)', color: '#eef3f2', overflow: 'hidden' }}>
                <div className="ox-dot-grid ox-dot-grid--fade" style={{ position: 'absolute', inset: 0, ['--ox-dot-focus' as string]: '50% 30%' }} />
                <div className="ox-container" style={{ position: 'relative', paddingBlock: 'clamp(44px, 9vw, 72px)', maxWidth: 800 }}>
                    <Link href="/blog" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'rgba(238,243,242,0.6)', textDecoration: 'none', fontSize: 13.5, marginBottom: 18 }}>
                        <Icon name="chevron-right" size={15} color="rgba(238,243,242,0.6)" style={{ transform: 'rotate(180deg)' }} />Research &amp; blog
                    </Link>
                    <div><Badge tone="brand">{a.tag}</Badge></div>
                    <h1 style={{ margin: '16px 0 0', maxWidth: 720, fontWeight: 800, fontSize: 'clamp(2rem, 4.2vw, 3rem)', lineHeight: 1.1, letterSpacing: '-0.02em' }}>{a.title}</h1>
                    <div style={{ marginTop: 16, fontFamily: 'var(--ox-font-mono)', fontSize: 12.5, color: 'rgba(238,243,242,0.5)' }}>{a.date} · {a.read} read</div>
                </div>
            </section>

            <Section tone="beige">
                <article style={{ maxWidth: 720, margin: '0 auto' }}>
                    {a.sections.map((s, i) => (
                        <div key={i} style={{ marginBottom: 32 }}>
                            {s.h && <h2 style={{ margin: '0 0 14px', fontWeight: 800, fontSize: 'var(--ox-text-xl)', letterSpacing: '-0.02em', color: 'var(--ox-text)' }}>{s.h}</h2>}
                            {s.p.map((p, j) => <p key={j} style={{ margin: '0 0 16px', color: 'var(--ox-text-muted)', fontSize: 16, lineHeight: 1.75 }}>{p}</p>)}
                        </div>
                    ))}
                    <div style={{ display: 'flex', gap: 12, marginTop: 8, paddingTop: 24, borderTop: '1px solid var(--ox-border)', flexWrap: 'wrap' }}>
                        <Button as={Link} href="/register" trailingIcon={<Icon name="arrow-right" size={15} color="var(--ox-on-primary)" />}>Create an account</Button>
                        <Button as={Link} href="/whitepaper" variant="secondary">Read the white paper</Button>
                        <Button as={Link} href="/blog" variant="ghost">More articles</Button>
                    </div>
                </article>
            </Section>
        </MarketingLayout>
    );
}
