import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import ConsoleLayout from '@/layouts/console-layout';
import { Card, Badge, Tag, Button, Icon } from '@/components/oe';

type Source = { id: number; label: string; prefix: string; spend: string; tokens: string; lastUsed: string };
type Props = { sources?: Source[]; newKey?: { name: string; secret: string } | null };

export default function Sources({ sources = [], newKey = null }: Props) {
    const [editing, setEditing] = useState<number | null>(null);
    const [draft, setDraft] = useState('');
    const [modal, setModal] = useState(false);
    const [name, setName] = useState('');
    const [copied, setCopied] = useState(false);

    const create = () => router.post('/console/sources', { name }, { preserveScroll: true, onSuccess: () => { setModal(false); setName(''); } });
    const saveLabel = (id: number) => router.post(`/console/sources/${id}/label`, { label: draft }, { preserveScroll: true, onSuccess: () => setEditing(null) });
    const revoke = (id: number) => { if (confirm('Revoke this key? Apps using it will stop working immediately.')) router.post(`/console/sources/${id}/revoke`, {}, { preserveScroll: true }); };
    const copy = (t: string) => { navigator.clipboard?.writeText(t); setCopied(true); setTimeout(() => setCopied(false), 1800); };

    return (
        <ConsoleLayout active="sources" title="Sources" subtitle="Your gateway keys — label them and see usage per source"
            actions={<Button size="sm" leadingIcon={<Icon name="plus" size={15} color="var(--ox-on-primary)" />} onClick={() => setModal(true)}>Create key</Button>}>
            <Head title="Sources — Account" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <p style={{ margin: 0, color: 'var(--ox-text-muted)', fontSize: 14, lineHeight: 1.6, maxWidth: 720 }}>
                    A <strong>source</strong> is a gateway key your app calls Open Exchange with. Give each one a name
                    (e.g. “Production app”, “Batch jobs”) — usage is metered per source and billed to your one prepaid balance.
                </p>

                {/* one-time secret reveal */}
                {newKey && (
                    <Card padding="lg" style={{ border: '1.5px solid var(--ox-green-500)', background: 'var(--ox-primary-subtle)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                            <Icon name="check" size={18} color="var(--ox-green-700)" />
                            <span style={{ fontWeight: 700 }}>Key “{newKey.name}” created</span>
                            <span style={{ marginLeft: 'auto' }}><Badge tone="warning">Shown once</Badge></span>
                        </div>
                        <p style={{ margin: '0 0 12px', fontSize: 13.5, color: 'var(--ox-text-muted)' }}>Copy it now — for your security the secret won’t be shown again.</p>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', background: 'var(--ox-ink-900)', borderRadius: 10, padding: '12px 14px' }}>
                            <code style={{ flex: 1, minWidth: 0, fontFamily: 'var(--ox-font-mono)', fontSize: 13, color: '#eef3f2', wordBreak: 'break-all', overflowWrap: 'anywhere' }}>{newKey.secret}</code>
                            <Button size="sm" variant="secondary" onClick={() => copy(newKey.secret)} leadingIcon={<Icon name="copy" size={14} />}>{copied ? 'Copied' : 'Copy'}</Button>
                        </div>
                    </Card>
                )}

                {sources.length === 0 && !newKey && (
                    <Card padding="lg" style={{ textAlign: 'center', color: 'var(--ox-text-subtle)' }}>
                        No keys yet. Create one to start calling the gateway.
                    </Card>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 320px), 1fr))', gap: 16 }}>
                    {sources.map((s) => (
                        <Card key={s.id} padding="lg" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0, flex: 1 }}>
                                    <span style={{ display: 'grid', placeItems: 'center', width: 38, height: 38, borderRadius: 10, background: 'var(--ox-primary-subtle)', flexShrink: 0 }}>
                                        <Icon name="key" size={18} color="var(--ox-green-700)" />
                                    </span>
                                    {editing === s.id ? (
                                        <div style={{ display: 'flex', gap: 6, alignItems: 'center', flex: 1, minWidth: 0 }}>
                                            <input autoFocus value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && saveLabel(s.id)} maxLength={60}
                                                style={{ flex: 1, minWidth: 0, height: 34, padding: '0 10px', borderRadius: 8, border: '1px solid var(--ox-green-500)', background: 'var(--ox-bg-subtle)', fontFamily: 'var(--ox-font-sans)', fontSize: 15, fontWeight: 700, color: 'var(--ox-text)', outline: 'none' }} />
                                            <button onClick={() => saveLabel(s.id)} aria-label="Save" style={iconBtn}><Icon name="check" size={16} color="var(--ox-green-600)" /></button>
                                        </div>
                                    ) : (
                                        <div style={{ minWidth: 0 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                                                <span style={{ fontWeight: 700, fontSize: 16, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.label}</span>
                                                <button onClick={() => { setEditing(s.id); setDraft(s.label); }} aria-label="Rename" style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: 2, color: 'var(--ox-text-subtle)' }}><Icon name="settings" size={14} color="var(--ox-text-subtle)" /></button>
                                            </div>
                                            <Tag mono>{s.prefix}…</Tag>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 12, borderTop: '1px solid var(--ox-divider)' }}>
                                <div><div style={cap}>Tokens (MTD)</div><div style={fig}>{s.tokens}</div></div>
                                <div style={{ textAlign: 'right' }}><div style={cap}>Spend (MTD)</div><div style={fig}>{s.spend}</div></div>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: 11.5, color: 'var(--ox-text-subtle)' }}>Last used {s.lastUsed}</span>
                                <button onClick={() => revoke(s.id)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--ox-danger)', fontSize: 12.5, fontWeight: 600 }}>Revoke</button>
                            </div>
                        </Card>
                    ))}
                </div>

                {/* how to call */}
                <Card padding="lg">
                    <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 12 }}>Call the gateway</div>
                    <pre style={{ margin: 0, padding: 16, borderRadius: 10, background: 'var(--ox-ink-950)', overflowX: 'auto', fontFamily: 'var(--ox-font-mono)', fontSize: 12.5, lineHeight: 1.7, color: '#d7e0dd' }}><code>{`curl ${typeof window !== 'undefined' ? window.location.origin : ''}/v1/chat \\
  -H "Authorization: Bearer oxk_live_…" \\
  -H "Content-Type: application/json" \\
  -d '{ "model": "gemini-2.5-flash",
        "messages": [{ "role": "user", "content": "Hello" }] }'`}</code></pre>
                    <p style={{ margin: '10px 0 0', fontSize: 12.5, color: 'var(--ox-text-subtle)' }}>Use <span className="ox-mono">vertex/gemini-2.5-flash</span> to force Vertex, or any model from <span className="ox-mono">/v1/models</span>. Usage is metered in real time and debited from your balance.</p>
                </Card>
            </div>

            {modal && (
                <div style={overlay} onClick={() => setModal(false)}>
                    <div style={modalBox} onClick={(e) => e.stopPropagation()}>
                        <div style={{ fontSize: 'var(--ox-text-lg)', fontWeight: 700, marginBottom: 6 }}>Create gateway key</div>
                        <p style={{ margin: '0 0 16px', fontSize: 14, color: 'var(--ox-text-muted)' }}>Name it so your usage reads clearly. You’ll see the secret once.</p>
                        <input autoFocus value={name} onChange={(e) => setName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && create()} placeholder="e.g. Production app" style={inp} />
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 18 }}>
                            <Button variant="ghost" onClick={() => setModal(false)}>Cancel</Button>
                            <Button onClick={create}>Create key</Button>
                        </div>
                    </div>
                </div>
            )}
        </ConsoleLayout>
    );
}

const cap: React.CSSProperties = { fontSize: 'var(--ox-text-2xs)', textTransform: 'uppercase', letterSpacing: 'var(--ox-tracking-caps)', color: 'var(--ox-text-subtle)', fontWeight: 600 };
const fig: React.CSSProperties = { fontFamily: 'var(--ox-font-mono)', fontSize: 15, fontWeight: 600, color: 'var(--ox-text)', marginTop: 2 };
const iconBtn: React.CSSProperties = { display: 'grid', placeItems: 'center', width: 34, height: 34, borderRadius: 8, border: '1px solid var(--ox-border)', background: 'var(--ox-surface)', cursor: 'pointer', flexShrink: 0 };
const overlay: React.CSSProperties = { position: 'fixed', inset: 0, background: 'var(--ox-overlay)', backdropFilter: 'blur(2px)', display: 'grid', placeItems: 'center', zIndex: 1100, padding: 20 };
const modalBox: React.CSSProperties = { width: '100%', maxWidth: 440, maxHeight: '90dvh', overflowY: 'auto', background: 'var(--ox-surface)', borderRadius: 'var(--ox-radius-xl)', border: '1px solid var(--ox-border)', boxShadow: 'var(--ox-shadow-xl)', padding: 24 };
const inp: React.CSSProperties = { width: '100%', height: 42, padding: '0 12px', borderRadius: 'var(--ox-radius-md)', border: '1px solid var(--ox-border-strong)', background: 'var(--ox-bg-subtle)', fontFamily: 'var(--ox-font-sans)', fontSize: 14, color: 'var(--ox-text)', outline: 'none' };
