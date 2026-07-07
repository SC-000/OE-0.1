import { ReactNode } from 'react';
import { Link, usePage } from '@inertiajs/react';
import ConsoleLayout from '@/layouts/console-layout';

const SUB = [
    { label: 'Profile', href: '/settings/profile' },
    { label: 'Security', href: '/settings/security' },
    { label: 'Appearance', href: '/settings/appearance' },
];

/** Account settings, rendered inside the Open Exchange console (no starter chrome). */
export default function OeSettingsLayout({ children }: { children: ReactNode }) {
    const url = usePage().url;

    return (
        <ConsoleLayout active="settings" title="Settings" subtitle="Manage your profile and account">
            <div style={{ display: 'flex', gap: 40, flexWrap: 'wrap', alignItems: 'flex-start' }}>
                <nav style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 180 }}>
                    {SUB.map((s) => {
                        const on = url.startsWith(s.href);
                        return (
                            <Link key={s.href} href={s.href} style={{
                                padding: '9px 12px', borderRadius: 9, textDecoration: 'none', fontSize: 14,
                                fontWeight: on ? 600 : 500, color: on ? 'var(--ox-text)' : 'var(--ox-text-muted)',
                                background: on ? 'var(--ox-bg-muted)' : 'transparent',
                            }}>{s.label}</Link>
                        );
                    })}
                </nav>
                <div style={{ flex: 1, minWidth: 0, maxWidth: 640, display: 'flex', flexDirection: 'column', gap: 40 }}>
                    {children}
                </div>
            </div>
        </ConsoleLayout>
    );
}
