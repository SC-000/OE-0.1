import React from 'react';
import { DotField } from './DotField.jsx';
import { Icon } from './Icon.jsx';

/**
 * The Open Exchange payment card face — ink gradient with the signature particle
 * swirl drifting behind it. One component so the billing summary and the add-card
 * preview always look like the same object.
 *
 * `number` renders a live-typed PAN (add-card preview); `last4` renders a saved,
 * masked card (billing). Passing neither shows the empty placeholder.
 */
export function PaymentCard({
    brand = 'OPEN EXCHANGE',
    number = '',
    last4 = '',
    exp = '',
    holder = '',
    compact = false,
    showHolder = true,
    style = {},
}) {
    // A live-typed number renders exactly as typed; a saved card is masked to its last 4.
    const pan = number || (last4 ? `•••• •••• •••• ${last4}` : '•••• •••• •••• ••••');

    return (
        <div
            style={{
                position: 'relative',
                borderRadius: compact ? 14 : 18,
                padding: compact ? 18 : 24,
                minHeight: compact ? 150 : 200,
                color: '#eef3f2',
                background: 'linear-gradient(135deg, var(--ox-ink-800), var(--ox-ink-950))',
                border: '1px solid rgba(255,255,255,0.1)',
                overflow: 'hidden',
                boxShadow: 'var(--ox-shadow-lg)',
                ...style,
            }}
        >
            {/* Decorative, aria-hidden inside DotField. Anchored off the right edge so the
                swirl reads as motion behind the card rather than a centred logo. */}
            <DotField
                strands={compact ? 14 : 22}
                density={compact ? 0.8 : 1}
                fit={compact ? 0.85 : 1}
                style={{ left: 'auto', right: '-30%', top: '-20%', width: '80%', height: '140%', opacity: 0.4 }}
            />

            <div
                style={{
                    position: 'relative',
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100%',
                    justifyContent: 'space-between',
                    minHeight: compact ? 110 : 152,
                    gap: compact ? 14 : 0,
                }}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Icon name="credit-card" size={compact ? 22 : 26} color="var(--ox-green-400)" />
                    <span style={{ fontWeight: 700, fontSize: compact ? 13 : 14, letterSpacing: '0.06em' }}>{brand}</span>
                </div>

                <div style={{ fontFamily: 'var(--ox-font-mono)', fontSize: compact ? 17 : 20, letterSpacing: compact ? '0.14em' : '0.12em' }}>
                    {pan}
                </div>

                <div
                    style={{
                        display: 'flex',
                        justifyContent: showHolder ? 'space-between' : 'flex-end',
                        fontSize: compact ? 12 : 12.5,
                        color: 'rgba(238,243,242,0.72)',
                    }}
                >
                    {showHolder && <span style={{ textTransform: 'uppercase' }}>{holder || 'Cardholder name'}</span>}
                    <span className="ox-mono">{exp || 'MM / YY'}</span>
                </div>
            </div>
        </div>
    );
}
