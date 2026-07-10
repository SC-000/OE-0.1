import { Head, Link, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { Card, Badge, Button, Icon, StatCard } from '@/components/oe';
import AdminLayout from '@/layouts/admin-layout';
import { money, num, tokens } from '@/lib/format';

type Backend = {
    id: number;
    provider: string;
    backend: string;
    label: string;
    project: string;
    region: string;
    status: string;
};
type Key = {
    id: number;
    provider: string;
    project: string;
    label: string;
    client: string;
    client_id: number | null;
    status: string;
    revenue_cents: number;
    records: number;
    synced: string;
};
type Proj = {
    id: string;
    name: string;
    status: string;
    assigned_client_id: number | null;
    assigned_client: string | null;
    label: string | null;
    key_status: string | null;
    tokens: number;
    series: number[];
};
type AccessKey = {
    id: number;
    name: string;
    frag: string;
    status: string;
    client: string | null;
    client_id: number | null;
    last_used: string;
};

type Props = {
    backends: Backend[];
    keys: Key[];
    discovery: Proj[];
    discoveredAt: string | null;
    openaiReady: boolean;
    clientOptions: { id: number; name: string }[];
    accessKeys: AccessKey[];
    lastPull: { at: string } | null;
    lastCharges: { at: string } | null;
    newAccessKey?: { name: string; client: string; secret: string } | null;
};

const th: React.CSSProperties = {
    textAlign: 'left',
    padding: '9px 10px',
    fontSize: 11,
    fontWeight: 600,
    color: 'var(--ox-text-subtle)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    borderBottom: '1px solid var(--ox-border)',
    whiteSpace: 'nowrap',
};
const td: React.CSSProperties = {
    padding: '10px',
    fontSize: 'var(--ox-text-sm)',
    borderBottom: '1px solid var(--ox-border)',
};
const mono: React.CSSProperties = { fontFamily: 'var(--ox-font-mono)' };
const input: React.CSSProperties = {
    width: '100%',
    height: 34,
    padding: '0 9px',
    borderRadius: 'var(--ox-radius-sm)',
    border: '1px solid var(--ox-border)',
    background: 'var(--ox-surface)',
    color: 'var(--ox-text)',
    fontSize: 'var(--ox-text-sm)',
};

const Lbl = ({ children }: { children: React.ReactNode }) => (
    <span
        style={{
            display: 'block',
            fontSize: 11.5,
            fontWeight: 600,
            color: 'var(--ox-text-subtle)',
            marginBottom: 5,
        }}
    >
        {children}
    </span>
);
const Section = ({
    title,
    hint,
    children,
    right,
}: {
    title: string;
    hint?: string;
    children: React.ReactNode;
    right?: React.ReactNode;
}) => (
    <Card padding="lg" style={{ marginBottom: 18 }}>
        <div
            style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                gap: 12,
                marginBottom: 12,
                flexWrap: 'wrap',
            }}
        >
            <div>
                <h2
                    style={{
                        margin: 0,
                        fontSize: 'var(--ox-text-md)',
                        fontWeight: 700,
                    }}
                >
                    {title}
                </h2>
                {hint && (
                    <p
                        style={{
                            margin: '2px 0 0',
                            fontSize: 'var(--ox-text-xs)',
                            color: 'var(--ox-text-subtle)',
                            maxWidth: 680,
                        }}
                    >
                        {hint}
                    </p>
                )}
            </div>
            {right}
        </div>
        {children}
    </Card>
);
const Empty = ({ children }: { children: React.ReactNode }) => (
    <p
        style={{
            color: 'var(--ox-text-subtle)',
            fontSize: 'var(--ox-text-sm)',
            margin: 0,
        }}
    >
        {children}
    </p>
);

/** Each tab is one job-to-be-done, so the page stops being a wall of tables. */
const TABS = [
    {
        id: 'backends',
        label: 'Backends',
        icon: 'database',
        hint: 'What the gateway calls providers with',
    },
    {
        id: 'discovery',
        label: 'Discovery',
        icon: 'search',
        hint: 'Find provider projects and attribute them',
    },
    {
        id: 'attribution',
        label: 'Attribution',
        icon: 'layers',
        hint: 'Which client each provider project bills to',
    },
    {
        id: 'keys',
        label: 'Gateway keys',
        icon: 'key',
        hint: 'Client-facing access keys',
    },
    {
        id: 'jobs',
        label: 'Jobs',
        icon: 'refresh-cw',
        hint: 'Metering pull, charges, re-billing',
    },
] as const;
type Tab = (typeof TABS)[number]['id'];

export default function Platform({
    backends,
    keys,
    discovery,
    discoveredAt,
    openaiReady,
    clientOptions,
    accessKeys,
    lastPull,
    lastCharges,
    credentials,
    newAccessKey,
}: Props) {
    const [tab, setTab] = useState<Tab>('backends');

    const billing = keys.filter((k) => k.status === 'billing').length;
    const unassigned = discovery.filter((p) => !p.assigned_client_id).length;
    const activeKeys = accessKeys.filter((k) => k.status === 'active').length;

    const counts: Record<Tab, number | null> = {
        backends: backends.length,
        discovery: unassigned || null,
        attribution: keys.length,
        keys: activeKeys,
        jobs: null,
    };

    return (
        <AdminLayout
            active="platform"
            title="Platform"
            subtitle={TABS.find((t) => t.id === tab)?.hint}
        >
            <Head title="Admin — Platform" />

            {(!credentials.openai_admin_key ||
                !credentials.google_credentials) && (
                <Card
                    padding="md"
                    style={{
                        marginBottom: 16,
                        borderLeft: '3px solid var(--ox-danger)',
                    }}
                >
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: 10,
                        }}
                    >
                        <Icon
                            name="alert-triangle"
                            size={17}
                            color="var(--ox-danger)"
                        />
                        <div>
                            <strong style={{ fontSize: 'var(--ox-text-sm)' }}>
                                The usage pull cannot authenticate.
                            </strong>
                            <p
                                style={{
                                    margin: '3px 0 0',
                                    fontSize: 'var(--ox-text-xs)',
                                    color: 'var(--ox-text-subtle)',
                                    lineHeight: 1.6,
                                }}
                            >
                                {!credentials.openai_admin_key && (
                                    <>
                                        <code style={mono}>
                                            OPENAI_ADMIN_KEY
                                        </code>{' '}
                                        is not set.{' '}
                                    </>
                                )}
                                {!credentials.google_credentials && (
                                    <>
                                        <code style={mono}>
                                            GOOGLE_CREDENTIALS_JSON
                                        </code>{' '}
                                        is not set.{' '}
                                    </>
                                )}
                                Until it is, every pull fails and no pulled
                                usage is billed to anyone. Gateway traffic is
                                unaffected — it meters in real time. Run{' '}
                                <code style={mono}>php artisan oe:doctor</code>{' '}
                                to check.
                            </p>
                        </div>
                    </div>
                </Card>
            )}

            {lastPull && (lastPull.failed > 0 || lastPull.empty > 0) && (
                <Card
                    padding="md"
                    style={{
                        marginBottom: 16,
                        borderLeft: '3px solid var(--ox-warning)',
                    }}
                >
                    <strong style={{ fontSize: 'var(--ox-text-sm)' }}>
                        Last pull ({lastPull.at}): {lastPull.metered} metered
                        {lastPull.failed > 0 &&
                            `, ${lastPull.failed} key(s) failed`}
                        {lastPull.empty > 0 &&
                            `, ${lastPull.empty} key(s) returned nothing`}
                    </strong>
                    {lastPull.errors?.length > 0 && (
                        <ul
                            style={{
                                margin: '6px 0 0',
                                paddingLeft: 18,
                                fontSize: 'var(--ox-text-xs)',
                                color: 'var(--ox-danger)',
                            }}
                        >
                            {lastPull.errors.map((e) => (
                                <li key={e} style={mono}>
                                    {e}
                                </li>
                            ))}
                        </ul>
                    )}
                </Card>
            )}

            {newAccessKey && (
                <Card
                    padding="md"
                    style={{
                        marginBottom: 16,
                        borderLeft: '3px solid var(--ox-primary)',
                    }}
                >
                    <strong style={{ fontSize: 'var(--ox-text-sm)' }}>
                        Gateway key “{newAccessKey.name}” for{' '}
                        {newAccessKey.client} — copy it now, it is never shown
                        again.
                    </strong>
                    <div
                        style={{
                            ...mono,
                            marginTop: 8,
                            padding: 10,
                            background: 'var(--ox-bg-muted)',
                            borderRadius: 'var(--ox-radius-sm)',
                            fontSize: 12.5,
                            wordBreak: 'break-all',
                        }}
                    >
                        {newAccessKey.secret}
                    </div>
                </Card>
            )}

            {/* Health at a glance, independent of which tab you're on. */}
            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
                    gap: 12,
                    marginBottom: 20,
                }}
            >
                <StatCard
                    label="Backends"
                    value={String(backends.length)}
                    hint={
                        backends.length
                            ? 'Gateway can serve'
                            : 'Gateway cannot serve'
                    }
                />
                <StatCard
                    label="Metered projects"
                    value={String(billing)}
                    hint={`${keys.length} attached`}
                />
                <StatCard
                    label="Gateway keys"
                    value={String(activeKeys)}
                    hint={`${accessKeys.length - activeKeys} revoked`}
                />
                <StatCard
                    label="Last usage pull"
                    value={lastPull?.at ? lastPull.at.slice(5, 16) : 'never'}
                    hint="Hourly"
                />
                <StatCard
                    label="Last charges run"
                    value={
                        lastCharges?.at ? lastCharges.at.slice(5, 16) : 'never'
                    }
                    hint="Daily 00:15"
                />
            </div>

            <div
                style={{
                    display: 'flex',
                    gap: 4,
                    marginBottom: 16,
                    flexWrap: 'wrap',
                }}
            >
                {TABS.map((t) => {
                    const on = t.id === tab;
                    const badge = counts[t.id];

                    return (
                        <button
                            key={t.id}
                            onClick={() => setTab(t.id)}
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 7,
                                padding: '7px 13px',
                                borderRadius: 'var(--ox-radius-full)',
                                cursor: 'pointer',
                                fontSize: 'var(--ox-text-sm)',
                                fontWeight: 600,
                                border:
                                    '1px solid ' +
                                    (on ? 'transparent' : 'var(--ox-border)'),
                                background: on
                                    ? 'var(--ox-primary-subtle)'
                                    : 'transparent',
                                color: on
                                    ? 'var(--ox-green-700)'
                                    : 'var(--ox-text-muted)',
                            }}
                        >
                            <Icon
                                name={t.icon}
                                size={14}
                                color={
                                    on
                                        ? 'var(--ox-green-700)'
                                        : 'var(--ox-text-muted)'
                                }
                            />
                            {t.label}
                            {badge !== null && badge > 0 && (
                                <span
                                    style={{
                                        fontFamily: 'var(--ox-font-mono)',
                                        fontSize: 10.5,
                                        padding: '1px 6px',
                                        borderRadius: 999,
                                        background:
                                            t.id === 'discovery'
                                                ? 'var(--ox-warning-surface)'
                                                : 'var(--ox-bg-muted)',
                                        color:
                                            t.id === 'discovery'
                                                ? 'var(--ox-warning)'
                                                : 'var(--ox-text-subtle)',
                                    }}
                                >
                                    {badge}
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>

            {tab === 'backends' && <BackendsTab backends={backends} />}
            {tab === 'discovery' && (
                <DiscoveryTab
                    discovery={discovery}
                    discoveredAt={discoveredAt}
                    openaiReady={openaiReady}
                    clientOptions={clientOptions}
                />
            )}
            {tab === 'attribution' && (
                <AttributionTab keys={keys} clientOptions={clientOptions} />
            )}
            {tab === 'keys' && (
                <KeysTab
                    accessKeys={accessKeys}
                    clientOptions={clientOptions}
                />
            )}
            {tab === 'jobs' && (
                <JobsTab lastPull={lastPull} lastCharges={lastCharges} />
            )}
        </AdminLayout>
    );
}

/* ------------------------------------- Backends ------------------------------------- */

function BackendsTab({ backends }: { backends: Backend[] }) {
    const [adding, setAdding] = useState(false);
    const form = useForm({
        provider: 'openai',
        backend: 'openai',
        label: '',
        secret: '',
        project_id: '',
        region: '',
    });
    const isVertex = form.data.backend === 'vertex';

    return (
        <Section
            title="Provider backends"
            hint="Open Exchange's own upstream credentials — what the gateway calls the providers with. Without at least one active backend the gateway returns 503."
            right={
                <Button
                    size="sm"
                    variant="secondary"
                    leadingIcon={<Icon name="plus" size={15} />}
                    onClick={() => setAdding((v) => !v)}
                >
                    Add backend
                </Button>
            }
        >
            {backends.length === 0 && (
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        marginBottom: 14,
                        color: 'var(--ox-danger)',
                        fontSize: 'var(--ox-text-sm)',
                    }}
                >
                    <Icon
                        name="alert-triangle"
                        size={15}
                        color="var(--ox-danger)"
                    />
                    No backends configured — the gateway cannot serve a single
                    request.
                </div>
            )}

            {adding && (
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        form.post('/admin/platform/backends', {
                            preserveScroll: true,
                            onSuccess: () => {
                                form.reset();
                                setAdding(false);
                            },
                        });
                    }}
                    style={{
                        display: 'grid',
                        gridTemplateColumns:
                            'repeat(auto-fit, minmax(150px, 1fr))',
                        gap: 12,
                        alignItems: 'end',
                        marginBottom: 18,
                        paddingBottom: 18,
                        borderBottom: '1px solid var(--ox-border)',
                    }}
                >
                    <label>
                        <Lbl>Provider</Lbl>
                        <select
                            style={input}
                            value={form.data.provider}
                            onChange={(e) =>
                                form.setData('provider', e.target.value)
                            }
                        >
                            <option value="openai">OpenAI</option>
                            <option value="google">Google</option>
                        </select>
                    </label>
                    <label>
                        <Lbl>Backend</Lbl>
                        <select
                            style={input}
                            value={form.data.backend}
                            onChange={(e) =>
                                form.setData('backend', e.target.value)
                            }
                        >
                            <option value="openai">openai</option>
                            <option value="aistudio">aistudio</option>
                            <option value="vertex">vertex</option>
                        </select>
                    </label>
                    <label>
                        <Lbl>Label</Lbl>
                        <input
                            style={input}
                            value={form.data.label}
                            onChange={(e) =>
                                form.setData('label', e.target.value)
                            }
                            placeholder="Primary"
                        />
                    </label>
                    <label>
                        <Lbl>
                            {form.data.backend === 'vertex'
                                ? 'Service-account JSON'
                                : 'API key'}
                        </Lbl>
                        <input
                            style={input}
                            type="password"
                            value={form.data.secret}
                            onChange={(e) =>
                                form.setData('secret', e.target.value)
                            }
                            placeholder="sk-…"
                        />
                        {form.errors.secret && (
                            <span
                                style={{
                                    fontSize: 11.5,
                                    color: 'var(--ox-danger)',
                                }}
                            >
                                {form.errors.secret}
                            </span>
                        )}
                    </label>
                    {isVertex && (
                        <label>
                            <Lbl>GCP project</Lbl>
                            <input
                                style={input}
                                value={form.data.project_id}
                                onChange={(e) =>
                                    form.setData('project_id', e.target.value)
                                }
                            />
                        </label>
                    )}
                    {isVertex && (
                        <label>
                            <Lbl>Region</Lbl>
                            <input
                                style={input}
                                value={form.data.region}
                                onChange={(e) =>
                                    form.setData('region', e.target.value)
                                }
                                placeholder="us-central1"
                            />
                        </label>
                    )}
                    <div style={{ display: 'flex', gap: 8 }}>
                        <Button
                            type="submit"
                            size="sm"
                            disabled={form.processing}
                        >
                            Save backend
                        </Button>
                        <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            onClick={() => setAdding(false)}
                        >
                            Cancel
                        </Button>
                    </div>
                </form>
            )}

            {backends.length > 0 && (
                <div style={{ overflowX: 'auto' }}>
                    <table
                        style={{ width: '100%', borderCollapse: 'collapse' }}
                    >
                        <thead>
                            <tr>
                                <th style={th}>Label</th>
                                <th style={th}>Provider</th>
                                <th style={th}>Backend</th>
                                <th style={th}>Project</th>
                                <th style={th}>Region</th>
                                <th style={th}>Status</th>
                                <th style={{ ...th, textAlign: 'right' }} />
                            </tr>
                        </thead>
                        <tbody>
                            {backends.map((b) => (
                                <tr key={b.id}>
                                    <td style={{ ...td, fontWeight: 600 }}>
                                        {b.label}
                                    </td>
                                    <td style={td}>{b.provider}</td>
                                    <td
                                        style={{
                                            ...td,
                                            ...mono,
                                            fontSize: 12.5,
                                        }}
                                    >
                                        {b.backend}
                                    </td>
                                    <td
                                        style={{ ...td, ...mono, fontSize: 12 }}
                                    >
                                        {b.project}
                                    </td>
                                    <td
                                        style={{ ...td, ...mono, fontSize: 12 }}
                                    >
                                        {b.region}
                                    </td>
                                    <td style={td}>
                                        <Badge
                                            tone={
                                                b.status === 'active'
                                                    ? 'success'
                                                    : 'neutral'
                                            }
                                        >
                                            {b.status}
                                        </Badge>
                                    </td>
                                    <td style={{ ...td, textAlign: 'right' }}>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() =>
                                                router.delete(
                                                    `/admin/platform/backends/${b.id}`,
                                                    { preserveScroll: true },
                                                )
                                            }
                                        >
                                            <Icon
                                                name="trash"
                                                size={13}
                                                color="var(--ox-danger)"
                                            />
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </Section>
    );
}

/* ------------------------------------- Discovery ------------------------------------ */

function DiscoveryTab({
    discovery,
    discoveredAt,
    openaiReady,
    clientOptions,
}: Pick<
    Props,
    'discovery' | 'discoveredAt' | 'openaiReady' | 'clientOptions'
>) {
    const [assign, setAssign] = useState<{
        id: string;
        client_id: string;
        label: string;
    } | null>(null);

    return (
        <Section
            title="Discovered OpenAI projects"
            hint={
                openaiReady
                    ? discoveredAt
                        ? `Last discovered ${discoveredAt}. Assign a project to a client and its usage is metered and billed to them.`
                        : 'Run discovery to list your org’s projects.'
                    : 'Set OPENAI_ADMIN_KEY in your environment to enable discovery.'
            }
            right={
                <Button
                    size="sm"
                    variant="secondary"
                    disabled={!openaiReady}
                    leadingIcon={<Icon name="search" size={15} />}
                    onClick={() =>
                        router.post(
                            '/admin/platform/discover',
                            {},
                            { preserveScroll: true },
                        )
                    }
                >
                    Discover
                </Button>
            }
        >
            {discovery.length === 0 ? (
                <Empty>
                    {openaiReady
                        ? 'No projects discovered yet — hit Discover.'
                        : 'Discovery is unavailable until OPENAI_ADMIN_KEY is set.'}
                </Empty>
            ) : (
                <div style={{ overflowX: 'auto' }}>
                    <table
                        style={{
                            width: '100%',
                            borderCollapse: 'collapse',
                            minWidth: 820,
                        }}
                    >
                        <thead>
                            <tr>
                                <th style={th}>Project</th>
                                <th style={th}>Assigned to</th>
                                <th style={{ ...th, textAlign: 'right' }}>
                                    Tokens (30d)
                                </th>
                                <th style={th}>Metering</th>
                                <th style={{ ...th, textAlign: 'right' }} />
                            </tr>
                        </thead>
                        <tbody>
                            {discovery.map((p) => (
                                <tr
                                    key={p.id}
                                    style={
                                        !p.assigned_client_id
                                            ? {
                                                  background:
                                                      'var(--ox-warning-surface)',
                                              }
                                            : undefined
                                    }
                                >
                                    <td style={td}>
                                        <div style={{ fontWeight: 600 }}>
                                            {p.name}
                                        </div>
                                        <div
                                            style={{
                                                ...mono,
                                                fontSize: 11,
                                                color: 'var(--ox-text-subtle)',
                                            }}
                                        >
                                            {p.id}
                                        </div>
                                    </td>
                                    <td style={td}>
                                        {assign?.id === p.id ? (
                                            <div
                                                style={{
                                                    display: 'flex',
                                                    gap: 6,
                                                    flexWrap: 'wrap',
                                                }}
                                            >
                                                <select
                                                    style={{
                                                        ...input,
                                                        width: 150,
                                                    }}
                                                    value={assign.client_id}
                                                    onChange={(e) =>
                                                        setAssign({
                                                            ...assign,
                                                            client_id:
                                                                e.target.value,
                                                        })
                                                    }
                                                >
                                                    <option value="">
                                                        Select client…
                                                    </option>
                                                    {clientOptions.map((c) => (
                                                        <option
                                                            key={c.id}
                                                            value={c.id}
                                                        >
                                                            {c.name}
                                                        </option>
                                                    ))}
                                                </select>
                                                <Button
                                                    size="sm"
                                                    disabled={!assign.client_id}
                                                    onClick={() =>
                                                        router.post(
                                                            '/admin/platform/assign-project',
                                                            {
                                                                client_id:
                                                                    assign.client_id,
                                                                provider:
                                                                    'openai',
                                                                external_project_id:
                                                                    p.id,
                                                                label: assign.label,
                                                            },
                                                            {
                                                                preserveScroll: true,
                                                                onSuccess: () =>
                                                                    setAssign(
                                                                        null,
                                                                    ),
                                                            },
                                                        )
                                                    }
                                                >
                                                    Save
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() =>
                                                        setAssign(null)
                                                    }
                                                >
                                                    Cancel
                                                </Button>
                                            </div>
                                        ) : p.assigned_client_id ? (
                                            <Link
                                                href={`/admin/clients/${p.assigned_client_id}`}
                                                style={{
                                                    fontWeight: 600,
                                                    color: 'var(--ox-text)',
                                                    textDecoration: 'none',
                                                }}
                                            >
                                                {p.assigned_client}
                                            </Link>
                                        ) : (
                                            <span
                                                style={{
                                                    color: 'var(--ox-warning)',
                                                    fontWeight: 600,
                                                }}
                                            >
                                                unassigned — not billing
                                            </span>
                                        )}
                                    </td>
                                    <td
                                        style={{
                                            ...td,
                                            textAlign: 'right',
                                            ...mono,
                                        }}
                                    >
                                        {tokens(p.tokens)}
                                    </td>
                                    <td style={td}>
                                        {p.key_status ? (
                                            <Badge
                                                tone={
                                                    p.key_status === 'active'
                                                        ? 'success'
                                                        : 'neutral'
                                                }
                                            >
                                                {p.key_status}
                                            </Badge>
                                        ) : (
                                            <Badge tone="warning">
                                                not metered
                                            </Badge>
                                        )}
                                    </td>
                                    <td
                                        style={{
                                            ...td,
                                            textAlign: 'right',
                                            whiteSpace: 'nowrap',
                                        }}
                                    >
                                        {assign?.id !== p.id && (
                                            <Button
                                                size="sm"
                                                variant={
                                                    p.assigned_client_id
                                                        ? 'ghost'
                                                        : 'primary'
                                                }
                                                onClick={() =>
                                                    setAssign({
                                                        id: p.id,
                                                        client_id: String(
                                                            p.assigned_client_id ??
                                                                '',
                                                        ),
                                                        label:
                                                            p.label ?? p.name,
                                                    })
                                                }
                                            >
                                                {p.assigned_client_id
                                                    ? 'Reassign'
                                                    : 'Assign'}
                                            </Button>
                                        )}
                                        {p.key_status && (
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() =>
                                                    router.post(
                                                        '/admin/platform/toggle-project',
                                                        {
                                                            provider: 'openai',
                                                            external_project_id:
                                                                p.id,
                                                        },
                                                        {
                                                            preserveScroll: true,
                                                        },
                                                    )
                                                }
                                            >
                                                {p.key_status === 'active'
                                                    ? 'Disable'
                                                    : 'Enable'}
                                            </Button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </Section>
    );
}

/* ------------------------------------ Attribution ----------------------------------- */

function AttributionTab({
    keys,
    clientOptions,
}: {
    keys: Key[];
    clientOptions: Props['clientOptions'];
}) {
    const [adding, setAdding] = useState(false);
    const form = useForm({
        client_id: '',
        provider: 'openai',
        label: '',
        secret: '',
        external_project_id: '',
        external_key_id: '',
    });

    return (
        <Section
            title="Metered provider keys"
            hint="Usage pulled from these keys bills to the owning client. A key whose project id does not exist upstream pulls an empty result forever — the provider returns no error for it, so it looks like there is simply no usage."
            right={
                <Button
                    size="sm"
                    variant="secondary"
                    leadingIcon={<Icon name="plus" size={15} />}
                    onClick={() => setAdding((v) => !v)}
                >
                    Attach key
                </Button>
            }
        >
            {adding && (
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        form.post('/admin/platform/keys', {
                            preserveScroll: true,
                            onSuccess: () => {
                                form.reset();
                                setAdding(false);
                            },
                        });
                    }}
                    style={{
                        display: 'grid',
                        gridTemplateColumns:
                            'repeat(auto-fit, minmax(150px, 1fr))',
                        gap: 12,
                        alignItems: 'end',
                        marginBottom: 18,
                        paddingBottom: 18,
                        borderBottom: '1px solid var(--ox-border)',
                    }}
                >
                    <label>
                        <Lbl>Client</Lbl>
                        <select
                            style={input}
                            value={form.data.client_id}
                            onChange={(e) =>
                                form.setData('client_id', e.target.value)
                            }
                        >
                            <option value="">Select…</option>
                            {clientOptions.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.name}
                                </option>
                            ))}
                        </select>
                    </label>
                    <label>
                        <Lbl>Provider</Lbl>
                        <select
                            style={input}
                            value={form.data.provider}
                            onChange={(e) =>
                                form.setData('provider', e.target.value)
                            }
                        >
                            <option value="openai">OpenAI</option>
                            <option value="google">Google</option>
                        </select>
                    </label>
                    <label>
                        <Lbl>Label</Lbl>
                        <input
                            style={input}
                            value={form.data.label}
                            onChange={(e) =>
                                form.setData('label', e.target.value)
                            }
                        />
                    </label>
                    <label>
                        <Lbl>Project id</Lbl>
                        <input
                            style={input}
                            value={form.data.external_project_id}
                            onChange={(e) =>
                                form.setData(
                                    'external_project_id',
                                    e.target.value,
                                )
                            }
                            placeholder="proj_…"
                        />
                    </label>
                    <label>
                        <Lbl>Secret</Lbl>
                        <input
                            style={input}
                            type="password"
                            value={form.data.secret}
                            onChange={(e) =>
                                form.setData('secret', e.target.value)
                            }
                        />
                    </label>
                    <div style={{ display: 'flex', gap: 8 }}>
                        <Button
                            type="submit"
                            size="sm"
                            disabled={form.processing}
                        >
                            Attach
                        </Button>
                        <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            onClick={() => setAdding(false)}
                        >
                            Cancel
                        </Button>
                    </div>
                </form>
            )}

            {keys.length === 0 ? (
                <Empty>
                    No provider keys attached. Assign a discovered project, or
                    attach one by hand.
                </Empty>
            ) : (
                <div style={{ overflowX: 'auto' }}>
                    <table
                        style={{
                            width: '100%',
                            borderCollapse: 'collapse',
                            minWidth: 780,
                        }}
                    >
                        <thead>
                            <tr>
                                <th style={th}>Label</th>
                                <th style={th}>Client</th>
                                <th style={th}>Project</th>
                                <th style={th}>State</th>
                                <th style={{ ...th, textAlign: 'right' }}>
                                    Revenue MTD
                                </th>
                                <th style={{ ...th, textAlign: 'right' }}>
                                    Records
                                </th>
                                <th style={th}>Synced</th>
                            </tr>
                        </thead>
                        <tbody>
                            {keys.map((k) => (
                                <tr key={k.id}>
                                    <td style={{ ...td, fontWeight: 600 }}>
                                        {k.label}
                                    </td>
                                    <td style={td}>
                                        {k.client_id ? (
                                            <Link
                                                href={`/admin/clients/${k.client_id}`}
                                                style={{
                                                    color: 'var(--ox-text)',
                                                    textDecoration: 'none',
                                                    fontWeight: 600,
                                                }}
                                            >
                                                {k.client}
                                            </Link>
                                        ) : (
                                            <span
                                                style={{
                                                    color: 'var(--ox-warning)',
                                                }}
                                            >
                                                {k.client}
                                            </span>
                                        )}
                                    </td>
                                    <td
                                        style={{ ...td, ...mono, fontSize: 12 }}
                                    >
                                        {k.project}
                                    </td>
                                    <td style={td}>
                                        <Badge
                                            tone={
                                                k.status === 'billing'
                                                    ? 'success'
                                                    : k.status === 'pending'
                                                      ? 'warning'
                                                      : 'neutral'
                                            }
                                        >
                                            {k.status}
                                        </Badge>
                                    </td>
                                    <td
                                        style={{
                                            ...td,
                                            textAlign: 'right',
                                            ...mono,
                                        }}
                                    >
                                        {money(k.revenue_cents)}
                                    </td>
                                    <td
                                        style={{
                                            ...td,
                                            textAlign: 'right',
                                            ...mono,
                                            color: 'var(--ox-text-subtle)',
                                        }}
                                    >
                                        {num(k.records)}
                                    </td>
                                    <td
                                        style={{
                                            ...td,
                                            fontSize: 12.5,
                                            color: 'var(--ox-text-subtle)',
                                        }}
                                    >
                                        {k.synced}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </Section>
    );
}

/* ------------------------------------ Gateway keys ---------------------------------- */

function KeysTab({
    accessKeys,
    clientOptions,
}: {
    accessKeys: AccessKey[];
    clientOptions: Props['clientOptions'];
}) {
    const form = useForm({ client_id: '', name: '' });

    return (
        <Section
            title="Gateway access keys"
            hint="What clients call POST /v1/chat with. The secret is shown once, at creation."
            right={
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        form.post('/admin/platform/access-keys', {
                            preserveScroll: true,
                            onSuccess: () => form.reset('name'),
                        });
                    }}
                    style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}
                >
                    <select
                        style={{ ...input, width: 150 }}
                        value={form.data.client_id}
                        onChange={(e) =>
                            form.setData('client_id', e.target.value)
                        }
                    >
                        <option value="">Client…</option>
                        {clientOptions.map((c) => (
                            <option key={c.id} value={c.id}>
                                {c.name}
                            </option>
                        ))}
                    </select>
                    <input
                        style={{ ...input, width: 140 }}
                        placeholder="Key name"
                        value={form.data.name}
                        onChange={(e) => form.setData('name', e.target.value)}
                    />
                    <Button
                        type="submit"
                        size="sm"
                        disabled={!form.data.name || !form.data.client_id}
                    >
                        Issue key
                    </Button>
                </form>
            }
        >
            {accessKeys.length === 0 ? (
                <Empty>No gateway keys issued yet.</Empty>
            ) : (
                <div style={{ overflowX: 'auto' }}>
                    <table
                        style={{
                            width: '100%',
                            borderCollapse: 'collapse',
                            minWidth: 720,
                        }}
                    >
                        <thead>
                            <tr>
                                <th style={th}>Name</th>
                                <th style={th}>Client</th>
                                <th style={th}>Key</th>
                                <th style={th}>Status</th>
                                <th style={th}>Last used</th>
                                <th style={{ ...th, textAlign: 'right' }} />
                            </tr>
                        </thead>
                        <tbody>
                            {accessKeys.map((k) => (
                                <tr
                                    key={k.id}
                                    style={
                                        k.status !== 'active'
                                            ? { opacity: 0.55 }
                                            : undefined
                                    }
                                >
                                    <td style={{ ...td, fontWeight: 600 }}>
                                        {k.name}
                                    </td>
                                    <td style={td}>
                                        {k.client_id ? (
                                            <Link
                                                href={`/admin/clients/${k.client_id}`}
                                                style={{
                                                    color: 'var(--ox-text)',
                                                    textDecoration: 'none',
                                                }}
                                            >
                                                {k.client}
                                            </Link>
                                        ) : (
                                            '—'
                                        )}
                                    </td>
                                    <td
                                        style={{
                                            ...td,
                                            ...mono,
                                            fontSize: 12.5,
                                        }}
                                    >
                                        {k.frag}
                                    </td>
                                    <td style={td}>
                                        <Badge
                                            tone={
                                                k.status === 'active'
                                                    ? 'success'
                                                    : 'neutral'
                                            }
                                        >
                                            {k.status}
                                        </Badge>
                                    </td>
                                    <td
                                        style={{
                                            ...td,
                                            fontSize: 12.5,
                                            color: 'var(--ox-text-subtle)',
                                        }}
                                    >
                                        {k.last_used}
                                    </td>
                                    <td style={{ ...td, textAlign: 'right' }}>
                                        {k.status === 'active' && (
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() =>
                                                    router.delete(
                                                        `/admin/platform/access-keys/${k.id}`,
                                                        {
                                                            preserveScroll: true,
                                                        },
                                                    )
                                                }
                                            >
                                                Revoke
                                            </Button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </Section>
    );
}

/* ---------------------------------------- Jobs -------------------------------------- */

function JobsTab({
    lastPull,
    lastCharges,
}: Pick<Props, 'lastPull' | 'lastCharges'>) {
    const job = (
        title: string,
        hint: string,
        last: string | null,
        schedule: string,
        action: React.ReactNode,
    ) => (
        <div
            style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: 16,
                padding: '14px 0',
                borderBottom: '1px solid var(--ox-border)',
                flexWrap: 'wrap',
            }}
        >
            <div style={{ minWidth: 260, flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 'var(--ox-text-sm)' }}>
                    {title}
                </div>
                <div
                    style={{
                        fontSize: 'var(--ox-text-xs)',
                        color: 'var(--ox-text-subtle)',
                        marginTop: 2,
                    }}
                >
                    {hint}
                </div>
                <div
                    style={{
                        fontSize: 11,
                        color: 'var(--ox-text-subtle)',
                        marginTop: 4,
                        ...mono,
                    }}
                >
                    {schedule} · last run {last ?? 'never'}
                </div>
            </div>
            {action}
        </div>
    );

    return (
        <Section
            title="Scheduled jobs"
            hint="These run on their own. The buttons let you force one now — every job is idempotent, so an extra run is safe."
        >
            {job(
                'Usage pull',
                'Fetches provider usage, meters it against each rate card, debits balances and auto-tops-up.',
                lastPull?.at ?? null,
                'hourly',
                <Button
                    size="sm"
                    leadingIcon={<Icon name="refresh-cw" size={15} />}
                    onClick={() =>
                        router.post(
                            '/admin/platform/sync',
                            {},
                            { preserveScroll: true },
                        )
                    }
                >
                    Pull now
                </Button>,
            )}
            {job(
                'Recurring charges',
                'Applies daily and monthly fees, credits and usage-shaped charges. Bills once per period.',
                lastCharges?.at ?? null,
                'daily 00:15',
                <Badge tone="neutral">runs from the scheduler</Badge>,
            )}
            {job(
                'Model sync + auto-pricing',
                'Discovers new models, prices unpriced ones from the feed, and queues price changes for review.',
                null,
                'daily 00:05',
                <Button
                    as={Link}
                    href="/admin/models"
                    size="sm"
                    variant="secondary"
                >
                    Open Models
                </Button>,
            )}
            {job(
                'Re-bill unpriced usage',
                'Settles every usage record that metered without a cost basis, now that its model has a price. Pricing a model does this automatically — this is the catch-all.',
                null,
                'on demand',
                <Button
                    size="sm"
                    variant="secondary"
                    onClick={() =>
                        router.post(
                            '/admin/platform/rebill',
                            {},
                            { preserveScroll: true },
                        )
                    }
                >
                    Re-bill now
                </Button>,
            )}

            <p
                style={{
                    marginTop: 16,
                    fontSize: 'var(--ox-text-xs)',
                    color: 'var(--ox-text-subtle)',
                    maxWidth: 720,
                    lineHeight: 1.6,
                }}
            >
                The scheduler must be running for any of this to happen
                unattended:{' '}
                <code
                    style={{
                        ...mono,
                        background: 'var(--ox-bg-muted)',
                        padding: '1px 5px',
                        borderRadius: 4,
                    }}
                >
                    php artisan schedule:work
                </code>{' '}
                (or a cron entry calling{' '}
                <code style={{ ...mono }}>schedule:run</code> every minute).
            </p>
        </Section>
    );
}
