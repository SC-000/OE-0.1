import { ReactNode } from 'react';
import { SiteNav } from '@/components/marketing/SiteNav';
import { SiteFooter } from '@/components/marketing/SiteFooter';

export default function MarketingLayout({ children }: { children: ReactNode }) {
    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--ox-bg)', color: 'var(--ox-text)' }}>
            <SiteNav />
            <main style={{ flex: 1 }}>{children}</main>
            <SiteFooter />
        </div>
    );
}
