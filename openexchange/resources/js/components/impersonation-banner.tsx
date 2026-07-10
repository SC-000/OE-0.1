import { router, usePage } from '@inertiajs/react';
import { Icon } from '@/components/oe';

export type Impersonation = { client: { id: number; name: string }; admin: string | null } | null;

/**
 * Always-visible reminder that the data on screen belongs to someone else.
 * Sticky and loud on purpose — an admin must never mistake a client's console
 * for their own, and must always have a one-click exit.
 */
export default function ImpersonationBanner() {
    const { impersonation } = usePage().props as unknown as { impersonation: Impersonation };
    if (!impersonation) return null;

    return (
        <div
            role="status"
            style={{
                display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap',
                padding: '10px 20px', background: 'var(--ox-gold-500)', color: '#241a04',
                fontSize: 'var(--ox-text-sm)', fontWeight: 600, position: 'sticky', top: 0, zIndex: 60,
            }}
        >
            <Icon name="eye" size={16} color="#241a04" />
            <span>
                Viewing as <strong>{impersonation.client.name}</strong>
                {impersonation.admin && <span style={{ fontWeight: 500, opacity: 0.8 }}> · signed in as {impersonation.admin}</span>}
            </span>
            <span style={{ fontWeight: 500, opacity: 0.75, fontSize: 'var(--ox-text-xs)' }}>
                Billing and security actions are blocked.
            </span>
            <button
                onClick={() => router.post('/impersonate/stop')}
                style={{
                    marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: 6, cursor: 'pointer',
                    background: '#241a04', color: 'var(--ox-gold-500)', border: 'none',
                    padding: '6px 12px', borderRadius: 'var(--ox-radius-full)', fontSize: 'var(--ox-text-xs)', fontWeight: 700,
                }}
            >
                <Icon name="x" size={13} color="var(--ox-gold-500)" /> Stop impersonating
            </button>
        </div>
    );
}
