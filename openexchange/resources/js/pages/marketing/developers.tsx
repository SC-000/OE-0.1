import { Head, Link } from '@inertiajs/react';
import MarketingLayout from '@/layouts/marketing-layout';
import { Section } from '@/components/marketing/Section';
import { CodeBlock } from '@/components/marketing/CodeBlock';
import { Button, Icon, Badge, Card, ModelCatalogTable, SectionHeading } from '@/components/oe';

const ENDPOINTS = [
    ['POST', '/v1/chat', 'Route a chat completion (streaming or JSON).'],
    ['POST', '/v1/chat/rag', 'Chat grounded in your indexed documents.'],
    ['POST', '/v1/embeddings', 'Generate embeddings across providers.'],
    ['GET', '/v1/models', 'The routing catalogue with pricing & grades.'],
    ['GET', '/v1/workspaces/:id/policies', 'Read a workspace’s routing policies.'],
];

const FEATURES = [
    { icon: 'zap', title: 'Streaming (SSE)', body: 'Token-by-token streaming and JSON modes on the same endpoint.' },
    { icon: 'key', title: 'API-key auth', body: 'Keys are stored hashed like passwords — only the prefix is ever shown back.' },
    { icon: 'activity', title: 'Usage headers', body: 'Every response carries X-Model-Selected, X-Fallback-Used and token usage.' },
    { icon: 'globe', title: 'Embeddable widget', body: 'A drop-in chat bubble via CDN, npm or iFrame with a domain allowlist.' },
    { icon: 'database', title: 'RAG built in', body: 'Upload or scrape → chunk → embed → retrieve top-K with citations.' },
    { icon: 'shield', title: 'Error schema', body: 'Structured errors with remediation hints and per-key rate limits.' },
];

const STEPS = [
    ['Create a key', 'Generate a scoped key in the console. Copy it once — the secret is shown a single time.'],
    ['Send a request', 'POST to /v1/chat with an objective. The gateway routes and returns the answer.'],
    ['Read the headers', 'Inspect X-Model-Selected and usage; wire the decision log into your own dashboards.'],
];

export default function Developers() {
    return (
        <MarketingLayout>
            <Head title="Developers — Open Exchange" />

            <section className="ox-dark" style={{ position: 'relative', background: 'var(--ox-ink-900)', color: '#eef3f2', overflow: 'hidden' }}>
                <div className="ox-dot-grid ox-dot-grid--fade" style={{ position: 'absolute', inset: 0, ['--ox-dot-focus' as string]: '82% 40%' }} />
                <div className="ox-container-wide oe-hero-grid" style={{ position: 'relative', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 44, alignItems: 'center', paddingBlock: 'clamp(48px, 9vw, 76px)' }}>
                    <div style={{ maxWidth: 540 }}>
                        <Badge tone="brand">Developers</Badge>
                        <h1 style={{ margin: '18px 0 0', fontWeight: 800, fontSize: 'clamp(2.1rem, 4.4vw, 3.25rem)', lineHeight: 1.08, letterSpacing: '-0.03em' }}>
                            One API for every model
                        </h1>
                        <p style={{ margin: '18px 0 0', fontSize: 'var(--ox-text-md)', lineHeight: 1.6, color: 'rgba(238,243,242,0.74)' }}>
                            A single versioned <span className="ox-mono" style={{ color: 'var(--ox-green-400)' }}>/v1</span> REST surface with streaming, usage headers and best-execution routing. If you can call OpenAI, you can call Open Exchange.
                        </p>
                        <div style={{ display: 'flex', gap: 10, marginTop: 22, flexWrap: 'wrap' }}>
                            <Button as={Link} href="/register" trailingIcon={<Icon name="arrow-right" size={15} color="var(--ox-on-primary)" />}>Get an API key</Button>
                            <Button as={Link} href="#api" variant="secondary">API reference</Button>
                        </div>
                    </div>
                    <CodeBlock filename="POST /v1/chat" lang="bash">{`curl https://api.openexchange.ai/v1/chat \\
  -H "Authorization: Bearer sk-oe-3b9f…a21e" \\
  -H "Content-Type: application/json" \\
  -d '{
    "objective": "auto",
    "messages": [
      { "role": "user", "content": "Explain best execution" }
    ],
    "stream": true
  }'

# ← response headers
X-Model-Selected: claude-sonnet-5
X-Fallback-Used:  false
X-Grade:          Z8
X-Usage-Tokens:   1855`}</CodeBlock>
                </div>
            </section>

            {/* endpoints */}
            <Section tone="beige" id="api">
                <SectionHeading eyebrow="API reference" title="Five endpoints, everything you need" subtitle="Versioned, rate-limited per key, with a consistent error schema." />
                <Card padding="none" style={{ marginTop: 32, overflow: 'hidden' }}>
                    {ENDPOINTS.map(([method, path, desc], i) => (
                        <div key={path} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px 20px', borderTop: i ? '1px solid var(--ox-border)' : 'none', flexWrap: 'wrap' }}>
                            <span style={{ fontFamily: 'var(--ox-font-mono)', fontSize: 11, fontWeight: 700, color: method === 'GET' ? 'var(--ox-info)' : 'var(--ox-green-700)', minWidth: 44 }}>{method}</span>
                            <span style={{ fontFamily: 'var(--ox-font-mono)', fontSize: 14, fontWeight: 600, minWidth: 240 }}>{path}</span>
                            <span style={{ color: 'var(--ox-text-muted)', fontSize: 14, flex: 1 }}>{desc}</span>
                        </div>
                    ))}
                </Card>
            </Section>

            {/* quickstart */}
            <Section tone="subtle">
                <SectionHeading eyebrow="Quickstart" title="Live in three steps" />
                <div className="oe-grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 18, marginTop: 36 }}>
                    {STEPS.map(([t, d], i) => (
                        <Card key={t} padding="lg" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            <span style={{ fontFamily: 'var(--ox-font-mono)', fontSize: 13, fontWeight: 700, color: 'var(--ox-green-700)', width: 30, height: 30, borderRadius: 8, background: 'var(--ox-primary-subtle)', display: 'grid', placeItems: 'center' }}>{i + 1}</span>
                            <div style={{ fontWeight: 700, fontSize: 16 }}>{t}</div>
                            <p style={{ margin: 0, color: 'var(--ox-text-muted)', fontSize: 14, lineHeight: 1.55 }}>{d}</p>
                        </Card>
                    ))}
                </div>
            </Section>

            {/* platform features */}
            <Section tone="beige">
                <SectionHeading eyebrow="Platform" title="Batteries included" />
                <div className="oe-grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 18, marginTop: 36 }}>
                    {FEATURES.map((f) => (
                        <Card key={f.title} padding="lg" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            <Icon name={f.icon} size={22} color="var(--ox-green-600)" />
                            <div style={{ fontWeight: 700, fontSize: 16 }}>{f.title}</div>
                            <p style={{ margin: 0, color: 'var(--ox-text-muted)', fontSize: 14, lineHeight: 1.5 }}>{f.body}</p>
                        </Card>
                    ))}
                </div>
            </Section>

            <Section tone="ink">
                <SectionHeading tone="dark" eyebrow="Catalogue" title="Every model, one schema" subtitle="GET /v1/models returns the live routing catalogue with pricing and instrument grades." />
                <div style={{ marginTop: 28 }}><ModelCatalogTable tone="dark" /></div>
            </Section>

            <Section tone="ink-deep" pad="xl">
                <div style={{ textAlign: 'center', maxWidth: 620, margin: '0 auto' }}>
                    <SectionHeading tone="dark" align="center" title="Ship your first route today" style={{ alignItems: 'center' }}
                        actions={<Button as={Link} href="/register" size="lg" trailingIcon={<Icon name="arrow-right" size={16} color="var(--ox-on-primary)" />}>Get an API key</Button>} />
                </div>
            </Section>
        </MarketingLayout>
    );
}
