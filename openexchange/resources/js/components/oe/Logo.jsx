import React from 'react';

/**
 * Open Exchange logo — concentric-swirl gateway mark (SVG, theme-aware,
 * scalable) + "open exchange" wordmark in Manrope. Drop the licensed brand
 * SVG/PNG in later to replace <LogoMark> if desired.
 *
 * tone: 'dark' (for ink grounds — light text) | 'light' (for beige grounds).
 */
export function LogoMark({ size = 28, color = '#33c13e' }) {
    return (
        <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true" style={{ display: 'block', flexShrink: 0 }}>
            <g stroke={color} strokeLinecap="round" fill="none">
                <circle cx="16" cy="16" r="13" strokeWidth="2.4" strokeDasharray="61 20" transform="rotate(-90 16 16)" opacity="0.95" />
                <circle cx="16" cy="16" r="8.6" strokeWidth="2.4" strokeDasharray="40 15" transform="rotate(48 16 16)" opacity="0.7" />
                <circle cx="16" cy="16" r="4.4" strokeWidth="2.4" strokeDasharray="20 8" transform="rotate(165 16 16)" opacity="0.55" />
            </g>
            <circle cx="16" cy="16" r="1.9" fill={color} />
        </svg>
    );
}

export function Logo({ size = 28, src = '/logo.png', alt = 'Open Exchange', style = {} }) {
    return <img src={src} alt={alt} style={{ height: size, width: 'auto', display: 'block', ...style }} />;
}
