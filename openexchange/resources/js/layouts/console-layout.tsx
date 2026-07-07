import { ReactNode } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { Icon, Logo } from '@/components/oe';

const NAV = [
    { id: 'overview', label: 'Overview', icon: 'activity', href: '/console' },
    { id: 'usage', label: 'Usage', icon: 'trending-up', href: '/console/usage' },
    { id: 'sources', label: 'Sources', icon: 'layers', href: '/console/sources' },
    { id: 'billing', label: 'Billing', icon: 'credit-card', href: '/console/billing' },
    { id: 'settings', label: 'Settings', icon: 'settings', href: '/settings/profile' },
];
const ADMIN = [{ id: 'admin', label: 'Clients & rates', icon: 'sliders', href: '/console/admin' }];

export default function ConsoleLayout({
    active, title, subtitle, actions, children, contentPadding = true,
}: {
    active: string; title: string; subtitle?: string; actions?: ReactNode; children: ReactNode; contentPadding?: boolean;
}) {
    const page = usePage().props as { auth?: { user?: { name?: string; email?: string; role?: string } } };
    const user = page.auth?.user;
    const isAdmin = user?.role === 'admin';
    const initials = (user?.name || 'Ada Reyes').split(' ').map((s) => s[0]).slice(0, 2).join('').toUpperCase();

    const navBtn = (n: { id: string; label: string; icon: string; href: string }) => {
        const on = n.id === active;
        return (
            <Link key={n.id} href={n.href} style={{
                display: 'flex', alignItems: 'center', gap: 11, padding: '9px 11px', borderRadius: 'var(--ox-radius-md)',
                textDecoration: 'none', background: on ? 'rgba(51,193,62,0.16)' : 'transparent',
                color: on ? 'var(--ox-green-400)' : 'rgba(255,255,255,0.72)', fontSize: 'var(--ox-text-sm)', fontWeight: on ? 600 : 500,
            }}>
                <Icon name={n.icon} size={17} color={on ? 'var(--ox-green-400)' : 'rgba(255,255,255,0.72)'} />{n.label}
            </Link>
        );
    };

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--ox-bg)' }}>
            <aside className="oe-console-sidebar" style={{
                width: 236, flexShrink: 0, background: 'var(--ox-ink-900)', color: '#fff',
                display: 'flex', flexDirection: 'column', padding: '18px 14px', gap: 22, position: 'sticky', top: 0, height: '100vh',
            }}>
                <Link href="/" style={{ padding: '4px 8px' }}><Logo size={26} /></Link>
                <nav style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>{NAV.map(navBtn)}</nav>
                {isAdmin && (
                    <div style={{ marginTop: 4 }}>
                        <div style={{ fontFamily: 'var(--ox-font-mono)', fontSize: 10, letterSpacing: '0.08em', color: 'rgba(255,255,255,0.4)', padding: '0 11px 8px' }}>ADMIN</div>
                        <nav style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>{ADMIN.map(navBtn)}</nav>
                    </div>
                )}

                <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <Link href="/console/billing" style={{ padding: 12, borderRadius: 'var(--ox-radius-md)', background: 'rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', gap: 6, textDecoration: 'none' }}>
                        <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)' }}>Billing account</span>
                        <span style={{ fontSize: 12.5, color: 'var(--ox-green-400)', fontWeight: 600 }}>Manage balance &amp; top-up →</span>
                    </Link>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '4px 6px' }}>
                        <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'var(--ox-green-600)', display: 'grid', placeItems: 'center', fontSize: 12, fontWeight: 700, color: '#06220b' }}>{initials}</div>
                        <div style={{ lineHeight: 1.2, minWidth: 0, flex: 1 }}>
                            <div style={{ fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name || 'Ada Reyes'}</div>
                            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)' }}>acme-inc</div>
                        </div>
                        <Link href="/logout" method="post" as="button" style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.5)', padding: 4 }} aria-label="Log out">
                            <Icon name="log-out" size={16} color="rgba(255,255,255,0.5)" />
                        </Link>
                    </div>
                </div>
            </aside>

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                <header style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16,
                    padding: '16px 28px', borderBottom: '1px solid var(--ox-border)', background: 'var(--ox-surface)', position: 'sticky', top: 0, zIndex: 20,
                }}>
                    <div>
                        <h1 style={{ margin: 0, fontSize: 'var(--ox-text-xl)', fontWeight: 700, letterSpacing: '-0.01em' }}>{title}</h1>
                        {subtitle && <p style={{ margin: '3px 0 0', fontSize: 'var(--ox-text-sm)', color: 'var(--ox-text-subtle)' }}>{subtitle}</p>}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div className="oe-desktop-nav" style={{ alignItems: 'center', gap: 8, padding: '0 12px', height: 38, borderRadius: 'var(--ox-radius-md)', border: '1px solid var(--ox-border)', background: 'var(--ox-bg-subtle)', width: 200 }}>
                            <Icon name="search" size={15} color="var(--ox-text-subtle)" />
                            <span style={{ fontSize: 'var(--ox-text-sm)', color: 'var(--ox-text-subtle)' }}>Search…</span>
                        </div>
                        {actions}
                    </div>
                </header>
                <div style={{ padding: contentPadding ? 28 : 0, flex: 1 }}>{children}</div>
            </div>
        </div>
    );
}
