import { Link, router } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { Icon } from '@/components/oe';

export type PortalNavItem = {
    id: string;
    label: string;
    icon: string;
    href: string;
};

/**
 * Drawer mechanics for the two portal shells. It carries no nav of its own —
 * `nav` is required and has no default, so console and admin keep supplying
 * their own and there is still no seam through which one could inherit the
 * other's tabs.
 *
 * Everything responsive (the sidebar's position/width/transform, the burger,
 * the backdrop) is owned by `.oe-portal-*` in oe.css. Do not restate those
 * properties inline here: an inline value outranks the media query and the
 * drawer would stay a 236px column on a phone.
 */
export default function PortalShell({
    nav,
    active,
    brand,
    brandHref,
    sidebarTop,
    sidebarFooter,
    title,
    subtitle,
    actions,
    headerExtras,
    banner,
    children,
    contentPadding = true,
}: {
    nav: PortalNavItem[];
    active: string;
    brand: ReactNode;
    brandHref: string;
    sidebarTop?: ReactNode;
    sidebarFooter: ReactNode;
    title: string;
    subtitle?: string;
    actions?: ReactNode;
    headerExtras?: ReactNode;
    banner?: ReactNode;
    children: ReactNode;
    contentPadding?: boolean;
}) {
    const [open, setOpen] = useState(false);
    const drawerRef = useRef<HTMLElement>(null);
    const burgerRef = useRef<HTMLButtonElement>(null);

    // A tap on a nav row should feel like it navigated, not like it opened a
    // drawer that stayed open. Inertia swaps the page without unmounting the
    // layout, so nothing else would close it.
    useEffect(() => router.on('navigate', () => setOpen(false)), []);

    useEffect(() => {
        if (!open) {
            return;
        }

        // Captured now, not read in the cleanup: by teardown the ref may point
        // somewhere else entirely.
        const burger = burgerRef.current;

        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setOpen(false);
            }
        };

        document.addEventListener('keydown', onKey);
        document.body.classList.add('oe-portal-locked');
        drawerRef.current?.focus();

        return () => {
            document.removeEventListener('keydown', onKey);
            document.body.classList.remove('oe-portal-locked');
            // Send focus back where it came from, or a keyboard user lands at
            // the top of the document every time they dismiss the drawer.
            burger?.focus();
        };
    }, [open]);

    const navLink = (n: PortalNavItem) => {
        const on = n.id === active;

        return (
            <Link
                key={n.id}
                href={n.href}
                className="oe-portal-navlink"
                aria-current={on ? 'page' : undefined}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 11,
                    padding: '9px 11px',
                    borderRadius: 'var(--ox-radius-md)',
                    textDecoration: 'none',
                    background: on ? 'rgba(51,193,62,0.16)' : 'transparent',
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
                        on ? 'var(--ox-green-400)' : 'rgba(255,255,255,0.72)'
                    }
                />
                {n.label}
            </Link>
        );
    };

    return (
        <div className="oe-portal">
            <div
                className="oe-portal-backdrop"
                data-open={open}
                onClick={() => setOpen(false)}
                aria-hidden="true"
            />

            {/* Closed-on-mobile is `visibility:hidden` in CSS, not just an
                offscreen transform — that keeps the nav out of the tab order
                and the accessibility tree without a JS breakpoint check, which
                would hydrate differently than it rendered on the server. */}
            <aside
                ref={drawerRef}
                className="oe-portal-sidebar"
                data-open={open}
                tabIndex={-1}
            >
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 8,
                    }}
                >
                    <Link href={brandHref} style={{ padding: '4px 8px' }}>
                        {brand}
                    </Link>
                    <button
                        type="button"
                        className="oe-portal-sidebar-close"
                        onClick={() => setOpen(false)}
                        aria-label="Close navigation"
                    >
                        <Icon
                            name="x"
                            size={18}
                            color="rgba(255,255,255,0.7)"
                        />
                    </button>
                </div>

                {sidebarTop}

                <nav
                    aria-label="Portal"
                    style={{ display: 'flex', flexDirection: 'column', gap: 2 }}
                >
                    {nav.map(navLink)}
                </nav>

                <div
                    style={{
                        marginTop: 'auto',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 12,
                    }}
                >
                    {sidebarFooter}
                </div>
            </aside>

            <div className="oe-portal-main">
                {/* Banner and header pin as one unit. Two independently-sticky
                    `top: 0` elements would slide over each other, and the
                    banner (being later in paint order) would swallow the nav
                    button on mobile. */}
                <div className="oe-portal-topstack">
                    {banner}
                    <header className="oe-portal-header">
                        <button
                            ref={burgerRef}
                            type="button"
                            className="oe-portal-burger"
                            onClick={() => setOpen(true)}
                            aria-label="Open navigation"
                            aria-expanded={open}
                        >
                            <Icon
                                name="menu"
                                size={20}
                                color="var(--ox-text)"
                            />
                        </button>

                        <div className="oe-portal-heading">
                            <h1
                                style={{
                                    margin: 0,
                                    fontSize: 'var(--ox-text-xl)',
                                    fontWeight: 700,
                                    letterSpacing: '-0.01em',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
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

                        <div className="oe-portal-actions">
                            {headerExtras}
                            {actions}
                        </div>
                    </header>
                </div>

                <div
                    className={
                        contentPadding
                            ? 'oe-portal-content'
                            : 'oe-portal-content oe-portal-content--flush'
                    }
                >
                    {children}
                </div>
            </div>
        </div>
    );
}
