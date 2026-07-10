import AppLayout from '@/layouts/app-layout';
import AuthLayout from '@/layouts/auth-layout';
import SettingsLayout from '@/layouts/settings/oe-settings-layout';

/**
 * Which persistent layout wraps a page. Shared by the browser entry (app.tsx) and the
 * SSR entry (ssr.tsx) — if these two ever disagree, hydration mismatches.
 *
 * Marketing, console and admin pages own their own chrome and opt out entirely.
 */
export function resolveLayout(name: string) {
    switch (true) {
        case name === 'welcome':
            return null;
        case name.startsWith('marketing/'):
            return null;
        case name.startsWith('console/'):
            return null;
        case name.startsWith('admin/'):
            return null;
        case name.startsWith('auth/'):
            return AuthLayout;
        case name.startsWith('settings/'):
            return SettingsLayout;
        default:
            return AppLayout;
    }
}
