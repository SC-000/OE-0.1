import { useEffect, useState } from 'react';
import { usePage } from '@inertiajs/react';
import { Icon } from '@/components/oe';

export type Flash = { type: 'success' | 'info' | 'error'; message: string } | null;

const TONE = {
    success: { bg: 'var(--ox-success-surface)', fg: 'var(--ox-success)', border: 'var(--ox-success)', icon: 'check' },
    info: { bg: 'var(--ox-info-surface)', fg: 'var(--ox-info)', border: 'var(--ox-info)', icon: 'activity' },
    error: { bg: 'var(--ox-danger-surface)', fg: 'var(--ox-danger)', border: 'var(--ox-danger)', icon: 'alert-triangle' },
} as const;

/**
 * Confirms what an action actually did. Money-moving actions (pricing a model,
 * re-billing) report the amount, so the admin is never guessing whether it worked.
 * Errors stay until dismissed; successes auto-clear.
 */
export default function FlashToast() {
    const { flash } = usePage().props as unknown as { flash: Flash };
    const [shown, setShown] = useState<Flash>(null);

    useEffect(() => {
        if (!flash?.message) return;
        setShown(flash);
        if (flash.type === 'error') return;
        const t = setTimeout(() => setShown(null), 7000);
        return () => clearTimeout(t);
    }, [flash]);

    if (!shown) return null;
    const tone = TONE[shown.type] ?? TONE.info;

    return (
        <div
            role="status"
            style={{
                position: 'fixed', right: 20, bottom: 20, zIndex: 90, maxWidth: 460,
                display: 'flex', alignItems: 'flex-start', gap: 10, padding: '12px 14px',
                background: tone.bg, color: tone.fg, borderRadius: 'var(--ox-radius-md)',
                border: `1px solid ${tone.border}`, boxShadow: 'var(--ox-shadow-lg, 0 8px 24px rgba(0,0,0,0.14))',
                fontSize: 'var(--ox-text-sm)', lineHeight: 1.45,
            }}
        >
            <Icon name={tone.icon} size={16} color={tone.fg} style={{ flexShrink: 0, marginTop: 1 }} />
            <span style={{ fontWeight: 500 }}>{shown.message}</span>
            <button
                onClick={() => setShown(null)}
                aria-label="Dismiss"
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 0, marginLeft: 4, flexShrink: 0 }}
            >
                <Icon name="x" size={14} color={tone.fg} />
            </button>
        </div>
    );
}
