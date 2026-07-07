import type { SVGAttributes } from 'react';

export default function AppLogoIcon(props: SVGAttributes<SVGElement>) {
    return (
        <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
            <g stroke="#33c13e" strokeLinecap="round" fill="none">
                <circle cx="16" cy="16" r="13" strokeWidth="2.4" strokeDasharray="61 20" transform="rotate(-90 16 16)" opacity="0.95" />
                <circle cx="16" cy="16" r="8.6" strokeWidth="2.4" strokeDasharray="40 15" transform="rotate(48 16 16)" opacity="0.7" />
                <circle cx="16" cy="16" r="4.4" strokeWidth="2.4" strokeDasharray="20 8" transform="rotate(165 16 16)" opacity="0.55" />
            </g>
            <circle cx="16" cy="16" r="1.9" fill="#33c13e" />
        </svg>
    );
}
