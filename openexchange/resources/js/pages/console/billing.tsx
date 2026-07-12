import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import {
    Card,
    Button,
    Icon,
    Badge,
    BalanceMeter,
    PaymentCard,
} from '@/components/oe';
import ConsoleLayout from '@/layouts/console-layout';

type Tx = {
    date: string;
    description: string;
    detail: string;
    amount: string;
    type: string;
};
type Props = {
    balance?: number;
    settings?: { auto_topup: boolean; min: number; topup: number };
    card?: { brand: string; last4: string; exp: string } | null;
    transactions?: Tx[];
    topping?: boolean;
};

export default function Billing({
    balance = 0,
    settings,
    card = null,
    transactions = [],
    topping = false,
}: Props) {
    const [autoTopup, setAutoTopup] = useState(settings?.auto_topup ?? true);
    const [min, setMin] = useState(settings?.min ?? 10);
    const [amount, setAmount] = useState(settings?.topup ?? 50);

    const save = (next: {
        auto_topup?: boolean;
        min?: number;
        topup?: number;
    }) => {
        router.post(
            '/console/billing/settings',
            { auto_topup: autoTopup, min, topup: amount, ...next },
            { preserveScroll: true, preserveState: true },
        );
    };
    const setMinP = (v: number) => {
        setMin(v);
        save({ min: v });
    };
    const setAmtP = (v: number) => {
        setAmount(v);
        save({ topup: v });
    };
    const toggle = () => {
        const v = !autoTopup;
        setAutoTopup(v);
        save({ auto_topup: v });
    };

    const seg = (val: number, cur: number, set: (n: number) => void) => (
        <button
            key={val}
            onClick={() => set(val)}
            style={{
                padding: '7px 14px',
                borderRadius: 999,
                fontFamily: 'var(--ox-font-mono)',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                border: `1px solid ${val === cur ? 'var(--ox-green-500)' : 'var(--ox-border-strong)'}`,
                background:
                    val === cur
                        ? 'var(--ox-primary-subtle)'
                        : 'var(--ox-surface)',
                color:
                    val === cur
                        ? 'var(--ox-green-700)'
                        : 'var(--ox-text-muted)',
            }}
        >
            ${val}
        </button>
    );
    const th = {
        padding: '10px 20px',
        fontSize: 'var(--ox-text-2xs)',
        textTransform: 'uppercase' as const,
        letterSpacing: 'var(--ox-tracking-caps)',
        color: 'var(--ox-text-subtle)',
        fontWeight: 600,
        borderBottom: '1px solid var(--ox-divider)',
        textAlign: 'left' as const,
    };
    const td = {
        padding: '12px 20px',
        borderBottom: '1px solid var(--ox-divider)',
        fontSize: 'var(--ox-text-sm)',
        color: 'var(--ox-text-muted)',
    };

    return (
        <ConsoleLayout
            active="billing"
            title="Billing"
            subtitle="Prepaid balance, auto top-up and payment method · billed in GBP"
            actions={
                <>
                    {card && (
                        <Button
                            size="sm"
                            variant="secondary"
                            onClick={() =>
                                router.post(
                                    '/console/billing/topup',
                                    {},
                                    { preserveScroll: true },
                                )
                            }
                            leadingIcon={<Icon name="refresh-cw" size={15} />}
                        >
                            Top up now
                        </Button>
                    )}
                    <Button
                        as={Link}
                        href="/console/billing/add-card"
                        size="sm"
                        leadingIcon={
                            <Icon
                                name="credit-card"
                                size={15}
                                color="var(--ox-on-primary)"
                            />
                        }
                    >
                        {card ? 'Replace card' : 'Add card'}
                    </Button>
                </>
            }
        >
            <Head title="Billing — Console" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div
                    className="oe-2col"
                    style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: 20,
                    }}
                >
                    <BalanceMeter
                        balance={balance}
                        min={min}
                        topUp={amount}
                        hasCard={!!card}
                        autoTopup={autoTopup}
                        topping={topping}
                    />

                    <Card
                        padding="lg"
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 18,
                        }}
                    >
                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                            }}
                        >
                            <div>
                                <div style={{ fontWeight: 700, fontSize: 16 }}>
                                    Auto top-up
                                </div>
                                <div
                                    style={{
                                        fontSize: 13,
                                        color: 'var(--ox-text-muted)',
                                        marginTop: 2,
                                    }}
                                >
                                    Keep the gateway running without
                                    interruptions.
                                </div>
                            </div>
                            <button
                                role="switch"
                                aria-checked={autoTopup}
                                onClick={toggle}
                                style={{
                                    width: 44,
                                    height: 26,
                                    borderRadius: 999,
                                    border: 'none',
                                    cursor: 'pointer',
                                    padding: 3,
                                    background: autoTopup
                                        ? 'var(--ox-green-500)'
                                        : 'var(--ox-border-strong)',
                                    transition: 'background 160ms',
                                    flexShrink: 0,
                                }}
                            >
                                <span
                                    style={{
                                        display: 'block',
                                        width: 20,
                                        height: 20,
                                        borderRadius: '50%',
                                        background: '#fff',
                                        boxShadow: 'var(--ox-shadow-sm)',
                                        transform: autoTopup
                                            ? 'translateX(18px)'
                                            : 'translateX(0)',
                                        transition:
                                            'transform 160ms var(--ox-ease)',
                                    }}
                                />
                            </button>
                        </div>
                        <div
                            style={{
                                opacity: autoTopup ? 1 : 0.5,
                                pointerEvents: autoTopup ? 'auto' : 'none',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 16,
                            }}
                        >
                            <div>
                                <div
                                    style={{
                                        fontSize: 12.5,
                                        fontWeight: 600,
                                        color: 'var(--ox-text-muted)',
                                        marginBottom: 8,
                                    }}
                                >
                                    When balance falls below
                                </div>
                                <div
                                    style={{
                                        display: 'flex',
                                        gap: 8,
                                        flexWrap: 'wrap',
                                    }}
                                >
                                    {[10, 25, 50, 100].map((v) =>
                                        seg(v, min, setMinP),
                                    )}
                                </div>
                            </div>
                            <div>
                                <div
                                    style={{
                                        fontSize: 12.5,
                                        fontWeight: 600,
                                        color: 'var(--ox-text-muted)',
                                        marginBottom: 8,
                                    }}
                                >
                                    Top up by{' '}
                                    <span
                                        style={{
                                            fontWeight: 400,
                                            color: 'var(--ox-text-subtle)',
                                        }}
                                    >
                                        (also the initial charge when you add a
                                        card)
                                    </span>
                                </div>
                                <div
                                    style={{
                                        display: 'flex',
                                        gap: 8,
                                        flexWrap: 'wrap',
                                    }}
                                >
                                    {[10, 50, 100, 250].map((v) =>
                                        seg(v, amount, setAmtP),
                                    )}
                                </div>
                            </div>
                            {/* The sentence is one flex item, not many. Left as
                                bare text nodes it becomes a row of anonymous
                                flex items, and on a narrow screen each phrase
                                collapses into its own column instead of the
                                sentence simply wrapping. */}
                            <div
                                style={{
                                    fontSize: 12.5,
                                    color: 'var(--ox-text-subtle)',
                                    display: 'flex',
                                    alignItems: 'flex-start',
                                    gap: 6,
                                }}
                            >
                                <span
                                    style={{ flexShrink: 0, marginTop: 1 }}
                                    aria-hidden="true"
                                >
                                    <Icon
                                        name="refresh-cw"
                                        size={13}
                                        color="var(--ox-text-subtle)"
                                    />
                                </span>
                                <span>
                                    We'll charge{' '}
                                    <span
                                        className="ox-mono"
                                        style={{ color: 'var(--ox-text)' }}
                                    >
                                        +${amount}
                                    </span>{' '}
                                    when your balance drops below{' '}
                                    <span
                                        className="ox-mono"
                                        style={{ color: 'var(--ox-text)' }}
                                    >
                                        ${min}
                                    </span>
                                    . Rate-limited to protect you from runaway
                                    charges.
                                </span>
                            </div>
                        </div>
                    </Card>
                </div>

                <div
                    className="oe-2col"
                    style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 2fr',
                        gap: 20,
                    }}
                >
                    <Card
                        padding="lg"
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 14,
                        }}
                    >
                        <div style={{ fontWeight: 700, fontSize: 16 }}>
                            Payment method
                        </div>
                        {card ? (
                            <>
                                <PaymentCard
                                    brand={card.brand}
                                    last4={card.last4}
                                    exp={card.exp}
                                    compact
                                    showHolder={false}
                                />
                                <div
                                    style={{
                                        display: 'flex',
                                        gap: 8,
                                        alignItems: 'center',
                                    }}
                                >
                                    <Badge tone="success">Connected</Badge>
                                    <Button
                                        as={Link}
                                        href="/console/billing/add-card"
                                        variant="ghost"
                                        size="sm"
                                    >
                                        Replace
                                    </Button>
                                </div>
                            </>
                        ) : (
                            <div
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: 12,
                                    alignItems: 'flex-start',
                                    padding: '10px 0',
                                }}
                            >
                                <span
                                    style={{
                                        fontSize: 13.5,
                                        color: 'var(--ox-text-muted)',
                                    }}
                                >
                                    No card connected. Add one to enable auto
                                    top-up.
                                </span>
                                <Button
                                    as={Link}
                                    href="/console/billing/add-card"
                                    leadingIcon={
                                        <Icon
                                            name="credit-card"
                                            size={15}
                                            color="var(--ox-on-primary)"
                                        />
                                    }
                                >
                                    Add card
                                </Button>
                            </div>
                        )}
                    </Card>

                    <Card padding="none">
                        <div
                            style={{
                                padding: '16px 20px',
                                borderBottom: '1px solid var(--ox-divider)',
                                fontSize: 'var(--ox-text-lg)',
                                fontWeight: 600,
                            }}
                        >
                            Transactions
                        </div>
                        <div className="oe-table-wrap">
                            <table
                                style={{
                                    width: '100%',
                                    borderCollapse: 'collapse',
                                    minWidth: 520,
                                }}
                            >
                                <thead>
                                    <tr>
                                        {[
                                            'Date',
                                            'Description',
                                            'Detail',
                                            'Amount (GBP)',
                                        ].map((h) => (
                                            <th key={h} style={th}>
                                                {h}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {transactions.length === 0 && (
                                        <tr>
                                            <td
                                                style={{
                                                    ...td,
                                                    color: 'var(--ox-text-subtle)',
                                                }}
                                                colSpan={4}
                                            >
                                                No transactions yet.
                                            </td>
                                        </tr>
                                    )}
                                    {transactions.map((r, i) => (
                                        <tr key={i}>
                                            <td
                                                style={{
                                                    ...td,
                                                    fontFamily:
                                                        'var(--ox-font-mono)',
                                                    color: 'var(--ox-text-subtle)',
                                                }}
                                            >
                                                {r.date}
                                            </td>
                                            <td
                                                style={{
                                                    ...td,
                                                    fontFamily:
                                                        'var(--ox-font-sans)',
                                                    color: 'var(--ox-text)',
                                                    fontWeight: 500,
                                                }}
                                            >
                                                {r.description}
                                            </td>
                                            <td
                                                style={{
                                                    ...td,
                                                    fontFamily:
                                                        'var(--ox-font-sans)',
                                                }}
                                            >
                                                {r.detail}
                                            </td>
                                            <td
                                                style={{
                                                    ...td,
                                                    fontFamily:
                                                        'var(--ox-font-mono)',
                                                    fontWeight: 600,
                                                    color:
                                                        r.type === 'credit'
                                                            ? 'var(--ox-success)'
                                                            : 'var(--ox-text)',
                                                }}
                                            >
                                                {r.amount}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </div>
            </div>
        </ConsoleLayout>
    );
}
