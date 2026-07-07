import React from 'react';

/**
 * Spinner / loader — reuses the Open Exchange concentric-partial-rings mark,
 * with each ring rotating independently. Sizes in px; inherits brand green.
 */
export function Spinner({ size = 32, color = 'var(--ox-green-500)', label = 'Loading', style = {} }) {
    return (
        <span role="status" aria-label={label} style={{ display: 'inline-flex', width: size, height: size, ...style }}>
            <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
                <g className="ox-spin-1"><circle cx="16" cy="16" r="13" stroke={color} strokeWidth="2.4" strokeLinecap="round" strokeDasharray="61 20" opacity="0.95" /></g>
                <g className="ox-spin-2"><circle cx="16" cy="16" r="8.6" stroke={color} strokeWidth="2.4" strokeLinecap="round" strokeDasharray="40 15" opacity="0.7" /></g>
                <g className="ox-spin-3"><circle cx="16" cy="16" r="4.4" stroke={color} strokeWidth="2.4" strokeLinecap="round" strokeDasharray="20 8" opacity="0.55" /></g>
                <circle cx="16" cy="16" r="1.9" fill={color} />
            </svg>
        </span>
    );
}
