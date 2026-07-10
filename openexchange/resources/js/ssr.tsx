import { createInertiaApp } from '@inertiajs/react';
import createServer from '@inertiajs/react/server';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import ReactDOMServer from 'react-dom/server';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { resolveLayout } from '@/lib/inertia-layout';

/**
 * Server-side rendering entry. Run with `php artisan inertia:start-ssr` after
 * `npm run build:ssr`; enable with INERTIA_SSR_ENABLED=true.
 *
 * What this buys: the marketing pages ship real HTML on the first byte, so content is
 * painted before any JavaScript is parsed — better perceived load and real SEO.
 *
 * What it does NOT buy: the client still downloads and hydrates the same bundle, and
 * anything animated still costs exactly what it costs. SSR is not a fix for jank.
 *
 * The component tree below MUST match app.tsx's, or hydration will mismatch.
 */
const appName = import.meta.env.VITE_APP_NAME || 'Open Exchange';

createServer((page) =>
    createInertiaApp({
        page,
        render: ReactDOMServer.renderToString,
        title: (title) => (title ? `${title} - ${appName}` : appName),
        resolve: (name) =>
            resolvePageComponent(
                `./pages/${name}.tsx`,
                import.meta.glob('./pages/**/*.tsx'),
            ),
        layout: resolveLayout,
        setup: ({ App, props }) => (
            <TooltipProvider delayDuration={0}>
                <App {...props} />
                <Toaster />
            </TooltipProvider>
        ),
    }),
);
