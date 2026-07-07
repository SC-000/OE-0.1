import { useState } from 'react';
import { Link } from '@inertiajs/react';
import { Button, Icon, Logo } from '@/components/oe';
import { NAV, PRODUCTS } from '@/lib/site';

export function SiteNav() {
    const [products, setProducts] = useState(false);
    const [mobile, setMobile] = useState(false);

    return (
        <header
            style={{
                position: 'sticky', top: 0, zIndex: 50,
                background: 'rgba(18,32,35,0.86)', backdropFilter: 'saturate(140%) blur(10px)',
                borderBottom: '1px solid rgba(255,255,255,0.08)',
            }}
        >
            <div className="ox-container-wide" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>
                <Link href="/" style={{ textDecoration: 'none' }} onClick={() => setMobile(false)}>
                    <Logo size={26} tone="dark" />
                </Link>

                {/* desktop nav */}
                <nav className="oe-desktop-nav" style={{ alignItems: 'center', gap: 4 }}>
                    {NAV.map((item) =>
                        item.products ? (
                            <div key={item.label} style={{ position: 'relative' }} onMouseLeave={() => setProducts(false)}>
                                <button
                                    type="button"
                                    onMouseEnter={() => setProducts(true)}
                                    onClick={() => setProducts((v) => !v)}
                                    className="ox-navlink"
                                    style={navBtn}
                                >
                                    {item.label}
                                    <Icon name="chevron-down" size={15} color="currentColor" style={{ transform: products ? 'rotate(180deg)' : 'none', transition: 'transform 200ms' }} />
                                </button>
                                {products && (
                                    <div style={megaMenu}>
                                        {PRODUCTS.map((p) => (
                                            <Link key={p.slug} href={p.href} style={megaItem} onClick={() => setProducts(false)}>
                                                <span style={megaIcon}><Icon name={p.icon} size={18} color="var(--ox-green-400)" /></span>
                                                <span>
                                                    <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                        <span style={{ color: '#eef3f2', fontWeight: 700, fontSize: 14 }}>{p.name}</span>
                                                        <span style={megaTag}>{p.tag}</span>
                                                    </span>
                                                    <span style={{ display: 'block', color: 'rgba(238,243,242,0.6)', fontSize: 12.5, marginTop: 3, lineHeight: 1.4 }}>{p.blurb}</span>
                                                </span>
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <Link key={item.label} href={item.href!} className="ox-navlink" style={navLink}>
                                {item.label}
                            </Link>
                        )
                    )}
                </nav>

                <div className="oe-desktop-nav" style={{ alignItems: 'center', gap: 10 }}>
                    <Button as={Link} href="/login" variant="ghost" size="sm" style={{ color: '#eef3f2' }}>Log in</Button>
                    <Button as={Link} href="/register" size="sm" trailingIcon={<Icon name="arrow-right" size={15} color="var(--ox-on-primary)" />}>Get started</Button>
                </div>

                {/* mobile toggle */}
                <button type="button" className="oe-mobile-toggle" onClick={() => setMobile((v) => !v)} aria-label="Menu" style={{ background: 'transparent', border: 'none', color: '#eef3f2', cursor: 'pointer', padding: 8 }}>
                    <Icon name={mobile ? 'x' : 'sliders'} size={22} color="#eef3f2" />
                </button>
            </div>

            {/* mobile menu */}
            {mobile && (
                <div className="oe-mobile-menu" style={{ borderTop: '1px solid rgba(255,255,255,0.08)', padding: '12px 20px 20px', flexDirection: 'column', gap: 4 }}>
                    <span style={{ ...mobileHeading }}>Products</span>
                    {PRODUCTS.map((p) => (
                        <Link key={p.slug} href={p.href} style={mobileLink} onClick={() => setMobile(false)}>{p.name}</Link>
                    ))}
                    <span style={{ ...mobileHeading, marginTop: 10 }}>Platform</span>
                    {NAV.filter((n) => n.href).map((n) => (
                        <Link key={n.label} href={n.href!} style={mobileLink} onClick={() => setMobile(false)}>{n.label}</Link>
                    ))}
                    <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
                        <Button as={Link} href="/login" variant="secondary" size="md" fullWidth>Log in</Button>
                        <Button as={Link} href="/register" size="md" fullWidth>Get started</Button>
                    </div>
                </div>
            )}
        </header>
    );
}

const navLink: React.CSSProperties = {
    display: 'inline-flex', alignItems: 'center', padding: '8px 12px', color: 'rgba(238,243,242,0.82)',
    fontFamily: 'var(--ox-font-sans)', fontSize: 14, fontWeight: 500, textDecoration: 'none', borderRadius: 8,
};
const navBtn: React.CSSProperties = { ...navLink, gap: 4, background: 'transparent', border: 'none', cursor: 'pointer' };
const megaMenu: React.CSSProperties = {
    position: 'absolute', top: 'calc(100% + 8px)', left: '50%', transform: 'translateX(-50%)', width: 620,
    display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4, padding: 10, borderRadius: 16,
    background: '#152528', border: '1px solid rgba(255,255,255,0.1)', boxShadow: 'var(--ox-shadow-xl)',
};
const megaItem: React.CSSProperties = { display: 'flex', gap: 12, padding: 12, borderRadius: 11, textDecoration: 'none', transition: 'background 150ms' };
const megaIcon: React.CSSProperties = { display: 'grid', placeItems: 'center', width: 36, height: 36, borderRadius: 9, background: 'rgba(51,193,62,0.12)', flexShrink: 0, alignSelf: 'flex-start' };
const megaTag: React.CSSProperties = { fontFamily: 'var(--ox-font-mono)', fontSize: 10, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--ox-green-400)', background: 'rgba(51,193,62,0.12)', padding: '1px 6px', borderRadius: 5 };
const mobileHeading: React.CSSProperties = { fontFamily: 'var(--ox-font-mono)', fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--ox-green-400)', padding: '6px 0' };
const mobileLink: React.CSSProperties = { color: '#eef3f2', textDecoration: 'none', fontSize: 15, padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' };
