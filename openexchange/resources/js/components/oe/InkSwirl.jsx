import React from 'react';
import { DotField } from './DotField.jsx';

/**
 * The signature ink-and-particles surface, lifted out of PaymentCard so any card
 * can wear it — the portal's balance tile and the marketing BalanceMeter both do.
 *
 * Two parts, because a `<Card>` sets its own background inline and inline styles
 * beat a class:
 *
 *   `inkSwirlSurface` — spread into the host's `style` to give it the ink ground.
 *   `<InkSwirl />`    — drop in as the host's first child for the swirl + depth.
 *
 * The host must also carry `.oe-ink-swirl`, which clips the swirl to the card and
 * lifts the real content above it.
 */

/** The ink ground. A 3-stop gradient (not a flat fill) so the card reads as lit. */
export const inkSwirlSurface = {
    background:
        'linear-gradient(140deg, var(--ox-ink-800) 0%, var(--ox-ink-900) 46%, var(--ox-ink-950) 100%)',
    border: '1px solid rgba(255,255,255,0.1)',
    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.07), var(--ox-shadow-lg)',
};

export function InkSwirl() {
    return (
        <>
            {/* Decorative; DotField is aria-hidden. The wrapper owns the box so oe.css
                can re-anchor the swirl per breakpoint — DotField just fills it.

                PERFORMANCE. This is a card, not a hero, and it sits at ~0.4 opacity
                behind text, so it runs on a deliberately thin particle budget: ~3.1k
                particles/frame at 24fps against the landing hero's ~11.5k at 30fps.
                Dots overlap heavily at this size, so the strand and density cuts are
                invisible while costing roughly 4.5x less per second.

                `fit` shrinks the loop so it tucks behind the right edge instead of
                bisecting the card: DotField's own scaling assumes a hero-sized canvas
                and blows the swirl up inside a container this small. */}
            <div className="oe-ink-swirl__field">
                <DotField strands={10} density={0.6} fit={0.6} fps={24} />
            </div>
            {/* Depth, not decoration: one soft light from the top-left, falling away
                into the bottom-right corner. Above the swirl, below the content. */}
            <div className="oe-ink-swirl__vignette" />
        </>
    );
}
