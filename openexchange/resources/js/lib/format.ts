/** Money + number formatting. The server sends integer cents; the client formats. */

export const money = (cents: number, opts: { sign?: boolean } = {}): string => {
    const v = Math.abs(cents) / 100;
    const s = v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const prefix = opts.sign ? (cents < 0 ? '−' : '+') : cents < 0 ? '−' : '';
    return `${prefix}$${s}`;
};

/** Compact money for dense tables and stat tiles: $1.2k, $3.4M. */
export const moneyShort = (cents: number): string => {
    const v = Math.abs(cents) / 100;
    const sign = cents < 0 ? '−' : '';
    if (v >= 1_000_000) return `${sign}$${(v / 1e6).toFixed(1)}M`;
    if (v >= 1_000) return `${sign}$${(v / 1e3).toFixed(1)}k`;
    return `${sign}$${v.toFixed(2)}`;
};

export const tokens = (n: number): string => {
    if (n >= 1e9) return `${(n / 1e9).toFixed(2)}B`;
    if (n >= 1e6) return `${(n / 1e6).toFixed(2)}M`;
    if (n >= 1e3) return `${(n / 1e3).toFixed(1)}K`;
    return String(n);
};

export const num = (n: number): string => n.toLocaleString('en-US');

export const pct = (v: number | null | undefined, digits = 1): string =>
    v === null || v === undefined ? '—' : `${v.toFixed(digits)}%`;

/** Basis points → readable percent. 2500 → "25%", 2550 → "25.5%". */
export const bps = (v: number | null | undefined): string => {
    if (v === null || v === undefined) return '—';
    const p = v / 100;
    return `${p % 1 === 0 ? p.toFixed(0) : p.toFixed(2).replace(/0$/, '')}%`;
};

export const usdPerM = (v: number): string =>
    `$${v < 1 ? v.toFixed(3).replace(/0$/, '') : v.toFixed(2)}`;
