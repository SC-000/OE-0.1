#!/usr/bin/env node
/**
 * Mount every page component for real, with real props.
 *
 * `assertOk()` in a feature test only proves the SERVER responded; the React component
 * can still throw on the client (an undefined prop, a bad destructure) and the page is
 * blank for the user. This drives the SSR bundle, which executes the actual component
 * tree — so a ReferenceError surfaces here instead of in someone's browser console.
 *
 * Usage:
 *   npm run build:ssr
 *   node bootstrap/ssr/ssr.js &          # SSR server on :13714
 *   php artisan serve --port=8899 &      # app, to harvest real props
 *   node scripts/ssr-smoke.mjs
 */
import { spawnSync } from 'node:child_process';

const SSR = process.env.SSR_URL ?? 'http://127.0.0.1:13714/render';
const APP = process.env.APP_URL ?? 'http://127.0.0.1:8899';
const LOGIN = {
    email: process.env.SMOKE_EMAIL ?? 'admin@openexchange.ai',
    password: process.env.SMOKE_PASSWORD ?? 'password',
};

/** Pull the Inertia payload a real request produced, cookies and all. */
function payloadFor(path, jar) {
    const html = spawnSync(
        'curl',
        ['-s', '-b', jar, '-c', jar, `${APP}${path}`],
        { encoding: 'utf8' },
    ).stdout;
    const m = html.match(/type="application\/json">([\s\S]*?)<\/script>/);

    if (!m) {
        return null;
    } // redirected (auth, or no client context)

    const page = JSON.parse(m[1]);

    return {
        component: page.component,
        props: page.props,
        url: page.url,
        version: page.version,
    };
}

async function render(payload) {
    const res = await fetch(SSR, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });

    if (!res.ok) {
        return {
            ok: false,
            error: `SSR HTTP ${res.status}: ${(await res.text()).slice(0, 300)}`,
        };
    }

    const json = await res.json();
    const body = json.body ?? '';

    // Inertia always emits the data-page <script>. Real component markup is what's left.
    const markup = body
        .replace(/<script data-page[\s\S]*?<\/script>/, '')
        .trim();

    if (markup.length === 0) {
        return { ok: false, error: 'component produced no markup' };
    }

    return { ok: true, bytes: markup.length };
}

// SMOKE_ANON=1 skips the login, so the guest-only auth pages render instead of
// redirecting. Most `.form()` call sites live there.
const anon = process.env.SMOKE_ANON === '1';

const jar = '/tmp/ssr-smoke-cookies.txt';
spawnSync('rm', ['-f', jar]);
spawnSync('curl', ['-s', '-c', jar, '-o', '/dev/null', `${APP}/login`]);

if (!anon) {
    const xsrf = decodeURIComponent(
        (
            spawnSync('grep', ['-i', 'XSRF-TOKEN', jar], {
                encoding: 'utf8',
            }).stdout.split(/\s+/)[6] ?? ''
        ).trim(),
    );
    spawnSync('curl', [
        '-s',
        '-b',
        jar,
        '-c',
        jar,
        '-o',
        '/dev/null',
        '-X',
        'POST',
        `${APP}/login`,
        '-H',
        `X-XSRF-TOKEN: ${xsrf}`,
        '-H',
        'Content-Type: application/json',
        '-H',
        'Accept: application/json',
        '-d',
        JSON.stringify(LOGIN),
    ]);
}

const clientId = process.env.SMOKE_CLIENT_ID ?? '1';

// Pages the signed-in user cannot reach redirect, produce no Inertia payload, and are
// skipped — so this one list works for both an admin run and a client run.
const pages = [
    '/',
    '/pricing',
    '/developers',
    '/markets',
    '/whitepaper',
    '/company',
    '/blog',
    // Guest-only: rendered on the SMOKE_ANON=1 pass, skipped otherwise.
    '/login',
    '/register',
    '/forgot-password',
    '/admin',
    '/admin/clients',
    `/admin/clients/${clientId}`,
    '/admin/models',
    '/admin/platform',
    '/admin/audit',
    '/console',
    '/console/usage',
    '/console/sources',
    '/console/billing',
    '/console/billing/add-card',
    '/settings/profile',
    '/settings/appearance',
];

let failed = 0;

for (const path of pages) {
    const payload = payloadFor(path, jar);

    if (!payload) {
        console.log(`  – ${path.padEnd(24)} skipped (redirect)`);
        continue;
    }

    const result = await render(payload);

    if (result.ok) {
        console.log(
            `  ✓ ${path.padEnd(24)} ${payload.component.padEnd(18)} ${result.bytes} bytes`,
        );
    } else {
        failed++;
        console.log(
            `  ✗ ${path.padEnd(24)} ${payload.component.padEnd(18)} ${result.error}`,
        );
    }
}

console.log(
    failed === 0
        ? '\nAll pages mounted.'
        : `\n${failed} page(s) failed to mount.`,
);
process.exit(failed === 0 ? 0 : 1);
