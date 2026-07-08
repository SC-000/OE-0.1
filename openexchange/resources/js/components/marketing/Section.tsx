import { CSSProperties, ReactNode } from 'react';

type Tone = 'beige' | 'subtle' | 'cream' | 'ink' | 'ink-deep';

const BG: Record<Tone, string> = {
    beige: 'var(--ox-beige-100)',
    subtle: 'var(--ox-beige-50)',
    cream: 'var(--ox-cream)',
    ink: 'var(--ox-ink-900)',
    'ink-deep': 'var(--ox-ink-950)',
};

export function Section({
    tone = 'beige',
    pad = 'lg',
    wide = false,
    id,
    children,
    style = {},
    innerStyle = {},
}: {
    tone?: Tone;
    pad?: 'sm' | 'md' | 'lg' | 'xl';
    wide?: boolean;
    id?: string;
    children: ReactNode;
    style?: CSSProperties;
    innerStyle?: CSSProperties;
}) {
    const isInk = tone === 'ink' || tone === 'ink-deep';
    // Responsive vertical rhythm — shrinks on mobile, same maximum on desktop.
    const py = { sm: 'clamp(36px, 7vw, 48px)', md: 'clamp(40px, 8vw, 64px)', lg: 'clamp(48px, 9vw, 84px)', xl: 'clamp(56px, 11vw, 112px)' }[pad];
    return (
        <section
            id={id}
            className={isInk ? 'ox-dark' : undefined}
            style={{ position: 'relative', background: BG[tone], color: isInk ? '#eef3f2' : 'var(--ox-text)', paddingBlock: py, ...style }}
        >
            <div className={wide ? 'ox-container-wide' : 'ox-container'} style={innerStyle}>
                {children}
            </div>
        </section>
    );
}
