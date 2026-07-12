import { Link, usePage } from '@inertiajs/react';
import type { ReactNode } from 'react';
import FlashToast from '@/components/flash-toast';
import { Icon, Logo } from '@/components/oe';
import PortalShell from '@/layouts/portal-shell';
import type { PortalNavItem } from '@/layouts/portal-shell';

/**
 * The platform-operator shell. It shares the drawer chrome with the console but
 * nothing else: an admin is never "a client with extra tabs", and the two navs
 * must never merge. PortalShell has no nav of its own — this NAV is passed in
 * and stays admin-only.
 */
const NAV: PortalNavItem[] = [
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

    const adminBadge = (
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
            <Icon name="shield" size={12} color="var(--ox-gold-500)" /> PLATFORM
            ADMIN
        </div>
    );

    const sidebarFooter = (
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
                    flexShrink: 0,
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
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)' }}>
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
                    padding: 8,
                }}
                aria-label="Log out"
            >
                <Icon name="log-out" size={16} color="rgba(255,255,255,0.5)" />
            </Link>
        </div>
    );

    return (
        <>
            <PortalShell
                nav={NAV}
                active={active}
                brand={<Logo size={26} />}
                brandHref="/admin"
                sidebarTop={adminBadge}
                sidebarFooter={sidebarFooter}
                title={title}
                subtitle={subtitle}
                actions={actions}
            >
                {children}
            </PortalShell>
            <FlashToast />
        </>
    );
}
