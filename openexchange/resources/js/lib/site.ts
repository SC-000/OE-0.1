// Shared marketing content: product family, nav, and reusable copy.

export type Product = {
    slug: string;
    name: string;
    tag: string;
    blurb: string;
    href: string;
    icon: string;
};

export const PRODUCTS: Product[] = [
    { slug: 'ai-router', name: 'AI Router', tag: 'Flagship', blurb: 'One API for every model, with best-execution routing.', href: '/products/ai-router', icon: 'sliders' },
    { slug: 'hyperquay', name: 'HYPERQUAY', tag: 'Power tool', blurb: 'The power-user AI workspace — policy, personas, agents.', href: '/products/hyperquay', icon: 'zap' },
    { slug: 'exchange', name: 'AI Exchange', tag: 'Markets', blurb: 'Trade AI endpoints across New York & London.', href: '/products/exchange', icon: 'trending-up' },
    { slug: 'openexchange', name: 'OpenExchange.ai', tag: 'Crypto', blurb: 'Crypto-settled exchange, futures & dark pools.', href: '/products/openexchange', icon: 'globe' },
    { slug: 'data', name: 'Data & Insights', tag: 'Data', blurb: 'Market data, live AI news, reports & stats.', href: '/products/data', icon: 'database' },
    { slug: 'services', name: 'Services & Layers', tag: 'Add-ons', blurb: 'Shields, Optimizers, Guardians & Agents, à la carte.', href: '/products/services', icon: 'layers' },
];

export type NavItem = { label: string; href?: string; products?: boolean };

export const NAV: NavItem[] = [
    { label: 'Products', products: true },
    { label: 'Pricing', href: '/pricing' },
    { label: 'Markets', href: '/markets' },
    { label: 'Developers', href: '/developers' },
    { label: 'White paper', href: '/whitepaper' },
    { label: 'Company', href: '/company' },
];

export const FOOTER: { title: string; links: { label: string; href: string }[] }[] = [
    {
        title: 'Products',
        links: PRODUCTS.map((p) => ({ label: p.name, href: p.href })),
    },
    {
        title: 'Platform',
        links: [
            { label: 'Pricing', href: '/pricing' },
            { label: 'Markets', href: '/markets' },
            { label: 'Developers', href: '/developers' },
            { label: 'Status', href: '/company#status' },
        ],
    },
    {
        title: 'Resources',
        links: [
            { label: 'White paper', href: '/whitepaper' },
            { label: 'API reference', href: '/developers#api' },
            { label: 'Security', href: '/company#security' },
            { label: 'Research & blog', href: '/blog' },
        ],
    },
    {
        title: 'Company',
        links: [
            { label: 'About', href: '/company' },
            { label: 'Contact', href: '/company#contact' },
            { label: 'Log in', href: '/login' },
            { label: 'Get started', href: '/register' },
        ],
    },
];

// Anchor pricing data reused across pricing / home
export const FEES = {
    participation: '5.00',
    participationOrg: '40.00',
    perTxn: '0.01',
    clearing: [
        { tier: 'L1', price: '0.0001' },
        { tier: 'L2', price: '0.0002' },
        { tier: 'L3', price: '0.0005' },
    ],
};
