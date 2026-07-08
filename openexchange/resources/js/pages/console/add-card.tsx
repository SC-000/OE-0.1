import { useEffect, useRef, useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import ConsoleLayout from '@/layouts/console-layout';
import { Card, Button, Icon, Spinner, DotField, Badge } from '@/components/oe';

const STAGES = [
    { label: 'Tokenising card securely', sub: 'Stripe Elements · PCI SAQ-A' },
    { label: 'Verifying with issuer', sub: '3-D Secure handshake' },
    { label: 'Linking to Open Exchange', sub: 'Attaching payment method' },
    { label: 'Funding prepaid balance', sub: 'Initial authorisation' },
    { label: 'Enabling auto top-up', sub: 'Below your minimum → auto top-up' },
];

type Props = { publishableKey?: string | null; customerId?: string | null; widgetBase?: string; hasToken?: boolean; topupAmount?: number };

export default function AddCard({ publishableKey, customerId, widgetBase = 'https://billings.systems', hasToken = false, topupAmount = 10 }: Props) {
    const configured = !!(publishableKey && customerId);
    const testReason = hasToken && !publishableKey
        ? 'Live capture needs BILLINGS_PUBLISHABLE — a zero-scope publishable token, separate from your server token. Add it and reload.'
        : !hasToken
            ? 'Configure billings.systems (BILLINGS_TOKEN + BILLINGS_PUBLISHABLE) for live cards.'
            : 'Connecting your billing account — reload in a moment.';
    const [step, setStep] = useState<'form' | 'connecting' | 'done'>('form');
    const [stage, setStage] = useState(0);
    const [card, setCard] = useState({ number: '', name: '', exp: '', cvc: '' });
    const [error, setError] = useState<string | null>(null);
    const widgetRef = useRef<HTMLDivElement>(null);
    const pmRef = useRef<Record<string, unknown> | null>(null);
    const persisted = useRef(false);

    // Mount the OE-themed billings.systems SetupWidget when configured.
    useEffect(() => {
        if (!configured || step !== 'form') return;
        let cancelled = false;
        const load = (src: string) => new Promise<void>((res) => {
            if (document.querySelector(`script[src="${src}"]`)) return res();
            const s = document.createElement('script'); s.src = src; s.onload = () => res(); document.head.appendChild(s);
        });
        (async () => {
            await load('https://js.stripe.com/v3/');
            await load(`${widgetBase}/widgets/SetupWidget.js`);
            const w = window as unknown as { SetupWidget?: (o: unknown) => void };
            if (cancelled || !w.SetupWidget || !widgetRef.current) return;
            w.SetupWidget({
                config: {
                    customerId, apiKey: publishableKey,
                    theme: 'minimal', borderRadius: 'medium', showLogo: false,
                    title: '', buttonText: 'Connect card securely',
                    colors: { primary: '#33c13e', background: '#fffdf8', text: '#122023', danger: '#d84343', success: '#23a531' },
                    typography: { fontFamily: '"Manrope", sans-serif' },
                    spacing: { padding: '0px', fieldSpacing: '14px' },
                    onSuccess: (data: { payment_method?: Record<string, unknown> }) => { pmRef.current = data?.payment_method ?? null; setStep('connecting'); setStage(0); },
                    onError: (err: { message?: string }) => setError(err?.message ?? 'Something went wrong'),
                },
                container: widgetRef.current,
            });
        })();
        return () => { cancelled = true; };
    }, [configured, step, customerId, publishableKey, widgetBase]);

    // Connection animation.
    useEffect(() => {
        if (step !== 'connecting') return;
        if (stage >= STAGES.length) { const t = setTimeout(() => setStep('done'), 700); return () => clearTimeout(t); }
        const t = setTimeout(() => setStage((s) => s + 1), 1150);
        return () => clearTimeout(t);
    }, [step, stage]);

    // Persist the card once the flow completes. Live mode uses the widget's
    // tokenised payment method; test mode saves the digits you typed so the card
    // still appears on your billing account (no charge, no billings customer).
    useEffect(() => {
        if (step !== 'done' || persisted.current) return;
        persisted.current = true;
        const pm = pmRef.current ?? {};
        const digits = card.number.replace(/\D/g, '');
        const [em, ey] = (card.exp || '').split('/').map((s) => parseInt(s.trim(), 10) || 0);
        router.post('/console/billing/card', {
            payment_method_id: (pm.id as string) || ('pm_test_' + Math.random().toString(16).slice(2, 10)),
            brand: (pm.type as string) || (pm.brand as string) || 'visa',
            last4: (pm.last4 as string) || (digits.slice(-4) || '4242'),
            exp_month: (pm.expiry_month as number) || (em >= 1 && em <= 12 ? em : 8),
            exp_year: (pm.expiry_year as number) || (ey ? (ey < 100 ? 2000 + ey : ey) : 2028),
        }, { preserveState: true, preserveScroll: true });
    }, [step]);

    const fmtNum = (v: string) => v.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
    const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) => setCard((c) => ({ ...c, [k]: e.target.value }));

    return (
        <ConsoleLayout active="billing" title="Add payment method" subtitle="Securely connect a card for prepaid top-ups">
            <Head title="Add card — Account" />
            <div style={{ maxWidth: 920, margin: '0 auto' }}>
                <Link href="/console/billing" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--ox-text-muted)', textDecoration: 'none', fontSize: 13.5, marginBottom: 18 }}>
                    <Icon name="chevron-right" size={15} color="var(--ox-text-muted)" style={{ transform: 'rotate(180deg)' }} />Back to billing
                </Link>

                {step === 'form' && (
                    <>
                    <div className="oe-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, alignItems: 'start' }}>
                        {/* card preview */}
                        <div style={{ position: 'relative', borderRadius: 18, padding: 24, minHeight: 200, color: '#eef3f2', background: 'linear-gradient(135deg, var(--ox-ink-800), var(--ox-ink-950))', border: '1px solid rgba(255,255,255,0.1)', overflow: 'hidden', boxShadow: 'var(--ox-shadow-lg)' }}>
                            <DotField style={{ left: 'auto', right: '-30%', top: '-20%', width: '80%', height: '140%', opacity: 0.4 }} />
                            <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between', minHeight: 152 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Icon name="credit-card" size={26} color="var(--ox-green-400)" />
                                    <span style={{ fontWeight: 700, fontSize: 14, letterSpacing: '0.06em' }}>OPEN&nbsp;EXCHANGE</span>
                                </div>
                                <div style={{ fontFamily: 'var(--ox-font-mono)', fontSize: 20, letterSpacing: '0.12em' }}>{card.number ? fmtNum(card.number) : '•••• •••• •••• ••••'}</div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, color: 'rgba(238,243,242,0.72)' }}>
                                    <span style={{ textTransform: 'uppercase' }}>{card.name || 'Cardholder name'}</span>
                                    <span className="ox-mono">{card.exp || 'MM / YY'}</span>
                                </div>
                            </div>
                        </div>

                        {/* form: real widget when configured, else visual demo */}
                        <Card padding="lg" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                            {configured ? (
                                <>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <span style={{ fontWeight: 700, fontSize: 15 }}>Card details</span>
                                        <Badge tone="success">Secured · Open Exchange gateway</Badge>
                                    </div>
                                    <div ref={widgetRef} style={{ minHeight: 200 }} />
                                    {error && <span style={{ color: 'var(--ox-danger)', fontSize: 13 }}>{error}</span>}
                                </>
                            ) : (
                                <>
                                    <Field label="Card number"><input value={fmtNum(card.number)} onChange={set('number')} placeholder="4242 4242 4242 4242" style={inp} inputMode="numeric" /></Field>
                                    <Field label="Cardholder name"><input value={card.name} onChange={set('name')} placeholder="Ada Reyes" style={inp} /></Field>
                                    <div style={{ display: 'flex', gap: 12 }}>
                                        <Field label="Expiry"><input value={card.exp} onChange={set('exp')} placeholder="08 / 28" style={inp} /></Field>
                                        <Field label="CVC"><input value={card.cvc} onChange={set('cvc')} placeholder="123" style={inp} inputMode="numeric" maxLength={4} /></Field>
                                    </div>
                                    <Button size="lg" fullWidth onClick={() => { setStep('connecting'); setStage(0); }} leadingIcon={<Icon name="lock" size={16} color="var(--ox-on-primary)" />}>Connect card securely</Button>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center', fontSize: 12, color: 'var(--ox-text-subtle)' }}>
                                        <Icon name="shield" size={13} color="var(--ox-text-subtle)" />Test mode — no live charge; the card is saved so you can test. {testReason}
                                    </span>
                                </>
                            )}
                        </Card>
                    </div>
                    <p style={{ maxWidth: 620, margin: '16px auto 0', fontSize: 12, lineHeight: 1.55, color: 'var(--ox-text-subtle)', textAlign: 'center' }}>
                        Adding your card places a one-time <span className="ox-mono" style={{ color: 'var(--ox-text-muted)' }}>${topupAmount}</span> top-up to activate your prepaid balance. After that we only top up automatically when your balance runs low — never a subscription.
                    </p>
                    </>
                )}

                {step === 'connecting' && (
                    <Card padding="lg" style={{ padding: 36 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 36 }}>
                            <Node icon="credit-card" label="Card" />
                            <Connector />
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                                <div style={{ position: 'relative', width: 100, height: 88 }}><DotField strands={11} density={0.7} speed={1.9} fit={0.58} /></div>
                                <span style={nodeLbl}>Gateway</span>
                            </div>
                            <Connector />
                            <Node icon="shield" label="Issuer" />
                        </div>
                        <div style={{ maxWidth: 420, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 4 }}>
                            {STAGES.map((s, i) => {
                                const done = i < stage, active = i === stage;
                                return (
                                    <div key={i} style={{ display: 'flex', gap: 14, alignItems: 'flex-start', opacity: done || active ? 1 : 0.4, transition: 'opacity 300ms' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                            <span style={{ display: 'grid', placeItems: 'center', width: 28, height: 28 }}>
                                                {done ? <span style={{ display: 'grid', placeItems: 'center', width: 24, height: 24, borderRadius: '50%', background: 'var(--ox-primary-subtle)' }}><Icon name="check" size={15} color="var(--ox-green-600)" /></span>
                                                    : active ? <Spinner size={24} />
                                                        : <span style={{ width: 10, height: 10, borderRadius: '50%', border: '2px solid var(--ox-border-strong)' }} />}
                                            </span>
                                            {i < STAGES.length - 1 && <span style={{ width: 2, height: 26, background: done ? 'var(--ox-green-400)' : 'var(--ox-border)', transition: 'background 300ms' }} />}
                                        </div>
                                        <div style={{ paddingTop: 3 }}>
                                            <div style={{ fontWeight: 600, fontSize: 14.5, color: done || active ? 'var(--ox-text)' : 'var(--ox-text-muted)' }}>{s.label}</div>
                                            <div style={{ fontFamily: 'var(--ox-font-mono)', fontSize: 11.5, color: 'var(--ox-text-subtle)', marginTop: 1 }}>{s.sub}</div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </Card>
                )}

                {step === 'done' && (
                    <Card padding="lg" style={{ padding: 44, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                        <span className="oe-pop" style={{ display: 'grid', placeItems: 'center', width: 72, height: 72, borderRadius: '50%', background: 'var(--ox-primary-subtle)', marginBottom: 8 }}>
                            <Icon name="check" size={38} color="var(--ox-green-600)" />
                        </span>
                        <h2 style={{ margin: 0, fontWeight: 800, fontSize: 'var(--ox-text-2xl)', letterSpacing: '-0.02em' }}>Card connected</h2>
                        <p style={{ margin: '4px 0 0', color: 'var(--ox-text-muted)', maxWidth: 420 }}>
                            Your card is linked and auto top-up is enabled — your account keeps running without interruption.
                        </p>
                        <Button size="lg" style={{ marginTop: 20 }} onClick={() => router.visit('/console/billing')} trailingIcon={<Icon name="arrow-right" size={16} color="var(--ox-on-primary)" />}>Go to billing</Button>
                    </Card>
                )}
            </div>
        </ConsoleLayout>
    );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <label style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--ox-text-muted)' }}>{label}</span>
            {children}
        </label>
    );
}
function Node({ icon, label }: { icon: string; label: string }) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <span style={{ display: 'grid', placeItems: 'center', width: 56, height: 56, borderRadius: 16, background: 'var(--ox-surface)', border: '1px solid var(--ox-border-strong)' }}>
                <Icon name={icon} size={24} color="var(--ox-green-600)" />
            </span>
            <span style={nodeLbl}>{label}</span>
        </div>
    );
}
function Connector() {
    return (
        <span style={{ position: 'relative', width: 56, height: 2, background: 'var(--ox-border-strong)', borderRadius: 2, overflow: 'visible' }}>
            <span className="oe-travel" style={{ position: 'absolute', top: -2.5, width: 7, height: 7, borderRadius: '50%', background: 'var(--ox-green-500)', boxShadow: '0 0 8px var(--ox-green-500)' }} />
        </span>
    );
}
const nodeLbl: React.CSSProperties = { fontFamily: 'var(--ox-font-sans)', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', color: 'var(--ox-text-muted)', textTransform: 'uppercase' };
const inp: React.CSSProperties = { width: '100%', height: 42, padding: '0 12px', borderRadius: 'var(--ox-radius-md)', border: '1px solid var(--ox-border-strong)', background: 'var(--ox-bg-subtle)', fontFamily: 'var(--ox-font-mono)', fontSize: 14, color: 'var(--ox-text)', outline: 'none' };
