import { Link, usePage } from '@inertiajs/react';
import type { ReactNode } from 'react';
import ImpersonationBanner from '@/components/impersonation-banner';
import type { Impersonation } from '@/components/impersonation-banner';
import { Icon, Logo } from '@/components/oe';
import PortalShell from '@/layouts/portal-shell';
import type { PortalNavItem } from '@/layouts/portal-shell';

/**
 * The CLIENT console. Nothing admin lives here — platform operators get their own
 * shell at /admin. An admin only sees this chrome while impersonating, in which
 * case the banner makes whose account they're in unmistakable.
 *
 * PortalShell supplies only the chrome (drawer, header). This NAV is passed in
 * and is the console's alone; admin passes its own. The two are never merged.
 */
const NAV: PortalNavItem[] = [
    { id: 'overview', label: 'Overview', icon: 'activity', href: '/console' },
    {
        id: 'usage',
        label: 'Usage',
        icon: 'trending-up',
        href: '/console/usage',
    },
    {
        id: 'sources',
        label: 'Sources',
        icon: 'layers',
        href: '/console/sources',
    },
    {
        id: 'billing',
        label: 'Billing',
        icon: 'credit-card',
        href: '/console/billing',
    },
    {
        id: 'settings',
        label: 'Settings',
        icon: 'settings',
        href: '/settings/profile',
    },
];

export default function ConsoleLayout({
    active,
    title,
    subtitle,
    actions,
    children,
    contentPadding = true,
}: {
    active: string;
    title: string;
    subtitle?: string;
    actions?: ReactNode;
    children: ReactNode;
    contentPadding?: boolean;
}) {
    const page = usePage().props as unknown as {
        auth?: { user?: { name?: string; email?: string; role?: string } };
        impersonation?: Impersonation;
    };
    const user = page.auth?.user;
    const viewingAs = page.impersonation;
    const accountName = viewingAs?.client.name;
    const initials = (user?.name || 'Ada Reyes')
        .split(' ')
        .map((s) => s[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();

    const sidebarFooter = (
        <>
            <Link
                href="/console/billing"
                style={{
                    padding: 12,
                    borderRadius: 'var(--ox-radius-md)',
                    background: 'rgba(255,255,255,0.05)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 6,
                    textDecoration: 'none',
                }}
            >
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)' }}>
                    Billing account
                </span>
                <span
                    style={{
                        fontSize: 12.5,
                        color: 'var(--ox-green-400)',
                        fontWeight: 600,
                    }}
                >
                    Manage balance &amp; top-up →
                </span>
            </Link>
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
                        background: 'var(--ox-green-600)',
                        display: 'grid',
                        placeItems: 'center',
                        fontSize: 12,
                        fontWeight: 700,
                        color: '#06220b',
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
                        {user?.name || 'Ada Reyes'}
                    </div>
                    <div
                        style={{
                            fontSize: 10,
                            color: 'rgba(255,255,255,0.5)',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                        }}
                    >
                        {accountName ?? 'Your account'}
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
                        color: 'rgba(255,255,255,0.5)',
                        padding: 8,
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
        </>
    );

    const search = (
        <div
            className="oe-desktop-nav"
            style={{
                alignItems: 'center',
                gap: 8,
                padding: '0 12px',
                height: 38,
                borderRadius: 'var(--ox-radius-md)',
                border: '1px solid var(--ox-border)',
                background: 'var(--ox-bg-subtle)',
                width: 200,
            }}
        >
            <Icon name="search" size={15} color="var(--ox-text-subtle)" />
            <span
                style={{
                    fontSize: 'var(--ox-text-sm)',
                    color: 'var(--ox-text-subtle)',
                }}
            >
                Search…
            </span>
        </div>
    );

    return (
        <PortalShell
            nav={NAV}
            active={active}
            brand={<Logo size={26} />}
            brandHref="/"
            sidebarFooter={sidebarFooter}
            title={title}
            subtitle={subtitle}
            actions={actions}
            headerExtras={search}
            banner={<ImpersonationBanner />}
            contentPadding={contentPadding}
        >
            {children}
        </PortalShell>
    );
}
