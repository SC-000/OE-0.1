import { ReactNode } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { Icon, Logo } from '@/components/oe';
import FlashToast from '@/components/flash-toast';

/**
 * The platform-operator shell. Deliberately shares nothing with console-layout:
 * an admin is never "a client with extra tabs", and the two navs must never merge.
 */
const NAV = [
    { id: 'dashboard', label: 'Overview', icon: 'activity', href: '/admin' },
    { id: 'clients', label: 'Clients', icon: 'users', href: '/admin/clients' },
    {
        id: 'models',
        label: 'Models & pricing',
        icon: 'tag',
        href: '/admin/models',
    },
    {
        id: 'platform',
        label: 'Platform',
        icon: 'database',
        href: '/admin/platform',
    },
    {
        id: 'audit',
        label: 'Audit log',
        icon: 'file-text',
        href: '/admin/audit',
    },
];

export default function AdminLayout({
    active,
    title,
    subtitle,
    actions,
    children,
}: {
    active: string;
    title: string;
    subtitle?: string;
    actions?: ReactNode;
    children: ReactNode;
}) {
    const page = usePage().props as {
        auth?: { user?: { name?: string; email?: string } };
    };
    const user = page.auth?.user;
    const initials = (user?.name || 'Admin')
        .split(' ')
        .map((s) => s[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();

    return (
        <div
            style={{
                display: 'flex',
                minHeight: '100vh',
                background: 'var(--ox-bg)',
            }}
        >
            <aside
                className="oe-console-sidebar"
                style={{
                    width: 236,
                    flexShrink: 0,
                    background: 'var(--ox-ink-900)',
                    color: '#fff',
                    display: 'flex',
                    flexDirection: 'column',
                    padding: '18px 14px',
                    gap: 20,
                    position: 'sticky',
                    top: 0,
                    height: '100vh',
                }}
            >
                <Link href="/admin" style={{ padding: '4px 8px' }}>
                    <Logo size={26} />
                </Link>

                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 7,
                        padding: '5px 10px',
                        borderRadius: 'var(--ox-radius-full)',
                        background: 'rgba(201,153,46,0.16)',
                        color: 'var(--ox-gold-500)',
                        alignSelf: 'flex-start',
                        fontFamily: 'var(--ox-font-mono)',
                        fontSize: 10,
                        letterSpacing: '0.09em',
                        fontWeight: 700,
                    }}
                >
                    <Icon name="shield" size={12} color="var(--ox-gold-500)" />{' '}
                    PLATFORM ADMIN
                </div>

                <nav
                    style={{ display: 'flex', flexDirection: 'column', gap: 2 }}
                >
                    {NAV.map((n) => {
                        const on = n.id === active;
                        return (
                            <Link
                                key={n.id}
                                href={n.href}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 11,
                                    padding: '9px 11px',
                                    borderRadius: 'var(--ox-radius-md)',
                                    textDecoration: 'none',
                                    background: on
                                        ? 'rgba(51,193,62,0.16)'
                                        : 'transparent',
                                    color: on
                                        ? 'var(--ox-green-400)'
                                        : 'rgba(255,255,255,0.72)',
                                    fontSize: 'var(--ox-text-sm)',
                                    fontWeight: on ? 600 : 500,
                                }}
                            >
                                <Icon
                                    name={n.icon}
                                    size={17}
                                    color={
                                        on
                                            ? 'var(--ox-green-400)'
                                            : 'rgba(255,255,255,0.72)'
                                    }
                                />
                                {n.label}
                            </Link>
                        );
                    })}
                </nav>

                <div
                    style={{
                        marginTop: 'auto',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 12,
                    }}
                >
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 10,
                            padding: '4px 6px',
                        }}
                    >
                        <div
                            style={{
                                width: 30,
                                height: 30,
                                borderRadius: '50%',
                                background: 'var(--ox-gold-500)',
                                display: 'grid',
                                placeItems: 'center',
                                fontSize: 12,
                                fontWeight: 700,
                                color: '#241a04',
                            }}
                        >
                            {initials}
                        </div>
                        <div style={{ lineHeight: 1.2, minWidth: 0, flex: 1 }}>
                            <div
                                style={{
                                    fontSize: 12,
                                    fontWeight: 600,
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                }}
                            >
                                {user?.name}
                            </div>
                            <div
                                style={{
                                    fontSize: 10,
                                    color: 'rgba(255,255,255,0.5)',
                                }}
                            >
                                Operator
                            </div>
                        </div>
                        <Link
                            href="/logout"
                            method="post"
                            as="button"
                            style={{
                                background: 'transparent',
                                border: 'none',
                                cursor: 'pointer',
                                padding: 4,
                            }}
                            aria-label="Log out"
                        >
                            <Icon
                                name="log-out"
                                size={16}
                                color="rgba(255,255,255,0.5)"
                            />
                        </Link>
                    </div>
                </div>
            </aside>

            <div
                style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    minWidth: 0,
                }}
            >
                <header
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 16,
                        padding: '16px 28px',
                        borderBottom: '1px solid var(--ox-border)',
                        background: 'var(--ox-surface)',
                        position: 'sticky',
                        top: 0,
                        zIndex: 20,
                    }}
                >
                    <div style={{ minWidth: 0 }}>
                        <h1
                            style={{
                                margin: 0,
                                fontSize: 'var(--ox-text-xl)',
                                fontWeight: 700,
                                letterSpacing: '-0.01em',
                            }}
                        >
                            {title}
                        </h1>
                        {subtitle && (
                            <p
                                style={{
                                    margin: '3px 0 0',
                                    fontSize: 'var(--ox-text-sm)',
                                    color: 'var(--ox-text-subtle)',
                                }}
                            >
                                {subtitle}
                            </p>
                        )}
                    </div>
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 10,
                            flexShrink: 0,
                        }}
                    >
                        {actions}
                    </div>
                </header>
                <div style={{ padding: 28, flex: 1 }}>{children}</div>
            </div>
            <FlashToast />
        </div>
    );
}
