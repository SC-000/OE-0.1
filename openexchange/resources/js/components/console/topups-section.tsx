import { useEffect, useState } from 'react';
import { Badge, Button, Icon, LogoMark } from '@/components/oe';

/**
 * Top-ups & receipts — the client-facing record of every prepaid top-up on the
 * account. Each row opens a clean, corporate receipt (Open Exchange Int, no VAT).
 * The company entity, VAT stance and support address live here so the receipt
 * reads the same everywhere it's rendered.
 */

const COMPANY = {
    legalName: 'Open Exchange Int',
    email: 'hello@openexchange.ai',
    site: 'openexchange.ai',
};

export type TopUp = {
    id: number;
    receipt_no: string;
    date: string;
    time: string;
    amount: string;
    amount_cents: number;
    status: string;
    trigger: string;
    method: string | null;
    reference: string | null;
};

export type Account = { name: string; email: string | null };

type StatusMeta = {
    tone: 'success' | 'warning' | 'danger' | 'neutral';
    label: string;
    receiptTitle: string;
};

const STATUS: Record<string, StatusMeta> = {
    succeeded: { tone: 'success', label: 'Paid', receiptTitle: 'Receipt' },
    pending: {
        tone: 'warning',
        label: 'Pending',
        receiptTitle: 'Pending receipt',
    },
    failed: { tone: 'danger', label: 'Failed', receiptTitle: 'Top-up' },
};

const statusOf = (s: string): StatusMeta =>
    STATUS[s] ?? { tone: 'neutral', label: s, receiptTitle: 'Top-up' };

const TRIGGER: Record<string, string> = {
    auto: 'Automatic top-up',
    manual: 'Manual top-up',
    initial: 'Initial funding',
};

const triggerLabel = (t: string): string =>
    TRIGGER[t] ?? 'Prepaid balance top-up';

const triggerShort: Record<string, string> = {
    auto: 'Automatic',
    manual: 'Manual',
    initial: 'Initial',
};

/**
 * A thin, light receipt ledger meant to sit UNDER the saved card, inside the
 * Payment-method card container. Only settled (paid) top-ups are listed — each
 * a hairline row that opens the full receipt. No outer card of its own.
 */
export function TopUpsList({
    topups = [],
    account,
}: {
    topups?: TopUp[];
    account: Account;
}) {
    const [selected, setSelected] = useState<TopUp | null>(null);
    const paid = topups.filter((t) => t.status === 'succeeded');

    if (paid.length === 0) {
        return null;
    }

    return (
        <div
            style={{
                marginTop: 4,
                paddingTop: 14,
                borderTop: '1px solid var(--ox-divider)',
            }}
        >
            <style>{`.oe-topup-row{transition:background-color 120ms var(--ox-ease);}
                .oe-topup-row:hover{background:var(--ox-bg-subtle);}
                .oe-topup-row:hover .oe-topup-chev{color:var(--ox-text-muted);}`}</style>

            <div
                style={{
                    display: 'flex',
                    alignItems: 'baseline',
                    justifyContent: 'space-between',
                    marginBottom: 6,
                }}
            >
                <span
                    style={{
                        fontSize: 11,
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        letterSpacing: '0.08em',
                        color: 'var(--ox-text-subtle)',
                    }}
                >
                    Top-ups
                </span>
                <span style={{ fontSize: 11, color: 'var(--ox-text-subtle)' }}>
                    Tap for a receipt
                </span>
            </div>

            <div
                style={{ maxHeight: 232, overflowY: 'auto', margin: '0 -6px' }}
            >
                {paid.map((t, i) => (
                    <button
                        key={t.id}
                        onClick={() => setSelected(t)}
                        className="oe-topup-row"
                        style={{
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: 12,
                            padding: '8px 6px',
                            background: 'transparent',
                            border: 'none',
                            borderTop:
                                i === 0
                                    ? 'none'
                                    : '1px solid var(--ox-divider)',
                            borderRadius: 6,
                            cursor: 'pointer',
                            textAlign: 'left',
                        }}
                    >
                        <span
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 1,
                            }}
                        >
                            <span
                                style={{
                                    fontSize: 12.5,
                                    color: 'var(--ox-text)',
                                    fontWeight: 500,
                                }}
                            >
                                {t.date}
                            </span>
                            <span
                                style={{
                                    fontSize: 10.5,
                                    color: 'var(--ox-text-subtle)',
                                }}
                            >
                                {triggerShort[t.trigger] ?? 'Top-up'} ·{' '}
                                {t.receipt_no}
                            </span>
                        </span>
                        <span
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 8,
                                flexShrink: 0,
                            }}
                        >
                            <span
                                style={{
                                    fontFamily: 'var(--ox-font-mono)',
                                    fontSize: 13,
                                    color: 'var(--ox-text)',
                                }}
                            >
                                {t.amount}
                            </span>
                            <span
                                className="oe-topup-chev"
                                style={{
                                    color: 'var(--ox-text-subtle)',
                                    display: 'flex',
                                }}
                            >
                                <Icon name="chevron-right" size={13} />
                            </span>
                        </span>
                    </button>
                ))}
            </div>

            {selected && (
                <Receipt
                    topup={selected}
                    account={account}
                    onClose={() => setSelected(null)}
                />
            )}
        </div>
    );
}

const cap: React.CSSProperties = {
    fontSize: 10.5,
    textTransform: 'uppercase',
    letterSpacing: '0.09em',
    color: 'var(--ox-text-subtle)',
    fontWeight: 600,
};

function Field({ label, value }: { label: string; value: string }) {
    return (
        <div>
            <div style={cap}>{label}</div>
            <div
                style={{
                    fontSize: 13,
                    color: 'var(--ox-text)',
                    marginTop: 3,
                    fontWeight: 500,
                }}
            >
                {value}
            </div>
        </div>
    );
}

function Receipt({
    topup,
    account,
    onClose,
}: {
    topup: TopUp;
    account: Account;
    onClose: () => void;
}) {
    const st = statusOf(topup.status);

    // Close on Escape — a receipt is a read-only overlay, so the keyboard should
    // dismiss it the way every other dialog on the platform does.
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
        window.addEventListener('keydown', onKey);

        return () => window.removeEventListener('keydown', onKey);
    }, [onClose]);

    return (
        <div style={overlay} onClick={onClose}>
            {/* Print only the receipt itself, at full page, chrome stripped. */}
            <style>{`@media print {
                body * { visibility: hidden !important; }
                #oe-receipt, #oe-receipt * { visibility: visible !important; }
                #oe-receipt { position: absolute !important; top: 0 !important;
                    left: 0 !important; right: 0 !important; max-width: none !important;
                    max-height: none !important; overflow: visible !important;
                    box-shadow: none !important; border: none !important;
                    border-radius: 0 !important; }
                #oe-receipt-actions { display: none !important; }
            }`}</style>

            <div
                id="oe-receipt"
                style={receiptBox}
                onClick={(e) => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-label={`${st.receiptTitle} ${topup.receipt_no}`}
            >
                <div style={{ height: 4, background: 'var(--ox-green-500)' }} />

                <div style={{ padding: '26px 30px 30px' }}>
                    {/* Masthead */}
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'flex-start',
                            gap: 16,
                            flexWrap: 'wrap',
                        }}
                    >
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 10,
                            }}
                        >
                            <LogoMark size={30} />
                            <div>
                                <div
                                    style={{
                                        fontSize: 15,
                                        fontWeight: 700,
                                        letterSpacing: '-0.01em',
                                        color: 'var(--ox-text)',
                                    }}
                                >
                                    {COMPANY.legalName}
                                </div>
                                <div
                                    style={{
                                        fontSize: 11.5,
                                        color: 'var(--ox-text-subtle)',
                                    }}
                                >
                                    {COMPANY.site}
                                </div>
                            </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <div style={cap}>{st.receiptTitle}</div>
                            <div
                                style={{
                                    fontFamily: 'var(--ox-font-mono)',
                                    fontSize: 13,
                                    fontWeight: 600,
                                    color: 'var(--ox-text)',
                                    marginTop: 3,
                                }}
                            >
                                {topup.receipt_no}
                            </div>
                        </div>
                    </div>

                    {/* Amount hero */}
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'flex-end',
                            gap: 16,
                            flexWrap: 'wrap',
                            margin: '24px 0 22px',
                            paddingBottom: 22,
                            borderBottom: '1px solid var(--ox-divider)',
                        }}
                    >
                        <div>
                            <div style={cap}>
                                {topup.status === 'succeeded'
                                    ? 'Amount paid'
                                    : 'Amount'}
                            </div>
                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'baseline',
                                    gap: 7,
                                    marginTop: 4,
                                }}
                            >
                                <span
                                    style={{
                                        fontFamily: 'var(--ox-font-mono)',
                                        fontSize: 34,
                                        fontWeight: 600,
                                        letterSpacing: '-0.02em',
                                        color: 'var(--ox-text)',
                                        lineHeight: 1,
                                    }}
                                >
                                    {topup.amount}
                                </span>
                                <span
                                    style={{
                                        fontSize: 13,
                                        color: 'var(--ox-text-subtle)',
                                    }}
                                >
                                    GBP
                                </span>
                            </div>
                        </div>
                        <Badge tone={st.tone}>{st.label}</Badge>
                    </div>

                    {/* Parties + payment meta */}
                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns:
                                'repeat(auto-fit, minmax(150px, 1fr))',
                            gap: 18,
                            marginBottom: 22,
                        }}
                    >
                        <Field label="Billed to" value={account.name} />
                        {account.email && (
                            <Field
                                label="Account email"
                                value={account.email}
                            />
                        )}
                        <Field
                            label="Date"
                            value={`${topup.date} · ${topup.time}`}
                        />
                        {topup.method && (
                            <Field
                                label="Payment method"
                                value={topup.method}
                            />
                        )}
                        {topup.reference && (
                            <Field label="Reference" value={topup.reference} />
                        )}
                    </div>

                    {/* Line items */}
                    <table
                        style={{
                            width: '100%',
                            borderCollapse: 'collapse',
                            marginBottom: 4,
                        }}
                    >
                        <thead>
                            <tr>
                                <th
                                    style={{
                                        ...cap,
                                        textAlign: 'left',
                                        padding: '0 0 8px',
                                        borderBottom:
                                            '1px solid var(--ox-divider)',
                                    }}
                                >
                                    Description
                                </th>
                                <th
                                    style={{
                                        ...cap,
                                        textAlign: 'right',
                                        padding: '0 0 8px',
                                        borderBottom:
                                            '1px solid var(--ox-divider)',
                                    }}
                                >
                                    Amount
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td
                                    style={{
                                        padding: '12px 0',
                                        fontSize: 13,
                                        color: 'var(--ox-text)',
                                        borderBottom:
                                            '1px solid var(--ox-divider)',
                                    }}
                                >
                                    <div style={{ fontWeight: 600 }}>
                                        Prepaid balance top-up
                                    </div>
                                    <div
                                        style={{
                                            fontSize: 11.5,
                                            color: 'var(--ox-text-subtle)',
                                            marginTop: 2,
                                        }}
                                    >
                                        {triggerLabel(topup.trigger)} · credit
                                        applied to Open Exchange usage balance
                                    </div>
                                </td>
                                <td
                                    style={{
                                        padding: '12px 0',
                                        fontSize: 13,
                                        textAlign: 'right',
                                        fontFamily: 'var(--ox-font-mono)',
                                        color: 'var(--ox-text)',
                                        borderBottom:
                                            '1px solid var(--ox-divider)',
                                        verticalAlign: 'top',
                                    }}
                                >
                                    {topup.amount}
                                </td>
                            </tr>
                        </tbody>
                    </table>

                    {/* Totals */}
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'flex-end',
                            marginTop: 12,
                        }}
                    >
                        <div style={{ width: 'min(260px, 100%)' }}>
                            <Row label="Subtotal" value={topup.amount} />
                            <Row
                                label="VAT"
                                value="$0.00"
                                muted
                                note="Not applicable"
                            />
                            <div
                                style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'baseline',
                                    marginTop: 8,
                                    paddingTop: 10,
                                    borderTop:
                                        '1px solid var(--ox-border-strong)',
                                }}
                            >
                                <span
                                    style={{
                                        fontSize: 13,
                                        fontWeight: 700,
                                        color: 'var(--ox-text)',
                                    }}
                                >
                                    {topup.status === 'succeeded'
                                        ? 'Total paid'
                                        : 'Total'}
                                </span>
                                <span
                                    style={{
                                        fontFamily: 'var(--ox-font-mono)',
                                        fontSize: 15,
                                        fontWeight: 700,
                                        color: 'var(--ox-text)',
                                    }}
                                >
                                    {topup.amount}{' '}
                                    <span
                                        style={{
                                            fontSize: 11,
                                            fontWeight: 500,
                                            color: 'var(--ox-text-subtle)',
                                        }}
                                    >
                                        GBP
                                    </span>
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* VAT note */}
                    <div
                        style={{
                            display: 'flex',
                            gap: 9,
                            alignItems: 'flex-start',
                            marginTop: 22,
                            padding: '12px 14px',
                            borderRadius: 'var(--ox-radius-md)',
                            background: 'var(--ox-bg-subtle)',
                            border: '1px solid var(--ox-border)',
                        }}
                    >
                        <span style={{ flexShrink: 0, marginTop: 1 }}>
                            <Icon
                                name="shield"
                                size={14}
                                color="var(--ox-text-subtle)"
                            />
                        </span>
                        <p
                            style={{
                                margin: 0,
                                fontSize: 11.5,
                                lineHeight: 1.55,
                                color: 'var(--ox-text-muted)',
                            }}
                        >
                            <strong style={{ color: 'var(--ox-text)' }}>
                                No VAT has been charged.
                            </strong>{' '}
                            {COMPANY.legalName} is established in a country of
                            origin that does not require VAT registration, so no
                            value-added tax applies to this payment. If your
                            business requires a VAT invoice, let us know at{' '}
                            <span style={{ color: 'var(--ox-text)' }}>
                                {COMPANY.email}
                            </span>{' '}
                            and we'll arrange it.
                        </p>
                    </div>

                    {/* Small print */}
                    <div
                        style={{
                            marginTop: 18,
                            paddingTop: 16,
                            borderTop: '1px solid var(--ox-divider)',
                            fontSize: 10.5,
                            lineHeight: 1.6,
                            color: 'var(--ox-text-subtle)',
                        }}
                    >
                        <p style={{ margin: 0 }}>
                            This receipt confirms a payment received against
                            your prepaid {COMPANY.legalName} balance. Credit is
                            applied to your account immediately and is drawn
                            down as you use the service. Payments are processed
                            over an encrypted connection; we never store full
                            card numbers. Please retain this receipt for your
                            records.
                        </p>
                        <p style={{ margin: '8px 0 0' }}>
                            {COMPANY.legalName} · {COMPANY.email} ·{' '}
                            {COMPANY.site} — Questions about this charge?
                            Contact us within 30 days and we'll be glad to help.
                        </p>
                    </div>

                    {/* Actions — hidden when printing */}
                    <div
                        id="oe-receipt-actions"
                        style={{
                            display: 'flex',
                            justifyContent: 'flex-end',
                            gap: 10,
                            marginTop: 22,
                        }}
                    >
                        <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => window.print()}
                            leadingIcon={<Icon name="file-text" size={14} />}
                        >
                            Print / Save PDF
                        </Button>
                        <Button size="sm" onClick={onClose}>
                            Done
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function Row({
    label,
    value,
    muted = false,
    note,
}: {
    label: string;
    value: string;
    muted?: boolean;
    note?: string;
}) {
    return (
        <div
            style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'baseline',
                padding: '5px 0',
            }}
        >
            <span
                style={{
                    fontSize: 12.5,
                    color: 'var(--ox-text-muted)',
                }}
            >
                {label}
                {note && (
                    <span
                        style={{
                            marginLeft: 6,
                            fontSize: 11,
                            color: 'var(--ox-text-subtle)',
                        }}
                    >
                        {note}
                    </span>
                )}
            </span>
            <span
                style={{
                    fontFamily: 'var(--ox-font-mono)',
                    fontSize: 12.5,
                    color: muted ? 'var(--ox-text-subtle)' : 'var(--ox-text)',
                }}
            >
                {value}
            </span>
        </div>
    );
}

const overlay: React.CSSProperties = {
    position: 'fixed',
    inset: 0,
    background: 'var(--ox-overlay)',
    backdropFilter: 'blur(2px)',
    display: 'grid',
    placeItems: 'center',
    zIndex: 1100,
    padding: 20,
    overflowY: 'auto',
};

const receiptBox: React.CSSProperties = {
    width: '100%',
    maxWidth: 560,
    maxHeight: '92dvh',
    overflowY: 'auto',
    background: 'var(--ox-surface)',
    borderRadius: 'var(--ox-radius-xl)',
    border: '1px solid var(--ox-border)',
    boxShadow: 'var(--ox-shadow-xl)',
    overflowX: 'hidden',
};
