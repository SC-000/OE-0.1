import { Link } from '@inertiajs/react';
import { Logo, Badge } from '@/components/oe';
import { FOOTER } from '@/lib/site';

export function SiteFooter() {
    return (
        <footer style={{ position: 'relative', background: 'var(--ox-ink-900)', color: '#eef3f2', overflow: 'hidden' }}>
            <div className="ox-dot-grid ox-dot-grid--fade" style={{ position: 'absolute', inset: 0, opacity: 0.5, ['--ox-dot-focus' as string]: '80% 0%' }} />
            <div className="ox-container-wide" style={{ position: 'relative', paddingTop: 64, paddingBottom: 32 }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(220px, 1.4fr) repeat(4, minmax(120px, 1fr))', gap: 40, alignItems: 'flex-start' }} className="oe-footer-grid">
                    <div style={{ maxWidth: 280 }}>
                        <Logo size={28} tone="dark" />
                        <p style={{ marginTop: 16, color: 'rgba(238,243,242,0.62)', fontSize: 14, lineHeight: 1.6 }}>
                            The commoditised AI exchange. One request, the best model, one bill — with the enterprise layer and a real market on top.
                        </p>
                        <div style={{ marginTop: 16 }}>
                            <Badge tone="success">All systems operational</Badge>
                        </div>
                    </div>
                    {FOOTER.map((col) => (
                        <div key={col.title}>
                            <div style={{ fontFamily: 'var(--ox-font-mono)', fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--ox-green-400)', marginBottom: 14 }}>{col.title}</div>
                            <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
                                {col.links.map((l) => (
                                    <li key={l.label}>
                                        <Link href={l.href} className="ox-navlink" style={{ color: 'rgba(238,243,242,0.72)', textDecoration: 'none', fontSize: 13.5 }}>{l.label}</Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                <div style={{ marginTop: 48, paddingTop: 24, borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontFamily: 'var(--ox-font-mono)', fontSize: 12, color: 'rgba(238,243,242,0.5)' }}>
                        © {new Date().getFullYear()} Open Exchange · Backbone for AI development
                    </span>
                    <span style={{ display: 'flex', gap: 20, fontSize: 12.5 }}>
                        <Link href="/company#security" style={{ color: 'rgba(238,243,242,0.6)', textDecoration: 'none' }}>Security</Link>
                        <Link href="/whitepaper" style={{ color: 'rgba(238,243,242,0.6)', textDecoration: 'none' }}>White paper</Link>
                        <Link href="/company" style={{ color: 'rgba(238,243,242,0.6)', textDecoration: 'none' }}>Terms & privacy</Link>
                    </span>
                </div>
            </div>
        </footer>
    );
}
