import React from 'react';

/**
 * Open Exchange action button.
 * Variants: primary (Exchange Green), secondary (outline), ghost, danger.
 * Sizes: sm, md, lg. Optional leading/trailing icon nodes.
 * `as` lets it render as an Inertia <Link> or <a> while keeping the styling.
 */
export function Button({
    children,
    as: As = 'button',
    variant = 'primary',
    size = 'md',
    disabled = false,
    fullWidth = false,
    leadingIcon = null,
    trailingIcon = null,
    type = 'button',
    onClick,
    style = {},
    ...rest
}) {
    const sizes = {
        sm: { height: 32, padding: '0 12px', fontSize: 'var(--ox-text-sm)', gap: 6, radius: 'var(--ox-radius-sm)' },
        md: { height: 40, padding: '0 16px', fontSize: 'var(--ox-text-base)', gap: 8, radius: 'var(--ox-radius-md)' },
        lg: { height: 48, padding: '0 22px', fontSize: 'var(--ox-text-md)', gap: 9, radius: 'var(--ox-radius-md)' },
    }[size];

    const variants = {
        primary: { background: 'var(--ox-primary)', color: 'var(--ox-on-primary)', border: '1px solid transparent' },
        secondary: { background: 'var(--ox-surface)', color: 'var(--ox-text)', border: '1px solid var(--ox-border-strong)' },
        ghost: { background: 'transparent', color: 'var(--ox-text)', border: '1px solid transparent' },
        danger: { background: 'var(--ox-danger)', color: '#fff', border: '1px solid transparent' },
    }[variant];

    const isButton = As === 'button';

    return (
        <As
            {...(isButton ? { type, disabled } : {})}
            onClick={onClick}
            className={`ox-btn ox-btn--${variant}`}
            style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: sizes.gap,
                height: sizes.height, padding: sizes.padding, width: fullWidth ? '100%' : 'auto',
                fontFamily: 'var(--ox-font-sans)', fontSize: sizes.fontSize, fontWeight: 'var(--ox-weight-semibold)',
                letterSpacing: 'var(--ox-tracking-snug)', lineHeight: 1, borderRadius: sizes.radius,
                textDecoration: 'none', cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.5 : 1,
                transition: 'background var(--ox-dur-fast) var(--ox-ease), box-shadow var(--ox-dur-fast) var(--ox-ease), transform var(--ox-dur-fast) var(--ox-ease)',
                whiteSpace: 'nowrap', ...variants, ...style,
            }}
            {...rest}
        >
            {leadingIcon}
            {children}
            {trailingIcon}
        </As>
    );
}
